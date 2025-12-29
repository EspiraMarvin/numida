# Numida Loan Management System - Assessment Implementation Documentation

## Overview

This document outlines my approach to implementing the Numida loan management system. The project displays loan statuses with payment tracking functionality as monthly installments.

## Architecture Overview

The application consists of two main components:

### Backend (Python/Flask)

- **GraphQL API**: For querying loan and payment data
- **REST API**: For adding new payments
- **In-memory data store**: Simple state management for loans and payments

### Frontend (React/TypeScript)

- **Apollo Client**: For GraphQL queries
- **React Components**: For displaying and managing loan data
- **Form handling**: For adding new payments via REST API

## Entity Relationship Model

#### Loan Entity

```typescript
interface Loan {
  id: number;
  name: string;
  principal: number;
  interestRate: number;
  dueDate: string;
  loanPayments: LoanPayment[];
}
```

#### LoanPayment Entity

```typescript
interface LoanPayment {
  id: number;
  loanId: number; // foreign key to Loan.id
  paymentAmount: number;
  paymentDate: string;
  status: string; // computed field: "On Time" | "Late" | "Defaulted" | "Unpaid"
}
```

### Relationship Details

1. **One-to-Many Relationship**: One loan can have multiple payments

   - `Loan.loanPayments` contains an array of related `LoanPayment` objects
   - `LoanPayment.loanId` references the parent `Loan.id`

2. **Computed Status Field**: Payment status is calculated dynamically based on:

   - Due date from the associated loan
   - Payment date (if exists)

## Implementation Approach by Requirement

### 1. GraphQL Schema Update & Data Fetching

#### Backend Implementation

- **Updated GraphQL Schema** (`server/graphql_api/schema.py`):

  ```python
  schema = graphene.Schema(query=Query)
  ```

- **Enhanced Loan Type** (`server/graphql_api/types/loan.py`):

  - Added `loan_payments` field to the `ExistingLoans` GraphQL type
  - Implemented resolver to fetch related payments by `loan_id`

- **LoanPayment Type** (`server/graphql_api/types/loan_payment.py`):
  - Created new GraphQL type for payment data
  - Added computed `status` field resolver that calculates payment status

#### Frontend Implementation

- **GraphQL Query** (`web/src/App.tsx`):

  ```graphql
  query GetLoans {
    loans {
      id
      name
      principal
      interestRate
      dueDate
      loanPayments {
        id
        loanId
        paymentAmount
        paymentDate
        status
      }
    }
  }
  ```

- **Apollo Client Integration**: Used `useQuery` hook for data fetching with error handling

### 2. Payment Status Categorization Logic

#### Business Rules Implementation

The payment status calculation follows the exact requirements:

| Status      | Condition                         | Color  |
| ----------- | --------------------------------- | ------ |
| "On Time"   | Payment within 5 days of due date | Green  |
| "Late"      | Payment 6-30 days after due date  | Orange |
| "Defaulted" | Payment more than 30 days late    | Red    |
| "Unpaid"    | No payment date                   | Grey   |

#### Implementation Details

- **Core Function** (`server/utils.py`):

  ```python
  def get_payment_status(loan, payment):
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
  ```

- **Frontend Color Mapping** (`web/src/helpers/utils.ts`):
  ```typescript
  export const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time':
        return 'green';
      case 'Late':
        return 'orange';
      case 'Defaulted':
        return 'red';
      case 'Unpaid':
        return 'grey';
      default:
        return 'grey';
    }
  };
  ```

### 3. Web App Display & Styling

#### UI Components

- **Loan Display**: Grid layout showing loan details and associated payments
- **Payment Cards**: Individual payment information with status indicators
- **Conditional Styling**: Status-based color coding for visual feedback
- **Responsive Design**: CSS Grid and Flexbox for proper layout

#### Key Features

- **Loading States**: Spinner animation during data fetching
- **Error Handling**: User-friendly error messages with retry functionality
- **Empty States**: Appropriate messaging when no data is available

### 4. REST API for Payment Management

#### Backend Implementation

- **Endpoint**: `POST /api/v1/payments`
- **Validation**: Marshmallow schema validation for request data
- **Error Handling**: Comprehensive validation with specific error messages
- **Data Persistence**: In-memory storage with ID generation

