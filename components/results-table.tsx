'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { track } from '@vercel/analytics';
import { CategorizedTransaction, Category } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORIES } from '@/lib/constants';
import { createOrUpdateRule } from '@/lib/learning-rules';

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
  const [feedbackGiven, setFeedbackGiven] = useState<Set<number>>(new Set());
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);
  const [ruleToast, setRuleToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCategoryChange = (index: number, newCategory: Category) => {
    const transaction = transactions[index];

    // Mark as edited
    setEditedTransactions(new Set(editedTransactions).add(index));

    // Create or update learning rule
    const { isNewRule, rule } = createOrUpdateRule(
      transaction.description,
      newCategory
    );

    // Show toast notification
    const toastMessage = isNewRule
      ? `✓ Rule created: All "${rule.merchantPattern}" → ${newCategory}`
      : `✓ Rule updated: "${rule.merchantPattern}" → ${newCategory}`;

    setRuleToast(toastMessage);
    setTimeout(() => setRuleToast(null), 3000);

    // Trigger custom event for RulesBadge to update
    window.dispatchEvent(new Event('rulesUpdated'));

    // Notify parent component
    if (onCategoryChange) {
      onCategoryChange(index, newCategory);
    }
  };

  const handleFeedback = (index: number, transaction: CategorizedTransaction) => {
    // Mark feedback as given
    setFeedbackGiven(new Set(feedbackGiven).add(index));

    // Track event with Vercel Analytics
    track('categorization_feedback', {
      category: transaction.category,
      confidence: transaction.confidence ? Math.round(transaction.confidence * 100) : 0,
      // Hash description for privacy (first 3 chars + length)
      descriptionHash: `${transaction.description.substring(0, 3).toLowerCase()}_${transaction.description.length}`,
      wasEdited: editedTransactions.has(index),
    });

    // Show confirmation toast
    setShowFeedbackToast(true);
    setTimeout(() => setShowFeedbackToast(false), 3000);
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

  // Filter and sort transactions, track original indices
  const { sortedTransactions, indexMap, totalCount, filteredCount } = useMemo(() => {
    const totalCount = transactions.length;

    // Create array of transactions with their original indices
    let transactionsWithIndices = transactions.map((transaction, originalIndex) => ({
      transaction,
      originalIndex,
    }));

    // Apply search filter if query exists
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      transactionsWithIndices = transactionsWithIndices.filter(({ transaction }) => {
        // Search across multiple fields
        const description = transaction.description.toLowerCase();
        const category = transaction.category.toLowerCase();
        const amount = Math.abs(transaction.amount).toFixed(2);
        const date = new Date(transaction.date).toLocaleDateString().toLowerCase();

        return (
          description.includes(query) ||
          category.includes(query) ||
          amount.includes(query) ||
          date.includes(query)
        );
      });
    }

    const filteredCount = transactionsWithIndices.length;

    // Apply sorting if field is selected
    if (sortField) {
      transactionsWithIndices.sort((a, b) => {
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
    }

    return {
      sortedTransactions: transactionsWithIndices.map(item => item.transaction),
      indexMap: transactionsWithIndices.map(item => item.originalIndex),
      totalCount,
      filteredCount,
    };
  }, [transactions, sortField, sortDirection, debouncedSearchQuery]);

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 text-gray-400">↕</span>;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg">
      {/* Search Bar */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by description, category, amount, or date..."
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {filteredCount < totalCount ? (
              <span>
                Showing <span className="font-semibold text-blue-600">{filteredCount}</span> of{' '}
                <span className="font-semibold">{totalCount}</span> transactions
              </span>
            ) : (
              <span>
                <span className="font-semibold">{totalCount}</span>{' '}
                {totalCount === 1 ? 'transaction' : 'transactions'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Wrong?
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
                  <div className="relative inline-block group">
                    <select
                      value={transaction.category}
                      onChange={(e) => handleCategoryChange(originalIndex, e.target.value as Category)}
                      className="appearance-none cursor-pointer px-3 py-1.5 pr-9 rounded-full text-white font-medium border-2 border-transparent hover:border-white/40 hover:shadow-md focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
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
                    {/* Dropdown arrow indicator - visible on hover */}
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-all group-hover:scale-110">
                      <svg
                        className="w-3.5 h-3.5 text-white drop-shadow-sm"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
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
                    transaction.confidence === 1.0 ? (
                      <span
                        className="text-xs text-blue-600 font-semibold flex items-center justify-center gap-1"
                        title="Categorized by learned rule"
                      >
                        <span>📚</span>
                        Rule
                      </span>
                    ) : (
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
                    )
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                  {feedbackGiven.has(originalIndex) ? (
                    <span className="text-xs text-green-600" title="Thanks for your feedback!">
                      ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => handleFeedback(originalIndex, transaction)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-100"
                      title="Report incorrect category"
                      aria-label="Report incorrect category"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V7m-7 7h2m6-7h1.5a2 2 0 011.5 2v2a2 2 0 01-1.5 2h-.5"
                          transform="scale(1, -1) translate(0, -24)"
                        />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Empty State */}
      {filteredCount === 0 && (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-900">No transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search query
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear search
            </button>
          )}
        </div>
      )}
      </div>

      {/* Feedback Toast */}
      {showFeedbackToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">Thanks for your feedback!</span>
        </div>
      )}

      {/* Rule Learning Toast */}
      {ruleToast && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up max-w-md">
          <span className="text-lg font-bold">✓</span>
          <span className="font-medium text-sm">{ruleToast}</span>
        </div>
      )}
    </div>
  );
}
