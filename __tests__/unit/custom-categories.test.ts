/**
 * Unit Tests: Custom Categories
 *
 * Tests custom category creation, management, and localStorage operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllCategories,
  getCustomCategories,
  getCategoryById,
  getCategoryByName,
  createCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  exportCategories,
  importCategories,
  resetToDefaults,
  canCreateMore,
  getRemainingSlots,
  getCustomCategoryCount,
  DEFAULT_CATEGORIES,
} from '@/lib/custom-categories';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Custom Categories', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Default Categories', () => {
    it('should return all default categories', () => {
      const categories = getAllCategories();
      expect(categories.length).toBe(DEFAULT_CATEGORIES.length);

      const defaultCats = categories.filter(c => c.isDefault);
      expect(defaultCats.length).toBe(DEFAULT_CATEGORIES.length);
    });

    it('should include standard categories like Food & Dining', () => {
      const foodCategory = getCategoryByName('Food & Dining');
      expect(foodCategory).toBeDefined();
      expect(foodCategory?.isDefault).toBe(true);
      expect(foodCategory?.icon).toBe('🍔');
    });

    it('should include Income, Payment, Transfer categories', () => {
      const income = getCategoryByName('Income');
      const payment = getCategoryByName('Payment');
      const transfer = getCategoryByName('Transfer');

      expect(income).toBeDefined();
      expect(payment).toBeDefined();
      expect(transfer).toBeDefined();

      expect(income?.icon).toBe('💰');
      expect(payment?.icon).toBe('💳');
      expect(transfer?.icon).toBe('🔄');
    });
  });

  describe('Create Custom Category', () => {
    it('should create a new custom category', () => {
      const result = createCustomCategory('Pet Expenses', '🐕', '#EF4444', 'Vet, food, supplies');

      expect(result.success).toBe(true);
      expect(result.category).toBeDefined();
      expect(result.category?.name).toBe('Pet Expenses');
      expect(result.category?.icon).toBe('🐕');
      expect(result.category?.color).toBe('#EF4444');
      expect(result.category?.description).toBe('Vet, food, supplies');
      expect(result.category?.isDefault).toBe(false);
    });

    it('should trim whitespace from category name', () => {
      const result = createCustomCategory('  Coffee Shops  ', '☕', '#F59E0B');

      expect(result.success).toBe(true);
      expect(result.category?.name).toBe('Coffee Shops');
    });

    it('should reject empty category name', () => {
      const result = createCustomCategory('', '📌', '#A855F7');

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject category name over 50 characters', () => {
      const longName = 'A'.repeat(51);
      const result = createCustomCategory(longName, '📌', '#A855F7');

      expect(result.success).toBe(false);
      expect(result.error).toContain('50 characters');
    });

    it('should prevent duplicate category names', () => {
      createCustomCategory('Pet Expenses', '🐕', '#EF4444');
      const result = createCustomCategory('Pet Expenses', '🐈', '#F59E0B');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should prevent duplicates of default category names', () => {
      const result = createCustomCategory('Food & Dining', '🍕', '#F59E0B');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should generate unique IDs for categories', () => {
      const result1 = createCustomCategory('Category 1', '📌', '#A855F7');
      const result2 = createCustomCategory('Category 2', '📌', '#A855F7');

      expect(result1.category?.id).toBeDefined();
      expect(result2.category?.id).toBeDefined();
      expect(result1.category?.id).not.toBe(result2.category?.id);
    });

    it('should use default icon if not provided', () => {
      const result = createCustomCategory('Test Category', '', '#A855F7');

      expect(result.success).toBe(true);
      expect(result.category?.icon).toBe('📌');
    });

    it('should use default color if not provided', () => {
      const result = createCustomCategory('Test Category', '📌', '');

      expect(result.success).toBe(true);
      expect(result.category?.color).toBe('#A855F7');
    });
  });

  describe('Free Tier Limits', () => {
    it('should allow creating up to 10 custom categories', () => {
      for (let i = 1; i <= 10; i++) {
        const result = createCustomCategory(`Category ${i}`, '📌', '#A855F7');
        expect(result.success).toBe(true);
      }

      expect(getCustomCategoryCount()).toBe(10);
      expect(canCreateMore()).toBe(false);
      expect(getRemainingSlots()).toBe(0);
    });

    it('should prevent creating 11th custom category', () => {
      // Create 10 categories
      for (let i = 1; i <= 10; i++) {
        createCustomCategory(`Category ${i}`, '📌', '#A855F7');
      }

      // Try to create 11th
      const result = createCustomCategory('Category 11', '📌', '#A855F7');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Free tier limited');
      expect(result.error).toContain('10');
    });

    it('should correctly track remaining slots', () => {
      expect(getRemainingSlots()).toBe(10);

      createCustomCategory('Category 1', '📌', '#A855F7');
      expect(getRemainingSlots()).toBe(9);

      createCustomCategory('Category 2', '📌', '#A855F7');
      expect(getRemainingSlots()).toBe(8);
    });
  });

  describe('Update Custom Category', () => {
    it('should update category name', () => {
      const created = createCustomCategory('Old Name', '📌', '#A855F7');
      const id = created.category!.id;

      const result = updateCustomCategory(id, { name: 'New Name' });

      expect(result.success).toBe(true);
      expect(result.category?.name).toBe('New Name');
      expect(result.category?.id).toBe(id); // ID should not change
    });

    it('should update category icon and color', () => {
      const created = createCustomCategory('Category', '📌', '#A855F7');
      const id = created.category!.id;

      const result = updateCustomCategory(id, { icon: '🎯', color: '#EF4444' });

      expect(result.success).toBe(true);
      expect(result.category?.icon).toBe('🎯');
      expect(result.category?.color).toBe('#EF4444');
    });

    it('should update category description', () => {
      const created = createCustomCategory('Category', '📌', '#A855F7');
      const id = created.category!.id;

      const result = updateCustomCategory(id, { description: 'Updated description' });

      expect(result.success).toBe(true);
      expect(result.category?.description).toBe('Updated description');
    });

    it('should prevent updating to duplicate name', () => {
      createCustomCategory('Category 1', '📌', '#A855F7');
      const created2 = createCustomCategory('Category 2', '📌', '#A855F7');

      const result = updateCustomCategory(created2.category!.id, { name: 'Category 1' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should prevent updating default categories', () => {
      const defaultCat = DEFAULT_CATEGORIES[0];
      const result = updateCustomCategory(defaultCat.id, { name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot update default');
    });

    it('should return error for non-existent category', () => {
      const result = updateCustomCategory('non-existent-id', { name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should preserve creation date when updating', () => {
      const created = createCustomCategory('Category', '📌', '#A855F7');
      const originalDate = created.category!.createdAt;

      const result = updateCustomCategory(created.category!.id, { name: 'Updated' });

      expect(result.category?.createdAt).toBe(originalDate);
    });
  });

  describe('Delete Custom Category', () => {
    it('should delete a custom category', () => {
      const created = createCustomCategory('To Delete', '📌', '#A855F7');
      const id = created.category!.id;

      const result = deleteCustomCategory(id);

      expect(result.success).toBe(true);

      const deleted = getCategoryById(id);
      expect(deleted).toBeUndefined();
    });

    it('should prevent deleting default categories', () => {
      const defaultCat = DEFAULT_CATEGORIES[0];
      const result = deleteCustomCategory(defaultCat.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot delete default');
    });

    it('should return error for non-existent category', () => {
      const result = deleteCustomCategory('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should decrease custom category count after delete', () => {
      createCustomCategory('Category 1', '📌', '#A855F7');
      createCustomCategory('Category 2', '📌', '#A855F7');

      expect(getCustomCategoryCount()).toBe(2);

      const categories = getCustomCategories();
      deleteCustomCategory(categories[0].id);

      expect(getCustomCategoryCount()).toBe(1);
    });
  });

  describe('Get Categories', () => {
    it('should get all categories (default + custom)', () => {
      createCustomCategory('Custom 1', '📌', '#A855F7');
      createCustomCategory('Custom 2', '📌', '#A855F7');

      const all = getAllCategories();

      expect(all.length).toBe(DEFAULT_CATEGORIES.length + 2);
    });

    it('should get only custom categories', () => {
      createCustomCategory('Custom 1', '📌', '#A855F7');
      createCustomCategory('Custom 2', '📌', '#A855F7');

      const custom = getCustomCategories();

      expect(custom.length).toBe(2);
      expect(custom.every(c => !c.isDefault)).toBe(true);
    });

    it('should get category by ID', () => {
      const created = createCustomCategory('Test', '📌', '#A855F7');
      const found = getCategoryById(created.category!.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Test');
    });

    it('should get category by name (case-insensitive)', () => {
      createCustomCategory('Test Category', '📌', '#A855F7');

      const found1 = getCategoryByName('Test Category');
      const found2 = getCategoryByName('test category');
      const found3 = getCategoryByName('TEST CATEGORY');

      expect(found1).toBeDefined();
      expect(found2).toBeDefined();
      expect(found3).toBeDefined();
      expect(found1?.id).toBe(found2?.id);
      expect(found2?.id).toBe(found3?.id);
    });
  });

  describe('Export/Import', () => {
    it('should export custom categories as JSON', () => {
      createCustomCategory('Category 1', '🐕', '#EF4444');
      createCustomCategory('Category 2', '☕', '#F59E0B');

      const exported = exportCategories();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
      expect(parsed[0].name).toBe('Category 1');
      expect(parsed[1].name).toBe('Category 2');
    });

    it('should import custom categories from JSON', () => {
      const json = JSON.stringify([
        { name: 'Imported 1', icon: '🎯', color: '#EF4444', description: 'Test', isDefault: false, createdAt: new Date().toISOString() },
        { name: 'Imported 2', icon: '🎨', color: '#F59E0B', description: 'Test', isDefault: false, createdAt: new Date().toISOString() },
      ]);

      const result = importCategories(json);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(0);

      const imported = getCustomCategories();
      expect(imported.length).toBe(2);
    });

    it('should skip duplicate categories during import', () => {
      createCustomCategory('Existing', '📌', '#A855F7');

      const json = JSON.stringify([
        { name: 'Existing', icon: '🎯', color: '#EF4444', description: 'Test', isDefault: false, createdAt: new Date().toISOString() },
        { name: 'New Category', icon: '🎨', color: '#F59E0B', description: 'Test', isDefault: false, createdAt: new Date().toISOString() },
      ]);

      const result = importCategories(json);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1); // Only "New Category"
      expect(result.skipped).toBe(1); // "Existing" skipped
    });

    it('should respect free tier limit during import', () => {
      // Create 9 categories (1 slot remaining)
      for (let i = 1; i <= 9; i++) {
        createCustomCategory(`Category ${i}`, '📌', '#A855F7');
      }

      const json = JSON.stringify([
        { name: 'Import 1', icon: '🎯', color: '#EF4444', isDefault: false, createdAt: new Date().toISOString() },
        { name: 'Import 2', icon: '🎨', color: '#F59E0B', isDefault: false, createdAt: new Date().toISOString() },
      ]);

      const result = importCategories(json);

      expect(result.success).toBe(false);
      expect(result.imported).toBe(1); // Only 1 imported (reached limit)
      expect(result.error).toContain('Free tier limited');
    });

    it('should handle invalid JSON during import', () => {
      const result = importCategories('invalid json');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });

    it('should handle non-array JSON during import', () => {
      const result = importCategories('{"name": "test"}');

      expect(result.success).toBe(false);
      expect(result.error).toContain('expected array');
    });
  });

  describe('Reset to Defaults', () => {
    it('should delete all custom categories', () => {
      createCustomCategory('Category 1', '📌', '#A855F7');
      createCustomCategory('Category 2', '📌', '#A855F7');

      expect(getCustomCategoryCount()).toBe(2);

      const result = resetToDefaults();

      expect(result.success).toBe(true);
      expect(getCustomCategoryCount()).toBe(0);
    });

    it('should preserve default categories after reset', () => {
      createCustomCategory('Category 1', '📌', '#A855F7');

      resetToDefaults();

      const defaults = getAllCategories().filter(c => c.isDefault);
      expect(defaults.length).toBe(DEFAULT_CATEGORIES.length);
    });
  });

  describe('Persistence', () => {
    it('should persist custom categories to localStorage', () => {
      createCustomCategory('Persistent', '📌', '#A855F7');

      const stored = localStorage.getItem('custom-categories');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].name).toBe('Persistent');
    });

    it('should load custom categories from localStorage', () => {
      // Manually set localStorage
      const categories = [
        { id: 'test-123', name: 'Stored Category', icon: '📌', color: '#A855F7', isDefault: false, createdAt: new Date().toISOString() },
      ];
      localStorage.setItem('custom-categories', JSON.stringify(categories));

      const loaded = getCustomCategories();

      expect(loaded.length).toBe(1);
      expect(loaded[0].name).toBe('Stored Category');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('custom-categories', 'corrupted data');

      const categories = getCustomCategories();

      expect(categories).toEqual([]);
    });
  });
});
