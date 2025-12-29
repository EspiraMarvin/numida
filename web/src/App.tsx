import './App.css';
import { gql, useQuery } from '@apollo/client';
import { Loan, LoanPayment } from './types';
import { formatCurrency, getStatusColor } from './helpers/utils';
import { AddNewPayment } from './components/AddPayment';
import { calculateSimpleLoan } from './helpers/loans.utis';
// import { LoanCalculator } from './components/LoanCalculator';

const GET_LOANS_WITH_PAYMENTS = gql`
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
`;

function App() {
  /** query loans */
  const { loading, error, data, refetch } = useQuery(GET_LOANS_WITH_PAYMENTS, {
    errorPolicy: 'all',
  });

  /**
   * refetch loans after a successful addition of a loan payment
   */
  const handlePaymentAdded = () => {
    refetch();
  };

  return (
    <>
      <div>
        <h1>Existing Loans & Payments</h1>
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading loans & payments...</p>
          </div>
        )}

        {error && (
          <div className="error-container" role="alert">
            <h3>Error loading data</h3>
            <p>{error.message}</p>
            <button onClick={() => refetch()} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {data?.loans.length === 0 ? (
          <p>No loans found</p>
        ) : (
          <div className="loans-grid">
            {data?.loans.map((loan: Loan) => {
              return (
                <div key={loan.id} className="card">
                  <h4>{loan.name}</h4>
                  <div className="loan-details">
                    <p>
                      <b>Principal:</b>
                      {formatCurrency(loan.principal)}{' '}
                    </p>
                    <p>
                      <b>Interest Rate:</b>
                      {loan.interestRate}%{' '}
                    </p>
                    <p>
                      <b>Due Date:</b>
                      {loan.dueDate}{' '}
                    </p>

                    <b>Payments</b>
                    <div className="payment-divider" />
                    <div className="loan-payments">
                      {loan.loanPayments && loan.loanPayments.length > 0 ? (
                        loan.loanPayments.map((payment: LoanPayment) => (
                          <div key={payment.id} className="payment">
                            <p>
                              <b>Payment Date:</b>{' '}
                              {payment.paymentDate || 'N/A'}
                            </p>
                            {payment.paymentAmount ? (
                              <p>
                                <b>Amount:</b>{' '}
                                {formatCurrency(payment.paymentAmount) ?? 'N/A'}
                              </p>
                            ) : (
                              <p>
                                <b>Amount:</b>{' '}
                                {formatCurrency(
                                  calculateSimpleLoan(
                                    loan.principal,
                                    loan.interestRate,
                                    12
                                  ).installment
                                )}
                              </p>
                            )}

                            <div
                              style={{
                                backgroundColor: getStatusColor(payment.status),
                              }}
                              className="status"
                            >
                              {payment.status}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            backgroundColor: getStatusColor('Unpaid'),
                          }}
                          className="status"
                        >
                          UnPaid
                        </div>
                      )}
                    </div>
                    {/* <LoanCalculator
                      principal={loan.principal}
                      rate={loan.interestRate}
                      months={12}
                    /> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <h1>Add New Payment</h1>
        <AddNewPayment
          loans={data?.loans}
          onPaymentAdded={handlePaymentAdded}
        />
      </div>
    </>
  );
}

export default App;
