/**
 * Export utilities
 *
 * Export categorized transactions to CSV
 */

import { CategorizedTransaction } from './types';

/**
 * Convert transactions to CSV string
 */
export function exportToCSV(transactions: CategorizedTransaction[]): string {
  if (transactions.length === 0) {
    return '';
  }

  // CSV header
  const header = 'Date,Description,Amount,Category,Confidence\n';

  // CSV rows
  const rows = transactions
    .map(t => {
      const confidence = t.confidence ? (t.confidence * 100).toFixed(0) + '%' : 'N/A';
      return `${t.date},"${escapeCsvValue(t.description)}",${t.amount},${t.category},${confidence}`;
    })
    .join('\n');

  return header + rows;
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
