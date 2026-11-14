import React, { useState } from 'react';
import { 
  Plus, 
  Check, 
  Clock, 
  X, 
  CreditCard, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Arrival } from '../types';

interface ArrivalsCardProps {
  arrivals: Arrival[];
  onAddArrival: (newArrival: Omit<Arrival, 'id' | 'avatar'>) => void;
  onCheckIn: (id: string) => void;
  onViewBooking?: (guestName: string, roomNumber: string) => void;
  onNavigateToBookings?: () => void;
}

export default function ArrivalsCard({ 
  arrivals, 
  onAddArrival, 
  onCheckIn, 
  onViewBooking,
  onNavigateToBookings 
}: ArrivalsCardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('02:00 PM');
  const [status, setStatus] = useState<'Arriving' | 'Expected'>('Arriving');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Partial'>('Paid');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !room) return;
    onAddArrival({
      guestName: name,
      roomNumber: room,
      phone: phone || undefined,
      status: status,
      checkInTime: time,
      bookingStatus: 'Confirmed',
      paymentStatus: paymentStatus,
      amountDue: paymentStatus === 'Paid' ? 0 : 4500
    });
    // Reset state
    setName('');
    setRoom('');
    setPhone('');
    setTime('02:00 PM');
    setStatus('Arriving');
    setPaymentStatus('Paid');
    setShowAddForm(false);
  };

  const checkedInCount = arrivals.filter(a => a.status === 'Checked In').length;

  return (
    <div id="arrivals-card" className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs flex flex-col justify-between font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">Today's Arrivals</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-100">
                {checkedInCount}/{arrivals.length} In
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Mykonos Cottage check-in schedule</p>
          </div>
          <button 
            id="arrivals-viewall-btn"
            type="button"
            onClick={() => onNavigateToBookings?.()}
            className="text-xs text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Guest List */}
        <div className="mt-3.5 flex flex-col gap-2.5 max-h-[310px] overflow-y-auto pr-1">
          {arrivals.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No arrivals scheduled for today.
            </div>
          ) : (
            arrivals.map((guest) => {
              const isCheckedIn = guest.status === 'Checked In';
              const isArriving = guest.status === 'Arriving';
              const isPaid = (guest.paymentStatus || 'Paid') === 'Paid';
              const isPartial = guest.paymentStatus === 'Partial';

              return (
                <div 
                  id={`arrival-item-${guest.id}`}
                  key={guest.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-2.5 group"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar with initials */}
                    <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-xs font-bold text-teal-800 border border-teal-200 shrink-0">
                      {guest.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{guest.guestName}</h4>
                        {/* Booking Status Badge */}
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                          (guest.bookingStatus || 'Confirmed') === 'Confirmed'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {guest.bookingStatus || 'Confirmed'}
                        </span>
                      </div>
                      
                      {/* Room & Time & Payment Subtext */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-slate-500 font-medium">
                        <span className="font-semibold text-slate-700">Cottage {guest.roomNumber}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {guest.checkInTime || '02:00 PM'}
                        </span>
                        <span>•</span>
                        {/* Payment Status Pill */}
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : isPartial 
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-rose-50 text-rose-700'
                        }`}>
                          <CreditCard className="w-2.5 h-2.5" />
                          {isPaid ? 'Paid' : isPartial ? `Due ₹${guest.amountDue || 3500}` : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* View Booking details button */}
                    <button
                      type="button"
                      title="View Booking"
                      onClick={() => onViewBooking ? onViewBooking(guest.guestName, guest.roomNumber) : onNavigateToBookings?.()}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-teal-900 bg-white border border-slate-200/80 hover:border-teal-300 transition-colors cursor-pointer"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    {/* Status badge / interactive check-in trigger */}
                    {isCheckedIn ? (
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Checked In
                      </span>
                    ) : (
                      <button
                        id={`checkin-btn-${guest.id}`}
                        onClick={() => onCheckIn(guest.id)}
                        title="Click to process guest check-in"
                        className={`text-[10px] px-3 py-1 rounded-full font-bold transition-all duration-200 cursor-pointer shadow-2xs ${
                          isArriving 
                            ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                            : 'bg-teal-800 hover:bg-teal-900 text-white'
                        }`}
                      >
                        Check-in Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Actions / Add Arrival Inline Form */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {!showAddForm ? (
          <button
            id="btn-add-arrival-trigger"
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-200 hover:border-teal-700/50 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-800 transition-colors bg-white hover:bg-teal-50/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-700" />
            <span>Add Expected Arrival</span>
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">New Arrival Entry</span>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <input
                id="add-arrival-name"
                type="text"
                required
                placeholder="Guest Full Name (e.g. Ramesh Kulkarni)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-teal-700"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="add-arrival-room"
                  type="text"
                  required
                  placeholder="Cottage No. (e.g. 104)"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-teal-700"
                />
                <input
                  id="add-arrival-time"
                  type="text"
                  placeholder="ETA (e.g. 02:00 PM)"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-teal-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  id="add-arrival-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Arriving' | 'Expected')}
                  className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-teal-700"
                >
                  <option value="Arriving">Status: Arriving</option>
                  <option value="Expected">Status: Expected</option>
                </select>
                <select
                  id="add-arrival-payment"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Pending' | 'Partial')}
                  className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-teal-700"
                >
                  <option value="Paid">Payment: Paid</option>
                  <option value="Partial">Payment: Partial Due</option>
                  <option value="Pending">Payment: Unpaid</option>
                </select>
              </div>
              <input
                id="add-arrival-phone"
                type="tel"
                placeholder="Mobile (+91 98XXX XXXXX)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-teal-700"
              />
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-teal-800 text-white rounded-lg text-xs font-bold hover:bg-teal-900"
                >
                  Confirm Arrival
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
