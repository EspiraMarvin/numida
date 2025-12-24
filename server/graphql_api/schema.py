import graphene
from graphql_api.queries.loans import Query

schema = graphene.Schema(query=Query)
