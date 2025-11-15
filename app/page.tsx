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
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Categorize Your Bank Statement in{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  30 Seconds, Not 3 Hours
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                AI-powered expense categorizer that learns from you. Privacy-first. No data storage. Free to start.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700 mb-8">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">95% accuracy for major banks</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Zero data storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Open source on GitHub</span>
                </div>
              </div>
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

            {/* Features - Benefit-Focused */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Save Hours Every Month</h3>
                <p className="text-gray-600 text-sm">
                  Categorize 100+ transactions in 30 seconds. No more manual data entry or spreadsheet headaches.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-3">🧠</div>
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">AI That Learns From You</h3>
                <p className="text-gray-600 text-sm">
                  Correct a category once, and it remembers forever. Gets smarter with every correction you make.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Bank-Level Privacy</h3>
                <p className="text-gray-600 text-sm">
                  Zero data storage. No account required. Your data is processed in real-time and immediately discarded.
                </p>
              </div>
            </div>

            {/* Social Proof / Trust Bar */}
            <div className="max-w-4xl mx-auto mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <div className="text-center mb-4">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Trusted By Privacy-Conscious Users</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">95%+</div>
                  <div className="text-xs text-gray-600">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">Free</div>
                  <div className="text-xs text-gray-600">No signup or API key needed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-xs text-gray-600">Data breaches (we don&apos;t store data)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">Open</div>
                  <div className="text-xs text-gray-600">
                    Source{' '}
                    <a
                      href="https://github.com/ccedacero/expense-categorizer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works - Quick Steps */}
            <div className="max-w-3xl mx-auto mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Export CSV from your bank</h3>
                    <p className="text-sm text-gray-600">Works with Chase, Capital One, Wells Fargo, Bank of America, and any bank that exports CSV</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Upload or paste your transactions</h3>
                    <p className="text-sm text-gray-600">AI categorizes everything in real-time. No data is stored on our servers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Review, adjust, and export</h3>
                    <p className="text-sm text-gray-600">Download as CSV for use with Excel, QuickBooks, Xero, or any budgeting tool</p>
                  </div>
                </div>
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

      {/* FAQ Section for SEO */}
      {!result && (
        <section className="max-w-4xl mx-auto mt-20 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">Is my financial data safe?</h3>
              <p className="text-gray-600 text-sm">
                Absolutely. We never store your data. All processing happens in real-time on our servers and your data is immediately discarded after categorization. We only send transaction descriptions (not amounts or dates) to Anthropic AI for categorization.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">Which banks are supported?</h3>
              <p className="text-gray-600 text-sm">
                We support CSV exports from all major banks including Chase, Capital One, Wells Fargo, Bank of America, Citibank, Discover, and more. If your bank can export transactions to CSV format, it will work with our categorizer.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">How accurate is the categorization?</h3>
              <p className="text-gray-600 text-sm">
                For banks with built-in categories (Chase, Capital One), we achieve 95%+ accuracy. For other banks, we achieve 85-90% accuracy. Our learning rules engine remembers your corrections and improves over time.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">How much does it cost?</h3>
              <p className="text-gray-600 text-sm">
                It&apos;s completely free to use! No signup, no API key required. We cover the AI costs for now to keep the tool accessible. For high-volume users or those who want to self-host, you can run it locally with your own Anthropic API key (approximately $0.50 per 1,000 transactions).
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">Can I export the results?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can download your categorized transactions as a CSV file. The CSV format works with QuickBooks, Xero, Wave, Excel, Google Sheets, and most accounting/budgeting software.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">Is this a Mint alternative?</h3>
              <p className="text-gray-600 text-sm">
                Yes! After Mint shut down in 2024, many users turned to our tool as a privacy-first alternative. Unlike Mint, we don&apos;t require account linking, don&apos;t store your data, and don&apos;t sell your information to third parties.
              </p>
            </div>
          </div>
        </section>
      )}

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
