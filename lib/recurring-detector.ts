/**
 * Recurring Transaction & Subscription Detection
 *
 * Detects patterns in transactions to identify:
 * - Monthly subscriptions (Netflix, Spotify, gym, etc.)
 * - Annual subscriptions (software, memberships)
 * - Recurring bills (utilities, insurance)
 *
 * Helps users find "hidden" subscriptions and track recurring expenses.
 */

import { CategorizedTransaction, Category } from './types';

export interface RecurringTransaction {
  merchant: string;
  amount: number;
  frequency: 'monthly' | 'annual' | 'quarterly' | 'unknown';
  occurrences: number;
  category: Category;
  dates: string[];
  totalSpent: number;
  averageAmount: number;
  confidence: number; // 0-1 score for pattern confidence
  nextExpectedDate?: string; // Predicted next charge
}

export interface SubscriptionGroup {
  groupName: string; // e.g., "Streaming Services", "Fitness", "Software"
  subscriptions: RecurringTransaction[];
  totalMonthly: number;
  totalAnnual: number;
  count: number;
}

export interface RecurringAnalysis {
  recurring: RecurringTransaction[];
  groups: SubscriptionGroup[];
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  hiddenCount: number; // Subscriptions user might have forgotten
}

/**
 * Detect recurring transactions and subscriptions
 */
export function detectRecurringTransactions(
  transactions: CategorizedTransaction[]
): RecurringAnalysis {
  if (transactions.length === 0) {
    return {
      recurring: [],
      groups: [],
      totalMonthlySpend: 0,
      totalAnnualSpend: 0,
      hiddenCount: 0,
    };
  }

  // Step 1: Group transactions by normalized merchant name
  const merchantGroups = groupByMerchant(transactions);

  // Step 2: Identify recurring patterns
  const recurring: RecurringTransaction[] = [];

  for (const [merchant, txns] of merchantGroups) {
    if (txns.length < 2) continue; // Need at least 2 occurrences

    const pattern = analyzePattern(merchant, txns);
    if (pattern && pattern.confidence >= 0.6) {
      recurring.push(pattern);
    }
  }

  // Step 3: Sort by most recent and highest spend
  recurring.sort((a, b) => b.totalSpent - a.totalSpent);

  // Step 4: Group subscriptions by type
  const groups = groupSubscriptions(recurring);

  // Step 5: Calculate totals
  const totalMonthlySpend = recurring
    .filter(r => r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.averageAmount, 0);

  const totalAnnualSpend = recurring
    .filter(r => r.frequency === 'annual')
    .reduce((sum, r) => sum + r.averageAmount, 0);

  // Quarterly subscriptions converted to monthly equivalent
  const quarterlyMonthlyEquivalent = recurring
    .filter(r => r.frequency === 'quarterly')
    .reduce((sum, r) => sum + r.averageAmount / 3, 0);

  // Step 6: Identify "hidden" subscriptions (small recurring charges)
  const hiddenCount = recurring.filter(
    r => r.averageAmount < 20 && r.frequency === 'monthly'
  ).length;

  return {
    recurring,
    groups,
    totalMonthlySpend: totalMonthlySpend + quarterlyMonthlyEquivalent,
    totalAnnualSpend: totalAnnualSpend + totalMonthlySpend * 12 + quarterlyMonthlyEquivalent * 12,
    hiddenCount,
  };
}

/**
 * Group transactions by normalized merchant name
 */
function groupByMerchant(
  transactions: CategorizedTransaction[]
): Map<string, CategorizedTransaction[]> {
  const groups = new Map<string, CategorizedTransaction[]>();

  for (const txn of transactions) {
    // Normalize merchant name (remove numbers, extra spaces, common suffixes)
    const normalized = normalizeMerchant(txn.description);

    if (!groups.has(normalized)) {
      groups.set(normalized, []);
    }
    groups.get(normalized)!.push(txn);
  }

  return groups;
}

/**
 * Normalize merchant name for pattern matching
 * Example: "NETFLIX #1234" → "netflix"
 */
