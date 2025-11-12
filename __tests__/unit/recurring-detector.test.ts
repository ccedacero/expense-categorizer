/**
 * Unit Tests: Recurring Transaction & Subscription Detection
 *
 * Tests the subscription dashboard's recurring transaction detection logic
 */

import { describe, it, expect } from 'vitest';
import { detectRecurringTransactions } from '@/lib/recurring-detector';
import { CategorizedTransaction } from '@/lib/types';

describe('Recurring Transaction Detection', () => {
  // Helper to create test transactions
  const createTransaction = (
    date: string,
    description: string,
    amount: number,
    category: CategorizedTransaction['category'] = 'Entertainment'
  ): CategorizedTransaction => ({
    date,
    description,
    amount,
    category,
    originalDescription: description,
  });

  describe('Monthly Subscription Detection', () => {
    it('should detect monthly subscriptions with consistent amounts', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'NETFLIX.COM', -15.99),
        createTransaction('2024-02-15', 'NETFLIX.COM', -15.99),
        createTransaction('2024-03-15', 'NETFLIX.COM', -15.99),
        createTransaction('2024-04-15', 'NETFLIX.COM', -15.99),
      ];

      const result = await detectRecurringTransactions(transactions);

      expect(result.recurring.length).toBeGreaterThan(0);
      const netflixSub = result.recurring.find(r => r.merchant.toLowerCase().includes('netflix'));
      expect(netflixSub).toBeDefined();
      expect(netflixSub?.frequency).toBe('monthly');
      expect(netflixSub?.averageAmount).toBeCloseTo(15.99, 2);
      expect(netflixSub?.occurrences).toBe(4);
    });

    it('should handle subscription price changes (Netflix $13 -> $17)', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'NETFLIX', -12.99),
        createTransaction('2024-02-15', 'NETFLIX', -12.99),
        createTransaction('2024-03-15', 'NETFLIX', -15.99), // Price increase
        createTransaction('2024-04-15', 'NETFLIX', -15.99),
        createTransaction('2024-05-15', 'NETFLIX', -17.99), // Another increase
      ];

      const result = await detectRecurringTransactions(transactions);

      const netflixSub = result.recurring.find(r => r.merchant.toLowerCase().includes('netflix'));
      expect(netflixSub).toBeDefined();
      expect(netflixSub?.frequency).toBe('monthly');
      expect(netflixSub?.confidence).toBeGreaterThan(0.7); // Should still be confident despite price changes
    });

    it('should detect Spotify as monthly subscription', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-10', 'SPOTIFY', -10.99, 'Entertainment'),
        createTransaction('2024-02-10', 'SPOTIFY', -10.99, 'Entertainment'),
        createTransaction('2024-03-10', 'SPOTIFY', -10.99, 'Entertainment'),
      ];

      const result = await detectRecurringTransactions(transactions);

      const spotifySub = result.recurring.find(r => r.merchant.toLowerCase().includes('spotify'));
      expect(spotifySub).toBeDefined();
      expect(spotifySub?.frequency).toBe('monthly');
    });
  });

  describe('Quarterly and Annual Subscriptions', () => {
    it('should detect annual subscriptions (Amazon Prime)', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2022-05-01', 'AMAZON PRIME', -139.00),
        createTransaction('2023-05-01', 'AMAZON PRIME', -139.00),
        createTransaction('2024-05-01', 'AMAZON PRIME', -139.00),
      ];

      const result = await detectRecurringTransactions(transactions);

      const primeSub = result.recurring.find(r => r.merchant.toLowerCase().includes('prime'));
      expect(primeSub).toBeDefined();
      expect(primeSub?.frequency).toBe('annual');
      expect(primeSub?.averageAmount).toBeCloseTo(139.00, 2);
    });

    it('should detect quarterly subscriptions', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'QUARTERLY SERVICE', -45.00),
        createTransaction('2024-04-15', 'QUARTERLY SERVICE', -45.00),
        createTransaction('2024-07-15', 'QUARTERLY SERVICE', -45.00),
      ];

      const result = await detectRecurringTransactions(transactions);

      const quarterlySub = result.recurring.find(r => r.merchant.includes('QUARTERLY'));
      expect(quarterlySub).toBeDefined();
      expect(quarterlySub?.frequency).toBe('quarterly');
    });
  });

  describe('Exclusion Logic', () => {
    it('should NOT detect grocery stores as subscriptions', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-05', 'TRADER JOES', -45.32, 'Groceries'),
        createTransaction('2024-02-05', 'TRADER JOES', -48.21, 'Groceries'),
        createTransaction('2024-03-05', 'TRADER JOES', -52.10, 'Groceries'),
      ];

      const result = await detectRecurringTransactions(transactions);

      const traderJoes = result.recurring.find(r => r.merchant.toLowerCase().includes('trader'));
      expect(traderJoes).toBeUndefined();
    });

    it('should NOT detect restaurants as subscriptions', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-10', 'CHIPOTLE #1234', -12.50, 'Food & Dining'),
        createTransaction('2024-02-10', 'CHIPOTLE #5678', -12.50, 'Food & Dining'),
        createTransaction('2024-03-10', 'CHIPOTLE #9012', -12.50, 'Food & Dining'),
      ];

      const result = await detectRecurringTransactions(transactions);

      const chipotle = result.recurring.find(r => r.merchant.toLowerCase().includes('chipotle'));
      expect(chipotle).toBeUndefined();
    });

    it('should NOT detect gas stations as subscriptions (highly variable amounts)', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-05', 'SHELL #1234 MAIN ST', -25.00, 'Transportation'),
        createTransaction('2024-02-05', 'SHELL #1234 MAIN ST', -60.00, 'Transportation'),
        createTransaction('2024-03-05', 'SHELL #1234 MAIN ST', -35.00, 'Transportation'),
      ];

      const result = await detectRecurringTransactions(transactions);

      // Gas stations typically have highly variable amounts (>40% variance)
      // This should prevent detection due to exceeding variance threshold
      const shell = result.recurring.find(r => r.merchant.toLowerCase().includes('shell'));
      expect(shell).toBeUndefined(); // Should not be detected due to high variance (>35%)
    });

    it('should NOT detect Amazon Marketplace purchases', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'AMAZON MKTPL US*AB123', -29.99, 'Shopping'),
        createTransaction('2024-02-15', 'AMAZON MKTPL US*CD456', -29.99, 'Shopping'),
        createTransaction('2024-03-15', 'AMAZON MKTPL US*EF789', -29.99, 'Shopping'),
      ];

      const result = await detectRecurringTransactions(transactions);

      const amazon = result.recurring.find(r =>
        r.merchant.toLowerCase().includes('amazon') && r.merchant.toLowerCase().includes('mktpl')
      );
      expect(amazon).toBeUndefined();
    });
  });

  describe('Payment Processor Handling', () => {
    it('should extract merchant name from Square transactions', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'SQ *ALIAS COFFEE', -5.50, 'Food & Dining'),
        createTransaction('2024-02-15', 'SQ *ALIAS COFFEE', -5.50, 'Food & Dining'),
        createTransaction('2024-03-15', 'SQ *ALIAS COFFEE', -5.50, 'Food & Dining'),
      ];

      const result = await detectRecurringTransactions(transactions);

      // Should be excluded as coffee shop, but if detected, name should be "ALIAS COFFEE" not "SQ"
      const coffee = result.recurring.find(r => r.merchant.toLowerCase().includes('alias'));
      if (coffee) {
        expect(coffee.merchant).toContain('ALIAS COFFEE');
        expect(coffee.merchant).not.toContain('SQ *');
      }
    });

    it('should extract merchant name from TST transactions', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'TST*UNCOMMON GROUNDS', -6.00, 'Food & Dining'),
        createTransaction('2024-02-15', 'TST*UNCOMMON GROUNDS', -6.00, 'Food & Dining'),
        createTransaction('2024-03-15', 'TST*UNCOMMON GROUNDS', -6.00, 'Food & Dining'),
      ];

      const result = await detectRecurringTransactions(transactions);

      const coffee = result.recurring.find(r => r.merchant.toLowerCase().includes('uncommon'));
      if (coffee) {
        expect(coffee.merchant).toContain('UNCOMMON GROUNDS');
        expect(coffee.merchant).not.toContain('TST*');
      }
    });
  });

  describe('Subscription Grouping', () => {
    it('should group streaming services together', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'NETFLIX', -15.99),
        createTransaction('2024-02-15', 'NETFLIX', -15.99),
        createTransaction('2024-03-15', 'NETFLIX', -15.99),
        createTransaction('2024-01-10', 'HULU', -12.99),
        createTransaction('2024-02-10', 'HULU', -12.99),
        createTransaction('2024-03-10', 'HULU', -12.99),
        createTransaction('2024-01-20', 'DISNEY PLUS', -7.99),
        createTransaction('2024-02-20', 'DISNEY PLUS', -7.99),
        createTransaction('2024-03-20', 'DISNEY PLUS', -7.99),
      ];

      const result = await detectRecurringTransactions(transactions);

      const streamingGroup = result.groups.find(g => g.groupName === 'Streaming Services');
      expect(streamingGroup).toBeDefined();
      expect(streamingGroup?.count).toBeGreaterThanOrEqual(2);
      expect(streamingGroup?.totalMonthly).toBeGreaterThan(0);
    });

    it('should group fitness subscriptions together', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-01', 'PLANET FITNESS', -10.00),
        createTransaction('2024-02-01', 'PLANET FITNESS', -10.00),
        createTransaction('2024-03-01', 'PLANET FITNESS', -10.00),
        createTransaction('2024-01-15', 'PELOTON', -44.00),
        createTransaction('2024-02-15', 'PELOTON', -44.00),
        createTransaction('2024-03-15', 'PELOTON', -44.00),
      ];

      const result = await detectRecurringTransactions(transactions);

      const fitnessGroup = result.groups.find(g => g.groupName === 'Fitness & Health');
      expect(fitnessGroup).toBeDefined();
      expect(fitnessGroup?.count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Analytics and Insights', () => {
    it('should calculate total monthly spend correctly', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'NETFLIX', -15.99),
        createTransaction('2024-02-15', 'NETFLIX', -15.99),
        createTransaction('2024-03-15', 'NETFLIX', -15.99),
        createTransaction('2024-01-10', 'SPOTIFY', -10.99),
        createTransaction('2024-02-10', 'SPOTIFY', -10.99),
        createTransaction('2024-03-10', 'SPOTIFY', -10.99),
      ];

      const result = await detectRecurringTransactions(transactions);

      expect(result.totalMonthlySpend).toBeCloseTo(26.98, 2); // Netflix + Spotify
    });

    it('should calculate total annual spend correctly', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'NETFLIX', -15.99),
        createTransaction('2024-02-15', 'NETFLIX', -15.99),
        createTransaction('2024-03-15', 'NETFLIX', -15.99),
      ];

      const result = await detectRecurringTransactions(transactions);

      expect(result.totalAnnualSpend).toBeCloseTo(15.99 * 12, 2);
    });

    it('should identify hidden (small) subscriptions', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'SMALL SERVICE', -4.99),
        createTransaction('2024-02-15', 'SMALL SERVICE', -4.99),
        createTransaction('2024-03-15', 'SMALL SERVICE', -4.99),
        createTransaction('2024-01-10', 'TINY APP', -2.99),
        createTransaction('2024-02-10', 'TINY APP', -2.99),
        createTransaction('2024-03-10', 'TINY APP', -2.99),
      ];

      const result = await detectRecurringTransactions(transactions);

      expect(result.hiddenCount).toBeGreaterThan(0);
      const smallSubs = result.recurring.filter(r => r.averageAmount < 20);
      expect(smallSubs.length).toBeGreaterThanOrEqual(2);
    });

    it('should predict next charge date', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'NETFLIX', -15.99),
        createTransaction('2024-02-15', 'NETFLIX', -15.99),
        createTransaction('2024-03-15', 'NETFLIX', -15.99),
      ];

      const result = await detectRecurringTransactions(transactions);

      const netflix = result.recurring.find(r => r.merchant.toLowerCase().includes('netflix'));
      expect(netflix?.nextExpectedDate).toBeDefined();

      if (netflix?.nextExpectedDate) {
        const nextDate = new Date(netflix.nextExpectedDate);
        const lastDate = new Date('2024-03-15');
        const daysDiff = Math.floor((nextDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysDiff).toBeGreaterThan(25); // Should be around 30 days
        expect(daysDiff).toBeLessThan(35);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty transaction list', async () => {
      const result = await detectRecurringTransactions([]);

      expect(result.recurring).toEqual([]);
      expect(result.groups).toEqual([]);
      expect(result.totalMonthlySpend).toBe(0);
      expect(result.totalAnnualSpend).toBe(0);
      expect(result.hiddenCount).toBe(0);
    });

    it('should require at least 3 occurrences for detection', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'NETFLIX', -15.99),
        createTransaction('2024-02-15', 'NETFLIX', -15.99),
      ];

      const result = await detectRecurringTransactions(transactions);

      // Should not detect with only 2 occurrences (stricter criteria)
      expect(result.recurring.length).toBe(0);
    });

    it('should handle transactions with high variance (not subscriptions)', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'VARIABLE SERVICE', -10.00),
        createTransaction('2024-02-15', 'VARIABLE SERVICE', -50.00),
        createTransaction('2024-03-15', 'VARIABLE SERVICE', -25.00),
      ];

      const result = await detectRecurringTransactions(transactions);

      // High variance should prevent detection (unless has strong keywords)
      const variable = result.recurring.find(r => r.merchant.includes('VARIABLE'));
      if (variable) {
        expect(variable.confidence).toBeLessThan(0.75);
      }
    });

    it('should handle utilities with variable amounts (should still detect)', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'ELECTRIC COMPANY', -120.00, 'Bills & Utilities'),
        createTransaction('2024-02-15', 'ELECTRIC COMPANY', -135.00, 'Bills & Utilities'),
        createTransaction('2024-03-15', 'ELECTRIC COMPANY', -110.00, 'Bills & Utilities'),
        createTransaction('2024-04-15', 'ELECTRIC COMPANY', -125.00, 'Bills & Utilities'),
      ];

      const result = await detectRecurringTransactions(transactions);

      const electric = result.recurring.find(r => r.merchant.toLowerCase().includes('electric'));
      expect(electric).toBeDefined();
      expect(electric?.frequency).toBe('monthly');
      expect(electric?.category).toBe('Bills & Utilities');
    });
  });

  describe('Confidence Scoring', () => {
    it('should have high confidence for fixed-amount subscriptions', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'NETFLIX', -15.99),
        createTransaction('2024-02-15', 'NETFLIX', -15.99),
        createTransaction('2024-03-15', 'NETFLIX', -15.99),
        createTransaction('2024-04-15', 'NETFLIX', -15.99),
        createTransaction('2024-05-15', 'NETFLIX', -15.99),
      ];

      const result = await detectRecurringTransactions(transactions);

      const netflix = result.recurring.find(r => r.merchant.toLowerCase().includes('netflix'));
      expect(netflix?.confidence).toBeGreaterThan(0.85);
    });

    it('should have lower confidence for variable amounts', async () => {
      const transactions: CategorizedTransaction[] = [
        createTransaction('2024-01-15', 'UTILITY BILL', -100.00, 'Bills & Utilities'),
        createTransaction('2024-02-15', 'UTILITY BILL', -120.00, 'Bills & Utilities'),
        createTransaction('2024-03-15', 'UTILITY BILL', -115.00, 'Bills & Utilities'),
      ];

      const result = await detectRecurringTransactions(transactions);

      const utility = result.recurring.find(r => r.merchant.toLowerCase().includes('utility'));
      if (utility) {
        // Should still detect (utility keyword) but with lower confidence than fixed subscriptions
        expect(utility.confidence).toBeLessThan(0.95);
      }
    });
  });
});
