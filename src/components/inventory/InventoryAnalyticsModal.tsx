import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Layers, 
  Flame, 
  Snowflake, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  Download
} from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryAnalyticsModalProps {
  items: InventoryItem[];
  onClose: () => void;
  onSelectFastMovingItem: (item: InventoryItem) => void;
}

export default function InventoryAnalyticsModal({
  items,
  onClose,
  onSelectFastMovingItem
}: InventoryAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'movement' | 'categories'>('overview');

  // Calculations
  const totalValuation = items.reduce((sum, item) => sum + item.totalValue, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.currentStock, 0);
  const monthlySpendEstimate = 234000;
  const turnoverRate = 4.8;
  const avgDaysInStock = 18;

  // Category breakdown
  const categoryStats = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { count: 0, value: 0, itemsCount: 0 };
    }
    acc[item.category].count += 1;
    acc[item.category].value += item.totalValue;
    acc[item.category].itemsCount += item.currentStock;
    return acc;
  }, {} as Record<string, { count: number; value: number; itemsCount: number }>);

  // Fast-moving vs Slow-moving
  const fastMoving = [...items].sort((a, b) => b.consumptionRateWeekly - a.consumptionRateWeekly).slice(0, 4);
  const slowMoving = [...items].sort((a, b) => a.consumptionRateWeekly - b.consumptionRateWeekly).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <BarChart3 className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Inventory Valuation & Consumption Analytics
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Real-time asset accounting, stock velocity, and expenditure distribution.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview' ? 'border-teal-800 text-teal-950' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Executive Summary
          </button>
          <button
            onClick={() => setActiveTab('movement')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'movement' ? 'border-teal-800 text-teal-950' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Velocity (Fast vs Slow Moving)
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'categories' ? 'border-teal-800 text-teal-950' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Category Distribution
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'overview' && (
            <>
              {/* 4 Core Metric Blocks */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Held Valuation
                  </span>
                  <p className="text-xl font-bold font-mono text-teal-950 mt-1">
                    ₹ {totalValuation.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-teal-800 font-medium">+4.2% vs last month</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Monthly Supply Spend
                  </span>
                  <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                    ₹ {monthlySpendEstimate.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-slate-500 font-medium">Within ₹2.5L budget</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Turnover Velocity
                  </span>
                  <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {turnoverRate}x / Year
                  </p>
                  <span className="text-[11px] text-teal-800 font-medium">Healthy hospitality benchmark</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Avg Days in Stock
                  </span>
                  <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {avgDaysInStock} Days
                  </p>
                  <span className="text-[11px] text-slate-500 font-medium">Optimal buffer</span>
                </div>
              </div>

              {/* Monthly Consumption Trends Visual Chart */}
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    6-Month Operational Consumption Trend (₹ In Lakhs)
                  </h4>
                  <span className="text-[11px] text-slate-500">Historical & Occupancy Correlated</span>
                </div>

                <div className="grid grid-cols-6 gap-3 items-end h-40 pt-4">
                  {[
                    { month: 'May', cost: 1.85, height: '60%' },
                    { month: 'Jun', cost: 2.10, height: '70%' },
                    { month: 'Jul', cost: 1.60, height: '52%' },
                    { month: 'Aug', cost: 2.45, height: '82%' },
                    { month: 'Sep', cost: 1.95, height: '65%' },
                    { month: 'Oct (Current)', cost: 2.34, height: '78%', current: true }
                  ].map((m) => (
                    <div key={m.month} className="flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-mono font-bold text-slate-700">₹{m.cost}L</span>
                      <div className="w-full max-w-[40px] bg-slate-200 rounded-t-xl overflow-hidden h-full flex items-end">
                        <div
                          className={`w-full rounded-t-xl transition-all ${
                            m.current ? 'bg-teal-700' : 'bg-slate-400'
                          }`}
                          style={{ height: m.height }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 truncate max-w-full">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'movement' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fast Moving Items */}
              <div className="bg-white rounded-2xl p-4 border border-teal-200 bg-teal-50/20">
                <div className="flex items-center gap-2 pb-3 border-b border-teal-100">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-950">
                      Fast-Moving Supplies (High Velocity)
                    </h4>
                    <span className="text-[10px] text-teal-700">Frequent restocks required</span>
                  </div>
                </div>

                <div className="divide-y divide-teal-100 mt-2">
                  {fastMoving.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectFastMovingItem(item)}
                      className="py-2.5 flex items-center justify-between gap-2 hover:bg-teal-50/50 px-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{item.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.sku} • {item.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-teal-800 block">
                          ~{item.consumptionRateWeekly} {item.unit}/wk
                        </span>
                        <span className="text-[10px] text-teal-600 font-medium">Burn Rate</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slow Moving / Dead Stock */}
              <div className="bg-white rounded-2xl p-4 border border-sky-200 bg-sky-50/20">
                <div className="flex items-center gap-2 pb-3 border-b border-sky-100">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                    <Snowflake className="w-4 h-4 text-sky-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-950">
                      Slow-Moving / Buffer Stock
                    </h4>
                    <span className="text-[10px] text-sky-700">Capital tied up &gt; 60 days</span>
                  </div>
                </div>

                <div className="divide-y divide-sky-100 mt-2">
                  {slowMoving.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectFastMovingItem(item)}
                      className="py-2.5 flex items-center justify-between gap-2 hover:bg-sky-50/50 px-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{item.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Held: ₹{item.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-sky-900 block">
                          {item.consumptionRateWeekly} {item.unit}/wk
                        </span>
                        <span className="text-[10px] text-slate-400">Low burn rate</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Valuation Share by Operational Supply Category
              </h4>

              <div className="space-y-3">
                {Object.entries(categoryStats).map(([cat, stat]) => {
                  const percentage = totalValuation > 0 ? Math.round((stat.value / totalValuation) * 100) : 0;
                  return (
                    <div key={cat} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{cat}</span>
                          <span className="text-[11px] text-slate-400">({stat.count} SKUs, {stat.itemsCount} units)</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-teal-950">₹ {stat.value.toLocaleString()}</span>
                          <span className="text-slate-400 text-[11px] ml-2">({percentage}%)</span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                        <div
                          className="bg-teal-700 h-full rounded-full transition-all"
                          style={{ width: `${Math.max(4, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Export certified audit accounting report available.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
