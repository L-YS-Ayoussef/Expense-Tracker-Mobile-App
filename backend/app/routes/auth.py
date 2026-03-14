from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

from ..services.auth_service import register_user, login_user, get_user_by_identity

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    try:
        result = register_user(request.get_json() or {})
        return jsonify(result), 201
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400


@auth_bp.post("/login")
def login():
    try:
        result = login_user(request.get_json() or {})
        return jsonify(result), 200
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 401


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access_token": access_token}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    identity = get_jwt_identity()
    user = get_user_by_identity(identity)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200