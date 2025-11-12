/**
 * Custom Category Management
 *
 * Allows users to create and manage custom expense categories
 * Stored in localStorage for privacy (no server storage)
 *
 * Features:
 * - Create/edit/delete custom categories
 * - Assign icons and colors
 * - Import/export category lists
 * - Validation and duplicate checking
 */

export interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  createdAt: string;
  isDefault: boolean; // Whether this is a built-in category
}

export interface CategoryIcon {
  emoji: string;
  label: string;
}

export interface CategoryColor {
  hex: string;
  name: string;
}

// Available icons for custom categories
export const CATEGORY_ICONS: CategoryIcon[] = [
  { emoji: '🍔', label: 'Food' },
  { emoji: '🛒', label: 'Groceries' },
  { emoji: '🚗', label: 'Transportation' },
  { emoji: '🏠', label: 'Housing' },
  { emoji: '💡', label: 'Utilities' },
  { emoji: '🎬', label: 'Entertainment' },
  { emoji: '⚕️', label: 'Healthcare' },
  { emoji: '✈️', label: 'Travel' },
  { emoji: '🛍️', label: 'Shopping' },
  { emoji: '📚', label: 'Education' },
  { emoji: '💰', label: 'Income' },
  { emoji: '💳', label: 'Payment' },
  { emoji: '🔄', label: 'Transfer' },
  { emoji: '📌', label: 'Other' },
  { emoji: '🎯', label: 'Goals' },
  { emoji: '💪', label: 'Fitness' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '📺', label: 'Streaming' },
  { emoji: '🐕', label: 'Pets' },
  { emoji: '👶', label: 'Kids' },
  { emoji: '🚀', label: 'Tech' },
  { emoji: '🎨', label: 'Hobbies' },
  { emoji: '🎁', label: 'Gifts' },
  { emoji: '🌟', label: 'Special' },
  { emoji: '🔧', label: 'Maintenance' },
  { emoji: '📱', label: 'Phone' },
  { emoji: '☕', label: 'Coffee' },
  { emoji: '🏋️', label: 'Gym' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '📰', label: 'News' },
];

// Available colors for custom categories
export const CATEGORY_COLORS: CategoryColor[] = [
  { hex: '#EF4444', name: 'Red' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#EAB308', name: 'Yellow' },
  { hex: '#84CC16', name: 'Lime' },
  { hex: '#22C55E', name: 'Green' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#14B8A6', name: 'Teal' },
  { hex: '#06B6D4', name: 'Cyan' },
  { hex: '#0EA5E9', name: 'Sky' },
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#8B5CF6', name: 'Violet' },
  { hex: '#A855F7', name: 'Purple' },
  { hex: '#D946EF', name: 'Fuchsia' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#F43F5E', name: 'Rose' },
  { hex: '#64748B', name: 'Slate' },
  { hex: '#6B7280', name: 'Gray' },
  { hex: '#78716C', name: 'Stone' },
];

// Default built-in categories (cannot be deleted, but can be hidden)
export const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: 'food-dining', name: 'Food & Dining', icon: '🍔', color: '#F59E0B', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#22C55E', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'transportation', name: 'Transportation', icon: '🚗', color: '#3B82F6', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#EC4899', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'bills-utilities', name: 'Bills & Utilities', icon: '💡', color: '#EAB308', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8B5CF6', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'healthcare', name: 'Healthcare', icon: '⚕️', color: '#EF4444', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#06B6D4', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'household', name: 'Household', icon: '🏠', color: '#78716C', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'education', name: 'Education', icon: '📚', color: '#6366F1', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'income', name: 'Income', icon: '💰', color: '#10B981', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'payment', name: 'Payment', icon: '💳', color: '#64748B', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'transfer', name: 'Transfer', icon: '🔄', color: '#6B7280', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'other', name: 'Other', icon: '📌', color: '#A855F7', isDefault: true, createdAt: new Date().toISOString() },
];

const STORAGE_KEY = 'custom-categories';
const FREE_TIER_LIMIT = 10; // Free users can create up to 10 custom categories

/**
 * Get all categories (default + custom)
 */
export function getAllCategories(): CustomCategory[] {
  const customCategories = getCustomCategories();
  return [...DEFAULT_CATEGORIES, ...customCategories];
}

/**
 * Get only custom (user-created) categories
 */
export function getCustomCategories(): CustomCategory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const categories = JSON.parse(stored) as CustomCategory[];
    return categories.filter(c => !c.isDefault);
  } catch (error) {
    console.error('Error loading custom categories:', error);
    return [];
  }
}

