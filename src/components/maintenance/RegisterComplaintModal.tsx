import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  MapPin, 
  Wrench,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { 
  MaintenanceCategory, 
  MaintenancePriority, 
  MaintenanceTicket, 
  Technician, 
  MaintenanceAttachment 
} from '../../types';

interface RegisterComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newTicket: MaintenanceTicket) => void;
  technicians: Technician[];
}

export default function RegisterComplaintModal({
  isOpen,
  onClose,
  onSubmit,
  technicians
}: RegisterComplaintModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory>('HVAC');
  const [description, setDescription] = useState('');
  const [roomNumber, setRoomNumber] = useState('Deluxe Villa #104');
  const [area, setArea] = useState('Master Bedroom / Luggage Rack');
  const [priority, setPriority] = useState<MaintenancePriority>('High');
  const [reportedBy, setReportedBy] = useState('Arun K. (Ops Manager)');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>('tech-1');
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState('45 mins');
  const [isRoomBlocked, setIsRoomBlocked] = useState(true);
  const [partsCost, setPartsCost] = useState('1200');
  const [laborCost, setLaborCost] = useState('600');
  const [attachments, setAttachments] = useState<MaintenanceAttachment[]>([
    {
      id: 'sample-att-1',
      name: 'Initial_Inspection_Capture.jpg',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      type: 'image',
      size: '1.9 MB'
    }
  ]);

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
    'Other'
  ];

  const priorities: MaintenancePriority[] = ['Emergency', 'High', 'Medium', 'Low'];

  const handleAddSampleAttachment = (type: 'image' | 'doc') => {
    if (type === 'image') {
      setAttachments(prev => [
        ...prev,
        {
          id: `att-${Date.now()}`,
          name: `Site_Photo_${prev.length + 1}.jpg`,
          url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
          type: 'image',
          size: '2.1 MB'
        }
      ]);
    } else {
      setAttachments(prev => [
        ...prev,
        {
          id: `att-${Date.now()}`,
          name: `Diagnostic_Report_${prev.length + 1}.pdf`,
          url: '#',
          type: 'doc',
          size: '450 KB'
        }
      ]);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !roomNumber.trim()) {
      alert('Please fill out the Issue Title and Room Number');
      return;
    }

    const assignedTech = technicians.find(t => t.id === assignedTechnicianId);

    const newTicket: MaintenanceTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      category,
      description: description.trim() || 'No detailed description provided.',
      roomNumber: roomNumber.trim(),
      area: area.trim(),
      priority,
      status: assignedTech ? 'Assigned' : 'Reported',
      reportedBy: reportedBy.trim(),
      reportedDate: 'Today, Oct 24',
      reportedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        total: (Number(partsCost) || 0) + (Number(laborCost) || 0)
      },
      attachments,
      timeline: [
        {
          id: `tm-${Date.now()}-1`,
          title: 'Ticket Created',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author: reportedBy,
          note: `Registered with ${priority} priority`,
          done: true
        },
        ...(assignedTech ? [{
          id: `tm-${Date.now()}-2`,
          title: `Assigned to ${assignedTech.name}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author: 'Auto Dispatch System',
          note: `${assignedTech.department} technician notified`,
          done: true
        }] : [])
      ],
      parts: Number(partsCost) > 0 ? [
        {
          id: `part-${Date.now()}`,
          name: `${category} Replacement Module`,
          quantity: 1,
          cost: Number(partsCost),
          status: 'In Stock'
        }
      ] : []
    };

    onSubmit(newTicket);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
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
                Issue a work order to engineering & maintenance staff
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Section 1: Complaint Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-700"></span>
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
                  placeholder="e.g. AC Leaking - Water dripping over luggage rack"
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
                    <option key={cat} value={cat}>{cat}</option>
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
                    priority === 'Emergency' ? 'bg-rose-50 border-rose-300 text-rose-800' :
                    priority === 'High' ? 'bg-orange-50 border-orange-300 text-orange-800' :
                    priority === 'Medium' ? 'bg-amber-50 border-amber-300 text-amber-800' :
                    'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p} Priority</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Room / Villa / Facility <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deluxe Villa #104 or Pool Deck"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific Area / Annex
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master En-suite, Balcony, Main Door"
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
                  placeholder="Provide precise details of symptoms, error codes, guest feedback, or inspection findings..."
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

              {/* Block Room Checkbox */}
              <div className="flex items-center gap-3 pt-6">
                <input
                  id="chk-block-room"
                  type="checkbox"
                  checked={isRoomBlocked}
                  onChange={(e) => setIsRoomBlocked(e.target.checked)}
                  className="w-4 h-4 text-teal-800 border-slate-300 rounded focus:ring-teal-700"
                />
                <label htmlFor="chk-block-room" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Block Room in PMS (Prevent guest check-in until verified)
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Technician Assignment */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-700"></span>
              Technician Assignment & Estimates
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
                  Est. Parts Cost (₹ / $)
                </label>
                <input
                  type="number"
                  value={partsCost}
                  onChange={(e) => setPartsCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Attachments */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-700"></span>
                Evidence & Media Attachments
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddSampleAttachment('image')}
                  className="text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/80"
                >
                  + Add Inspection Photo
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSampleAttachment('doc')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  + Add Telemetry Doc
                </button>
              </div>
            </div>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-slate-200 hover:border-teal-700 hover:bg-teal-50/20 rounded-2xl p-4 text-center transition-colors">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">
                Drag & drop photos, diagnostic videos, or invoice documents here
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, MP4, PDF up to 25MB supported
              </p>
            </div>

            {/* Attachment Items List */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                {attachments.map((att) => (
                  <div 
                    key={att.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {att.type === 'image' ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                          <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{att.name}</p>
                        <p className="text-[10px] text-slate-400">{att.size || '1.5 MB'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md shadow-teal-900/10 transition-all hover:scale-[1.01] cursor-pointer"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
