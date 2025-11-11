/**
 * Learning Rules Engine
 *
 * Allows users to teach the AI by creating rules from manual category changes.
 * Rules are stored in localStorage (browser-only, privacy-first).
 *
 * This solves Monarch Money's #1 failure point: "AI that doesn't learn"
 */

import { Category } from './types';

export interface CategoryRule {
  id: string;
  merchantPattern: string; // Normalized merchant name pattern
  category: Category;
  confidence: number; // 1.0 for user-created rules
  createdAt: string; // ISO date
  appliedCount: number; // How many times this rule has been used
  lastApplied?: string; // ISO date of last application
}

const RULES_STORAGE_KEY = 'expense_categorizer_rules';
const RULES_VERSION = '1.0';

/**
 * Get all saved rules from localStorage
 */
export function getRules(): CategoryRule[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(RULES_STORAGE_KEY);
    if (!stored) return [];

    const data = JSON.parse(stored);

    // Version check (for future migrations)
    if (data.version !== RULES_VERSION) {
      console.warn('Rules version mismatch, clearing old rules');
      localStorage.removeItem(RULES_STORAGE_KEY);
      return [];
    }

    return data.rules || [];
  } catch (error) {
    console.error('Failed to load rules from localStorage:', error);
    return [];
  }
}

/**
 * Save rules to localStorage
 */
function saveRules(rules: CategoryRule[]): void {
  if (typeof window === 'undefined') return;

  try {
    const data = {
      version: RULES_VERSION,
      rules,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save rules to localStorage:', error);
  }
}

/**
 * Normalize merchant name for pattern matching
 * Example: "CAPITAL ONE MEMBERSHIP FEE $395" → "capital one membership fee"
 * Example: "CAPITAL ONE PAYMENT" → "capital one payment"
 * Example: "STARBUCKS #1234 San Francisco" → "starbucks"
 *
 * Smart normalization:
 * - Preserves context keywords (payment, fee, refund, etc.) for specificity
 * - Removes noise (order IDs, numbers, locations)
 * - Keeps 2-4 words depending on context
 */
export function normalizeMerchantName(description: string): string {
  const lower = description.toLowerCase();

  // Important context keywords that should ALWAYS be preserved for rule specificity
  // These distinguish between different transaction types from the same merchant
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

/**
 * Create or update a rule when user manually changes a category
 * Returns true if a new rule was created, false if an existing rule was updated
 */
export function createOrUpdateRule(
  merchantDescription: string,
  newCategory: Category
): { isNewRule: boolean; rule: CategoryRule } {
  const rules = getRules();
  const merchantPattern = normalizeMerchantName(merchantDescription);

  // Check if rule already exists for this merchant
  const existingRuleIndex = rules.findIndex(
    (r) => r.merchantPattern === merchantPattern
  );

  if (existingRuleIndex !== -1) {
    // Update existing rule
    const existingRule = rules[existingRuleIndex];
    const updatedRule: CategoryRule = {
      ...existingRule,
      category: newCategory,
      appliedCount: existingRule.appliedCount + 1,
      lastApplied: new Date().toISOString(),
    };

    rules[existingRuleIndex] = updatedRule;
    saveRules(rules);

    return { isNewRule: false, rule: updatedRule };
  }

  // Create new rule
  const newRule: CategoryRule = {
    id: generateRuleId(),
    merchantPattern,
    category: newCategory,
    confidence: 1.0, // User-created rules have maximum confidence
    createdAt: new Date().toISOString(),
    appliedCount: 1,
    lastApplied: new Date().toISOString(),
  };

  rules.push(newRule);
  saveRules(rules);

  return { isNewRule: true, rule: newRule };
}

/**
 * Apply saved rules to a transaction description
 * Returns the category if a rule matches, null otherwise
 */
export function applyRules(merchantDescription: string): {
  category: Category;
  rule: CategoryRule;
} | null {
  const rules = getRules();
  const merchantPattern = normalizeMerchantName(merchantDescription);

  // Find matching rule
  const matchingRule = rules.find((r) => r.merchantPattern === merchantPattern);

  if (matchingRule) {
    // Update rule's appliedCount and lastApplied
    const updatedRule = {
      ...matchingRule,
      appliedCount: matchingRule.appliedCount + 1,
      lastApplied: new Date().toISOString(),
    };

    // Update in storage
    const allRules = rules.map((r) =>
      r.id === matchingRule.id ? updatedRule : r
    );
    saveRules(allRules);

    return {
      category: matchingRule.category,
      rule: updatedRule,
    };
  }

  return null;
}

/**
 * Delete a specific rule
 */
export function deleteRule(ruleId: string): boolean {
  const rules = getRules();
  const filteredRules = rules.filter((r) => r.id !== ruleId);

  if (filteredRules.length === rules.length) {
    return false; // Rule not found
  }

  saveRules(filteredRules);
  return true;
}

/**
 * Clear all rules (nuclear option)
 */
export function clearAllRules(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RULES_STORAGE_KEY);
}

/**
 * Get rules count (for UI display)
 */
export function getRulesCount(): number {
  return getRules().length;
}

/**
 * Get most frequently applied rules (for insights)
 */
export function getTopRules(limit: number = 10): CategoryRule[] {
  const rules = getRules();
  return rules
    .sort((a, b) => b.appliedCount - a.appliedCount)
    .slice(0, limit);
}

/**
 * Generate unique rule ID
 */
function generateRuleId(): string {
  return `rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Export rules as JSON (for backup/sharing)
 */
export function exportRulesAsJSON(): string {
  const rules = getRules();
  return JSON.stringify(
    {
      version: RULES_VERSION,
      exportedAt: new Date().toISOString(),
      rules,
    },
    null,
    2
  );
}

/**
 * Import rules from JSON (for restore/sharing)
 */
export function importRulesFromJSON(jsonString: string): {
  success: boolean;
  imported: number;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonString);

    if (!data.rules || !Array.isArray(data.rules)) {
      return {
        success: false,
        imported: 0,
        error: 'Invalid JSON format: missing rules array',
      };
    }

    // Validate each rule
    const validRules: CategoryRule[] = [];
    for (const rule of data.rules) {
      if (
        rule.id &&
        rule.merchantPattern &&
        rule.category &&
        typeof rule.confidence === 'number' &&
        rule.createdAt
      ) {
        validRules.push(rule);
      }
    }

    if (validRules.length === 0) {
      return {
        success: false,
        imported: 0,
        error: 'No valid rules found in JSON',
      };
    }

    // Merge with existing rules (don't duplicate)
    const existingRules = getRules();
    const existingPatterns = new Set(existingRules.map((r) => r.merchantPattern));

    const newRules = validRules.filter(
      (r) => !existingPatterns.has(r.merchantPattern)
    );

    saveRules([...existingRules, ...newRules]);

    return {
      success: true,
      imported: newRules.length,
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      error: error instanceof Error ? error.message : 'Failed to parse JSON',
    };
  }
}
