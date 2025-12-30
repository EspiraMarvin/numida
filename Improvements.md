# Enhancements - Numida Loan Management System

## Assessment Context

- **Loan duration was not provided** in the assessment data I took a 12-month assumption necessary for installment calculations

## Key Improvements (Future Enhancements)

1. **Database Integration**: Replace in-memory storage with persistent database
2. **Authentication**: Add user authentication and authorization
3. **Advanced Filtering**: Search and filter loans by status, date ranges
4. **Relay style Graphql convention with graphql-relay**: to allow for API scalability, consistency with global object IDs, Node interface and connection & edge pattern
5. **Pagination**: Implement pagination for large datasets

#### Others

6. **Caching**: Add Redis caching for improved performance (for frequent queries)
7. **Monitoring**: Application logging and error tracking
8. **CI/CD**: Automated testing and deployment pipelines

## Improvements Breakdown

### Current Limitations

- No loan duration/term in assessment data → hardcoded 12-month assumption
- No loan start dates in the loan schema
- No installment tracking → payments treated as generic transactions
- No outstanding balance tracking → no visibility into remaining amounts
- Simple interest only → no principal/interest breakdown
- No progress tracking, there's visual loan completion indicators such as loan status

### A. Enhanced Data Models

- Add `term_months`, `start_date` and `status` to loan schema
- Add `installment_number`, `principal_amount`, `interest_amount` to payments schema
- Implement dynamic balance and status calculations to loan schema

### B. Outstanding Balance Tracking

- Real-time balance calculation after payments
- Progress percentage indicators
- Visual loan completion tracking with loan status

### C. Payment Schedule Management

- Next expected payment date calculations
- Payment validation against expected amounts

### D. Enhanced Installment Tracking

- Installment number assignment to payments
- Payment amount validation
- Principal vs interest breakdown

### Complete Loan Entity Schema

`````python
# server/graphql_api/types/loan.py
class EnhancedLoan(graphene.ObjectType):
    # loan information
    id = graphene.Int()
    name = graphene.String()
    principal = graphene.Float()
    interest_rate = graphene.Float()
    term_months = graphene.Int()  # duration in months
    start_date = graphene.Date()  # when loan was issued
    due_date = graphene.Date()  # loan due date

    # computed fields
    # status and progress tracking
    status = graphene.String()  # active, completed, defaulted, paid_off - based on total paid against total loan owed
    progress_percentage = graphene.Float()  # loan completion percentage,

    # financial calculations (computed fields)
    total_amount = graphene.Float()  # principal + total interest
    outstanding_balance = graphene.Float()  # remaining amount owed
    total_paid = graphene.Float()  # sum of all payments made
    total_interest_paid = graphene.Float()  # interest portion of payments

    # next payment information (for active loans)
    next_payment_due = graphene.Date()  # when next payment is due
    next_payment_amount = graphene.Float()  # amount due for next payment (installment)
    days_until_next_payment = graphene.Int()  # computed - days until next payment (can be used to notify borrower)

    # payment tracking
    total_payments_made = graphene.Int()  # number of payments completed
    payments_remaining = graphene.Int()  # number of payments left
    last_payment_date = graphene.Date()  # most recent payment date

    # loan_payment relationship
    loan_payments = graphene.List(lambda: EnhancedLoanPayment)



### Complete LoanPayment Entity Schema

````python
# server/graphql_api/types/loan_payment.py
class EnhancedLoanPayment(graphene.ObjectType):
    # payment information
    id = graphene.Int()
    loan_id = graphene.Int()

    # payment details
    payment_amount = graphene.Float()  # total amount paid (interest)
    payment_date = graphene.Date()     # when payment was made

    # installment tracking
    installment_number = graphene.Int()  # which installment number this is

    # installment payment breakdown (computed)
    principal_amount = graphene.Float()  # principal portion of payment
    interest_amount = graphene.Float()   # interest portion of payment

    # status and timing
    status = graphene.String()  # On Time, Late, Defaulted, Unpaid

`````

### Implement Relay style Graphql convention with graphql-relay

This allows for API scalability, consistency and client/frontend friendly modern graphql patterns (Global object IDs, connection & edge pattern, node interface & cursor based pagination)

Example of the standard graphql API response

```python
 payments {
   edges {
     node {
       id
       amount
       dueDate
     }
     cursor
   }
   pageInfo {
     hasNextPage
     endCursor
   }
 }
```

### UI Enhancements

- Progress bars and timeline visualization for the payments
- Loan balance display & loan status
- Installment balance display
- Pagination for large loans & loan_payments datasets
- Percentage Progress bars and timeline components (payment installment tracking)
