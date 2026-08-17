import React, { useState } from 'react';
import { X, Wrench, Award, Gift, Check, Sparkles, Send } from 'lucide-react';
import { ReviewAIInsight, ReviewItem } from '../../types';

interface ReviewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight?: ReviewAIInsight | null;
  review?: ReviewItem | null;
  actionType: 'maintenance' | 'staff' | 'recovery_offer' | 'operations';
  triggerToast: (msg: string) => void;
}

export default function ReviewActionModal({
  isOpen,
  onClose,
  insight,
  review,
  actionType,
  triggerToast
}: ReviewActionModalProps) {
  // Maintenance form
  const [roomArea, setRoomArea] = useState(
    insight?.prefilledData?.roomNumber || review?.roomOrBooking || 'Hillside Cottages #104-108'
  );
  const [maintenanceCategory, setMaintenanceCategory] = useState(
    insight?.prefilledData?.category || 'Electrical / Wi-Fi Networking'
  );
  const [maintenanceNotes, setMaintenanceNotes] = useState(
    insight?.description || review?.reviewText || 'Guest reported Wi-Fi outage during working holiday. High priority mesh router upgrade required.'
  );

  // Staff commendation form
  const [staffName, setStaffName] = useState(
    insight?.prefilledData?.staffName || 'Chef Rajesh & Server Sunita'
  );
  const [bonusAmount, setBonusAmount] = useState('2500');
  const [commendationMessage, setCommendationMessage] = useState(
    'Outstanding guest feedback for authentic coastal Malvani thali and attentive dining hospitality.'
  );

  // Recovery voucher form
  const [guestName, setGuestName] = useState(
    insight?.prefilledData?.guestName || review?.reviewerName || 'Marcus Thorne'
  );
  const [guestEmail, setGuestEmail] = useState(
    insight?.prefilledData?.guestEmail || review?.guestEmail || 'marcus.thorne@enterprise.io'
  );
  const [recoveryOffer, setRecoveryOffer] = useState(
    'Complimentary Luxury Villa Upgrade + 25% Off Next Stay + Private 5G Mesh Router'
  );
  const [personalNote, setPersonalNote] = useState(
    'Dear Marcus, Anand Sharma (GM) here. We have taken immediate action to resolve the Wi-Fi in the Deluxe Wing and would be honored to host you again with our compliments.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === 'maintenance') {
      triggerToast(`Maintenance work order dispatched for ${roomArea}! Assigned to IT & Engineering team.`);
    } else if (actionType === 'staff') {
      triggerToast(`Staff Kudos & ₹${bonusAmount} reward successfully logged for ${staffName}!`);
    } else if (actionType === 'recovery_offer') {
      triggerToast(`Personalized recovery email and VIP voucher dispatched to ${guestEmail}!`);
    } else {
      triggerToast(`Operational recommendation logged to Resort SOP workflow.`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="review-action-modal"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
              actionType === 'maintenance' 
                ? 'bg-amber-600' 
                : actionType === 'staff' 
                  ? 'bg-emerald-600' 
                  : 'bg-teal-800'
            }`}>
              {actionType === 'maintenance' && <Wrench className="w-4 h-4" />}
              {actionType === 'staff' && <Award className="w-4 h-4" />}
              {actionType === 'recovery_offer' && <Gift className="w-4 h-4" />}
              {actionType === 'operations' && <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base capitalize">
                {actionType === 'maintenance' && 'Create Maintenance Ticket'}
                {actionType === 'staff' && 'Send Staff Commendation & Kudos'}
                {actionType === 'recovery_offer' && 'Dispatch Guest Recovery VIP Offer'}
                {actionType === 'operations' && 'Review Operational Action'}
              </h3>
              <p className="text-xs text-slate-500">Cross-system resolution powered by ResortDesk AI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {actionType === 'maintenance' && (
            <>
              <div>
                <label className="font-bold text-slate-900 block mb-1">Room or Sector</label>
                <input
                  type="text"
                  value={roomArea}
                  onChange={(e) => setRoomArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Category & System</label>
                <input
                  type="text"
                  value={maintenanceCategory}
                  onChange={(e) => setMaintenanceCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Issue Description & Telemetry Notes</label>
                <textarea
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>
            </>
          )}

          {actionType === 'staff' && (
            <>
              <div>
                <label className="font-bold text-slate-900 block mb-1">Staff Member(s)</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Spot Reward Incentive (₹ INR)</label>
                <input
                  type="number"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Commendation Certificate Note</label>
                <textarea
                  value={commendationMessage}
                  onChange={(e) => setCommendationMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>
            </>
          )}

          {actionType === 'recovery_offer' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Guest Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Recovery Offer & Voucher Details</label>
                <input
                  type="text"
                  value={recoveryOffer}
                  onChange={(e) => setRecoveryOffer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Executive Apology Note</label>
                <textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>
            </>
          )}

          {actionType === 'operations' && (
            <div className="space-y-3">
              <p className="text-slate-600 leading-relaxed">
                {insight?.description || 'Staggered breakfast slots and additional live live food stations recommended for Saturday & Sunday mornings.'}
              </p>
              <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl text-teal-900 font-semibold">
                Action: {insight?.suggestedAction}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
