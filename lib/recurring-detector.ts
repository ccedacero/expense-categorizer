/**
 * Recurring Transaction & Subscription Detection
 *
 * Detects patterns in transactions to identify:
 * - Monthly subscriptions (Netflix, Spotify, gym, etc.)
 * - Annual subscriptions (software, memberships)
 * - Recurring bills (utilities, insurance)
 *
 * Helps users find "hidden" subscriptions and track recurring expenses.
 *
 * IMPROVED ALGORITHM:
 * - Stricter pattern matching (3+ occurrences, tighter variance)
 * - Category-based filtering (excludes groceries, restaurants, gas)
 * - Merchant exclusion patterns (marketplaces, retail stores)
 * - AI validation for borderline cases
 */

import { CategorizedTransaction, Category } from './types';
import Anthropic from '@anthropic-ai/sdk';

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
 * Merchant patterns to EXCLUDE (definitely not subscriptions)
 */
const EXCLUDED_MERCHANT_PATTERNS = [
  // Marketplaces (have order IDs, variable items)
  /amazon\s*(mktpl|mktp)/i,
  /amzn\s*mktp/i,
  /amazon\.com[a-z0-9]+/i,  // Amazon.com with order IDs
  /ebay/i,

  // Retail stores
  /wal-?mart(?!\s*\+)/i,  // Walmart (unless Walmart+ subscription)
  /target(?!\s*(circle|subscription))/i,
  /costco(?!\s*(membership|whse))/i,  // Costco gas, not membership
  /sams?\s*(scan|club)(?!\s*membership)/i,  // Sam's Club purchases, not membership

  // Restaurants & Fast Food
  /chipotle/i,
  /mcdonald/i,
  /burger\s*king/i,
  /wendy'?s/i,
  /taco\s*bell/i,
  /subway/i,
  /starbucks/i,
  /dunkin/i,
  /panera/i,
  /popeyes/i,
  /kfc/i,
  /pizza/i,
  /restaurant/i,
  /cafe/i,
  /diner/i,
  /deli/i,
  /bistro/i,
  /grill/i,
  /eatery/i,
  /\btst\b/i,  // TST prefix for restaurants

  // Food Delivery (orders, not subscriptions)
  /dd\s+(doordash|dd)/i,
  /doordash(?!.*plus)/i,
  /uber\s*eats/i,
  /grubhub/i,
  /postmates/i,

  // Gas Stations
  /sunoco/i,
  /shell\s*\d/i,
  /exxon/i,
  /bp\s*#/i,
  /mobil/i,
  /chevron/i,
  /citgo/i,
  /gulf/i,
  /speedway/i,
  /wawa/i,
  /7-eleven/i,
  /\bcostco\s*gas\b/i,
  /\bgas\b/i,

  // Home Improvement
  /home\s*depot/i,
  /lowe'?s/i,

  // Groceries
  /trader\s*joe/i,
  /whole\s*foods/i,
  /aldi/i,
  /hannaford/i,
  /safeway/i,
  /kroger/i,
  /publix/i,
  /wegmans/i,
  /market\s*(?:32|\d+)/i,
  /c\s*town/i,

  // Generic Payments & Transfers
  /payment\s*thank\s*you/i,
  /automatic\s*payment/i,
  /^payment$/i,

  // Transportation (one-time rides/tolls, not passes)
  /uber\s*trip/i,
  /lyft\s*ride/i,
  /taxi/i,
  /cab/i,
  /e-z(?!pass\s*subscription)/i,  // E-ZPass tolls (rebills, not subscriptions)
  /amtrak\s*mobile/i,  // Train tickets
  /metro(?!\s*(pass|card|subscription))/i,  // Metro single rides, not passes
  /mta(?!.*monthly|.*pass)/i,  // MTA single rides
  /cdta/i,  // Transit single rides

  // Misc shopping
  /cvs\/pharmacy/i,
  /walgreens/i,
  /rite\s*aid/i,
  /dollar\s*(tree|general)/i,

  // Parking (one-time, not monthly)
  /parking(?!\s*(pass|subscription|monthly))/i,
  /spothero/i,

  // Foreign transaction fees
  /foreign\s*transaction/i,
];

/**
 * Strong subscription indicators (keywords in merchant name)
 */
