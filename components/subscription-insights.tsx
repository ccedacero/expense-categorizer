/**
 * Subscription Insights Component
 *
 * Displays detected recurring transactions and subscriptions
 */

import { RecurringAnalysis } from '@/lib/recurring-detector';

interface SubscriptionInsightsProps {
  recurring: RecurringAnalysis;
}

const FREQUENCY_ICONS = {
  monthly: '📅',
  quarterly: '📆',
  annual: '📋',
  unknown: '🔄',
};

const FREQUENCY_LABELS = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
  unknown: 'Recurring',
};

export default function SubscriptionInsights({ recurring }: SubscriptionInsightsProps) {
  if (recurring.recurring.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-3xl">🔔</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Subscription & Recurring Charges
          </h2>
          <p className="text-gray-600 text-sm">
            We found {recurring.recurring.length} recurring transaction{recurring.recurring.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-blue-600 text-sm font-semibold mb-1">Monthly Total</div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(recurring.totalMonthlySpend)}
          </div>
          <div className="text-blue-600 text-xs mt-1">
            {recurring.recurring.filter(r => r.frequency === 'monthly').length} subscription{recurring.recurring.filter(r => r.frequency === 'monthly').length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-purple-600 text-sm font-semibold mb-1">Annual Total</div>
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(recurring.totalAnnualSpend + (recurring.totalMonthlySpend * 12))}
          </div>
          <div className="text-purple-600 text-xs mt-1">
            All recurring charges combined
          </div>
        </div>

        {recurring.hiddenCount > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
            <div className="text-amber-600 text-sm font-semibold mb-1">Small Charges</div>
            <div className="text-2xl font-bold text-amber-900">
              {recurring.hiddenCount}
            </div>
            <div className="text-amber-600 text-xs mt-1">
              Subscriptions under $20/month
            </div>
          </div>
        )}
      </div>

      {/* All Subscriptions - Flat List (sorted by amount) */}
      <div className="space-y-2">
        {recurring.recurring.map((sub, index) => (
          <div
            key={`${sub.merchant}-${index}`}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-xl">
                {FREQUENCY_ICONS[sub.frequency]}
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {sub.merchant}
                </div>
                <div className="text-sm text-gray-600">
                  {FREQUENCY_LABELS[sub.frequency]} • {sub.occurrences} charge{sub.occurrences !== 1 ? 's' : ''}
                  {sub.nextExpectedDate && (
                    <> • Next: {formatDate(sub.nextExpectedDate)}</>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800">
                {formatCurrency(sub.averageAmount)}
              </div>
              <div className="text-xs text-gray-500">
                Total: {formatCurrency(sub.totalSpent)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Helpful Tips */}
      <div className="mt-6 space-y-3">
        {/* Next Date Explanation */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-xl">📅</span>
            <div className="text-sm text-purple-900">
              <strong>About &quot;Next&quot; dates:</strong> Predicted based on your transaction history.
              The date shown is calculated from the last charge + average billing cycle.
              {recurring.recurring.length > 0 && recurring.recurring[0].dates.length > 0 && (
                <span className="text-xs block mt-1 text-purple-700">
                  (Based on data through {formatDate(recurring.recurring[0].dates[recurring.recurring[0].dates.length - 1])})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Subscriptions Tip */}
        {recurring.hiddenCount > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div className="text-sm text-blue-900">
                <strong>Tip:</strong> We found {recurring.hiddenCount} small subscription{recurring.hiddenCount !== 1 ? 's' : ''} under $20/month.
                These &ldquo;hidden&rdquo; charges can add up to over ${(recurring.recurring.filter(r => r.averageAmount < 20 && r.frequency === 'monthly').reduce((sum, r) => sum + r.averageAmount, 0) * 12).toFixed(0)} per year!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
