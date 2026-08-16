import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  FileText, 
  Clock, 
  CheckCircle, 
  UserPlus, 
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Map,
  X,
  CreditCard,
  History,
  AlertCircle
} from 'lucide-react';
import { Booking } from '../types';

interface BookingsViewProps {
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
  onUpdateBooking: (booking: Booking) => void;
  onOpenBookingModal: () => void;
}

export default function BookingsView({ 
  bookings, 
  onAddBooking, 
  onUpdateBooking,
  onOpenBookingModal 
}: BookingsViewProps) {
  
  // Selected booking for Right Sidebar Details / Drawer
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>('b-1'); // Rajesh Kumar default selected as in screenshot
  const [viewingFullProfileId, setViewingFullProfileId] = useState<string | null>(null);
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);

  // Filters state
  const [roomFilter, setRoomFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Internal notes writing state
  const [newNoteText, setNewNoteText] = useState<string>('');

  // 14 Days range definition (Starting Mon Oct 14)
  const timelineDays = [
    { name: 'MON', num: '14' },
    { name: 'TUE', num: '15' },
    { name: 'WED', num: '16' },
    { name: 'THU', num: '17' },
    { name: 'FRI', num: '18' },
    { name: 'SAT', num: '19' },
    { name: 'SUN', num: '20' },
    { name: 'MON', num: '21' },
    { name: 'TUE', num: '22' },
    { name: 'WED', num: '23' },
    { name: 'THU', num: '24' },
    { name: 'FRI', num: '25' },
    { name: 'SAT', num: '26' },
    { name: 'SUN', num: '27' },
  ];

  // Helper formatting for currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Find currently active/selected booking
  const selectedBooking = useMemo(() => {
    return bookings.find(b => b.id === selectedBookingId) || bookings[0];
  }, [bookings, selectedBookingId]);

  // Full Profile Booking
  const fullProfileBooking = useMemo(() => {
    return bookings.find(b => b.id === viewingFullProfileId);
  }, [bookings, viewingFullProfileId]);

  // Invoice Booking
  const invoiceBooking = useMemo(() => {
    return bookings.find(b => b.id === viewingInvoiceId);
  }, [bookings, viewingInvoiceId]);

  // Filtered list
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesRoom = roomFilter === 'All' || b.roomType.toLowerCase().includes(roomFilter.toLowerCase());
      const matchesStatus = statusFilter === 'All' || b.bookingStatus === statusFilter;
      const matchesSearch = !searchQuery || 
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.roomNumber.includes(searchQuery) ||
        b.guestPhone.includes(searchQuery);

      return matchesRoom && matchesStatus && matchesSearch;
    });
  }, [bookings, roomFilter, statusFilter, searchQuery]);

  // Add internal notes to selected guest profile
  const handleAddNote = () => {
    if (!newNoteText.trim() || !selectedBooking) return;
    const updated = {
      ...selectedBooking,
      notes: [newNoteText.trim(), ...selectedBooking.notes]
    };
    onUpdateBooking(updated);
    setNewNoteText('');
  };

  // Switch to Full Profile View
  const handleOpenFullProfile = (id: string) => {
    setViewingFullProfileId(id);
    setViewingInvoiceId(null);
  };

  // Switch to Invoice View
  const handleOpenInvoice = (id: string) => {
    setViewingInvoiceId(id);
    setViewingFullProfileId(null);
  };

  // Handle WhatsApp action alert
  const handleSendWhatsApp = (name: string, phone: string) => {
    alert(`Initiating automated WhatsApp message template to ${name} (${phone}): \n"Hi ${name}, welcome to Konkan Retreat! We look forward to hosting your stay in our ${selectedBooking?.roomType}."`);
  };

  return (
    <div id="bookings-dashboard-container" className="flex h-full w-full bg-slate-100 overflow-hidden font-sans relative">
      
      {/* -------------------------------------------------------------
          SUB-VIEW A: FULL INVOICE VIEW (4th Screenshot)
          ------------------------------------------------------------- */}
      {viewingInvoiceId && invoiceBooking && (
        <div id="full-invoice-screen" className="flex-1 bg-slate-100 p-8 overflow-y-auto h-full flex flex-col items-center">
          <div className="w-full max-w-3xl flex items-center justify-between mb-6">
            <button 
              id="invoice-back-btn"
              onClick={() => setViewingInvoiceId(null)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-teal-800 rounded-xl transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Reservations</span>
            </button>
            <div className="flex gap-2">
              <button 
                id="invoice-download-btn"
                onClick={() => alert("Downloading premium invoice PDF file...")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button 
                id="invoice-whatsapp-btn"
                onClick={() => handleSendWhatsApp(invoiceBooking.guestName, invoiceBooking.guestPhone)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-900 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:bg-teal-950"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send via WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Premium Invoice Invoice Slip Layout */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-3xl w-full p-10 font-sans relative">
            
            {/* Top Logo and Tagline */}
            <div className="flex justify-between items-start border-b border-slate-150 pb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-800 flex items-center justify-center text-white font-serif font-bold text-2xl shadow-md">
                  K
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-teal-950">Konkan Retreat</h2>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Luxury Coastal Sanctuary</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Paid
                </span>
                <p className="text-xs text-slate-400 mt-2.5 font-medium">INVOICE NUMBER</p>
                <p className="text-sm font-bold text-slate-800">{invoiceBooking.invoice.invoiceNumber}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">DATED: {invoiceBooking.invoice.date}</p>
              </div>
            </div>

            {/* Address Details */}
            <div className="py-6 border-b border-slate-100 text-xs text-slate-500 leading-relaxed grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-slate-800 mb-1">Resort Address:</p>
                <p>124 Coastal Highway, Tarkarli Beach,</p>
                <p>Sindhudurg, Maharashtra - 416606</p>
                <p className="font-medium text-slate-700 mt-1">GSTIN: 27AABCU1234F1Z5</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-800 mb-1">Billed To:</p>
                <p className="font-bold text-slate-800">{invoiceBooking.guestName}</p>
                <p>{invoiceBooking.guestEmail}</p>
                <p>{invoiceBooking.guestPhone}</p>
              </div>
            </div>

            {/* Stay details summary */}
            <div className="grid grid-cols-2 gap-4 py-4 bg-slate-50/80 px-6 rounded-2xl my-6 text-xs text-slate-600">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Check-In</span>
                <p className="font-bold text-slate-800 mt-0.5">{invoiceBooking.startDate}, 2026</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Check-Out</span>
                <p className="font-bold text-slate-800 mt-0.5">{invoiceBooking.endDate}, 2026</p>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-left text-xs text-slate-600 my-8">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider pb-2">
                  <th className="py-2 font-bold">Description</th>
                  <th className="py-2 text-center font-bold">Qty/Nights</th>
                  <th className="py-2 text-right font-bold">Price</th>
                  <th className="py-2 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceBooking.invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3.5 pr-4">
                      <p className="font-bold text-slate-800">{item.description}</p>
                      {index === 0 && <p className="text-[10px] text-slate-400 font-medium">Premium beachfront resort accommodation</p>}
                      {index === 1 && <p className="text-[10px] text-slate-400 font-medium">Daily gourmet coastal breakfast for 2 adults</p>}
                      {index === 2 && <p className="text-[10px] text-slate-400 font-medium">Rollaway extra comfort bed for guest</p>}
                    </td>
                    <td className="py-3.5 text-center font-semibold text-slate-700">{item.qty}</td>
                    <td className="py-3.5 text-right font-medium text-slate-700">{formatCurrency(item.price)}.00</td>
                    <td className="py-3.5 text-right font-bold text-slate-800">{formatCurrency(item.amount)}.00</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Panel */}
            <div className="border-t border-slate-150 pt-6 flex justify-end">
              <div className="w-72 flex flex-col gap-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{formatCurrency(invoiceBooking.invoice.subtotal)}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (9%)</span>
                  <span className="font-medium text-slate-700">{formatCurrency(invoiceBooking.invoice.cgst)}.00</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span>SGST (9%)</span>
                  <span className="font-medium text-slate-700">{formatCurrency(invoiceBooking.invoice.sgst)}.00</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-teal-900 bg-teal-50 px-3 py-2 rounded-xl border border-teal-100">
                  <span>Total Amount</span>
                  <span>{formatCurrency(invoiceBooking.invoice.total)}.00</span>
                </div>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="text-center mt-12 pt-8 border-t border-slate-100">
              <p className="italic text-xs text-slate-400">Thank you for staying with Konkan Retreat!</p>
              <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  ResortDesk Verified
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Secure GST Transaction
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-6 max-w-md mx-auto leading-normal">
                This is a computer-generated invoice and does not require a physical signature. Taxes are calculated as per the prevailing GST laws in India. For any billing queries, contact hello@konkanretreat.com
              </p>
            </div>

          </div>
        </div>
      )}


      {/* -------------------------------------------------------------
          SUB-VIEW B: FULL DETAILED GUEST PROFILE (3rd Screenshot)
          ------------------------------------------------------------- */}
      {viewingFullProfileId && fullProfileBooking && (
        <div id="full-profile-screen" className="flex-1 bg-slate-100 p-8 overflow-y-auto h-full flex flex-col items-center">
          <div className="w-full max-w-4xl flex items-center justify-between mb-6">
            <button 
              id="profile-back-btn"
              onClick={() => setViewingFullProfileId(null)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-teal-800 rounded-xl transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Reservations</span>
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Guest Profile & CRM File
            </span>
          </div>

          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            
            {/* Main Profile Info Column (Left / spans 2 cols) */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Profile Card Header */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex items-center gap-6 relative overflow-hidden">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    alt={fullProfileBooking.guestName}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-teal-800 border-2 border-white flex items-center justify-center text-white text-[10px]">✓</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">
                      {fullProfileBooking.guestName}
                    </h2>
                    <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 text-[10px] font-bold rounded-full">
                      Repeat Guest
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-semibold flex items-center gap-4">
                    <span>📞 {fullProfileBooking.guestPhone}</span>
                    <span>✉ {fullProfileBooking.guestEmail}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-100 pl-6 shrink-0">
                  <div className="text-center px-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Stays</span>
                    <p className="text-lg font-bold text-teal-900 mt-1">{fullProfileBooking.stayHistory.length + 1} Stays</p>
                  </div>
                  <div className="text-center px-4 border-l border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Spend</span>
                    <p className="text-lg font-bold text-teal-900 mt-1">{formatCurrency(fullProfileBooking.totalSpend)}</p>
                  </div>
                </div>
              </div>

              {/* Notes & Preferences Section */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span>❤️</span> Notes & Preferences
                  </h3>
                  <button 
                    onClick={() => alert("Notes editor unlocked!")}
                    className="text-xs text-teal-700 hover:text-teal-900 font-bold"
                  >
                    ✏ Edit
                  </button>
                </div>

                {/* Preference Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {fullProfileBooking.preferences.map((p, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-semibold rounded-lg border border-teal-100/60"
                    >
                      {p}
                    </span>
                  ))}
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-lg border border-orange-150">
                    Anniversary in March
                  </span>
                </div>

                {/* Narrative preferences */}
                <div className="mt-5 p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{fullProfileBooking.notes[1] || 'Enjoys kokum sharbat upon arrival. Prefers quiet rooms away from the dining area. Always travels with family during summer breaks.'}"
                  </p>
                </div>
              </div>

              {/* Stay History List */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 pb-4 border-b border-slate-50">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Stay History</span>
                </h3>

                <div className="flex flex-col gap-3 mt-4">
                  {fullProfileBooking.stayHistory.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">No previous stay history records.</div>
                  ) : (
                    fullProfileBooking.stayHistory.map((stay) => (
                      <div key={stay.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-teal-50 text-teal-800 rounded-xl flex items-center justify-center text-xs">🏨</div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{stay.room}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{stay.dates}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-800">{formatCurrency(stay.amount)}</p>
                          <span className="inline-block text-[8px] uppercase tracking-wider font-extrabold text-emerald-600 mt-1">Paid</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button 
                  onClick={() => alert("Full detailed stay history audit logs exported to resort desk ledger")}
                  className="w-full text-center py-2.5 mt-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 transition-colors"
                >
                  View Detailed Log
                </button>
              </div>

            </div>

            {/* Quick Actions Column (Right / spans 1 col) */}
            <div className="flex flex-col gap-6">
              {/* Quick Actions Panel */}
              <div className="bg-teal-900 rounded-3xl p-6 text-white shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">Quick Actions</h3>
                <div className="flex flex-col gap-3 mt-4">
                  <button 
                    onClick={onOpenBookingModal}
                    className="w-full py-2.5 bg-white text-teal-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors shadow"
                  >
                    + New Booking
                  </button>
                  <button 
                    onClick={() => handleSendWhatsApp(fullProfileBooking.guestName, fullProfileBooking.guestPhone)}
                    className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send WhatsApp Message</span>
                  </button>
                  <button 
                    onClick={() => alert(`Guest Profile link copied to clipboard: /guest-crm/${fullProfileBooking.id}`)}
                    className="w-full py-2.5 bg-teal-800/60 text-teal-100 font-bold text-xs rounded-xl hover:bg-teal-800 transition-colors border border-teal-700"
                  >
                    Share Profile
                  </button>
                </div>
              </div>

              {/* Loyalty Insight Block */}
              <div className="bg-[#9b4922] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span>👑</span>
                  <h3 className="font-bold text-sm">Loyalty Insight</h3>
                </div>
                <p className="text-xs text-orange-100/90 leading-relaxed mt-2.5">
                  {fullProfileBooking.guestName} is in the top 5% of repeat guests. He often refers friends from Mumbai.
                </p>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-[10px] font-bold text-orange-200">
                    <span>NEXT REWARD</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-white/15 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div className="bg-orange-300 h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                  <p className="text-[10px] text-orange-200 mt-2 font-medium">1 more stay for a complimentary spa session.</p>
                </div>
              </div>

              {/* Home Base Section */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm">
                <h4 className="text-[10px] uppercase font-bold text-slate-400">Home Base</h4>
                <p className="text-xs font-bold text-slate-800 mt-0.5">Mumbai, India</p>

                {/* Elegant map vector placeholder illustration as shown in mockup */}
                <div className="bg-slate-100 rounded-2xl h-36 mt-3 relative overflow-hidden border border-slate-200 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0f766e_1.5px,transparent_1.5px)] [background-size:12px_12px]" />
                  <div className="p-3 bg-white/95 border border-slate-200/80 rounded-xl shadow-lg relative text-center z-10">
                    <p className="text-[9px] uppercase font-bold text-teal-800">Location Insights</p>
                    <p className="text-[10px] font-extrabold text-slate-800 mt-0.5">Mumbai Coastal Link</p>
                    <span className="text-[9px] text-slate-400 mt-1 block">~320 km drive distance</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}


      {/* -------------------------------------------------------------
          SUB-VIEW C: MAIN RESERVATIONS SCREEN (1st & 2nd Screenshots)
          ------------------------------------------------------------- */}
      {!viewingFullProfileId && !viewingInvoiceId && (
        <>
          {/* Left Block: Reservations Panel & Detailed list (takes major screen space) */}
          <div className="flex-1 p-8 overflow-y-auto h-full flex flex-col gap-6">
            
            {/* Header Title Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <div>
                <h2 className="text-3xl font-extrabold font-serif text-teal-950 tracking-tight leading-none">
                  Reservations
                </h2>
                <p className="text-slate-500 text-xs mt-2 font-medium">
                  Manage room allocations and guest check-ins for the next 14 days.
                </p>
              </div>
              <button 
                id="btn-trigger-bookings-new"
                onClick={onOpenBookingModal}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Booking</span>
              </button>
            </div>

            {/* 14-Day Timeline Room Allocations Grid Layout (Mockup style) */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
                {/* Month Range Selector */}
                <div className="flex items-center gap-3">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors border border-slate-100">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-700">Oct 14 - Oct 27, 2023</span>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors border border-slate-100">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Legend badges */}
                <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-700" />
                    Confirmed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Pending
                  </span>
                </div>
              </div>

              {/* Grid / Schedule Row view */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400">
                      <th className="py-2.5 text-left font-bold text-slate-500 pr-4 min-w-[120px]">Rooms</th>
                      {timelineDays.map((day, idx) => (
                        <th key={idx} className="py-2 px-1 text-center font-bold uppercase min-w-[42px] border-l border-slate-50">
                          <span className="block text-[8px] text-slate-400 font-medium">{day.name}</span>
                          <span className="block text-xs font-bold text-slate-700 mt-0.5">{day.num}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    
                    {/* Room 101 Deluxe Stay Row */}
                    <tr>
                      <td className="py-4 text-xs font-bold text-slate-700 flex items-center justify-between pr-2">
                        <span>101 Deluxe</span>
                        <span title="View Room Detail" className="cursor-pointer text-[10px] text-slate-300 hover:text-slate-500">ℹ</span>
                      </td>
                      {/* Rajesh stay covers 14, 15, 16 (3 nights) */}
                      <td colSpan={3} className="py-2 px-1">
                        <div 
                          id="timeline-bar-b1"
                          onClick={() => setSelectedBookingId('b-1')}
                          className="h-8 bg-teal-800 text-white rounded-xl flex items-center px-3 justify-between shadow-sm cursor-pointer hover:bg-teal-900 hover:scale-[1.01] transition-all group duration-150"
                        >
                          <span className="text-[9px] font-bold truncate">Rajesh Kumar</span>
                          <span className="text-[8px] opacity-75 font-medium shrink-0">3n</span>
                        </div>
                      </td>
                      {/* Remaining 11 days empty slots */}
                      {Array.from({ length: 11 }).map((_, idx) => (
                        <td key={idx} className="py-4 border-l border-slate-50 px-1 hover:bg-slate-50/50 transition-colors" />
                      ))}
                    </tr>

                    {/* Room 102 Suite Stay Row */}
                    <tr>
                      <td className="py-4 text-xs font-bold text-slate-700 flex items-center justify-between pr-2">
                        <span>102 Suite</span>
                        <span className="text-[10px] text-slate-300 hover:text-slate-500 cursor-pointer">ℹ</span>
                      </td>
                      {/* Empty columns before Oct 19: 14 (Mon) to 18 (Fri) is 5 days */}
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <td key={idx} className="py-4 border-l border-slate-50 px-1 hover:bg-slate-50/50 transition-colors" />
                      ))}
                      {/* Anita Singh stay: Oct 19 to 21 (2 nights) */}
                      <td colSpan={2} className="py-2 px-1">
                        <div 
                          id="timeline-bar-b2"
                          onClick={() => setSelectedBookingId('b-2')}
                          className="h-8 bg-amber-500 text-white rounded-xl flex items-center px-3 justify-between shadow-sm cursor-pointer hover:bg-amber-600 hover:scale-[1.01] transition-all group duration-150"
                        >
                          <span className="text-[9px] font-bold truncate">Anita Singh</span>
                          <span className="text-[8px] opacity-75 font-medium shrink-0">2n</span>
                        </div>
                      </td>
                      {/* Remaining 7 days empty */}
                      {Array.from({ length: 7 }).map((_, idx) => (
                        <td key={idx} className="py-4 border-l border-slate-50 px-1 hover:bg-slate-50/50 transition-colors" />
                      ))}
                    </tr>

                    {/* Room 103 Sea View Stay Row */}
                    <tr>
                      <td className="py-4 text-xs font-bold text-slate-700 flex items-center justify-between pr-2">
                        <span>103 Sea View</span>
                        <span className="text-[10px] text-slate-300 hover:text-slate-500 cursor-pointer">ℹ</span>
                      </td>
                      {/* Empty Oct 14 (Mon) - 1 day */}
                      <td className="py-4 hover:bg-slate-50/50" />
                      {/* Vikram stay: Oct 15 to Oct 19 (4 nights) */}
                      <td colSpan={4} className="py-2 px-1">
                        <div 
                          id="timeline-bar-b3"
                          onClick={() => setSelectedBookingId('b-3')}
                          className="h-8 bg-slate-300 text-slate-700 border border-slate-300/40 rounded-xl flex items-center px-3 justify-between shadow-sm cursor-pointer hover:bg-slate-300/80 hover:scale-[1.01] transition-all group duration-150"
                        >
                          <span className="text-[9px] font-bold truncate">Vikram Mehta</span>
                          <span className="text-[8px] text-slate-500 font-medium shrink-0">4n</span>
                        </div>
                      </td>
                      {/* Remaining 9 days empty */}
                      {Array.from({ length: 9 }).map((_, idx) => (
                        <td key={idx} className="py-4 border-l border-slate-50 px-1 hover:bg-slate-50/50 transition-colors" />
                      ))}
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Reservations List Block (Bottom half) */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
              
              {/* Filter Row header */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Detailed List</h3>
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {/* Search Bar Input */}
                  <div className="relative flex-1 sm:flex-initial sm:w-48">
                    <span className="absolute inset-y-0 left-2.5 flex items-center text-slate-400">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Search guests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-teal-700 text-slate-700"
                    />
                  </div>

                  {/* Room Category dropdown */}
                  <select 
                    id="table-room-filter"
                    value={roomFilter} 
                    onChange={(e) => setRoomFilter(e.target.value)}
                    className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="All">All Room Types</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Sea View">Sea View</option>
                  </select>

                  {/* Booking Status dropdown */}
                  <select 
                    id="table-status-filter"
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                  </select>

                  <button 
                    onClick={() => alert("Detailed list filters reset.")}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 font-bold text-xs border border-slate-200/80 flex items-center gap-1"
                  >
                    <Filter className="w-3 h-3" />
                    <span>More Filters</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-3 font-semibold">Guest Name</th>
                      <th className="py-3 font-semibold">Room</th>
                      <th className="py-3 font-semibold">Dates</th>
                      <th className="py-3 font-semibold">Amount</th>
                      <th className="py-3 font-semibold">Booking</th>
                      <th className="py-3 font-semibold">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">No bookings found matching filters.</td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        const isSelected = selectedBookingId === b.id;
                        
                        return (
                          <tr 
                            id={`bookings-table-row-${b.id}`}
                            key={b.id}
                            onClick={() => setSelectedBookingId(b.id)}
                            className={`hover:bg-slate-50 transition-colors cursor-pointer group ${isSelected ? 'bg-teal-50/30' : ''}`}
                          >
                            {/* Guest info */}
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-[10px] text-slate-600 border border-slate-200">
                                  {b.avatar}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-xs group-hover:text-teal-900 transition-colors">{b.guestName}</h4>
                                  <p className="text-[10px] text-slate-400 font-medium">{b.guestPhone}</p>
                                </div>
                              </div>
                            </td>

                            {/* Room info */}
                            <td className="py-3.5">
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{b.roomNumber}</h4>
                                <p className="text-[10px] text-slate-400 font-semibold">{b.roomCategory}</p>
                              </div>
                            </td>

                            {/* Stay Dates */}
                            <td className="py-3.5">
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{b.startDate} - {b.endDate.split(' ')[1] || b.endDate}</h4>
                                <p className="text-[10px] text-slate-400 font-medium">{b.nights} Nights</p>
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="py-3.5 font-bold text-slate-800">
                              {formatCurrency(b.amount)}
                            </td>

                            {/* Booking status badge */}
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                b.bookingStatus === 'Confirmed' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {b.bookingStatus}
                              </span>
                            </td>

                            {/* Payment status badge */}
                            <td className="py-3.5">
                              <span 
                                onClick={(e) => {
                                  e.stopPropagation(); // Avoid triggering details select
                                  handleOpenInvoice(b.id);
                                }}
                                title="Click to view detailed receipt/invoice statement"
                                className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] border hover:underline cursor-pointer ${
                                  b.paymentStatus === 'Paid' 
                                    ? 'bg-teal-50 text-teal-800 border-teal-100' 
                                    : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                                }`}
                              >
                                {b.paymentStatus}
                              </span>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

          {/* Right Block Drawer Panel: Guest Details Sidebar (1st Screenshot Right Column) */}
          {selectedBooking && (
            <div id="guest-drawer-panel" className="w-[360px] h-full bg-slate-50 border-l border-slate-200/80 py-6 px-6 overflow-y-auto shrink-0 flex flex-col justify-between font-sans shadow-lg animate-in slide-in-from-right duration-200">
              
              <div className="flex flex-col gap-6">
                {/* Header title */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <h3 className="font-extrabold text-slate-800 text-sm">Guest Details</h3>
                  <button 
                    onClick={() => setSelectedBookingId(null)}
                    className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile card block */}
                <div className="flex flex-col items-center text-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    alt={selectedBooking.guestName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                  />
                  <h4 className="text-base font-extrabold text-slate-800 tracking-tight mt-3">
                    {selectedBooking.guestName}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                    {selectedBooking.membership} • {selectedBooking.stayHistory.length + 1} Stays
                  </p>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 mt-4 w-full">
                    <button
                      id="drawer-whatsapp-btn"
                      onClick={() => handleSendWhatsApp(selectedBooking.guestName, selectedBooking.guestPhone)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-emerald-600/15"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send WhatsApp</span>
                    </button>
                    <button
                      onClick={() => alert(`Calling guest: ${selectedBooking.guestPhone}`)}
                      title="Make phone call"
                      className="p-2 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid metrics highlight cards */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Spend</span>
                    <p className="text-sm font-extrabold text-teal-800 mt-1">{formatCurrency(selectedBooking.totalSpend)}</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Avg Daily Rate</span>
                    <p className="text-sm font-extrabold text-teal-800 mt-1">{formatCurrency(selectedBooking.avgDailyRate)}</p>
                  </div>
                </div>

                {/* Notes and Preferences block */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Internal Notes</h4>
                  
                  {/* Dynamic notes feed */}
                  <div className="flex flex-col gap-2.5 max-h-[140px] overflow-y-auto pr-1 text-slate-600">
                    {selectedBooking.notes.map((note, index) => (
                      <div key={index} className="text-[11px] leading-normal bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        {note}
                      </div>
                    ))}
                  </div>

                  {/* Notes composer */}
                  <div className="flex gap-2 mt-1">
                    <input
                      id="drawer-add-note-input"
                      type="text"
                      placeholder="Add custom staff preference note..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-700"
                    />
                    <button
                      id="drawer-add-note-btn"
                      onClick={handleAddNote}
                      className="px-2.5 py-1.5 bg-teal-800 hover:bg-teal-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      + Note
                    </button>
                  </div>
                </div>

                {/* Recent activity block */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Recent Activity</h4>
                  <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto pr-1">
                    {selectedBooking.stayHistory.length === 0 ? (
                      <p className="text-[10px] text-slate-400">First stay registered today.</p>
                    ) : (
                      selectedBooking.stayHistory.map((history) => (
                        <div key={history.id} className="flex items-center justify-between text-[11px]">
                          <div>
                            <p className="font-bold text-slate-800 truncate max-w-[150px]">{history.roomType} • Room {history.room.match(/\d+/)?.[0] || '104'}</p>
                            <span className="text-[9px] text-slate-400 font-medium">{history.dates.split(',')[0]}</span>
                          </div>
                          <span className="font-bold text-slate-800">{formatCurrency(history.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* View Full Profile Card Button (Triggers Profile Sub-view) */}
              <div className="mt-6 border-t border-slate-200/60 pt-4">
                <button
                  id="drawer-view-profile-btn"
                  onClick={() => handleOpenFullProfile(selectedBooking.id)}
                  className="w-full text-center py-2.5 bg-slate-200/60 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-2xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Detailed Guest Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}
