/**
 * Chase Category Mapping
 *
 * Maps Chase's built-in category names to our app's category names.
 * This allows us to leverage the categorization that Chase already provides.
 */

import { Category } from './types';

/**
 * Map Chase category names to our app categories
 *
 * Examples from Chase CSV:
 * - "Food & Drink" -> "Food & Dining"
 * - "Gas" -> "Transportation"
 * - "Home" -> "Shopping" (household items)
 */
export const CHASE_CATEGORY_MAP: Record<string, Category> = {
  // Food categories
  'Food & Drink': 'Food & Dining',
  'Groceries': 'Groceries',

  // Shopping & Home
  'Shopping': 'Shopping',
  'Home': 'Household',  // Home improvement, maintenance, services

  // Transportation
  'Gas': 'Transportation',
  'Automotive': 'Transportation',
  'Travel': 'Travel',

  // Bills & Utilities
  'Bills & Utilities': 'Bills & Utilities',

  // Healthcare
  'Health & Wellness': 'Healthcare',
  'Healthcare': 'Healthcare',

  // Entertainment
  'Entertainment': 'Entertainment',

  // Personal & Services
  'Personal': 'Other',  // Personal care
  // NOTE: "Professional Services" intentionally NOT mapped here
  // Both Chase and Capital One use this category, but it's too broad.
  // Let it fall through to expert rules for accurate categorization.
  'Fees & Adjustments': 'Other',  // Bank fees

  // Gifts
  'Gifts & Donations': 'Other',
};

/**
 * Map a Chase category to our app category
 * Returns null if no mapping exists
 */
export function mapChaseCategory(chaseCategory: string | undefined | null): Category | null {
  if (!chaseCategory || chaseCategory.trim() === '') {
    return null;
  }

  const trimmed = chaseCategory.trim();
  return CHASE_CATEGORY_MAP[trimmed] || null;
}
