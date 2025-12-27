import { FC, useMemo } from 'react';
import { formatCurrency } from '../helpers/utils';
import { calculateSimpleLoan } from '../helpers/loans.utis';

interface LoanCalculatorProps {
  principal: number;
  rate: number;
  months: number;
}

//  SECTION 4 Debugging & Code Refactoring
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
