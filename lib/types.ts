/**
 * Core type definitions for the expense categorizer
 */

export type Category =
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Travel'
  | 'Groceries'
  | 'Household'  // Home maintenance, repairs, services
  | 'Education'  // Books, courses, learning materials
  | 'Income'
  | 'Payment'    // Credit card payments, loan payments
  | 'Transfer'   // Moving money between your own accounts
  | 'Other';

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category?: Category;
  originalCategory?: string;  // Original category from bank CSV (e.g., Chase "Food & Drink")
  type?: string;  // Transaction type from bank CSV (e.g., "Sale", "Payment")
}

export interface CategorizedTransaction extends Transaction {
  category: Category;
  confidence?: number; // 0-1 score from AI
}

export interface CategorySummary {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: string;
}

export interface CategorizationResult {
  transactions: CategorizedTransaction[];
  summary: CategorySummary[];
  totalExpenses: number;
  totalIncome: number;
  cacheStats?: CacheStats; // For monitoring cost savings
}

export interface ParseResult {
  transactions: Transaction[];
  errors: string[];
}
