/**
 * AI Categorizer
 *
 * Uses Claude API to categorize transactions intelligently
 * Optimized for:
 * - Speed (uses Claude Haiku)
 * - Cost (batch processing)
 * - Accuracy (structured prompts)
 */

import Anthropic from '@anthropic-ai/sdk';
import { Transaction, CategorizedTransaction, Category, CategorizationResult, CategorySummary } from './types';
import { CATEGORIES } from './constants';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Categorize transactions using Claude AI
 */
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

  // Batch categorize for efficiency
  const categorized = await categorizeBatch(transactions);

  // Calculate summary
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
 * Batch categorize transactions using Claude
 */
async function categorizeBatch(
  transactions: Transaction[]
): Promise<CategorizedTransaction[]> {
  // Prepare prompt with all transactions
  const transactionList = transactions
    .map((t, i) => `${i + 1}. ${t.description} | $${t.amount}`)
    .join('\n');

  const prompt = `You are an expert financial analyst. Categorize these transactions into the most appropriate category.

Available categories:
${CATEGORIES.join(', ')}

Rules:
- Use "Income" for positive amounts that are salary, deposits, refunds
- Use "Transfer" for moving money between accounts
- Use "Food & Dining" for restaurants, cafes, fast food
- Use "Groceries" for supermarkets, grocery stores
- Use "Transportation" for gas, uber, parking, car-related
- Use "Bills & Utilities" for electricity, internet, phone, subscriptions
- Use "Shopping" for retail purchases, clothing, electronics
- Use "Entertainment" for movies, games, hobbies
- Use "Healthcare" for medical, pharmacy, insurance
- Use "Travel" for hotels, flights, vacation
- Use "Other" only if truly doesn't fit any category

Transactions:
${transactionList}

Respond with ONLY a JSON array of categories in the same order, nothing else.
Format: ["Category Name", "Category Name", ...]

Example response: ["Food & Dining", "Transportation", "Groceries"]`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Fast and cheap
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const categories = JSON.parse(content.text) as string[];

    // Validate and map categories
    return transactions.map((transaction, index) => {
      const category = categories[index];
      const validCategory = CATEGORIES.includes(category as Category)
        ? (category as Category)
        : 'Other';

      return {
        ...transaction,
        category: validCategory,
        confidence: validCategory === category ? 0.95 : 0.5,
      };
    });
  } catch (error) {
    console.error('AI categorization failed:', error);

    // Fallback to rule-based categorization
    return transactions.map(t => ({
      ...t,
      category: fallbackCategorize(t),
      confidence: 0.3,
    }));
  }
}

/**
 * Simple rule-based fallback categorization
 */
function fallbackCategorize(transaction: Transaction): Category {
  const desc = transaction.description.toLowerCase();
  const amount = transaction.amount;

  // Income detection
  if (amount > 0) {
    if (desc.includes('salary') || desc.includes('deposit') || desc.includes('payroll')) {
      return 'Income';
    }
    if (desc.includes('transfer') || desc.includes('venmo') || desc.includes('zelle')) {
      return 'Transfer';
    }
    return 'Income';
  }

  // Expense detection
  if (desc.includes('uber') || desc.includes('lyft') || desc.includes('gas') || desc.includes('shell') || desc.includes('chevron')) {
    return 'Transportation';
  }

  if (desc.includes('starbucks') || desc.includes('restaurant') || desc.includes('cafe') || desc.includes('pizza') || desc.includes('burger')) {
    return 'Food & Dining';
  }

  if (desc.includes('whole foods') || desc.includes('safeway') || desc.includes('kroger') || desc.includes('trader') || desc.includes('grocery')) {
    return 'Groceries';
  }

  if (desc.includes('amazon') || desc.includes('target') || desc.includes('walmart') || desc.includes('best buy')) {
    return 'Shopping';
  }

  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('hulu') || desc.includes('disney')) {
    return 'Entertainment';
  }

  if (desc.includes('electric') || desc.includes('utility') || desc.includes('internet') || desc.includes('phone') || desc.includes('verizon') || desc.includes('at&t')) {
    return 'Bills & Utilities';
  }

  if (desc.includes('cvs') || desc.includes('pharmacy') || desc.includes('doctor') || desc.includes('hospital')) {
    return 'Healthcare';
  }

  if (desc.includes('hotel') || desc.includes('airline') || desc.includes('flight') || desc.includes('airbnb')) {
    return 'Travel';
  }

  return 'Other';
}

/**
 * Calculate category summary statistics
 */
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
    .sort((a, b) => b.total - a.total); // Sort by total descending

  return summary;
}
