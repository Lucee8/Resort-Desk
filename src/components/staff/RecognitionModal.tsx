import React, { useState } from 'react';
import { X, Award, Star, Sparkles, Download, CheckCircle, Send } from 'lucide-react';
import { StaffMember } from '../../types';

interface RecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  triggerToast: (msg: string) => void;
}

export default function RecognitionModal({
  isOpen,
  onClose,
  staff,
  triggerToast
}: RecognitionModalProps) {
  const [awardType, setAwardType] = useState('Champion of the Month');
  const [bonusAmount, setBonusAmount] = useState('3000');
  const [customCitation, setCustomCitation] = useState(
    `For outstanding culinary mastery, consistently delighting resort guests with authentic Konkan flavors, and achieving a 99% turnaround SLA.`
  );
  const [isIssued, setIsIssued] = useState(false);

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    setIsIssued(true);
    triggerToast(`★ Award & ₹${bonusAmount} bonus issued to ${staff.name}!`);
  };

  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0c4a45] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Hospitality Recognition</span>
              <h3 className="font-bold text-base text-white">Award Staff Recognition</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isIssued ? (
          <form onSubmit={handleIssue} className="p-6 flex flex-col gap-4 text-xs font-sans text-slate-700">
            {/* Recipient summary */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className={`w-10 h-10 rounded-full ${staff.avatarBg || 'bg-teal-100 text-teal-800'} flex items-center justify-center font-bold text-sm shrink-0`}>
                {staff.avatar}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{staff.name}</h4>
                <p className="text-[11px] text-slate-500">{staff.role} • {staff.department}</p>
                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{staff.performanceScore.toFixed(2)} / 5.0 Performance Rating</span>
                </div>
              </div>
            </div>

            {/* Award Category Selection */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Award Category</label>
              <select
                value={awardType}
                onChange={(e) => setAwardType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Champion of the Month">🏆 Champion of the Month</option>
                <option value="Culinary Excellence Star">👨‍🍳 Culinary Excellence Star</option>
                <option value="Warmest Hospitality Award">✨ Warmest Hospitality Award</option>
                <option value="Punctuality & Reliability Master">⏰ Punctuality & Reliability Master</option>
                <option value="Guest Delight Hero">🌟 Guest Delight Hero</option>
              </select>
            </div>

            {/* Bonus Amount */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Recognition Cash Bonus (₹)</label>
              <input
                type="number"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-teal-950"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Will be credited directly into August payroll payslip.</span>
            </div>

            {/* Custom Citation */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Personalized Citation & AI Manager Note</label>
              <textarea
                rows={3}
                value={customCitation}
                onChange={(e) => setCustomCitation(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-teal-700 focus:bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Issue Award & Certificate</span>
              </button>
            </div>
          </form>
        ) : (
          /* CERTIFICATE PREVIEW */
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            {/* Elegant Certificate Card */}
            <div className="w-full bg-gradient-to-b from-amber-50 to-amber-100/50 p-6 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                Vanya Boutique Resort • Certificate of Excellence
              </span>
              <h3 className="text-xl font-black text-amber-950 mt-1">{awardType}</h3>
              <p className="text-xs text-slate-600">Proudly Presented To</p>
              <p className="text-lg font-black text-teal-950 font-serif">{staff.name}</p>
              <p className="text-xs text-slate-700 italic max-w-sm mt-1">"{customCitation}"</p>
              <div className="mt-3 pt-3 border-t border-amber-200 w-full flex justify-between text-[11px] font-bold text-amber-900">
                <span>Bonus Credited: ₹{bonusAmount}</span>
                <span>Issued by: Anjali Rao (Resort Manager)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => {
                  triggerToast(`Certificate for ${staff.name} downloaded.`);
                  onClose();
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
