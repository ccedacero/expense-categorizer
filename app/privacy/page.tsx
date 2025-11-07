import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 text-sm mt-1">Last Updated: January 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">Overview</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            AI Expense Categorizer is committed to protecting your financial data privacy.
            This document explains how we handle your transaction data.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Data Collection</h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">What We Collect</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li><strong>Transaction data</strong> you upload (dates, descriptions, amounts)</li>
            <li><strong>IP address</strong> for rate limiting (prevents abuse)</li>
            <li><strong>Usage statistics</strong> (anonymous - number of transactions processed, cache hit rates)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">What We DON&apos;T Collect</h3>
          <ul className="list-disc list-inside text-red-700 mb-4 space-y-2">
            <li>❌ No user accounts or personal information</li>
            <li>❌ No cookies or tracking pixels</li>
            <li>❌ No persistent storage of your transactions</li>
            <li>❌ No email addresses or contact information</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Data Processing</h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">How Your Data is Used</h3>

          <div className="space-y-4 mb-4">
            <div>
              <p className="font-semibold text-gray-800 mb-1">1. AI Categorization</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li>Your transaction descriptions are sent to Anthropic&apos;s Claude AI API</li>
                <li>Claude processes the data to assign categories</li>
                <li>Anthropic&apos;s data usage policy: <a href="https://www.anthropic.com/legal/consumer-terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">https://www.anthropic.com/legal/consumer-terms</a></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-1">2. Merchant Caching</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li>Merchant patterns (e.g., &quot;Starbucks&quot;) are cached temporarily</li>
                <li>Only merchant names are cached, NOT amounts or full descriptions</li>
                <li>Cache is in-memory and resets on server restart</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-1">3. Rate Limiting</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li>IP addresses stored temporarily (60 minutes)</li>
                <li>Prevents API abuse and protects service costs</li>
                <li>Cleared automatically every hour</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Data Retention</h3>
          <ul className="list-disc list-inside text-green-700 mb-4 space-y-2">
            <li>✅ <strong>Real-time Processing Only:</strong> Your transactions are NOT stored in any database</li>
            <li>✅ <strong>Session Only:</strong> Data exists only during active categorization request</li>
            <li>✅ <strong>No Persistence:</strong> All data is deleted immediately after results are returned</li>
            <li>✅ <strong>Cache Expiry:</strong> Merchant cache expires after 1 hour of inactivity</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Third-Party Services</h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Anthropic Claude AI</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li><strong>Purpose:</strong> AI-powered transaction categorization</li>
            <li><strong>Data Shared:</strong> Transaction descriptions and amounts</li>
            <li><strong>Privacy Policy:</strong> <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">https://www.anthropic.com/legal/privacy</a></li>
            <li><strong>Note:</strong> Anthropic may use data to improve their AI models per their terms</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Vercel Hosting (if deployed)</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li><strong>Purpose:</strong> Web hosting and serverless functions</li>
            <li><strong>Data Shared:</strong> Request metadata (IP, timestamps)</li>
            <li><strong>Privacy Policy:</strong> <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">https://vercel.com/legal/privacy-policy</a></li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Security Measures</h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Data Protection</h3>
          <ul className="list-disc list-inside text-green-700 mb-4 space-y-2">
            <li>✅ All communication encrypted via HTTPS/TLS</li>
            <li>✅ No persistent database (stateless architecture)</li>
            <li>✅ Rate limiting prevents abuse</li>
            <li>✅ Input validation prevents malicious uploads</li>
            <li>✅ Server logs sanitized (no sensitive data logged)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">What We DON&apos;T Do</h3>
          <ul className="list-disc list-inside text-red-700 mb-4 space-y-2">
            <li>❌ Never sell or share your data with third parties</li>
            <li>❌ Never store your transactions after processing</li>
            <li>❌ Never use your data for marketing</li>
            <li>❌ Never share data across users</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Your Rights</h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Data Control</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li><strong>Right to Access:</strong> Since we don&apos;t store data, there&apos;s nothing to access</li>
            <li><strong>Right to Delete:</strong> Data is automatically deleted after each request</li>
            <li><strong>Right to Port:</strong> Download your categorized results anytime</li>
            <li><strong>Right to Opt-Out:</strong> Simply don&apos;t use the service</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Consent</h3>
          <p className="text-gray-700 mb-2">By using AI Expense Categorizer, you consent to:</p>
          <ol className="list-decimal list-inside text-gray-700 mb-4 ml-4 space-y-1">
            <li>Sending your transaction data to Anthropic&apos;s Claude AI API</li>
            <li>Temporary caching of merchant patterns for performance</li>
            <li>IP-based rate limiting for abuse prevention</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Compliance</h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">GDPR (EU Users)</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li><strong>Lawful Basis:</strong> Legitimate interest (service operation)</li>
            <li><strong>Data Minimization:</strong> Only collect what&apos;s necessary</li>
            <li><strong>Purpose Limitation:</strong> Only used for categorization</li>
            <li><strong>Storage Limitation:</strong> No long-term storage</li>
            <li><strong>Right to Erasure:</strong> Automatic (nothing persists)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">CCPA (California Users)</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li><strong>No Sale of Data:</strong> We never sell personal information</li>
            <li><strong>No Sharing:</strong> Data not shared with third parties (except AI provider)</li>
            <li><strong>Notice at Collection:</strong> This privacy policy</li>
            <li><strong>Right to Know:</strong> Covered in this document</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Children&apos;s Privacy</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            This service is not intended for users under 13 years old. We do not knowingly
            collect data from children.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Changes to Privacy Policy</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We may update this policy occasionally. Check the &quot;Last Updated&quot; date at the top.
            Continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Transparency</h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Open Source</h3>
          <p className="text-gray-700 mb-2">This project is open source. You can audit the code to verify:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 ml-4 space-y-1">
            <li>No hidden tracking</li>
            <li>No unauthorized data collection</li>
            <li>No persistent storage</li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-blue-900 mb-1">📂 View Source Code</p>
            <a
              href="https://github.com/ccedacero/expense-categorizer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline text-sm break-all"
            >
              github.com/ccedacero/expense-categorizer
            </a>
            <p className="text-xs text-blue-800 mt-2">
              Audit the code yourself • Report security issues • Contribute improvements
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">What You Can Verify</h3>
          <ol className="list-decimal list-inside text-gray-700 mb-4 ml-4 space-y-1">
            <li>View <code className="bg-gray-100 px-2 py-1 rounded text-sm">app/api/categorize/route.ts</code> - No database writes</li>
            <li>View <code className="bg-gray-100 px-2 py-1 rounded text-sm">lib/merchant-cache.ts</code> - In-memory cache only</li>
            <li>View <code className="bg-gray-100 px-2 py-1 rounded text-sm">lib/rate-limit.ts</code> - Temporary IP storage</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Best Practices for Users</h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Protect Your Privacy</h3>
          <ul className="list-disc list-inside mb-4 ml-4 space-y-2">
            <li className="text-green-700">✅ Remove account numbers from CSVs before upload</li>
            <li className="text-green-700">✅ Use only recent transactions (don&apos;t upload entire history)</li>
            <li className="text-green-700">✅ Download results immediately, then clear browser</li>
            <li className="text-yellow-700">⚠️ Avoid uploading on public WiFi</li>
            <li className="text-yellow-700">⚠️ Close browser tab after use</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">What to Upload</h3>
          <ul className="list-disc list-inside mb-4 ml-4 space-y-2">
            <li className="text-green-700">✅ Date, description, amount (minimal data)</li>
            <li className="text-red-700">❌ Don&apos;t include: SSN, account numbers, card numbers</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">Disclaimer</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-900 mb-2">
              This is a demo/educational project. For production use with sensitive financial data, consider:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-900 ml-4 space-y-1">
              <li>Self-hosting to maintain full control</li>
              <li>Adding encryption at rest</li>
              <li>Implementing audit logs</li>
              <li>Regular security assessments</li>
            </ul>
          </div>

          <hr className="my-8 border-gray-200" />

          <p className="text-center font-semibold text-gray-800 text-lg">
            By using AI Expense Categorizer, you acknowledge that you have read and understood this Privacy Policy.
          </p>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>
              © {new Date().getFullYear()} AI Expense Categorizer. All rights reserved.
            </p>
            <p className="mt-2 text-xs">
              Your data is processed in real-time and never stored.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
