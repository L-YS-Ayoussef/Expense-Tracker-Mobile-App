from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///expenses.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
CORS(app)


class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "amount": self.amount,
            "date": self.date.isoformat(),
        }


def parse_date(date_string):
    return datetime.strptime(date_string, "%Y-%m-%d").date()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"message": "API is running"}), 200


@app.route("/expenses", methods=["GET"])
def get_expenses():
    expenses = Expense.query.order_by(Expense.date.desc(), Expense.id.desc()).all()
    return jsonify([expense.to_dict() for expense in expenses]), 200


@app.route("/expenses", methods=["POST"])
def create_expense():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Request body is required"}), 400

    description = str(data.get("description", "")).strip()
    amount = data.get("amount")
    date_value = data.get("date")

    if not description:
        return jsonify({"message": "Description is required"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"message": "Amount must be a number greater than 0"}), 400

    try:
        parsed_date = parse_date(date_value)
    except Exception:
        return jsonify({"message": "Date must be in YYYY-MM-DD format"}), 400

    expense = Expense(
        description=description,
        amount=amount,
        date=parsed_date,
    )

    db.session.add(expense)
    db.session.commit()

    return jsonify(expense.to_dict()), 201


@app.route("/expenses/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):
    expense = Expense.query.get(expense_id)

    if not expense:
      return jsonify({"message": "Expense not found"}), 404

    data = request.get_json()

    if not data:
        return jsonify({"message": "Request body is required"}), 400

    description = str(data.get("description", "")).strip()
    amount = data.get("amount")
    date_value = data.get("date")

    if not description:
        return jsonify({"message": "Description is required"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"message": "Amount must be a number greater than 0"}), 400

    try:
        parsed_date = parse_date(date_value)
    except Exception:
        return jsonify({"message": "Date must be in YYYY-MM-DD format"}), 400

    expense.description = description
    expense.amount = amount
    expense.date = parsed_date

    db.session.commit()

    return jsonify(expense.to_dict()), 200


@app.route("/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    expense = Expense.query.get(expense_id)

    if not expense:
        return jsonify({"message": "Expense not found"}), 404

    db.session.delete(expense)
    db.session.commit()

    return jsonify({"message": "Expense deleted successfully"}), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5000, debug=True)