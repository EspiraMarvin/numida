import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import App from '../App';
import { gql } from '@apollo/client';

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

const mockLoansData = {
  loans: [
    {
      id: 1,
      name: "Tom's Loan",
      interestRate: 5.0,
      principal: 10000,
      dueDate: '2025-03-01',
      loanPayments: [
        {
          id: 1,
          loanId: 1,
          paymentAmount: 875,
          paymentDate: '2025-03-04',
          status: 'On Time',
        },
      ],
    },
  ],
};

const mocks = [
  {
    request: {
      query: GET_LOANS_WITH_PAYMENTS,
    },
    result: {
      data: mockLoansData,
    },
  },
];

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <App />
      </MockedProvider>
    );
    expect(
      screen.getByText(/Loading loans & payments.../i)
    ).toBeInTheDocument();
  });

  it('renders loans data after successful query', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <App />
      </MockedProvider>
    );

    const loanName = await screen.findByText("Tom's Loan");

    const cardContainer = loanName.closest('.card') as HTMLElement;

    if (cardContainer) {
      const cardScope = within(cardContainer);
      expect(cardScope.getByText(/Principal:/i)).toBeInTheDocument();
      expect(cardScope.getByText(/5%/i)).toBeInTheDocument();
    } else {
      expect(screen.getAllByText(/5%/i).length).toBeGreaterThan(0);
    }
  });

  it('displays correct status badges', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      const statusElement = screen.getByText('On Time');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveClass('status');
    });
  });

  it('displays error message on query error', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_LOANS_WITH_PAYMENTS,
        },
        error: new Error('Network error'),
      },
    ];

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error loading data/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Retry/i })
      ).toBeInTheDocument();
    });
  });

  it('displays no loans message when data is empty', async () => {
    const emptyMocks = [
      {
        request: {
          query: GET_LOANS_WITH_PAYMENTS,
        },
        result: {
          data: { loans: [] },
        },
      },
    ];

    render(
      <MockedProvider mocks={emptyMocks} addTypename={false}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No loans found/i)).toBeInTheDocument();
    });
  });
});
