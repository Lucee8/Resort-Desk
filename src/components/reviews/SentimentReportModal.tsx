import React from 'react';
import { X, TrendingUp, TrendingDown, BarChart2, CheckCircle2, AlertTriangle, Sparkles, Download } from 'lucide-react';
import { SentimentTopicMetric, ReputationSummary } from '../../types';

interface SentimentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentimentTopics: SentimentTopicMetric[];
  summary: ReputationSummary;
  triggerToast: (msg: string) => void;
}

export default function SentimentReportModal({
  isOpen,
  onClose,
  sentimentTopics,
  summary,
  triggerToast
}: SentimentReportModalProps) {
  if (!isOpen) return null;

  const handleExport = () => {
    triggerToast("Full Sentiment Intelligence Report exported as PDF & CSV!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="sentiment-report-modal"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 flex items-center justify-center text-amber-300">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Guest Sentiment Intelligence Report</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Myra AI v2.4
                </span>
              </div>
              <p className="text-xs text-teal-200/80 mt-0.5">
                Multi-platform NLP topic extraction and operational impact analysis
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Top High-level stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Net Sentiment Score</span>
              <div className="text-2xl font-black text-teal-950 mt-1 flex items-center gap-2">
                <span>+70.0</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +3.2%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">85% Positive vs 15% Negative</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Analyzed Mentions</span>
              <div className="text-2xl font-black text-teal-950 mt-1">2,071</div>
              <p className="text-[11px] text-slate-500 mt-1">Extracted from 1,248 verified reviews</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Top Performing Category</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">Spa & Wellness</div>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">96% Positive (6.0% gain)</p>
            </div>
          </div>

          {/* Detailed Topic Breakdown */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Category Sentiment & Keywords Matrix
            </h4>

            <div className="space-y-3">
              {sentimentTopics.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.topic}</span>
                      <span className="text-xs text-slate-500 font-medium">({item.totalMentions} mentions)</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">{item.positivePercentage}% Positive</span>
                      <span className={`font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
                        item.trendDelta >= 0 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {item.trendDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {item.trendDelta >= 0 ? `+${item.trendDelta}%` : `${item.trendDelta}%`}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full rounded-l-full" 
                      style={{ width: `${item.positivePercentage}%` }}
                    />
                    <div 
                      className="bg-rose-400 h-full rounded-r-full" 
                      style={{ width: `${100 - item.positivePercentage}%` }}
                    />
                  </div>

                  {/* Warning banner if flagged */}
                  {item.flaggedWarning && (
                    <div className="text-[11px] font-semibold text-rose-700 bg-rose-50/80 border border-rose-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.flaggedWarning}</span>
                    </div>
                  )}

                  {/* Top keywords */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Phrases:</span>
                    {item.topKeywords.map((kw, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        "{kw}"
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>

          <button
            onClick={handleExport}
            className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Sentiment Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
