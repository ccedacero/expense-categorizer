'use client';

import { CategorySummary } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryChartProps {
  summary: CategorySummary[];
  totalExpenses: number;
  totalIncome: number;
  totalPayments: number;
  totalRefunds: number;
  isCreditCard: boolean;
}

export default function CategoryChart({
  summary,
  totalExpenses,
  totalIncome,
  totalPayments,
  totalRefunds,
  isCreditCard,
}: CategoryChartProps) {
  const chartData = summary.map((item) => ({
    name: item.category,
    value: item.total,
    percentage: item.percentage,
  }));

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Spending Breakdown</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              isCreditCard
                ? 'bg-purple-100 text-purple-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {isCreditCard ? '💳 Credit Card Statement' : '🏦 Bank Account Statement'}
            </span>
          </div>
        </div>

        {/* Help Section */}
        <div className="group relative">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Tooltip on hover */}
          <div className="invisible group-hover:visible absolute right-0 top-8 w-80 bg-gray-900 text-white text-xs rounded-lg p-4 shadow-xl z-10">
            <div className="font-semibold mb-2">Understanding Your Statement</div>
            {isCreditCard ? (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-purple-300">💳 Payment:</span> Money you sent to pay your credit card bill
                </div>
                <div>
                  <span className="font-semibold text-green-300">↩️ Refund:</span> Money a merchant returned to your card
                </div>
                <div className="mt-3 pt-2 border-t border-gray-700 text-gray-300">
                  <span className="font-semibold">Note:</span> Positive amounts on credit cards are either Payments or Refunds, never Income.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-green-300">💰 Income:</span> Money you earned (salary, deposits, etc.)
                </div>
                <div>
                  <span className="font-semibold text-purple-300">💳 Payment:</span> Money sent to pay bills or credit cards
                </div>
                <div className="mt-3 pt-2 border-t border-gray-700 text-gray-300">
                  <span className="font-semibold">Tip:</span> Net = Income - Expenses shows your savings or spending for the period.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[3fr_2fr] gap-8">
        {/* Pie Chart */}
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) =>
                  `${CATEGORY_ICONS[name as keyof typeof CATEGORY_ICONS]} ${percentage.toFixed(0)}%`
                }
                outerRadius={130}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats - Different display for Credit Cards vs Bank Accounts */}
        <div className="flex flex-col gap-4">
          {/* Total Expenses/Spending - Always show */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg group relative">
            <div className="flex items-center justify-between">
              <div className="text-sm text-red-700 font-semibold">
                {isCreditCard ? 'Total Spending' : 'Total Expenses'}
              </div>
              <div className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </div>
            {/* Tooltip */}
            <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-10">
              {isCreditCard
                ? 'All charges made on your credit card (excluding payments and transfers)'
                : 'All money spent from your bank account (excluding payments and transfers)'
              }
            </div>
          </div>

          {/* Credit Card: Show Payments and Refunds */}
          {isCreditCard ? (
            <>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg group relative">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-purple-700 font-semibold">Total Payments</div>
                  <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  ${totalPayments.toFixed(2)}
                </div>
                {/* Tooltip */}
                <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-10">
                  Money you sent to pay off your credit card balance (e.g., &ldquo;Payment Thank You&rdquo;)
                </div>
              </div>

              {totalRefunds > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg group relative">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-green-700 font-semibold">Total Refunds</div>
                    <div className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    ${totalRefunds.toFixed(2)}
                  </div>
                  {/* Tooltip */}
                  <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-10">
                    Money returned to your card by merchants (returns, cancellations)
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg group relative">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-700 font-semibold">Balance Change</div>
                  <div className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${totalPayments + totalRefunds - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${((totalPayments + totalRefunds) - totalExpenses).toFixed(2)}
                </div>
                {/* Tooltip */}
                <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-10">
                  Net change in your credit card balance. Positive means you reduced your debt, negative means it increased.
                </div>
              </div>
            </>
          ) : (
            /* Bank Account: Show Income and Net */
            <>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg group relative">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-green-700 font-semibold">Total Income</div>
                  <div className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1 a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  ${totalIncome.toFixed(2)}
                </div>
                {/* Tooltip */}
                <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-10">
                  Money you earned or received (salary, deposits, interest, etc.)
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg group relative">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-700 font-semibold">Net</div>
                  <div className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(totalIncome - totalExpenses).toFixed(2)}
                </div>
                {/* Tooltip */}
                <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-10">
                  Your savings for this period. Positive means you saved money, negative means you spent more than you earned.
                </div>
              </div>
            </>
          )}

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Top Categories</h3>
            </div>
            <div className="space-y-2">
              {summary.slice(0, 5).map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{CATEGORY_ICONS[item.category]}</span>
                    <div>
                      <span className="text-gray-700 font-medium">{item.category}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({item.count} transaction{item.count !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${item.total.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
