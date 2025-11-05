/**
 * Summary calculation utility
 *
 * Separated from categorizer to avoid importing Anthropic SDK in browser
 */

import { CategorizedTransaction, Category, CategorySummary } from './types';

export function calculateSummary(transactions: CategorizedTransaction[]): CategorySummary[] {
  const categoryTotals: Map<Category, { total: number; count: number }> = new Map();

  // Only count actual spending (negative amounts, excluding payments)
  transactions
    .filter(t => t.amount < 0 || (t.amount > 0 && t.category === 'Income'))
    .forEach(t => {
      const existing = categoryTotals.get(t.category) || { total: 0, count: 0 };
      categoryTotals.set(t.category, {
        total: existing.total + Math.abs(t.amount),
        count: existing.count + 1,
      });
    });

  const totalAmount = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.total, 0);

  return Array.from(categoryTotals.entries())
    .map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
      percentage: totalAmount > 0 ? (stats.total / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}
