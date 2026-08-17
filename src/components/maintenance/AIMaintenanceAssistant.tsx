import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Wrench,
  Zap,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { MaintenanceTicket, Technician, PredictiveMaintenanceAlert } from '../../types';

interface AIMaintenanceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: MaintenanceTicket[];
  technicians: Technician[];
  predictiveAlerts: PredictiveMaintenanceAlert[];
  onAssignTicket: (ticketId: string, tech: Technician) => void;
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
  onOpenRegisterModal
}: AIMaintenanceAssistantProps) {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Hello Arun! I am your ResortDesk AI 2.0 Maintenance Copilot. I'm actively monitoring resort IoT telemetry, staff workloads, and repeat work order patterns. How can I assist you right now?",
      details: [
        "18 total active work orders",
        "4 villas blocked in PMS",
        "HVAC warning flag on Villa #104"
      ]
    }
  ]);

  const quickPrompts = [
    "Which rooms have repeated AC problems?",
    "Show critical maintenance issues.",
    "Which technician is available?",
    "Assign unassigned issues to Vikram.",
    "Which rooms are currently blocked?",
    "Predict which equipment may fail soon.",
    "Show maintenance cost this month."
  ];

  const handleQuery = (queryText: string) => {
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    const q = queryText.toLowerCase();

    setTimeout(() => {
      let aiResponse: Message;

      if (q.includes('repeated ac') || q.includes('ac problem') || q.includes('hvac')) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "Villa #104 has reported 3 AC-related issues in the last 30 days. The most recent issue was reported today at 10:45 AM (water dripping on luggage rack). Telemetry indicates elevated compressor head temperature.",
          details: [
            "Oct 24: AC Leaking - Water dripping (Deluxe Villa #104)",
            "Oct 12: Thermostat sensor fluctuation (Deluxe Villa #104)",
            "Sep 28: Condenser drain line flush (Deluxe Villa #104)"
          ],
          actionButton: {
            label: "Schedule Preventive HVAC Inspection",
            action: () => {
              onOpenRegisterModal();
              onClose();
            }
          }
        };
      } else if (q.includes('critical') || q.includes('emergency')) {
        const emergencies = tickets.filter(t => t.priority === 'Emergency' || t.priority === 'High');
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `There are currently ${emergencies.length} critical priority maintenance issues requiring direct supervision.`,
          details: emergencies.map(t => `${t.priority.toUpperCase()}: ${t.title} (${t.roomNumber}) - Status: ${t.status}`)
        };
      } else if (q.includes('available') || q.includes('technician')) {
        const availableTechs = technicians.filter(t => t.status === 'Available');
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `We currently have ${availableTechs.length} technicians with available capacity on site:`,
          details: availableTechs.map(t => `${t.name} (${t.department}) • ${t.activeTicketsCount} active tickets • ${t.efficiency}% efficiency • Exp: ${t.experience}`)
        };
      } else if (q.includes('assign') && (q.includes('vikram') || q.includes('electrical'))) {
        const unassigned = tickets.find(t => !t.assignedTechnicianName);
        const vikram = technicians.find(t => t.name.includes('Vikram'));
        
        if (unassigned && vikram) {
          aiResponse = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: `Found unassigned work order "${unassigned.title}" in ${unassigned.roomNumber}. Vikram Singh is currently available (0 active tickets). Would you like me to dispatch this assignment?`,
            actionButton: {
              label: `Confirm Dispatch to Vikram Singh`,
              action: () => {
                onAssignTicket(unassigned.id, vikram);
                alert(`Work order ${unassigned.id} successfully assigned to Vikram Singh.`);
              }
            }
          };
        } else {
          aiResponse = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: "All current electrical tickets are currently assigned. Vikram Singh is on standby for new emergency dispatches."
          };
        }
      } else if (q.includes('blocked')) {
        const blocked = tickets.filter(t => t.isRoomBlocked);
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `There are 4 rooms currently blocked in PMS due to active maintenance:`,
          details: [
            "Deluxe Villa #104 — AC Leaking (Emergency)",
            "Sunset Suite #202 — Broken Balcony Tile (Medium)",
            "Beachfront #005 — RFID Door Lock Malfunction (High)",
            "Royal Villa #108 — Jacuzzi Jet Pressure (High)"
          ]
        };
      } else if (q.includes('predict') || q.includes('fail')) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "Predictive IoT models have identified 3 high-risk failure patterns across resort equipment:",
          details: predictiveAlerts.map(p => `${p.issuePrediction} in ${p.roomNumber} (Risk: ${p.riskScore}%) — ${p.recommendedAction}`)
        };
      } else if (q.includes('cost') || q.includes('spending')) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "Maintenance expenditure for October to date totals ₹1,42,800 ($1,720 USD). This is 8% below projected quarterly budget.",
          details: [
            "HVAC & Cooling: ₹62,400 (43.7%)",
            "Plumbing & Fixtures: ₹38,200 (26.7%)",
            "Electrical & Smart Locks: ₹28,500 (20.0%)",
            "Civil & Structural: ₹13,700 (9.6%)"
          ]
        };
      } else {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `I analyzed your request "${queryText}". Property maintenance telemetry is operational. 85% weekly resolution efficiency maintained across 42 resolved tickets.`,
          details: [
            "Active Work Orders: 18 ongoing",
            "Avg Resolution: 38 minutes",
            "Fastest Resolution: 12 minutes (Room 104 router reset)"
          ]
        };
      }

      setMessages(prev => [...prev, aiResponse]);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end font-sans animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-900 via-teal-800 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-700/80 border border-teal-500/30 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  ResortDesk Maintenance AI
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-teal-200/80">
                Predictive Analytics & Automated Work Order Dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-teal-800 text-white shadow-xs' 
                  : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
              }`}>
                <p>{msg.text}</p>

                {/* Details list */}
                {msg.details && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                    {msg.details.map((d, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5"></span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action button */}
                {msg.actionButton && (
                  <button
                    onClick={msg.actionButton.action}
                    className="mt-3 w-full py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
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

        {/* Quick Prompts */}
        <div className="p-3 bg-white border-t border-slate-200/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Suggested AI Queries
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleQuery(prompt)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-medium rounded-full border border-slate-200 transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input */}
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
              placeholder="Ask AI Copilot about resort maintenance..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
