from flask_jwt_extended import create_access_token, create_refresh_token

from ..extensions import db
from ..models.user import User
from .category_service import create_default_categories


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def register_user(data: dict):
    full_name = (data.get("full_name") or "").strip()
    email = _normalize_email(data.get("email") or "")
    password = data.get("password") or ""

    if not full_name:
        raise ValueError("Full name is required")

    if not email:
        raise ValueError("Email is required")

    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters")

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        raise ValueError("Email is already registered")

    user = User(full_name=full_name, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.flush()

    create_default_categories(user.id)

    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return {
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


def login_user(data: dict):
    email = _normalize_email(data.get("email") or "")
    password = data.get("password") or ""

    if not email or not password:
        raise ValueError("Email and password are required")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        raise ValueError("Invalid email or password")

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return {
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


def get_user_by_identity(identity: str):
    return db.session.get(User, int(identity))