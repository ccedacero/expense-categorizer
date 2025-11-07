/**
 * Rule-Based Categorizer (No API Required)
 *
 * FREE alternative that doesn't need any API keys
 * Uses smart keyword matching instead of AI
 */

import { Transaction, CategorizedTransaction, Category, CategorizationResult, CategorySummary } from './types';
import { CATEGORIES } from './constants';

export async function categorizeTransactions(
  transactions: Transaction[]
): Promise<CategorizationResult> {
  if (transactions.length === 0) {
    return {
      transactions: [],
      summary: [],
      totalExpenses: 0,
      totalIncome: 0,
    };
  }

  // Use rule-based categorization
  const categorized = transactions.map(t => ({
    ...t,
    category: ruleBasedCategorize(t),
    confidence: 0.85, // Rule-based is pretty accurate!
  }));

  const summary = calculateSummary(categorized);
  const totalExpenses = categorized
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = categorized
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions: categorized,
    summary,
    totalExpenses,
    totalIncome,
  };
}

/**
 * Smart rule-based categorization
 */
function ruleBasedCategorize(transaction: Transaction): Category {
  const desc = transaction.description.toLowerCase();
  const amount = transaction.amount;

  // Income detection
  if (amount > 0) {
    if (desc.includes('salary') || desc.includes('deposit') || desc.includes('payroll') || desc.includes('direct dep')) {
      return 'Income';
    }
    if (desc.includes('transfer') || desc.includes('venmo') || desc.includes('zelle') || desc.includes('paypal')) {
      return 'Transfer';
    }
    if (desc.includes('refund') || desc.includes('return') || desc.includes('cashback')) {
      return 'Income';
    }
    return 'Income';
  }

  // Transportation
  if (
    desc.includes('uber') || desc.includes('lyft') ||
    desc.includes('gas') || desc.includes('shell') || desc.includes('chevron') ||
    desc.includes('parking') || desc.includes('metro') || desc.includes('transit') ||
    desc.includes('exxon') || desc.includes('bp ') || desc.includes('citgo')
  ) {
    return 'Transportation';
  }

  // Food & Dining
  if (
    desc.includes('starbucks') || desc.includes('coffee') || desc.includes('cafe') ||
    desc.includes('restaurant') || desc.includes('pizza') || desc.includes('burger') ||
    desc.includes('chipotle') || desc.includes('mcdonalds') || desc.includes('subway') ||
    desc.includes('taco bell') || desc.includes('kfc') || desc.includes('wendys') ||
    desc.includes('panera') || desc.includes('doordash') || desc.includes('uber eats') ||
    desc.includes('grubhub') || desc.includes('postmates') || desc.includes('seamless')
  ) {
    return 'Food & Dining';
  }

  // Groceries
  if (
    desc.includes('whole foods') || desc.includes('safeway') || desc.includes('kroger') ||
    desc.includes('trader') || desc.includes('grocery') || desc.includes('market') ||
    desc.includes('walmart') || desc.includes('target') || desc.includes('costco') ||
    desc.includes('aldi') || desc.includes('sprouts') || desc.includes('publix')
  ) {
    return 'Groceries';
  }

  // Shopping
  if (
    desc.includes('amazon') || desc.includes('amzn') ||
    desc.includes('best buy') || desc.includes('apple store') ||
    desc.includes('nordstrom') || desc.includes('macys') || desc.includes('gap') ||
    desc.includes('h&m') || desc.includes('zara') || desc.includes('nike') ||
    desc.includes('old navy') || desc.includes('tj maxx') || desc.includes('ross')
  ) {
    return 'Shopping';
  }

  // Entertainment
  if (
    desc.includes('netflix') || desc.includes('spotify') || desc.includes('hulu') ||
    desc.includes('disney') || desc.includes('hbo') || desc.includes('apple music') ||
    desc.includes('youtube') || desc.includes('twitch') || desc.includes('steam') ||
    desc.includes('playstation') || desc.includes('xbox') || desc.includes('nintendo') ||
    desc.includes('movie') || desc.includes('theater') || desc.includes('cinema')
  ) {
    return 'Entertainment';
  }

  // Bills & Utilities
  if (
    desc.includes('electric') || desc.includes('utility') || desc.includes('power') ||
    desc.includes('internet') || desc.includes('phone') || desc.includes('mobile') ||
    desc.includes('verizon') || desc.includes('at&t') || desc.includes('t-mobile') ||
    desc.includes('comcast') || desc.includes('spectrum') || desc.includes('xfinity') ||
    desc.includes('water') || desc.includes('sewer') || desc.includes('trash') ||
    desc.includes('insurance') || desc.includes('rent') || desc.includes('mortgage')
  ) {
    return 'Bills & Utilities';
  }

  // Healthcare
  if (
    desc.includes('cvs') || desc.includes('walgreens') || desc.includes('pharmacy') ||
    desc.includes('doctor') || desc.includes('hospital') || desc.includes('medical') ||
    desc.includes('dental') || desc.includes('health') || desc.includes('clinic')
  ) {
    return 'Healthcare';
  }

  // Travel
  if (
    desc.includes('hotel') || desc.includes('motel') || desc.includes('inn') ||
    desc.includes('airline') || desc.includes('flight') || desc.includes('airways') ||
    desc.includes('airbnb') || desc.includes('booking') || desc.includes('expedia') ||
    desc.includes('hertz') || desc.includes('enterprise') || desc.includes('rental car')
  ) {
    return 'Travel';
  }

  // Transfer
  if (
    desc.includes('transfer') || desc.includes('xfer') ||
    desc.includes('venmo') || desc.includes('zelle') || desc.includes('paypal') ||
    desc.includes('cash app') || desc.includes('apple pay')
  ) {
    return 'Transfer';
  }

  // Business Expenses
  if (
    desc.includes('realtor association') || desc.includes('mls') ||
    desc.includes('association for computing') || desc.includes('acm membership') ||
    desc.includes('bar association') || desc.includes('medical association') ||
    desc.includes('professional organization') || desc.includes('chamber of commerce') ||
    desc.includes('license fee') || desc.includes('professional license') ||
    desc.includes('certification') || desc.includes('continuing education') ||
    desc.includes('linkedin premium') || desc.includes('github pro') ||
    desc.includes('coworking') || desc.includes('wework')
  ) {
    return 'Business Expenses';
  }

  // Charity/Donations
  if (
    desc.includes('habitat for humanity') || desc.includes('hfh') || desc.includes('habitat c') ||
    desc.includes('red cross') || desc.includes('united way') ||
    desc.includes('salvation army') || desc.includes('goodwill') ||
    desc.includes('donation') || desc.includes('donate') ||
    desc.includes('nonprofit') || desc.includes('non-profit') ||
    desc.includes('charity') || desc.includes('charitable')
  ) {
    return 'Charity/Donations';
  }

  // Gift Cards
  if (
    desc.includes('your-saving') || desc.includes('yoursaving') ||
    desc.includes('raise.com') || desc.includes('cardcash') ||
    desc.includes('gift card') || desc.includes('giftcard') ||
    desc.includes('egift') || desc.includes('e-gift')
  ) {
    return 'Gift Cards';
  }

  return 'Other';
}

function calculateSummary(transactions: CategorizedTransaction[]): CategorySummary[] {
  const categoryTotals: Map<Category, { total: number; count: number }> = new Map();

  transactions.forEach(t => {
    const existing = categoryTotals.get(t.category) || { total: 0, count: 0 };
    categoryTotals.set(t.category, {
      total: existing.total + Math.abs(t.amount),
      count: existing.count + 1,
    });
  });

  const totalAmount = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.total, 0);

  const summary: CategorySummary[] = Array.from(categoryTotals.entries())
    .map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
      percentage: totalAmount > 0 ? (stats.total / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return summary;
}
