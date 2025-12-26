import { useEffect, useState } from 'react';
import { AddPaymentFormData, Loan } from '../types';
import { calculateSimpleLoan } from '../helpers/loans.utis';

interface AddNewPaymentProps {
  loans: Loan[];
  onPaymentAdded: () => void;
}

export const AddNewPayment = ({
  loans,
  onPaymentAdded,
}: AddNewPaymentProps) => {
  const [formData, setFormData] = useState<AddPaymentFormData>({
    loanId: '',
    paymentAmount: '',
    paymentDate: '',
  });

  useEffect(() => {
    if (formData.loanId) {
      const selectedLoan = loans.find((l) => l.id === Number(formData.loanId));
      if (selectedLoan) {
        const { installment } = calculateSimpleLoan(
          selectedLoan.principal,
          selectedLoan.interestRate,
          12
        );
        setFormData((prev) => ({
          ...prev,
          paymentAmount: installment.toFixed(2),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        paymentAmount: '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.loanId, loans]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string | undefined>
  >({});

  const handleChange =
    (field: keyof AddPaymentFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear the field error if it existed
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch('http://localhost:2024/api/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loan_id: parseInt(formData.loanId),
          payment_amount: parseInt(formData.paymentAmount),
          payment_date: formData.paymentDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && typeof data.error === 'object') {
          const errors: Record<string, string> = {};
          Object.entries(data.error).forEach(([key, messages]) => {
            errors[key] = Array.isArray(messages)
              ? messages.join(', ')
              : String(messages);
          });
          return setFieldErrors(errors);
          // throw new Error('Please fix the form errors.');
        } else {
          throw new Error(data.error || 'Failed to add payment');
        }
      }

      setSubmitSuccess(true);
      setFormData({ loanId: '', paymentAmount: '', paymentDate: '' });

      // trigger refetch data
      onPaymentAdded();

      // reset success message
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loan-id">Payment Loan Id</label>
          <select
            id="loan-id"
            value={formData.loanId}
            onChange={handleChange('loanId')}
            required
            disabled={isSubmitting}
          >
            <option value="">Select a Loan</option>
            {loans?.map((loan) => (
              <option key={loan.id} value={loan.id}>
                {loan.name} - {loan.principal} ({loan.interestRate}%)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="payment-amount">Payment Amount</label>
          <input
            id="payment-amount"
            name="payment-amount"
            type="number"
            value={formData.paymentAmount}
            onChange={handleChange('paymentAmount')}
            required
            readOnly
            disabled={isSubmitting}
          />
          {fieldErrors.payment_amount && (
            <div className="error-message">{fieldErrors.payment_amount}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="payment-date">Payment Date</label>
          <input
            id="payment-date"
            name="payment-date"
            type="date"
            value={formData.paymentDate}
            onChange={handleChange('paymentDate')}
            required
            disabled={isSubmitting}
          />
          {fieldErrors.payment_date && (
            <div className="error-message">{fieldErrors.payment_date}</div>
          )}
        </div>

        {submitError && (
          <div className="error-message" role="alert">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="success-message" role="alert">
            Payment added successfully!
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-small"></span>
                Adding...
              </>
            ) : (
              'Add Payment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