const SUBSCRIPTION_KEYWORDS = [
  // Streaming Services
  'netflix', 'hulu', 'disney', 'hbo', 'max', 'paramount',
  'peacock', 'showtime', 'starz', 'cinemax', 'prime video',
  'youtube premium', 'youtube tv', 'apple tv',

  // Music Streaming
  'spotify', 'apple music', 'pandora', 'tidal', 'soundcloud', 'deezer',

  // Software/Cloud/Tools
  'adobe', 'microsoft 365', 'office 365', 'google one', 'google storage',
  'dropbox', 'icloud', 'onedrive', 'github', 'notion', 'evernote',
  'grammarly', 'canva', 'figma', 'slack', 'zoom', 'calendly',

  // Utilities (actual services)
  'spectrum', 'comcast', 'xfinity', 'verizon', 'at&t', 't-mobile',
  'electric', 'water board', 'gas company', 'internet', 'cable',

  // Insurance
  'insurance', 'mutual', 'geico', 'progressive', 'state farm', 'allstate',

  // Fitness & Wellness
  'planet fitness', 'la fitness', 'equinox', 'peloton', 'gym',
  'crunch', 'lifetime fitness', 'anytime fitness', 'orangetheory',

  // Memberships & Subscriptions
  'aaa membership', 'costco membership', 'sams club membership',
  'prime', 'subscription', 'premium', 'membership dues',

  // News & Media
  'new york times', 'nyt', 'wsj', 'wall street journal',
  'washington post', 'medium', 'substack',

  // Gaming
  'playstation plus', 'xbox game pass', 'nintendo switch online',
  'steam', 'epic games',

  // Other Common Subscriptions
  'audible', 'kindle unlimited', 'chewy autoship', 'dollar shave',
  'hello fresh', 'blue apron', 'wine club', 'book club',
  'kahoot', 'doordash plus', 'dashpass',

  // Service providers
  'roland', 'service', 'lawn', 'pest control',
];

/**
 * Categories that are UNLIKELY to contain subscriptions
 */
const EXCLUDED_CATEGORIES: Category[] = [
  'Food & Dining',
  'Groceries',
  'Shopping',  // Too broad, needs keyword validation
  'Travel',  // Usually one-time
  'Other',
];

/**
 * Categories that are LIKELY to contain subscriptions
 */
const LIKELY_SUBSCRIPTION_CATEGORIES: Category[] = [
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',  // Insurance, medical memberships
];

/**
 * Detect recurring transactions and subscriptions
 */