/**
 * Get category by ID
 */
export function getCategoryById(id: string): CustomCategory | undefined {
  const allCategories = getAllCategories();
  return allCategories.find(c => c.id === id);
}

/**
 * Get category by name
 */
export function getCategoryByName(name: string): CustomCategory | undefined {
  const allCategories = getAllCategories();
  return allCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
}

/**
 * Create a new custom category
 */
export function createCustomCategory(
  name: string,
  icon: string,
  color: string,
  description?: string
): { success: boolean; category?: CustomCategory; error?: string } {
  // Validation
  if (!name || name.trim().length === 0) {
    return { success: false, error: 'Category name is required' };
  }

  if (name.length > 50) {
    return { success: false, error: 'Category name must be 50 characters or less' };
  }

  // Check for duplicates
  const existing = getCategoryByName(name);
  if (existing) {
    return { success: false, error: 'A category with this name already exists' };
  }

  // Check free tier limit
  const customCategories = getCustomCategories();
  if (customCategories.length >= FREE_TIER_LIMIT) {
    return {
      success: false,
      error: `Free tier limited to ${FREE_TIER_LIMIT} custom categories. Upgrade to premium for unlimited categories.`,
    };
  }

  // Create new category
  const newCategory: CustomCategory = {
    id: generateId(name),
    name: name.trim(),
    icon: icon || '📌',
    color: color || '#A855F7',
    description: description?.trim(),
    createdAt: new Date().toISOString(),
    isDefault: false,
  };

  // Save to localStorage
  const updated = [...customCategories, newCategory];
  saveCustomCategories(updated);

  return { success: true, category: newCategory };
}

/**
 * Update an existing custom category
 */
export function updateCustomCategory(
  id: string,
  updates: Partial<Omit<CustomCategory, 'id' | 'isDefault' | 'createdAt'>>
): { success: boolean; category?: CustomCategory; error?: string } {
  // Check if it's a default category first
  const defaultCategory = DEFAULT_CATEGORIES.find(c => c.id === id);
  if (defaultCategory) {
    return { success: false, error: 'Cannot update default categories' };
  }

  const customCategories = getCustomCategories();
  const index = customCategories.findIndex(c => c.id === id);

  if (index === -1) {
    return { success: false, error: 'Category not found' };
  }

  const category = customCategories[index];

  // Validate name if being updated
  if (updates.name) {
    if (updates.name.length > 50) {
      return { success: false, error: 'Category name must be 50 characters or less' };
    }

    // Check for duplicates (excluding current category)
    const existing = getCategoryByName(updates.name);
    if (existing && existing.id !== id) {
      return { success: false, error: 'A category with this name already exists' };
    }
  }

  // Update category
  const updated: CustomCategory = {
    ...category,
    ...updates,
    id: category.id, // Prevent ID change
    isDefault: category.isDefault, // Prevent changing default status
    createdAt: category.createdAt, // Prevent changing creation date
  };

  customCategories[index] = updated;
  saveCustomCategories(customCategories);

  return { success: true, category: updated };
}

/**
 * Delete a custom category
 */
