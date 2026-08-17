import React from 'react';
import { Sparkles, Shield, ChevronRight } from 'lucide-react';
import { BillingSubscriptionUsage } from '../../types';
import { initialSubscriptionData } from '../../data/billingData';

interface SubscriptionCardProps {
  subscription?: BillingSubscriptionUsage;
  onManageSubscription: () => void;
}

export default function SubscriptionCard({
  subscription = initialSubscriptionData,
  onManageSubscription
}: SubscriptionCardProps) {
  const aiMinutesPct = Math.min(100, (subscription.aiMinutesUsed / subscription.aiMinutesLimit) * 100);
  const whatsappPct = Math.min(100, (subscription.whatsappMessagesUsed / subscription.whatsappMessagesLimit) * 100);

  return (
    <div id="subscription-card" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-indigo-700">
            <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[10px]">
              ★
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-700">
              Current Plan
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/60">
            {subscription.billingCycle}
          </span>
        </div>

        {/* Plan Title & Subtitle */}
        <div className="mt-3.5">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {subscription.planName}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            {subscription.description}
          </p>
        </div>

        {/* Usage Progress Bars */}
        <div className="mt-5 flex flex-col gap-4">
          {/* AI Minutes Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700 text-xs">
                Myra AI Minutes
              </span>
              <span className="text-slate-500 font-semibold text-xs">
                {subscription.aiMinutesUsed.toLocaleString()} / {subscription.aiMinutesLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#2563eb] h-2 rounded-full transition-all duration-500" 
                style={{ width: `${aiMinutesPct}%` }}
              />
            </div>
          </div>

          {/* WhatsApp Messages Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700 text-xs">
                WhatsApp Messages
              </span>
              <span className="text-slate-500 font-semibold text-xs">
                {(subscription.whatsappMessagesUsed / 1000).toFixed(1)}k / {(subscription.whatsappMessagesLimit / 1000)}k
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#10b981] h-2 rounded-full transition-all duration-500" 
                style={{ width: `${whatsappPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-2">
        <button
          id="btn-manage-subscription"
          type="button"
          onClick={onManageSubscription}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-semibold text-xs rounded-xl text-center transition-all duration-150 shadow-xs cursor-pointer active:scale-99 flex items-center justify-center gap-1.5"
        >
          <span>Manage Subscription</span>
        </button>
      </div>
    </div>
  );
}
