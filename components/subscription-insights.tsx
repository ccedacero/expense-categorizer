/**
 * Subscription Insights Dashboard Component
 *
 * Enhanced subscription detection dashboard with:
 * - Grouped view by subscription category
 * - Spotlight on "forgotten" or small subscriptions
 * - Next charge predictions
 * - Annual savings calculator
 * - Visual indicators for subscription value
 */

'use client';

import { useState } from 'react';
import { RecurringAnalysis, RecurringTransaction } from '@/lib/recurring-detector';

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

const GROUP_ICONS: Record<string, string> = {
  'Streaming Services': '📺',
  'Music & Podcasts': '🎵',
  'Fitness & Health': '💪',
  'Software & Tools': '💻',
  'Utilities & Bills': '💡',
  'News & Media': '📰',
  'Other Subscriptions': '📦',
};

export default function SubscriptionInsights({ recurring }: SubscriptionInsightsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'groups'>('list');
  const [showForgotten, setShowForgotten] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [showTips, setShowTips] = useState(false);

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

  // Helper: Calculate days since last charge
  const daysSinceLastCharge = (dates: string[]): number => {
    if (dates.length === 0) return 999;
    const lastDate = new Date(dates[dates.length - 1]);
    const today = new Date();
    const diffTime = today.getTime() - lastDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper: Check if subscription is active (charged within last 60 days)
  const isActive = (sub: RecurringTransaction): boolean => {
    return daysSinceLastCharge(sub.dates) <= 60;
  };

  // Separate active and inactive subscriptions
  const activeSubscriptions = recurring.recurring.filter(isActive);
  const inactiveSubscriptions = recurring.recurring.filter(sub => !isActive(sub));

  // Identify "forgotten" subscriptions (small charges that might be overlooked) - ONLY from active subs
  const forgottenSubs = activeSubscriptions.filter(
    r => r.averageAmount < 15 && r.frequency === 'monthly'
  );

  // Calculate potential savings from forgotten subscriptions
  const potentialSavings = forgottenSubs.reduce((sum, r) => sum + r.averageAmount * 12, 0);

  // Get subscriptions to spotlight (worth reviewing) - ONLY from active subs, and ONLY if 3+
  const spotlightCandidates = activeSubscriptions.filter(
    r => r.confidence < 0.85 || r.averageAmount < 10
  );
  const spotlightSubs = spotlightCandidates.length >= 3 ? spotlightCandidates.slice(0, 3) : [];

  // Recalculate totals for active subscriptions only
  const activeTotalMonthly = activeSubscriptions
    .filter(r => r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.averageAmount, 0);

  const activeTotalAnnual = activeSubscriptions.reduce((sum, r) => {
    if (r.frequency === 'monthly') return sum + r.averageAmount * 12;
    if (r.frequency === 'annual') return sum + r.averageAmount;
    if (r.frequency === 'quarterly') return sum + r.averageAmount * 4;
    return sum;
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">💳</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Subscription Dashboard
            </h2>
            <p className="text-gray-600 text-sm">
              {activeSubscriptions.length} active • {inactiveSubscriptions.length} inactive
              {inactiveSubscriptions.length > 0 && ' (cancelled/paused)'}
            </p>
          </div>
        </div>
        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('groups')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'groups'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            By Category
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="text-blue-600 text-sm font-semibold mb-1">Monthly Total</div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(activeTotalMonthly)}
          </div>
          <div className="text-blue-600 text-xs mt-1">
            {activeSubscriptions.filter(r => r.frequency === 'monthly').length} active subscription{activeSubscriptions.filter(r => r.frequency === 'monthly').length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="text-purple-600 text-sm font-semibold mb-1">Annual Impact</div>
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(activeTotalAnnual)}
          </div>
          <div className="text-purple-600 text-xs mt-1">
            Active subscriptions only
          </div>
        </div>

        {forgottenSubs.length > 0 ? (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowForgotten(!showForgotten)}
          >
            <div className="text-amber-600 text-sm font-semibold mb-1">Small Charges ⚠️</div>
            <div className="text-2xl font-bold text-amber-900">
              {forgottenSubs.length}
            </div>
            <div className="text-amber-600 text-xs mt-1">
              Click to {showForgotten ? 'hide' : 'review'}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="text-green-600 text-sm font-semibold mb-1">Status</div>
            <div className="text-lg font-bold text-green-900">
              ✓ All Clear
            </div>
            <div className="text-green-600 text-xs mt-1">
              No small charges detected
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
          <div className="text-indigo-600 text-sm font-semibold mb-1">Categories</div>
          <div className="text-2xl font-bold text-indigo-900">
            {recurring.groups.length}
          </div>
          <div className="text-indigo-600 text-xs mt-1">
            Subscription types
          </div>
        </div>
      </div>

      {/* Spotlight Section - Subscriptions Worth Reviewing */}
      {spotlightSubs.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-2xl">⭐</div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">Worth Reviewing</h3>
              <p className="text-sm text-amber-800">
                These subscriptions might be worth double-checking or canceling
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {spotlightSubs.map((sub, index) => (
              <div key={`spotlight-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="text-xl">{FREQUENCY_ICONS[sub.frequency]}</div>
                  <div>
                    <div className="font-medium text-gray-800">{sub.merchant}</div>
                    <div className="text-xs text-gray-600">
                      {sub.averageAmount < 10 ? 'Very small charge' : 'May need review'} • {FREQUENCY_LABELS[sub.frequency]}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{formatCurrency(sub.averageAmount)}</div>
                  <div className="text-xs text-gray-500">{formatCurrency(sub.averageAmount * 12)}/year</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forgotten Subscriptions Alert (Expandable) */}
      {showForgotten && forgottenSubs.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl animate-in fade-in duration-300">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-2xl">🔍</div>
            <div>
              <h3 className="text-lg font-bold text-red-900">Small Subscriptions Found</h3>
              <p className="text-sm text-red-800">
                These {forgottenSubs.length} subscriptions cost less than $15/month each but add up to{' '}
                <strong>{formatCurrency(potentialSavings)}/year</strong>
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {forgottenSubs.map((sub, index) => (
              <div key={`forgotten-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="text-xl">{FREQUENCY_ICONS[sub.frequency]}</div>
                  <div>
                    <div className="font-medium text-gray-800">{sub.merchant}</div>
                    <div className="text-xs text-gray-600">
                      {sub.occurrences} charges • Last: {formatDate(sub.dates[sub.dates.length - 1])}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{formatCurrency(sub.averageAmount)}/mo</div>
                  <div className="text-xs text-red-600 font-medium">{formatCurrency(sub.averageAmount * 12)}/year</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Subscription List/Groups */}
      {viewMode === 'list' ? (
        <div className="space-y-6">
          {/* Active Subscriptions */}
          {activeSubscriptions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Active Subscriptions ({activeSubscriptions.length})
              </h3>
              {activeSubscriptions.map((sub, index) => (
                <SubscriptionCard
                  key={`active-${sub.merchant}-${index}`}
                  sub={sub}
                  isActive={true}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}

          {/* Inactive Subscriptions (Collapsible) */}
          {inactiveSubscriptions.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowInactive(!showInactive)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-800 uppercase tracking-wide"
              >
                <span>Inactive Subscriptions ({inactiveSubscriptions.length})</span>
                <span className="text-xs">{showInactive ? '▲' : '▼'}</span>
              </button>
              {showInactive && (
                <div className="space-y-2 mt-2">
                  {inactiveSubscriptions.map((sub, index) => (
                    <SubscriptionCard
                      key={`inactive-${sub.merchant}-${index}`}
                      sub={sub}
                      isActive={false}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {recurring.groups.map((group, groupIndex) => (
            <div key={groupIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{GROUP_ICONS[group.groupName] || '📦'}</span>
                  <h3 className="text-lg font-bold text-gray-800">{group.groupName}</h3>
                  <span className="text-sm text-gray-600">({group.count})</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="font-bold text-gray-800">{formatCurrency(group.totalMonthly)}/mo</div>
                </div>
              </div>
              <div className="space-y-2">
                {group.subscriptions.map((sub, subIndex) => (
                  <SubscriptionCard key={`${group.groupName}-${subIndex}`} sub={sub} isActive={isActive(sub)} formatCurrency={formatCurrency} formatDate={formatDate} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helpful Tips (Collapsible) */}
      <div className="mt-8">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <span className="font-semibold text-gray-800">Quick Tips & FAQs</span>
          </div>
          <span className="text-gray-600">{showTips ? '▲' : '▼'}</span>
        </button>

        {showTips && (
          <div className="mt-3 space-y-3">
            {/* Savings Tip */}
            {potentialSavings > 100 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-xl">💰</span>
                  <div className="text-sm text-green-900">
                    <strong>Potential Savings:</strong> Canceling just {forgottenSubs.length} small subscription{forgottenSubs.length !== 1 ? 's' : ''} could save you{' '}
                    <strong>{formatCurrency(potentialSavings)}</strong> per year!
                  </div>
                </div>
              </div>
            )}

            {/* Active/Inactive Explanation */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-xl">ℹ️</span>
                <div className="text-sm text-blue-900">
                  <strong>Active vs Inactive:</strong> Subscriptions are marked inactive if no charges in the last 60 days.
                  This usually means you&apos;ve cancelled or paused the service.
                </div>
              </div>
            </div>

            {/* Next Date Explanation */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-xl">📅</span>
                <div className="text-sm text-purple-900">
                  <strong>About &quot;Next&quot; dates:</strong> Predicted based on your transaction history.
                  These dates are calculated from the last charge + average billing cycle. Only shown for active subscriptions.
                </div>
              </div>
            </div>

            {/* Action Tip */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-xl">💡</span>
                <div className="text-sm text-amber-900">
                  <strong>Pro Tip:</strong> Review subscriptions you haven&apos;t used recently. Many people forget about trial subscriptions that auto-renewed.
                  Check your email for renewal notices from these merchants.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Subscription Card Component
function SubscriptionCard({
  sub,
  isActive,
  formatCurrency,
  formatDate,
}: {
  sub: RecurringTransaction;
  isActive: boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}) {
  // Calculate days since last charge for display
  const lastDate = new Date(sub.dates[sub.dates.length - 1]);
  const today = new Date();
  const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg hover:shadow-md transition-all border ${
      isActive
        ? 'bg-white border-gray-200'
        : 'bg-gray-50 border-gray-300 opacity-75'
    }`}>
      <div className="flex items-center gap-3">
        <div className="text-xl">
          {FREQUENCY_ICONS[sub.frequency]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="font-medium text-gray-800">
              {sub.merchant}
            </div>
            {!isActive && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                Inactive
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {FREQUENCY_LABELS[sub.frequency]} • {sub.occurrences} charge{sub.occurrences !== 1 ? 's' : ''}
            {isActive && sub.nextExpectedDate && (
              <> • Next: {formatDate(sub.nextExpectedDate)}</>
            )}
            {!isActive && (
              <> • Last: {formatDate(sub.dates[sub.dates.length - 1])} ({daysSince} days ago)</>
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
  );
}
