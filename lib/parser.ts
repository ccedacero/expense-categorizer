/**
 * Transaction Parser
 *
 * Parses CSV and plain text into transaction objects.
 * Handles multiple formats:
 * - CSV with headers (Date, Description, Amount)
 * - CSV without headers
 * - Plain text (tab/comma separated)
 * - Copy-pasted bank statements
 */

import Papa from 'papaparse';
import { Transaction, ParseResult } from './types';

/**
 * Main parser function
 */
export function parseTransactions(input: string): ParseResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { transactions: [], errors: ['Input is empty'] };
  }

  // Try parsing as CSV first
  const csvResult = parseCSV(trimmed);
  if (csvResult.transactions.length > 0) {
    return csvResult;
  }

  // Fall back to plain text parsing
  return parsePlainText(trimmed);
}

/**
 * Parse CSV format
 */
function parseCSV(input: string): ParseResult {
  const errors: string[] = [];
  const transactions: Transaction[] = [];

  const result = Papa.parse<string[]>(input, {
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    return { transactions: [], errors: result.errors.map(e => e.message) };
  }

  const rows = result.data;
  if (rows.length === 0) {
    return { transactions: [], errors: ['No data found'] };
  }

  // Check if first row is header
  const firstRow = rows[0];
  const hasHeader = isHeaderRow(firstRow);
  const dataRows = hasHeader ? rows.slice(1) : rows;

  // Detect column indices
  const indices = detectColumnIndices(hasHeader ? firstRow : dataRows[0]);

  dataRows.forEach((row, index) => {
    try {
      const transaction = parseRow(row, indices);
      if (transaction) {
        transactions.push(transaction);
      }
    } catch (error) {
      errors.push(`Row ${index + (hasHeader ? 2 : 1)}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  });

  return { transactions, errors };
}

/**
 * Parse plain text (tab or comma separated)
 */
function parsePlainText(input: string): ParseResult {
  const errors: string[] = [];
  const transactions: Transaction[] = [];

  const lines = input.split('\n').filter(line => line.trim());

  lines.forEach((line, index) => {
    try {
      // Try tab-separated first, then comma-separated
      const parts = line.includes('\t')
        ? line.split('\t').map(p => p.trim())
        : line.split(',').map(p => p.trim());

      if (parts.length < 3) {
        errors.push(`Line ${index + 1}: Not enough columns (expected 3, got ${parts.length})`);
        return;
      }

      const transaction = parseRow(parts, { date: 0, description: 1, amount: 2 });
      if (transaction) {
        transactions.push(transaction);
      }
    } catch (error) {
      errors.push(`Line ${index + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  });

  return { transactions, errors };
}

/**
 * Check if row looks like a header
 */
function isHeaderRow(row: string[]): boolean {
  const normalized = row.map(cell => cell.toLowerCase().trim());
  return (
    normalized.some(cell => cell.includes('date')) &&
    normalized.some(cell => cell.includes('desc') || cell.includes('merchant') || cell.includes('transaction')) &&
    // Accept either amount column OR debit/credit columns (Capital One format)
    (normalized.some(cell => cell.includes('amount') || cell.includes('sum') || cell.includes('total')) ||
     (normalized.includes('debit') && normalized.includes('credit')))
  );
}

/**
 * Detect which columns contain date, description, amount, category, and type
 *
 * CAPITAL ONE FIX: Capital One has "Transaction Amount" AND "Balance" columns
 * Both are numeric, but we need to pick "Transaction Amount", not "Balance"
 *
 * CAPITAL ONE DEBIT/CREDIT: Some Capital One exports have separate Debit/Credit columns
 * We need to merge these into a single amount (Debit = negative, Credit = positive)
 */
function detectColumnIndices(row: string[]): {
  date: number;
  description: number;
  amount: number;
  category?: number;
  type?: number;
  debit?: number;
  credit?: number;
} {
  let dateIdx = -1;
  let amountIdx = -1;
  let descIdx = -1;
  let categoryIdx: number | undefined;
  let typeIdx: number | undefined;
  let debitIdx: number | undefined;
  let creditIdx: number | undefined;

  // PRIORITY DETECTION: Use header names first, then fallback to heuristics
  row.forEach((cell, idx) => {
    const normalized = cell.toLowerCase().trim();

    // Look for date column
    if (normalized.includes('date') || normalized.includes('posted')) {
      // Prefer "Transaction Date" over "Posted Date"
      if (dateIdx === -1 || normalized.includes('transaction')) {
        dateIdx = idx;
      }
    }

    // Look for amount column - PRIORITIZE by keyword match
    // CAPITAL ONE: Has "Transaction Amount" and "Balance" - we want Transaction Amount!
    if (normalized.includes('amount')) {
      // Strongly prefer "amount" in column name
      amountIdx = idx;
    } else if (normalized.includes('debit') || normalized.includes('credit')) {
      // Handle banks with separate debit/credit columns
      if (amountIdx === -1) amountIdx = idx;
    } else if (normalized.includes('sum') || normalized === 'total') {
      // Accept "sum" or exactly "total" (not "balance total")
      if (amountIdx === -1) amountIdx = idx;
    }
    // NOTE: We no longer use "balance" as an amount column indicator!

    // Look for description column
    // Prefer: payee > description > merchant > transaction
    if (normalized === 'payee' || normalized === 'merchant name') {
      // Strongly prefer "Payee" or "Merchant Name"
      descIdx = idx;
    } else if (normalized.includes('desc') || normalized.includes('merchant') || normalized.includes('transaction') && !normalized.includes('date') && !normalized.includes('amount')) {
      // Accept description/merchant/transaction if no better match
      if (descIdx === -1 || !row[descIdx]?.toLowerCase().includes('payee')) {
        descIdx = idx;
      }
    }

    // Look for category column (Chase CSV has this!)
    if (normalized === 'category') {
      categoryIdx = idx;
    }

    // Look for type column (Chase/Capital One: "Sale", "Payment", "Purchase", etc.)
    if (normalized === 'type' || normalized === 'transaction type') {
      typeIdx = idx;
    }

    // Look for separate Debit/Credit columns (Capital One format)
    if (normalized === 'debit') {
      debitIdx = idx;
    }
    if (normalized === 'credit') {
      creditIdx = idx;
    }
  });

  // FALLBACK: If no amount column found by header, use heuristic
  // But skip this if we have debit/credit columns (Capital One format)
  if (amountIdx === -1 && (debitIdx === undefined || creditIdx === undefined)) {
    row.forEach((cell, idx) => {
      const normalized = cell.toLowerCase().trim();

      // Skip if it's likely an account number or balance column
      if (normalized.includes('account') || normalized.includes('balance') || normalized.includes('card')) {
        return;
      }

      if (isLikelyAmount(cell) && amountIdx === -1) {
        amountIdx = idx;
      }
    });
  }

  // WELLS FARGO DETECTION: If no headers detected, check for Wells Fargo format
  // Wells Fargo format: Date, Amount, *, "", Description
  // Key indicators:
  // - Column 1 is numeric (amount)
  // - Column 2 is "*" or similar flag
  // - Description is in a later column (usually last non-empty)
  if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
    const wellsFargoFormat = detectWellsFargoFormat(row);
    if (wellsFargoFormat) {
      return wellsFargoFormat;
    }
  }

  // Default to standard order if detection still fails
  // But skip defaults if we have debit/credit columns
  const hasDebitCredit = debitIdx !== undefined && creditIdx !== undefined;
  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = 1;
  if (amountIdx === -1 && !hasDebitCredit) amountIdx = 2;

  return {
    date: dateIdx,
    description: descIdx,
    amount: amountIdx,
    category: categoryIdx,
    type: typeIdx,
    debit: debitIdx,
    credit: creditIdx,
  };
}

/**
 * Detect Wells Fargo CSV format
 * Format: Date, Amount, *, "", Description
 */
function detectWellsFargoFormat(row: string[]): {
  date: number;
  description: number;
  amount: number;
  category?: number;
  type?: number;
  debit?: number;
  credit?: number;
} | null {
  // Wells Fargo has at least 5 columns
  if (row.length < 5) {
    return null;
  }

  // Check if column 0 is date-like
  const col0 = row[0]?.trim();
  if (!col0 || !isLikelyDate(col0)) {
    return null;
  }

  // Check if column 1 is amount-like (numeric)
  const col1 = row[1]?.trim();
  if (!col1 || !isLikelyAmount(col1)) {
    return null;
  }

  // Check if column 2 is a flag (single character or short string)
  const col2 = row[2]?.trim();
  if (!col2 || col2.length > 3) {
    return null;
  }

  // Find the description column (last non-empty column with text content)
  let descIdx = -1;
  for (let i = row.length - 1; i >= 0; i--) {
    const cell = row[i]?.trim();
    // Description should be longer than a few characters and not be numeric
    if (cell && cell.length > 5 && !isLikelyAmount(cell) && !isLikelyDate(cell)) {
      descIdx = i;
      break;
    }
  }

  if (descIdx === -1) {
    return null;
  }

  // Found Wells Fargo format!
  return {
    date: 0,
    amount: 1,
    description: descIdx,
  };
}

/**
 * Check if string looks like a date
 */
function isLikelyDate(str: string): boolean {
  // Common date patterns
  const datePatterns = [
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,  // MM/DD/YYYY or M/D/YY
    /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
    /^\d{1,2}-\d{1,2}-\d{2,4}$/,    // MM-DD-YYYY
  ];

  return datePatterns.some(pattern => pattern.test(str.trim()));
}

/**
 * Check if string looks like an amount
 */
function isLikelyAmount(str: string): boolean {
  const cleaned = str.trim().replace(/[$,]/g, '');
  return !isNaN(parseFloat(cleaned)) && isFinite(Number(cleaned));
}

/**
 * Parse a single row into a transaction
 *
 * CAPITAL ONE FIX: Credit cards show purchases as positive and payments as negative
 * We need to flip this for expense tracking (purchases should be negative)
 *
 * CAPITAL ONE DEBIT/CREDIT: Handle separate Debit/Credit columns
 */
function parseRow(
  row: string[],
  indices: {
    date: number;
    description: number;
    amount: number;
    category?: number;
    type?: number;
    debit?: number;
    credit?: number;
  }
): Transaction | null {
  const dateStr = row[indices.date]?.trim();
  const description = row[indices.description]?.trim();

  // Handle separate Debit/Credit columns (Capital One format)
  let amount: number;
  if (indices.debit !== undefined && indices.credit !== undefined) {
    const debitStr = row[indices.debit]?.trim();
    const creditStr = row[indices.credit]?.trim();

    // At least one of debit or credit must have a value
    if (!debitStr && !creditStr) {
      return null;
    }

    // Parse debit as negative, credit as positive
    const debit = debitStr ? parseAmount(debitStr) : 0;
    const credit = creditStr ? parseAmount(creditStr) : 0;

    // Debits are expenses (negative), credits are income (positive)
    amount = credit - debit;
  } else {
    // Standard single amount column
    const amountStr = row[indices.amount]?.trim();

    if (!amountStr) {
      return null;
    }

    // Parse amount (handle negative, parentheses, currency symbols)
    amount = parseAmount(amountStr);
    if (isNaN(amount)) {
      throw new Error(`Invalid amount: "${amountStr}"`);
    }
  }

  if (!dateStr || !description) {
    return null;
  }

  // Validate date
  const date = parseDate(dateStr);

  // Extract optional category and type (from Chase/Capital One CSV)
  const originalCategory =
    indices.category !== undefined ? row[indices.category]?.trim() : undefined;
  const type = indices.type !== undefined ? row[indices.type]?.trim() : undefined;

  // NOTE: We no longer need aggressive sign-flipping logic for credit cards
  // because modern bank exports (including Capital One) use either:
  // 1. Separate Debit/Credit columns (handled above)
  // 2. Already have correct signs (Chase, BofA)
  //
  // The old logic was incorrectly flipping signs for ALL CSVs with a Type column,
  // which broke Chase checking accounts that also have Type columns.

  return {
    date,
    description,
    amount,
    originalCategory,
    type,
  };
}

/**
 * Parse amount string to number
 * Handles: -$123.45, ($123.45), $123.45, 123.45
 */
function parseAmount(str: string): number {
  let cleaned = str.trim();

  // Remove currency symbols
  cleaned = cleaned.replace(/[$€£¥]/g, '');

  // Handle parentheses as negative
  const isNegative = cleaned.startsWith('(') && cleaned.endsWith(')');
  if (isNegative) {
    cleaned = cleaned.slice(1, -1);
  }

  // Remove commas
  cleaned = cleaned.replace(/,/g, '');

  const num = parseFloat(cleaned);
  return isNegative ? -Math.abs(num) : num;
}

/**
 * Parse and normalize date string
 */
function parseDate(str: string): string {
  const trimmed = str.trim();

  // Try to parse with Date constructor
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]; // Return YYYY-MM-DD
  }

  // If that fails, try common formats manually
  // MM/DD/YYYY or M/D/YY
  const slashPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
  const slashMatch = trimmed.match(slashPattern);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // If all parsing fails, return as-is (will be caught by validation later if needed)
  return trimmed;
}
