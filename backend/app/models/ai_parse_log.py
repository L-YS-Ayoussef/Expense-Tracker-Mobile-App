from datetime import datetime

from ..extensions import db


class AIParseLog(db.Model):
    __tablename__ = "ai_parse_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    transcript = db.Column(db.Text, nullable=False)
    client_local_date = db.Column(db.String(10), nullable=True)
    model_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="success")
    raw_result_json = db.Column(db.Text, nullable=True)
    error_message = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "transcript": self.transcript,
            "client_local_date": self.client_local_date,
            "model_name": self.model_name,
            "status": self.status,
            "raw_result_json": self.raw_result_json,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat(),
        }