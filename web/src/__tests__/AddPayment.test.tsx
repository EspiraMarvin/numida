import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Loan } from '../types';
import { AddNewPayment } from '../components/AddPayment';

const mockLoans: Loan[] = [
  {
    id: 1,
    name: "Tom's Loan",
    interestRate: 5.0,
    principal: 10000,
    dueDate: '2025-03-01',
  } as Loan,
];

describe('AddNewPayment', () => {
  const mockOnPaymentAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <AddNewPayment loans={mockLoans} onPaymentAdded={mockOnPaymentAdded} />
    );

    expect(screen.getByLabelText(/Payment Loan Id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Date/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Add Payment/i })
    ).toBeInTheDocument();
  });

  it('automatically calculates and sets payment amount when a loan is selected', async () => {
    render(
      <AddNewPayment loans={mockLoans} onPaymentAdded={mockOnPaymentAdded} />
    );

    const loanSelect = screen.getByLabelText(/Payment Loan Id/i);
    fireEvent.change(loanSelect, { target: { value: '1' } });

    const amountInput = screen.getByLabelText(
      /Payment Amount/i
    ) as HTMLInputElement;

    await waitFor(() => {
      expect(amountInput.value).not.toBe('');
    });
  });

  it('submits form with valid data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });
    global.fetch = mockFetch;

    render(
      <AddNewPayment loans={mockLoans} onPaymentAdded={mockOnPaymentAdded} />
    );

    fireEvent.change(screen.getByLabelText(/Payment Loan Id/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/Payment Date/i), {
      target: { value: '2025-03-10' },
    });

    const submitButton = screen.getByRole('button', { name: /Add Payment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:2024/api/v1/payments',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"loan_id":1'),
        })
      );
      expect(mockOnPaymentAdded).toHaveBeenCalled();
    });
  });

  it('shows error message on API error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Database error' }),
    });

    render(
      <AddNewPayment loans={mockLoans} onPaymentAdded={mockOnPaymentAdded} />
    );

    fireEvent.change(screen.getByLabelText(/Payment Loan Id/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/Payment Date/i), {
      target: { value: '2025-03-10' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add Payment/i }));

    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });
  });
});
