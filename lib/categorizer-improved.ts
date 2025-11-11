/**
 * IMPROVED AI Categorizer
 *
 * Multi-tier categorization system optimized for accuracy and cost:
 *
 * TIER 1: Banks with Built-in Categories (95%+ accuracy)
 * - Chase: Uses Category column mapping
 * - Capital One: Uses Category column mapping + smart grocery detection
 *
 * TIER 2: Banks without Categories (85-90% accuracy)
 * - Bank of America, Wells Fargo, Citibank, Discover, etc.
 * - Uses expert rules + AI with merchant caching
 *
 * Priority Order:
 * 1. Bank category mapping (if available)
 * 2. Expert pattern matching (payments, transfers, common merchants)
 * 3. AI categorization with merchant caching (50-80% cost reduction)
 *
 * See BANK_SUPPORT.md for complete bank compatibility details
 */

import Anthropic from '@anthropic-ai/sdk';
import { Transaction, CategorizedTransaction, Category, CategorizationResult, CategorySummary } from './types';
import { CATEGORIES } from './constants';
import { getCachedCategory, cacheMerchant, getCacheStats } from './merchant-cache';
import { mapChaseCategory } from './chase-category-mapping';
import { mapCapitalOneCategory } from './capital-one-category-mapping';
import { calculateSummary } from './summary';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function categorizeTransactions(
  transactions: Transaction[],
  userRules?: any[] // User's learned rules from localStorage
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
  const categorized = await categorizeBatchWithCache(transactions, userRules);

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
 *
 * PRIORITY ORDER:
 * 1. User-learned rules (from manual corrections) - HIGHEST PRIORITY
 * 2. Bank categories (Capital One/Chase CSVs)
 * 3. Merchant cache (from previous AI calls)
 * 4. AI categorization (Claude Haiku)
 */
async function categorizeBatchWithCache(
  transactions: Transaction[],
  userRules?: any[]
): Promise<CategorizedTransaction[]> {
  // Create applyRules function from passed userRules
  const applyRules = (description: string) => {
    if (!userRules || userRules.length === 0) return null;

    // Normalize merchant name for matching
    const normalized = normalizeMerchantForRules(description);

    // Find matching rule
    const matchingRule = userRules.find(
      (rule: any) => rule.merchantPattern === normalized
    );

    if (matchingRule) {
      return {
        category: matchingRule.category,
        rule: matchingRule,
      };
    }

    return null;
  };

  // Step 1: Separate transactions by categorization method
  const withBankCategory: { transaction: Transaction; index: number }[] = [];
  const learnedRules: { transaction: CategorizedTransaction; index: number }[] = [];
  const cached: CategorizedTransaction[] = [];
  const uncached: { transaction: Transaction; index: number }[] = [];

  transactions.forEach((transaction, index) => {
    // PRIORITY 1: Check user-learned rules FIRST (highest user preference)
    // User explicitly taught the system, so their preference wins over everything
    const ruleMatch = applyRules(transaction.description);
    if (ruleMatch) {
      learnedRules.push({
        transaction: {
          ...transaction,
          category: ruleMatch.category,
          confidence: 1.0, // User rules have maximum confidence
        },
        index,
      });
      return;
    }

    // PRIORITY 2: If transaction has originalCategory from bank, use smart rules
    if (transaction.originalCategory) {
      withBankCategory.push({ transaction, index });
      return;
    }

    // PRIORITY 3: Check merchant cache
    const cachedResult = getCachedCategory(transaction.description);
    if (cachedResult) {
      cached.push({
        ...transaction,
        category: cachedResult.category,
        confidence: cachedResult.confidence,
      });
    } else {
      // PRIORITY 4: Need AI categorization
      uncached.push({ transaction, index });
    }
  });

  // Step 2: Process transactions with bank categories using smart rules
  const bankCategoryResults: CategorizedTransaction[] = withBankCategory.map(({ transaction }) => ({
    ...transaction,
    category: smartCategorize(transaction),
    confidence: 0.95, // High confidence for bank-provided categories + expert rules
  }));

  // Step 2.5: Find transactions that smartCategorize returned "Other" for
  // These should be sent to AI as a fallback for better categorization
  const needsAIFallback: { transaction: Transaction; index: number }[] = [];
  withBankCategory.forEach(({ transaction, index }, resultIdx) => {
    if (bankCategoryResults[resultIdx].category === 'Other') {
      // Expert rules couldn't categorize this - let AI try
      needsAIFallback.push({ transaction, index });
    }
  });

  // Step 3: If no uncached transactions and no AI fallback needed, combine and return early
  if (uncached.length === 0 && needsAIFallback.length === 0) {
    // Combine all results in original order
    const resultMap = new Map<number, CategorizedTransaction>();

    // Add bank category results
    withBankCategory.forEach(({ index }, resultIdx) => {
      resultMap.set(index, bankCategoryResults[resultIdx]);
    });

    // Add learned rules results
    learnedRules.forEach(({ transaction, index }) => {
      resultMap.set(index, transaction);
    });

    // Add cached results
    cached.forEach((result, idx) => {
      // Find original index for cached results
      transactions.forEach((t, originalIdx) => {
        if (!t.originalCategory && t.description === result.description && !resultMap.has(originalIdx)) {
          resultMap.set(originalIdx, result);
        }
      });
    });

    return transactions.map((_, index) => resultMap.get(index)!);
  }

  // Step 4: Send uncached + AI fallback transactions to AI
  const transactionsForAI = [
    ...uncached.map(u => u.transaction),
    ...needsAIFallback.map(u => u.transaction),
  ];
  const aiResults = await categorizeBatchWithAI(transactionsForAI);

  // Step 5: Cache the new results (but only for non-bank-category transactions)
  // Split AI results: first N are for uncached, rest are for AI fallback
  const uncachedAIResults = aiResults.slice(0, uncached.length);
  const fallbackAIResults = aiResults.slice(uncached.length);

  uncachedAIResults.forEach((result) => {
    cacheMerchant(result.description, result.category, result.confidence || 0.8);
  });

  // Step 6: Override "Other" results from bank categories with AI fallback results
  needsAIFallback.forEach(({ index }, fallbackIdx) => {
    const aiResult = fallbackAIResults[fallbackIdx];
    // Find the bankCategoryResults index for this transaction
    const bankResultIdx = withBankCategory.findIndex(item => item.index === index);
    if (bankResultIdx !== -1 && aiResult) {
      // Replace "Other" with AI result
      bankCategoryResults[bankResultIdx] = {
        ...aiResult,
        confidence: 0.85, // Slightly lower confidence for AI fallback
      };
    }
  });

  // Step 7: Combine ALL results in original order
  const resultMap = new Map<number, CategorizedTransaction>();

  // Add bank category results (now with AI overrides)
  withBankCategory.forEach(({ index }, resultIdx) => {
    resultMap.set(index, bankCategoryResults[resultIdx]);
  });

  // Add learned rules results
  learnedRules.forEach(({ transaction, index }) => {
    resultMap.set(index, transaction);
  });

  // Add cached results
  transactions.forEach((transaction, index) => {
    if (!transaction.originalCategory && !resultMap.has(index)) {
      const cachedResult = getCachedCategory(transaction.description);
      if (cachedResult) {
        resultMap.set(index, {
          ...transaction,
          category: cachedResult.category,
          confidence: cachedResult.confidence,
        });
      }
    }
  });

  // Add AI results for uncached items
  uncached.forEach(({ index }, aiIndex) => {
    resultMap.set(index, uncachedAIResults[aiIndex]);
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

CRITICAL RULES FOR CREDIT CARDS vs BANK ACCOUNTS:

CREDIT CARD TRANSACTIONS (most common):
- Negative amounts = Expenses (charges to the card)
- Positive amounts = NEVER Income! Always Payment or Refund
  - "Payment Thank You" / "Automatic Payment" = Payment
  - Positive amount from merchant (Walmart, Home Depot, etc.) = Refund
- NEVER categorize positive amounts as "Income" on credit cards!

BANK ACCOUNT TRANSACTIONS:
- Positive amounts can be Income (payroll, salary, direct deposit)
- Negative amounts = Expenses or Payments to credit cards

SPECIFIC RULES:
- "Payment Thank You" / "Automatic Payment" = Payment (NOT Income!)
- Credit card payments to/from bank = Payment
  - "CHASE CREDIT CRD EPAY" = Payment
  - "CITI CARD ONLINE PAYMENT" = Payment
  - Any "EPAY" or "E-PAY" for credit cards = Payment
- Mortgage/home loan payments = Payment
  - "WF HOME MTG AUTO PAY" = Payment
- Venmo/Zelle/CashApp = Transfer (moving your own money)
- Transfer between accounts = Transfer
  - "JPMorgan Chase Ext Trnsfr" = Transfer
  - "ONLINE TRANSFER TO" = Transfer
- Payroll/Salary = Income (bank accounts only!)
  - "NEW RELIC INC PAYROLL" = Income
  - "DIRECT DEP" with positive amount = Income
- Investment purchases = Transfer
  - "VANGUARD BUY INVESTMENT" = Transfer
- Merchant refunds (positive amount from store) = Refund
  - "THE HOME DEPOT" with positive amount = Refund
  - "WALMART" with positive amount = Refund

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
- Habitat for Humanity/Red Cross/Charities = Charity/Donations
- your-saving.com/Raise/CardCash = Gift Cards
- Realtor Association/ACM/Professional licenses = Business Expenses

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
 * 1. If Type == "Payment" OR originalCategory == "Payment/Credit" → "Payment"
 * 2. If Type == "Return" OR Type == "Refund" → "Refund" (Chase/bank refunds)
 * 3. If originalCategory exists (from Chase/Capital One CSV) → Map and use it
 * 4. If refund (Amount > 0 and Type != "Payment") → Try originalCategory or keyword match
 * 5. Fall back to expert rules
 * 6. Default to "Other"
 */
function smartCategorize(t: Transaction): Category {
  // PRIORITY 1: Handle Payments (Type == "Payment" OR Category == "Payment/Credit")
  if (t.type && t.type.toLowerCase() === 'payment') {
    return 'Payment';
  }
  if (t.originalCategory && t.originalCategory.toLowerCase().includes('payment')) {
    return 'Payment';
  }

  // PRIORITY 2: Handle Returns/Refunds (Type == "Return" OR Type == "Refund")
  // Chase CSV has Type="Return" for refunds
  if (t.type && (t.type.toLowerCase() === 'return' || t.type.toLowerCase() === 'refund')) {
    return 'Refund';
  }

  // PRIORITY 3: Use existing category from CSV (Chase or Capital One)
  if (t.originalCategory) {
    // Try Chase mapping first
    let mappedCategory = mapChaseCategory(t.originalCategory);
    if (mappedCategory) {
      return mappedCategory;
    }

    // Try Capital One mapping (with merchant-specific logic)
    mappedCategory = mapCapitalOneCategory(t.originalCategory, t.description);
    if (mappedCategory) {
      return mappedCategory;
    }
  }

  // PRIORITY 4: Handle Refunds (positive amount, not a payment or return)
  if (t.amount > 0) {
    // Try to use original category for refunds
    if (t.originalCategory) {
      let mappedCategory = mapChaseCategory(t.originalCategory);
      if (!mappedCategory) {
        mappedCategory = mapCapitalOneCategory(t.originalCategory, t.description);
      }
      if (mappedCategory) {
        return mappedCategory;
      }
    }

    // Fall back to keyword matching for refunds
    const keywordCategory = expertCategorize(t);
    if (keywordCategory !== 'Other') {
      return keywordCategory;
    }

    // CRITICAL: For credit cards, default to Refund (NOT Income!)
    // Only bank accounts should have Income, and those should be caught by expertCategorize
    return 'Refund';
  }

  // PRIORITY 5: Fall back to expert rules for expenses
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

  // Mortgage and home loan payments (negative amounts for mortgage payments)
  if (
    desc.includes('wf home mtg') || desc.includes('wells fargo home mtg') ||
    desc.includes('home mtg auto pay') || desc.includes('mortgage payment') ||
    desc.includes('homestead funding') || desc.includes('quicken loans') ||
    desc.includes('mortgage auto pay')
  ) {
    return 'Payment';
  }

  // Credit card payments (negative amounts = paying off cards from checking account)
  if (amount < 0 && (
    // Wells Fargo specific patterns
    desc.includes('credit crd epay') || desc.includes('chase credit crd') ||
    desc.includes('citi card online payment') || desc.includes('citicard online') ||
    desc.includes('discover e-payment') || desc.includes('amex epay') ||
    desc.includes('epay') && (desc.includes('credit') || desc.includes('card')) ||
    // Generic credit card payment patterns
    desc.includes('credit card payment') ||
    desc.includes('cc payment') || desc.includes('card payment')
  )) {
    return 'Payment';
  }

  // Credit card payments (positive amounts = refunds/returns, treated as payments received)
  if (amount > 0 && (
    desc.includes('payment thank you') ||
    desc.includes('automatic payment') ||
    desc.includes('online payment') && !desc.includes('transfer') ||
    desc.includes('mobile payment') ||
    desc.includes('autopay') ||
    // Capital One specific patterns
    desc.includes('capital one mobile pymt') ||
    desc.includes('capital one online pymt') ||
    desc.includes('capital one autopay')
  )) {
    return 'Payment';
  }

  // Other loan payments
  if (
    desc.includes('loan payment') ||
    desc.includes('student loan') ||
    desc.includes('car loan') ||
    desc.includes('rent payment') || desc.includes('rent due')
  ) {
    return 'Payment';
  }

  // ===================
  // TRANSFERS (moving your own money)
  // ===================

  // Transfers between accounts
  if (
    desc.includes('transfer') || desc.includes('xfer') || desc.includes('trnsfr') ||
    desc.includes('venmo') || desc.includes('zelle') ||
    desc.includes('paypal transfer') || desc.includes('cash app') ||

    // External transfers between banks
    desc.includes('jpmorgan chase ext trnsfr') || desc.includes('chase ext trnsfr') ||
    desc.includes('external transfer') || desc.includes('ext trnsfr') ||

    // Investment purchases (moving money to investment accounts)
    desc.includes('vanguard buy') || desc.includes('vanguard investment') ||
    desc.includes('charles schwab bank') || desc.includes('synchrony bank') ||
    desc.includes('fidelity') && desc.includes('transfer') ||
    desc.includes('online transfer to')
  ) {
    return 'Transfer';
  }

  // ===================
  // INCOME & REFUNDS
  // ===================

  if (amount > 0) {
    // Payroll and salary - ONLY for bank accounts, not credit cards
    if (
      desc.includes('payroll') || desc.includes('salary') ||
      desc.includes('direct dep') && !desc.includes('transfer') ||
      desc.includes('new relic inc') || desc.includes('payroll') ||
      desc.includes('employer') || desc.includes('wages')
    ) {
      return 'Income';
    }

    // Refunds and returns from merchants
    if (
      desc.includes('refund') || desc.includes('return') ||
      desc.includes('credit') && !desc.includes('card') ||
      desc.includes('cashback') || desc.includes('reward')
    ) {
      return 'Refund';
    }

    // CRITICAL: Default positive amounts to Refund for credit cards
    // This prevents credit card refunds from being miscategorized as Income
    // Bank account deposits should be caught by the payroll/salary check above
    return 'Refund';
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
    desc.includes('straighttalk') || desc.includes('google voice') || desc.includes('google *voice') ||

    // Utilities
    desc.includes('electric') || desc.includes('power') || desc.includes('utility') ||
    desc.includes('water') || desc.includes('sewer') || desc.includes('albany water') ||
    desc.includes('city of albany div') || desc.includes('municipal') ||

    // Sewer companies (specific patterns)
    desc.includes('sewer and') || desc.includes('easton dylan') ||

    // Insurance
    desc.includes('insurance') || desc.includes('sterling insurance') ||
    desc.includes('new york central mutual') || desc.includes('leatherstocking cooperati') ||

    // Tax software subscriptions
    desc.includes('freetaxusa') || desc.includes('turbotax') || desc.includes('hrblock') ||

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
  // BUSINESS EXPENSES
  // ===================

  if (
    // Professional associations and memberships
    desc.includes('realtor association') || desc.includes('mls') ||
    desc.includes('association for computing') || desc.includes('acm membership') ||
    desc.includes('bar association') || desc.includes('medical association') ||
    desc.includes('professional organization') || desc.includes('chamber of commerce') ||

    // Professional licenses and certifications
    desc.includes('license fee') || desc.includes('professional license') ||
    desc.includes('certification') || desc.includes('continuing education') ||
    desc.includes('cle credit') || desc.includes('cpe credit') ||

    // Professional services and tools
    desc.includes('linkedin premium') || desc.includes('linkedin recruiter') ||
    desc.includes('github pro') || desc.includes('jetbrains') ||
    desc.includes('atlassian') || desc.includes('slack pro') ||

    // Coworking and office
    desc.includes('coworking') || desc.includes('wework') || desc.includes('regus')
  ) {
    return 'Business Expenses';
  }

  // ===================
  // CHARITY/DONATIONS
  // ===================

  if (
    // Specific charities
    desc.includes('habitat for humanity') || desc.includes('hfh') || desc.includes('habitat c') ||
    desc.includes('red cross') || desc.includes('united way') ||
    desc.includes('salvation army') || desc.includes('goodwill') ||
    desc.includes('feed the children') || desc.includes('world vision') ||

    // Generic donation patterns (case-insensitive already via .toLowerCase())
    desc.includes('donation') || desc.includes('donate') ||
    desc.includes('nonprofit') || desc.includes('non-profit') ||
    desc.includes('charity') || desc.includes('charitable') ||
    desc.includes('foundation') && desc.includes('gift') ||
    desc.includes('give') && (desc.includes('fund') || desc.includes('cause'))
  ) {
    return 'Charity/Donations';
  }

  // ===================
  // GIFT CARDS
  // ===================

  if (
    // Gift card discount platforms
    desc.includes('your-saving') || desc.includes('yoursaving') ||
    desc.includes('raise.com') || desc.includes('cardcash') ||
    desc.includes('gift card mall') || desc.includes('giftcardmall') ||
    desc.includes('giftcards.com') || desc.includes('cardpool') ||

    // Direct gift card purchases
    desc.includes('gift card') || desc.includes('giftcard') ||
    desc.includes('egift') || desc.includes('e-gift')
  ) {
    return 'Gift Cards';
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
    // HVAC, Plumbing, Electrical contractors
    desc.includes('roland j. down') || desc.includes('service ex') ||
    desc.includes('hvac') || desc.includes('plumbing') || desc.includes('electrician') ||
    desc.includes('handyman') || desc.includes('contractor') ||

    // Home maintenance services
    desc.includes('lawn') || desc.includes('landscaping') || desc.includes('mowing') ||
    desc.includes('gutter') || desc.includes('roof') || desc.includes('chimney') ||
    desc.includes('pest control') || desc.includes('exterminator') ||

    // Cleaning services
    desc.includes('maid') || desc.includes('cleaning service') || desc.includes('house clean')
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

/**
 * Normalize merchant name for rule matching
 * Same logic as in learning-rules.ts - MUST stay in sync!
 */
function normalizeMerchantForRules(description: string): string {
  const lower = description.toLowerCase();

  // Important context keywords that should ALWAYS be preserved for rule specificity
  const contextKeywords = [
    'payment', 'fee', 'membership', 'refund', 'return', 'charge',
    'interest', 'annual', 'monthly', 'subscription', 'autopay',
    'transfer', 'deposit', 'withdrawal', 'credit', 'debit',
    'recurring', 'one-time', 'purchase', 'bill', 'invoice'
  ];

  // Clean up the description
  let cleaned = lower
    .replace(/[#]\w+/g, '') // Remove #1234 order IDs
    .replace(/\$[\d,.]+/g, '') // Remove dollar amounts
    .replace(/\d{2,}/g, '') // Remove long numbers
    .replace(/\b(inc|llc|ltd|corp|co|store|shop)\b/g, '') // Remove company suffixes
    .replace(/[^a-z\s]/g, '') // Keep only letters and spaces
    .trim();

  const words = cleaned.split(/\s+/).filter(w => w.length > 0);

  if (words.length === 0) {
    return description.toLowerCase().slice(0, 20);
  }

  // Check if any context keywords are present
  const contextWords = words.filter(w => contextKeywords.includes(w));

  // Strategy:
  // - If context keywords exist, include them (e.g., "capital one payment")
  // - Otherwise, take first 2 words (e.g., "starbucks")
  if (contextWords.length > 0) {
    // Take first 2-3 words for merchant + context keywords
    const merchantWords = words.slice(0, 3);
    const combined = [...new Set([...merchantWords, ...contextWords])];
    return combined.slice(0, 4).join(' ').trim();
  }

  // No context keywords - simple merchant name
  return words.slice(0, 2).join(' ').trim();
}

// calculateSummary moved to lib/summary.ts to avoid importing Anthropic SDK in browser
