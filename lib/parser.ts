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
    normalized.some(cell => cell.includes('amount') || cell.includes('sum') || cell.includes('total'))
  );
}

/**
 * Detect which columns contain date, description, amount, category, and type
 */
function detectColumnIndices(row: string[]): {
  date: number;
  description: number;
  amount: number;
  category?: number;
  type?: number;
} {
  let dateIdx = -1;
  let amountIdx = -1;
  let descIdx = -1;
  let categoryIdx: number | undefined;
  let typeIdx: number | undefined;

  row.forEach((cell, idx) => {
    const normalized = cell.toLowerCase().trim();

    // Look for date column
    if (normalized.includes('date') || isLikelyDate(cell)) {
      dateIdx = idx;
    }

    // Look for amount column
    if (normalized.includes('amount') || normalized.includes('sum') || normalized.includes('total') || isLikelyAmount(cell)) {
      amountIdx = idx;
    }

    // Look for description column
    if (normalized.includes('desc') || normalized.includes('merchant') || normalized.includes('transaction') || normalized.includes('name')) {
      descIdx = idx;
    }

    // Look for category column (Chase CSV has this!)
    if (normalized === 'category') {
      categoryIdx = idx;
    }

    // Look for type column (Chase CSV has "Sale", "Payment", etc.)
    if (normalized === 'type') {
      typeIdx = idx;
    }
  });

  // Default to standard order if detection fails
  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = 1;
  if (amountIdx === -1) amountIdx = 2;

  return {
    date: dateIdx,
    description: descIdx,
    amount: amountIdx,
    category: categoryIdx,
    type: typeIdx,
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
 */
function parseRow(
  row: string[],
  indices: {
    date: number;
    description: number;
    amount: number;
    category?: number;
    type?: number;
  }
): Transaction | null {
  const dateStr = row[indices.date]?.trim();
  const description = row[indices.description]?.trim();
  const amountStr = row[indices.amount]?.trim();

  if (!dateStr || !description || !amountStr) {
    return null;
  }

  // Parse amount (handle negative, parentheses, currency symbols)
  const amount = parseAmount(amountStr);
  if (isNaN(amount)) {
    throw new Error(`Invalid amount: "${amountStr}"`);
  }

  // Validate date
  const date = parseDate(dateStr);

  // Extract optional category and type (from Chase CSV)
  const originalCategory =
    indices.category !== undefined ? row[indices.category]?.trim() : undefined;
  const type = indices.type !== undefined ? row[indices.type]?.trim() : undefined;

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
