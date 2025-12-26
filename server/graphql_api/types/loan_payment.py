import graphene
from utils import get_payment_status
from state import loans


def get_field(obj, field):
    return getattr(obj, field, obj.get(field))


# loan payment type
class LoanPayment(graphene.ObjectType):
    id = graphene.Int()
    loan_id = graphene.Int()
    payment_amount = graphene.Int()
    payment_date = graphene.Date()
    status = graphene.String()

    def resolve_status(self, _info):
        loan = next(
            (
                loan_obj
                for loan_obj in loans
                if loan_obj["id"] == get_field(self, "loan_id")
            ),
            None,
        )

        if not loan:
            return None

        return get_payment_status(loan, self)
