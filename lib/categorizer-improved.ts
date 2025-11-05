/**
 * IMPROVED AI Categorizer
 *
 * With expert financial categorization rules
 * Handles credit cards AND bank accounts correctly
 */

import Anthropic from '@anthropic-ai/sdk';
import { Transaction, CategorizedTransaction, Category, CategorizationResult, CategorySummary } from './types';
import { CATEGORIES } from './constants';
import { getCachedCategory, cacheMerchant, getCacheStats } from './merchant-cache';
import { mapChaseCategory } from './chase-category-mapping';
import { calculateSummary } from './summary';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

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

  // Try AI with caching first, fall back to expert rules
  const categorized = await categorizeBatchWithCache(transactions);

  // Calculate summary (properly handling credit cards)
  const summary = calculateSummary(categorized);

  // For credit cards: negative = spending, positive = payment/refund
  // Payments should NOT count as income!
  const spending = categorized
    .filter(t => t.amount < 0 && t.category !== 'Payment' && t.category !== 'Transfer')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const payments = categorized
    .filter(t => t.amount > 0 && (t.category === 'Payment' || t.category === 'Transfer' || t.category === 'Income'))
    .reduce((sum, t) => sum + t.amount, 0);

  // Get cache statistics for monitoring
  const cacheStats = getCacheStats();

  return {
    transactions: categorized,
    summary,
    totalExpenses: spending,
    totalIncome: 0, // Credit cards don't have "income"
    cacheStats, // For monitoring API cost savings
  };
}

/**
 * Categorize with merchant caching for 50-80% cost reduction
 */
async function categorizeBatchWithCache(
  transactions: Transaction[]
): Promise<CategorizedTransaction[]> {
  // Step 1: Check cache for each transaction
  const cached: CategorizedTransaction[] = [];
  const uncached: { transaction: Transaction; index: number }[] = [];

  transactions.forEach((transaction, index) => {
    const cachedResult = getCachedCategory(transaction.description);
    if (cachedResult) {
      // Cache hit! No AI call needed
      cached.push({
        ...transaction,
        category: cachedResult.category,
        confidence: cachedResult.confidence,
      });
    } else {
      // Cache miss - need to categorize with AI
      uncached.push({ transaction, index });
    }
  });

  // Step 2: If everything is cached, return early
  if (uncached.length === 0) {
    return cached;
  }

  // Step 3: Only send uncached transactions to AI
  const uncachedTransactions = uncached.map(u => u.transaction);
  const aiResults = await categorizeBatchWithAI(uncachedTransactions);

  // Step 4: Cache the new results
  aiResults.forEach((result) => {
    cacheMerchant(result.description, result.category, result.confidence || 0.8);
  });

  // Step 5: Combine cached + new results in original order
  const resultMap = new Map<number, CategorizedTransaction>();

  // Add cached results
  transactions.forEach((transaction, index) => {
    const cachedResult = getCachedCategory(transaction.description);
    if (cachedResult) {
      resultMap.set(index, {
        ...transaction,
        category: cachedResult.category,
        confidence: cachedResult.confidence,
      });
    }
  });

  // Add AI results for uncached items
  uncached.forEach(({ index }, aiIndex) => {
    resultMap.set(index, aiResults[aiIndex]);
  });

  // Return in original order
  return transactions.map((_, index) => resultMap.get(index)!);
}

/**
 * Original AI categorization (now only called for uncached merchants)
 */
