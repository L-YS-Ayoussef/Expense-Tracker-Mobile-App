from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..services.category_service import get_user_categories

categories_bp = Blueprint("categories", __name__)


@categories_bp.get("/")
@jwt_required()
def list_categories():
    user_id = int(get_jwt_identity())
    categories = get_user_categories(user_id)
    return jsonify([category.to_dict() for category in categories]), 200