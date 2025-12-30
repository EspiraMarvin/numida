from flask import Blueprint, Flask
from flask_cors import CORS
from flask_graphql import GraphQLView


from graphql_api.schema import schema
from rest_api.payments import add_payment


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}})


app.add_url_rule(
    "/graphql/v1",
    view_func=GraphQLView.as_view("graphql_v1", schema=schema, graphiql=True),
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
