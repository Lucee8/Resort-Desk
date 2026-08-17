import React, { useState } from 'react';
import { X, Building2, Calendar, Clock, DollarSign, Wrench, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ScheduleVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVendorScheduled: (vendorDetails: any) => void;
}

export default function ScheduleVendorModal({
  isOpen,
  onClose,
  onVendorScheduled
}: ScheduleVendorModalProps) {
  const [vendorName, setVendorName] = useState('Daikin HVAC Commercial Services');
  const [trade, setTrade] = useState('Central VRV / Inverter Air Conditioning');
  const [roomArea, setRoomArea] = useState('Deluxe Villa #104 / HVAC Plant A');
  const [scheduledDate, setScheduledDate] = useState('2026-10-25');
  const [scheduledTime, setScheduledTime] = useState('11:00 AM');
  const [estimatedCost, setEstimatedCost] = useState('4500');
  const [isEmergency, setIsEmergency] = useState(false);
  const [notes, setNotes] = useState('Major compressor diagnostic and refrigerant coil pressure test.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVendorScheduled({
      vendorName,
      trade,
      roomArea,
      scheduledDate,
      scheduledTime,
      estimatedCost,
      isEmergency,
      notes
    });
    alert(`External vendor appointment scheduled with ${vendorName} for ${scheduledDate} at ${scheduledTime}.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Schedule External Vendor
              </h3>
              <p className="text-xs text-slate-500">
                Book certified 3rd-party engineering or OEM contractors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Vendor Company Name <span className="text-rose-500">*</span>
            </label>
            <select
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
            >
              <option value="Daikin HVAC Commercial Services">Daikin HVAC Commercial Services</option>
              <option value="Kohler Commercial Sanitary Engineering">Kohler Commercial Sanitary Engineering</option>
              <option value="Schneider Electric Facility Services">Schneider Electric Facility Services</option>
              <option value="Pentair Pool Automation Systems">Pentair Pool Automation Systems</option>
              <option value="Dormakaba RFID Lock Systems">Dormakaba RFID Lock Systems</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contractor Trade / Specialty
            </label>
            <input
              type="text"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Location / Villa / Facility
            </label>
            <input
              type="text"
              value={roomArea}
              onChange={(e) => setRoomArea(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Arrival Window
              </label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="e.g. 11:00 AM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Estimated Vendor Quote (₹ / $)
            </label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Scope of Work & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="chk-emergency-vendor"
              type="checkbox"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
            />
            <label htmlFor="chk-emergency-vendor" className="text-xs font-bold text-slate-800">
              Emergency Dispatch (Trigger VIP priority gate pass)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Confirm Dispatch
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
