import React, { useState } from 'react';
import { Sparkles, Plus, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AIDeskCardProps {
  housekeepingTaskCount: number;
  maintenanceAlertCount: number;
  onTakeAction: () => void;
  onNewBookingClick: () => void;
}

export default function AIDeskCard({ 
  housekeepingTaskCount, 
  maintenanceAlertCount, 
  onTakeAction, 
  onNewBookingClick 
}: AIDeskCardProps) {
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>(
    housekeepingTaskCount > 0 
      ? `You have ${housekeepingTaskCount} rooms that need housekeeping before 11 AM to accommodate early arrivals.`
      : `All early arrivals are accommodated! The occupancy looks strong. Consider adjusting prices up by 5% for walk-ins.`
  );

  // Allow requesting an updated AI advice block
  const handleRegenerateInsight = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const advices = [
        "Demand is trending up! Our AI Pricing engine suggests raising weekend Deluxe Room rates by 12%.",
        "Housekeeping is running 15 mins ahead of schedule. Room 204 is clean & ready for early check-in.",
        "Maintenance alert: 1 open ticket (Room 104) is high priority for expected VIP check-in today.",
        "Guest Sentiment Report: 4 recent reviews are at 4.8 stars. Recommend triggering a review reply campaign.",
        "Food Inventory Warning: Fresh King Fish stock is low. Local seafood festival starts tomorrow!"
      ];
      const randomAdvice = advices[Math.floor(Math.random() * advices.length)];
      setAiMessage(randomAdvice);
    }, 800);
  };

  return (
    <div 
      id="ai-desk-card" 
      className="bg-teal-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between h-[240px] font-sans relative overflow-hidden group border border-teal-800"
    >
      {/* Background radial highlight */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-teal-800/40 rounded-full blur-2xl group-hover:bg-teal-800/60 transition-colors" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-800 rounded-lg text-teal-300">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase">ResortDesk AI</span>
          </div>
          {/* Quick refresh indicator */}
          <button 
            id="ai-regenerate-btn"
            onClick={handleRegenerateInsight}
            disabled={loading}
            className="text-[10px] text-teal-300 hover:text-white bg-teal-950/40 px-2 py-0.5 rounded-full border border-teal-800/60 font-semibold"
          >
            {loading ? 'Thinking...' : 'AI Insights'}
          </button>
        </div>

        {/* Dynamic Quote */}
        <p className="mt-4 text-xs font-medium leading-relaxed text-teal-100 italic">
          "{aiMessage}"
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 mt-4 z-10">
        <button
          id="ai-take-action-btn"
          onClick={onTakeAction}
          className="flex-1 py-2 px-3 bg-teal-800 hover:bg-teal-700 active:bg-teal-950 text-white rounded-xl text-xs font-semibold border border-teal-700/60 hover:border-teal-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span>Take Action</span>
          <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
        </button>

        <button
          id="ai-new-booking-btn"
          onClick={onNewBookingClick}
          className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 active:bg-slate-200 text-teal-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Booking</span>
        </button>
      </div>
    </div>
  );
}