async function categorizeBatchWithAI(
  transactions: Transaction[]
): Promise<CategorizedTransaction[]> {
  const transactionList = transactions
    .map((t, i) => `${i + 1}. ${t.description} | $${t.amount}`)
    .join('\n');

  const prompt = `You are a financial expert with 20 years of budgeting experience. Categorize these transactions from bank accounts and credit cards.

Available categories:
${CATEGORIES.join(', ')}

IMPORTANT RULES FOR PAYMENTS VS TRANSFERS:
- "Payment Thank You" = Payment (NOT Income!)
- Credit card payments = Payment (paying off debt)
- Loan/mortgage payments = Payment (paying off debt)
- Venmo/Zelle/CashApp = Transfer (moving your own money)
- Transfer between accounts = Transfer (moving your own money)
- Refunds = Income

MERCHANT CATEGORIZATION:
- Walmart/Target/Costco/Sam's Club = Groceries (unless clearly other)
- DoorDash/Uber Eats/GrubHub = Food & Dining
- Chipotle/Fast food/Restaurants = Food & Dining
- Starbucks/Coffee shops = Food & Dining
- Gas stations (Shell/Exxon/Sunoco) = Transportation
- Spectrum/Verizon/AT&T = Bills & Utilities
- Amazon can be Shopping OR Groceries (use judgment)
- E-ZPass/Tolls = Transportation
- Airline/Hotel/Airbnb = Travel
- CVS/Pharmacy = Healthcare

Transactions:
${transactionList}

Respond with ONLY a JSON array, no other text.
Format: ["Category", "Category", ...]`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response');
    }

    const categories = JSON.parse(content.text) as string[];

    return transactions.map((transaction, index) => {
      const category = categories[index];
      const validCategory = CATEGORIES.includes(category as Category)
        ? (category as Category)
        : smartCategorize(transaction); // Fallback to smart categorization

      return {
        ...transaction,
        category: validCategory,
        confidence: validCategory === category ? 0.95 : 0.85,
      };
    });
  } catch (error) {
    // Don't log error details (may contain transaction data)
    console.error('AI categorization failed - falling back to smart rules');
    // Fall back to SMART rules (uses existing categories if available)
    return transactions.map(t => ({
      ...t,
      category: smartCategorize(t),
      confidence: t.originalCategory ? 0.95 : 0.80, // Higher confidence if using bank's category
    }));
  }
}

/**
 * SMART CATEGORIZATION with Priority Logic
 *
 * Priority Order:
 * 1. If Type == "Payment" → "Payment"
 * 2. If originalCategory exists (from Chase CSV) → Map and use it
 * 3. If refund (Amount > 0 and Type != "Payment") → Try originalCategory or keyword match
 * 4. Fall back to expert rules
 * 5. Default to "Other"
 */
function smartCategorize(t: Transaction): Category {
  // PRIORITY 1: Handle Payments (Type == "Payment")
  if (t.type && t.type.toLowerCase() === 'payment') {
    return 'Payment';
  }

  // PRIORITY 2: Use existing category from CSV (e.g., Chase Category column)
  if (t.originalCategory) {
    const mappedCategory = mapChaseCategory(t.originalCategory);
    if (mappedCategory) {
      return mappedCategory;
    }
  }

  // PRIORITY 3: Handle Refunds (positive amount, not a payment)
  if (t.amount > 0) {
    // Try to use original category for refunds
    if (t.originalCategory) {
      const mappedCategory = mapChaseCategory(t.originalCategory);
      if (mappedCategory) {
        return mappedCategory;
      }
    }

    // Fall back to keyword matching for refunds
    const keywordCategory = expertCategorize(t);
    if (keywordCategory !== 'Other') {
      return keywordCategory;
    }

    // Default refunds to Income if we can't determine category
    return 'Income';
  }

  // PRIORITY 4: Fall back to expert rules for expenses
  return expertCategorize(t);
}

/**
 * EXPERT CATEGORIZATION RULES
 * Based on years of financial analysis experience
 * Used as fallback when no existing category is available
 */
