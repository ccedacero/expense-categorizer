/**
 * Loading Skeleton Component
 *
 * Provides smooth skeleton screens while content is loading
 * for better perceived performance
 */

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Success Header Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="h-8 bg-gray-200 rounded w-96 max-w-full" />
          <div className="h-5 bg-gray-200 rounded w-64 max-w-full" />
          <div className="flex gap-4 mt-4">
            <div className="h-10 bg-gray-200 rounded w-32" />
            <div className="h-10 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-64 h-64 bg-gray-200 rounded-full" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-full" />
            <div className="h-5 bg-gray-200 rounded w-full" />
            <div className="h-5 bg-gray-200 rounded w-full" />
            <div className="h-5 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>

      {/* Subscription Insights Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="h-6 bg-gray-200 rounded w-56 mb-6" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Export Buttons Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-3">
          <div className="h-10 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-40" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl shadow-lg">
        {/* Search bar */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="h-11 bg-gray-200 rounded-lg" />
        </div>

        {/* Table header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-300 rounded w-24" />
            <div className="h-4 bg-gray-300 rounded flex-1" />
            <div className="h-4 bg-gray-300 rounded w-24" />
            <div className="h-4 bg-gray-300 rounded w-32" />
            <div className="h-4 bg-gray-300 rounded w-24" />
            <div className="h-4 bg-gray-300 rounded w-20" />
          </div>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-gray-200">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex gap-4 items-center">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded flex-1" />
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-6 bg-gray-200 rounded-full w-32" />
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
