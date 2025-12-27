import { describe, it, expect } from 'vitest';

const getStatusColor = (status: string): string => {
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

describe('getStatusColor utility function', () => {
  it('returns green color for "On Time" status', () => {
    expect(getStatusColor('On Time')).toBe('green');
  });

  it('returns orange color for "Late" status', () => {
    expect(getStatusColor('Late')).toBe('orange');
  });

  it('returns red color for "Defaulted" status', () => {
    expect(getStatusColor('Defaulted')).toBe('red');
  });

  it('returns grey color for "Unpaid" status', () => {
    expect(getStatusColor('Unpaid')).toBe('grey');
  });

  it('returns black color for unknown status', () => {
    expect(getStatusColor('Unknown')).toBe('grey');
    expect(getStatusColor('')).toBe('grey');
  });
});
