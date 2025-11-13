/**
 * Excel File Parser (.xlsx, .xls)
 *
 * Parses Excel files from banks that export in .xlsx/.xls format
 * Many banks (especially international ones) export statements as Excel files
 */

import * as XLSX from 'xlsx';
import { Transaction, ParseResult } from '../types';

/**
 * Parse Excel file (.xlsx or .xls)
 */
export function parseXLSX(fileContent: ArrayBuffer): ParseResult {
  const errors: string[] = [];
  const transactions: Transaction[] = [];

  try {
    // Read the Excel file
    const workbook = XLSX.read(fileContent, { type: 'array' });

    // Get the first sheet (most banks use only one sheet)
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { transactions: [], errors: ['No sheets found in Excel file'] };
    }

    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to CSV format, then use existing CSV parser logic
    const csvString = XLSX.utils.sheet_to_csv(worksheet, {
      blankrows: false,
      strip: true,
    });

    if (!csvString || csvString.trim().length === 0) {
      return { transactions: [], errors: ['Excel sheet is empty'] };
    }

    // Return as CSV string for the main parser to handle
    // This way we reuse all existing CSV parsing logic
    return {
      transactions: [],
      errors: [],
      rawCSV: csvString,
      format: 'excel',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse Excel file';
    return {
      transactions: [],
      errors: [
        'Failed to parse Excel file',
        message,
        'Tip: Make sure this is a valid .xlsx or .xls file exported from your bank',
      ],
    };
  }
}

/**
 * Validate that file is actually an Excel file
 */
export function isValidXLSXFile(fileContent: ArrayBuffer): boolean {
  try {
    const workbook = XLSX.read(fileContent, { type: 'array' });
    return workbook.SheetNames.length > 0;
  } catch {
    return false;
  }
}
