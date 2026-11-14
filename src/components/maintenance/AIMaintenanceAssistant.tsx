import React, { useState, useMemo } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight } from 'lucide-react';
import { MaintenanceTicket, Technician, PredictiveMaintenanceAlert } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AIMaintenanceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: MaintenanceTicket[];
  technicians: Technician[];
  predictiveAlerts: PredictiveMaintenanceAlert[];
  onAssignTicket: (ticketId: string, tech: Technician) => void | Promise<void>;
  onOpenRegisterModal: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actionButton?: {
    label: string;
    action: () => void;
  };
  details?: string[];
}

export default function AIMaintenanceAssistant({
  isOpen,
  onClose,
  tickets,
  technicians,
  predictiveAlerts,
  onAssignTicket,
  onOpenRegisterModal,
}: AIMaintenanceAssistantProps) {
  const { user } = useAuth();
  const operatorName =
    user?.displayName || user?.email?.split('@')[0] || 'Manager';

  const summaryDetails = useMemo(() => {
    const active = tickets.filter((t) => t.status !== 'Closed');
    const blocked = active.filter((t) => t.isRoomBlocked);
    const emergency = active.filter(
      (t) => t.priority === 'Emergency' || t.priority === 'High'
    );
    return [
      `${active.length} open work order(s)`,
      `${blocked.length} cottage(s) currently blocked in PMS`,
      `${emergency.length} high/emergency priority ticket(s)`,
    ];
  }, [tickets]);

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello ${operatorName}! I am analyzing live Mykonos Cottage maintenance tickets, technician availability, and blocked room alerts. Select a query below or type a question.`,
      details: summaryDetails,
    },
  ]);

  const quickPrompts = [
    'Show critical maintenance issues.',
    'Which technician is available?',
    'Assign unassigned issues.',
    'Which cottages are currently blocked?',
    'Predict which equipment may fail soon.',
    'Show maintenance cost total.',
  ];

  const handleQuery = (queryText: string) => {
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    const q = queryText.toLowerCase();
    let aiResponse: Message;

    if (q.includes('critical') || q.includes('emergency') || q.includes('high')) {
      const emergencies = tickets.filter(
        (t) =>
          (t.priority === 'Emergency' || t.priority === 'High') &&
          t.status !== 'Closed'
      );
      aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text:
          emergencies.length > 0
            ? `Found ${emergencies.length} open high/emergency priority ticket(s):`
            : 'No open Emergency or High priority maintenance tickets right now.',
        details: emergencies.map(
          (t) => `${t.priority.toUpperCase()}: ${t.title} (${t.roomNumber}) — ${t.status}`
        ),
      };
    } else if (q.includes('available') || q.includes('technician')) {
      const availableTechs = technicians.filter((t) => t.status === 'Available');
      aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text:
          availableTechs.length > 0
            ? `${availableTechs.length} technician(s) currently marked Available:`
            : 'All technicians are currently busy on active work orders.',
        details: availableTechs.map(
          (t) =>
            `${t.name} (${t.department}) • ${t.activeTicketsCount} active • ${t.efficiency}% efficiency`
        ),
      };
    } else if (q.includes('assign') || q.includes('unassigned')) {
      const unassigned = tickets.find(
        (t) => !t.assignedTechnicianName && t.status !== 'Closed'
      );
      const bestTech =
        technicians.find((t) => t.status === 'Available') || technicians[0];

      if (unassigned && bestTech) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Unassigned ticket "${unassigned.title}" (${unassigned.roomNumber}) can be dispatched to ${bestTech.name} (${bestTech.department}).`,
          actionButton: {
            label: `Dispatch to ${bestTech.name}`,
            action: () => {
              void onAssignTicket(unassigned.id, bestTech);
              setMessages((prev) => [
                ...prev,
                {
                  id: `ai-done-${Date.now()}`,
                  sender: 'ai',
                  text: `Dispatched ${unassigned.id} to ${bestTech.name} and saved to Firestore.`,
                },
              ]);
            },
          },
        };
      } else {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: unassigned
            ? 'There is an unassigned ticket, but no technician profile is loaded.'
            : 'All open maintenance tickets already have an assigned technician.',
        };
      }
    } else if (q.includes('blocked')) {
      const blocked = tickets.filter((t) => t.isRoomBlocked && t.status !== 'Closed');
      aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text:
          blocked.length > 0
            ? `${blocked.length} cottage(s) currently blocked in PMS:`
            : 'Zero cottages are currently blocked due to maintenance.',
        details: blocked.map(
          (t) => `${t.roomNumber} — ${t.title} (${t.priority})`
        ),
      };
    } else if (q.includes('predict') || q.includes('fail') || q.includes('ac')) {
      aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text:
          predictiveAlerts.length > 0
            ? `Monitoring ${predictiveAlerts.length} preventive alert(s):`
            : 'No predictive equipment alerts logged.',
        details: predictiveAlerts.map(
          (p) =>
            `${p.issuePrediction} (${p.roomNumber}) — Risk: ${p.riskScore}% • ${p.recommendedAction}`
        ),
        actionButton: {
          label: 'Register Preventive Work Order',
          action: () => {
            onOpenRegisterModal();
            onClose();
          },
        },
      };
    } else if (q.includes('cost') || q.includes('spending')) {
      const totalCost = tickets.reduce(
        (sum, t) => sum + (t.cost?.total || (t.cost?.parts || 0) + (t.cost?.labor || 0)),
        0
      );
      const partsCost = tickets.reduce((sum, t) => sum + (t.cost?.parts || 0), 0);
      const laborCost = tickets.reduce((sum, t) => sum + (t.cost?.labor || 0), 0);
      aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Total tracked work-order expenditure across ${tickets.length} ticket(s): ₹${totalCost.toLocaleString('en-IN')}.`,
        details: [
          `Parts: ₹${partsCost.toLocaleString('en-IN')}`,
          `Labor: ₹${laborCost.toLocaleString('en-IN')}`,
        ],
      };
    } else {
      const active = tickets.filter((t) => t.status !== 'Closed').length;
      const closed = tickets.filter((t) => t.status === 'Closed' || t.status === 'Resolved').length;
      aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Live summary for "${queryText}": ${active} active tickets, ${closed} resolved/closed, ${technicians.length} technicians on roster.`,
        details: summaryDetails,
      };
    }

    setMessages((prev) => [...prev, aiResponse]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end font-sans">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-teal-900 via-teal-800 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-700/80 border border-teal-500/30 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                ResortDesk Maintenance Copilot
              </h3>
              <p className="text-[11px] text-teal-200/80">
                Live Ticket &amp; Technician Dispatch Assistant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <p>{msg.text}</p>

                {msg.details && msg.details.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                    {msg.details.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-1.5 text-xs text-slate-600"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                )}

                {msg.actionButton && (
                  <button
                    type="button"
                    onClick={msg.actionButton.action}
                    className="mt-3 w-full py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>{msg.actionButton.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 bg-white border-t border-slate-200/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Quick Live Queries
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuery(prompt)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-medium rounded-full border border-slate-200 transition-colors shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputQuery.trim()) handleQuery(inputQuery.trim());
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about blocked cottages, technicians, or costs..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
