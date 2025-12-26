export function formatCurrency(
  amount: number,
  locale = 'en-KE',
  currency = 'KES'
): string {
  return amount.toLocaleString(locale, {
    style: 'currency',
    currency,
  });
}

/**
 * get status color based on payment status state
 * @param status
 * @returns
 */
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
