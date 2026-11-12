import React, { useState } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Radio, 
  MapPin, 
  Flame, 
  Cross, 
  UserCheck,
  X,
  Send
} from 'lucide-react';
import { EmergencyContactItem } from '../../types';

interface EmergencySafetySectionProps {
  contacts: EmergencyContactItem[];
  onAddContact: (item: EmergencyContactItem) => void;
  onDeleteContact: (id: string) => void;
  triggerToast?: (msg: string) => void;
}

export default function EmergencySafetySection({
  contacts,
  onAddContact,
  onDeleteContact,
  triggerToast
}: EmergencySafetySectionProps) {
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Form states for new contact
  const [newType, setNewType] = useState<'Police' | 'Fire' | 'Hospital' | 'Doctor' | 'Security'>('Police');
  const [newName, setNewName] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAltPhone, setNewAltPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Form state for broadcast
  const [broadcastMessage, setBroadcastMessage] = useState(
    'URGENT SAFETY ADVISORY: Please remain inside your villas/rooms while resort security verifies the beach weather advisory. Front Desk is available on Ext 0.'
  );

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const newContact: EmergencyContactItem = {
      id: `em-${Date.now()}`,
      type: newType,
      name: newName,
      organization: newOrg,
      phone: newPhone,
      alternatePhone: newAltPhone,
      address: newAddress,
      isPrimary: false
    };

    onAddContact(newContact);
    if (triggerToast) triggerToast(`Emergency contact "${newName}" added to property directory.`);
    setNewName('');
    setNewOrg('');
    setNewPhone('');
    setNewAltPhone('');
    setNewAddress('');
    setShowAddContactModal(false);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setShowBroadcastModal(false);
      if (triggerToast) triggerToast('Emergency mass advisory dispatched to 142 in-house guests and 42 active staff.');
    }, 1500);
  };

  return (
    <div id="settings-emergency-safety-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header & Mass Broadcast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Emergency Contacts & Property Safety</h2>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full border border-rose-200 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> 24/7 Rapid SOS Protocol
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified local emergency services, designated on-call doctors, and emergency broadcast dispatchers for guests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBroadcastModal(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Broadcast Mass SOS</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddContactModal(true)}
            className="px-3.5 py-2 bg-teal-900 hover:bg-teal-950 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* 2. Contacts Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-teal-700/40 transition-all flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                    {contact.type === 'Police' ? '👮' :
                     contact.type === 'Fire' ? '🚒' :
                     contact.type === 'Hospital' ? '🏥' :
                     contact.type === 'Doctor' ? '🩺' : '🛡️'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{contact.name}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{contact.organization}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md uppercase">
                  {contact.type}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mt-3 text-xs">
                <div className="flex items-center gap-2 font-mono font-bold text-teal-950 bg-teal-50/70 p-2.5 rounded-xl border border-teal-100">
                  <PhoneCall className="w-3.5 h-3.5 text-teal-800 shrink-0" />
                  <span>{contact.phone}</span>
                  {contact.alternatePhone && (
                    <span className="text-slate-400 font-normal">/ {contact.alternatePhone}</span>
                  )}
                </div>

                {contact.address && (
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-500 px-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{contact.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onDeleteContact(contact.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                title="Delete Contact"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Add Contact */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-teal-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm">Add Emergency SOS Contact</h3>
              </div>
              <button onClick={() => setShowAddContactModal(false)} className="text-teal-200 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Service Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                >
                  <option value="Police">Police Department</option>
                  <option value="Fire">Fire & Rescue</option>
                  <option value="Hospital">24/7 Hospital / Ambulance</option>
                  <option value="Doctor">On-Call Physician</option>
                  <option value="Security">Chief Security Officer</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Contact / Officer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mapusa District Hospital"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Organization / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Directorate of Health Services"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Primary Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 832..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Alternate Phone</label>
                  <input
                    type="text"
                    placeholder="108 / 112"
                    value={newAltPhone}
                    onChange={(e) => setNewAltPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  placeholder="Street / Region"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl text-xs font-semibold hover:bg-teal-950 shadow-sm cursor-pointer"
                >
                  Save Emergency Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Mass Broadcast */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-rose-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
                <h3 className="font-bold text-sm">Broadcast Mass Emergency Alert</h3>
              </div>
              <button onClick={() => setShowBroadcastModal(false)} className="text-rose-300 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="p-6 flex flex-col gap-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <span>
                  This will dispatch an urgent WhatsApp template and high-priority SMS blast to all currently checked-in guests and on-duty staff.
                </span>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Advisory Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-rose-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBroadcasting ? 'Broadcasting Alert...' : 'Dispatch Property Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