function expertCategorize(t: Transaction): Category {
  const desc = t.description.toLowerCase();
  const amount = t.amount;

  // ===================
  // PAYMENTS (paying off debt)
  // ===================

  // Credit card payments (positive amounts with "payment" keyword)
  if (amount > 0 && (
    desc.includes('payment thank you') ||
    desc.includes('automatic payment') ||
    desc.includes('online payment') ||
    desc.includes('mobile payment') ||
    desc.includes('credit card payment')
  )) {
    return 'Payment';
  }

  // Loan/mortgage payments
  if (
    desc.includes('loan payment') ||
    desc.includes('mortgage payment') ||
    desc.includes('student loan')
  ) {
    return 'Payment';
  }

  // ===================
  // TRANSFERS (moving your own money)
  // ===================

  // Transfers between accounts
  if (
    desc.includes('transfer') || desc.includes('xfer') ||
    desc.includes('venmo') || desc.includes('zelle') ||
    desc.includes('paypal transfer') || desc.includes('cash app')
  ) {
    return 'Transfer';
  }

  // ===================
  // INCOME & REFUNDS
  // ===================

  if (amount > 0) {
    if (
      desc.includes('refund') || desc.includes('return') ||
      desc.includes('credit') || desc.includes('cashback') ||
      desc.includes('reward')
    ) {
      return 'Income';
    }
    if (
      desc.includes('salary') || desc.includes('payroll') ||
      desc.includes('deposit') || desc.includes('direct dep')
    ) {
      return 'Income';
    }
    // Default positive = income (unless it's a payment, handled above)
    return 'Income';
  }

  // ===================
  // FOOD & DINING
  // ===================

  if (
    // Fast food chains
    desc.includes('chipotle') || desc.includes('mcdonalds') || desc.includes('burger king') ||
    desc.includes('taco bell') || desc.includes('kfc') || desc.includes('wendys') ||
    desc.includes('popeyes') || desc.includes('subway') || desc.includes('panera') ||

    // Food delivery
    desc.includes('doordash') || desc.includes('dd *door') || desc.includes('uber eats') ||
    desc.includes('grubhub') || desc.includes('postmates') || desc.includes('seamless') ||

    // Coffee shops
    desc.includes('starbucks') || desc.includes('coffee') || desc.includes('cafe') ||
    desc.includes('espresso') || desc.includes('cafe madison') || desc.includes('alias coffee') ||
    desc.includes('uncommon grounds') || desc.includes('dunkin') ||

    // Restaurants (common patterns)
    desc.includes('restaurant') || desc.includes('grill') || desc.includes('diner') ||
    desc.includes('bistro') || desc.includes('taqueria') || desc.includes('pizz') ||
    desc.includes('sushi') || desc.includes('mexican') || desc.includes('chinese') ||
    desc.includes('thai') || desc.includes('indian') || desc.includes('italian') ||
    desc.includes('bagel') || desc.includes('deli') || desc.includes('empanada') ||
    desc.includes('tren maya') || desc.includes('pequeno') || desc.includes('andes') ||
    desc.includes('alpunto') || desc.includes('aguilas') || desc.includes('cava') ||
    desc.includes('sakuramen') || desc.includes('bibibop') || desc.includes('applebees')
  ) {
    return 'Food & Dining';
  }

  // ===================
  // GROCERIES
  // ===================

  if (
    // Major grocery stores
    desc.includes('walmart') || desc.includes('wal-mart') || desc.includes('wal mart') ||
    desc.includes('target') || desc.includes('costco whse') || desc.includes('costco warehouse') ||
    desc.includes('sams club') || desc.includes('samsclub') || desc.includes('sam\'s club') ||
    desc.includes('sams scan') || desc.includes('whole foods') || desc.includes('trader joe') ||
    desc.includes('safeway') || desc.includes('kroger') || desc.includes('aldi') ||
    desc.includes('hannaford') || desc.includes('c town') || desc.includes('c-town') ||
    desc.includes('market32') || desc.includes('price chopper') || desc.includes('pchopper') ||
    desc.includes('grocery') || desc.includes('food co-op') || desc.includes('honest weight') ||
    desc.includes('bello poultry') || desc.includes('indian ladder farms')
  ) {
    return 'Groceries';
  }

  // ===================
  // TRANSPORTATION
  // ===================

  if (
    // Gas stations
    desc.includes('gas') || desc.includes('fuel') ||
    desc.includes('shell') || desc.includes('exxon') || desc.includes('chevron') ||
    desc.includes('sunoco') || desc.includes('bp ') || desc.includes('citgo') ||
    desc.includes('mobil') || desc.includes('valero') || desc.includes('costco gas') ||

    // Rideshare
    desc.includes('uber') || desc.includes('lyft') ||

    // Parking & Tolls
    desc.includes('parking') || desc.includes('e-z') || desc.includes('ezpass') ||
    desc.includes('toll') || desc.includes('spothero') ||

    // Public transit
    desc.includes('metro') || desc.includes('mta') || desc.includes('subway') ||
    desc.includes('cdta') || desc.includes('metrocard')
  ) {
    return 'Transportation';
  }

  // ===================
  // BILLS & UTILITIES
  // ===================

  if (
    // Internet/Cable/Phone
    desc.includes('spectrum') || desc.includes('comcast') || desc.includes('xfinity') ||
    desc.includes('verizon') || desc.includes('at&t') || desc.includes('t-mobile') ||
    desc.includes('sprint') || desc.includes('metro by t-mobile') || desc.includes('mint mobile') ||
    desc.includes('straighttalk') ||

    // Utilities
    desc.includes('electric') || desc.includes('power') || desc.includes('utility') ||
    desc.includes('water') || desc.includes('sewer') || desc.includes('albany water') ||

    // Insurance
    desc.includes('insurance') || desc.includes('sterling insurance') ||
    desc.includes('new york central mutual') ||

    // Memberships
    desc.includes('aaa membership')
  ) {
    return 'Bills & Utilities';
  }

  // ===================
  // ENTERTAINMENT
  // ===================

  if (
    desc.includes('netflix') || desc.includes('hulu') || desc.includes('disney') ||
    desc.includes('spotify') || desc.includes('apple music') || desc.includes('amazon music') ||
    desc.includes('prime video') || desc.includes('hbo') || desc.includes('youtube') ||
    desc.includes('twitch') || desc.includes('kindle') ||
    desc.includes('kahoot') || desc.includes('groupon')
  ) {
    return 'Entertainment';
  }

  // ===================
  // EDUCATION
  // ===================

  if (
    desc.includes('audible') ||
    desc.includes('coursera') || desc.includes('udemy') || desc.includes('skillshare') ||
    desc.includes('masterclass') || desc.includes('khan academy')
  ) {
    return 'Education';
  }

  // ===================
  // SHOPPING
  // ===================

  if (
    desc.includes('amazon') && !desc.includes('prime video') ||
    desc.includes('amzn mktp') ||
    desc.includes('ebay') || desc.includes('etsy') ||
    desc.includes('best buy') || desc.includes('apple store') ||
    desc.includes('marshalls') || desc.includes('tj maxx') || desc.includes('ross') ||
    desc.includes('lush') || desc.includes('dollar tree')
  ) {
    return 'Shopping';
  }

  // ===================
  // HEALTHCARE
  // ===================

  if (
    desc.includes('cvs') || desc.includes('walgreens') || desc.includes('pharmacy') ||
    desc.includes('doctor') || desc.includes('dr.') || desc.includes('hospital') ||
    desc.includes('medical') || desc.includes('dental') || desc.includes('optometry') ||
    desc.includes('dermatology') || desc.includes('health') || desc.includes('clinic') ||
    desc.includes('stack  opt') || desc.includes('btfdental') || desc.includes('trinity health') ||
    desc.includes('cdphp')
  ) {
    return 'Healthcare';
  }

  // ===================
  // TRAVEL
  // ===================

  if (
    desc.includes('hotel') || desc.includes('motel') || desc.includes('inn') ||
    desc.includes('airline') || desc.includes('flight') || desc.includes('airways') ||
    desc.includes('airbnb') || desc.includes('booking') || desc.includes('expedia') ||
    desc.includes('jetblue') || desc.includes('united') || desc.includes('delta') ||
    desc.includes('american air') || desc.includes('southwest') ||
    desc.includes('amtrak') || desc.includes('train') ||
    desc.includes('airport') || desc.includes('jfk international') ||
    desc.includes('foreign transaction fee') // Travel indicator
  ) {
    return 'Travel';
  }

  // ===================
  // HOUSEHOLD
  // ===================

  if (
    desc.includes('roland j. down') // Home service/maintenance
  ) {
    return 'Household';
  }

  // ===================
  // SHOPPING (HOME & AUTO)
  // ===================

  if (
    desc.includes('home depot') || desc.includes('lowes') || desc.includes('hardware') ||
    desc.includes('advance auto') || desc.includes('autozone') || desc.includes('napa auto') ||
    desc.includes('car wash') || desc.includes('supreme wash')
  ) {
    return 'Shopping'; // Home improvement is shopping
  }

  // ===================
  // OTHER/CATCH-ALL
  // ===================

  return 'Other';
}

// calculateSummary moved to lib/summary.ts to avoid importing Anthropic SDK in browser