export async function detectRecurringTransactions(
  transactions: CategorizedTransaction[]
): Promise<RecurringAnalysis> {
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

  // Step 2: Identify recurring patterns with stricter criteria
  const candidatePatterns: RecurringTransaction[] = [];

  for (const [merchant, txns] of merchantGroups) {
    if (txns.length < 3) continue; // STRICTER: Need at least 3 occurrences

    const pattern = analyzePattern(merchant, txns);
    if (pattern) {
      candidatePatterns.push(pattern);
    }
  }

  // Step 3: Apply strict filtering
  const recurring: RecurringTransaction[] = [];

  for (const pattern of candidatePatterns) {
    // Check if merchant should be excluded
    if (isExcludedMerchant(pattern.merchant)) {
      continue;
    }

    // Check category exclusions (unless has strong subscription keywords)
    if (
      EXCLUDED_CATEGORIES.includes(pattern.category) &&
      !hasSubscriptionKeywords(pattern.merchant)
    ) {
      continue;
    }

    // Apply stricter confidence threshold
    if (pattern.confidence < 0.75) {
      // For borderline cases, try AI validation if enabled
      if (pattern.confidence >= 0.65) {
        const aiValidation = await validateWithAI(pattern);
        if (aiValidation && aiValidation.isSubscription) {
          pattern.confidence = aiValidation.confidence;
          recurring.push(pattern);
        }
      }
      continue;
    }

    // Pattern passed all filters
    recurring.push(pattern);
  }

  // Step 4: Sort by most recent and highest spend
  recurring.sort((a, b) => b.totalSpent - a.totalSpent);

  // Step 5: Group subscriptions by type
  const groups = groupSubscriptions(recurring);

  // Step 6: Calculate totals
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

  // Step 7: Identify "hidden" subscriptions (small recurring charges)
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
 * Check if merchant matches exclusion patterns
 */
function isExcludedMerchant(merchant: string): boolean {
  return EXCLUDED_MERCHANT_PATTERNS.some(pattern => pattern.test(merchant));
}

/**
 * Check if merchant contains strong subscription keywords
 */
function hasSubscriptionKeywords(merchant: string): boolean {
  const merchantLower = merchant.toLowerCase();
  return SUBSCRIPTION_KEYWORDS.some(keyword =>
    merchantLower.includes(keyword.toLowerCase())
  );
}

/**
 * Calculate standard deviation
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Validate potential subscription with AI (for borderline cases)
 */
async function validateWithAI(
  pattern: RecurringTransaction
): Promise<{ isSubscription: boolean; confidence: number; reason?: string } | null> {
  try {
    // Only use AI validation if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      return null;
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `Analyze if this is a true subscription or membership service, or just regular recurring purchases:

Merchant: ${pattern.merchant}
Category: ${pattern.category}
Frequency: ${pattern.frequency} (${pattern.occurrences} charges over time)
Average Amount: $${pattern.averageAmount.toFixed(2)}
Sample Dates: ${pattern.dates.slice(0, 3).join(', ')}

Is this a true subscription or membership service? Consider:
1. Fixed recurring services (streaming, software, gym, insurance, utilities) = YES
2. Variable utility bills (electricity, internet with consistent billing) = YES
3. Regular purchases at stores/restaurants (even if frequent) = NO
4. Marketplace purchases with order IDs (Amazon MKTPL, eBay) = NO
5. Gas stations, groceries, restaurants = NO

Respond with JSON only: {"isSubscription": true/false, "confidence": 0.0-1.0, "reason": "brief explanation"}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result;
      }
    }

    return null;
  } catch (error) {
    console.error('AI validation error:', error);
    return null;
  }
}

/**
 * Analyze pattern to determine if recurring (STRICTER VERSION)
 */
function analyzePattern(
  merchant: string,
  transactions: CategorizedTransaction[]
): RecurringTransaction | null {
  if (transactions.length < 3) return null; // STRICTER: Need at least 3

  // Sort by date
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate average amount (use absolute value for expenses)
  const amounts = sorted.map(t => Math.abs(t.amount));
  const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;

  // Calculate amount standard deviation (STRICTER)
  const amountStdDev = standardDeviation(amounts);
  const amountVariancePercent = (amountStdDev / avgAmount) * 100;

  // STRICTER: Check if amounts are highly consistent
  // Fixed subscriptions: < 5% variance (e.g., Netflix always $16.83)
  // Variable subscriptions: < 25% variance (e.g., utility bills)
  const isFixedAmount = amountVariancePercent < 5;
  const isVariableAmount = amountVariancePercent < 25;

  if (!isFixedAmount && !isVariableAmount) {
    return null; // Too much variance, likely not a subscription
  }

  // Calculate time intervals between transactions
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const days = daysBetween(sorted[i - 1].date, sorted[i].date);
    intervals.push(days);
  }

  // Detect frequency pattern
  const frequency = detectFrequency(intervals);
  if (!frequency) return null;

  // STRICTER: Check timing consistency
  const intervalStdDev = standardDeviation(intervals);
  const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
  const intervalVarianceDays = intervalStdDev;

  // For monthly: should be within ~3 days
  // For quarterly/annual: should be within ~7 days
  const isConsistentTiming =
    (frequency === 'monthly' && intervalVarianceDays < 5) ||
    (frequency === 'quarterly' && intervalVarianceDays < 10) ||
    (frequency === 'annual' && intervalVarianceDays < 14) ||
    frequency === 'unknown';

  // Calculate confidence score (STRICTER)
  let confidence = 0.4; // Lower base confidence

  // Amount consistency
  if (isFixedAmount) confidence += 0.3; // Very consistent amounts
  else if (isVariableAmount) confidence += 0.15; // Somewhat consistent

  // Timing consistency
  if (isConsistentTiming) confidence += 0.2;

  // Number of occurrences
  if (sorted.length >= 3) confidence += 0.05;
  if (sorted.length >= 5) confidence += 0.1;
  if (sorted.length >= 8) confidence += 0.1;

  // Strong subscription keywords boost confidence significantly
  if (hasSubscriptionKeywords(merchant)) {
    confidence = Math.min(confidence + 0.3, 1.0);
  }

  // Likely subscription categories
  if (LIKELY_SUBSCRIPTION_CATEGORIES.includes(sorted[0].category)) {
    confidence += 0.1;
  }

  // Predict next expected date
  const lastDate = sorted[sorted.length - 1].date;
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
