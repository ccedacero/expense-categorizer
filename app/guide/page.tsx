import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'User Guide - AI Expense Categorizer | How to Use Learning Rules & Features',
  description: 'Learn how to use the AI Expense Categorizer: Learning Rules Engine, file format support (CSV, Excel, OFX), search functionality, and tips to maximize accuracy.',
  keywords: 'expense categorizer guide, learning rules, AI categorization, CSV Excel OFX, transaction search, personal finance automation',
  openGraph: {
    title: 'User Guide - AI Expense Categorizer',
    description: 'Master the Learning Rules Engine and auto-categorize your transactions effortlessly',
    type: 'website',
  },
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">📖</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  User Guide
                </h1>
                <p className="text-gray-600 text-sm">
                  Learn how to get the most out of AI Expense Categorizer
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Quick Start */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Quick Start</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Upload Your File</h3>
                  <p className="text-gray-600 text-sm">
                    Drag & drop or click to upload CSV, Excel (.xlsx, .xls), or OFX/QFX files from your bank.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI Categorizes Instantly</h3>
                  <p className="text-gray-600 text-sm">
                    The AI analyzes each transaction and assigns the best category automatically.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Review & Export</h3>
                  <p className="text-gray-600 text-sm">
                    Check results, make corrections (rules are auto-created!), and export to CSV or Excel.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Learning Rules Engine - MAIN FEATURE */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📚</span>
              <h2 className="text-2xl font-bold text-gray-900">Learning Rules Engine</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                Your Competitive Advantage
              </span>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-gray-900 font-medium">
                  The app remembers your categorization preferences and creates personal pattern-matching rules.
                  The more you use it, the smarter it gets!
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">How It Works:</h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">First Upload</p>
                      <p className="text-sm text-gray-600">
                        Upload CSV → AI categorizes &quot;STARBUCKS #1234&quot; as Shopping → You correct it to &quot;Food & Dining&quot;
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        → Rule auto-created: &quot;starbucks&quot; → Food & Dining
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                      ⚡
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Next Upload</p>
                      <p className="text-sm text-gray-600">
                        Upload new CSV → &quot;STARBUCKS #5678 SEATTLE&quot; → Instantly categorized as &quot;Food & Dining&quot;
                      </p>
                      <p className="text-xs text-green-600 font-medium mt-1">
                        → No AI call needed → Instant & free!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-900 mb-1">💡 Smart Context Matching</p>
                  <p className="text-sm text-gray-700">
                    Rules preserve context keywords (fee, payment, subscription) to prevent false matches.
                    For example, &quot;CAPITAL ONE MEMBERSHIP FEE&quot; won&apos;t match &quot;CAPITAL ONE PAYMENT&quot;.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg">Managing Your Rules:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>View all rules: Click the badge showing &quot;X Rules Learned&quot; in the header, or visit <Link href="/rules" className="text-blue-600 underline hover:text-blue-800">/rules</Link></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Export rules: Download as JSON for backup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Import rules: Restore from backup or share across devices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Delete rules: Remove individual rules or clear all</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* File Format Support */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📁</span>
              <h2 className="text-2xl font-bold text-gray-900">File Format Support</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                The app automatically detects and processes multiple file formats:
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold text-gray-900">CSV</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Standard format from all banks. Works with any CSV containing Date, Description, Amount.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold text-gray-900">Excel</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    .xlsx and .xls files. Automatically converted to CSV format for processing.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold text-gray-900">OFX/QFX</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Financial exchange formats from Quicken, Money, and banking software.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Supported Banks:</h3>
                <p className="text-sm text-gray-600">
                  Chase, Capital One, Wells Fargo, Bank of America, Citibank, Discover, and any bank that exports CSV, Excel, or OFX.
                </p>
              </div>
            </div>
          </section>

          {/* Search Functionality */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🔍</span>
              <h2 className="text-2xl font-bold text-gray-900">Search & Filter</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Quickly find specific transactions using the smart search bar:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Search by Description</p>
                    <p className="text-sm text-gray-600">Type merchant names like &quot;starbucks&quot; or &quot;amazon&quot;</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Search by Category</p>
                    <p className="text-sm text-gray-600">Filter by &quot;food&quot;, &quot;groceries&quot;, &quot;shopping&quot;, etc.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Search by Amount</p>
                    <p className="text-sm text-gray-600">Find specific amounts like &quot;25.00&quot; or &quot;99&quot;</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Search by Date</p>
                    <p className="text-sm text-gray-600">Type dates like &quot;11/10/2025&quot; or &quot;nov 10&quot;</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">💡 Performance:</span> Search uses 300ms debouncing for smooth, lag-free filtering even with 1,000+ transactions.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy & Data */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🔒</span>
              <h2 className="text-2xl font-bold text-gray-900">Privacy & Data Storage</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <p className="text-sm font-semibold text-gray-900 mb-2">Your Financial Data is Safe</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Transaction data is processed in real-time and never stored on servers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Learning rules are stored locally in your browser (localStorage)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>No database, no tracking, no analytics on your transactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>GDPR & CCPA compliant - privacy-first architecture</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                Your rules are saved in your browser&apos;s local storage. To back them up or transfer to another device,
                export them from the <Link href="/rules" className="text-blue-600 underline hover:text-blue-800">/rules page</Link>.
              </p>
            </div>
          </section>

          {/* Tips for Best Results */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">💡</span>
              <h2 className="text-2xl font-bold text-gray-900">Tips for Best Results</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-lg">1.</span>
                <div>
                  <p className="font-medium text-gray-900">Correct Categories on First Upload</p>
                  <p className="text-sm text-gray-600">
                    The more corrections you make initially, the smarter future uploads become.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-lg">2.</span>
                <div>
                  <p className="font-medium text-gray-900">Look for the 📚 Rule Indicator</p>
                  <p className="text-sm text-gray-600">
                    Transactions showing &quot;📚 Rule&quot; were auto-categorized by your personal rules (100% confidence).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-lg">3.</span>
                <div>
                  <p className="font-medium text-gray-900">Export Your Rules Regularly</p>
                  <p className="text-sm text-gray-600">
                    Back up your rules from /rules page in case you clear browser data.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-lg">4.</span>
                <div>
                  <p className="font-medium text-gray-900">Use Search to Verify Corrections</p>
                  <p className="text-sm text-gray-600">
                    Search for merchant names to ensure all similar transactions are categorized consistently.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-lg">5.</span>
                <div>
                  <p className="font-medium text-gray-900">Start with Your Bank&apos;s Categorized CSVs</p>
                  <p className="text-sm text-gray-600">
                    Chase and Capital One CSVs include category columns, which gives higher initial accuracy.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6">
              Upload your first file and watch the Learning Rules Engine work its magic!
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Start Categorizing →
            </Link>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 text-sm">
        <p>
          Questions? Visit our{' '}
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            home page
          </Link>{' '}
          or check the{' '}
          <a
            href="https://github.com/ccedacero/expense-categorizer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            GitHub repository
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
