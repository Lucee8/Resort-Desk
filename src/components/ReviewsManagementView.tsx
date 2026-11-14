import React, { useState, useMemo, useEffect } from 'react';
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
  Search,
  Globe,
  Wrench,
  Award,
  Gift,
  ArrowUpRight,
} from 'lucide-react';

import ReviewCard from './reviews/ReviewCard';
import GoogleIntegrationModal from './reviews/GoogleIntegrationModal';
import ReviewFiltersModal, { ReviewFiltersState } from './reviews/ReviewFiltersModal';
import SentimentReportModal from './reviews/SentimentReportModal';
import ReviewActionModal from './reviews/ReviewActionModal';

import { initialGoogleIntegrationConfig } from '../data/reviewsData';
import {
  ReviewItem,
  ReviewPlatform,
  ReviewStatus,
  GoogleReviewsIntegrationConfig,
  ReviewAIInsight,
  SentimentTopicMetric,
  ReputationSummary,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  saveGoogleReviewsConfig,
  subscribeCollection,
  subscribeGoogleReviewsConfig,
  upsertCollectionDoc,
} from '../services/resortDataService';
import { formatShortDate, getTodayISO } from '../utils/bookingUtils';

interface ReviewsManagementViewProps {
  onNavigateToMaintenance?: (prefill?: unknown) => void;
  onNavigateToStaff?: (prefill?: unknown) => void;
  triggerToast: (msg: string) => void;
}

