import json
from datetime import date
from typing import List, Optional

from flask import current_app
from google import genai
from pydantic import BaseModel, Field, ValidationError

from ..extensions import db
from ..models.ai_parse_log import AIParseLog
from ..models.category import Category
from .category_service import normalize_category_name
from datetime import datetime
from ..models.expense import Expense
from .category_service import (
    get_or_create_user_category,
    get_user_category_by_id,
)


class ParsedExpenseItem(BaseModel):
    description: str = Field(min_length=1, max_length=255)
    amount: float = Field(gt=0)
    date: str = Field(
        description="Expense date in YYYY-MM-DD format."
    )
    category_name: str = Field(
        min_length=1,
        max_length=80,
        description="Use an existing category name exactly when appropriate."
    )
    confidence: float = Field(
        ge=0,
        le=1,
        description="Confidence from 0 to 1."
    )
    notes: Optional[str] = Field(
        default=None,
        description="Optional clarification note for ambiguous items."
    )


class TranscriptParseResult(BaseModel):
    expenses: List[ParsedExpenseItem] = Field(default_factory=list)
    clarification_message: Optional[str] = None
    needs_confirmation: bool = True


def _build_prompt(transcript: str, categories: list[Category], client_local_date: str):
    category_names = [category.name for category in categories]

    return f"""
You are an expense extraction system.

Your job is to convert a user's spoken shopping/spending transcript into structured expense items.

Rules:
1. Extract ONLY expenses that are explicitly stated or strongly implied.
2. If multiple expenses are mentioned, return them as separate items.
3. Use the user's existing categories EXACTLY as given when one fits well.
4. Create a new category name ONLY if none of the existing categories fits reasonably well.
5. If no date is stated, use the provided client local date.
6. Dates must be in YYYY-MM-DD format.
7. Amounts must be numeric and greater than 0.
8. Keep descriptions short and user-friendly.
9. Do not invent expenses, merchants, or prices.
10. If something is ambiguous, still return your best structured guess and explain the ambiguity in notes or clarification_message.
11. Always set needs_confirmation to true.

Client local date: {client_local_date}

Existing categories:
{json.dumps(category_names, ensure_ascii=False)}

Transcript:
{transcript}
""".strip()


def _normalize_ai_response(parsed: TranscriptParseResult, categories: list[Category], transcript: str):
    categories_by_normalized_name = {
        category.normalized_name: category for category in categories
    }

    expenses = []
    new_categories = []

    for item in parsed.expenses:
        raw_category_name = item.category_name.strip()
        normalized_name = normalize_category_name(raw_category_name)

        existing_category = categories_by_normalized_name.get(normalized_name)

        if existing_category:
            category_action = "existing"
            category_id = existing_category.id
            category_name = existing_category.name
        else:
            category_action = "create"
            category_id = None
            category_name = raw_category_name

            if category_name not in new_categories:
                new_categories.append(category_name)

        expenses.append(
            {
                "description": item.description.strip(),
                "amount": float(item.amount),
                "date": item.date,
                "category_id": category_id,
                "category_name": category_name,
                "category_action": category_action,
                "confidence": float(item.confidence),
                "notes": item.notes,
            }
        )

    return {
        "transcript": transcript,
        "expenses": expenses,
        "new_categories": new_categories,
        "needs_confirmation": True,
        "clarification_message": parsed.clarification_message,
    }


def parse_expense_transcript(user_id: int, transcript: str, client_local_date: Optional[str] = None):
    transcript = (transcript or "").strip()
    if not transcript:
        raise ValueError("Transcript is required")

    if not client_local_date:
        client_local_date = date.today().isoformat()

    api_key = current_app.config.get("GEMINI_API_KEY")
    model_name = current_app.config.get("GEMINI_MODEL", "gemini-2.5-flash")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    categories = (
        Category.query
        .filter_by(user_id=user_id)
        .order_by(Category.name.asc())
        .all()
    )

    prompt = _build_prompt(transcript, categories, client_local_date)
    client = genai.Client(api_key=api_key)

    log = AIParseLog(
        user_id=user_id,
        transcript=transcript,
        client_local_date=client_local_date,
        model_name=model_name,
        status="started",
    )
    db.session.add(log)
    db.session.flush()

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": TranscriptParseResult.model_json_schema(),
                "temperature": 0.2,
                "max_output_tokens": 2048,
            },
        )

        raw_text = response.text or ""

        parsed = TranscriptParseResult.model_validate_json(raw_text)
        normalized_result = _normalize_ai_response(parsed, categories, transcript)

        log.status = "success"
        log.raw_result_json = json.dumps(normalized_result, ensure_ascii=False)

        db.session.commit()
        return normalized_result

    except ValidationError as exc:
        log.status = "validation_error"
        log.error_message = str(exc)
        db.session.commit()
        raise ValueError("Gemini returned an invalid structured response")

    except Exception as exc:
        log.status = "error"
        log.error_message = str(exc)
        db.session.commit()
        raise RuntimeError("Could not parse transcript with Gemini")
    
def _parse_commit_date(date_string: str):
    try:
        return datetime.strptime(date_string, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("Date must be in YYYY-MM-DD format")


def commit_parsed_expenses(user_id: int, payload: dict):
    expenses = payload.get("expenses") or []

    if not expenses:
        raise ValueError("At least one expense is required")

    created_categories = []
    created_expenses = []

    for item in expenses:
        description = (item.get("description") or "").strip()
        amount = item.get("amount")
        date_string = (item.get("date") or "").strip()
        category_action = (item.get("category_action") or "").strip()
        category_id = item.get("category_id")
        category_name = (item.get("category_name") or "").strip()

        if not description:
            raise ValueError("Each expense must have a description")

        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError
        except (TypeError, ValueError):
            raise ValueError("Each expense amount must be a number greater than 0")

        parsed_date = _parse_commit_date(date_string)

        resolved_category = None

        if category_action == "existing":
            if category_id is not None:
                resolved_category = get_user_category_by_id(user_id, int(category_id))
                if not resolved_category:
                    raise ValueError("Invalid existing category_id")
            elif category_name:
                resolved_category, was_created = get_or_create_user_category(user_id, category_name)
                if was_created:
                    created_categories.append(resolved_category)
            else:
                resolved_category = None

        elif category_action == "create":
            if not category_name:
                raise ValueError("New category name is required")
            resolved_category, was_created = get_or_create_user_category(user_id, category_name)
            if was_created:
                created_categories.append(resolved_category)

        elif category_action:
            raise ValueError("Invalid category_action")

        expense = Expense(
            user_id=user_id,
            category_id=resolved_category.id if resolved_category else None,
            description=description,
            amount=amount,
            date=parsed_date,
            source="ai_text",
        )

        db.session.add(expense)
        db.session.flush()
        created_expenses.append(expense)

    db.session.commit()

    return {
        "created_categories": [category.to_dict() for category in created_categories],
        "created_expenses": [expense.to_dict() for expense in created_expenses],
    }