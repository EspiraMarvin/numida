import './App.css';
import { gql, useQuery } from '@apollo/client';
import { Loan } from './types';

const GET_LOANS_WITH_PAYMENTS = gql`
  query GetLoans {
    loans {
      id
      name
      principal
      interestRate
      dueDate
      status
      loanPayments {
        id
        loanId
        paymentDate
      }
    }
  }
`;

const AddNewPayment = () => {
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <p>
          <label>Payment Loan Id</label>
          <input name="loan-id" onChange={() => {}} />
        </p>

        <p>
          <label>Payment Amount</label>
          <input name="payment-amount" type="number" onChange={() => {}} />
        </p>
        <p>
          <button type="submit">Add Payment</button>
        </p>
      </form>
    </div>
  );
};

function App() {
  const { loading, error, data, refetch } = useQuery(GET_LOANS_WITH_PAYMENTS, {
    errorPolicy: 'all',
  });

  const getStatusColor = (status: string) => {
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
              const paymentDate =
                loan.loanPayments && loan.loanPayments.length > 0
                  ? loan.loanPayments[0].paymentDate
                  : null;
              return (
                <div key={loan.id} className="card">
                  <h4>{loan.name}</h4>
                  <div className="loan-details">
                    <p>
                      <b>Principal:</b>
                      Kes {loan.principal}{' '}
                    </p>
                    <p>
                      <b>Interest Rate:</b>
                      {loan.interestRate}%{' '}
                    </p>
                    <p>
                      <b>Due Date:</b>
                      {loan.dueDate}{' '}
                    </p>
                    <p>
                      <b>Payment Date:</b>
                      {paymentDate || 'N/A'}{' '}
                    </p>
                    <div
                      style={{
                        backgroundColor: getStatusColor(loan.status),
                      }}
                      className="status"
                    >
                      {loan.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <h1>Add New Payment</h1>
        <AddNewPayment />
      </div>
    </>
  );
}

export default App;
