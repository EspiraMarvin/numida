// typescript types definitions
export interface LoanPayment {
  id: number;
  loanId: number;
  paymentAmount: number;
  paymentDate: string;
  status: string;
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

export interface AddPaymentFormData {
  loanId: string;
  paymentAmount: string;
  paymentDate: string;
}
