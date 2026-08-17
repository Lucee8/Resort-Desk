import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle, 
  Calendar, 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { StaffMember, StaffLeaveRequest, StaffCoverageDay } from '../../types';

interface StaffAIWorkspaceTabProps {
  staffList: StaffMember[];
  leaveRequests: StaffLeaveRequest[];
  weeklyCoverage: StaffCoverageDay[];
  onSelectStaff: (staff: StaffMember) => void;
  triggerToast: (msg: string) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  cards?: {
    type: 'staff_list' | 'coverage_alert' | 'cost_projection' | 'appraisal';
    title: string;
    items?: any[];
    actionLabel?: string;
  };
}

export default function StaffAIWorkspaceTab({
  staffList,
  leaveRequests,
  weeklyCoverage,
  onSelectStaff,
  triggerToast
}: StaffAIWorkspaceTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: "Hello Anjali! I am your ResortDesk AI Workforce Intelligence Copilot. I analyze real-time biometric attendance, guest review correlations, shift coverage gaps, and payroll optimizations across all 15 resort staff members.",
      timestamp: 'Just now',
      cards: {
        type: 'coverage_alert',
        title: 'Wednesday Evening Front Desk Gap Identified',
        items: [
          { text: 'Sneha Patil on approved Marriage Leave (Aug 24 - 29)' },
          { text: 'Recommendation: Assign Priya Sharma (02:00 PM - 11:00 PM)' }
        ],
        actionLabel: 'Auto-Assign Priya Sharma'
      }
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    "Who is on duty right now?",
    "Who is on leave this week?",
    "Generate appraisal summary for Vikram Kadam",
    "Simulate labor cost for 95% occupancy weekend",
    "Which department had the most overtime?"
  ];

  const handleSendMessage = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const q = queryText.toLowerCase();
      let aiResponse: Message;

      if (q.includes('on duty') || q.includes('working') || q.includes('active')) {
        const onDuty = staffList.filter(s => s.status === 'On Duty');
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Currently, **${onDuty.length} of ${staffList.length} staff members** are actively punched in and On Duty across the resort:`,
          timestamp: 'Just now',
          cards: {
            type: 'staff_list',
            title: `Active Roster (${onDuty.length} On Duty)`,
            items: onDuty.map(s => ({
              id: s.id,
              name: s.name,
              role: s.role,
              shift: s.todayShift,
              dept: s.department
            }))
          }
        };
      } else if (q.includes('leave') || q.includes('absent')) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Here is the current leave schedule for this week:`,
          timestamp: 'Just now',
          cards: {
            type: 'staff_list',
            title: `Approved & Pending Leaves`,
            items: leaveRequests.map(l => ({
              id: l.id,
              name: l.staffName,
              role: l.leaveType,
              shift: `${l.startDate} – ${l.endDate}`,
              dept: `${l.status} (${l.days} days)`
            }))
          }
        };
      } else if (q.includes('vikram') || q.includes('appraisal') || q.includes('chef')) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `### AI Performance Appraisal: Vikram Kadam (Head Chef)
- **Overall Score**: 4.98 / 5.0 (#1 in Resort)
- **Task Velocity**: 112 kitchen turnaround tasks (99% SLA adherence)
- **Guest Feedback Correlation**: 12% rise in Malvani seafood dinner satisfaction. 48 positive TripAdvisor mentions in August.
- **Overtime Reconciled**: 8 hours logged during weekend banquet rush (₹3,000 overtime pay credited).`,
          timestamp: 'Just now',
          cards: {
            type: 'appraisal',
            title: 'Reward Recommendation',
            items: [{ text: 'Authorize ₹3,000 Culinary Excellence Performance Bonus for August payroll.' }],
            actionLabel: 'Add ₹3,000 Bonus to August Payroll'
          }
        };
      } else if (q.includes('cost') || q.includes('occupancy') || q.includes('simulate') || q.includes('labor')) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `### Labor Demand Simulation (95% Weekend Occupancy)
- **Required Extra Shifts**: +3 Housekeeping turns, +2 F&B service staff.
- **Projected Incremental Labor Cost**: ₹14,500.
- **Estimated Net Ancillary Revenue**: ₹1,85,000 (F&B + Spa).
- **Labor Cost Ratio**: 12.8% of room revenue (Well within 15% luxury benchmark).`,
          timestamp: 'Just now'
        };
      } else {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `I evaluated resort staffing records for "${queryText}". All 15 staff profiles are synchronized with biometric punch logs, shift schedules, and August payroll calculations. You can also view granular breakdowns in the Directory or Shift Planner tabs.`,
          timestamp: 'Just now'
        };
      }

      setMessages(prev => [...prev, aiResponse]);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6 font-sans animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg text-slate-900">AI Workforce Intelligence & Natural Query</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ask complex operational questions in plain language to get instant answers about resort staffing, payroll forecasts, and shift coverage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-bold border border-teal-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Gemini 2.5 Pro Active
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                msg.sender === 'ai' ? 'bg-teal-900 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                {msg.sender === 'ai' ? <Sparkles className="w-4 h-4 text-amber-400" /> : <User className="w-4 h-4" />}
              </div>

              <div className="flex flex-col gap-2">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'ai' 
                    ? 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none' 
                    : 'bg-teal-800 text-white rounded-tr-none'
                }`}>
                  <div className="whitespace-pre-line font-medium">{msg.text}</div>

                  {/* Render Rich Cards if any */}
                  {msg.cards && (
                    <div className="mt-3 bg-white p-3.5 rounded-xl border border-slate-200 text-slate-800 shadow-xs">
                      <p className="font-bold text-xs text-teal-950 pb-2 border-b border-slate-100">
                        {msg.cards.title}
                      </p>
                      
                      <div className="flex flex-col gap-1.5 mt-2">
                        {msg.cards.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1">
                            {item.text ? (
                              <span className="text-slate-600">{item.text}</span>
                            ) : (
                              <>
                                <div>
                                  <strong className="text-slate-900">{item.name}</strong>
                                  <span className="text-slate-400 ml-1.5">({item.role})</span>
                                </div>
                                <span className="text-slate-500 font-mono text-[11px]">{item.shift || item.dept}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {msg.cards.actionLabel && (
                        <button
                          onClick={() => triggerToast(`AI Action completed: ${msg.cards?.actionLabel}`)}
                          className="w-full mt-3 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          {msg.cards.actionLabel} →
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <div className="w-6 h-6 rounded-full bg-teal-900 text-white flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              </div>
              <span>ResortDesk AI is analyzing workforce data...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts Pills */}
        <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Try asking:</span>
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 shrink-0 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputQuery)}
            placeholder="Ask anything about staff, shifts, payroll, or coverage..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-slate-800"
          />
          <button
            onClick={() => handleSendMessage(inputQuery)}
            disabled={!inputQuery.trim()}
            className="p-2.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
