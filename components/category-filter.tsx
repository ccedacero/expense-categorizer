'use client';

import { Category } from '@/lib/types';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants';

interface CategoryFilterProps {
  selectedCategories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  transactionCounts: Record<Category, number>;
}

export default function CategoryFilter({
  selectedCategories,
  onCategoriesChange,
  transactionCounts,
}: CategoryFilterProps) {
  const allSelected = selectedCategories.length === 0;

  const handleToggleCategory = (category: Category) => {
    if (selectedCategories.includes(category)) {
      // Remove category from selection
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      // Add category to selection
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const handleSelectAll = () => {
    onCategoriesChange([]);
  };

  const handleClearAll = () => {
    onCategoriesChange([]);
  };

  // Filter out categories with 0 transactions
  const availableCategories = CATEGORIES.filter(cat => transactionCounts[cat] > 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🔍 Filter by Category
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {allSelected
              ? `Showing all ${availableCategories.reduce((sum, cat) => sum + transactionCounts[cat], 0)} transactions`
              : `Showing ${selectedCategories.reduce((sum, cat) => sum + (transactionCounts[cat] || 0), 0)} transactions from ${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'}`
            }
          </p>
        </div>
        {!allSelected && (
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* All Categories Button */}
        <button
          onClick={handleSelectAll}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all border-2 ${
            allSelected
              ? 'bg-gray-800 text-white border-gray-800 shadow-md'
              : 'bg-gray-100 text-gray-700 border-transparent hover:border-gray-300'
          }`}
        >
          All Categories
        </button>

        {/* Category Chips */}
        {availableCategories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const count = transactionCounts[category] || 0;

          return (
            <button
              key={category}
              onClick={() => handleToggleCategory(category)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all border-2 flex items-center gap-2 ${
                isSelected
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              style={{
                backgroundColor: isSelected ? CATEGORY_COLORS[category] : undefined,
                borderColor: isSelected ? CATEGORY_COLORS[category] : undefined,
              }}
              title={`${count} transaction${count !== 1 ? 's' : ''}`}
            >
              <span>{CATEGORY_ICONS[category]}</span>
              <span>{category}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-4">
        💡 Tip: Click categories to filter. Select multiple to combine them.
      </p>
    </div>
  );
}
