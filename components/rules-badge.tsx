/**
 * Rules Badge Component
 *
 * Shows learned rules count with link to /rules page
 * Non-intrusive, appears in header
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRulesCount } from '@/lib/learning-rules';

export default function RulesBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Load rules count on mount
    const loadCount = () => {
      const rulesCount = getRulesCount();
      setCount(rulesCount);
    };

    loadCount();

    // Listen for storage changes (when rules are added/deleted)
    const handleStorageChange = () => {
      loadCount();
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab updates
    window.addEventListener('rulesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rulesUpdated', handleStorageChange);
    };
  }, []);

  if (count === 0) {
    return null; // Don't show if no rules
  }

  return (
    <Link
      href="/rules"
      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
      title="View your learned categorization rules"
    >
      <span className="text-blue-600 group-hover:scale-110 transition-transform">
        📚
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-blue-900">
          {count} {count === 1 ? 'Rule' : 'Rules'}
        </span>
        <span className="text-[10px] text-blue-600">
          Learned
        </span>
      </div>
    </Link>
  );
}
