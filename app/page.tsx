'use client';

import { useState, useMemo } from 'react';
import { track } from '@vercel/analytics';
import UploadZone from '@/components/upload-zone';
import ResultsTable from '@/components/results-table';
import CategoryChart from '@/components/category-chart';
import ExportButtons from '@/components/export-buttons';
import SubscriptionInsights from '@/components/subscription-insights';
import CategoryFilter from '@/components/category-filter';
import RulesBadge from '@/components/rules-badge';
import LoadingSkeleton from '@/components/loading-skeleton';
import { CategorizationResult, Category, CategorizedTransaction } from '@/lib/types';
import { calculateSummary } from '@/lib/summary';

export default function Home() {
  const [result, setResult] = useState<CategorizationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSuggestion, setErrorSuggestion] = useState<string | null>(null);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const handleDataSubmit = async (input: string) => {
    setIsProcessing(true);
    setError(null);
    setErrorSuggestion(null);

    // Estimate transaction count for UI feedback
    const estimatedCount = input.split('\n').filter(line => line.trim()).length;
    setTransactionCount(estimatedCount);

    try {
      // Get user's learned rules from localStorage
      const { getRules } = await import('@/lib/learning-rules');
      const userRules = getRules();

      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          userRules, // Send rules to server
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = data.retryAfter || 60;
          setError(`Too many requests. Please wait ${retryAfter} seconds and try again.`);
          setErrorSuggestion('Rate limiting protects our API costs. Thank you for your patience!');
          return;
        }

        // Show detailed error with suggestion
        setError(data.message || data.error || 'Failed to categorize transactions');
        if (data.suggestion) {
          setErrorSuggestion(data.suggestion);
        }
        return;
      }

      setResult(data);

      // Track successful file upload and categorization
      track('file_uploaded', {
        transactionCount: data.transactions?.length || 0,
        hasRecurring: data.recurring?.subscriptions?.length > 0 || false,
        parseErrors: data.parseErrors?.length || 0,
      });

      // Track category distribution (top 3 categories)
      if (data.topCategories && data.topCategories.length > 0) {
        track('category_distribution', {
          topCategory: data.topCategories[0]?.category,
          topCategoryPercentage: data.topCategories[0]?.percentage,
          secondCategory: data.topCategories[1]?.category,
          secondCategoryPercentage: data.topCategories[1]?.percentage,
          thirdCategory: data.topCategories[2]?.category,
          thirdCategoryPercentage: data.topCategories[2]?.percentage,
          totalCategories: Object.keys(data.summary || {}).length,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
      setErrorSuggestion('Please check your internet connection and try again.');
      // Don't log error details (may contain transaction data)
      console.error('Categorization request failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setErrorSuggestion(null);
    setTransactionCount(0);
    setSelectedCategories([]); // Reset filter
  };

  // Compute filtered transactions and maintain original indices
  const { filteredTransactions, originalIndices, transactionCounts, filteredSummary } = useMemo(() => {
    if (!result) {
      return {
        filteredTransactions: [],
        originalIndices: [],
        transactionCounts: {} as Record<Category, number>,
        filteredSummary: [],
      };
    }

    // Count transactions per category (for filter UI)
    const counts = result.transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<Category, number>);

    // If no categories selected, show all
    if (selectedCategories.length === 0) {
      return {
        filteredTransactions: result.transactions,
        originalIndices: result.transactions.map((_, i) => i),
        transactionCounts: counts,
        filteredSummary: result.summary,
      };
    }

    // Filter transactions by selected categories
    const filtered: CategorizedTransaction[] = [];
    const indices: number[] = [];

    result.transactions.forEach((transaction, originalIndex) => {
      if (selectedCategories.includes(transaction.category)) {
        filtered.push(transaction);
        indices.push(originalIndex);
      }
    });

    // Recalculate summary for filtered transactions
    const summary = calculateSummary(filtered);

    return {
      filteredTransactions: filtered,
      originalIndices: indices,
      transactionCounts: counts,
      filteredSummary: summary,
    };
  }, [result, selectedCategories]);

  // Calculate filtered totals with smart account type detection
  const filteredTotals = useMemo(() => {
    if (!result) return { expenses: 0, income: 0, payments: 0, refunds: 0, isCreditCard: false };

    // Calculate expenses (negative amounts, excluding Payments and Transfers)
    const expenses = filteredTransactions
      .filter(t => t.amount < 0 && t.category !== 'Payment' && t.category !== 'Transfer')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate payments (Payment category only)
    const payments = filteredTransactions
      .filter(t => t.category === 'Payment')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate refunds (Refund category only)
    const refunds = filteredTransactions
      .filter(t => t.category === 'Refund')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate actual income (Income category only)
    const income = filteredTransactions
      .filter(t => t.category === 'Income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Detect if this is a credit card statement:
    // Credit cards have Payment/Refund categories but no Income
    const hasPayments = payments > 0;
    const hasIncome = income > 0;
    const isCreditCard = hasPayments && !hasIncome;

    return { expenses, income, payments, refunds, isCreditCard };
  }, [filteredTransactions, result]);

  const handleCategoryChange = (filteredIndex: number, newCategory: Category) => {
    if (!result) return;

    // Map filtered index back to original index
    const originalIndex = originalIndices[filteredIndex];

    // Update the transaction category
    const updatedTransactions = [...result.transactions];
    updatedTransactions[originalIndex] = {
      ...updatedTransactions[originalIndex],
      category: newCategory,
    };

    // Recalculate summary with new categories
    const updatedSummary = calculateSummary(updatedTransactions);

    // Recalculate totals
    const totalExpenses = updatedTransactions
      .filter(t => t.amount < 0 && t.category !== 'Payment' && t.category !== 'Transfer')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Update result state
    setResult({
      ...result,
      transactions: updatedTransactions,
      summary: updatedSummary,
      totalExpenses,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">💰</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Expense Categorizer
                </h1>
                <p className="text-gray-600 text-sm">
                  Instantly organize your transactions with AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/categories"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categories
              </a>
              <a
                href="/guide"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Guide
              </a>
              <RulesBadge />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isProcessing ? (
          // Loading skeleton while processing
          <LoadingSkeleton />
        ) : !result ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                How it works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Paste your bank transactions, and our AI will automatically categorize
                them into Food, Transportation, Shopping, and more. Export the results
                as CSV for your budgeting tools.
              </p>
            </div>

            <UploadZone onDataSubmit={handleDataSubmit} isProcessing={isProcessing} />

            {/* Error Display with Suggestion */}
            {error && (
              <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2 text-red-800">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <div className="font-semibold">{error}</div>
                    {errorSuggestion && (
                      <div className="text-sm text-red-700 mt-1">
                        💡 {errorSuggestion}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-gray-800 mb-2">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">
                  AI categorizes hundreds of transactions in seconds
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-2">Smart & Accurate</h3>
                <p className="text-gray-600 text-sm">
                  Powered by Claude AI for intelligent categorization
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="font-semibold text-gray-800 mb-2">Privacy First</h3>
                <p className="text-gray-600 text-sm">
                  Your data is never stored. Processing happens in real-time
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Successfully categorized {result.transactions.length} transactions!
              </h2>
              <p className="text-gray-600 mb-6">
                Your expenses have been organized into categories
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  ← Start over
                </button>
                <RulesBadge />
              </div>
            </div>

            {/* Info Banner - Explain Account Type Detection */}
            {filteredTotals.isCreditCard ? (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💳</div>
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-1">
                      Credit Card Statement Detected
                    </h3>
                    <p className="text-sm text-purple-800">
                      We detected this is a credit card statement because it has <strong>Payments</strong> but no <strong>Income</strong>.
                      Your positive amounts are categorized as:
                    </p>
                    <ul className="text-sm text-purple-800 mt-2 ml-4 space-y-1">
                      <li>• <strong>Payment</strong> - Money you sent to pay your credit card bill</li>
                      <li>• <strong>Refund</strong> - Money merchants returned to your card</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : filteredTotals.income > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🏦</div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      Bank Account Statement Detected
                    </h3>
                    <p className="text-sm text-green-800">
                      We detected this is a bank account statement because it has <strong>Income</strong> transactions.
                      Your positive amounts are categorized as:
                    </p>
                    <ul className="text-sm text-green-800 mt-2 ml-4 space-y-1">
                      <li>• <strong>Income</strong> - Money you earned (salary, deposits, etc.)</li>
                      <li>• <strong>Payment</strong> - Money sent to pay bills or credit cards</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Chart */}
            {result.summary.length > 0 && (
              <CategoryChart
                summary={filteredSummary}
                totalExpenses={filteredTotals.expenses}
                totalIncome={filteredTotals.income}
                totalPayments={filteredTotals.payments}
                totalRefunds={filteredTotals.refunds}
                isCreditCard={filteredTotals.isCreditCard}
              />
            )}

            {/* Subscription Insights */}
            {result.recurring && (
              <SubscriptionInsights recurring={result.recurring} />
            )}

            {/* Export Buttons */}
            <ExportButtons
              transactions={filteredTransactions}
              recurring={result.recurring}
            />

            {/* Category Filter */}
            <CategoryFilter
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              transactionCounts={transactionCounts}
            />

            {/* Results Table */}
            <ResultsTable
              transactions={filteredTransactions}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>
              © {new Date().getFullYear()} AI Expense Categorizer. All rights reserved.
            </p>
            <p className="mt-2 text-xs">
              Your data is processed in real-time and never stored.{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
            </p>
            <p className="mt-2 text-xs">
              <a
                href="https://github.com/ccedacero/expense-categorizer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Open Source on GitHub
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
