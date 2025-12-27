/**
 * we assume a fixed number of months for the loan repayment, 12 months.
 * this assumption will help us get monthly installments amount for each loan
 * @param principal
 * @param rate
 * @param months
 * @returns
 */
export function calculateSimpleLoan(
  principal: number,
  rate: number,
  months: number = 12
) {
  const interest = (principal * rate * months) / (100 * 12);
  const total = principal + interest;
  const installment = total / months;

  return {
    interest,
    total,
    installment,
  };
}

/*
since payment period is not defined we assume loan payment is done in lumpsum 
not a viable approach esp how loan payments are done 
*/
/* export function calculateSimpleLoan(
  principal: number,
  rate: number,
  months?: number
) {
  const interest = (principal * rate) / 100;
  const total = principal + interest;
  const installment = months ? total / months : total;

  return {
    interest,
    total,
    installment,
  };
}*/
