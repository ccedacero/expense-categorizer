'use client';

import { useState } from 'react';
import { CategorizedTransaction } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants';

interface ResultsTableProps {
  transactions: CategorizedTransaction[];
}

export default function ResultsTable({ transactions }: ResultsTableProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Set<number>>(new Set());

  const handleFeedback = (index: number, transaction: CategorizedTransaction) => {
    // In production, send to analytics or backend (without PII)
    console.log('Feedback received:', {
      // Don't log actual description (may contain sensitive info)
      category: transaction.category,
      confidence: transaction.confidence,
      timestamp: new Date().toISOString(),
    });

    // Mark as submitted
    setFeedbackSubmitted(new Set(feedbackSubmitted).add(index));

    // Show user confirmation
    alert('Thank you for your feedback! This helps improve our AI categorization.');
  };
  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-lg">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Feedback
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((transaction, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {transaction.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                <span
                  className={
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }
                >
                  ${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white font-medium"
                  style={{
                    backgroundColor: CATEGORY_COLORS[transaction.category],
                  }}
                >
                  <span>{CATEGORY_ICONS[transaction.category]}</span>
                  {transaction.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                {feedbackSubmitted.has(index) ? (
                  <span className="text-green-600 text-xs">✓ Thanks!</span>
                ) : (
                  <button
                    onClick={() => handleFeedback(index, transaction)}
                    className="text-gray-400 hover:text-blue-600 transition-colors text-xs"
                    title="Report incorrect category"
                  >
                    Wrong?
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
