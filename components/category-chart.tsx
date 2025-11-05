'use client';

import { CategorySummary } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryChartProps {
  summary: CategorySummary[];
  totalExpenses: number;
  totalIncome: number;
}

export default function CategoryChart({
  summary,
  totalExpenses,
  totalIncome,
}: CategoryChartProps) {
  const chartData = summary.map((item) => ({
    name: item.category,
    value: item.total,
    percentage: item.percentage,
  }));

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Spending Breakdown</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) =>
                  `${CATEGORY_ICONS[name as keyof typeof CATEGORY_ICONS]} ${percentage.toFixed(0)}%`
                }
                outerRadius={100}
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

        {/* Summary Stats */}
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
            <div className="text-sm text-red-700 font-semibold">Total Expenses</div>
            <div className="text-3xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="text-sm text-green-700 font-semibold">Total Income</div>
            <div className="text-3xl font-bold text-green-600">
              ${totalIncome.toFixed(2)}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-sm text-blue-700 font-semibold">Net</div>
            <div className={`text-3xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalIncome - totalExpenses).toFixed(2)}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Top Categories</h3>
            <div className="space-y-2">
              {summary.slice(0, 5).map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{CATEGORY_ICONS[item.category]}</span>
                    <span className="text-gray-700">{item.category}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
