from marshmallow import Schema, fields, ValidationError, validates
import datetime


class PaymentDTO(Schema):
    loan_id = fields.Int(required=True)
    payment_date = fields.Str(required=False, allow_none=True)

    @validates("payment_date")
    def validate_payment_date(self, value):
        if value is None:
            raise ValidationError("payment_date cannot be null or empty")
        try:
            year, month, day = map(int, value.split("-"))
            datetime.date(year, month, day)
        except (ValueError, AttributeError):
            raise ValidationError("Invalid date format. Use YYYY-MM-DD")
