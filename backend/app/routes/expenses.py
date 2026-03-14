from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..services.expense_service import (
    list_user_expenses,
    create_user_expense,
    update_user_expense,
    delete_user_expense,
)

expenses_bp = Blueprint("expenses", __name__)


@expenses_bp.get("/")
@jwt_required()
def list_expenses():
    user_id = int(get_jwt_identity())
    expenses = list_user_expenses(user_id)
    return jsonify(expenses), 200


@expenses_bp.post("/")
@jwt_required()
def create_expense():
    user_id = int(get_jwt_identity())

    try:
        expense = create_user_expense(user_id, request.get_json() or {})
        return jsonify(expense), 201
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400


@expenses_bp.put("/<int:expense_id>")
@jwt_required()
def update_expense(expense_id):
    user_id = int(get_jwt_identity())

    try:
        expense = update_user_expense(user_id, expense_id, request.get_json() or {})
        return jsonify(expense), 200
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400
    except LookupError as exc:
        return jsonify({"message": str(exc)}), 404


@expenses_bp.delete("/<int:expense_id>")
@jwt_required()
def delete_expense(expense_id):
    user_id = int(get_jwt_identity())

    try:
        delete_user_expense(user_id, expense_id)
        return jsonify({"message": "Expense deleted successfully"}), 200
    except LookupError as exc:
        return jsonify({"message": str(exc)}), 404