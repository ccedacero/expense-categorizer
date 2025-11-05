/**
 * Export utilities
 *
 * Export categorized transactions to CSV
 */

import { CategorizedTransaction } from './types';

/**
 * Convert transactions to CSV string
 * Handles split transactions by creating separate rows for each split
 */
export function exportToCSV(transactions: CategorizedTransaction[]): string {
  if (transactions.length === 0) {
    return '';
  }

  // CSV header
  const header = 'Date,Description,Amount,Category,Confidence,IsSplit\n';

  // CSV rows - expand split transactions into multiple rows
  const rows: string[] = [];

  for (const t of transactions) {
    const confidence = t.confidence ? (t.confidence * 100).toFixed(0) + '%' : 'N/A';

    if (t.isSplit && t.splits && t.splits.length > 0) {
      // Create a row for each split
      for (const split of t.splits) {
        const splitDesc = split.description
          ? `${t.description} - ${split.description}`
          : t.description;
        rows.push(
          `${t.date},"${escapeCsvValue(splitDesc)}",${split.amount},${split.category},${confidence},Yes`
        );
      }
    } else {
      // Regular transaction (not split)
      rows.push(
        `${t.date},"${escapeCsvValue(t.description)}",${t.amount},${t.category},${confidence},No`
      );
    }
  }

  return header + rows.join('\n');
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCsvValue(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return value.replace(/"/g, '""');
  }
  return value;
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csv: string, filename: string = 'categorized-expenses.csv'): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
