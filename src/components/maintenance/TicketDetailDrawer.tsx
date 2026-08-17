import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Camera, 
  Plus, 
  Wrench, 
  ShieldAlert, 
  FileText, 
  Sparkles,
  ChevronRight,
  Send,
  Download
} from 'lucide-react';
import { 
  MaintenanceTicket, 
  MaintenanceStatus, 
  MaintenancePriority, 
  Technician, 
  MaintenanceTimelineEvent,
  MaintenancePart 
} from '../../types';

interface TicketDetailDrawerProps {
  ticket: MaintenanceTicket | null;
  isOpen: boolean;
  onClose: () => void;
  technicians: Technician[];
  onUpdateTicket: (updated: MaintenanceTicket) => void;
  onCloseTicket: (ticketId: string) => void;
}

export default function TicketDetailDrawer({
  ticket,
  isOpen,
  onClose,
  technicians,
  onUpdateTicket,
  onCloseTicket
}: TicketDetailDrawerProps) {
  const [newNote, setNewNote] = useState('');
  const [selectedTechId, setSelectedTechId] = useState(ticket?.assignedTechnicianId || '');
  const [newPartName, setNewPartName] = useState('');
  const [newPartCost, setNewPartCost] = useState('');
  const [showAddPart, setShowAddPart] = useState(false);
  const [repairPhoto, setRepairPhoto] = useState(ticket?.repairPhotoUrl || '');

  React.useEffect(() => {
    if (ticket) {
      setSelectedTechId(ticket.assignedTechnicianId || '');
      setRepairPhoto(ticket.repairPhotoUrl || '');
    }
  }, [ticket]);

  const handleStatusChange = (newStatus: MaintenanceStatus) => {
    if (!ticket) return;
    const updatedTimeline: MaintenanceTimelineEvent[] = [
      ...ticket.timeline,
      {
        id: `tm-${Date.now()}`,
        title: `Status Changed to ${newStatus}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: 'Arun K. (Ops Manager)',
        note: `Workflow transitioned to ${newStatus}`,
        done: true
      }
    ];

    const updated: MaintenanceTicket = {
      ...ticket,
      status: newStatus,
      timeline: updatedTimeline,
      actualResolutionTime: newStatus === 'Resolved' || newStatus === 'Closed' ? '38 mins' : ticket.actualResolutionTime,
      isRoomBlocked: (newStatus === 'Closed' || newStatus === 'Resolved') ? false : ticket.isRoomBlocked
    };

    onUpdateTicket(updated);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const updatedTimeline: MaintenanceTimelineEvent[] = [
      ...ticket.timeline,
      {
        id: `tm-${Date.now()}`,
        title: 'Technician / Staff Log Note',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: 'Rajesh Malik (Technician)',
        note: newNote.trim(),
        done: true
      }
    ];

    onUpdateTicket({
      ...ticket,
      timeline: updatedTimeline
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
      status: 'In Stock'
    };

    const currentParts = ticket.parts || [];
    const updatedParts = [...currentParts, newPart];
    const newTotalPartsCost = ticket.cost.parts + cost;

    onUpdateTicket({
      ...ticket,
      parts: updatedParts,
      cost: {
        ...ticket.cost,
        parts: newTotalPartsCost,
        total: newTotalPartsCost + ticket.cost.labor + ticket.cost.vendor
      }
    });

    setNewPartName('');
    setNewPartCost('');
    setShowAddPart(false);
  };

  const handleReassignTech = (techId: string) => {
    setSelectedTechId(techId);
    const tech = technicians.find(t => t.id === techId);
    if (!tech) return;

    const updatedTimeline: MaintenanceTimelineEvent[] = [
      ...ticket.timeline,
      {
        id: `tm-${Date.now()}`,
        title: `Reassigned to ${tech.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: 'Arun K. (Ops Manager)',
        note: `${tech.department} technician dispatched`,
        done: true
      }
    ];

    onUpdateTicket({
      ...ticket,
      assignedTechnicianId: tech.id,
      assignedTechnicianName: tech.name,
      assignedTechnicianAvatar: tech.avatar,
      assignedDepartment: tech.department,
      status: ticket.status === 'Reported' ? 'Assigned' : ticket.status,
      timeline: updatedTimeline
    });
  };

  const handleSimulatePhotoUpload = () => {
    const samplePhoto = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
    setRepairPhoto(samplePhoto);
    onUpdateTicket({
      ...ticket,
      repairPhotoUrl: samplePhoto,
      timeline: [
        ...ticket.timeline,
        {
          id: `tm-${Date.now()}`,
          title: 'Repair Verification Photo Uploaded',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author: ticket.assignedTechnicianName || 'Technician',
          note: 'Post-repair photo evidence captured & attached.',
          done: true
        }
      ]
    });
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end font-sans animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200/80 bg-slate-50 flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {ticket.id}
              </span>
              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                ticket.priority === 'Emergency' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                ticket.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {ticket.priority} Priority
              </span>
              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                ticket.status === 'Waiting for Parts' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {ticket.status}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-2 leading-tight">
              {ticket.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">{ticket.roomNumber}</span>
              {ticket.area && <span>• {ticket.area}</span>}
              <span>• Reported {ticket.reportedDate} at {ticket.reportedTime}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors shrink-0"
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
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {ticket.status}
              </p>
            </div>

            {/* Status Change Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleStatusChange('In Progress')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ticket.status === 'In Progress'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-800'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange('Waiting for Parts')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ticket.status === 'Waiting for Parts'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-800'
                }`}
              >
                Waiting for Parts
              </button>
              <button
                onClick={() => handleStatusChange('Resolved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ticket.status === 'Resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                Resolve
              </button>
              <button
                onClick={() => onCloseTicket(ticket.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white transition-all shadow-xs"
              >
                Verify & Close
              </button>
            </div>
          </div>

          {/* Issue Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Problem Description & Findings
            </h3>
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed">
              {ticket.description}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Category</span>
                <span className="text-xs font-bold text-slate-800">{ticket.category}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Reported By</span>
                <span className="text-xs font-bold text-slate-800 truncate block">{ticket.reportedBy}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Room Status</span>
                <span className={`text-xs font-bold ${ticket.isRoomBlocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {ticket.isRoomBlocked ? 'Blocked in PMS' : 'Guest Ready'}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Duration</span>
                <span className="text-xs font-bold text-slate-800">{ticket.estimatedCompletionTime || '45 mins'}</span>
              </div>
            </div>
          </div>

          {/* Assigned Technician Profile Box */}
          <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
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
                  <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                ))}
              </select>
            </div>

            {ticket.assignedTechnicianName ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={ticket.assignedTechnicianAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                    alt={ticket.assignedTechnicianName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-teal-700/20"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {ticket.assignedTechnicianName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {ticket.assignedDepartment || 'General Maintenance Staff'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert(`Calling ${ticket.assignedTechnicianName} on staff radio...`)}
                    className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Staff</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-1">
                No technician currently assigned to this work order.
              </div>
            )}
          </div>

          {/* Parts Required & Cost Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Parts & Maintenance Costs
              </h3>
              <button
                onClick={() => setShowAddPart(!showAddPart)}
                className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Part</span>
              </button>
            </div>

            {showAddPart && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 animate-in fade-in">
                <input
                  type="text"
                  placeholder="Part name (e.g. Siphon Pipe 1.5m)"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="number"
                  placeholder="Cost (₹/$)"
                  value={newPartCost}
                  onChange={(e) => setNewPartCost(e.target.value)}
                  className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPart}
                  className="px-3 py-1.5 bg-teal-800 text-white rounded-lg text-xs font-bold"
                >
                  Save
                </button>
              </div>
            )}

            {ticket.parts && ticket.parts.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {ticket.parts.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between bg-white text-xs">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">{p.name} (Qty: {p.quantity})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">₹{p.cost}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No inventory parts logged for this ticket yet.</p>
            )}

            {/* Total Cost Summary */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600">Total Work Order Cost:</span>
              <span className="text-base text-teal-900 font-mono">
                ₹{ticket.cost.total || ticket.cost.parts + ticket.cost.labor}
                <span className="text-[10px] text-slate-400 font-normal ml-1.5">
                  (Parts: ₹{ticket.cost.parts} + Labor: ₹{ticket.cost.labor})
                </span>
              </span>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Activity Timeline & Work Log
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {ticket.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative group">
                  {/* Dot */}
                  <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    event.done ? 'bg-teal-700 text-white' : 'bg-slate-300 text-slate-600'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{event.title}</span>
                      <span className="text-[10px] font-medium text-slate-400">{event.time}</span>
                    </div>
                    <p className="text-[11px] text-teal-800 font-semibold mt-0.5">By {event.author}</p>
                    {event.note && (
                      <p className="text-xs text-slate-600 mt-1 italic bg-white p-2 rounded border border-slate-100">
                        "{event.note}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Log Note Form */}
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
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
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
              <button
                type="button"
                onClick={handleSimulatePhotoUpload}
                className="text-xs font-bold text-teal-800 hover:underline bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
              >
                + Snap / Upload Photo
              </button>
            </div>

            {repairPhoto ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-48">
                <img src={repairPhoto} alt="Repair Evidence" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-bold rounded">
                  Verified by {ticket.assignedTechnicianName || 'Rajesh M.'}
                </span>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-white">
                <Camera className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs text-slate-400">No completion photo submitted yet.</p>
              </div>
            )}
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to mark this ticket as Closed and release the room back to PMS?')) {
                onCloseTicket(ticket.id);
                onClose();
              }
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete & Unblock Room</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 bg-white text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
}
