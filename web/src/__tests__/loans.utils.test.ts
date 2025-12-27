import { describe, it, expect } from 'vitest';
import { calculateSimpleLoan } from '../helpers/loans.utis';

describe('calculateSimpleLoan', () => {
  it('calculates the correct installment for a standard loan', () => {
    const principal = 10000;
    const rate = 5;
    const terms = 12;

    const result = calculateSimpleLoan(principal, rate, terms);

    expect(result.installment).toBeCloseTo(875.0);
  });
});
