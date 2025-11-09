/**
 * Export utilities
 *
 * Export categorized transactions to CSV
 */

import { CategorizedTransaction } from './types';
import { RecurringAnalysis } from './recurring-detector';

/**
 * Convert transactions to CSV string
 * Handles split transactions by creating separate rows for each split
 * Optionally includes recurring subscription summary at the top
 */
export function exportToCSV(
  transactions: CategorizedTransaction[],
  recurring?: RecurringAnalysis
): string {
  if (transactions.length === 0) {
    return '';
  }

  let csv = '';

  // Add recurring subscription summary if available
  if (recurring && recurring.recurring.length > 0) {
    csv += '=== RECURRING SUBSCRIPTIONS SUMMARY ===\n';
    csv += `Total Monthly Subscriptions:,$${recurring.totalMonthlySpend.toFixed(2)}\n`;
    csv += `Total Annual Subscriptions:,$${recurring.totalAnnualSpend.toFixed(2)}\n`;
    csv += `Total Annual Cost (all recurring):,$${(recurring.totalAnnualSpend + recurring.totalMonthlySpend * 12).toFixed(2)}\n`;
    csv += `Number of Recurring Charges:,${recurring.recurring.length}\n`;
    if (recurring.hiddenCount > 0) {
      csv += `Small Charges (under $20/mo):,${recurring.hiddenCount}\n`;
    }
    csv += '\n';

    // Add detailed subscription list
    csv += 'RECURRING CHARGES DETAIL\n';
    csv += 'Merchant,Frequency,Average Amount,Occurrences,Total Spent,Next Expected Date\n';
    for (const sub of recurring.recurring) {
      const nextDate = sub.nextExpectedDate || 'N/A';
      csv += `"${sub.merchant}",${sub.frequency},$${sub.averageAmount.toFixed(2)},${sub.occurrences},$${sub.totalSpent.toFixed(2)},${nextDate}\n`;
    }
    csv += '\n';
  }

  // CSV header for transactions
  csv += '=== ALL TRANSACTIONS ===\n';
  const header = 'Date,Description,Amount,Category,Confidence,IsSplit\n';
  csv += header;

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

  csv += rows.join('\n');
  return csv;
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
 * Export to QuickBooks IIF format
 * IIF (Intuit Interchange Format) is a tab-delimited format used by QuickBooks
 */
export function exportToQuickBooksIIF(transactions: CategorizedTransaction[]): string {
  if (transactions.length === 0) {
    return '';
  }

  let iif = '!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO\n';
  iif += '!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO\n';
  iif += '!ENDTRNS\n';

  transactions.forEach((t, index) => {
    const amount = Math.abs(t.amount);
    const account = t.amount < 0 ? 'Expenses' : 'Income';

    // Main transaction line
    iif += `TRNS\t${index + 1}\tCHECK\t${t.date}\tChecking\t${escapeCsvValue(t.description)}\t${t.category}\t${t.amount < 0 ? -amount : amount}\t\t${escapeCsvValue(t.description)}\n`;

    // Split line (offsetting entry)
    iif += `SPL\t${index + 1}\tCHECK\t${t.date}\t${account}:${t.category}\t${escapeCsvValue(t.description)}\t${t.category}\t${t.amount > 0 ? -amount : amount}\t\t${escapeCsvValue(t.description)}\n`;

    iif += 'ENDTRNS\n';
  });

  return iif;
}

/**
 * Export to Xero CSV format
 * Xero uses a simple CSV format for bank transactions
 */
export function exportToXeroCSV(transactions: CategorizedTransaction[]): string {
  if (transactions.length === 0) {
    return '';
  }

  let csv = '*Date,*Amount,Payee,Description,Reference,*Check Number,Tax Type,Tax Amount\n';

  transactions.forEach((t) => {
    const taxType = 'Tax Exempt';
    const taxAmount = '0.00';
    const checkNumber = '';

    csv += `${t.date},${t.amount},"${escapeCsvValue(t.description)}","${t.category}","${escapeCsvValue(t.description)}",${checkNumber},${taxType},${taxAmount}\n`;
  });

  return csv;
}

/**
 * Export to Wave Accounting CSV format
 * Wave uses a simple CSV format similar to generic CSV
 */
export function exportToWaveCSV(transactions: CategorizedTransaction[]): string {
  if (transactions.length === 0) {
    return '';
  }

  let csv = 'Transaction Date,Description,Amount,Currency,Category\n';

  transactions.forEach((t) => {
    const category = t.category === 'Food & Dining' ? 'Meals and Entertainment' : t.category;
    csv += `${t.date},"${escapeCsvValue(t.description)}",${t.amount},USD,"${category}"\n`;
  });

  return csv;
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

/**
 * Trigger browser download of any text file (CSV, IIF, etc.)
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
