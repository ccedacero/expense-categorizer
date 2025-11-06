/**
 * Categorization Parity Tests
 *
 * Verify that checking accounts and credit cards receive identical
 * categorization when they have the same merchants and categories.
 */

import { describe, it, expect } from 'vitest';
import { mapCapitalOneCategory } from '../../lib/capital-one-category-mapping';
import { mapChaseCategory } from '../../lib/chase-category-mapping';

describe('Categorization Parity: Checking vs Credit Card', () => {
  describe('Capital One: Same category mapping for checking and credit', () => {
    it('should categorize Dining identically for checking and credit card', () => {
      // Checking account transaction
      const checkingCategory = mapCapitalOneCategory('Dining', 'STARBUCKS #1234');

      // Credit card transaction (same merchant, same category)
      const creditCategory = mapCapitalOneCategory('Dining', 'STARBUCKS #5678');

      expect(checkingCategory).toBe('Food & Dining');
      expect(creditCategory).toBe('Food & Dining');
      expect(checkingCategory).toBe(creditCategory); // Must be identical
    });

    it('should categorize Gas/Automotive identically for checking and credit card', () => {
      const checkingCategory = mapCapitalOneCategory('Gas/Automotive', 'SUNOCO STATION');
      const creditCategory = mapCapitalOneCategory('Gas/Automotive', 'SUNOCO STATION');

      expect(checkingCategory).toBe('Transportation');
      expect(creditCategory).toBe('Transportation');
      expect(checkingCategory).toBe(creditCategory);
    });

    it('should categorize Health Care identically for checking and credit card', () => {
      const checkingCategory = mapCapitalOneCategory('Health Care', 'CVS/PHARMACY');
      const creditCategory = mapCapitalOneCategory('Health Care', 'CVS/PHARMACY');

      expect(checkingCategory).toBe('Healthcare');
      expect(creditCategory).toBe('Healthcare');
      expect(checkingCategory).toBe(creditCategory);
    });

    it('should apply smart grocery detection identically for checking and credit card', () => {
      // Both should detect WHOLE FOODS as grocery, not shopping
      const checkingCategory = mapCapitalOneCategory('Merchandise', 'WHOLE FOODS MARKET');
      const creditCategory = mapCapitalOneCategory('Merchandise', 'WHOLE FOODS MARKET');

      expect(checkingCategory).toBe('Groceries');
      expect(creditCategory).toBe('Groceries');
      expect(checkingCategory).toBe(creditCategory);
    });

    it('should handle non-grocery merchandise identically for checking and credit card', () => {
      // Both should categorize LOWE'S as shopping, not grocery
      const checkingCategory = mapCapitalOneCategory('Merchandise', 'LOWES #01784*');
      const creditCategory = mapCapitalOneCategory('Merchandise', 'LOWES #01784*');

      expect(checkingCategory).toBe('Shopping');
      expect(creditCategory).toBe('Shopping');
      expect(checkingCategory).toBe(creditCategory);
    });

    it('should categorize payments identically for checking and credit card', () => {
      const checkingCategory = mapCapitalOneCategory('Payment/Credit', 'CAPITAL ONE MOBILE PYMT');
      const creditCategory = mapCapitalOneCategory('Payment/Credit', 'CAPITAL ONE MOBILE PYMT');

      expect(checkingCategory).toBe('Payment');
      expect(creditCategory).toBe('Payment');
      expect(checkingCategory).toBe(creditCategory);
    });
  });

  describe('Chase: Same category mapping for checking and credit', () => {
    it('should categorize Food & Drink identically for checking and credit card', () => {
      const checkingCategory = mapChaseCategory('Food & Drink');
      const creditCategory = mapChaseCategory('Food & Drink');

      expect(checkingCategory).toBe('Food & Dining');
      expect(creditCategory).toBe('Food & Dining');
      expect(checkingCategory).toBe(creditCategory);
    });

    it('should categorize Gas identically for checking and credit card', () => {
      const checkingCategory = mapChaseCategory('Gas');
      const creditCategory = mapChaseCategory('Gas');

      expect(checkingCategory).toBe('Transportation');
      expect(creditCategory).toBe('Transportation');
      expect(checkingCategory).toBe(creditCategory);
    });

    it('should categorize Shopping identically for checking and credit card', () => {
      const checkingCategory = mapChaseCategory('Shopping');
      const creditCategory = mapChaseCategory('Shopping');

      expect(checkingCategory).toBe('Shopping');
      expect(creditCategory).toBe('Shopping');
      expect(checkingCategory).toBe(creditCategory);
    });

    it('should categorize Health & Wellness identically for checking and credit card', () => {
      const checkingCategory = mapChaseCategory('Health & Wellness');
      const creditCategory = mapChaseCategory('Health & Wellness');

      expect(checkingCategory).toBe('Healthcare');
      expect(creditCategory).toBe('Healthcare');
      expect(checkingCategory).toBe(creditCategory);
    });
  });

  describe('Cross-bank consistency', () => {
    it('should produce consistent results across banks for same merchant types', () => {
      // Dining category from different banks should all map to Food & Dining
      const capitalOneDining = mapCapitalOneCategory('Dining');
      const chaseDining = mapChaseCategory('Food & Drink');

      expect(capitalOneDining).toBe('Food & Dining');
      expect(chaseDining).toBe('Food & Dining');
      expect(capitalOneDining).toBe(chaseDining);
    });

    it('should produce consistent results for gas/automotive across banks', () => {
      const capitalOneGas = mapCapitalOneCategory('Gas/Automotive');
      const chaseGas = mapChaseCategory('Gas');

      expect(capitalOneGas).toBe('Transportation');
      expect(chaseGas).toBe('Transportation');
      expect(capitalOneGas).toBe(chaseGas);
    });
  });
});
