import React, { useState, useRef } from 'react';
import {
  X,
  MapPin,
  Phone,
  CheckCircle2,
  Package,
  Camera,
  Plus,
  Send,
  Loader2,
} from 'lucide-react';
import {
  MaintenanceTicket,
  MaintenanceStatus,
  Technician,
  MaintenanceTimelineEvent,
  MaintenancePart,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { uploadMaintenancePhoto } from '../../services/resortDataService';

interface TicketDetailDrawerProps {
  ticket: MaintenanceTicket | null;
  isOpen: boolean;
  onClose: () => void;
  technicians: Technician[];
  onUpdateTicket: (updated: MaintenanceTicket) => void | Promise<void>;
  onCloseTicket: (ticketId: string) => void | Promise<void>;
  onOpenRadio?: (techName?: string) => void;
  onNotify?: (msg: string) => void;
}

export default function TicketDetailDrawer({
  ticket,
  isOpen,
  onClose,
  technicians,
  onUpdateTicket,
  onCloseTicket,
  onOpenRadio,
  onNotify,
}: TicketDetailDrawerProps) {
  const { user } = useAuth();
  const operatorName =
    user?.displayName || user?.email?.split('@')[0] || 'Mykonos Ops';

  const [newNote, setNewNote] = useState('');
  const [selectedTechId, setSelectedTechId] = useState(
    ticket?.assignedTechnicianId || ''
  );
  const [newPartName, setNewPartName] = useState('');
  const [newPartCost, setNewPartCost] = useState('');
  const [showAddPart, setShowAddPart] = useState(false);
  const [repairPhoto, setRepairPhoto] = useState(ticket?.repairPhotoUrl || '');
  const [confirmClose, setConfirmClose] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (ticket) {
      setSelectedTechId(ticket.assignedTechnicianId || '');
      setRepairPhoto(ticket.repairPhotoUrl || '');
      setConfirmClose(false);
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const assignedTechObj = technicians.find(
    (t) => t.id === ticket.assignedTechnicianId || t.name === ticket.assignedTechnicianName
  );

  const handleStatusChange = (newStatus: MaintenanceStatus) => {
    const updatedTimeline: MaintenanceTimelineEvent[] = [
      ...ticket.timeline,
      {
        id: `tm-${Date.now()}`,
        title: `Status Changed to ${newStatus}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: operatorName,
        note: `Workflow transitioned to ${newStatus}`,
        done: true,
      },
    ];

    const updated: MaintenanceTicket = {
      ...ticket,
      status: newStatus,
      timeline: updatedTimeline,
      actualResolutionTime:
        newStatus === 'Resolved' || newStatus === 'Closed'
          ? ticket.actualResolutionTime || '35 mins'
          : ticket.actualResolutionTime,
      isRoomBlocked:
        newStatus === 'Closed' || newStatus === 'Resolved'
          ? false
          : ticket.isRoomBlocked,
    };

    void onUpdateTicket(updated);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const updatedTimeline: MaintenanceTimelineEvent[] = [
      ...ticket.timeline,
      {
        id: `tm-${Date.now()}`,
        title: 'Staff Work Log Note',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: operatorName,
        note: newNote.trim(),
        done: true,
      },
    ];

    void onUpdateTicket({
      ...ticket,
      timeline: updatedTimeline,
    });

    setNewNote('');
  };

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    const cost = Number(newPartCost) || 0;
    const newPart: MaintenancePart = {
      id: `prt-${Date.now()}`,
      name: newPartName.trim(),
      quantity: 1,
      cost,
      status: 'In Stock',
    };

    const currentParts = ticket.parts || [];
    const updatedParts = [...currentParts, newPart];
    const newTotalPartsCost = ticket.cost.parts + cost;

    void onUpdateTicket({
      ...ticket,
      parts: updatedParts,
      cost: {
        ...ticket.cost,
        parts: newTotalPartsCost,
        total: newTotalPartsCost + ticket.cost.labor + ticket.cost.vendor,
      },
    });

    setNewPartName('');
    setNewPartCost('');
    setShowAddPart(false);
  };

  const handleReassignTech = (techId: string) => {
    setSelectedTechId(techId);
    const tech = technicians.find((t) => t.id === techId);
    if (!tech) return;

    const updatedTimeline: MaintenanceTimelineEvent[] = [
      ...ticket.timeline,
      {
        id: `tm-${Date.now()}`,
        title: `Reassigned to ${tech.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: operatorName,
        note: `${tech.department} technician dispatched`,
        done: true,
      },
    ];

    void onUpdateTicket({
      ...ticket,
      assignedTechnicianId: tech.id,
      assignedTechnicianName: tech.name,
      assignedTechnicianAvatar: tech.avatar,
      assignedDepartment: tech.department,
      status: ticket.status === 'Reported' ? 'Assigned' : ticket.status,
      timeline: updatedTimeline,
    });
  };

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const downloadUrl = await uploadMaintenancePhoto(ticket.id, file);
      setRepairPhoto(downloadUrl);
      await onUpdateTicket({
        ...ticket,
        repairPhotoUrl: downloadUrl,
        timeline: [
          ...ticket.timeline,
          {
            id: `tm-${Date.now()}`,
            title: 'Repair Verification Photo Uploaded',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            author: ticket.assignedTechnicianName || operatorName,
            note: 'Post-repair photo evidence uploaded to Firebase Storage.',
            done: true,
          },
        ],
      });
      onNotify?.(`Repair evidence uploaded for ${ticket.id}`);
    } catch (err) {
      onNotify?.(
        err instanceof Error
          ? err.message
          : 'Failed to upload photo to Firebase Storage.'
      );
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end font-sans">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200/80 bg-slate-50 flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {ticket.id}
              </span>
              <span
                className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                  ticket.priority === 'Emergency'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : ticket.priority === 'High'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : ticket.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {ticket.priority} Priority
              </span>
              <span
                className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                  ticket.status === 'In Progress'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : ticket.status === 'Waiting for Parts'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : ticket.status === 'Resolved' || ticket.status === 'Closed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {ticket.status}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-2 leading-tight">
              {ticket.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">{ticket.roomNumber}</span>
              {ticket.area && <span>• {ticket.area}</span>}
              <span>
                • Reported {ticket.reportedDate} at {ticket.reportedTime}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Status Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Workflow Stage
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{ticket.status}</p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleStatusChange('In Progress')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ticket.status === 'In Progress'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-800'
                }`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('Waiting for Parts')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ticket.status === 'Waiting for Parts'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-800'
                }`}
              >
                Waiting for Parts
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('Resolved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ticket.status === 'Resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                Resolve
              </button>
              <button
                type="button"
                onClick={() => setConfirmClose(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white transition-all shadow-xs cursor-pointer"
              >
                Verify &amp; Close
              </button>
            </div>
          </div>

          {/* Issue Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Problem Description &amp; Findings
            </h3>
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed">
              {ticket.description}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Category
                </span>
                <span className="text-xs font-bold text-slate-800">{ticket.category}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Reported By
                </span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {ticket.reportedBy}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Room Status
                </span>
                <span
                  className={`text-xs font-bold ${
                    ticket.isRoomBlocked ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {ticket.isRoomBlocked ? 'Blocked in PMS' : 'Guest Ready'}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Est. Duration
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {ticket.estimatedCompletionTime || '45 mins'}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Technician Box */}
          <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                Assigned Technician
              </h3>
              <select
                value={selectedTechId}
                onChange={(e) => handleReassignTech(e.target.value)}
                className="text-xs bg-white border border-teal-300 rounded-lg px-2.5 py-1 text-teal-900 font-medium focus:ring-1 focus:ring-teal-700"
              >
                <option value="">Select Technician...</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.department})
                  </option>
                ))}
              </select>
            </div>

            {ticket.assignedTechnicianName ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      ticket.assignedTechnicianAvatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={ticket.assignedTechnicianName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-teal-700/20"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {ticket.assignedTechnicianName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {ticket.assignedDepartment || 'Maintenance Staff'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {assignedTechObj?.phone && (
                    <a
                      href={`tel:${assignedTechObj.phone.replace(/\s+/g, '')}`}
                      className="px-3 py-1.5 bg-white border border-teal-200 text-teal-900 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-teal-50"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenRadio?.(ticket.assignedTechnicianName)}
                    className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Chat</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-1">
                No technician currently assigned to this work order.
              </div>
            )}
          </div>

          {/* Parts & Cost */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Parts &amp; Maintenance Costs
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPart(!showAddPart)}
                className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Part</span>
              </button>
            </div>

            {showAddPart && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Part name (e.g. Siphon Pipe 1.5m)"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="number"
                  placeholder="Cost (₹)"
                  value={newPartCost}
                  onChange={(e) => setNewPartCost(e.target.value)}
                  className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPart}
                  className="px-3 py-1.5 bg-teal-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}

            {ticket.parts && ticket.parts.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {ticket.parts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 flex items-center justify-between bg-white text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">
                        {p.name} (Qty: {p.quantity})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">
                        ₹{p.cost.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'In Stock'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No inventory parts logged for this ticket yet.
              </p>
            )}

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600">Total Work Order Cost:</span>
              <span className="text-base text-teal-900 font-mono">
                ₹{(ticket.cost.total || ticket.cost.parts + ticket.cost.labor).toLocaleString('en-IN')}
                <span className="text-[10px] text-slate-400 font-normal ml-1.5">
                  (Parts: ₹{ticket.cost.parts} + Labor: ₹{ticket.cost.labor})
                </span>
              </span>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Activity Timeline &amp; Work Log
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {ticket.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative">
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                      event.done
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {event.title}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {event.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
                      By {event.author}
                    </p>
                    {event.note && (
                      <p className="text-xs text-slate-600 mt-1 italic bg-white p-2 rounded border border-slate-100">
                        &ldquo;{event.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Log a technician update or inspection note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-teal-700"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>
            </form>
          </div>

          {/* Photo Verification Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-teal-700" />
                <span>Photo Verification Evidence</span>
              </h3>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => void handlePhotoFileUpload(e)}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => photoInputRef.current?.click()}
                className="text-xs font-bold text-teal-800 hover:underline bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                {uploadingPhoto && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{uploadingPhoto ? 'Uploading...' : '+ Upload Repair Photo'}</span>
              </button>
            </div>

            {repairPhoto ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-48">
                <img
                  src={repairPhoto}
                  alt="Repair Evidence"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-bold rounded">
                  Verified by {ticket.assignedTechnicianName || operatorName}
                </span>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-white">
                <Camera className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs text-slate-400">
                  No completion photo uploaded yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          {confirmClose ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-emerald-900">
                Close ticket &amp; release cottage to PMS?
              </span>
              <button
                type="button"
                onClick={() => {
                  void onCloseTicket(ticket.id);
                  setConfirmClose(false);
                  onClose();
                }}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Confirm Close
              </button>
              <button
                type="button"
                onClick={() => setConfirmClose(false)}
                className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={ticket.status === 'Closed'}
              onClick={() => setConfirmClose(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {ticket.status === 'Closed'
                  ? 'Ticket Closed'
                  : 'Complete & Unblock Cottage'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 bg-white text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
