from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..services.category_service import (
    get_user_categories,
    update_user_category,
    delete_user_category,
)

categories_bp = Blueprint("categories", __name__)


@categories_bp.get("/")
@jwt_required()
def list_categories():
    user_id = int(get_jwt_identity())
    categories = get_user_categories(user_id)
    return jsonify([category.to_dict() for category in categories]), 200


@categories_bp.put("/<int:category_id>")
@jwt_required()
def update_category(category_id):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    try:
        category = update_user_category(user_id, category_id, data.get("name"))
        return jsonify(category), 200
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400
    except LookupError as exc:
        return jsonify({"message": str(exc)}), 404


@categories_bp.delete("/<int:category_id>")
@jwt_required()
def delete_category(category_id):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    try:
        result = delete_user_category(
            user_id,
            category_id,
            data.get("replacement_category_id"),
        )
        return jsonify(result), 200
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400
    except LookupError as exc:
        return jsonify({"message": str(exc)}), 404