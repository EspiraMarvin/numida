import datetime
from marshmallow import Schema, fields, ValidationError, validates


class PaymentDTO(Schema):
    loan_id = fields.Int(required=True)
    payment_amount = fields.Float(required=True)
    payment_date = fields.Str(required=True)

    @validates("payment_amount")
    def validate_payment_amount(self, value):
        if value is None:
            raise ValidationError("payment_amount is required")
        if value <= 0:
            raise ValidationError("payment_amount must be greater than 0")

    @validates("payment_date")
    def validate_payment_date(self, value):
        if value is None:
            raise ValidationError("payment_date cannot be null or empty")
        try:
            year, month, day = map(int, value.split("-"))
            datetime.date(year, month, day)
        except (ValueError, AttributeError):
            raise ValidationError("Invalid date format. Use YYYY-MM-DD")
