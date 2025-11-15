'use client';

import { useState, useCallback, useRef } from 'react';
import { SAMPLE_CSV } from '@/lib/constants';

interface UploadZoneProps {
  onDataSubmit: (data: string) => void;
  isProcessing: boolean;
}

export default function UploadZone({ onDataSubmit, isProcessing }: UploadZoneProps) {
  const [input, setInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFile = useCallback((file: File) => {
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInput(text);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      readFile(file);
    }
  }, [readFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  }, [readFile]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSubmit = () => {
    if (input.trim()) {
      onDataSubmit(input);
    }
  };

  const loadSample = () => {
    setInput(SAMPLE_CSV);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Prominent Try Demo CTA */}
      <div className="mb-6 text-center">
        <button
          onClick={loadSample}
          disabled={isProcessing}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span className="text-2xl">🎯</span>
          Try Demo with Sample Data
          <span className="text-2xl">✨</span>
        </button>
        <p className="text-sm text-gray-600 mt-2">
          See it in action instantly • No signup required
        </p>
      </div>

      <div className="text-center mb-4">
        <span className="text-gray-500 text-sm font-medium">OR UPLOAD YOUR OWN</span>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl">📊</div>
          <h2 className="text-xl font-semibold text-gray-800">
            Try with Your Bank CSV
          </h2>
          <p className="text-gray-600 text-center max-w-md">
            Works with Chase, Capital One, Wells Fargo, Bank of America, and any bank with CSV export
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />

          {/* Upload button */}
          <button
            onClick={handleUploadClick}
            disabled={isProcessing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
          >
            📁 Upload CSV File
          </button>

          {/* Separator */}
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <textarea
            className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Date,Description,Amount&#10;2024-01-15,Starbucks,-5.45&#10;2024-01-16,Salary,3500.00&#10;..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
          />

          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {isProcessing ? '✨ Categorizing Your Transactions...' : '✨ Categorize My Transactions - Free'}
          </button>
        </div>
      </div>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-500">
          💡 Tip: Export your transactions from your bank and paste them above
        </p>
        <p className="text-xs text-gray-400">
          🔒 Your data is processed in real-time and never stored. Transaction descriptions are sent to Anthropic AI for categorization. By using this service, you consent to our{' '}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
