from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..services.ai_service import (
    parse_expense_transcript,
    commit_parsed_expenses,
)

ai_bp = Blueprint("ai", __name__)


@ai_bp.post("/parse-expense-transcript")
@jwt_required()
def parse_transcript():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    transcript = data.get("transcript")
    client_local_date = data.get("client_local_date")

    try:
        result = parse_expense_transcript(
            user_id=user_id,
            transcript=transcript,
            client_local_date=client_local_date,
        )
        return jsonify(result), 200
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400
    except RuntimeError as exc:
        return jsonify({"message": str(exc)}), 500


@ai_bp.post("/commit-parsed-expenses")
@jwt_required()
def commit_expenses():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    try:
        result = commit_parsed_expenses(user_id=user_id, payload=data)
        return jsonify(result), 201
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400