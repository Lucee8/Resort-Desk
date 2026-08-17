import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertOctagon, 
  Layers, 
  PieChart, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { MaintenanceTicket } from '../../types';

interface MaintenanceAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: MaintenanceTicket[];
}

export default function MaintenanceAnalyticsModal({
  isOpen,
  onClose,
  tickets
}: MaintenanceAnalyticsModalProps) {
  if (!isOpen) return null;

  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');

  // Category counts
  const categoryData = [
    { name: 'HVAC & Cooling', count: 7, percentage: 38, cost: 62400, color: 'bg-teal-700' },
    { name: 'Plumbing & Drainage', count: 5, percentage: 28, cost: 38200, color: 'bg-cyan-600' },
    { name: 'Electrical & Power', count: 3, percentage: 16, cost: 24000, color: 'bg-amber-600' },
    { name: 'Door & Lock / IoT', count: 2, percentage: 11, cost: 11200, color: 'bg-indigo-600' },
    { name: 'Civil & Balcony', count: 1, percentage: 7, cost: 7000, color: 'bg-slate-500' }
  ];

  // Room frequency ranking
  const repeatRooms = [
    { room: 'Deluxe Villa #104', issuesCount: 7, primaryCategory: 'HVAC & Plumbing', risk: 'High', status: 'Blocked' },
    { room: 'Room #302', issuesCount: 5, primaryCategory: 'Plumbing & Electrical', risk: 'Medium', status: 'Ready' },
    { room: 'Beachfront #005', issuesCount: 4, primaryCategory: 'Door & Lock', risk: 'High', status: 'Blocked' },
    { room: 'Sunset Suite #202', issuesCount: 3, primaryCategory: 'Civil & Balcony', risk: 'Low', status: 'Ready' },
    { room: 'Royal Villa #108', issuesCount: 2, primaryCategory: 'Jacuzzi & Pumps', risk: 'Medium', status: 'Blocked' }
  ];

  // Monthly trends
  const trendDays = [
    { label: 'Oct 18', count: 4, resolved: 4, cost: 14200 },
    { label: 'Oct 19', count: 6, resolved: 5, cost: 21000 },
    { label: 'Oct 20', count: 3, resolved: 3, cost: 9800 },
    { label: 'Oct 21', count: 8, resolved: 7, cost: 32000 },
    { label: 'Oct 22', count: 5, resolved: 5, cost: 16400 },
    { label: 'Oct 23', count: 7, resolved: 6, cost: 24800 },
    { label: 'Oct 24 (Today)', count: 5, resolved: 2, cost: 18600 }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Maintenance Analytics & Cost Tracking
              </h3>
              <p className="text-xs text-slate-500">
                Operational metrics, room failure frequency & expenditure breakdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
              <button 
                onClick={() => setTimeRange('weekly')}
                className={`px-3 py-1 rounded-lg transition-colors ${timeRange === 'weekly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
              >
                7 Days
              </button>
              <button 
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1 rounded-lg transition-colors ${timeRange === 'monthly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setTimeRange('quarterly')}
                className={`px-3 py-1 rounded-lg transition-colors ${timeRange === 'quarterly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
              >
                Q4
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top High-level KPI summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Resolution Time</span>
                <Clock className="w-4 h-4 text-teal-700" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">38 mins</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">↓ 6 mins vs last week</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Month Spending</span>
                <DollarSign className="w-4 h-4 text-emerald-700" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">₹1,42,800</p>
              <p className="text-[11px] text-slate-500 mt-0.5">8% under monthly budget</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">First-Time Fix Rate</span>
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">91.4%</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Top tier hospitality benchmark</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Parts vs Labor Ratio</span>
                <Layers className="w-4 h-4 text-indigo-700" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">64% : 36%</p>
              <p className="text-[11px] text-slate-500 mt-0.5">₹91k parts / ₹51k staff labor</p>
            </div>
          </div>

          {/* Section 2: Category Breakdown & Spending */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category distribution */}
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                Issues by Category
              </h4>
              <div className="space-y-3">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{cat.name} ({cat.count} tickets)</span>
                      <span className="font-mono text-slate-900">₹{cat.cost.toLocaleString()} ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${cat.color} h-full rounded-full transition-all`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily ticket & resolution trend */}
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                Daily Work Orders (Past 7 Days)
              </h4>
              <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 border-b border-slate-100">
                {trendDays.map((td) => {
                  const heightPercent = Math.min(100, (td.count / 10) * 100);
                  return (
                    <div key={td.label} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {td.count}
                      </span>
                      <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden h-32 flex items-end">
                        <div 
                          className="w-full bg-teal-700 group-hover:bg-teal-600 rounded-t-md transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-medium text-slate-500 truncate w-full text-center mt-1">
                        {td.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Section 3: Room Maintenance Frequency Table */}
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Room Maintenance Frequency & Chronic Issues
                </h4>
                <p className="text-xs text-slate-500">
                  Rooms identified with repeated complaint history over 90 days
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                5 High-Frequency Rooms
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">Room / Villa</th>
                    <th className="py-2.5 px-3">Total Issues</th>
                    <th className="py-2.5 px-3">Primary Category</th>
                    <th className="py-2.5 px-3">Failure Risk</th>
                    <th className="py-2.5 px-3 text-right">PMS Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {repeatRooms.map((r) => (
                    <tr key={r.room} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800">{r.room}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {r.issuesCount} tickets
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{r.primaryCategory}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.risk === 'High' ? 'bg-rose-50 text-rose-700' :
                          r.risk === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.risk} Risk
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'Blocked' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
