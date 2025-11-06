'use client';

import { useState, useMemo } from 'react';
import { CategorizedTransaction, Category } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORIES } from '@/lib/constants';

interface ResultsTableProps {
  transactions: CategorizedTransaction[];
  onCategoryChange?: (index: number, newCategory: Category) => void;
}

type SortField = 'date' | 'category' | 'amount' | null;
type SortDirection = 'asc' | 'desc';

export default function ResultsTable({ transactions, onCategoryChange }: ResultsTableProps) {
  const [editedTransactions, setEditedTransactions] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleCategoryChange = (index: number, newCategory: Category) => {
    // Mark as edited
    setEditedTransactions(new Set(editedTransactions).add(index));

    // Notify parent component
    if (onCategoryChange) {
      onCategoryChange(index, newCategory);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort transactions and track original indices
  const { sortedTransactions, indexMap } = useMemo(() => {
    // Create array of transactions with their original indices
    const transactionsWithIndices = transactions.map((transaction, originalIndex) => ({
      transaction,
      originalIndex,
    }));

    if (!sortField) {
      return {
        sortedTransactions: transactions,
        indexMap: transactions.map((_, i) => i),
      };
    }

    // Sort while maintaining original index information
    const sorted = [...transactionsWithIndices].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'date') {
        const dateA = new Date(a.transaction.date).getTime();
        const dateB = new Date(b.transaction.date).getTime();
        comparison = dateA - dateB;
      } else if (sortField === 'category') {
        comparison = a.transaction.category.localeCompare(b.transaction.category);
      } else if (sortField === 'amount') {
        comparison = a.transaction.amount - b.transaction.amount;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return {
      sortedTransactions: sorted.map(item => item.transaction),
      indexMap: sorted.map(item => item.originalIndex),
    };
  }, [transactions, sortField, sortDirection]);

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 text-gray-400">↕</span>;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };
  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-lg">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th
              className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
              onClick={() => handleSort('date')}
              title="Click to sort by date"
            >
              Date
              <SortIndicator field="date" />
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Description
            </th>
            <th
              className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
              onClick={() => handleSort('amount')}
              title="Click to sort by amount"
            >
              Amount
              <SortIndicator field="amount" />
            </th>
            <th
              className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
              onClick={() => handleSort('category')}
              title="Click to sort by category"
            >
              Category
              <SortIndicator field="category" />
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Confidence
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedTransactions.map((transaction, sortedIndex) => {
            const originalIndex = indexMap[sortedIndex];
            return (
              <tr key={originalIndex} className="hover:bg-gray-50 transition-colors">
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
                      onChange={(e) => handleCategoryChange(originalIndex, e.target.value as Category)}
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
                  {editedTransactions.has(originalIndex) && (
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
