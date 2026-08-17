import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Check, 
  X, 
  HelpCircle, 
  ArrowRight, 
  Lightbulb, 
  Zap, 
  MessageSquare, 
  ChevronRight,
  RefreshCw,
  Clock,
  TrendingUp
} from 'lucide-react';
import { MyraAIWorkflowInsight, WhatsAppTemplate, WhatsAppWorkflowNode } from '../../types';

interface MyraAIAssistantPanelProps {
  insights: MyraAIWorkflowInsight[];
  suggestedTemplates: WhatsAppTemplate[];
  onApplyInsight: (insight: MyraAIWorkflowInsight) => void;
  onDismissInsight: (insightId: string) => void;
  onInsertTemplate: (template: WhatsAppTemplate) => void;
  onAnalyzeWorkflow: () => void;
}

export default function MyraAIAssistantPanel({
  insights,
  suggestedTemplates,
  onApplyInsight,
  onDismissInsight,
  onInsertTemplate,
  onAnalyzeWorkflow
}: MyraAIAssistantPanelProps) {
  const [activeInsightIndex, setActiveInsightIndex] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const currentInsight = insights[activeInsightIndex] || insights[0];

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onAnalyzeWorkflow();
    }, 800);
  };

  return (
    <div id="myra-ai-panel-container" className="w-full lg:w-[360px] flex flex-col gap-4 shrink-0">
      {/* Main Myra AI Card */}
      <div className="bg-[#f8fafd] border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Sparkle Icon Circle (Deep Purple/Indigo) */}
            <div className="w-9 h-9 rounded-xl bg-[#2e1d7a] flex items-center justify-center text-white shadow-sm shadow-purple-900/20">
              <Sparkles className="w-5 h-5 fill-white/20 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Myra AI Assistant
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Automation Optimization
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            title="Re-analyze active workflow"
            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>

        {/* AI Insight Box (Exact visual reference style) */}
        {currentInsight ? (
          <div className="bg-[#edf2fe]/90 border border-[#d6e2fe] rounded-2xl p-4 flex flex-col gap-3 shadow-2xs">
            <p className="text-xs text-slate-700 font-normal leading-relaxed">
              {currentInsight.recommendation}
            </p>

            {/* Impact metric badge if available */}
            {currentInsight.impact && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2e1d7a] bg-white/80 px-2.5 py-1 rounded-lg border border-indigo-100">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>Impact: {currentInsight.impact}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 mt-1">
              <button
                onClick={() => onDismissInsight(currentInsight.id)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
              >
                Dismiss
              </button>
              <button
                onClick={() => onApplyInsight(currentInsight)}
                className="px-4 py-1.5 rounded-xl bg-[#2e1d7a] hover:bg-[#201563] text-white text-xs font-semibold transition-all shadow-sm shadow-indigo-950/20 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                <span>{currentInsight.actionLabel || 'Yes, add condition'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-emerald-900">Workflow Fully Optimized</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              No conversion bottlenecks detected in this active sequence.
            </p>
          </div>
        )}

        {/* Suggested Templates Section (Exact reference styling) */}
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 font-sans tracking-wide">
              Suggested Templates
            </h3>
            <span className="text-[11px] text-slate-400">
              {suggestedTemplates.length} available
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {suggestedTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => onInsertTemplate(template)}
                className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-teal-900 transition-colors">
                    {template.name.replace(/resort_|v\d+|_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                    "{template.body.slice(0, 48)}..."
                  </p>
                </div>

                {/* + Icon Button */}
                <div className="w-6 h-6 rounded-full border border-slate-300 group-hover:border-teal-700 group-hover:bg-teal-700 group-hover:text-white text-slate-500 flex items-center justify-center shrink-0 transition-all">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Automation Health Checklist */}
        <div className="border-t border-slate-200/80 pt-3">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="font-semibold text-slate-700">Meta API Status</span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected (High Tier)
            </span>
          </div>
          <div className="bg-slate-100/80 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-center justify-between">
            <span>24h Guest Window Response</span>
            <span className="font-bold text-slate-800">~2.4 mins avg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