#### Frontend Integration

- **Form Component** (`web/src/components/AddPayment.tsx`):
  - React state management for form data
  - Real-time validation and error display
  - Loading states during submission
  - Success feedback with auto-dismiss

### 5. Component Refactoring (LoanCalculator)

#### Original Issues Identified

- **Performance**: No memoization for expensive calculations
- **Type Safety**: Missing TypeScript interfaces
- **Code Organization**: Inline calculations in render method

#### Refactored Implementation

```typescript
export const LoanCalculator: FC<LoanCalculatorProps> = ({
  principal,
  rate,
  months,
}) => {
  const { interest, total, installment } = useMemo(
    () => calculateSimpleLoan(principal, rate, months),
    [principal, rate, months]
  );

  return (
    <div>
      <h3>
        <b>Loan Interest:</b> {formatCurrency(interest)}
      </h3>
      <h3>
        <b>Monthly Installment:</b> {formatCurrency(installment)}
      </h3>
      <h3>
        <b>Total Loan to Pay:</b> {formatCurrency(total)}
      </h3>
    </div>
  );
};
```

### 6. Testing Implementation

#### Backend Tests (`server/test_app.py`)

- **Unit Tests**: Payment status calculation logic
- **Integration Tests**: REST API endpoints
- **Mocking Strategy**: Isolated test data to prevent state mutation
- **Coverage**: Edge cases, validation, and error scenarios

#### Frontend Tests (`web/src/__tests__/`)

- **Utility Functions**: Status color mapping and loan calculations
- **Component Tests**: React component behavior
- **Test Framework**: Vitest with React Testing Library

### 7. Additional Features & Improvements

#### Error Handling

- **GraphQL Errors**: User-friendly error display with retry options
- **Network Errors**: Proper error boundaries and fallback UI
- **Form Validation**: Client-side validation with server error integration

#### Performance Optimizations

- **Memoization**: `useMemo` for expensive calculations
- **Efficient Re-renders**: Proper dependency arrays in hooks
- **Lazy Loading**: Component imports (prepared for future scaling)

#### Code Quality

- **TypeScript**: Full type safety across the application
- **ESLint**: Code linting and formatting consistency
- **Modular Architecture**: Separation of concerns between layers
- **Documentation**: Comprehensive code comments

# OTHERS

- **CORS**: Implemented CORS to block requests from other origins
- **API Versioning**: Implemented API versioning for both REST & GraphQL endpoints

## Technical Stack

### Backend

- **Framework**: Flask with Flask-GraphQL
- **GraphQL**: Graphene-Python
- **Validation**: Marshmallow
- **Testing**: unittest with mocking

### Frontend

- **Framework**: React 18 with TypeScript
- **Styling**: CSS Modules with custom properties
- **GraphQL Client**: Apollo Client
- **Build Tool**: Vite
- **Testing**: Vitest

## Project Structure

```
numida/
├── server/
│   ├── graphql_api/
│   │   ├── schema.py
│   │   ├── queries/loans.py
│   │   └── types/
│   │       ├── loan.py
│   │       └── loan_payment.py
│   ├── rest_api/
│   │   ├── payments.py
│   │   └── dtos/payment_dto.py
│   ├── state.py
│   ├── utils.py
│   ├── app.py
│   └── test_app.py
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.tsx
│   │   │   ├── AddPayment.tsx
│   │   │   └── LoanCalculator.tsx
│   │   ├── helpers/
│   │   │   ├── utils.ts
│   │   │   └── loans.utis.ts
│   │   ├── __tests__/
│   │   └── types.d.ts
│   └── __generated__/ (GraphQL types)
└── documentation.md
```

## Key Design Decisions

1. **Entity Relationships**: Chose one-to-many relationship to accurately model real-world loan-payment dynamics
2. **Status Calculation**: Server-side computation ensures consistency and allows for future business rule changes
3. **REST + GraphQL**: Hybrid approach leveraging strengths of both paradigms
4. **Type Safety**: Comprehensive TypeScript usage prevents runtime errors
5. **Testing Strategy**: Unit tests for core logic, integration tests for APIs
6. **Error Handling**: User-centric error messages with actionable feedback

Recording - https://www.loom.com/share/ed140cc525f1447c83ffb5ae7d5c9b91
