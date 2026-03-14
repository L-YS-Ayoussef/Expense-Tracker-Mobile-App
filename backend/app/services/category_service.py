from ..extensions import db
from ..models.category import Category
from ..models.expense import Expense

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
        Category.query.filter_by(user_id=user_id).order_by(Category.name.asc()).all()
    )


def get_user_category_by_id(user_id: int, category_id: int):
    return Category.query.filter_by(id=category_id, user_id=user_id).first()


def get_user_category_by_name(user_id: int, name: str):
    normalized_name = normalize_category_name(name)
    return Category.query.filter_by(
        user_id=user_id,
        normalized_name=normalized_name,
    ).first()


def get_or_create_user_category(user_id: int, name: str):
    clean_name = (name or "").strip()
    if not clean_name:
        raise ValueError("Category name is required")

    existing_category = get_user_category_by_name(user_id, clean_name)
    if existing_category:
        return existing_category, False

    category = Category(
        user_id=user_id,
        name=clean_name,
        normalized_name=normalize_category_name(clean_name),
        color="#6b7280",
        icon="pricetag",
        is_system=False,
    )
    db.session.add(category)
    db.session.flush()

    return category, True


def update_user_category(user_id: int, category_id: int, name: str):
    category = get_user_category_by_id(user_id, category_id)
    if not category:
        raise LookupError("Category not found")

    clean_name = (name or "").strip()
    if not clean_name:
        raise ValueError("Category name is required")

    normalized_name = normalize_category_name(clean_name)
    existing_category = get_user_category_by_name(user_id, clean_name)
    if existing_category and existing_category.id != category.id:
        raise ValueError("A category with this name already exists")

    category.name = clean_name
    category.normalized_name = normalized_name

    db.session.commit()

    return category.to_dict()


def delete_user_category(
    user_id: int,
    category_id: int,
    replacement_category_id: int | None = None,
):
    category = get_user_category_by_id(user_id, category_id)
    if not category:
        raise LookupError("Category not found")

    replacement_category = None
    if replacement_category_id is not None:
        replacement_category = get_user_category_by_id(user_id, replacement_category_id)
        if not replacement_category:
            raise ValueError("Replacement category not found")
        if replacement_category.id == category.id:
            raise ValueError("Replacement category must be different")

    affected_expenses = Expense.query.filter_by(
        user_id=user_id,
        category_id=category.id,
    ).all()

    for expense in affected_expenses:
        expense.category_id = replacement_category.id if replacement_category else None

    moved_expenses_count = len(affected_expenses)

    db.session.delete(category)
    db.session.commit()

    return {
        "deleted_category_id": category_id,
        "replacement_category_id": replacement_category.id if replacement_category else None,
        "moved_expenses_count": moved_expenses_count,
        "message": "Category deleted successfully",
    }