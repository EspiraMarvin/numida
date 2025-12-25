// typescript types definitions
export interface LoanPayment {
  id: number;
  loanId: number;
  paymentDate: string;
}

export interface Loan {
  id: number;
  name: string;
  principal: number;
  interestRate: number;
  dueDate: string;
  status: string;
  loanPayments: LoanPayment[];
}
