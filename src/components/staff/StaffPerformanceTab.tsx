import React, { useState } from 'react';
import { 
  Star, 
  Award, 
  TrendingUp, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ThumbsUp, 
  Download, 
  Plus, 
  ChevronRight,
  Filter,
  MessageSquare
} from 'lucide-react';
import { StaffMember, StaffAIInsightItem } from '../../types';

interface StaffPerformanceTabProps {
  staffList: StaffMember[];
  aiInsights: StaffAIInsightItem[];
  onSelectStaff: (staff: StaffMember) => void;
  onOpenRecognitionModal: (staff: StaffMember) => void;
  triggerToast: (msg: string) => void;
}

export default function StaffPerformanceTab({
  staffList,
  aiInsights,
  onSelectStaff,
  onOpenRecognitionModal,
  triggerToast
}: StaffPerformanceTabProps) {
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const topPerformers = [...staffList].sort((a, b) => b.performanceScore - a.performanceScore);

  const filteredStaff = selectedDept === 'All' 
    ? topPerformers 
    : topPerformers.filter(s => s.department === selectedDept);

  const bestPerformer = topPerformers[0];

  return (
    <div className="flex flex-col gap-6 font-sans animate-in fade-in duration-200">
      {/* Top Banner with Recognition Action */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-900">Hospitality Performance & Guest Ratings</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-100 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              Resort Avg: 4.8 / 5.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time correlation between guest reviews, TripAdvisor/Google mentions, room turnarounds, and manager evaluations.
          </p>
        </div>

        <button
          onClick={() => onOpenRecognitionModal(bestPerformer)}
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Issue Star Recognition</span>
        </button>
      </div>

      {/* 1. TOP PERFORMER HIGHLIGHT & AI INSIGHT PODIUM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* PODIUM 1: Head Chef Vikram & Top 3 Podium (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-base text-slate-900">August Top Performers Podium</h4>
              </div>
              <span className="text-xs font-bold text-slate-400">Based on 340+ Guest Reviews</span>
            </div>

            {/* Podium Visual Cards */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-center items-end">
              {/* 2nd Place */}
              {topPerformers[1] && (
                <div 
                  onClick={() => onSelectStaff(topPerformers[1])}
                  className="bg-slate-50 hover:bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 flex flex-col items-center gap-2 transition-all cursor-pointer group pt-6"
                >
                  <div className="relative">
                    <img 
                      src={topPerformers[1].avatarImage || "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"} 
                      alt={topPerformers[1].name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-300" 
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      2
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 group-hover:text-teal-800 transition-colors leading-tight">
                      {topPerformers[1].name}
                    </p>
                    <p className="text-[10px] text-slate-400">{topPerformers[1].role}</p>
                  </div>
                  <div className="text-xs font-black text-amber-600">
                    ⭐ {topPerformers[1].performanceScore.toFixed(2)}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {topPerformers[1].tasksCompleted} Tasks
                  </span>
                </div>
              )}

              {/* 1st Place (Taller & Highlighted) */}
              {topPerformers[0] && (
                <div 
                  onClick={() => onSelectStaff(topPerformers[0])}
                  className="bg-gradient-to-b from-amber-50/70 to-amber-100/40 hover:to-amber-100/70 p-4 rounded-2xl border border-amber-200 flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-sm ring-1 ring-amber-300/50"
                >
                  <div className="relative">
                    <img 
                      src={topPerformers[0].avatarImage || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80"} 
                      alt={topPerformers[0].name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-400 shadow-sm" 
                    />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shadow-xs">
                      👑
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                      Champion of Month
                    </span>
                    <p className="font-bold text-sm text-slate-900 group-hover:text-teal-900 transition-colors mt-1 leading-tight">
                      {topPerformers[0].name}
                    </p>
                    <p className="text-[11px] text-slate-500">{topPerformers[0].role}</p>
                  </div>
                  <div className="text-sm font-black text-amber-700">
                    ⭐ {topPerformers[0].performanceScore.toFixed(2)}
                  </div>
                  <span className="text-[10px] font-bold text-amber-900 bg-white/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {topPerformers[0].tasksCompleted} Tasks (99%)
                  </span>
                </div>
              )}

              {/* 3rd Place */}
              {topPerformers[2] && (
                <div 
                  onClick={() => onSelectStaff(topPerformers[2])}
                  className="bg-slate-50 hover:bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 flex flex-col items-center gap-2 transition-all cursor-pointer group pt-8"
                >
                  <div className="relative">
                    <img 
                      src={topPerformers[2].avatarImage || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"} 
                      alt={topPerformers[2].name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-700/40" 
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      3
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 group-hover:text-teal-800 transition-colors leading-tight">
                      {topPerformers[2].name}
                    </p>
                    <p className="text-[10px] text-slate-400">{topPerformers[2].role}</p>
                  </div>
                  <div className="text-xs font-black text-amber-600">
                    ⭐ {topPerformers[2].performanceScore.toFixed(2)}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {topPerformers[2].tasksCompleted} Tasks
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-xs font-bold text-slate-800">97.8%</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Task SLA Met</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-xs font-bold text-slate-800">5.4 Mins</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Avg Response</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-xs font-bold text-emerald-700">0 Complaints</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Guest Escalation</span>
            </div>
          </div>
        </div>

        {/* AI INSIGHTS & GUEST FEEDBACK CARDS (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-xs text-slate-900">{insight.title}</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-100">
                  {insight.badge}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{insight.note}"
              </p>

              {insight.recommendation && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700">
                  <strong className="text-teal-900 font-bold">Recommendation: </strong>
                  {insight.recommendation}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                <span>— {insight.author}</span>
                {insight.actionLabel && (
                  <button
                    onClick={() => {
                      if (insight.actionType === 'recognition') {
                        onOpenRecognitionModal(bestPerformer);
                      } else {
                        triggerToast(`Action applied: ${insight.actionLabel}`);
                      }
                    }}
                    className="font-bold text-teal-800 hover:text-teal-900 cursor-pointer"
                  >
                    {insight.actionLabel} →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 2. FULL STAFF PERFORMANCE LEADERBOARD TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-base text-slate-900">Comprehensive Staff Performance Scorecards</h4>
            <p className="text-xs text-slate-500 mt-0.5">Individual metrics across tasks, guest feedback, and response times.</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="All">All Departments</option>
              <option value="Front Desk">Front Desk</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Security">Security</option>
            </select>

            <button
              onClick={() => triggerToast("Performance appraisals report downloaded.")}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Appraisals</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">RANK</th>
                <th className="py-3.5 px-4">STAFF MEMBER</th>
                <th className="py-3.5 px-3">DEPARTMENT</th>
                <th className="py-3.5 px-3 text-center">OVERALL SCORE</th>
                <th className="py-3.5 px-3 text-center">TASKS DONE</th>
                <th className="py-3.5 px-3 text-center">COMPLETION %</th>
                <th className="py-3.5 px-3 text-center">AVG RESPONSE</th>
                <th className="py-3.5 px-3 text-center">GUEST RATING</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStaff.map((staff, idx) => (
                <tr 
                  key={staff.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => onSelectStaff(staff)}
                >
                  <td className="py-3.5 px-4 text-center font-black text-xs text-slate-500">
                    #{idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${staff.avatarBg || 'bg-teal-100 text-teal-800'} flex items-center justify-center font-bold text-xs`}>
                        {staff.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-teal-800 text-xs">{staff.name}</p>
                        <p className="text-[10px] text-slate-400">{staff.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-600">{staff.department}</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                      ⭐ {staff.performanceScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">{staff.tasksCompleted}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-700">{staff.taskCompletionRate}%</td>
                  <td className="py-3.5 px-3 text-center font-medium text-slate-600">{staff.responseTimeMins} mins</td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">{staff.guestRating} / 5.0</td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenRecognitionModal(staff)}
                      className="px-3 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Recognize
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
