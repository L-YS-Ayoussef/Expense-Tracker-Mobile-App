from datetime import datetime

from ..extensions import db
from ..models.category import Category
from ..models.expense import Expense


def _parse_date(date_string: str):
    try:
        return datetime.strptime(date_string, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("Date must be in YYYY-MM-DD format")


def _validate_expense_payload(data: dict):
    description = (data.get("description") or "").strip()
    amount = data.get("amount")
    date_string = data.get("date")
    category_id = data.get("category_id")

    if not description:
        raise ValueError("Description is required")

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError
    except (TypeError, ValueError):
        raise ValueError("Amount must be a number greater than 0")

    parsed_date = _parse_date(date_string)

    return {
        "description": description,
        "amount": amount,
        "date": parsed_date,
        "category_id": category_id,
    }


def list_user_expenses(user_id: int):
    expenses = (
        Expense.query
        .filter_by(user_id=user_id)
        .order_by(Expense.date.desc(), Expense.id.desc())
        .all()
    )
    return [expense.to_dict() for expense in expenses]


def create_user_expense(user_id: int, data: dict):
    payload = _validate_expense_payload(data)

    if payload["category_id"] is not None:
        category = Category.query.filter_by(
            id=payload["category_id"],
            user_id=user_id,
        ).first()
        if not category:
            raise ValueError("Invalid category_id")

    expense = Expense(
        user_id=user_id,
        category_id=payload["category_id"],
        description=payload["description"],
        amount=payload["amount"],
        date=payload["date"],
        source="manual",
    )

    db.session.add(expense)
    db.session.commit()

    return expense.to_dict()


def update_user_expense(user_id: int, expense_id: int, data: dict):
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()
    if not expense:
        raise LookupError("Expense not found")

    payload = _validate_expense_payload(data)

    if payload["category_id"] is not None:
        category = Category.query.filter_by(
            id=payload["category_id"],
            user_id=user_id,
        ).first()
        if not category:
            raise ValueError("Invalid category_id")

    expense.description = payload["description"]
    expense.amount = payload["amount"]
    expense.date = payload["date"]
    expense.category_id = payload["category_id"]

    db.session.commit()

    return expense.to_dict()


def delete_user_expense(user_id: int, expense_id: int):
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()
    if not expense:
        raise LookupError("Expense not found")

    db.session.delete(expense)
    db.session.commit()