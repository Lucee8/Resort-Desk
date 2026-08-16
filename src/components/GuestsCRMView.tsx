import React, { useState, useMemo } from 'react';
import { 
  Search, 
  HelpCircle, 
  Bell, 
  MessageSquare, 
  Edit, 
  Gift, 
  Heart, 
  AlertTriangle, 
  Check, 
  X, 
  Plus, 
  Download, 
  Star, 
  CheckCircle2, 
  UserPlus,
  Compass, 
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { GuestCRM, GuestCRMHistoryItem, GuestCRMFeedback, GuestCRMPayment } from '../types';

interface GuestsCRMViewProps {
  guests: GuestCRM[];
  onUpdateGuest: (updated: GuestCRM) => void;
  onAddGuest: (newGuest: GuestCRM) => void;
}

export default function GuestsCRMView({
  guests,
  onUpdateGuest,
  onAddGuest
}: GuestsCRMViewProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected guest id - defaults to the first guest (Arjun Mehta)
  const [selectedGuestId, setSelectedGuestId] = useState<string>(guests[0]?.id || 'g-1');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false);
  const [isNewFeedbackOpen, setIsNewFeedbackOpen] = useState(false);
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);

  // Edit Profile form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [editAnniversary, setEditAnniversary] = useState('');
  const [editVIP, setEditVIP] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editPreferencesString, setEditPreferencesString] = useState('');

  // WhatsApp form state
  const [whatsAppText, setWhatsAppText] = useState('Greetings from Boutique Resort! We hope you enjoyed your stay with us.');

  // New guest states
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newBirthday, setNewBirthday] = useState('Oct 12');
  const [newAnniversary, setNewAnniversary] = useState('Dec 05');
  const [newVIP, setNewVIP] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  // New Visit states
  const [newVisitRoom, setNewVisitRoom] = useState('Sea-View Premium Suite');
  const [newVisitDates, setNewVisitDates] = useState('Jul 10 - Jul 14, 2026');
  const [newVisitNights, setNewVisitNights] = useState(4);
  const [newVisitStatus, setNewVisitStatus] = useState<'Completed' | 'Active' | 'Upcoming'>('Completed');

  // New Feedback states
  const [newFeedbackRating, setNewFeedbackRating] = useState(5);
  const [newFeedbackComments, setNewFeedbackComments] = useState('');
  const [newFeedbackStay, setNewFeedbackStay] = useState('Stay: Jul 2026 • Sea-View Suite');

  // New Payment states
  const [newPayInvoice, setNewPayInvoice] = useState('');
  const [newPayDate, setNewPayDate] = useState('Jul 11, 2026');
  const [newPayAmount, setNewPayAmount] = useState(25000);
  const [newPayStatus, setNewPayStatus] = useState<'Paid via Card' | 'Paid via UPI' | 'Paid via Cash' | 'Pending'>('Paid via Card');

  // Active loaded guest
  const selectedGuest = useMemo(() => {
    return guests.find(g => g.id === selectedGuestId) || guests[0];
  }, [guests, selectedGuestId]);

  // Handle Search filtering for listing & selecting
  const searchFilteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guests;
    return guests.filter(g => 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.includes(searchQuery) ||
      g.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [guests, searchQuery]);

  // Open Edit Modal with selected guest values
  const openEditModal = () => {
    if (!selectedGuest) return;
    setEditName(selectedGuest.name);
    setEditPhone(selectedGuest.phone);
    setEditEmail(selectedGuest.email);
    setEditLocation(selectedGuest.location);
    setEditBirthday(selectedGuest.birthday);
    setEditAnniversary(selectedGuest.anniversary);
    setEditVIP(selectedGuest.isVIP);
    setEditNotes(selectedGuest.generalNotes);
    setEditPreferencesString(selectedGuest.preferences.join(', '));
    setIsEditModalOpen(true);
  };

  // Save Edit Profile Changes
  const handleSaveEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;
    
    // Parse preferences comma-separated list
    const parsedPrefs = editPreferencesString
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    onUpdateGuest({
      ...selectedGuest,
      name: editName,
      phone: editPhone,
      email: editEmail,
      location: editLocation,
      birthday: editBirthday,
      anniversary: editAnniversary,
      isVIP: editVIP,
      generalNotes: editNotes,
      preferences: parsedPrefs
    });
    
    setIsEditModalOpen(false);
  };

  // Submit New Guest
  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const added: GuestCRM = {
      id: `g-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim() || '+91 99999 00000',
      email: newEmail.trim() || 'guest@example.com',
      location: newLocation.trim() || 'Mumbai, India',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      isVIP: newVIP,
      birthday: newBirthday,
      anniversary: newAnniversary,
      preferences: ['Standard Room', 'Eco-friendly'],
      generalNotes: newNotes.trim() || 'No general notes recorded.',
      visitHistory: [],
      feedback: [],
      payments: []
    };

    onAddGuest(added);
    setSelectedGuestId(added.id);
    setIsAddGuestOpen(false);
    
    // Reset state
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewLocation('');
    setNewNotes('');
  };

  // Create new visit history entry
  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    const visit: GuestCRMHistoryItem = {
      id: `vh-${Date.now()}`,
      roomName: newVisitRoom,
      dateRange: newVisitDates,
      nightsCount: Number(newVisitNights),
      status: newVisitStatus
    };

    onUpdateGuest({
      ...selectedGuest,
      visitHistory: [visit, ...selectedGuest.visitHistory]
    });

    setIsNewVisitOpen(false);
  };

  // Create new feedback
  const handleCreateFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    const fb: GuestCRMFeedback = {
      id: `fb-${Date.now()}`,
      rating: newFeedbackRating,
      comments: newFeedbackComments,
      stayLabel: newFeedbackStay
    };

    onUpdateGuest({
      ...selectedGuest,
      feedback: [fb, ...selectedGuest.feedback]
    });

    setNewFeedbackComments('');
    setIsNewFeedbackOpen(false);
  };

  // Create new payment
  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    const invoiceNo = newPayInvoice.trim() || `#KR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const pay: GuestCRMPayment = {
      id: `py-${Date.now()}`,
      invoiceId: invoiceNo,
      date: newPayDate,
      amount: Number(newPayAmount),
      status: newPayStatus
    };

    onUpdateGuest({
      ...selectedGuest,
      payments: [pay, ...selectedGuest.payments]
    });

    setNewPayInvoice('');
    setIsNewPaymentOpen(false);
  };

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div id="guest-crm-layout" className="flex h-full w-full bg-[#fafbfc] overflow-hidden font-sans text-slate-800">
      
      {/* Dynamic Selector left panel to switch between registered guests easily */}
      <div className="w-64 border-r border-slate-150 bg-white/90 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-150/70 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">CRM Profiles</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{guests.length} active database records</p>
          </div>
          <button
            onClick={() => setIsAddGuestOpen(true)}
            className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-850 rounded-lg border border-teal-100 transition-colors"
            title="Create New Guest Profile"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {searchFilteredGuests.map((g) => {
            const isSelected = selectedGuestId === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGuestId(g.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-center gap-3 border ${
                  isSelected 
                    ? 'bg-teal-50/75 border-teal-200 shadow-sm text-teal-950' 
                    : 'border-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="relative">
                  <img 
                    src={g.avatar} 
                    alt={g.name} 
                    className="w-9 h-9 rounded-full object-cover border border-slate-200" 
                    referrerPolicy="no-referrer"
                  />
                  {g.isVIP && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-600 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs truncate leading-snug">{g.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{g.location}</p>
                </div>
              </button>
            );
          })}
          {searchFilteredGuests.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">
              No guests found.
            </div>
          )}
        </div>
      </div>

      {/* Main CRM Card View */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        
        {/* TOP COMPREHENSIVE HEADER - MATCHING SCREENSHOT EXACTLY */}
        <header id="boutique-resort-crm-header" className="h-16 border-b border-slate-200/80 bg-white px-8 flex items-center justify-between shrink-0">
          
          {/* Active Search matching top bar with Search icon */}
          <div className="relative w-96 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search guests, rooms, or invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-700 transition-all shadow-inner"
            />
          </div>

          {/* Right Header Navigation buttons */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => alert("Help Center is open. Guest CRM documentation is available.")}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Help</span>
            </button>

            {/* Notification alert item */}
            <div className="relative cursor-pointer hover:scale-105 transition-transform" onClick={() => alert("You have 1 pending high-priority VIP arrival notice today.")}>
              <Bell className="w-[18px] h-[18px] text-slate-600" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white" />
            </div>

            {/* Priya S. Resort Manager profile badge */}
            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-6">
              <div className="text-right">
                <p className="font-extrabold text-xs text-slate-800 leading-none">Priya S.</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Resort Manager</p>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" 
                alt="Priya S." 
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </header>

        {/* CRM MAIN CANVAS CONTENT */}
        {selectedGuest ? (
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            
            {/* 1. MAIN GUEST HEADER PROFILE CARD */}
            <div id="guest-header-card" className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="flex items-center gap-6">
                
                {/* Photo & Verified Check */}
                <div className="relative">
                  <img 
                    src={selectedGuest.avatar} 
                    alt={selectedGuest.name} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 right-0 bg-white p-0.5 rounded-full shadow-md border border-slate-100 flex items-center justify-center">
                    <div className="bg-emerald-500 text-white rounded-full p-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                </div>

                {/* Info Text */}
                <div className="space-y-1.5">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{selectedGuest.name}</h2>
                    {selectedGuest.isVIP && (
                      <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Loyal Guest / VIP
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-x-6 gap-y-1.5 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedGuest.phone}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedGuest.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedGuest.location}</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto self-end md:self-center">
                <button
                  onClick={() => setIsWhatsAppOpen(true)}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-[#25d366] hover:bg-[#20ba5a] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-colors"
                >
                  <MessageSquare className="w-4 h-4 fill-white stroke-[0.5]" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={openEditModal}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

            </div>

            {/* 2. TWO-COLUMN DETAILS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT DETAILED COLUMN (SPAN 5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* A. KEY DATES */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <h3 className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-4">
                    Key Dates
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Birthday display */}
                    <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-center">
                      <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-2">
                        <Gift className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Birthday</p>
                      <p className="text-sm font-extrabold text-rose-700 mt-1">{selectedGuest.birthday}</p>
                    </div>

                    {/* Anniversary display */}
                    <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-center">
                      <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-2">
                        <Heart className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Anniversary</p>
                      <p className="text-sm font-extrabold text-rose-700 mt-1">{selectedGuest.anniversary}</p>
                    </div>

                  </div>
                </div>

                {/* B. GUEST PREFERENCES */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                      Guest Preferences
                    </h3>
                    <button 
                      onClick={() => {
                        const newTag = prompt("Add new preference tag:");
                        if (newTag?.trim()) {
                          onUpdateGuest({
                            ...selectedGuest,
                            preferences: [...selectedGuest.preferences, newTag.trim()]
                          });
                        }
                      }}
                      className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Badges Layout */}
                  <div className="flex flex-wrap gap-2">
                    {selectedGuest.preferences.map((pref, i) => {
                      // Style allergy in red, others in standard gray/blue as shown in mockup
                      const isSevere = pref.toLowerCase().includes('allergy') || pref.toLowerCase().includes('allergic');
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                            isSevere 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isSevere && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                          <span>{pref}</span>
                          <button
                            onClick={() => {
                              onUpdateGuest({
                                ...selectedGuest,
                                preferences: selectedGuest.preferences.filter((_, idx) => idx !== i)
                              });
                            }}
                            className="hover:text-slate-900 ml-0.5 focus:outline-none"
                            title="Remove preference"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                    {selectedGuest.preferences.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No special preference tags added yet.</p>
                    )}
                  </div>

                  {/* General Notes Block */}
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block mb-2">
                      General Notes
                    </span>
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl relative">
                      <p className="text-xs text-slate-600 italic leading-relaxed">
                        "{selectedGuest.generalNotes}"
                      </p>
                      
                      <button
                        onClick={() => {
                          const note = prompt("Update General Notes:", selectedGuest.generalNotes);
                          if (note !== null) {
                            onUpdateGuest({
                              ...selectedGuest,
                              generalNotes: note.trim()
                            });
                          }
                        }}
                        className="absolute right-3 bottom-3 text-[10px] text-teal-800 hover:text-teal-950 font-bold"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* RIGHT EXPANDED COLUMN (SPAN 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* A. VISIT HISTORY */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      Visit History
                    </h3>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsNewVisitOpen(true)}
                        className="text-xs font-bold text-teal-800 hover:text-teal-950"
                      >
                        + Log Stay
                      </button>
                      <button
                        onClick={() => alert(`Showing historical archives for ${selectedGuest.name}`)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        View All
                      </button>
                    </div>
                  </div>

                  {/* Stays stack */}
                  <div className="space-y-3">
                    {selectedGuest.visitHistory.map((v) => (
                      <div 
                        key={v.id} 
                        className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-150/70 rounded-2xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Bedroom visual icon block */}
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800">
                            <Compass className="w-4 h-4" />
                          </div>

                          <div>
                            <h4 className="font-extrabold text-xs text-slate-800 leading-snug">{v.roomName}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                              {v.dateRange} <span className="text-slate-300 mx-1">•</span> {v.nightsCount} Nights
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {v.status}
                        </span>
                      </div>
                    ))}

                    {selectedGuest.visitHistory.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No historical stays on record. Click "+ Log Stay" to enter a trip.
                      </div>
                    )}
                  </div>
                </div>

                {/* B. FEEDBACK & REVIEWS */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      Feedback & Reviews
                    </h3>
                    <button 
                      onClick={() => setIsNewFeedbackOpen(true)}
                      className="text-xs font-bold text-teal-800 hover:text-teal-950"
                    >
                      + Add Feedback
                    </button>
                  </div>

                  {/* Feedback Side-By-Side Horizontal scrollable cards matching screenshot design */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedGuest.feedback.map((f) => (
                      <div 
                        key={f.id} 
                        className="bg-white border border-slate-150 p-4 rounded-2xl relative flex flex-col justify-between"
                      >
                        <div>
                          {/* Rating stars */}
                          <div className="flex items-center gap-0.5 mb-2.5">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star 
                                key={idx} 
                                className={`w-3.5 h-3.5 ${
                                  idx < Math.floor(f.rating) 
                                    ? 'text-amber-400 fill-amber-400' 
                                    : 'text-slate-200'
                                }`} 
                              />
                            ))}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed italic">
                            "{f.comments}"
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                          {f.stayLabel}
                        </div>
                      </div>
                    ))}

                    {selectedGuest.feedback.length === 0 && (
                      <div className="col-span-2 p-6 text-center text-xs text-slate-400">
                        No feedback entered yet. Log custom feedback for hospitality optimization.
                      </div>
                    )}
                  </div>
                </div>

                {/* C. RECENT PAYMENTS */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      Recent Payments
                    </h3>
                    <button 
                      onClick={() => setIsNewPaymentOpen(true)}
                      className="text-xs font-bold text-teal-800 hover:text-teal-950"
                    >
                      + Log Payment
                    </button>
                  </div>

                  {/* Payment Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                          <th className="py-2.5 font-bold">Invoice ID</th>
                          <th className="py-2.5 font-bold">Date</th>
                          <th className="py-2.5 font-bold">Amount</th>
                          <th className="py-2.5 font-bold">Status</th>
                          <th className="py-2.5 text-right font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedGuest.payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 font-bold text-teal-900">
                              {p.invoiceId}
                            </td>
                            <td className="py-3.5 text-slate-500 font-medium">
                              {p.date}
                            </td>
                            <td className="py-3.5 font-extrabold text-slate-850">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="py-3.5">
                              <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-slate-700">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>{p.status}</span>
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => alert(`Simulated download of invoice ${p.invoiceId} (${formatCurrency(p.amount)}). PDF copy processed.`)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-150 rounded-lg transition-colors"
                                title="Download Invoice"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {selectedGuest.payments.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                              No recent payments recorded. Log a transaction above.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
            <UserPlus className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm">Please select a Guest CRM Profile to manage records.</p>
          </div>
        )}

      </div>

      {/* -----------------------------------------------------------------
          MODAL A: EDIT PROFILE DIALOG
          ----------------------------------------------------------------- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Edit Profile Details</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProfile} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-teal-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    VIP Membership Status
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="editVIP"
                      checked={editVIP}
                      onChange={(e) => setEditVIP(e.target.checked)}
                      className="rounded border-slate-300 text-teal-800 focus:ring-teal-700"
                    />
                    <label htmlFor="editVIP" className="font-bold text-slate-700">Flag as VIP Guest</label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Birthday (e.g. Oct 12)
                  </label>
                  <input
                    type="text"
                    value={editBirthday}
                    onChange={(e) => setEditBirthday(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Anniversary (e.g. Dec 05)
                  </label>
                  <input
                    type="text"
                    value={editAnniversary}
                    onChange={(e) => setEditAnniversary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Preference Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={editPreferencesString}
                  onChange={(e) => setEditPreferencesString(e.target.value)}
                  placeholder="Jain food, Nut Allergy, Sea View, High Floor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  General Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 h-16"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl"
                >
                  Save Profile
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------
          MODAL B: WHATSAPP SIMULATOR DIALOG
          ----------------------------------------------------------------- */}
      {isWhatsAppOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-slate-900">WhatsApp Outbound</h3>
              </div>
              <button 
                onClick={() => setIsWhatsAppOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Send a real-time message to <strong>{selectedGuest.name}</strong> at <strong>{selectedGuest.phone}</strong>.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Message Body
                </label>
                <textarea
                  value={whatsAppText}
                  onChange={(e) => setWhatsAppText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 h-24 focus:outline-none focus:border-teal-700 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsWhatsAppOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Message safely dispatched to WhatsApp server for ${selectedGuest.phone}:\n"${whatsAppText}"`);
                    setIsWhatsAppOpen(false);
                  }}
                  className="px-4 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-xl"
                >
                  Dispatch SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------
          MODAL C: ADD NEW CUSTOM GUEST CRM PROFILE
          ----------------------------------------------------------------- */}
      {isAddGuestOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Create CRM Registry Profile</h3>
              <button 
                onClick={() => setIsAddGuestOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Devendra Deshmukh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 95550 12345"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="dev@outlook.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Pune, India"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    VIP
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="newVIP"
                      checked={newVIP}
                      onChange={(e) => setNewVIP(e.target.checked)}
                      className="rounded border-slate-300 text-teal-800 focus:ring-teal-750"
                    />
                    <label htmlFor="newVIP" className="font-bold text-slate-700">Flag as VIP Guest</label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Birthday (e.g. Jun 10)
                  </label>
                  <input
                    type="text"
                    value={newBirthday}
                    onChange={(e) => setNewBirthday(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Anniversary (e.g. Nov 20)
                  </label>
                  <input
                    type="text"
                    value={newAnniversary}
                    onChange={(e) => setNewAnniversary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  General Notes / Hospitality Brief
                </label>
                <textarea
                  placeholder="Enjoys coastal local seafood, prefers early breakfasts and soft mattress setups."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 h-16"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsAddGuestOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------
          MODAL D: LOG VISIT HISTORY
          ----------------------------------------------------------------- */}
      {isNewVisitOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Log Stay History</h3>
              <button 
                onClick={() => setIsNewVisitOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVisit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Room Segment Booked
                </label>
                <input
                  type="text"
                  value={newVisitRoom}
                  onChange={(e) => setNewVisitRoom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Date Range
                </label>
                <input
                  type="text"
                  value={newVisitDates}
                  onChange={(e) => setNewVisitDates(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nights Count
                  </label>
                  <input
                    type="number"
                    value={newVisitNights}
                    onChange={(e) => setNewVisitNights(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Stay Status
                  </label>
                  <select
                    value={newVisitStatus}
                    onChange={(e) => setNewVisitStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewVisitOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-850 text-white rounded-xl hover:bg-teal-905"
                >
                  Log Stay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------
          MODAL E: ADD FEEDBACK REVIEW
          ----------------------------------------------------------------- */}
      {isNewFeedbackOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Add Feedback Log</h3>
              <button 
                onClick={() => setIsNewFeedbackOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFeedback} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Rating (1 to 5 Stars)
                </label>
                <select
                  value={newFeedbackRating}
                  onChange={(e) => setNewFeedbackRating(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                  <option value={3}>⭐⭐⭐ (3/5)</option>
                  <option value={2}>⭐⭐ (2/5)</option>
                  <option value={1}>⭐ (1/5)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Stay Context Label
                </label>
                <input
                  type="text"
                  value={newFeedbackStay}
                  onChange={(e) => setNewFeedbackStay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Review Quotes / Comments
                </label>
                <textarea
                  placeholder="e.g. Beautiful property, staff went above and beyond to tailor our meals..."
                  value={newFeedbackComments}
                  onChange={(e) => setNewFeedbackComments(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 h-24 font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewFeedbackOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-850 text-white rounded-xl hover:bg-teal-905"
                >
                  Log Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------
          MODAL F: LOG RECENT PAYMENT
          ----------------------------------------------------------------- */}
      {isNewPaymentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Log Payment Invoice</h3>
              <button 
                onClick={() => setIsNewPaymentOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Invoice ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. #KR-2023-4421"
                  value={newPayInvoice}
                  onChange={(e) => setNewPayInvoice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Payment Date
                  </label>
                  <input
                    type="text"
                    value={newPayDate}
                    onChange={(e) => setNewPayDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={newPayAmount}
                    onChange={(e) => setNewPayAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Payment Method Status
                </label>
                <select
                  value={newPayStatus}
                  onChange={(e) => setNewPayStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                >
                  <option value="Paid via Card">Paid via Card</option>
                  <option value="Paid via UPI">Paid via UPI</option>
                  <option value="Paid via Cash">Paid via Cash</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewPaymentOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-850 text-white rounded-xl hover:bg-teal-905"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
