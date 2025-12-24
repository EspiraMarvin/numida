import datetime

from flask import jsonify, request
from marshmallow import ValidationError
from state import loan_payments, loans

from rest_api.dtos.payment_dto import PaymentDTO

# loan lookup
loan_lookup = {loan["id"]: loan for loan in loans}


def add_payment():
    """REST endpoint to add a new payment to the payments list"""
    try:
        data = request.get_json()

        # validate request data via DTO
        try:
            validated_data = PaymentDTO().load(data)
        except ValidationError as err:
            return jsonify({"error": err.messages}), 400

        loan_id = validated_data["loan_id"]
        payment_date_str = validated_data.get("payment_date")

        # validate loan exists
        loan_obj = loan_lookup.get(loan_id)
        if not loan_obj:
            return jsonify({"error": f"Loan with id {loan_id} not found"}), 404

        # Prevent adding a payment if one already exists with a date
        existing_payment = next(
            (
                p
                for p in loan_payments
                if p["loan_id"] == loan_id and p["payment_date"] is not None
            ),
            None,
        )
        if existing_payment:
            loan_obj = loan_lookup.get(loan_id)
            return (
                jsonify(
                    {
                        "error": f"Loan payment with id {loan_obj['id']} already submitted"
                    }
                ),
                400,
            )

        # parse payment date
        payment_date = None
        if payment_date_str:
            year, month, day = map(int, payment_date_str.split("-"))
            payment_date = datetime.date(year, month, day)

        # generate new payment ID
        new_id = len(loan_payments) + 1

        # create new payment
        new_payment = {
            "id": new_id,
            "loan_id": loan_id,
            "payment_date": payment_date,
        }

        loan_payments.append(new_payment)

        return (
            jsonify(
                {
                    "message": "Payment added successfully",
                    "payment": {
                        "id": new_payment["id"],
                        "loan_id": new_payment["loan_id"],
                        "payment_date": (
                            str(new_payment["payment_date"])
                            if new_payment["payment_date"]
                            else None
                        ),
                    },
                }
            ),
            201,
        )

    except Exception:
        return jsonify({"error": "Internal server error"}), 500
