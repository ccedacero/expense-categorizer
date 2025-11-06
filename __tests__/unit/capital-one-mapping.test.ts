/**
 * Capital One Category Mapping Tests
 *
 * Verify that Capital One categories are correctly mapped to our app categories
 */

import { describe, it, expect } from 'vitest';
import { mapCapitalOneCategory } from '../../lib/capital-one-category-mapping';

describe('mapCapitalOneCategory', () => {
  it('should map dining categories', () => {
    expect(mapCapitalOneCategory('Dining')).toBe('Food & Dining');
    expect(mapCapitalOneCategory('Restaurants')).toBe('Food & Dining');
  });

  it('should map transportation categories', () => {
    expect(mapCapitalOneCategory('Gas/Automotive')).toBe('Transportation');
    expect(mapCapitalOneCategory('Gas')).toBe('Transportation');
    expect(mapCapitalOneCategory('Automotive')).toBe('Transportation');
    expect(mapCapitalOneCategory('Parking')).toBe('Transportation');
  });

  it('should map healthcare categories', () => {
    expect(mapCapitalOneCategory('Health Care')).toBe('Healthcare');
    expect(mapCapitalOneCategory('Healthcare')).toBe('Healthcare');
    expect(mapCapitalOneCategory('Medical')).toBe('Healthcare');
    expect(mapCapitalOneCategory('Pharmacy')).toBe('Healthcare');
  });

  it('should map travel categories', () => {
    expect(mapCapitalOneCategory('Airfare')).toBe('Travel');
    expect(mapCapitalOneCategory('Lodging')).toBe('Travel');
    expect(mapCapitalOneCategory('Hotels')).toBe('Travel');
    expect(mapCapitalOneCategory('Car Rental')).toBe('Travel');
    expect(mapCapitalOneCategory('Other Travel')).toBe('Travel');
  });

  it('should map bills and utilities', () => {
    expect(mapCapitalOneCategory('Phone/Cable')).toBe('Bills & Utilities');
    expect(mapCapitalOneCategory('Internet')).toBe('Bills & Utilities');
    expect(mapCapitalOneCategory('Utilities')).toBe('Bills & Utilities');
    expect(mapCapitalOneCategory('Insurance')).toBe('Bills & Utilities');
  });

  it('should map payment categories', () => {
    expect(mapCapitalOneCategory('Payment/Credit')).toBe('Payment');
    expect(mapCapitalOneCategory('Payment')).toBe('Payment');
    expect(mapCapitalOneCategory('Payments')).toBe('Payment');
  });

  it('should map merchandise to shopping by default', () => {
    expect(mapCapitalOneCategory('Merchandise')).toBe('Shopping');
    expect(mapCapitalOneCategory('Shopping')).toBe('Shopping');
    expect(mapCapitalOneCategory('Retail')).toBe('Shopping');
  });

  it('should map merchandise to groceries for grocery stores', () => {
    expect(mapCapitalOneCategory('Merchandise', 'WHOLE FOODS MARKET')).toBe('Groceries');
    expect(mapCapitalOneCategory('Merchandise', 'TRADER JOE S #535')).toBe('Groceries');
    expect(mapCapitalOneCategory('Merchandise', 'HONEST WEIGHT FOOD CO-OP')).toBe('Groceries');
    expect(mapCapitalOneCategory('Merchandise', 'MARKET32 PCHOPPER #023')).toBe('Groceries');
    expect(mapCapitalOneCategory('Merchandise', 'SAMSCLUB #6440')).toBe('Groceries');
    expect(mapCapitalOneCategory('Merchandise', 'COSTCO WHSE #0230')).toBe('Groceries');
  });

  it('should keep merchandise as shopping for non-grocery stores', () => {
    expect(mapCapitalOneCategory('Merchandise', 'LOWES #01784*')).toBe('Shopping');
    expect(mapCapitalOneCategory('Merchandise', 'THE HOME DEPOT #1262')).toBe('Shopping');
    expect(mapCapitalOneCategory('Merchandise', 'AMAZON.COM')).toBe('Shopping');
    expect(mapCapitalOneCategory('Merchandise', 'TARGET')).toBe('Shopping');
  });

  it('should map other categories', () => {
    expect(mapCapitalOneCategory('Entertainment')).toBe('Entertainment');
    expect(mapCapitalOneCategory('Education')).toBe('Education');
    expect(mapCapitalOneCategory('Other')).toBe('Other');
    // NOTE: "Professional Services" is intentionally NOT mapped (too broad)
    // It includes mortgages, contractors, sewer, tax software, etc.
    // Expert rules will handle categorization based on merchant name
    expect(mapCapitalOneCategory('Professional Services')).toBe(null);
    expect(mapCapitalOneCategory('Other Services')).toBe('Other');
    expect(mapCapitalOneCategory('Fee/Interest Charge')).toBe('Other');
  });

  it('should handle null and empty categories', () => {
    expect(mapCapitalOneCategory(null)).toBe(null);
    expect(mapCapitalOneCategory(undefined)).toBe(null);
    expect(mapCapitalOneCategory('')).toBe(null);
    expect(mapCapitalOneCategory('  ')).toBe(null);
  });

  it('should return null for unmapped categories', () => {
    expect(mapCapitalOneCategory('Unknown Category')).toBe(null);
    expect(mapCapitalOneCategory('RandomStuff')).toBe(null);
  });
});
