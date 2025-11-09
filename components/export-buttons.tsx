'use client';

import { useState } from 'react';
import { CategorizedTransaction } from '@/lib/types';
import { RecurringAnalysis } from '@/lib/recurring-detector';
import {
  exportToCSV,
  exportToQuickBooksIIF,
  exportToXeroCSV,
  exportToWaveCSV,
  downloadCSV,
  downloadFile,
} from '@/lib/exporter';

interface ExportButtonsProps {
  transactions: CategorizedTransaction[];
  recurring?: RecurringAnalysis;
}

type ExportFormat = 'csv' | 'quickbooks' | 'xero' | 'wave';

export default function ExportButtons({ transactions, recurring }: ExportButtonsProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDownload = () => {
    switch (selectedFormat) {
      case 'csv':
        const csv = exportToCSV(transactions, recurring);
        downloadCSV(csv);
        break;
      case 'quickbooks':
        const iif = exportToQuickBooksIIF(transactions);
        downloadFile(iif, 'categorized-expenses.iif', 'text/plain;charset=utf-8;');
        break;
      case 'xero':
        const xeroCSV = exportToXeroCSV(transactions);
        downloadFile(xeroCSV, 'categorized-expenses-xero.csv', 'text/csv;charset=utf-8;');
        break;
      case 'wave':
        const waveCSV = exportToWaveCSV(transactions);
        downloadFile(waveCSV, 'categorized-expenses-wave.csv', 'text/csv;charset=utf-8;');
        break;
    }
  };

  const handleCopyToClipboard = () => {
    const csv = exportToCSV(transactions, recurring);
    navigator.clipboard.writeText(csv);
    alert('✅ Copied to clipboard!');
  };

  const formatLabels: Record<ExportFormat, string> = {
    csv: 'Standard CSV',
    quickbooks: 'QuickBooks IIF',
    xero: 'Xero CSV',
    wave: 'Wave Accounting',
  };

  const formatIcons: Record<ExportFormat, string> = {
    csv: '📊',
    quickbooks: '💼',
    xero: '🔷',
    wave: '🌊',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Export to Accounting Software
      </h3>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {/* Format Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-blue-500 hover:bg-blue-50 transition-all shadow-md min-w-[220px] justify-between"
          >
            <span className="flex items-center gap-2">
              <span>{formatIcons[selectedFormat]}</span>
              {formatLabels[selectedFormat]}
            </span>
            <span className={`transform transition-transform ${showDropdown ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
              {(Object.keys(formatLabels) as ExportFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => {
                    setSelectedFormat(format);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                    selectedFormat === format ? 'bg-blue-100 font-semibold' : ''
                  }`}
                >
                  <span>{formatIcons[format]}</span>
                  <span>{formatLabels[format]}</span>
                  {selectedFormat === format && <span className="ml-auto text-blue-600">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <span>📥</span>
          Download {formatLabels[selectedFormat]}
        </button>

        {/* Copy Button */}
        <button
          onClick={handleCopyToClipboard}
          className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <span>📋</span>
          Copy CSV
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">
        Export in formats compatible with QuickBooks, Xero, Wave, and more
      </p>
    </div>
  );
}
