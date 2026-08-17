import React, { useState } from 'react';
import { 
  Star, 
  Sparkles, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Edit3, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  ExternalLink,
  MessageSquare,
  Wrench,
  Award,
  Gift,
  Mail,
  Phone
} from 'lucide-react';
import { ReviewItem, ReviewPlatform, ReviewAISuggestion } from '../../types';

interface ReviewCardProps {
  key?: React.Key;
  review: ReviewItem;
  onPublishReply: (reviewId: string, replyText: string, authorName: string) => void;
  onRegenerateAIReply: (reviewId: string, tone?: 'Warm & Hospitable' | 'Empathetic Problem Solver' | 'Executive & Crisp' | 'Luxury Concierge') => void;
  onCreateMaintenanceFromReview?: (review: ReviewItem) => void;
  onSendStaffKudos?: (review: ReviewItem) => void;
  onSendRecoveryOffer?: (review: ReviewItem) => void;
  triggerToast: (msg: string) => void;
}

export default function ReviewCard({
  review,
  onPublishReply,
  onRegenerateAIReply,
  onCreateMaintenanceFromReview,
  onSendStaffKudos,
  onSendRecoveryOffer,
  triggerToast
}: ReviewCardProps) {
  const [isReplyExpanded, setIsReplyExpanded] = useState<boolean>(review.status === 'Replied' ? false : true);
  const [isEditingDraft, setIsEditingDraft] = useState<boolean>(false);
  const [replyDraft, setReplyDraft] = useState<string>(
    review.reply?.text || review.aiSuggestedReply?.text || ''
  );
  const [selectedTone, setSelectedTone] = useState<'Warm & Hospitable' | 'Empathetic Problem Solver' | 'Executive & Crisp' | 'Luxury Concierge'>(
    review.aiSuggestedReply?.tone || (review.sentiment === 'Negative' ? 'Empathetic Problem Solver' : 'Warm & Hospitable')
  );
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [showToneDropdown, setShowToneDropdown] = useState<boolean>(false);

  // Platform badges
  const renderPlatformBadge = (platform: ReviewPlatform) => {
    switch (platform) {
      case 'Google':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 font-bold text-[8px] flex items-center justify-center text-white">G</span>
            Google
          </span>
        );
      case 'Booking.com':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900 text-white border border-blue-900">
            <span className="font-bold text-[10px]">B.</span>
            Booking.com
          </span>
        );
      case 'Airbnb':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
            <span className="font-bold text-[10px]">★</span>
            airbnb
          </span>
        );
      case 'Tripadvisor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            tripadvisor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {platform}
          </span>
        );
    }
  };

  const handlePublish = () => {
    if (!replyDraft.trim()) {
      triggerToast("Please enter a reply message before publishing.");
      return;
    }

    setIsPublishing(true);
    setTimeout(() => {
      onPublishReply(review.id, replyDraft, "Anand Sharma (General Manager)");
      setIsPublishing(false);
      setIsEditingDraft(false);
      triggerToast(`Official reply published to ${review.platform}!`);
    }, 600);
  };

  const handleToneChangeAndRegenerate = (tone: 'Warm & Hospitable' | 'Empathetic Problem Solver' | 'Executive & Crisp' | 'Luxury Concierge') => {
    setSelectedTone(tone);
    setShowToneDropdown(false);
    onRegenerateAIReply(review.id, tone);
  };

  return (
    <div 
      id={`review-card-${review.id}`}
      className={`bg-white rounded-3xl p-6 border transition-all duration-200 shadow-xs hover:shadow-md ${
        review.status === 'Action Required' 
          ? 'border-amber-300 ring-2 ring-amber-100/60' 
          : 'border-slate-200/90'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Reviewer Profile */}
        <div className="flex items-center gap-3.5">
          {review.reviewerAvatar ? (
            <img 
              src={review.reviewerAvatar} 
              alt={review.reviewerName}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
              {review.reviewerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-base">{review.reviewerName}</h4>
              {review.status === 'Action Required' && (
                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Action Required
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
              {renderPlatformBadge(review.platform)}
              <span>•</span>
              <span className="font-medium text-slate-600">{review.relativeTime}</span>
              <span>•</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                {review.roomOrBooking}
              </span>
              {review.reviewerBadge && (
                <>
                  <span>•</span>
                  <span className="text-[11px] text-slate-400 font-normal">{review.reviewerBadge}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rating and Sentiment Badge */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating 
                    ? 'fill-amber-400 text-amber-400' 
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            ))}
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
            review.sentiment === 'Positive'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : review.sentiment === 'Negative'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {review.sentiment}
          </span>
        </div>
      </div>

      {/* Review Body Text */}
      <div className="mt-4 text-slate-700 text-sm leading-relaxed italic bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <p className="not-italic font-serif text-slate-800 text-[15px] leading-relaxed">
          {review.reviewText}
        </p>
      </div>

      {/* Topic Tags */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {review.topics.map((topic, i) => (
          <span 
            key={i} 
            className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
          >
            #{topic.replace(/\s+/g, '')}
          </span>
        ))}

        {review.guestEmail && (
          <span className="text-[11px] text-slate-400 ml-auto hidden md:inline-flex items-center gap-1">
            <Mail className="w-3 h-3" /> {review.guestEmail}
          </span>
        )}
      </div>

      {/* Response Area */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        {review.status === 'Replied' && review.reply ? (
          /* Replied State */
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle className="w-4 h-4" />
                <span>Replied by Management</span>
                <span className="text-slate-400 font-normal">• {review.reply.replyDate}</span>
              </div>

              <button
                onClick={() => setIsReplyExpanded(!isReplyExpanded)}
                className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
              >
                <span>{isReplyExpanded ? 'Hide Reply' : 'View Reply'}</span>
                {isReplyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isReplyExpanded && (
              <div className="mt-3 p-4 bg-teal-50/40 border border-teal-100 rounded-2xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-950">{review.reply.author} <span className="font-normal text-teal-800">({review.reply.authorRole})</span></span>
                  <span className="text-[11px] text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200/80 font-medium">
                    Published to {review.platform}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {review.reply.text}
                </p>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setReplyDraft(review.reply?.text || '');
                      setIsEditingDraft(true);
                    }}
                    className="text-[11px] font-semibold text-teal-800 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit Published Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Pending / Action Required with AI Suggested Reply */
          <div className="space-y-3">
            {/* AI Suggestion Header Box */}
            <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    Myra AI Suggested Response
                    <span className="text-[10px] bg-teal-800 px-2 py-0.2 rounded-full font-medium text-teal-200">
                      {review.aiSuggestedReply?.confidence ? `${Math.round(review.aiSuggestedReply.confidence * 100)}% Confidence` : '96% Match'}
                    </span>
                  </span>
                  <p className="text-[11px] text-teal-200/80">
                    Tone: <strong className="text-white">{selectedTone}</strong>
                  </p>
                </div>
              </div>

              {/* Tone switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowToneDropdown(!showToneDropdown)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Change Tone</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showToneDropdown && (
                  <div className="absolute right-0 top-8 z-20 w-56 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-1.5 text-xs space-y-1 animate-in fade-in duration-100">
                    <button
                      onClick={() => handleToneChangeAndRegenerate('Warm & Hospitable')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                        selectedTone === 'Warm & Hospitable' ? 'bg-teal-50 text-teal-900 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      🌿 Warm & Hospitable
                    </button>
                    <button
                      onClick={() => handleToneChangeAndRegenerate('Empathetic Problem Solver')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                        selectedTone === 'Empathetic Problem Solver' ? 'bg-teal-50 text-teal-900 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      🤝 Empathetic Problem Solver
                    </button>
                    <button
                      onClick={() => handleToneChangeAndRegenerate('Luxury Concierge')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                        selectedTone === 'Luxury Concierge' ? 'bg-teal-50 text-teal-900 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      👑 Luxury Concierge
                    </button>
                    <button
                      onClick={() => handleToneChangeAndRegenerate('Executive & Crisp')}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                        selectedTone === 'Executive & Crisp' ? 'bg-teal-50 text-teal-900 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      👔 Executive & Crisp
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actionable perk callout */}
            {review.aiSuggestedReply?.actionablePerk && (
              <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl flex items-center gap-2 text-xs text-amber-900">
                <Gift className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Included Recovery Perk:</strong> {review.aiSuggestedReply.actionablePerk}
                </span>
              </div>
            )}

            {/* Draft Reply Area */}
            {isEditingDraft ? (
              <div className="space-y-2">
                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  rows={4}
                  className="w-full text-xs text-slate-800 p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 leading-relaxed font-sans"
                  placeholder="Type your official management response..."
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{replyDraft.length} characters</span>
                  <span>Will be published as <strong>Anand Sharma (GM)</strong></span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-700 leading-relaxed">
                <p>{replyDraft || review.aiSuggestedReply?.text}</p>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingDraft(!isEditingDraft)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingDraft ? 'Preview' : 'Edit Text'}</span>
                </button>

                <button
                  onClick={() => onRegenerateAIReply(review.id, selectedTone)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>

                {/* Cross-system fast action buttons */}
                {review.topics.includes('Wi-Fi') && onCreateMaintenanceFromReview && (
                  <button
                    onClick={() => onCreateMaintenanceFromReview(review)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1 cursor-pointer"
                    title="Create Maintenance Work Order"
                  >
                    <Wrench className="w-3 h-3 text-slate-600" />
                    <span>Create Ticket</span>
                  </button>
                )}

                {review.rating >= 4 && onSendStaffKudos && (
                  <button
                    onClick={() => onSendStaffKudos(review)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-1 cursor-pointer"
                    title="Send Staff Kudos"
                  >
                    <Award className="w-3 h-3 text-emerald-600" />
                    <span>Staff Kudos</span>
                  </button>
                )}
              </div>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-900/10 transition-all cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing to {review.platform}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Reply to {review.platform}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
