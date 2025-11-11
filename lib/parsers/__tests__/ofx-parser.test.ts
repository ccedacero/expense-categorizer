/**
 * Tests for OFX/QFX parser
 */

import { describe, it, expect } from 'vitest';
import { parseOFX, isValidOFXFile } from '../ofx-parser';

describe('ofx-parser', () => {
  describe('parseOFX', () => {
    it('should parse a valid OFX file with transactions', () => {
      const mockOFX = `
OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<DTSERVER>20241115120000
<LANGUAGE>ENG
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>USD
<BANKACCTFROM>
<BANKID>123456789
<ACCTID>0987654321
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>20240101120000
<DTEND>20240131120000
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240115120000
<TRNAMT>-5.45
<FITID>202401151
<NAME>STARBUCKS #1234
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20240116120000
<TRNAMT>3500.00
<FITID>202401162
<NAME>PAYROLL DEPOSIT
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240117120000
<TRNAMT>-125.50
<FITID>202401173
<NAME>WALMART SUPERCENTER
<MEMO>Groceries
</STMTTRN>
</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>5000.00
<DTASOF>20240131120000
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>
`;

      const result = parseOFX(mockOFX);

      expect(result.transactions.length).toBe(3);
      expect(result.format).toBe('ofx');
      expect(result.errors).toEqual([]);

      // Check first transaction
      expect(result.transactions[0].date).toBe('2024-01-15');
      expect(result.transactions[0].description).toBe('STARBUCKS #1234');
      expect(result.transactions[0].amount).toBe(-5.45);
      expect(result.transactions[0].type).toBe('DEBIT');

      // Check second transaction
      expect(result.transactions[1].date).toBe('2024-01-16');
      expect(result.transactions[1].description).toBe('PAYROLL DEPOSIT');
      expect(result.transactions[1].amount).toBe(3500.00);
      expect(result.transactions[1].type).toBe('CREDIT');

      // Check third transaction (with memo)
      expect(result.transactions[2].date).toBe('2024-01-17');
      expect(result.transactions[2].description).toBe('WALMART SUPERCENTER');
      expect(result.transactions[2].amount).toBe(-125.50);
    });

    it('should handle OFX file with no transactions', () => {
      const mockOFX = `
<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>
`;

      const result = parseOFX(mockOFX);

      expect(result.transactions).toEqual([]);
      expect(result.errors).toContain('No transactions found in OFX file');
    });

    it('should handle invalid OFX structure', () => {
      const invalidOFX = `
<OFX>
<INVALID>
</INVALID>
</OFX>
`;

      const result = parseOFX(invalidOFX);

      expect(result.transactions).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid OFX file structure');
    });

    it('should handle OFX with invalid date', () => {
      const mockOFX = `
<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>INVALID_DATE
<TRNAMT>-5.45
<FITID>1
<NAME>Test Transaction
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>
`;

      const result = parseOFX(mockOFX);

      expect(result.transactions).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid date');
    });

    it('should handle OFX with invalid amount', () => {
      const mockOFX = `
<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240115
<TRNAMT>INVALID_AMOUNT
<FITID>1
<NAME>Test Transaction
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>
`;

      const result = parseOFX(mockOFX);

      expect(result.transactions).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid amount');
    });
  });

  describe('isValidOFXFile', () => {
    it('should return true for valid OFX file with OFX tag', () => {
      const ofx = '<OFX><BANKMSGSRSV1></BANKMSGSRSV1></OFX>';
      expect(isValidOFXFile(ofx)).toBe(true);
    });

    it('should return true for valid OFX file with OFXHEADER', () => {
      const ofx = 'OFXHEADER:100\nDATA:OFXSGML\n<OFX></OFX>';
      expect(isValidOFXFile(ofx)).toBe(true);
    });

    it('should return true for valid OFX file with DATA:OFXSGML', () => {
      const ofx = 'DATA:OFXSGML\nVERSION:102\n<OFX></OFX>';
      expect(isValidOFXFile(ofx)).toBe(true);
    });

    it('should return false for non-OFX content', () => {
      const notOFX = 'Date,Description,Amount\n2024-01-15,Test,-5.45';
      expect(isValidOFXFile(notOFX)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidOFXFile('')).toBe(false);
    });
  });
});
