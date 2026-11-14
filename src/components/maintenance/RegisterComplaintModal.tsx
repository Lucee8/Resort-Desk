import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Trash2,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceTicket,
  Technician,
  MaintenanceAttachment,
  RoomUnit,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatShortDate, getTodayISO } from '../../utils/bookingUtils';

interface RegisterComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newTicket: MaintenanceTicket) => void | Promise<void>;
  technicians: Technician[];
  rooms?: RoomUnit[];
}

export default function RegisterComplaintModal({
  isOpen,
  onClose,
  onSubmit,
  technicians,
  rooms = [],
}: RegisterComplaintModalProps) {
  const { user } = useAuth();
  const operatorName =
    user?.displayName || user?.email?.split('@')[0] || 'Mykonos Staff';

  const defaultRoom = rooms[0]
    ? `${rooms[0].roomName} (#${rooms[0].roomNumber})`
    : 'Cottage 101';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory>('HVAC');
  const [description, setDescription] = useState('');
  const [roomNumber, setRoomNumber] = useState(defaultRoom);
  const [area, setArea] = useState('Main Cottage / Bath');
  const [priority, setPriority] = useState<MaintenancePriority>('High');
  const [reportedBy, setReportedBy] = useState(operatorName);
  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>(
    technicians[0]?.id || ''
  );
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState('45 mins');
  const [isRoomBlocked, setIsRoomBlocked] = useState(true);
  const [partsCost, setPartsCost] = useState('0');
  const [laborCost, setLaborCost] = useState('400');
  const [attachments, setAttachments] = useState<MaintenanceAttachment[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories: MaintenanceCategory[] = [
    'HVAC',
    'Plumbing',
    'Electrical',
    'Furniture',
    'Door & Lock',
    'Internet/Wi-Fi',
    'Appliance',
    'Civil/Structural',
    'Cleaning Equipment',
    'Other',
  ];

  const priorities: MaintenancePriority[] = ['Emergency', 'High', 'Medium', 'Low'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : '#';
    setAttachments((prev) => [
      ...prev,
      {
        id: `att-${Date.now()}`,
        name: file.name,
        url: previewUrl,
        type: isImage ? 'image' : 'doc',
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      },
    ]);
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!title.trim() || !roomNumber.trim()) {
      setErrorMsg('Please fill out both the Issue Title and Cottage / Facility.');
      return;
    }

    const assignedTech = technicians.find((t) => t.id === assignedTechnicianId);
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newTicket: MaintenanceTicket = {
      id: `TKT-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      category,
      description: description.trim() || 'No detailed description provided.',
      roomNumber: roomNumber.trim(),
      area: area.trim(),
      priority,
      status: assignedTech ? 'Assigned' : 'Reported',
      reportedBy: reportedBy.trim() || operatorName,
      reportedDate: `Today, ${formatShortDate(getTodayISO())}`,
      reportedTime: nowTime,
      assignedTechnicianId: assignedTech?.id,
      assignedTechnicianName: assignedTech?.name,
      assignedTechnicianAvatar: assignedTech?.avatar,
      assignedDepartment: assignedTech?.department,
      estimatedCompletionTime,
      isRoomBlocked,
      cost: {
        parts: Number(partsCost) || 0,
        labor: Number(laborCost) || 0,
        vendor: 0,
        total: (Number(partsCost) || 0) + (Number(laborCost) || 0),
      },
      attachments,
      timeline: [
        {
          id: `tm-${Date.now()}-1`,
          title: 'Ticket Created',
          time: nowTime,
          author: reportedBy.trim() || operatorName,
          note: `Registered with ${priority} priority`,
          done: true,
        },
        ...(assignedTech
          ? [
              {
                id: `tm-${Date.now()}-2`,
                title: `Assigned to ${assignedTech.name}`,
                time: nowTime,
                author: 'ResortDesk Dispatch',
                note: `${assignedTech.department} technician assigned`,
                done: true,
              },
            ]
          : []),
      ],
      parts:
        Number(partsCost) > 0
          ? [
              {
                id: `part-${Date.now()}`,
                name: `${category} Service Parts`,
                quantity: 1,
                cost: Number(partsCost),
                status: 'In Stock',
              },
            ]
          : [],
    };

    setSubmitting(true);
    try {
      await onSubmit(newTicket);
      setTitle('');
      setDescription('');
      setAttachments([]);
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to save work order to Firestore.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Register Maintenance Complaint
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Log a work order for Mykonos Cottage, Tarkarli
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="overflow-y-auto p-6 space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-700" />
              Complaint Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Issue Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Split AC condensate drain leak"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Priority Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-bold focus:ring-2 ${
                    priority === 'Emergency'
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : priority === 'High'
                        ? 'bg-orange-50 border-orange-300 text-orange-800'
                        : priority === 'Medium'
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p} Priority
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cottage / Room / Facility <span className="text-rose-500">*</span>
                </label>
                {rooms.length > 0 ? (
                  <select
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={`${r.roomName} (#${r.roomNumber})`}>
                        {r.roomName} (#{r.roomNumber}) — {r.status}
                      </option>
                    ))}
                    <option value="Pool & Courtyard Deck">Pool &amp; Courtyard Deck</option>
                    <option value="Main Reception & Dining">Main Reception &amp; Dining</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cottage 101 or Pool Deck"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific Area / Fixture
                </label>
                <input
                  type="text"
                  placeholder="e.g. En-suite, Veranda, Main Door"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Problem Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe symptoms, guest observations, or inspection notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reported By
                </label>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  id="chk-block-room"
                  type="checkbox"
                  checked={isRoomBlocked}
                  onChange={(e) => setIsRoomBlocked(e.target.checked)}
                  className="w-4 h-4 text-teal-800 border-slate-300 rounded focus:ring-teal-700"
                />
                <label
                  htmlFor="chk-block-room"
                  className="text-xs font-bold text-slate-800 cursor-pointer"
                >
                  Block Cottage in PMS (Sets room to Maintenance)
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-700" />
              Technician Assignment &amp; Estimates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Technician
                </label>
                <select
                  value={assignedTechnicianId}
                  onChange={(e) => setAssignedTechnicianId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                >
                  <option value="">Leave Unassigned in Triage</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} ({tech.department} - {tech.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Resolution
                </label>
                <select
                  value={estimatedCompletionTime}
                  onChange={(e) => setEstimatedCompletionTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                >
                  <option value="20 mins">20 mins (Quick fix)</option>
                  <option value="45 mins">45 mins (Standard)</option>
                  <option value="1.5 hours">1.5 hours (Intermediate)</option>
                  <option value="3 hours">3 hours (Major / Vendor)</option>
                  <option value="Next Day">Next Day (Parts ordered)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Est. Parts Cost (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={partsCost}
                  onChange={(e) => setPartsCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-700" />
                Attachments
              </h4>
              <label className="text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200/80 cursor-pointer">
                + Attach File / Photo
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {attachments.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-4 text-center text-slate-400">
                <UploadCloud className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <p className="text-xs">Optional: Attach photo or diagnostic document.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {att.type === 'image' ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{att.name}</p>
                        <p className="text-[10px] text-slate-400">{att.size || 'Attached'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              {submitting ? 'Saving Ticket...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
