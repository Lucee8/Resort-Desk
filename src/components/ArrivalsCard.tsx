import React, { useState } from 'react';
import { Plus, Check, MapPin, UserPlus, Phone, X } from 'lucide-react';
import { Arrival } from '../types';

interface ArrivalsCardProps {
  arrivals: Arrival[];
  onAddArrival: (newArrival: Omit<Arrival, 'id' | 'avatar'>) => void;
  onCheckIn: (id: string) => void;
}

export default function ArrivalsCard({ arrivals, onAddArrival, onCheckIn }: ArrivalsCardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Arriving' | 'Expected'>('Arriving');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !room) return;
    onAddArrival({
      guestName: name,
      roomNumber: room,
      phone: phone || undefined,
      status: status
    });
    // Reset state
    setName('');
    setRoom('');
    setPhone('');
    setStatus('Arriving');
    setShowAddForm(false);
  };

  return (
    <div id="arrivals-card" className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between min-h-[380px] font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Today's Arrivals</h3>
          <button 
            id="arrivals-viewall-btn"
            onClick={() => alert("Showing all active guest list!")}
            className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
          >
            View All
          </button>
        </div>

        {/* Guest List */}
        <div className="mt-4 flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
          {arrivals.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No arrivals scheduled for today.
            </div>
          ) : (
            arrivals.map((guest) => {
              const isCheckedIn = guest.status === 'Checked In';
              const isArriving = guest.status === 'Arriving';
              
              return (
                <div 
                  id={`arrival-item-${guest.id}`}
                  key={guest.id} 
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar with initials */}
                    <div className="w-9 h-9 rounded-full bg-slate-150 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                      {guest.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{guest.guestName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Room {guest.roomNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status badge / interactive checkin trigger */}
                    {isCheckedIn ? (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Checked In
                      </span>
                    ) : (
                      <button
                        id={`checkin-btn-${guest.id}`}
                        onClick={() => onCheckIn(guest.id)}
                        title="Click to Check-in guest"
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all duration-200 ${
                          isArriving 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-600 hover:text-white hover:border-amber-600' 
                            : 'bg-slate-100 text-slate-600 hover:bg-teal-700 hover:text-white'
                        }`}
                      >
                        {isArriving ? 'Arriving' : 'Expected'}
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
      <div className="mt-4 pt-3 border-t border-slate-50">
        {!showAddForm ? (
          <button
            id="btn-add-arrival-trigger"
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-200 hover:border-teal-700/50 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-teal-800 transition-colors bg-white hover:bg-teal-50/20"
          >
            <Plus className="w-4 h-4" />
            Add arrival
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Arrival Details</span>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <input
                id="add-arrival-name"
                type="text"
                required
                placeholder="Guest Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-teal-700"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="add-arrival-room"
                  type="text"
                  required
                  placeholder="Room No."
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-teal-700"
                />
                <select
                  id="add-arrival-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Arriving' | 'Expected')}
                  className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-teal-700"
                >
                  <option value="Arriving">Arriving</option>
                  <option value="Expected">Expected</option>
                </select>
              </div>
              <input
                id="add-arrival-phone"
                type="tel"
                placeholder="Phone (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-teal-700"
              />
              <button
                id="btn-add-arrival-submit"
                type="submit"
                className="w-full py-1.5 bg-teal-800 text-white rounded-lg text-xs font-bold hover:bg-teal-900 transition-colors shadow-sm"
              >
                Confirm Booking & Arrival
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
