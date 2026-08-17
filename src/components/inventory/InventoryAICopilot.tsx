import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  DollarSign, 
  AlertTriangle, 
  Flame, 
  TrendingUp,
  FileText
} from 'lucide-react';
import { InventoryItem, PurchaseOrder } from '../../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  action?: {
    type: 'reorder' | 'view_alerts' | 'view_analytics';
    label: string;
    payload?: any;
  };
}

interface InventoryAICopilotProps {
  items: InventoryItem[];
  onClose: () => void;
  onQuickRestock: (item: InventoryItem) => void;
  onOpenAlerts: () => void;
  onOpenAnalytics: () => void;
}

export default function InventoryAICopilot({
  items,
  onClose,
  onQuickRestock,
  onOpenAlerts,
  onOpenAnalytics
}: InventoryAICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: "Hello! I'm your ResortDesk AI Inventory Intelligence Assistant. I monitor real-time stock levels, predict consumption surges based on resort bookings, and recommend optimal vendor purchases. How can I help you today?",
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const promptChips = [
    'Which items are low in stock?',
    'What should I purchase this week?',
    'How much did we spend on cleaning supplies?',
    'Which items are burning unusually fast?',
    'Predict linen demand for next month'
  ];

  const handleSendMessage = (query: string) => {
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Generate intelligent AI response based on real inventory state
    setTimeout(() => {
      let aiReply: Message;
      const lower = query.toLowerCase();

      if (lower.includes('low') || lower.includes('shortage') || lower.includes('safety')) {
        const critical = items.filter(i => i.safetyLevel === 'Critical' || i.safetyLevel === 'Low');
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Found ${critical.length} items requiring restocking attention:\n\n• ${critical.map(i => `${i.name}: ${i.currentStock} ${i.unit} left (Safety min: ${i.minStock})`).join('\n• ')}\n\nWould you like me to draft purchase orders for these items?`,
          timestamp: 'Just now',
          action: {
            type: 'view_alerts',
            label: 'View Low Stock Alerts Panel'
          }
        };
      } else if (lower.includes('purchase') || lower.includes('buy') || lower.includes('restock') || lower.includes('this week')) {
        const urgent = items.find(i => i.safetyLevel === 'Critical') || items[0];
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Based on upcoming weekend resort bookings (96% occupancy) and lead times, I recommend placing an immediate order for **${urgent.name}** (${urgent.reorderQuantity} ${urgent.unit}) from **${urgent.supplier}** (Est. Cost: ₹ ${(urgent.reorderQuantity * urgent.costPerUnit).toLocaleString()}).`,
          timestamp: 'Just now',
          action: {
            type: 'reorder',
            label: `Draft PO for ${urgent.name}`,
            payload: urgent
          }
        };
      } else if (lower.includes('cleaning') || lower.includes('spend') || lower.includes('cost') || lower.includes('valuation')) {
        const totalVal = items.reduce((s, i) => s + i.totalValue, 0);
        const cleaningItems = items.filter(i => i.category === 'Cleaning');
        const cleanVal = cleaningItems.reduce((s, i) => s + i.totalValue, 0);
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Here is the current valuation analysis:\n• Total held inventory across all 8 categories: **₹ ${totalVal.toLocaleString()}**\n• Cleaning & Sanitization held stock: **₹ ${cleanVal.toLocaleString()}**\n• Average monthly procurement budget: **₹ 2,34,000** (healthy within resort limits).`,
          timestamp: 'Just now',
          action: {
            type: 'view_analytics',
            label: 'Open Full Analytics Dashboard'
          }
        };
      } else if (lower.includes('burn') || lower.includes('fast') || lower.includes('velocity')) {
        const fast = [...items].sort((a, b) => b.consumptionRateWeekly - a.consumptionRateWeekly)[0];
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `The fastest-moving item in your resort inventory is **${fast.name}**, with a weekly burn rate of **~${fast.consumptionRateWeekly} ${fast.unit}/week**. Expected depletion in ${Math.round(fast.currentStock / (fast.consumptionRateWeekly / 7))} days at current occupancy.`,
          timestamp: 'Just now',
          action: {
            type: 'reorder',
            label: `Reorder ${fast.name}`,
            payload: fast
          }
        };
      } else {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Based on current resort operational telemetry, your overall stock health is 91% optimal. 3 items are approaching threshold buffers before the Diwali weekend. You can create purchase orders directly or adjust safety margins.`,
          timestamp: 'Just now',
          action: {
            type: 'view_alerts',
            label: 'Review Pending Restocks'
          }
        };
      }

      setMessages(prev => [...prev, aiReply]);
    }, 600);
  };

  const handleActionClick = (action: Message['action']) => {
    if (!action) return;
    if (action.type === 'reorder' && action.payload) {
      onQuickRestock(action.payload);
      onClose();
    } else if (action.type === 'view_alerts') {
      onOpenAlerts();
      onClose();
    } else if (action.type === 'view_analytics') {
      onOpenAnalytics();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-[#0c4a45] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-800/80 text-amber-300 flex items-center justify-center border border-teal-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif">
                Inventory AI Copilot
              </h3>
              <p className="text-[11px] text-teal-200 font-medium">
                Predictive telemetry & restocking assistant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1.5 rounded-full hover:bg-teal-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-teal-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                  m.sender === 'user'
                    ? 'bg-[#0c4a45] text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                <span className={`text-[10px] block mt-1.5 ${m.sender === 'user' ? 'text-teal-200' : 'text-slate-400'}`}>
                  {m.timestamp}
                </span>

                {m.action && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      onClick={() => handleActionClick(m.action)}
                      className="w-full py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>{m.action.label}</span>
                    </button>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Prompt Chips Bar */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about inventory, POs, burn rates..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-[#0c4a45] hover:bg-[#083834] text-white rounded-xl disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