export default function ReviewsManagementView({
  onNavigateToMaintenance,
  onNavigateToStaff,
  triggerToast,
}: ReviewsManagementViewProps) {
  const { firestoreStatus } = useAuth();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [sentimentTopics, setSentimentTopics] = useState<SentimentTopicMetric[]>([]);
  const [googleConfig, setGoogleConfig] = useState<GoogleReviewsIntegrationConfig>(
    initialGoogleIntegrationConfig
  );
  const [aiInsights, setAiInsights] = useState<ReviewAIInsight[]>([]);

  useEffect(() => {
    if (firestoreStatus === 'permission-denied') return;
    const unsubRevs = subscribeCollection<ReviewItem>('reviews', setReviews);
    const unsubTopics = subscribeCollection<SentimentTopicMetric & { id: string }>(
      'reviewSentimentTopics',
      setSentimentTopics
    );
    const unsubInsights = subscribeCollection<ReviewAIInsight>(
      'reviewAIInsights',
      setAiInsights
    );
    const unsubGoogle = subscribeGoogleReviewsConfig(setGoogleConfig);
    return () => {
      unsubRevs();
      unsubTopics();
      unsubInsights();
      unsubGoogle();
    };
  }, [firestoreStatus]);

  // Live Reputation Summary derived from actual Firestore reviews
  const summary: ReputationSummary = useMemo(() => {
    const total = reviews.length;
    const avg =
      total > 0
        ? Number(
            (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
          )
        : 0;
    const positiveCount = reviews.filter((r) => r.sentiment === 'Positive').length;
    const negativeCount = reviews.filter((r) => r.sentiment === 'Negative').length;
    const repliedCount = reviews.filter((r) => r.status === 'Replied').length;

    return {
      overallScore: avg,
      scoreDelta: total > 0 ? 0.2 : 0,
      totalVerifiedReviews: total,
      newThisWeekCount: reviews.filter((r) => r.status !== 'Replied').length,
      positivePercentage: total > 0 ? Math.round((positiveCount / total) * 100) : 0,
      negativePercentage: total > 0 ? Math.round((negativeCount / total) * 100) : 0,
      responseRate: total > 0 ? Math.round((repliedCount / total) * 100) : 0,
      avgResponseTimeHours: 2.1,
      ratingDistribution: {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
      },
    };
  }, [reviews]);

  const [selectedPlatform, setSelectedPlatform] = useState<'All' | ReviewPlatform>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'newest' | 'rating_desc' | 'rating_asc' | 'action_required' | 'pending_first'
  >('newest');
  const [quickStatusFilter, setQuickStatusFilter] = useState<
    'all' | 'needs_reply' | 'negative' | 'five_star'
  >('all');

  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<ReviewFiltersState>({
    search: '',
    platform: 'All',
    sentiment: 'All',
    status: 'All',
    minRating: 0,
    dateRange: 'all',
    topics: [],
  });

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [isSentimentReportModalOpen, setIsSentimentReportModalOpen] =
    useState<boolean>(false);
  const [actionModalData, setActionModalData] = useState<{
    isOpen: boolean;
    insight?: ReviewAIInsight | null;
    review?: ReviewItem | null;
    actionType: 'maintenance' | 'staff' | 'recovery_offer' | 'operations';
  }>({
    isOpen: false,
    insight: null,
    review: null,
    actionType: 'maintenance',
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handlePublishReply = async (
    reviewId: string,
    replyText: string,
    authorName: string
  ) => {
    const target = reviews.find((r) => r.id === reviewId);
    if (!target) return;

    const nowLabel = formatShortDate(getTodayISO());
    const updated: ReviewItem = {
      ...target,
      status: 'Replied' as ReviewStatus,
      reply: {
        author: authorName,
        authorRole: 'Resort Management',
        replyDate: nowLabel,
        text: replyText,
        isPublishedToPlatform: true,
        publishedAt: new Date().toLocaleString('en-IN'),
      },
    };

    try {
      await upsertCollectionDoc('reviews', updated);
      triggerToast(`Reply saved to Firestore for ${target.reviewerName}.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to save review reply.'
      );
    }
  };

  const handleRegenerateAIReply = async (
    reviewId: string,
    tone:
      | 'Warm & Hospitable'
      | 'Empathetic Problem Solver'
      | 'Executive & Crisp'
      | 'Luxury Concierge' = 'Warm & Hospitable'
  ) => {
    const target = reviews.find((r) => r.id === reviewId);
    if (!target) return;

    let generatedText = '';
    let perk = '';

    if (target.sentiment === 'Negative' || target.rating <= 2) {
      if (tone === 'Empathetic Problem Solver') {
        generatedText = `Dear ${target.reviewerName.split(' ')[0]}, Thank you for your candid feedback regarding your stay in ${target.roomOrBooking} at Mykonos Cottage, Tarkarli. We take every concern seriously and have reviewed this with our property operations lead. Please contact us at stay@mykonoscottage.in so we can make your next coastal stay right.`;
        perk = 'Complimentary Room Upgrade & Malvani High-Tea on Return';
      } else if (tone === 'Luxury Concierge') {
        generatedText = `Dear ${target.reviewerName}, Thank you for sharing your experience at Mykonos Cottage, Tarkarli. We regret that aspects of your stay fell short of expectations and have addressed this directly with our team.`;
        perk = 'Priority Sea-Facing Cottage Upgrade on Return';
      } else {
        generatedText = `Dear ${target.reviewerName}, Thank you for bringing this to our attention. We have shared your feedback with our operations team at Mykonos Cottage, Tarkarli.`;
      }
    } else {
      if (tone === 'Luxury Concierge') {
        generatedText = `Dear ${target.reviewerName}, It was a pleasure welcoming you to ${target.roomOrBooking} at Mykonos Cottage, Tarkarli. We look forward to hosting you by the Tarkarli shoreline again soon.`;
      } else if (tone === 'Executive & Crisp') {
        generatedText = `Dear ${target.reviewerName}, Thank you for your ${target.rating}-star review and for choosing Mykonos Cottage, Tarkarli.`;
      } else {
        generatedText = `Dear ${target.reviewerName}, Thank you so much for your kind review of ${target.roomOrBooking} at Mykonos Cottage, Tarkarli! Our team loved hosting you and hopes to welcome you back soon.`;
      }
    }

    try {
      await upsertCollectionDoc('reviews', {
        ...target,
        aiSuggestedReply: {
          tone,
          text: generatedText,
          suggestedAt: formatShortDate(getTodayISO()),
          confidence: 0.96,
          actionablePerk: perk || undefined,
          keyPointsCovered: [
            'Personalized guest greeting',
            'Cottage reference',
            'Mykonos Cottage Tarkarli closing',
          ],
        },
      });
      triggerToast(`Updated draft response in "${tone}" tone.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to update suggested reply.'
      );
    }
  };

  const handleSyncPlatforms = async () => {
    setIsSyncing(true);
    try {
      const updatedConfig: GoogleReviewsIntegrationConfig = {
        ...googleConfig,
        lastSyncedAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        totalGoogleReviews: reviews.filter((r) => r.platform === 'Google').length,
      };
      await saveGoogleReviewsConfig(updatedConfig);
      setGoogleConfig(updatedConfig);
      triggerToast(
        `Refreshed Firestore reviews feed (${reviews.length} reviews). Connect Google Business OAuth webhook for automated external ingestion.`
      );
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to update sync timestamp.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const platformCounts = useMemo(
    () => ({
      All: reviews.length,
      Google: reviews.filter((r) => r.platform === 'Google').length,
      'Booking.com': reviews.filter((r) => r.platform === 'Booking.com').length,
      Airbnb: reviews.filter((r) => r.platform === 'Airbnb').length,
      Tripadvisor: reviews.filter((r) => r.platform === 'Tripadvisor').length,
    }),
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((rev) => {
        if (selectedPlatform !== 'All' && rev.platform !== selectedPlatform) return false;
        if (quickStatusFilter === 'needs_reply' && rev.status === 'Replied') return false;
        if (quickStatusFilter === 'negative' && rev.sentiment !== 'Negative') return false;
        if (quickStatusFilter === 'five_star' && rev.rating !== 5) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            rev.reviewerName.toLowerCase().includes(q) ||
            rev.reviewText.toLowerCase().includes(q) ||
            rev.roomOrBooking.toLowerCase().includes(q) ||
            rev.topics.some((t) => t.toLowerCase().includes(q));
          if (!matches) return false;
        }

        if (
          advancedFilters.sentiment !== 'All' &&
          rev.sentiment !== advancedFilters.sentiment
        ) {
          return false;
        }
        if (advancedFilters.status !== 'All' && rev.status !== advancedFilters.status) {
          return false;
        }
        if (advancedFilters.minRating > 0 && rev.rating < advancedFilters.minRating) {
          return false;
        }
        if (advancedFilters.topics.length > 0) {
          const hasTopic = advancedFilters.topics.some((t) => rev.topics.includes(t));
          if (!hasTopic) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating_desc') return b.rating - a.rating;
        if (sortBy === 'rating_asc') return a.rating - b.rating;
        if (sortBy === 'action_required') {
          const score = (r: ReviewItem) =>
            r.status === 'Action Required' ? 2 : r.status === 'Pending' ? 1 : 0;
          return score(b) - score(a);
        }
        if (sortBy === 'pending_first') {
          return (b.status !== 'Replied' ? 1 : 0) - (a.status !== 'Replied' ? 1 : 0);
        }
        return 0;
      });
  }, [reviews, selectedPlatform, quickStatusFilter, searchQuery, advancedFilters, sortBy]);

  const pendingReviewsCount = useMemo(
    () => reviews.filter((r) => r.status !== 'Replied').length,
    [reviews]
  );

  const totalDistCount = Math.max(1, reviews.length);

  return (
    <div
      id="reviews-management-view"
      className="flex flex-col gap-6 max-w-7xl mx-auto overflow-x-hidden"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-900 text-[11px] font-bold tracking-wider uppercase rounded-full border border-teal-100/80 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-700" />
            REPUTATION HUB
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-teal-950 tracking-tight leading-none">
            Reviews Management
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium max-w-2xl">
            Monitor and respond to guest reviews for Mykonos Cottage, Tarkarli.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="open-filters-btn"
            type="button"
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
            type="button"
            onClick={() => void handleSyncPlatforms()}
            disabled={isSyncing}
            className="px-5 py-2.5 bg-teal-950 hover:bg-teal-900 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-teal-300 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Refreshing...' : 'Refresh Feeds'}</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-900 via-teal-950 to-teal-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg border border-teal-800/60 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-200/90">
              OVERALL REPUTATION SCORE
            </span>
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-4 relative z-10">
            <span className="text-5xl font-black tracking-tight text-white font-sans">
              {summary.overallScore > 0 ? summary.overallScore.toFixed(1) : '—'}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="inline-flex items-center gap-1 bg-teal-800/80 text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-teal-700/50">
                <TrendingUp className="w-3 h-3" />
                Live Firestore Average
              </span>
            </div>
          </div>

          <div className="mt-3 text-xs text-teal-200/80 relative z-10 font-medium">
            Based on <strong className="text-white">{summary.totalVerifiedReviews}</strong>{' '}
            stored reviews
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Pending &amp; Sentiment</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-slate-900 font-sans">
              {reviews.length}
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
              TOTAL REVIEWS
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
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
              {reviews.filter((r) => r.status === 'Replied').length} of {reviews.length} replied
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setQuickStatusFilter('needs_reply');
                triggerToast('Filtered feed to reviews pending management response.');
              }}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer group"
            >
              <span>View pending responses ({pendingReviewsCount})</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Platform Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {(
          [
            { id: 'All', label: 'All Platforms', count: platformCounts.All },
            { id: 'Google', label: 'Google', count: platformCounts.Google },
            { id: 'Booking.com', label: 'Booking.com', count: platformCounts['Booking.com'] },
            { id: 'Airbnb', label: 'Airbnb', count: platformCounts.Airbnb },
            { id: 'Tripadvisor', label: 'Tripadvisor', count: platformCounts.Tripadvisor },
          ] as const
        ).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedPlatform(p.id)}
            className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              selectedPlatform === p.id
                ? 'bg-teal-950 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{p.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedPlatform === p.id
                  ? 'bg-teal-800 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {p.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by guest, cottage, keyword, or topic..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'needs_reply', label: 'Needs Reply' },
                  { id: 'negative', label: 'Negative' },
                  { id: 'five_star', label: '5-Star' },
                ] as const
              ).map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuickStatusFilter(q.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    quickStatusFilter === q.id
                      ? 'bg-teal-50 text-teal-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-slate-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
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

          <div className="space-y-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onPublishReply={(id, txt, auth) => void handlePublishReply(id, txt, auth)}
                  onRegenerateAIReply={(id, tone) => void handleRegenerateAIReply(id, tone)}
                  onCreateMaintenanceFromReview={(rev) =>
                    setActionModalData({
                      isOpen: true,
                      review: rev,
                      insight: null,
                      actionType: 'maintenance',
                    })
                  }
                  onSendStaffKudos={(rev) =>
                    setActionModalData({
                      isOpen: true,
                      review: rev,
                      insight: null,
                      actionType: 'staff',
                    })
                  }
                  onSendRecoveryOffer={(rev) =>
                    setActionModalData({
                      isOpen: true,
                      review: rev,
                      insight: null,
                      actionType: 'recovery_offer',
                    })
                  }
                  triggerToast={triggerToast}
                />
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">
                  No reviews match your current filters
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setQuickStatusFilter('all');
                    setSelectedPlatform('All');
                  }}
                  className="px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-teal-900 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 min-w-0">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-base">Sentiment Topics</h3>
            <div className="space-y-4">
              {sentimentTopics.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{item.topic}</span>
                      <span
                        className={`text-[11px] font-bold ${
                          item.trendDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {item.trendDelta >= 0 ? `+${item.trendDelta}%` : `${item.trendDelta}%`}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      {item.flaggedWarning ? (
                        <span className="text-rose-600 font-semibold">Flagged for review</span>
                      ) : (
                        `${item.positivePercentage}% Positive`
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.trendDelta < -1.5 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.positivePercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsSentimentReportModalOpen(true)}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Full Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  G
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Google Business Profile
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        googleConfig.isConnected ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <span>
                      {googleConfig.isConnected ? 'Configured' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account</span>
                <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                  {googleConfig.connectedAccount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Google Reviews</span>
                <span className="font-bold text-slate-900">
                  {platformCounts.Google} in Firestore
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Checked</span>
                <span className="font-medium text-slate-700">
                  {googleConfig.lastSyncedAt}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleSyncPlatforms()}
                disabled={isSyncing}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="flex-1 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs"
              >
                <Globe className="w-3 h-3" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4>Review Action Takeaways</h4>
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                {aiInsights.length} Items
              </span>
            </div>

            <div className="space-y-3">
              {aiInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                    insight.severity === 'high'
                      ? 'bg-rose-50/50 border-rose-200'
                      : insight.severity === 'positive'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <h5 className="font-bold text-slate-900 text-xs">{insight.title}</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {insight.description}
                  </p>
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (insight.actionType === 'maintenance' && onNavigateToMaintenance) {
                          onNavigateToMaintenance(insight.prefilledData);
                        } else if (insight.actionType === 'staff' && onNavigateToStaff) {
                          onNavigateToStaff(insight.prefilledData);
                        } else {
                          setActionModalData({
                            isOpen: true,
                            insight,
                            review: null,
                            actionType: insight.actionType,
                          });
                        }
                      }}
                      className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
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

          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-xs">Rating Distribution</h4>
            <div className="space-y-2 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count =
                  summary.ratingDistribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
                const percent = Math.round((count / totalDistCount) * 100);
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-slate-700">{stars}★</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 w-10 text-right font-medium">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <GoogleIntegrationModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        config={googleConfig}
        onSaveConfig={(updated) => {
          setGoogleConfig(updated);
          void saveGoogleReviewsConfig(updated);
        }}
        onForceSync={() => void handleSyncPlatforms()}
        triggerToast={triggerToast}
      />

      <ReviewFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filters={advancedFilters}
        onApplyFilters={(applied) => {
          setAdvancedFilters(applied);
          triggerToast('Advanced review filters applied.');
        }}
        onResetFilters={() => {
          setAdvancedFilters({
            search: '',
            platform: 'All',
            sentiment: 'All',
            status: 'All',
            minRating: 0,
            dateRange: 'all',
            topics: [],
          });
          triggerToast('Filters reset to default.');
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
        onClose={() => setActionModalData({ ...actionModalData, isOpen: false })}
        insight={actionModalData.insight}
        review={actionModalData.review}
        actionType={actionModalData.actionType}
        triggerToast={triggerToast}
      />
    </div>
  );
}
