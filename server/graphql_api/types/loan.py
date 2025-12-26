import graphene
from state import loan_payments

from graphql_api.types.loan_payment import LoanPayment


def get_field(obj, field):
    return getattr(obj, field, obj.get(field))


# loan type
class ExistingLoans(graphene.ObjectType):
    id = graphene.Int()
    name = graphene.String()
    interest_rate = graphene.Float()
    principal = graphene.Int()
    due_date = graphene.Date()
    loan_payments = graphene.List(LoanPayment)

    def resolve_loan_payments(self, _info):
        # get loan_id from loan_payments
        loan_id = get_field(self, "id")
        return [p for p in loan_payments if p["loan_id"] == loan_id]
