/**
 * Capital One Category Mapping
 *
 * Maps Capital One's built-in category names to our app's category names.
 * This allows us to leverage the categorization that Capital One already provides.
 */

import { Category } from './types';

/**
 * Map Capital One category names to our app categories
 *
 * Examples from Capital One CSV:
 * - "Dining" -> "Food & Dining"
 * - "Gas/Automotive" -> "Transportation"
 * - "Merchandise" -> "Shopping" (unless it's a grocery store)
 * - "Payment/Credit" -> "Payment"
 */
export const CAPITAL_ONE_CATEGORY_MAP: Record<string, Category> = {
  // Food categories
  'Dining': 'Food & Dining',
  'Restaurants': 'Food & Dining',
  'Grocery': 'Groceries',
  'Groceries': 'Groceries',

  // Transportation
  'Gas/Automotive': 'Transportation',
  'Gas': 'Transportation',
  'Automotive': 'Transportation',
  'Parking': 'Transportation',

  // Healthcare
  'Health Care': 'Healthcare',
  'Healthcare': 'Healthcare',
  'Medical': 'Healthcare',
  'Pharmacy': 'Healthcare',

  // Shopping & Merchandise
  'Merchandise': 'Shopping',  // General merchandise defaults to Shopping
  'Shopping': 'Shopping',
  'Retail': 'Shopping',

  // Travel
  'Airfare': 'Travel',
  'Lodging': 'Travel',
  'Hotels': 'Travel',
  'Car Rental': 'Travel',
  'Other Travel': 'Travel',
  'Travel': 'Travel',

  // Bills & Utilities
  'Phone/Cable': 'Bills & Utilities',
  'Internet': 'Bills & Utilities',
  'Utilities': 'Bills & Utilities',
  'Insurance': 'Bills & Utilities',

  // Entertainment
  'Entertainment': 'Entertainment',
  'Movies': 'Entertainment',

  // Education
  'Education': 'Education',

  // Payments & Transfers
  'Payment/Credit': 'Payment',
  'Payment': 'Payment',
  'Payments': 'Payment',
  'Fees Charged': 'Other',
  'Fee/Interest Charge': 'Other',

  // Services
  // NOTE: "Professional Services" and "Services" are TOO BROAD in Capital One's system
  // They include: mortgages, contractors, sewer, tax software, HVAC, plumbing, etc.
  // We intentionally DON'T map them here - let expert rules handle it
  // Expert rules will properly categorize service providers like HVAC/plumbing as "Household"
  'Other Services': 'Other',

  // Miscellaneous
  'Other': 'Other',
};

/**
 * Map a Capital One category to our app category
 * Returns null if no mapping exists
 *
 * Special handling for "Merchandise":
 * - Grocery stores -> "Groceries"
 * - Everything else -> "Shopping"
 */
export function mapCapitalOneCategory(
  capitalOneCategory: string | undefined | null,
  merchantDescription?: string
): Category | null {
  if (!capitalOneCategory || capitalOneCategory.trim() === '') {
    return null;
  }

  const trimmed = capitalOneCategory.trim();

  // Special handling for "Merchandise" - check if it's a grocery store
  if (trimmed === 'Merchandise' && merchantDescription) {
    const desc = merchantDescription.toLowerCase();
    const groceryKeywords = [
      'market', 'food', 'grocery', 'supermarket', 'produce',
      'whole foods', 'trader joe', 'wegmans', 'shoprite',
      'price chopper', 'hannaford', 'stop & shop', 'food co-op',
      'honest weight', 'costco', 'sams', 'bj\'s wholesale'
    ];

    if (groceryKeywords.some(keyword => desc.includes(keyword))) {
      return 'Groceries';
    }
  }

  return CAPITAL_ONE_CATEGORY_MAP[trimmed] || null;
}
