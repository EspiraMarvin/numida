import datetime
import json
import unittest
from unittest.mock import patch
from copy import deepcopy

from app import app
from utils import get_payment_status


class FlaskAppTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

        # mock the in-memory data so tests do not mutate global state
        # they will be deep copied for each test
        self.loans_fixture = [
            {
                "id": 1,
                "name": "Tom's Loan",
                "interest_rate": 5.0,
                "principal": 10000,
                "due_date": datetime.date(2025, 3, 1),
            },
            {
                "id": 2,
                "name": "Chris Wailaka",
                "interest_rate": 3.5,
                "principal": 500000,
                "due_date": datetime.date(2025, 3, 1),
            },
            {
                "id": 3,
                "name": "NP Mobile Money",
                "interest_rate": 4.5,
                "principal": 30000,
                "due_date": datetime.date(2025, 3, 1),
            },
            {
                "id": 4,
                "name": "Esther's Autoparts",
                "interest_rate": 1.5,
                "principal": 40000,
                "due_date": datetime.date(2025, 3, 1),
            },
        ]
        self.loan_payments_fixture = [
            {
                "id": 1,
                "loan_id": 1,
                "payment_amount": 1000,
                "payment_date": datetime.date(2025, 3, 4),
            },
            {
                "id": 2,
                "loan_id": 2,
                "payment_amount": 5000,
                "payment_date": datetime.date(2025, 3, 15),
            },
            {
                "id": 3,
                "loan_id": 3,
                "payment_amount": 2000,
                "payment_date": datetime.date(2025, 4, 5),
            },
        ]

        # create deep copies for each test to ensure each test start with clean data
        # This ensures each test starts with clean data
        self.mocked_loans = deepcopy(self.loans_fixture)
        self.mocked_loan_payments = deepcopy(self.loan_payments_fixture)

        # patch state.loans and state.loan_payments where they are defined
        # to ensures all imports from state use the mocked data
        self.loans_patcher = patch("state.loans", new=self.mocked_loans)
        self.loan_payments_patcher = patch(
            "state.loan_payments", new=self.mocked_loan_payments
        )
        self.loans_patcher.start()
        self.loan_payments_patcher.start()

        # since they're imported at module level
        self.rest_loans_patcher = patch(
            "rest_api.payments.loans", new=self.mocked_loans
        )
        self.rest_loan_payments_patcher = patch(
            "rest_api.payments.loan_payments", new=self.mocked_loan_payments
        )
        self.rest_loans_patcher.start()
        self.rest_loan_payments_patcher.start()

        # create a fresh loan_lookup from the mocked loans
        self.mocked_loan_lookup = {
            loan["id"]: loan for loan in self.mocked_loans
        }
        self.loan_lookup_patcher = patch(
            "rest_api.payments.loan_lookup", new=self.mocked_loan_lookup
        )
        self.loan_lookup_patcher.start()

    def tearDown(self):
        self.loans_patcher.stop()
        self.loan_payments_patcher.stop()
        self.rest_loans_patcher.stop()
        self.rest_loan_payments_patcher.stop()
        self.loan_lookup_patcher.stop()

    # test home route
    def test_home_route(self):
        """Test the home route returns welcome message"""
        response = self.app.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Welcome to the Loan Application API", response.data)

    # rest REST API add payment tests
    def test_add_payment_success(self):
        """Test successfully adding a payment"""
        # use loan 4 which doesn't have a payment yet
        payload = {
            "loan_id": 4,
            "payment_amount": 1500.0,
            "payment_date": "2025-03-10",
        }
        response = self.app.post(
            "/api/v1/payments",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Payment added successfully")
        self.assertIn("payment", data)
        self.assertEqual(data["payment"]["loan_id"], 4)
        self.assertEqual(data["payment"]["payment_date"], "2025-03-10")
        self.assertEqual(data["payment"]["payment_amount"], 1500.0)

    def test_add_payment_missing_loan_id(self):
        """Test adding payment without loan_id"""
        payload = {"payment_amount": 1500.0, "payment_date": "2025-03-10"}
        response = self.app.post(
            "/api/v1/payments",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("error", data)

    def test_add_payment_missing_payment_amount(self):
        """Test adding payment without payment_amount"""
        payload = {"loan_id": 1, "payment_date": "2025-03-10"}
        response = self.app.post(
            "/api/v1/payments",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("error", data)

    def test_add_payment_missing_payment_date(self):
        """Test adding payment without payment_date"""
        payload = {"loan_id": 1, "payment_amount": 1500.0}
        response = self.app.post(
            "/api/v1/payments",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("error", data)

    def test_add_payment_invalid_loan(self):
        """Test adding payment for non-existent loan"""
        payload = {
            "loan_id": 999,
            "payment_amount": 1500.0,
            "payment_date": "2025-03-10",
        }
        response = self.app.post(
            "/api/v1/payments",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data)
        self.assertIn("error", data)
        self.assertIn("not found", data["error"].lower())
        
    def test_add_payment_invalid_date_value(self):
        """Test adding payment with invalid date value"""
        payload = {
            "loan_id": 1,
            "payment_amount": 1500.0,
            "payment_date": "2025-13-45",
        }
        response = self.app.post(
            "/api/v1/payments",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("error", data)

    def test_add_payment_negative_amount(self):
        """Test adding payment with negative amount"""
        payload = {
            "loan_id": 1,
            "payment_amount": -100.0,
            "payment_date": "2025-03-10",
        }
        response = self.app.post(
            "/api/v1/payments",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("error", data)

    def test_add_payment_zero_amount(self):
        """Test adding payment with zero amount"""
        payload = {
            "loan_id": 1,
            "payment_amount": 0.0,
            "payment_date": "2025-03-10",
        }
        response = self.app.post(
            "/api/v1/payments",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("error", data)

    def test_add_payment_duplicate_payment(self):
        """Test adding duplicate payment for loan that already has a payment"""
        # Loan 1 already has a payment in the fixture
        payload = {
            "loan_id": 1,
            "payment_amount": 1500.0,
            "payment_date": "2025-03-20",
        }
        response = self.app.post(
            "/api/v1/payments",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("error", data)
        self.assertIn("already submitted", data["error"].lower())

    def test_add_payment_empty_json(self):
        """Test adding payment with empty JSON body"""
        response = self.app.post(
            "/api/v1/payments",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("error", data)

    def test_add_payment_invalid_json(self):
        """Test adding payment with invalid JSON"""
        response = self.app.post(
            "/api/v1/payments",
            data="invalid json",
            content_type="application/json",
        )
        self.assertIn(response.status_code, [400, 500])

    # utils func tests 
    def test_get_payment_status_on_time(self):
        """Test payment status calculation for on-time payment"""
        loan = {
            "id": 1,
            "due_date": datetime.date(2025, 3, 1),
        }
        # payment 3 days after due date (within 5 days = On Time)
        payment = {"payment_date": datetime.date(2025, 3, 4)}
        status = get_payment_status(loan, payment)
        self.assertEqual(status, "On Time")

    def test_get_payment_status_exactly_5_days(self):
        """Test payment status for payment exactly 5 days late"""
        loan = {
            "id": 1,
            "due_date": datetime.date(2025, 3, 1),
        }
        payment = {"payment_date": datetime.date(2025, 3, 6)}
        status = get_payment_status(loan, payment)
        self.assertEqual(status, "On Time")

    def test_get_payment_status_late(self):
        """Test payment status calculation for late payment"""
        loan = {
            "id": 1,
            "due_date": datetime.date(2025, 3, 1),
        }
        # payment 15 days after due date (6-30 days = Late)
        payment = {"payment_date": datetime.date(2025, 3, 16)}
        status = get_payment_status(loan, payment)
        self.assertEqual(status, "Late")

    def test_get_payment_status_exactly_30_days(self):
        """Test payment status for payment exactly 30 days late"""
        loan = {
            "id": 1,
            "due_date": datetime.date(2025, 3, 1),
        }
        payment = {"payment_date": datetime.date(2025, 3, 31)}
        status = get_payment_status(loan, payment)
        self.assertEqual(status, "Late")

    def test_get_payment_status_defaulted(self):
        """Test payment status calculation for defaulted payment"""
        loan = {
            "id": 1,
            "due_date": datetime.date(2025, 3, 1),
        }
        # payment 35 days after due date (>30 days = Defaulted)
        payment = {"payment_date": datetime.date(2025, 4, 5)}
        status = get_payment_status(loan, payment)
        self.assertEqual(status, "Defaulted")

    def test_get_payment_status_unpaid(self):
        """Test payment status for unpaid loan (no payment)"""
        loan = {
            "id": 1,
            "due_date": datetime.date(2025, 3, 1),
        }
        status = get_payment_status(loan, None)
        self.assertEqual(status, "Unpaid")

    def test_get_payment_status_unpaid_with_none_date(self):
        """Test payment status for payment with None date"""
        loan = {
            "id": 1,
            "due_date": datetime.date(2025, 3, 1),
        }
        payment = {"payment_date": None}
        status = get_payment_status(loan, payment)
        self.assertEqual(status, "Unpaid")

    def test_get_payment_status_early_payment(self):
        """Test payment status for payment before due date"""
        loan = {
            "id": 1,
            "due_date": datetime.date(2025, 3, 1),
        }
        # payment 2 days before due date (negative days late)
        payment = {"payment_date": datetime.date(2025, 2, 27)}
        status = get_payment_status(loan, payment)
        # negative days should still be "On Time"
        # (days_late = -2, which is <= 5)
        self.assertEqual(status, "On Time")

    def test_get_payment_status_on_due_date(self):
        """Test payment status for payment on due date"""
        loan = {
            "id": 1,
            "due_date": datetime.date(2025, 3, 1),
        }
        payment = {"payment_date": datetime.date(2025, 3, 1)}
        status = get_payment_status(loan, payment)
        self.assertEqual(status, "On Time")


if __name__ == "__main__":
    unittest.main()
