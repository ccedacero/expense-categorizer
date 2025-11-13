/**
 * OFX/QFX File Parser (.ofx, .qfx)
 *
 * Parses Open Financial Exchange (OFX) files using regex
 * OFX is used by Quicken, Microsoft Money, and many banking institutions
 * QFX is Quicken's proprietary version (same format, different extension)
 */

import { Transaction, ParseResult } from '../types';

/**
 * Parse OFX/QFX file using regex (more reliable than external library)
 */
export function parseOFX(fileContent: string): ParseResult {
  const errors: string[] = [];
  const transactions: Transaction[] = [];

  try {
    // Check if file has valid OFX structure
    if (!isValidOFXFile(fileContent)) {
      return {
        transactions: [],
        errors: [
          'Invalid OFX file structure',
          'Could not find OFX transaction data',
          'Tip: Make sure this is a valid OFX or QFX file from your bank',
        ],
      };
    }

    // Extract all STMTTRN blocks (statement transactions)
    const transactionBlocks = extractTransactionBlocks(fileContent);

    if (transactionBlocks.length === 0) {
      return {
        transactions: [],
        errors: ['No transactions found in OFX file'],
      };
    }

    // Parse each transaction block
    transactionBlocks.forEach((block, index) => {
      try {
        const transaction = parseTransactionBlock(block, index);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        errors.push(
          `Row ${index + 1}: ${error instanceof Error ? error.message : 'Parse error'}`
        );
      }
    });

    if (transactions.length === 0 && errors.length === 0) {
      return {
        transactions: [],
        errors: ['No valid transactions could be parsed from OFX file'],
      };
    }

    return {
      transactions,
      errors,
      format: 'ofx',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse OFX file';
    return {
      transactions: [],
      errors: [
        'Failed to parse OFX/QFX file',
        message,
        'Tip: Make sure this is a valid OFX or QFX file exported from your bank or Quicken',
      ],
    };
  }
}

/**
 * Extract all STMTTRN blocks from OFX content
 */
function extractTransactionBlocks(content: string): string[] {
  const blocks: string[] = [];
  const regex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;

  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1]);
  }

  return blocks;
}

/**
 * Parse a single transaction block
 */
function parseTransactionBlock(block: string, index: number): Transaction | null {
  // Extract transaction type
  const typeMatch = block.match(/<TRNTYPE>([^\n<]+)/i);
  const type = typeMatch ? typeMatch[1].trim() : undefined;

  // Extract date
  const dateMatch = block.match(/<DTPOSTED>([^\n<]+)/i);
  if (!dateMatch) {
    throw new Error('Missing DTPOSTED (date) field');
  }
  const dateStr = dateMatch[1].trim();
  const date = parseOFXDate(dateStr);
  if (!date) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  // Extract amount
  const amountMatch = block.match(/<TRNAMT>([^\n<]+)/i);
  if (!amountMatch) {
    throw new Error('Missing TRNAMT (amount) field');
  }
  const amountStr = amountMatch[1].trim();
  const amount = parseFloat(amountStr);
  if (isNaN(amount)) {
    throw new Error(`Invalid amount: ${amountStr}`);
  }

  // Extract description (NAME or MEMO, prefer NAME)
  const nameMatch = block.match(/<NAME>([^\n<]+)/i);
  const memoMatch = block.match(/<MEMO>([^\n<]+)/i);
  const description = nameMatch ? nameMatch[1].trim() : memoMatch ? memoMatch[1].trim() : 'Unknown Transaction';

  return {
    date,
    description,
    amount,
    type,
  };
}

/**
 * Parse OFX date format (YYYYMMDD or YYYYMMDDHHMMSS[.XXX][+/-TZ])
 * Examples:
 * - 20241115
 * - 20241115120000
 * - 20241115120000.000[-5:EST]
 */
function parseOFXDate(dateStr: string): string | null {
  if (!dateStr) return null;

  // Remove timezone and milliseconds (everything after the date/time)
  const cleanedDate = dateStr.split('[')[0].split('.')[0];

  // Extract YYYYMMDD (first 8 characters)
  if (cleanedDate.length < 8) return null;

  const year = cleanedDate.substring(0, 4);
  const month = cleanedDate.substring(4, 6);
  const day = cleanedDate.substring(6, 8);

  // Validate date components
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);

  if (
    isNaN(yearNum) ||
    isNaN(monthNum) ||
    isNaN(dayNum) ||
    monthNum < 1 ||
    monthNum > 12 ||
    dayNum < 1 ||
    dayNum > 31
  ) {
    return null;
  }

  // Return in YYYY-MM-DD format
  return `${year}-${month}-${day}`;
}

/**
 * Validate that file is actually an OFX file
 */
export function isValidOFXFile(fileContent: string): boolean {
  // OFX files have specific markers
  const trimmed = fileContent.trim();
  return (
    trimmed.includes('<OFX>') ||
    trimmed.includes('OFXHEADER:') ||
    trimmed.includes('DATA:OFXSGML') ||
    trimmed.includes('<STMTTRN>')
  );
}
