def get_payment_status(loan, payment):
    """get payment status by comparing the payment date to the due date

    Args:
        loan: this includes the loan due_date field
        payment: this includes payment_date field or can be None

    Returns:
        status of On Time, Late, Defaulted or Unpaid
    """
    payment_date = payment["payment_date"] if payment else None
    due_date = loan["due_date"]

    if not payment_date:
        return "Unpaid"

    days_late = (payment_date - due_date).days

    if days_late <= 5:
        return "On Time"
    elif 6 <= days_late <= 30:
        return "Late"
    else:
        return "Defaulted"
