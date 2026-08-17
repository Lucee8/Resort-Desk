import React, { useState } from 'react';
import { X, Filter, RotateCcw, Check, Star } from 'lucide-react';
import { ReviewPlatform, ReviewSentiment, ReviewStatus, ReviewTopic } from '../../types';

export interface ReviewFiltersState {
  search: string;
  platform: 'All' | ReviewPlatform;
  sentiment: 'All' | ReviewSentiment;
  status: 'All' | ReviewStatus;
  minRating: number;
  dateRange: 'all' | '7d' | '30d' | '90d' | 'this_year';
  topics: ReviewTopic[];
}

interface ReviewFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ReviewFiltersState;
  onApplyFilters: (filters: ReviewFiltersState) => void;
  onResetFilters: () => void;
}

const ALL_TOPICS: ReviewTopic[] = [
  'Staff & Service',
  'Cleanliness',
  'Food & Dining',
  'Rooms',
  'Wi-Fi',
  'Spa & Wellness',
  'Location & Views',
  'Value & Pricing'
];

export default function ReviewFiltersModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters
}: ReviewFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<ReviewFiltersState>(filters);

  if (!isOpen) return null;

  const toggleTopic = (topic: ReviewTopic) => {
    setLocalFilters(prev => {
      const exists = prev.topics.includes(topic);
      if (exists) {
        return { ...prev, topics: prev.topics.filter(t => t !== topic) };
      } else {
        return { ...prev, topics: [...prev.topics, topic] };
      }
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="review-filters-modal"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Filter Reviews</h3>
              <p className="text-xs text-slate-500">Refine guest feedback by multiple criteria</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Date Range */}
          <div>
            <label className="font-bold text-slate-900 block mb-2">Time Period</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Time' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: '90d', label: 'Last 90 Days' },
                { id: 'this_year', label: 'This Year' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, dateRange: opt.id as any })}
                  className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                    localFilters.dateRange === opt.id 
                      ? 'bg-teal-800 text-white border-teal-800 shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="font-bold text-slate-900 block mb-2">Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {['All', 'Google', 'Booking.com', 'Airbnb', 'Tripadvisor'].map(plat => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, platform: plat as any })}
                  className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                    localFilters.platform === plat 
                      ? 'bg-teal-800 text-white border-teal-800 shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="font-bold text-slate-900 block mb-2">Response Status</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'All', label: 'All Reviews' },
                { id: 'Action Required', label: '⚠️ Action Required' },
                { id: 'Pending', label: '⏳ Pending Reply' },
                { id: 'Replied', label: '✓ Replied' }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, status: st.id as any })}
                  className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                    localFilters.status === st.id 
                      ? 'bg-teal-800 text-white border-teal-800 shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Star Rating */}
          <div>
            <label className="font-bold text-slate-900 block mb-2">Minimum Star Rating</label>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4, 5].map(stars => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, minRating: stars })}
                  className={`flex-1 py-2 px-1 rounded-xl border font-semibold text-center flex items-center justify-center gap-1 transition-all ${
                    localFilters.minRating === stars 
                      ? 'bg-teal-800 text-white border-teal-800 shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {stars === 0 ? 'Any' : (
                    <>
                      <span>{stars}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div>
            <label className="font-bold text-slate-900 block mb-2">Topics & Categories</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TOPICS.map(topic => {
                const isSelected = localFilters.topics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected 
                        ? 'bg-teal-50 text-teal-900 border-teal-800 font-bold' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-teal-800" />}
                    <span>{topic}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/10 cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
