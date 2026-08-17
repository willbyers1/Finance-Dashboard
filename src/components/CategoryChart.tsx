import React from 'react';
import { CategorySpend } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, Filter } from 'lucide-react';

interface CategoryChartProps {
  categories: CategorySpend[];
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  categories,
  onSelectCategory,
  selectedCategory,
}) => {
  const formatCurrency = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: CategorySpend = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            {data.category}
          </div>
          <div className="text-slate-600">
            Amount: <span className="font-bold text-slate-900">{formatCurrency(data.amount)}</span>
          </div>
          <div className="text-slate-500">
            Share: <span className="font-semibold text-indigo-600">{data.percentage}%</span> ({data.count} transactions)
          </div>
        </div>
      );
    }
    return null;
  };

  if (!categories || categories.length === 0) {
    return (
      <div id="category-chart-card" className="bg-white border border-slate-200 p-5 rounded-2xl text-center py-12 text-slate-500 text-xs shadow-xs">
        No spending transactions recorded for this period.
      </div>
    );
  }

  return (
    <div id="category-chart-card" className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Category Breakdown</h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">Where your money went this month</p>
        </div>
        {selectedCategory && selectedCategory !== 'ALL' && (
          <button
            onClick={() => onSelectCategory && onSelectCategory('ALL')}
            className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg transition-colors"
          >
            <Filter className="w-3 h-3 text-indigo-600" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Donut Chart Visualizer */}
        <div className="lg:col-span-5 h-48 sm:h-52 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="amount"
              >
                {categories.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onClick={() => onSelectCategory && onSelectCategory(entry.category)}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Top Category</span>
            <span className="text-xs font-extrabold text-slate-900 max-w-[100px] truncate">
              {categories[0]?.category || 'N/A'}
            </span>
          </div>
        </div>

        {/* Category List */}
        <div className="lg:col-span-7 space-y-2 max-h-56 overflow-y-auto pr-1">
          {categories.slice(0, 6).map((cat) => {
            const isSelected = selectedCategory === cat.category;
            return (
              <button
                key={cat.category}
                onClick={() => onSelectCategory && onSelectCategory(cat.category)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all text-left ${
                  isSelected
                    ? 'bg-slate-100 border border-indigo-300 font-bold'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-slate-800 font-semibold truncate">{cat.category}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <span className="font-extrabold text-slate-900">{formatCurrency(cat.amount)}</span>
                  <span className="text-[11px] font-bold text-slate-500 w-9 text-right">{cat.percentage}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
