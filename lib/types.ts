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
  | 'Business Expenses'  // Professional dues, licenses, associations
  | 'Charity/Donations'  // Nonprofit contributions, charitable giving
  | 'Gift Cards'  // Gift card purchases and prepaid card platforms
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

export interface SplitItem {
  amount: number;
  category: Category;
  description?: string; // Optional description for the split
}

export interface CategorizedTransaction extends Transaction {
  category: Category;
  confidence?: number; // 0-1 score from AI
  splits?: SplitItem[]; // Optional: if transaction is split across multiple categories
  isSplit?: boolean; // Flag to indicate this is a split transaction
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

export interface RecurringAnalysis {
  recurring: any[];
  groups: any[];
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  hiddenCount: number;
}

export interface CategorizationResult {
  transactions: CategorizedTransaction[];
  summary: CategorySummary[];
  totalExpenses: number;
  totalIncome: number;
  cacheStats?: CacheStats; // For monitoring cost savings
  recurring?: RecurringAnalysis; // Recurring transaction analysis
}

export type CSVFormat =
  | 'wells-fargo'
  | 'chase'
  | 'capital-one'
  | 'generic-csv'
  | 'plain-text'
  | 'unknown';

export interface ParseResult {
  transactions: Transaction[];
  errors: string[];
  format?: CSVFormat; // Detected CSV format/bank type
  hasCategories?: boolean; // Whether CSV included category column
}