export function deleteCustomCategory(id: string): { success: boolean; error?: string } {
  // Check if it's a default category first
  const defaultCategory = DEFAULT_CATEGORIES.find(c => c.id === id);
  if (defaultCategory) {
    return { success: false, error: 'Cannot delete default categories' };
  }

  const customCategories = getCustomCategories();
  const category = customCategories.find(c => c.id === id);

  if (!category) {
    return { success: false, error: 'Category not found' };
  }

  const updated = customCategories.filter(c => c.id !== id);
  saveCustomCategories(updated);

  return { success: true };
}

/**
 * Export custom categories to JSON
 */
export function exportCategories(): string {
  const customCategories = getCustomCategories();
  return JSON.stringify(customCategories, null, 2);
}

/**
 * Import custom categories from JSON
 */
export function importCategories(
  jsonString: string
): { success: boolean; imported: number; skipped: number; error?: string } {
  try {
    const imported = JSON.parse(jsonString) as CustomCategory[];

    if (!Array.isArray(imported)) {
      return { success: false, imported: 0, skipped: 0, error: 'Invalid format: expected array of categories' };
    }

    const customCategories = getCustomCategories();
    let importedCount = 0;
    let skippedCount = 0;

    for (const category of imported) {
      // Skip if already exists
      if (getCategoryByName(category.name)) {
        skippedCount++;
        continue;
      }

      // Check free tier limit
      if (customCategories.length + importedCount >= FREE_TIER_LIMIT) {
        return {
          success: false,
          imported: importedCount,
          skipped: skippedCount + (imported.length - importedCount - skippedCount),
          error: `Free tier limited to ${FREE_TIER_LIMIT} custom categories`,
        };
      }

      // Add to custom categories
      const newCategory: CustomCategory = {
        ...category,
        id: generateId(category.name),
        createdAt: new Date().toISOString(),
        isDefault: false,
      };

      customCategories.push(newCategory);
      importedCount++;
    }

    saveCustomCategories(customCategories);

    return { success: true, imported: importedCount, skipped: skippedCount };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      error: 'Invalid JSON format',
    };
  }
}

/**
 * Reset to default categories only (delete all custom)
 */
export function resetToDefaults(): { success: boolean } {
  saveCustomCategories([]);
  return { success: true };
}

/**
 * Save custom categories to localStorage
 */
function saveCustomCategories(categories: CustomCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving custom categories:', error);
  }
}

/**
 * Generate a unique ID for a category
 */
function generateId(name: string): string {
  const timestamp = Date.now();
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug}-${timestamp}`;
}

/**
 * Map old Category type to new CustomCategory names
 * For backward compatibility with existing transactions
 */
export function mapLegacyCategoryToCustom(legacyCategory: string): string {
  const mapping: Record<string, string> = {
    'Food & Dining': 'Food & Dining',
    'Groceries': 'Groceries',
    'Transportation': 'Transportation',
    'Shopping': 'Shopping',
    'Bills & Utilities': 'Bills & Utilities',
    'Entertainment': 'Entertainment',
    'Healthcare': 'Healthcare',
    'Travel': 'Travel',
    'Household': 'Household',
    'Education': 'Education',
    'Business Expenses': 'Business Expenses',
    'Charity/Donations': 'Charity/Donations',
    'Gift Cards': 'Gift Cards',
    'Income': 'Income',
    'Payment': 'Payment',
    'Refund': 'Refund',
    'Transfer': 'Transfer',
    'Other': 'Other',
  };

  return mapping[legacyCategory] || legacyCategory;
}

/**
 * Get count of custom categories (for tier limits)
 */
export function getCustomCategoryCount(): number {
  return getCustomCategories().length;
}

/**
 * Check if user can create more custom categories (free tier check)
 */
export function canCreateMore(): boolean {
  return getCustomCategoryCount() < FREE_TIER_LIMIT;
}

/**
 * Get remaining custom category slots
 */
export function getRemainingSlots(): number {
  return Math.max(0, FREE_TIER_LIMIT - getCustomCategoryCount());
}
