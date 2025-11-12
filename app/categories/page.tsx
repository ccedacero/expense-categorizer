/**
 * Custom Categories Management Page
 *
 * Allows users to create, edit, and manage custom expense categories
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import {
  getAllCategories,
  getCustomCategories,
  createCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  exportCategories,
  importCategories,
  resetToDefaults,
  canCreateMore,
  getRemainingSlots,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  CustomCategory,
} from '@/lib/custom-categories';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icon: '📌',
    color: '#A855F7',
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setCategories(getAllCategories());
  };

  const handleCreate = () => {
    if (!canCreateMore()) {
      setMessage({
        type: 'error',
        text: `Free tier limited to ${getRemainingSlots() + getCustomCategories().length} custom categories. All slots used.`,
      });
      return;
    }

    setIsCreating(true);
    setEditingId(null);
    setFormData({ name: '', icon: '📌', color: '#A855F7', description: '' });
  };

  const handleEdit = (category: CustomCategory) => {
    setEditingId(category.id);
    setIsCreating(false);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      description: category.description || '',
    });
  };

  const handleSave = () => {
    if (editingId) {
      // Update existing category
      const result = updateCustomCategory(editingId, formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Category updated successfully!' });
        setEditingId(null);
        loadCategories();
        track('category_updated', { categoryId: editingId });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update category' });
      }
    } else {
      // Create new category
      const result = createCustomCategory(
        formData.name,
        formData.icon,
        formData.color,
        formData.description
      );

      if (result.success) {
        setMessage({ type: 'success', text: 'Category created successfully!' });
        setIsCreating(false);
        setFormData({ name: '', icon: '📌', color: '#A855F7', description: '' });
        loadCategories();
        track('category_created', { categoryName: formData.name });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create category' });
      }
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const result = deleteCustomCategory(id);
    if (result.success) {
      setMessage({ type: 'success', text: 'Category deleted successfully!' });
      loadCategories();
      track('category_deleted', { categoryId: id });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to delete category' });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  const handleExport = () => {
    const json = exportCategories();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-categories-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setMessage({ type: 'success', text: 'Categories exported successfully!' });
    setTimeout(() => setMessage(null), 5000);
    track('categories_exported', { count: getCustomCategories().length });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importCategories(content);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Imported ${result.imported} categories. Skipped ${result.skipped} duplicates.`,
        });
        loadCategories();
        track('categories_imported', { imported: result.imported, skipped: result.skipped });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to import categories' });
      }

      setTimeout(() => setMessage(null), 5000);
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  const handleReset = () => {
    if (!confirm('Are you sure you want to delete all custom categories and reset to defaults?')) return;

    resetToDefaults();
    setMessage({ type: 'success', text: 'Reset to default categories successfully!' });
    loadCategories();
    setTimeout(() => setMessage(null), 5000);
    track('categories_reset');
  };

  const customCategories = categories.filter(c => !c.isDefault);
  const defaultCategories = categories.filter(c => c.isDefault);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-2xl hover:opacity-80 transition-opacity">
                ←
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Manage Categories
                </h1>
                <p className="text-gray-600 text-sm">
                  Create and organize custom expense categories
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-900'
                : 'bg-red-50 border border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{message.type === 'success' ? '✅' : '⚠️'}</span>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Stats & Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Your Categories</h2>
              <p className="text-gray-600 text-sm mt-1">
                {customCategories.length} custom • {defaultCategories.length} default • {getRemainingSlots()} slots remaining
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!canCreateMore()}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  canCreateMore()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                + New Category
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Export
              </button>
              <label className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              {customCategories.length > 0 && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {!canCreateMore() && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <div className="flex items-start gap-2">
                <span className="text-xl">⭐</span>
                <div className="text-sm text-amber-900">
                  <strong>Free tier limit reached.</strong> You&apos;ve created {customCategories.length} custom categories
                  (maximum: {getRemainingSlots() + customCategories.length}). Upgrade to Premium for unlimited custom categories!
                </div>
              </div>
            </div>
          )}

          {/* Create/Edit Form */}
          {(isCreating || editingId) && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editingId ? 'Edit Category' : 'Create New Category'}
              </h3>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Pet Expenses, Coffee Shops, etc."
                    maxLength={50}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.name.length}/50 characters
                  </p>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {CATEGORY_ICONS.map((icon) => (
                      <button
                        key={icon.emoji}
                        onClick={() => setFormData({ ...formData, icon: icon.emoji })}
                        className={`text-2xl p-2 rounded-lg transition-all ${
                          formData.icon === icon.emoji
                            ? 'bg-blue-600 ring-2 ring-blue-400'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                        title={icon.label}
                      >
                        {icon.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {CATEGORY_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => setFormData({ ...formData, color: color.hex })}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          formData.color === color.hex
                            ? 'ring-4 ring-offset-2 ring-gray-400'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of what this category includes..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!formData.name.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingId(null);
                      setFormData({ name: '', icon: '📌', color: '#A855F7', description: '' });
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Categories */}
          {customCategories.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Custom Categories ({customCategories.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {customCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Default Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Default Categories ({defaultCategories.length})
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {defaultCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div
                    className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{category.name}</div>
                    <div className="text-xs text-gray-500">Built-in</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Category Card Component
function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: CustomCategory;
  onEdit: (category: CustomCategory) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:shadow-md transition-shadow">
      <div
        className="text-3xl w-14 h-14 flex items-center justify-center rounded-lg"
        style={{ backgroundColor: category.color + '20' }}
      >
        {category.icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-gray-800">{category.name}</div>
        {category.description && (
          <div className="text-sm text-gray-600 mt-1">{category.description}</div>
        )}
        <div className="text-xs text-gray-400 mt-1">
          Created {new Date(category.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onEdit(category)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(category.id, category.name)}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
