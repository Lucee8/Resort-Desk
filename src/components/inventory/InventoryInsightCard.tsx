import React from 'react';
import { Lightbulb, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { InventoryAIInsight } from '../../types';

interface InventoryInsightCardProps {
  insight?: InventoryAIInsight;
  onApplyRecommendation: (insight: InventoryAIInsight) => void;
  onViewAllInsights: () => void;
}

export default function InventoryInsightCard({
  insight = {
    id: 'ai-1',
    title: 'Surge in Weekend Linen Consumption',
    insight: 'Historical data suggests a 15% increase in linen consumption over upcoming Diwali weekend based on 96% confirmed resort bookings.',
    recommendation: 'Increase luxury towel reorder safety buffer from 100 to 150 pieces to prevent inventory starvation.',
    category: 'Linens',
    impactBadge: 'Demand Peak Warning',
    actionType: 'reorder',
    targetItemId: 'inv-1',
    suggestedQty: 150,
    confidenceScore: 94
  },
  onApplyRecommendation,
  onViewAllInsights
}: InventoryInsightCardProps) {
  return (
    <div 
      id="inventory-insight-widget"
      className="bg-[#0b3b37] text-white rounded-3xl p-5 border border-teal-800/80 shadow-md relative overflow-hidden flex flex-col justify-between"
    >
      {/* Subtle Background Radial Aura */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-teal-600/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />

      <div>
        {/* Header matching reference */}
        <div className="flex items-center justify-between pb-3 border-b border-teal-800/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-800/80 flex items-center justify-center text-amber-300">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
              Inventory Insight
            </span>
          </div>

          <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
            {insight.confidenceScore}% Confidence
          </span>
        </div>

        {/* Insight Quote Text matching reference */}
        <div className="mt-3.5 space-y-2">
          <p className="text-xs text-teal-100/90 italic leading-relaxed">
            &ldquo;{insight.insight}&rdquo;
          </p>
          <div className="bg-teal-900/60 rounded-xl p-2.5 border border-teal-700/50">
            <span className="text-[10px] uppercase font-bold text-teal-300 block">
              Recommendation
            </span>
            <p className="text-xs text-white font-medium mt-0.5">
              {insight.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-teal-800/60 flex items-center justify-between gap-2">
        <button
          onClick={onViewAllInsights}
          className="text-[11px] text-teal-300 hover:text-white transition-colors cursor-pointer"
        >
          More Insights
        </button>

        <button
          id="apply-inventory-insight-btn"
          onClick={() => onApplyRecommendation(insight)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          <span>Apply Recommendation</span>
        </button>
      </div>
    </div>
  );
}
