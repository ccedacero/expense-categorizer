'use client';

import { CategorizedTransaction } from '@/lib/types';
import { RecurringAnalysis } from '@/lib/recurring-detector';
import { exportToCSV, downloadCSV } from '@/lib/exporter';

interface ExportButtonsProps {
  transactions: CategorizedTransaction[];
  recurring?: RecurringAnalysis;
}

export default function ExportButtons({ transactions, recurring }: ExportButtonsProps) {
  const handleDownloadCSV = () => {
    const csv = exportToCSV(transactions, recurring);
    downloadCSV(csv);
  };

  const handleCopyToClipboard = () => {
    const csv = exportToCSV(transactions, recurring);
    navigator.clipboard.writeText(csv);
    alert('✅ Copied to clipboard!');
  };

  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={handleDownloadCSV}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
      >
        <span>📥</span>
        Download CSV
      </button>
      <button
        onClick={handleCopyToClipboard}
        className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl"
      >
        <span>📋</span>
        Copy to Clipboard
      </button>
    </div>
  );
}
