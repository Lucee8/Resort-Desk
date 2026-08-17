import React, { useState } from 'react';
import { Sparkles, MessageSquare, Send, X, Bot, TrendingUp, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { BillingInvoice, RevenueMonthlyMetric, UnbilledStayItem } from '../../types';

interface MyraFinanceAssistantProps {
  invoices: BillingInvoice[];
  revenueData: RevenueMonthlyMetric[];
  unbilledStays: UnbilledStayItem[];
  onCreateInvoiceClick: () => void;
  onOpenSettlements: () => void;
  triggerToast: (msg: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionType: 'create_invoice' | 'view_settlement' | 'send_reminders';
  };
}

export default function MyraFinanceAssistant({
  invoices,
  revenueData,
  unbilledStays,
  onCreateInvoiceClick,
  onOpenSettlements,
  triggerToast
}: MyraFinanceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Namaste Anand! I'm Myra, your ResortDesk Financial AI. Net revenue is tracking at ₹24.50 Lakhs (+12.4% MoM) with 14 active unbilled rooms. How can I assist with your accounts today?",
      timestamp: 'Just now'
    }
  ]);

  const quickPrompts = [
    "What is our projected October revenue?",
    "Summarize pending invoices & follow-ups",
    "Calculate GST liability on F&B vs Rooms",
    "Send WhatsApp payment links for overdue bills"
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');

    // Generate intelligent AI response based on query keywords
    setTimeout(() => {
      let reply = "I've analyzed your financial data.";
      let suggestedAction: ChatMessage['suggestedAction'] = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('october') || lower.includes('projected') || lower.includes('revenue')) {
        reply = "Based on 94% weekend villa occupancy and banquet bookings, projected October revenue is ₹28.2 Lakhs (+15.1% YoY). Average room realization rate is ₹16,400/night.";
      } else if (lower.includes('pending') || lower.includes('unpaid') || lower.includes('overdue') || lower.includes('follow-up')) {
        const pendingCount = invoices.filter(i => i.status === 'Pending' || i.status === 'Partial').length;
        reply = `You have ${pendingCount} pending/partial invoices totaling ₹2,70,000. Largest pending folio is Vikram Malhotra (₹1,12,500) for Villa 108. Would you like me to dispatch automated WhatsApp payment links?`;
        suggestedAction = {
          label: 'Send WhatsApp Payment Links',
          actionType: 'send_reminders'
        };
      } else if (lower.includes('gst') || lower.includes('tax') || lower.includes('gstr')) {
        reply = "For current period, Total Output GST Liable is ₹4,41,000 (CGST: ₹2,20,500, SGST: ₹2,20,500). All room rates > ₹7,500 are accurately mapped under SAC 9963 @ 18%.";
      } else if (lower.includes('unbilled') || lower.includes('stays') || lower.includes('rooms')) {
        reply = `There are 14 in-house rooms with ₹1,94,200 in unbilled folios. 6 rooms are scheduled to check out today.`;
        suggestedAction = {
          label: 'Create Checkout Invoice',
          actionType: 'create_invoice'
        };
      } else if (lower.includes('bank') || lower.includes('settlement') || lower.includes('payout')) {
        reply = "Next automated Razorpay/PayU settlement of ₹18,40,000 is scheduled for deposit on Oct 28 into your HDFC Nodal Account.";
        suggestedAction = {
          label: 'View Settlement Schedule',
          actionType: 'view_settlement'
        };
      } else {
        reply = `I have logged your request regarding "${text}". Real-time ledger metrics and GST analytics have been updated across your ResortDesk dashboard.`;
      }

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction
      };

      setMessages(prev => [...prev, aiReply]);
    }, 600);
  };

  const handleActionClick = (action: ChatMessage['suggestedAction']) => {
    if (!action) return;
    if (action.actionType === 'create_invoice') {
      onCreateInvoiceClick();
      setIsOpen(false);
    } else if (action.actionType === 'view_settlement') {
      onOpenSettlements();
      setIsOpen(false);
    } else if (action.actionType === 'send_reminders') {
      triggerToast('✓ Dispatched WhatsApp payment links to 2 pending guests.');
    }
  };

  return (
    <>
      {/* Floating Myra AI Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="btn-myra-finance-ai"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-[#0c4033] to-[#14532d] hover:from-[#082e25] hover:to-[#0f3e22] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2.5 group cursor-pointer border border-emerald-400/30 active:scale-95"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white" />
          </div>
          <span className="hidden sm:inline font-bold text-xs tracking-tight">
            Myra Finance AI
          </span>
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[94vw] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#0c4033] text-white p-4 px-5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-bold text-xs flex items-center gap-1.5">
                  Myra Financial Copilot
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                </h4>
                <p className="text-[10px] text-emerald-200/80">Real-Time GST &amp; Revenue Intelligence</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-slate-50 border-b border-slate-100 p-2.5 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p)}
                className="whitespace-nowrap bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#0c4033] text-white rounded-br-xs font-medium'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
                  }`}
                >
                  <p className="text-xs">{msg.text}</p>

                  {msg.suggestedAction && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(msg.suggestedAction)}
                      className="mt-2.5 w-full py-1.5 px-3 bg-white hover:bg-slate-50 text-[#0c4033] border border-teal-200 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-98"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-100 bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Myra about revenue, GST, invoices..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-700 transition-all"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="p-2 bg-[#0c4033] hover:bg-[#082e25] disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
