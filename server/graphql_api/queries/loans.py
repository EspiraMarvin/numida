import graphene
from state import loans
from graphql_api.types.loan import ExistingLoans


class Query(graphene.ObjectType):
    loans = graphene.List(ExistingLoans)

    def resolve_loans(self, _info):
        return loans
