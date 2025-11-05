/**
 * Parser Tests
 *
 * Test all parsing scenarios to ensure robust handling of various input formats
 */

import { describe, it, expect } from 'vitest';
import { parseTransactions } from '../../lib/parser';

describe('parseTransactions', () => {
  it('should parse standard CSV with headers', () => {
    const input = `Date,Description,Amount
2024-01-15,Starbucks,-5.45
2024-01-16,Salary,3500.00`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.transactions[0]).toEqual({
      date: '2024-01-15',
      description: 'Starbucks',
      amount: -5.45,
    });
    expect(result.transactions[1]).toEqual({
      date: '2024-01-16',
      description: 'Salary',
      amount: 3500.00,
    });
  });

  it('should parse CSV without headers', () => {
    const input = `2024-01-15,Starbucks,-5.45
2024-01-16,Salary,3500.00`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle different date formats', () => {
    const input = `Date,Description,Amount
01/15/2024,Store A,-10.00
2024-01-16,Store B,-20.00
1/17/24,Store C,-30.00`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0].date).toBe('2024-01-15');
    expect(result.transactions[1].date).toBe('2024-01-16');
    expect(result.transactions[2].date).toBe('2024-01-17');
  });

  it('should handle different amount formats', () => {
    const input = `Date,Description,Amount
2024-01-15,Negative,-5.45
2024-01-16,Parentheses,(10.00)
2024-01-17,Currency,$25.50
2024-01-18,Commas,"1,234.56"`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(4);
    expect(result.transactions[0].amount).toBe(-5.45);
    expect(result.transactions[1].amount).toBe(-10.00); // Parentheses = negative
    expect(result.transactions[2].amount).toBe(25.50);
    expect(result.transactions[3].amount).toBe(1234.56);
  });

  it('should parse tab-separated text', () => {
    const input = `2024-01-15\tStarbucks\t-5.45
2024-01-16\tSalary\t3500.00`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle varied column headers', () => {
    const input = `Transaction Date,Merchant,Total
2024-01-15,Starbucks,-5.45`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toEqual({
      date: '2024-01-15',
      description: 'Starbucks',
      amount: -5.45,
    });
  });

  it('should skip empty lines', () => {
    const input = `Date,Description,Amount
2024-01-15,Starbucks,-5.45

2024-01-16,Salary,3500.00
`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(2);
  });

  it('should return errors for malformed data', () => {
    const input = `Date,Description,Amount
2024-01-15,Starbucks
2024-01-16,Incomplete Data`;

    const result = parseTransactions(input);

    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should handle empty input', () => {
    const result = parseTransactions('');

    expect(result.transactions).toHaveLength(0);
    expect(result.errors).toContain('Input is empty');
  });

  it('should handle whitespace-only input', () => {
    const result = parseTransactions('   \n  \n  ');

    expect(result.transactions).toHaveLength(0);
    expect(result.errors).toContain('Input is empty');
  });

  it('should parse real-world Chase bank export', () => {
    const input = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
01/15/2024,01/16/2024,STARBUCKS #12345,Food & Drink,Sale,-5.45,
01/15/2024,01/16/2024,UBER TRIP,Travel,Sale,-12.30,`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].description).toContain('STARBUCKS');
    expect(result.transactions[0].amount).toBe(-5.45);
  });

  it('should parse real-world Bank of America export', () => {
    const input = `Date,Description,Amount,Running Bal.
01/15/2024,WHOLE FOODS MARKET,-87.32,1234.56
01/16/2024,DIRECT DEPOSIT SALARY,3500.00,4734.56`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].description).toBe('WHOLE FOODS MARKET');
    expect(result.transactions[0].amount).toBe(-87.32);
  });

  it('should handle international currency formats', () => {
    const input = `Date,Description,Amount
2024-01-15,Coffee Shop,€5.45
2024-01-16,Lunch,£12.30
2024-01-17,Dinner,¥1000`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0].amount).toBe(5.45);
    expect(result.transactions[1].amount).toBe(12.30);
    expect(result.transactions[2].amount).toBe(1000);
  });
});
