import React, { useState } from 'react';
import { Sparkles, Send, X, ChevronRight } from 'lucide-react';
import { BillingInvoice, RevenueMonthlyMetric, UnbilledStayItem } from '../../types';

interface MyraFinanceAssistantProps {
  invoices: BillingInvoice[];
  revenueData: RevenueMonthlyMetric[];
  unbilledStays: UnbilledStayItem[];
  onCreateInvoiceClick: () => void;
  onOpenSettlements: () => void;
  onFilterPending?: () => void;
  triggerToast: (msg: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionType: 'create_invoice' | 'view_settlement' | 'view_pending';
  };
}

export default function MyraFinanceAssistant({
  invoices,
  unbilledStays,
  onCreateInvoiceClick,
  onOpenSettlements,
  onFilterPending,
}: MyraFinanceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const netCollected = invoices
    .filter((i) => i.status !== 'Refunded')
    .reduce((sum, i) => sum + i.paidAmount, 0);
  const totalPending = invoices
    .filter((i) => i.status !== 'Refunded')
    .reduce((sum, i) => sum + i.dueAmount, 0);
  const totalGst = invoices
    .filter((i) => i.status !== 'Refunded')
    .reduce((sum, i) => sum + i.gstAmount, 0);

  const formatINR = (val: number) =>
    `₹${new Intl.NumberFormat('en-IN').format(Math.round(val))}`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Namaste! I'm Myra, your Mykonos Cottage Financial Assistant. Live collected revenue is ${formatINR(
        netCollected
      )} with ${unbilledStays.length} unbilled active stay${
        unbilledStays.length === 1 ? '' : 's'
      }. How can I assist with your accounts today?`,
      timestamp: 'Now',
    },
  ]);

  const quickPrompts = [
    'Summarize collected vs pending revenue',
    'Show pending invoices & follow-ups',
    'Calculate GST liability on ledger',
    'Review unbilled active rooms',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');

    setTimeout(() => {
      let reply = `Collected ledger total is ${formatINR(netCollected)} across ${invoices.length} invoices.`;
      let suggestedAction: ChatMessage['suggestedAction'];

      const lower = text.toLowerCase();
      if (lower.includes('pending') || lower.includes('unpaid') || lower.includes('follow-up')) {
        const pendingInvs = invoices.filter(
          (i) => i.status === 'Pending' || i.status === 'Partial'
        );
        const topInv = pendingInvs.sort((a, b) => b.dueAmount - a.dueAmount)[0];
        reply =
          pendingInvs.length > 0
            ? `You have ${pendingInvs.length} pending/partial invoices totaling ${formatINR(
                totalPending
              )}. Largest balance is ${topInv.guestName} (${formatINR(topInv.dueAmount)}) for ${topInv.roomNumber}.`
            : 'All issued GST invoices are currently settled with ₹0 pending balance.';
        if (pendingInvs.length > 0) {
          suggestedAction = { label: 'Filter Pending Invoices', actionType: 'view_pending' };
        }
      } else if (lower.includes('gst') || lower.includes('tax')) {
        const halfGst = Math.round(totalGst / 2);
        reply = `Current Output GST across active invoices is ${formatINR(
          totalGst
        )} (CGST: ${formatINR(halfGst)}, SGST: ${formatINR(totalGst - halfGst)} under SAC 9963).`;
      } else if (lower.includes('unbilled') || lower.includes('rooms')) {
        const unbilledVal = unbilledStays.reduce((s, u) => s + u.totalPending, 0);
        reply = `There are ${unbilledStays.length} unbilled active stay${
          unbilledStays.length === 1 ? '' : 's'
        } totaling ${formatINR(unbilledVal)}.`;
        suggestedAction = { label: 'Create Invoice', actionType: 'create_invoice' };
      } else if (lower.includes('settlement') || lower.includes('bank')) {
        reply = 'Review your configured nodal payout schedule and UTR reconciliation batches.';
        suggestedAction = { label: 'View Settlement Schedule', actionType: 'view_settlement' };
      }

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction,
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 250);
  };

  const handleActionClick = (action: ChatMessage['suggestedAction']) => {
    if (!action) return;
    if (action.actionType === 'create_invoice') {
      onCreateInvoiceClick();
      setIsOpen(false);
    } else if (action.actionType === 'view_settlement') {
      onOpenSettlements();
      setIsOpen(false);
    } else if (action.actionType === 'view_pending') {
      onFilterPending?.();
      setIsOpen(false);
    }
  };

  return (
    <>
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
          <span className="hidden sm:inline font-bold text-xs tracking-tight">Myra Finance AI</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[94vw] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-5 duration-200">
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
                <p className="text-[10px] text-emerald-200/80">
                  Live GST &amp; Ledger Intelligence
                </p>
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

          <div className="bg-slate-50 border-b border-slate-100 p-2.5 overflow-x-auto flex gap-1.5 shrink-0">
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
                      className="mt-2.5 w-full py-1.5 px-3 bg-white hover:bg-slate-50 text-[#0c4033] border border-teal-200 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
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
                placeholder="Ask Myra about live revenue, GST, invoices..."
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
