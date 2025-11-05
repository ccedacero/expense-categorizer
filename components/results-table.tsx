'use client';

import { useState } from 'react';
import { CategorizedTransaction, Category } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORIES } from '@/lib/constants';

interface ResultsTableProps {
  transactions: CategorizedTransaction[];
  onCategoryChange?: (index: number, newCategory: Category) => void;
}

export default function ResultsTable({ transactions, onCategoryChange }: ResultsTableProps) {
  const [editedTransactions, setEditedTransactions] = useState<Set<number>>(new Set());

  const handleCategoryChange = (index: number, newCategory: Category) => {
    // Mark as edited
    setEditedTransactions(new Set(editedTransactions).add(index));

    // Notify parent component
    if (onCategoryChange) {
      onCategoryChange(index, newCategory);
    }
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
              Confidence
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
                <div className="relative inline-block">
                  <select
                    value={transaction.category}
                    onChange={(e) => handleCategoryChange(index, e.target.value as Category)}
                    className="appearance-none cursor-pointer px-3 py-1 pr-8 rounded-full text-white font-medium border-2 border-transparent hover:border-white/30 focus:border-white/50 focus:outline-none transition-all"
                    style={{
                      backgroundColor: CATEGORY_COLORS[transaction.category],
                    }}
                    title="Click to change category"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-gray-800 text-white">
                        {CATEGORY_ICONS[cat]} {cat}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white text-xs">
                    ▼
                  </div>
                  <span className="ml-2 text-xs text-gray-400">
                    {CATEGORY_ICONS[transaction.category]}
                  </span>
                </div>
                {editedTransactions.has(index) && (
                  <span className="ml-2 text-xs text-blue-600 font-semibold">
                    ✓ Edited
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                {transaction.confidence ? (
                  <span
                    className={`text-xs ${
                      transaction.confidence >= 0.9
                        ? 'text-green-600'
                        : transaction.confidence >= 0.7
                        ? 'text-yellow-600'
                        : 'text-orange-600'
                    }`}
                    title="AI confidence score"
                  >
                    {(transaction.confidence * 100).toFixed(0)}%
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
