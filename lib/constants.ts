/**
 * Constants and configuration
 */

import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Travel',
  'Groceries',
  'Household',
  'Education',
  'Income',
  'Payment',
  'Transfer',
  'Other',
];

// Category colors for charts and UI
export const CATEGORY_COLORS: Record<Category, string> = {
  'Food & Dining': '#FF6B6B',
  'Transportation': '#4ECDC4',
  'Shopping': '#95E1D3',
  'Bills & Utilities': '#FFE66D',
  'Entertainment': '#C7B8EA',
  'Healthcare': '#FF8B94',
  'Travel': '#6A4C93',
  'Groceries': '#51CF66',
  'Household': '#7048E8',    // Dark purple - home services and maintenance
  'Education': '#1C7ED6',    // Dark blue - learning and development
  'Income': '#37B24D',
  'Payment': '#FA5252',      // Red - money going out to pay debt
  'Transfer': '#748FFC',
  'Other': '#ADB5BD',
};

// Category emoji icons
export const CATEGORY_ICONS: Record<Category, string> = {
  'Food & Dining': '🍔',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Bills & Utilities': '💡',
  'Entertainment': '🎬',
  'Healthcare': '⚕️',
  'Travel': '✈️',
  'Groceries': '🛒',
  'Household': '🏠',      // House - home services and maintenance
  'Education': '📚',      // Books - learning and education
  'Income': '💰',
  'Payment': '💳',        // Credit card - represents paying off debt
  'Transfer': '🔄',
  'Other': '📌',
};

// Sample CSV for demo
export const SAMPLE_CSV = `Date,Description,Amount
2024-01-15,Starbucks Coffee,-5.45
2024-01-15,Uber to Office,-12.30
2024-01-16,Whole Foods Market,-87.32
2024-01-16,Netflix Subscription,-15.99
2024-01-17,Shell Gas Station,-45.00
2024-01-17,Spotify Premium,-9.99
2024-01-18,Amazon Purchase,-34.56
2024-01-18,Chipotle,-11.24
2024-01-19,Electric Bill,-120.45
2024-01-19,Payment Thank You - Credit Card,125.00
2024-01-19,Salary Deposit,3500.00
2024-01-20,CVS Pharmacy,-23.67
2024-01-20,Uber Eats,-28.90
2024-01-21,Venmo to Friend,50.00`;
