from flask import Flask, render_template, request, redirect, url_for
from database import get_db_connection, init_db

app = Flask(__name__)

# Create the database/table if it doesn't exist yet
init_db()


@app.route("/")
def index():
    connection = get_db_connection()

    transactions = connection.execute("""
        SELECT *
        FROM transactions
        ORDER BY date DESC, id DESC
    """).fetchall()

    connection.close()

    total_income = sum(
        transaction["amount"]
        for transaction in transactions
        if transaction["type"] == "income"
    )

    total_expenses = sum(
        transaction["amount"]
        for transaction in transactions
        if transaction["type"] == "expense"
    )

    balance = total_income - total_expenses

    return render_template(
        "index.html",
        transactions=transactions,
        total_income=total_income,
        total_expenses=total_expenses,
        balance=balance
    )


@app.route("/add", methods=["GET", "POST"])
def add_transaction():
    if request.method == "POST":
        transaction_type = request.form["type"]
        amount = float(request.form["amount"])
        category = request.form["category"]
        description = request.form["description"]
        date = request.form["date"]
        account = request.form["account"]

        connection = get_db_connection()

        connection.execute("""
            INSERT INTO transactions
            (type, amount, category, description, date, account)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            transaction_type,
            amount,
            category,
            description,
            date,
            account
        ))

        connection.commit()
        connection.close()

        return redirect(url_for("index"))

    return render_template("add_transaction.html")


if __name__ == "__main__":
    app.run(debug=True)