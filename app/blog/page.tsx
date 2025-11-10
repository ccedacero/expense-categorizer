import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Privacy & Expense Management Guides',
  description: 'Learn about privacy-first expense tracking, transaction categorization, and financial management best practices.',
};

const blogPosts = [
  {
    slug: 'privacy-first-expense-tracking',
    title: 'How to Categorize Bank Transactions Without Compromising Privacy',
    excerpt: 'A complete guide to organizing your expenses while keeping your financial data secure. Learn why stateless processing matters and how to protect your privacy.',
    date: '2024-11-09',
    readTime: '8 min read',
    category: 'Privacy',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="text-4xl">💰</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Expense Categorizer
                </h1>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog & Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Guides on privacy-first expense tracking, transaction categorization, and financial management
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="space-y-8">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border-2 border-transparent hover:border-blue-200"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {post.category}
                </span>
                <span className="text-sm text-gray-500">{post.readTime}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                {post.title}
              </h2>

              <p className="text-gray-600 mb-4 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="text-blue-600 font-semibold hover:text-blue-700">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center border-2 border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            More guides coming soon!
          </h3>
          <p className="text-gray-600 mb-4">
            Want to learn about specific topics? Let us know on GitHub.
          </p>
          <a
            href="https://github.com/ccedacero/expense-categorizer/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Request a Topic
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} AI Expense Categorizer. All rights reserved.</p>
            <p className="mt-2">
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </Link>
              {' · '}
              <Link href="/" className="text-blue-600 hover:text-blue-700 underline">
                Back to App
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