function normalizeMerchant(description: string): string {
  return description
    .toLowerCase()
    .replace(/[#*]\w+/g, '') // Remove #1234 or *5678
    .replace(/\d{2,}/g, '') // Remove long numbers
    .replace(/\b(inc|llc|ltd|corp|co)\b/g, '') // Remove company suffixes
    .replace(/[^a-z\s]/g, '') // Keep only letters and spaces
    .trim()
    .split(/\s+/)
    .slice(0, 2) // Take first 2 words
    .join(' ')
    .trim();
}

/**
 * Analyze pattern to determine if recurring
 */
function analyzePattern(
  merchant: string,
  transactions: CategorizedTransaction[]
): RecurringTransaction | null {
  if (transactions.length < 2) return null;

  // Sort by date
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate average amount (use absolute value for expenses)
  const amounts = sorted.map(t => Math.abs(t.amount));
  const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;

  // Check if amounts are consistent (within 10% variance)
  const maxVariance = avgAmount * 0.1;
  const isConsistentAmount = amounts.every(amt => Math.abs(amt - avgAmount) <= maxVariance);

  // Calculate time intervals between transactions
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const days = daysBetween(sorted[i - 1].date, sorted[i].date);
    intervals.push(days);
  }

  // Detect frequency pattern
  const frequency = detectFrequency(intervals);
  if (!frequency) return null;

  // Calculate confidence score
  let confidence = 0.5; // Base confidence

  if (isConsistentAmount) confidence += 0.3; // Consistent amounts boost confidence
  if (sorted.length >= 3) confidence += 0.1; // 3+ occurrences boost confidence
  if (sorted.length >= 5) confidence += 0.1; // 5+ occurrences boost more

  // Common subscription keywords boost confidence
  const subscriptionKeywords = [
    'netflix', 'spotify', 'hulu', 'disney', 'apple', 'amazon prime',
    'youtube', 'gym', 'fitness', 'planet', 'crunch', 'insurance',
    'phone', 'internet', 'cable', 'electricity', 'gas', 'water',
    'rent', 'mortgage', 'subscription', 'membership', 'adobe',
  ];

  if (subscriptionKeywords.some(keyword => merchant.includes(keyword))) {
    confidence = Math.min(confidence + 0.2, 1.0);
  }

  // Predict next expected date
  const lastDate = sorted[sorted.length - 1].date;
  const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
  const nextExpectedDate = addDays(lastDate, Math.round(avgInterval));

  return {
    merchant: transactions[0].description.split(/[#*\d]/)[0].trim(), // Original merchant name (cleaned)
    amount: avgAmount,
    frequency,
    occurrences: sorted.length,
    category: sorted[0].category,
    dates: sorted.map(t => t.date),
    totalSpent: amounts.reduce((sum, amt) => sum + amt, 0),
    averageAmount: avgAmount,
    confidence: Math.min(confidence, 1.0),
    nextExpectedDate,
  };
}

/**
 * Detect frequency from intervals (in days)
 */
function detectFrequency(intervals: number[]): 'monthly' | 'annual' | 'quarterly' | 'unknown' | null {
  if (intervals.length === 0) return null;

  const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;

  // Monthly: 28-31 days (allow some variance)
  if (avgInterval >= 25 && avgInterval <= 35) {
    return 'monthly';
  }

  // Quarterly: ~90 days (allow 80-100 days)
  if (avgInterval >= 80 && avgInterval <= 100) {
    return 'quarterly';
  }

  // Annual: ~365 days (allow 350-380 days)
  if (avgInterval >= 350 && avgInterval <= 380) {
    return 'annual';
  }

  // Bi-weekly or other patterns - still valuable but marked as unknown
  if (intervals.length >= 2) {
    return 'unknown';
  }

  return null;
}

/**
 * Group subscriptions by type (Streaming, Fitness, etc.)
 */
function groupSubscriptions(recurring: RecurringTransaction[]): SubscriptionGroup[] {
  const groupDefinitions: Record<string, string[]> = {
    'Streaming Services': ['netflix', 'hulu', 'disney', 'hbo', 'paramount', 'peacock', 'youtube', 'prime video', 'apple tv'],
    'Music & Podcasts': ['spotify', 'apple music', 'pandora', 'tidal', 'soundcloud'],
    'Fitness & Health': ['gym', 'fitness', 'planet', 'crunch', 'peloton', 'crossfit', 'yoga', 'health'],
    'Software & Tools': ['adobe', 'microsoft', 'google', 'dropbox', 'notion', 'slack', 'zoom', 'github'],
    'Utilities & Bills': ['electric', 'gas', 'water', 'internet', 'phone', 'cable', 'insurance'],
    'News & Media': ['times', 'post', 'journal', 'magazine', 'news', 'medium'],
  };

  const groups: Record<string, SubscriptionGroup> = {};

  // Initialize groups
  for (const groupName of Object.keys(groupDefinitions)) {
    groups[groupName] = {
      groupName,
      subscriptions: [],
      totalMonthly: 0,
      totalAnnual: 0,
      count: 0,
    };
  }

  // Add "Other Subscriptions" group
  groups['Other Subscriptions'] = {
    groupName: 'Other Subscriptions',
    subscriptions: [],
    totalMonthly: 0,
    totalAnnual: 0,
    count: 0,
  };

  // Categorize each subscription
  for (const sub of recurring) {
    const merchantLower = sub.merchant.toLowerCase();
    let placed = false;

    for (const [groupName, keywords] of Object.entries(groupDefinitions)) {
      if (keywords.some(keyword => merchantLower.includes(keyword))) {
        groups[groupName].subscriptions.push(sub);
        groups[groupName].count++;

        // Add to monthly total (convert annual to monthly)
        if (sub.frequency === 'monthly') {
          groups[groupName].totalMonthly += sub.averageAmount;
        } else if (sub.frequency === 'annual') {
          groups[groupName].totalAnnual += sub.averageAmount;
          groups[groupName].totalMonthly += sub.averageAmount / 12;
        } else if (sub.frequency === 'quarterly') {
          groups[groupName].totalMonthly += sub.averageAmount / 3;
        }

        placed = true;
        break;
      }
    }

    // If not matched, add to "Other"
    if (!placed) {
      groups['Other Subscriptions'].subscriptions.push(sub);
      groups['Other Subscriptions'].count++;

      if (sub.frequency === 'monthly') {
        groups['Other Subscriptions'].totalMonthly += sub.averageAmount;
      } else if (sub.frequency === 'annual') {
        groups['Other Subscriptions'].totalAnnual += sub.averageAmount;
        groups['Other Subscriptions'].totalMonthly += sub.averageAmount / 12;
      } else if (sub.frequency === 'quarterly') {
        groups['Other Subscriptions'].totalMonthly += sub.averageAmount / 3;
      }
    }
  }

  // Return only groups with subscriptions
  return Object.values(groups).filter(g => g.count > 0);
}

/**
 * Calculate days between two date strings
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date string
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
