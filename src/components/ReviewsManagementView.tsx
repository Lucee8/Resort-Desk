import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Star, 
  TrendingUp, 
  RefreshCw, 
  SlidersHorizontal, 
  MessageSquare, 
  Zap, 
  Trophy, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Globe, 
  Wrench, 
  Award, 
  Gift, 
  Check, 
  ArrowUpRight,
  Plus
} from 'lucide-react';

import ReviewCard from './reviews/ReviewCard';
import GoogleIntegrationModal from './reviews/GoogleIntegrationModal';
import ReviewFiltersModal, { ReviewFiltersState } from './reviews/ReviewFiltersModal';
import SentimentReportModal from './reviews/SentimentReportModal';
import ReviewActionModal from './reviews/ReviewActionModal';

import { 
  initialReviewsList, 
  initialReputationSummary, 
  initialSentimentTopics, 
  initialGoogleIntegrationConfig, 
  initialReviewAIInsights 
} from '../data/reviewsData';

import { 
  ReviewItem, 
  ReviewPlatform, 
  ReviewSentiment, 
  ReviewStatus, 
  GoogleReviewsIntegrationConfig, 
  ReviewAIInsight,
  SentimentTopicMetric,
  ReputationSummary
} from '../types';

interface ReviewsManagementViewProps {
  onNavigateToMaintenance?: (prefill?: any) => void;
  onNavigateToStaff?: (prefill?: any) => void;
}

