/**
 * Tests for Excel (.xlsx, .xls) parser
 */

import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseXLSX, isValidXLSXFile } from '../xlsx-parser';

describe('xlsx-parser', () => {
  describe('parseXLSX', () => {
    it('should parse a valid Excel file with transaction data', () => {
      // Create a mock Excel workbook
      const mockData = [
        ['Date', 'Description', 'Amount'],
        ['2024-01-15', 'Starbucks', '-5.45'],
        ['2024-01-16', 'Salary', '3500.00'],
        ['2024-01-17', 'Walmart', '-125.50'],
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(mockData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

      // Convert to ArrayBuffer
      const excelBuffer = XLSX.write(workbook, {
        type: 'array',
        bookType: 'xlsx',
      });

      // Parse the Excel file
      const result = parseXLSX(excelBuffer);

      // Should return rawCSV for further processing
      expect(result.rawCSV).toBeDefined();
      expect(result.rawCSV).toContain('Date');
      expect(result.rawCSV).toContain('Starbucks');
      expect(result.rawCSV).toContain('Salary');
      expect(result.format).toBe('excel');
      expect(result.errors).toEqual([]);
    });

    it('should handle empty Excel file', () => {
      // Create an empty Excel workbook
      const worksheet = XLSX.utils.aoa_to_sheet([[]]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const excelBuffer = XLSX.write(workbook, {
        type: 'array',
        bookType: 'xlsx',
      });

      const result = parseXLSX(excelBuffer);

      expect(result.transactions).toEqual([]);
      expect(result.errors).toContain('Excel sheet is empty');
    });

    it('should handle Excel file with no sheets', () => {
      // Create a workbook with no sheets (edge case)
      const workbook = XLSX.utils.book_new();

      const excelBuffer = XLSX.write(workbook, {
        type: 'array',
        bookType: 'xlsx',
      });

      const result = parseXLSX(excelBuffer);

      expect(result.transactions).toEqual([]);
      expect(result.errors).toContain('No sheets found in Excel file');
    });

    it('should handle corrupted Excel file', () => {
      // Create invalid ArrayBuffer
      const invalidBuffer = new Uint8Array([0, 1, 2, 3, 4, 5]).buffer;

      const result = parseXLSX(invalidBuffer);

      expect(result.transactions).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Failed to parse Excel file');
    });
  });

  describe('isValidXLSXFile', () => {
    it('should return true for valid Excel file', () => {
      const mockData = [['Header1', 'Header2'], ['Value1', 'Value2']];
      const worksheet = XLSX.utils.aoa_to_sheet(mockData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const excelBuffer = XLSX.write(workbook, {
        type: 'array',
        bookType: 'xlsx',
      });

      expect(isValidXLSXFile(excelBuffer)).toBe(true);
    });

    it('should return false for invalid Excel file', () => {
      const invalidBuffer = new Uint8Array([0, 1, 2, 3]).buffer;
      expect(isValidXLSXFile(invalidBuffer)).toBe(false);
    });
  });
});
