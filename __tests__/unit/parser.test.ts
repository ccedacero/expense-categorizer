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

  // ==========================================
  // CHASE BANK FORMATS
  // ==========================================

  it('should parse Chase checking account export', () => {
    const input = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
01/15/2024,01/16/2024,STARBUCKS #12345,Food & Drink,DEBIT,-5.45,
01/16/2024,01/17/2024,PAYCHECK DEPOSIT,Income,CREDIT,3500.00,
01/17/2024,01/18/2024,ATM WITHDRAWAL,Cash,ATM,-100.00,`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0].description).toContain('STARBUCKS');
    expect(result.transactions[0].amount).toBe(-5.45); // Expenses are negative
    expect(result.transactions[1].description).toContain('PAYCHECK');
    expect(result.transactions[1].amount).toBe(3500.00); // Income is positive
    expect(result.transactions[2].amount).toBe(-100.00); // Withdrawals are negative
  });

  it('should parse Chase credit card export', () => {
    const input = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
01/15/2024,01/16/2024,STARBUCKS #12345,Food & Drink,Sale,-5.45,
01/16/2024,01/17/2024,AMAZON.COM,Shopping,Sale,-89.99,
01/18/2024,01/19/2024,PAYMENT - THANK YOU,Payment,Payment,250.00,`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0].description).toContain('STARBUCKS');
    expect(result.transactions[0].amount).toBe(-5.45); // Purchases are negative
    expect(result.transactions[1].amount).toBe(-89.99); // Purchases are negative
    expect(result.transactions[2].amount).toBe(250.00); // Payments are positive
  });

  // ==========================================
  // BANK OF AMERICA FORMATS
  // ==========================================

  it('should parse Bank of America checking account export', () => {
    const input = `Date,Description,Amount,Running Bal.
01/15/2024,WHOLE FOODS MARKET,-87.32,1234.56
01/16/2024,DIRECT DEPOSIT SALARY,3500.00,4734.56
01/17/2024,ATM WITHDRAWAL,-60.00,4674.56`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0].description).toBe('WHOLE FOODS MARKET');
    expect(result.transactions[0].amount).toBe(-87.32); // Expenses are negative
    expect(result.transactions[1].amount).toBe(3500.00); // Deposits are positive
    expect(result.transactions[2].amount).toBe(-60.00); // Withdrawals are negative
  });

  it('should parse Bank of America credit card export', () => {
    const input = `Posted Date,Reference Number,Payee,Address,Amount
01/15/2024,12345678,STARBUCKS,NEW YORK NY,-5.45
01/16/2024,12345679,AMAZON.COM,SEATTLE WA,-89.99
01/18/2024,12345680,ONLINE PAYMENT,,-250.00`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0].description).toBe('STARBUCKS');
    expect(result.transactions[0].amount).toBe(-5.45); // Purchases are negative
    expect(result.transactions[1].amount).toBe(-89.99); // Purchases are negative
    expect(result.transactions[2].amount).toBe(-250.00); // Payments are negative (paying off balance)
  });

  // ==========================================
  // CAPITAL ONE FORMATS
  // ==========================================

  it('should parse Capital One checking account export', () => {
    const input = `Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
01/15/2024,01/16/2024,1234,STARBUCKS STORE,Dining,5.45,
01/16/2024,01/17/2024,1234,PAYROLL DEPOSIT,Income,,3500.00
01/17/2024,01/18/2024,1234,ATM WITHDRAWAL,Cash,100.00,`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0].description).toContain('STARBUCKS');
    expect(result.transactions[0].amount).toBe(-5.45); // Debits are negative (expenses)
    expect(result.transactions[1].amount).toBe(3500.00); // Credits are positive (income)
    expect(result.transactions[2].amount).toBe(-100.00); // Debits are negative (withdrawals)
  });

  it('should parse Capital One credit card export', () => {
    const input = `Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
01/15/2024,01/16/2024,5678,STARBUCKS STORE,Dining,5.45,
01/16/2024,01/17/2024,5678,AMAZON.COM,Shopping,89.99,
01/18/2024,01/19/2024,5678,CAPITAL ONE AUTOPAY,Payment/Credit,,250.00`;

    const result = parseTransactions(input);

    expect(result.transactions).toHaveLength(3);
    // For credit cards, debits are purchases (should be negative in our system)
    expect(result.transactions[0].amount).toBe(-5.45);
    expect(result.transactions[1].amount).toBe(-89.99);
    // Credits are payments (should be positive in our system)
    expect(result.transactions[2].amount).toBe(250.00);
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