export default function ReviewsManagementView({
  onNavigateToMaintenance,
  onNavigateToStaff
}: ReviewsManagementViewProps) {
  // Core Review state with local persistence
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem('resortdesk_reviews_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return initialReviewsList;
  });

  const [summary, setSummary] = useState<ReputationSummary>(() => {
    const saved = localStorage.getItem('resortdesk_reputation_summary');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return initialReputationSummary;
  });

  const [sentimentTopics, setSentimentTopics] = useState<SentimentTopicMetric[]>(initialSentimentTopics);
  const [googleConfig, setGoogleConfig] = useState<GoogleReviewsIntegrationConfig>(initialGoogleIntegrationConfig);
  const [aiInsights, setAiInsights] = useState<ReviewAIInsight[]>(initialReviewAIInsights);

  // Active filter states
  const [selectedPlatform, setSelectedPlatform] = useState<'All' | ReviewPlatform>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'rating_desc' | 'rating_asc' | 'action_required' | 'pending_first'>('newest');
  const [quickStatusFilter, setQuickStatusFilter] = useState<'all' | 'needs_reply' | 'negative' | 'five_star'>('all');

  // Advanced filters modal state
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<ReviewFiltersState>({
    search: '',
    platform: 'All',
    sentiment: 'All',
    status: 'All',
    minRating: 0,
    dateRange: 'all',
    topics: []
  });

  // Other modal states
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [isSentimentReportModalOpen, setIsSentimentReportModalOpen] = useState<boolean>(false);
  const [actionModalData, setActionModalData] = useState<{
    isOpen: boolean;
    insight?: ReviewAIInsight | null;
    review?: ReviewItem | null;
    actionType: 'maintenance' | 'staff' | 'recovery_offer' | 'operations';
  }>({
    isOpen: false,
    insight: null,
    review: null,
    actionType: 'maintenance'
  });

  // Syncing state animation
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to persist review state updates
  const updateReviewsState = (newReviews: ReviewItem[]) => {
    setReviews(newReviews);
    localStorage.setItem('resortdesk_reviews_list', JSON.stringify(newReviews));
  };

  // Publish reply handler
  const handlePublishReply = (reviewId: string, replyText: string, authorName: string) => {
    const updated = reviews.map(rev => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          status: 'Replied' as ReviewStatus,
          reply: {
            author: authorName,
            authorRole: 'General Manager',
            replyDate: 'Just now (Aug 17, 2026)',
            text: replyText,
            isPublishedToPlatform: true,
            publishedAt: 'Aug 17, 2026, 11:00 AM'
          }
        };
      }
      return rev;
    });

    updateReviewsState(updated);

    // Update response rate stats dynamically
    setSummary(prev => {
      const repliedCount = updated.filter(r => r.status === 'Replied').length;
      const rate = Math.min(100, Math.round((repliedCount / updated.length) * 100));
      const next = { ...prev, responseRate: rate };
      localStorage.setItem('resortdesk_reputation_summary', JSON.stringify(next));
      return next;
    });
  };

  // AI Reply Regenerator
  const handleRegenerateAIReply = (
    reviewId: string, 
    tone: 'Warm & Hospitable' | 'Empathetic Problem Solver' | 'Executive & Crisp' | 'Luxury Concierge' = 'Warm & Hospitable'
  ) => {
    const target = reviews.find(r => r.id === reviewId);
    if (!target) return;

    let generatedText = '';
    let perk = '';

    if (target.sentiment === 'Negative' || target.rating <= 2) {
      if (tone === 'Empathetic Problem Solver') {
        generatedText = `Dear ${target.reviewerName.split(' ')[0]}, Thank you for your candid feedback regarding your stay in ${target.roomOrBooking}. I am genuinely distressed to hear of the shortcomings you experienced. Delivering seamless 5-star hospitality is our sole priority, and we clearly fell short. Our senior management team has initiated immediate corrective actions across the property. I would consider it a privilege to personally manage your reservation on your next trip and arrange a complimentary stay enhancement. Please contact me directly at gm@malabarresort.com.`;
        perk = 'Complimentary Room Upgrade & Welcome High-Tea on Return';
      } else if (tone === 'Luxury Concierge') {
        generatedText = `Dear ${target.reviewerName}, We hold ourselves to uncompromising standards of luxury, and we are sincerely saddened to learn that your stay did not reflect this promise. Please accept our personal apologies. We have addressed the matter with our department leads and would be honored to extend a curated VIP stay experience for your next coastal journey.`;
        perk = 'Curated Beach Cabana Dinner & 25% Stay Voucher';
      } else {
        generatedText = `Dear ${target.reviewerName}, Thank you for bringing this to our attention. We take guest feedback very seriously and have taken prompt measures with our team. Please reach out to our management desk so we may make appropriate amends.`;
      }
    } else {
      if (tone === 'Luxury Concierge') {
        generatedText = `Dear ${target.reviewerName}, It was our highest honor to welcome you to our coastal sanctuary at ${target.roomOrBooking}. We are enchanted to know that our staff, private pool, and dining experiences made your stay truly extraordinary. Our entire team looks forward to greeting you on your next visit to Goa & the Konkan coast.`;
      } else if (tone === 'Executive & Crisp') {
        generatedText = `Dear ${target.reviewerName}, Thank you for your 5-star review and for choosing The Malabar Grand Cliff Resort. We are delighted you enjoyed your time with us and hope to welcome you back soon.`;
      } else {
        generatedText = `Dear ${target.reviewerName}, Thank you so much for your wonderful words! Our team is delighted that you enjoyed ${target.roomOrBooking} and our signature hospitality. It was our absolute pleasure to host you, and we cannot wait to welcome you back for another unforgettable escape!`;
      }
    }

    const updated = reviews.map(rev => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          aiSuggestedReply: {
            tone,
            text: generatedText,
            suggestedAt: 'Just now',
            confidence: 0.98,
            actionablePerk: perk || undefined,
            keyPointsCovered: ['Personalized guest greeting', 'Specific stay acknowledgment', 'On-brand resort closing']
          }
        };
      }
      return rev;
    });

    updateReviewsState(updated);
    triggerToast(`Myra AI generated fresh response in "${tone}" tone!`);
  };

  // Force Sync Simulation
  const handleSyncPlatforms = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const newLastSync = 'Just now';
      setGoogleConfig(prev => ({
        ...prev,
        lastSyncedAt: newLastSync,
        totalGoogleReviews: prev.totalGoogleReviews + 1
      }));
      setSummary(prev => ({
        ...prev,
        totalVerifiedReviews: prev.totalVerifiedReviews + 1,
        newThisWeekCount: prev.newThisWeekCount + 1
      }));
      triggerToast("Synced platforms: 1 new verified Google review ingested!");
    }, 1200);
  };

  // Platform count pills calculation
  const platformCounts = useMemo(() => {
    const counts = {
      All: reviews.length,
      Google: reviews.filter(r => r.platform === 'Google').length,
      'Booking.com': reviews.filter(r => r.platform === 'Booking.com').length,
      Airbnb: reviews.filter(r => r.platform === 'Airbnb').length,
      Tripadvisor: reviews.filter(r => r.platform === 'Tripadvisor').length
    };
    return counts;
  }, [reviews]);

  // Filtered & Sorted Review Feed
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      // Platform filter
      if (selectedPlatform !== 'All' && rev.platform !== selectedPlatform) {
        return false;
      }

      // Quick filter
      if (quickStatusFilter === 'needs_reply' && rev.status === 'Replied') return false;
      if (quickStatusFilter === 'negative' && rev.sentiment !== 'Negative') return false;
      if (quickStatusFilter === 'five_star' && rev.rating !== 5) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rev.reviewerName.toLowerCase().includes(q);
        const matchesText = rev.reviewText.toLowerCase().includes(q);
        const matchesRoom = rev.roomOrBooking.toLowerCase().includes(q);
        const matchesTopics = rev.topics.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesText && !matchesRoom && !matchesTopics) {
          return false;
        }
      }

      // Advanced filters
      if (advancedFilters.sentiment !== 'All' && rev.sentiment !== advancedFilters.sentiment) {
        return false;
      }
      if (advancedFilters.status !== 'All' && rev.status !== advancedFilters.status) {
        return false;
      }
      if (advancedFilters.minRating > 0 && rev.rating < advancedFilters.minRating) {
        return false;
      }
      if (advancedFilters.topics.length > 0) {
        const hasTopic = advancedFilters.topics.some(t => rev.topics.includes(t));
        if (!hasTopic) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      if (sortBy === 'rating_asc') return a.rating - b.rating;
      if (sortBy === 'action_required') {
        const aScore = a.status === 'Action Required' ? 2 : a.status === 'Pending' ? 1 : 0;
        const bScore = b.status === 'Action Required' ? 2 : b.status === 'Pending' ? 1 : 0;
        return bScore - aScore;
      }
      if (sortBy === 'pending_first') {
        const aPending = a.status !== 'Replied' ? 1 : 0;
        const bPending = b.status !== 'Replied' ? 1 : 0;
        return bPending - aPending;
      }
      // Default: newest first (order in array)
      return 0;
    });
  }, [reviews, selectedPlatform, quickStatusFilter, searchQuery, advancedFilters, sortBy]);

  const pendingReviewsCount = useMemo(() => {
    return reviews.filter(r => r.status !== 'Replied').length;
  }, [reviews]);

  return (
    <div id="reviews-management-view" className="flex flex-col gap-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-teal-950 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-xl border border-teal-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-900 text-[11px] font-bold tracking-wider uppercase rounded-full border border-teal-100/80 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-700"></span>
            REPUTATION HUB
          </div>
          <h1 className="text-3xl font-bold font-serif text-teal-950 tracking-tight leading-none">
            Reviews Management
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium max-w-2xl">
            Monitor and respond to guest feedback across all platforms. Utilize Myra AI for personalized, on-brand responses.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button
            id="open-filters-btn"
            onClick={() => setIsFiltersModalOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Filters</span>
            {advancedFilters.topics.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-teal-800 text-white text-[10px] flex items-center justify-center font-bold">
                {advancedFilters.topics.length}
              </span>
            )}
          </button>

          <button
            id="sync-platforms-btn"
            onClick={handleSyncPlatforms}
            disabled={isSyncing}
            className="px-5 py-2.5 bg-teal-950 hover:bg-teal-900 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-950/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-teal-300 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Feeds...' : 'Sync Platforms'}</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Overall Reputation Score (Dark Teal Card) */}
        <div className="bg-gradient-to-br from-teal-900 via-teal-950 to-teal-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg border border-teal-800/60 flex flex-col justify-between min-h-[160px]">
          {/* Subtle curved background decoration */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-teal-800/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-200/90">
              OVERALL REPUTATION SCORE
            </span>
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 shadow-inner">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-4 relative z-10">
            <span className="text-5xl font-black tracking-tight text-white font-sans">
              {summary.overallScore.toFixed(1)}
            </span>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="inline-flex items-center gap-1 bg-teal-800/80 text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-teal-700/50">
                <TrendingUp className="w-3 h-3" />
                +{summary.scoreDelta.toFixed(1)} from last month
              </span>
            </div>
          </div>

          <div className="mt-3 text-xs text-teal-200/80 relative z-10 font-medium">
            Based on <strong className="text-white font-semibold">{summary.totalVerifiedReviews.toLocaleString()}</strong> total verified reviews
          </div>
        </div>

        {/* Card 2: Review Volume Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Review Volume</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-slate-900 font-sans">
              {summary.newThisWeekCount}
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
              NEW THIS WEEK
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            {/* Bi-color progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full rounded-l-full" 
                style={{ width: `${summary.positivePercentage}%` }}
              />
              <div 
                className="bg-rose-500 h-full rounded-r-full" 
                style={{ width: `${summary.negativePercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-slate-600">{summary.positivePercentage}% Positive</span>
              <span className="text-slate-600">{summary.negativePercentage}% Negative</span>
            </div>
          </div>
        </div>

        {/* Card 3: Response Rate Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Response Rate</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Zap className="w-4 h-4 fill-amber-500" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-4xl font-extrabold text-slate-900 font-sans">
              {summary.responseRate}%
            </span>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Avg. response time: <strong className="text-slate-800">{summary.avgResponseTimeHours} hours</strong>
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setQuickStatusFilter('needs_reply');
                triggerToast("Filtered feed to reviews pending management response.");
              }}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer transition-colors group"
            >
              <span>View pending responses ({pendingReviewsCount})</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Platform Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setSelectedPlatform('All')}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            selectedPlatform === 'All'
              ? 'bg-teal-950 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>All Platforms</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            selectedPlatform === 'All' ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {platformCounts.All}
          </span>
        </button>

        <button
          onClick={() => setSelectedPlatform('Google')}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            selectedPlatform === 'Google'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">G</span>
          <span>Google</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            selectedPlatform === 'Google' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {platformCounts.Google}
          </span>
        </button>

        <button
          onClick={() => setSelectedPlatform('Booking.com')}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            selectedPlatform === 'Booking.com'
              ? 'bg-blue-950 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="font-bold text-[10px] text-blue-400">B.</span>
          <span>Booking.com</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            selectedPlatform === 'Booking.com' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {platformCounts['Booking.com']}
          </span>
        </button>

        <button
          onClick={() => setSelectedPlatform('Airbnb')}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            selectedPlatform === 'Airbnb'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-rose-400 font-bold">★</span>
          <span>airbnb</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            selectedPlatform === 'Airbnb' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {platformCounts.Airbnb}
          </span>
        </button>

        <button
          onClick={() => setSelectedPlatform('Tripadvisor')}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            selectedPlatform === 'Tripadvisor'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>tripadvisor</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            selectedPlatform === 'Tripadvisor' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {platformCounts.Tripadvisor}
          </span>
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols) - Review Feed & Filter Controls */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Quick Search & Sort Control Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by guest, room, keyword, or topic..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            {/* Quick Status pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setQuickStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  quickStatusFilter === 'all' ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setQuickStatusFilter('needs_reply')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  quickStatusFilter === 'needs_reply' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Needs Reply
              </button>
              <button
                onClick={() => setQuickStatusFilter('negative')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  quickStatusFilter === 'negative' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Negative
              </button>
              <button
                onClick={() => setQuickStatusFilter('five_star')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  quickStatusFilter === 'five_star' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                5-Star
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-slate-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="newest">Newest First</option>
                <option value="action_required">Action Required First</option>
                <option value="pending_first">Pending Replies First</option>
                <option value="rating_desc">Highest Rated (5★)</option>
                <option value="rating_asc">Lowest Rated (1★)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{filteredReviews.length}</strong> of {reviews.length} reviews
              {selectedPlatform !== 'All' && <span> on <strong>{selectedPlatform}</strong></span>}
            </span>
            {(searchQuery || quickStatusFilter !== 'all' || advancedFilters.topics.length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setQuickStatusFilter('all');
                  setSelectedPlatform('All');
                  setAdvancedFilters({
                    search: '',
                    platform: 'All',
                    sentiment: 'All',
                    status: 'All',
                    minRating: 0,
                    dateRange: 'all',
                    topics: []
                  });
                  triggerToast("Reset all search and feed filters.");
                }}
                className="text-teal-800 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Review Feed Cards List */}
          <div className="space-y-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onPublishReply={handlePublishReply}
                  onRegenerateAIReply={handleRegenerateAIReply}
                  onCreateMaintenanceFromReview={(rev) => {
                    setActionModalData({
                      isOpen: true,
                      review: rev,
                      insight: null,
                      actionType: 'maintenance'
                    });
                  }}
                  onSendStaffKudos={(rev) => {
                    setActionModalData({
                      isOpen: true,
                      review: rev,
                      insight: null,
                      actionType: 'staff'
                    });
                  }}
                  onSendRecoveryOffer={(rev) => {
                    setActionModalData({
                      isOpen: true,
                      review: rev,
                      insight: null,
                      actionType: 'recovery_offer'
                    });
                  }}
                  triggerToast={triggerToast}
                />
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">No reviews match your current filters</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search query, clearing platform filters, or widening the date range.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setQuickStatusFilter('all');
                    setSelectedPlatform('All');
                  }}
                  className="px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-teal-900"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 Col) - Sentiment Topics & Google Business Profile Integration */}
        <div className="space-y-6">
          
          {/* Sentiment Topics Card (Exact Match to Screenshot) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
                <span className="font-mono text-sm">📊</span>
              </div>
              <h3 className="font-bold">Sentiment Topics</h3>
            </div>

            <div className="space-y-4">
              {sentimentTopics.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{item.topic}</span>
                      <span className={`text-[11px] font-bold ${
                        item.trendDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.trendDelta >= 0 ? `+${item.trendDelta}%` : `${item.trendDelta}%`}
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-slate-500">
                      {item.flaggedWarning ? (
                        <span className="text-rose-600 font-semibold">Flagged for review</span>
                      ) : (
                        `${item.positivePercentage}% Positive mentions`
                      )}
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.trendDelta < -1.5
                          ? 'bg-rose-500'
                          : item.topic === 'Cleanliness'
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.positivePercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsSentimentReportModalOpen(true)}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Full Report</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Google Reviews Integration Card (OAuth / API Integration) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shadow-xs">
                  G
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Google Business Profile</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Connected & Sync Active</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsGoogleModalOpen(true)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors"
                title="Manage Google OAuth & API Settings"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Connected Account</span>
                <span className="font-semibold text-slate-800 truncate max-w-[160px]">{googleConfig.connectedAccount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Google Rating</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  ⭐ 4.9 <span className="text-slate-400 font-normal">({googleConfig.totalGoogleReviews})</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Synced</span>
                <span className="font-medium text-slate-700">{googleConfig.lastSyncedAt}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncPlatforms}
                disabled={isSyncing}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Force Sync</span>
              </button>

              <button
                onClick={() => setIsGoogleModalOpen(true)}
                className="flex-1 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Globe className="w-3 h-3" />
                <span>OAuth Settings</span>
              </button>
            </div>
          </div>

          {/* AI-Powered Operational Insights & Recommended Actions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4>Myra AI Review Takeaways</h4>
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                4 Action Items
              </span>
            </div>

            <div className="space-y-3">
              {aiInsights.map((insight) => (
                <div 
                  key={insight.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-all ${
                    insight.severity === 'high'
                      ? 'bg-rose-50/50 border-rose-200 text-slate-800'
                      : insight.severity === 'positive'
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-slate-900 text-xs leading-snug">
                      {insight.title}
                    </h5>
                    {insight.severity === 'high' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-md shrink-0 uppercase">
                        Urgent
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {insight.description}
                  </p>

                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => {
                        setActionModalData({
                          isOpen: true,
                          insight,
                          review: null,
                          actionType: insight.actionType
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        insight.actionType === 'maintenance'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : insight.actionType === 'staff'
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-teal-800 hover:bg-teal-900 text-white'
                      }`}
                    >
                      {insight.actionType === 'maintenance' && <Wrench className="w-3 h-3" />}
                      {insight.actionType === 'staff' && <Award className="w-3 h-3" />}
                      {insight.actionType === 'recovery_offer' && <Gift className="w-3 h-3" />}
                      <span>Take Action</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Distribution Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-xs">Rating Distribution</h4>
            
            <div className="space-y-2 text-xs">
              {[
                { stars: 5, count: summary.ratingDistribution[5], percent: 78 },
                { stars: 4, count: summary.ratingDistribution[4], percent: 14 },
                { stars: 3, count: summary.ratingDistribution[3], percent: 4 },
                { stars: 2, count: summary.ratingDistribution[2], percent: 2 },
                { stars: 1, count: summary.ratingDistribution[1], percent: 2 }
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-2">
                  <span className="w-6 font-bold text-slate-700">{row.stars}★</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 w-10 text-right font-medium">{row.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Modals */}
      <GoogleIntegrationModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        config={googleConfig}
        onSaveConfig={(updated) => setGoogleConfig(updated)}
        onForceSync={handleSyncPlatforms}
        triggerToast={triggerToast}
      />

      <ReviewFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filters={advancedFilters}
        onApplyFilters={(applied) => {
          setAdvancedFilters(applied);
          triggerToast("Advanced review filters applied.");
        }}
        onResetFilters={() => {
          setAdvancedFilters({
            search: '',
            platform: 'All',
            sentiment: 'All',
            status: 'All',
            minRating: 0,
            dateRange: 'all',
            topics: []
          });
          triggerToast("Filters reset to default.");
        }}
      />

      <SentimentReportModal
        isOpen={isSentimentReportModalOpen}
        onClose={() => setIsSentimentReportModalOpen(false)}
        sentimentTopics={sentimentTopics}
        summary={summary}
        triggerToast={triggerToast}
      />

      <ReviewActionModal
        isOpen={actionModalData.isOpen}
        onClose={() => setActionModalData({ isOpen: false, insight: null, review: null, actionType: 'maintenance' })}
        insight={actionModalData.insight}
        review={actionModalData.review}
        actionType={actionModalData.actionType}
        triggerToast={triggerToast}
      />

    </div>
  );
}
