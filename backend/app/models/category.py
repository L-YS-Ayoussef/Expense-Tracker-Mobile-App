from datetime import datetime

from ..extensions import db


class Category(db.Model):
    __tablename__ = "categories"
    __table_args__ = (
        db.UniqueConstraint("user_id", "normalized_name", name="uq_user_category_name"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    name = db.Column(db.String(80), nullable=False)
    normalized_name = db.Column(db.String(80), nullable=False)
    color = db.Column(db.String(20), nullable=True)
    icon = db.Column(db.String(50), nullable=True)
    is_system = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    expenses = db.relationship("Expense", backref="category", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "normalized_name": self.normalized_name,
            "color": self.color,
            "icon": self.icon,
            "is_system": self.is_system,
            "created_at": self.created_at.isoformat(),
        }