import React from 'react';
import { MonthlyTrend } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Calendar, LineChart } from 'lucide-react';

interface SpendingChartProps {
  trends: MonthlyTrend[];
  selectedMonth: string;
  onMonthChange: (monthKey: string) => void;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ trends, selectedMonth, onMonthChange }) => {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
      const spending = payload.find((p: any) => p.dataKey === 'spending')?.value || 0;
      const net = income - spending;

      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">{label}</div>
          <div className="flex justify-between gap-4 text-emerald-600">
            <span>Income:</span>
            <span className="font-bold">{formatCurrency(income)}</span>
          </div>
          <div className="flex justify-between gap-4 text-rose-600">
            <span>Spending:</span>
            <span className="font-bold">{formatCurrency(spending)}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-700 pt-1 border-t border-slate-100 font-semibold">
            <span>Net Cash Flow:</span>
            <span className={net >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {net >= 0 ? '+' : ''}{formatCurrency(net)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="spending-chart-card" className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Monthly Cash Flow Trends</h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">Income vs spending activity across recent months</p>
        </div>

        {/* Month Selector Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="select-chart-month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {trends.map((t) => (
              <option key={t.monthKey} value={t.monthKey}>
                {t.month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '11px', color: '#64748b' }}
              formatter={(value) => <span className="text-slate-700 font-medium capitalize">{value}</span>}
            />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Bar dataKey="spending" name="Spending" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
