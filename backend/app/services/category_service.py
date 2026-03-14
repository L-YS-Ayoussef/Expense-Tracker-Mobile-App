from ..extensions import db
from ..models.category import Category

DEFAULT_CATEGORIES = [
    {"name": "Food", "color": "#ef4444", "icon": "restaurant", "is_system": True},
    {"name": "Transport", "color": "#3b82f6", "icon": "car", "is_system": True},
    {"name": "Shopping", "color": "#a855f7", "icon": "cart", "is_system": True},
    {"name": "Bills", "color": "#f59e0b", "icon": "receipt", "is_system": True},
    {"name": "Health", "color": "#10b981", "icon": "medical", "is_system": True},
    {"name": "Entertainment", "color": "#ec4899", "icon": "film", "is_system": True},
    {"name": "Other", "color": "#6b7280", "icon": "apps", "is_system": True},
]


def normalize_category_name(name: str) -> str:
    return " ".join(name.strip().lower().split())


def create_default_categories(user_id: int):
    for item in DEFAULT_CATEGORIES:
        category = Category(
            user_id=user_id,
            name=item["name"],
            normalized_name=normalize_category_name(item["name"]),
            color=item["color"],
            icon=item["icon"],
            is_system=item["is_system"],
        )
        db.session.add(category)


def get_user_categories(user_id: int):
    return (
        Category.query
        .filter_by(user_id=user_id)
        .order_by(Category.name.asc())
        .all()
    )