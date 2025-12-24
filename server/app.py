import datetime
from flask import Flask
from flask_graphql import GraphQLView
from flask_cors import CORS
import graphene
from utils import get_payment_status

app = Flask(__name__)
CORS(app)

loans = [
    {
        "id": 1,
        "name": "Tom's Loan",
        "interest_rate": 5.0,
        "principal": 10000,
        "due_date": datetime.date(2025, 3, 1),
    },
    {
        "id": 2,
        "name": "Chris Wailaka",
        "interest_rate": 3.5,
        "principal": 500000,
        "due_date": datetime.date(2025, 3, 1),
    },
    {
        "id": 3,
        "name": "NP Mobile Money",
        "interest_rate": 4.5,
        "principal": 30000,
        "due_date": datetime.date(2025, 3, 1),
    },
    {
        "id": 4,
        "name": "Esther's Autoparts",
        "interest_rate": 1.5,
        "principal": 40000,
        "due_date": datetime.date(2025, 3, 1),
    },
]


"""
    I updated the loan_payments payment_dates to 2025 for correctness
    when calculating loan payment statuses
"""
loan_payments = [
    {"id": 1, "loan_id": 1, "payment_date": datetime.date(2025, 3, 4)},
    {"id": 2, "loan_id": 2, "payment_date": datetime.date(2025, 3, 15)},
    {"id": 3, "loan_id": 3, "payment_date": datetime.date(2025, 4, 5)},
]


# loan payment type
class LoanPayment(graphene.ObjectType):
    id = graphene.Int()
    loan_id = graphene.Int()
    payment_date = graphene.Date()


class ExistingLoans(graphene.ObjectType):
    id = graphene.Int()
    name = graphene.String()
    interest_rate = graphene.Float()
    principal = graphene.Int()
    due_date = graphene.Date()
    loan_payments = graphene.List(LoanPayment)
    status = graphene.String()

    def resolve_loan_payments(self, _info):
        # get loan_id from loan_payments
        loan_id = self["id"]

        # fetch payments per loan from loan_payments
        return [p for p in loan_payments if p["loan_id"] == loan_id]

    def resolve_status(self, _info):
        loan_id = self["id"]

        payment = next(
            (p for p in loan_payments if p["loan_id"] == loan_id),
            None,
        )

        return get_payment_status(self, payment)


class Query(graphene.ObjectType):
    loans = graphene.List(ExistingLoans)

    def resolve_loans(self, info):
        return loans


schema = graphene.Schema(query=Query)


app.add_url_rule(
    "/graphql",
    view_func=GraphQLView.as_view("graphql", schema=schema, graphiql=True),
)


@app.route("/")
def home():
    return "Welcome to the Loan Application API"


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
