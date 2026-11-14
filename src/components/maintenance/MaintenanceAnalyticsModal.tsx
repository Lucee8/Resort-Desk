import React, { useMemo, useState } from 'react';
import {
  X,
  BarChart3,
  DollarSign,
  Clock,
  Layers,
  CheckCircle2,
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
  tickets,
}: MaintenanceAnalyticsModalProps) {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');

  const analytics = useMemo(() => {
    const total = tickets.length || 1;
    const totalParts = tickets.reduce((s, t) => s + (t.cost?.parts || 0), 0);
    const totalLabor = tickets.reduce((s, t) => s + (t.cost?.labor || 0), 0);
    const totalSpending = tickets.reduce(
      (s, t) => s + (t.cost?.total || (t.cost?.parts || 0) + (t.cost?.labor || 0)),
      0
    );
    const resolvedCount = tickets.filter(
      (t) => t.status === 'Resolved' || t.status === 'Closed'
    ).length;
    const resolutionRate = tickets.length > 0 ? Math.round((resolvedCount / tickets.length) * 100) : 0;

    const partsPct =
      totalSpending > 0 ? Math.round((totalParts / totalSpending) * 100) : 0;
    const laborPct = totalSpending > 0 ? Math.max(0, 100 - partsPct) : 0;

    const palette = ['bg-teal-700', 'bg-cyan-600', 'bg-amber-600', 'bg-indigo-600', 'bg-slate-500'];
    const catMap = new Map<string, { count: number; cost: number }>();
    for (const t of tickets) {
      const prev = catMap.get(t.category) || { count: 0, cost: 0 };
      catMap.set(t.category, {
        count: prev.count + 1,
        cost: prev.cost + (t.cost?.total || (t.cost?.parts || 0) + (t.cost?.labor || 0)),
      });
    }
    const categoryData = Array.from(catMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6)
      .map(([name, val], idx) => ({
        name,
        count: val.count,
        cost: val.cost,
        percentage: Math.round((val.count / total) * 100),
        color: palette[idx % palette.length],
      }));

    const roomMap = new Map<
      string,
      { count: number; categories: string[]; blocked: boolean }
    >();
    for (const t of tickets) {
      const prev = roomMap.get(t.roomNumber) || {
        count: 0,
        categories: [],
        blocked: false,
      };
      prev.count += 1;
      if (!prev.categories.includes(t.category)) prev.categories.push(t.category);
      if (t.isRoomBlocked && t.status !== 'Closed') prev.blocked = true;
      roomMap.set(t.roomNumber, prev);
    }

    const repeatRooms = Array.from(roomMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6)
      .map(([room, val]) => ({
        room,
        issuesCount: val.count,
        primaryCategory: val.categories.slice(0, 2).join(' & '),
        risk: val.count >= 3 ? 'High' : val.count === 2 ? 'Medium' : 'Low',
        status: val.blocked ? 'Blocked' : 'Ready',
      }));

    const statusBars = (
      ['Reported', 'Assigned', 'In Progress', 'Waiting for Parts', 'Resolved', 'Closed'] as const
    ).map((st) => ({
      label: st === 'Waiting for Parts' ? 'Parts' : st,
      count: tickets.filter((t) => t.status === st).length,
    }));

    return {
      totalSpending,
      totalParts,
      totalLabor,
      partsPct,
      laborPct,
      resolvedCount,
      resolutionRate,
      categoryData,
      repeatRooms,
      statusBars,
    };
  }, [tickets]);

  if (!isOpen) return null;

  const maxStatusCount = Math.max(1, ...analytics.statusBars.map((b) => b.count));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Maintenance Analytics &amp; Cost Tracking
              </h3>
              <p className="text-xs text-slate-500">
                Live breakdown from {tickets.length} Firestore work order(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
              {(['weekly', 'monthly', 'quarterly'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg transition-colors capitalize cursor-pointer ${
                    timeRange === r
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  {r === 'weekly' ? '7 Days' : r === 'monthly' ? 'Month' : 'Quarter'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Total Tickets
                </span>
                <Clock className="w-4 h-4 text-teal-700" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {tickets.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {analytics.resolvedCount} resolved/closed
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Tracked Cost
                </span>
                <DollarSign className="w-4 h-4 text-emerald-700" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                ₹{analytics.totalSpending.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Across logged work orders
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Completion Rate
                </span>
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {analytics.resolutionRate}%
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                Live closure ratio
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Parts vs Labor
                </span>
                <Layers className="w-4 h-4 text-indigo-700" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {analytics.partsPct}% : {analytics.laborPct}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ₹{analytics.totalParts.toLocaleString('en-IN')} parts / ₹
                {analytics.totalLabor.toLocaleString('en-IN')} labor
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                Issues by Category
              </h4>
              {analytics.categoryData.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  No maintenance tickets logged yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.categoryData.map((cat) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>
                          {cat.name} ({cat.count})
                        </span>
                        <span className="font-mono text-slate-900">
                          ₹{cat.cost.toLocaleString('en-IN')} ({cat.percentage}%)
                        </span>
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
              )}
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                Work Orders by Workflow Stage
              </h4>
              <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 border-b border-slate-100">
                {analytics.statusBars.map((bar) => {
                  const heightPercent = Math.round((bar.count / maxStatusCount) * 100);
                  return (
                    <div
                      key={bar.label}
                      className="flex-1 flex flex-col items-center gap-1 group"
                    >
                      <span className="text-[10px] font-mono text-slate-600 font-bold">
                        {bar.count}
                      </span>
                      <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden h-28 flex items-end">
                        <div
                          className="w-full bg-teal-700 group-hover:bg-teal-600 rounded-t-md transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-medium text-slate-500 truncate w-full text-center mt-1">
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Cottage Maintenance Frequency
                </h4>
                <p className="text-xs text-slate-500">
                  Live frequency per cottage across tracked work orders
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {analytics.repeatRooms.length} Cottages Tracked
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">Cottage / Facility</th>
                    <th className="py-2.5 px-3">Total Issues</th>
                    <th className="py-2.5 px-3">Categories</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3 text-right">PMS Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.repeatRooms.map((r) => (
                    <tr key={r.room} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800">{r.room}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {r.issuesCount} ticket(s)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{r.primaryCategory}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.risk === 'High'
                              ? 'bg-rose-50 text-rose-700'
                              : r.risk === 'Medium'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.risk}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'Blocked'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
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

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
