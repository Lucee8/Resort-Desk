import React, { useState } from 'react';
import { X, Sparkles, MessageSquare, Check, Zap, CreditCard, Shield, ArrowUpRight } from 'lucide-react';
import { BillingSubscriptionUsage } from '../../types';

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: BillingSubscriptionUsage;
  onUpdateSubscription?: (sub: BillingSubscriptionUsage) => void;
  triggerToast: (msg: string) => void;
}

export default function ManageSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  triggerToast
}: ManageSubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'Pro' | 'Enterprise' | 'Custom'>('Enterprise');
  const [autoRenew, setAutoRenew] = useState(subscription.autoRenew);

  const handleTopupMinutes = () => {
    triggerToast('✓ Added +2,000 Myra AI Concierge Minutes (₹1,999 + GST)');
    if (onUpdateSubscription) {
      onUpdateSubscription({
        ...subscription,
        aiMinutesLimit: subscription.aiMinutesLimit + 2000
      });
    }
  };

  const handleTopupWhatsApp = () => {
    triggerToast('✓ Added +25,000 WhatsApp Business Messages (₹2,499 + GST)');
    if (onUpdateSubscription) {
      onUpdateSubscription({
        ...subscription,
        whatsappMessagesLimit: subscription.whatsappMessagesLimit + 25000
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Subscription &amp; AI Usage</h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-semibold">
                  Enterprise AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Renews annually on {subscription.nextBillingDate}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-700">
          {/* Current Quota Consumption */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* AI Minutes */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Myra AI Voice &amp; Chat
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    84% Used
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 font-sans">
                  {subscription.aiMinutesUsed.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ {subscription.aiMinutesLimit.toLocaleString()} mins</span>
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full w-[84%]" />
                </div>
              </div>
              <button
                type="button"
                onClick={handleTopupMinutes}
                className="mt-4 w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 font-semibold text-xs text-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                + Top Up 2,000 Mins (₹1,999)
              </button>
            </div>

            {/* WhatsApp */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Direct API
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    24.8% Used
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 font-sans">
                  {(subscription.whatsappMessagesUsed / 1000).toFixed(1)}k <span className="text-xs text-slate-400 font-normal">/ {(subscription.whatsappMessagesLimit / 1000)}k msgs</span>
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full w-[24.8%]" />
                </div>
              </div>
              <button
                type="button"
                onClick={handleTopupWhatsApp}
                className="mt-4 w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 font-semibold text-xs text-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                + Top Up 25k Msgs (₹2,499)
              </button>
            </div>
          </div>

          {/* Plan Comparison / Features included */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-[#0c4033] rounded-2xl text-white">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="font-bold text-sm text-emerald-200">Enterprise AI Plan Tier</h4>
                <p className="text-slate-300 text-xs">₹1,49,999 / year (Billed Annually)</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-semibold">
                Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-200 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">✓ Unlimited room properties &amp; villas</div>
              <div className="flex items-center gap-1.5">✓ Full REST &amp; Webhook API Access</div>
              <div className="flex items-center gap-1.5">✓ WhatsApp Concierge &amp; Workflow Automations</div>
              <div className="flex items-center gap-1.5">✓ Statutory GST Tax Invoice &amp; GSTR-1 Generator</div>
            </div>
          </div>

          {/* Payment Card & Auto renew */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-bold text-slate-800">Payment Method: HDFC Corporate Card •••• 9821</p>
                <p className="text-slate-400 text-[11px]">Next automatic billing on {subscription.nextBillingDate}</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="w-4 h-4 text-teal-800 rounded border-slate-300 focus:ring-teal-700"
              />
              <span className="text-xs font-semibold text-slate-700">Auto-Renew</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              triggerToast('Subscription preferences updated.');
              onClose();
            }}
            className="px-5 py-2.5 bg-[#0c4033] hover:bg-[#082e25] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Subscription Settings
          </button>
        </div>
      </div>
    </div>
  );
}
