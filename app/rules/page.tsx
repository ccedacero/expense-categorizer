/**
 * Rules Management Page
 *
 * Allows users to view, manage, and understand their learned categorization rules
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getRules,
  deleteRule,
  clearAllRules,
  exportRulesAsJSON,
  importRulesFromJSON,
  CategoryRule,
} from '@/lib/learning-rules';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants';

export default function RulesPage() {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    const loadedRules = getRules();
    // Sort by most recently applied
    loadedRules.sort((a, b) => {
      const dateA = a.lastApplied ? new Date(a.lastApplied).getTime() : 0;
      const dateB = b.lastApplied ? new Date(b.lastApplied).getTime() : 0;
      return dateB - dateA;
    });
    setRules(loadedRules);
  };

  const handleDelete = (ruleId: string) => {
    if (confirm('Delete this rule? Future transactions will not be auto-categorized with this rule.')) {
      deleteRule(ruleId);
      loadRules();
    }
  };

  const handleClearAll = () => {
    clearAllRules();
    setRules([]);
    setShowClearConfirm(false);
  };

  const handleExport = () => {
    const json = exportRulesAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `categorization-rules-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importRulesFromJSON(content);

      if (result.success) {
        setImportStatus(`✅ Successfully imported ${result.imported} new rules`);
        loadRules();
      } else {
        setImportStatus(`❌ Error: ${result.error}`);
      }

      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
  };

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← Back to App
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📚 Learned Rules
          </h1>
          <p className="text-gray-600">
            View and manage the categorization rules you have taught the AI
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">{rules.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Rules</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-3xl font-bold text-green-600">
              {rules.reduce((sum, r) => sum + r.appliedCount, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Times Applied</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round((rules.reduce((sum, r) => sum + r.appliedCount, 0) / Math.max(rules.length, 1)))}
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg Uses Per Rule</div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              disabled={rules.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              📥 Export Rules
            </button>
            <label className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-2">
              📤 Import Rules
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={rules.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              🗑️ Clear All Rules
            </button>
          </div>
          {importStatus && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              {importStatus}
            </div>
          )}
        </div>

        {/* Rules List */}
        {rules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No rules yet
            </h3>
            <p className="text-gray-600 mb-6">
              Edit a transaction category to teach the AI. It will create rules automatically!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Categorizing
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Merchant Pattern
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Times Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        &quot;{rule.merchantPattern}&quot;
                      </div>
                      <div className="text-xs text-gray-500">
                        Created {formatDate(rule.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-medium"
                        style={{ backgroundColor: CATEGORY_COLORS[rule.category] }}
                      >
                        <span>{CATEGORY_ICONS[rule.category]}</span>
                        {rule.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.appliedCount}x
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rule.lastApplied ? formatDate(rule.lastApplied) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Clear All Rules?
              </h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete all {rules.length} learned rules. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
