import graphene
from flask import Blueprint, Flask
from flask_cors import CORS
from flask_graphql import GraphQLView
from state import loan_payments, loans

from utils import get_payment_status

from rest_api.payments import add_payment

app = Flask(__name__)
CORS(app)


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


# rest api versioning
api_v1 = Blueprint("api_v1", __name__, url_prefix="/api/v1")

# add payments api
api_v1.add_url_rule("/payments", methods=["POST"], view_func=add_payment)

app.register_blueprint(api_v1)

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
