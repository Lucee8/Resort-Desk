import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
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
  UserPlus,
  Compass,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import {
  BillingInvoice,
  Booking,
  GuestCRM,
  GuestCRMHistoryItem,
  GuestCRMFeedback,
  GuestCRMPayment,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { upsertCollectionDoc } from '../services/resortDataService';
import { buildWhatsAppLink, getTodayISO, resolveBookingDatesISO } from '../utils/bookingUtils';

interface GuestsCRMViewProps {
  guests: GuestCRM[];
  bookings?: Booking[];
  invoices?: BillingInvoice[];
  onUpdateGuest: (updated: GuestCRM) => Promise<void> | void;
  onAddGuest: (newGuest: GuestCRM) => Promise<void> | void;
  triggerToast?: (msg: string) => void;
}

export default function GuestsCRMView({
  guests,
  bookings = [],
  invoices = [],
  onUpdateGuest,
  onAddGuest,
  triggerToast,
}: GuestsCRMViewProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState<string>(guests[0]?.id || '');

  useEffect(() => {
    if (guests.length > 0 && !guests.some((g) => g.id === selectedGuestId)) {
      setSelectedGuestId(guests[0].id);
    }
  }, [guests, selectedGuestId]);

  // Modals & popovers
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false);
  const [isNewFeedbackOpen, setIsNewFeedbackOpen] = useState(false);
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [showHelpPopover, setShowHelpPopover] = useState(false);
  const [showVipAlertsPopover, setShowVipAlertsPopover] = useState(false);
  const [showAllVisitsModal, setShowAllVisitsModal] = useState(false);
  const [receiptPreviewPayment, setReceiptPreviewPayment] = useState<GuestCRMPayment | null>(null);

  // Inline preference & note editors (no window.prompt!)
  const [isAddingPref, setIsAddingPref] = useState(false);
  const [newPrefTag, setNewPrefTag] = useState('');
  const [isEditingNoteInline, setIsEditingNoteInline] = useState(false);
  const [inlineNoteText, setInlineNoteText] = useState('');

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
  const [whatsAppText, setWhatsAppText] = useState(
    'Namaste from Mykonos Cottage, Tarkarli! We hope you are having a wonderful coastal getaway.'
  );

  // New guest states
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newBirthday, setNewBirthday] = useState('');
  const [newAnniversary, setNewAnniversary] = useState('');
  const [newVIP, setNewVIP] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  // New Visit states
  const [newVisitRoom, setNewVisitRoom] = useState('Cottage 101 - Deluxe Sea Facing');
  const [newVisitDates, setNewVisitDates] = useState('');
  const [newVisitNights, setNewVisitNights] = useState(2);
  const [newVisitStatus, setNewVisitStatus] = useState<'Completed' | 'Active' | 'Upcoming'>(
    'Completed'
  );

  // New Feedback states
  const [newFeedbackRating, setNewFeedbackRating] = useState(5);
  const [newFeedbackComments, setNewFeedbackComments] = useState('');
  const [newFeedbackStay, setNewFeedbackStay] = useState('Recent Stay • Mykonos Cottage');

  // New Payment states
  const [newPayInvoice, setNewPayInvoice] = useState('');
  const [newPayDate, setNewPayDate] = useState(getTodayISO());
  const [newPayAmount, setNewPayAmount] = useState(8500);
  const [newPayStatus, setNewPayStatus] = useState<
    'Paid via Card' | 'Paid via UPI' | 'Paid via Cash' | 'Pending'
  >('Paid via UPI');

  const notify = (msg: string) => {
    triggerToast?.(msg);
  };

  const selectedGuest = useMemo(() => {
    return guests.find((g) => g.id === selectedGuestId) || guests[0];
  }, [guests, selectedGuestId]);

  const searchFilteredGuests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(searchQuery) ||
        g.location.toLowerCase().includes(q)
    );
  }, [guests, searchQuery]);

  // Merge live Firestore Bookings for the selected guest with CRM visitHistory
  const mergedVisitHistory: GuestCRMHistoryItem[] = useMemo(() => {
    if (!selectedGuest) return [];
    const normPhone = selectedGuest.phone.replace(/\s+/g, '');
    const matchingBookings = bookings.filter(
      (b) =>
        b.guestId === selectedGuest.id ||
        (normPhone.length >= 8 && b.guestPhone?.replace(/\s+/g, '') === normPhone) ||
        (selectedGuest.email &&
          b.guestEmail?.toLowerCase() === selectedGuest.email.toLowerCase()) ||
        b.guestName.toLowerCase() === selectedGuest.name.toLowerCase()
    );

    const liveVisits: GuestCRMHistoryItem[] = matchingBookings.map((b) => {
      const { checkInISO, checkOutISO } = resolveBookingDatesISO(b);
      const mappedStatus: GuestCRMHistoryItem['status'] =
        b.bookingStatus === 'Checked-out'
          ? 'Completed'
          : b.bookingStatus === 'Checked-in'
          ? 'Active'
          : 'Upcoming';
      return {
        id: `bk-visit-${b.id}`,
        roomName: `${b.roomNumber} (${b.roomCategory})`,
        dateRange: `${checkInISO} – ${checkOutISO}`,
        nightsCount: b.nights,
        status: mappedStatus,
      };
    });

    const combined = [...liveVisits];
    selectedGuest.visitHistory.forEach((vh) => {
      if (!combined.some((c) => c.roomName === vh.roomName && c.dateRange === vh.dateRange)) {
        combined.push(vh);
      }
    });
    return combined;
  }, [selectedGuest, bookings]);

  // Merge live Firestore Invoices for the selected guest with CRM payments
  const mergedPayments: GuestCRMPayment[] = useMemo(() => {
    if (!selectedGuest) return [];
    const normPhone = selectedGuest.phone.replace(/\s+/g, '');
    const matchingInvoices = invoices.filter(
      (inv) =>
        inv.guestName.toLowerCase() === selectedGuest.name.toLowerCase() ||
        (normPhone.length >= 8 && inv.guestPhone?.replace(/\s+/g, '') === normPhone) ||
        (selectedGuest.email &&
          inv.guestEmail?.toLowerCase() === selectedGuest.email.toLowerCase())
    );

    const livePayments: GuestCRMPayment[] = matchingInvoices.map((inv) => {
      const method = (inv.paymentMethod || '').toLowerCase();
      const status: GuestCRMPayment['status'] =
        inv.status === 'Pending' || inv.status === 'Partial'
          ? 'Pending'
          : method.includes('cash')
          ? 'Paid via Cash'
          : method.includes('card')
          ? 'Paid via Card'
          : 'Paid via UPI';
      return {
        id: `inv-pay-${inv.id}`,
        invoiceId: inv.invoiceNumber,
        date: inv.issueDate,
        amount: inv.totalAmount,
        status,
      };
    });

    const combined = [...livePayments];
    selectedGuest.payments.forEach((p) => {
      if (!combined.some((c) => c.invoiceId === p.invoiceId)) {
        combined.push(p);
      }
    });
    return combined;
  }, [selectedGuest, invoices]);

  const vipArrivalsTodayCount = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.bookingStatus !== 'Cancelled' &&
          guests.some((g) => g.isVIP && g.name.toLowerCase() === b.guestName.toLowerCase())
      ).length,
    [bookings, guests]
  );

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

  const handleSaveEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;
    const parsedPrefs = editPreferencesString
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      await onUpdateGuest({
        ...selectedGuest,
        name: editName,
        phone: editPhone,
        email: editEmail,
        location: editLocation,
        birthday: editBirthday,
        anniversary: editAnniversary,
        isVIP: editVIP,
        generalNotes: editNotes,
        preferences: parsedPrefs,
      });
      setIsEditModalOpen(false);
    } catch (err: any) {
      notify(err?.message || 'Failed to update guest profile.');
    }
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const added: GuestCRM = {
      id: `g-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim() || '',
      email: newEmail.trim() || '',
      location: newLocation.trim() || 'Maharashtra, India',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      isVIP: newVIP,
      birthday: newBirthday || '—',
      anniversary: newAnniversary || '—',
      preferences: ['Coastal Cottage'],
      generalNotes: newNotes.trim() || 'Profile created via Front Desk CRM.',
      visitHistory: [],
      feedback: [],
      payments: [],
    };

    try {
      await onAddGuest(added);
      setSelectedGuestId(added.id);
      setIsAddGuestOpen(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewLocation('');
      setNewNotes('');
    } catch (err: any) {
      notify(err?.message || 'Could not create guest profile.');
    }
  };

  const handleAddInlinePref = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest || !newPrefTag.trim()) return;
    await onUpdateGuest({
      ...selectedGuest,
      preferences: Array.from(new Set([...selectedGuest.preferences, newPrefTag.trim()])),
    });
    setNewPrefTag('');
    setIsAddingPref(false);
  };

  const handleSaveInlineNote = async () => {
    if (!selectedGuest) return;
    await onUpdateGuest({
      ...selectedGuest,
      generalNotes: inlineNoteText.trim(),
    });
    setIsEditingNoteInline(false);
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    const visit: GuestCRMHistoryItem = {
      id: `vh-${Date.now()}`,
      roomName: newVisitRoom,
      dateRange: newVisitDates || getTodayISO(),
      nightsCount: Number(newVisitNights) || 1,
      status: newVisitStatus,
    };

    await onUpdateGuest({
      ...selectedGuest,
      visitHistory: [visit, ...selectedGuest.visitHistory],
    });
    setIsNewVisitOpen(false);
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    const fb: GuestCRMFeedback = {
      id: `fb-${Date.now()}`,
      rating: newFeedbackRating,
      comments: newFeedbackComments,
      stayLabel: newFeedbackStay,
    };

    await onUpdateGuest({
      ...selectedGuest,
      feedback: [fb, ...selectedGuest.feedback],
    });
    setNewFeedbackComments('');
    setIsNewFeedbackOpen(false);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    const invoiceNo =
      newPayInvoice.trim() || `MYK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const pay: GuestCRMPayment = {
      id: `py-${Date.now()}`,
      invoiceId: invoiceNo,
      date: newPayDate,
      amount: Number(newPayAmount),
      status: newPayStatus,
    };

    await onUpdateGuest({
      ...selectedGuest,
      payments: [pay, ...selectedGuest.payments],
    });
    setNewPayInvoice('');
    setIsNewPaymentOpen(false);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  const staffName = user?.displayName || user?.email?.split('@')[0] || 'Front Desk';

  return (
    <div
      id="guest-crm-layout"
      className="flex flex-col lg:flex-row min-h-full w-full bg-[#fafbfc] font-sans text-slate-800"
    >
      {/* LEFT GUEST DIRECTORY SIDEBAR (Desktop) */}
      <div className="hidden lg:flex w-64 border-r border-slate-200/80 bg-white/90 flex-col shrink-0">
        <div className="p-4 border-b border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              CRM Profiles
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {guests.length} Firestore guest record{guests.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddGuestOpen(true)}
            className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-lg border border-teal-100 transition-colors cursor-pointer"
            title="Create New Guest Profile"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[calc(100vh-12rem)]">
          {searchFilteredGuests.map((g) => {
            const isSelected = selectedGuestId === g.id;
            return (
              <button
                type="button"
                key={g.id}
                onClick={() => setSelectedGuestId(g.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-center gap-3 border cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/75 border-teal-200 shadow-sm text-teal-950'
                    : 'border-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="relative shrink-0">
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
            <div className="p-4 text-center text-xs text-slate-400">No guests found.</div>
          )}
        </div>
      </div>

      {/* MAIN CRM VIEW */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header
          id="mykonos-crm-header"
          className="border-b border-slate-200/80 bg-white px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0"
        >
          <div className="relative flex-1 min-w-[200px] max-w-md flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search guests by name, phone, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-700 transition-all"
            />
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              type="button"
              onClick={() => setIsAddGuestOpen(true)}
              className="lg:hidden px-3 py-1.5 bg-teal-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowHelpPopover((p) => !p);
                  setShowVipAlertsPopover(false);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">CRM Guide</span>
              </button>
              {showHelpPopover && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 text-xs text-slate-600 z-30">
                  <p className="font-bold text-slate-900 mb-1">Mykonos Guest CRM</p>
                  <p className="text-[11px] leading-relaxed">
                    Profiles sync automatically with Firestore Bookings &amp; Invoices. Deduplication prevents duplicate records for matching phone numbers or emails.
                  </p>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowVipAlertsPopover((p) => !p);
                  setShowHelpPopover(false);
                }}
                className="relative cursor-pointer p-1"
                aria-label="VIP Alerts"
              >
                <Bell className="w-[18px] h-[18px] text-slate-600" />
                {vipArrivalsTodayCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white" />
                )}
              </button>
              {showVipAlertsPopover && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 text-xs text-slate-600 z-30">
                  <p className="font-bold text-slate-900 mb-1">VIP Booking Activity</p>
                  <p className="text-[11px]">
                    {vipArrivalsTodayCount} active booking{vipArrivalsTodayCount === 1 ? '' : 's'} linked to VIP CRM profiles.
                  </p>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="text-right">
                <p className="font-extrabold text-xs text-slate-800 leading-none">{staffName}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                  Mykonos Tarkarli
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* MOBILE GUEST SELECTOR */}
        <div className="lg:hidden px-4 py-2.5 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {searchFilteredGuests.map((g) => (
            <button
              type="button"
              key={g.id}
              onClick={() => setSelectedGuestId(g.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border cursor-pointer ${
                selectedGuestId === g.id
                  ? 'bg-teal-900 text-white border-teal-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* CRM MAIN CANVAS */}
        {selectedGuest ? (
          <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
            {/* 1. MAIN GUEST HEADER PROFILE CARD */}
            <div
              id="guest-header-card"
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <img
                    src={selectedGuest.avatar}
                    alt={selectedGuest.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-slate-50 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 right-0 bg-white p-0.5 rounded-full shadow-md border border-slate-100 flex items-center justify-center">
                    <div className="bg-emerald-500 text-white rounded-full p-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {selectedGuest.name}
                    </h2>
                    {selectedGuest.isVIP && (
                      <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Loyal Guest / VIP
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-x-6 gap-y-1.5 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedGuest.phone || 'Not provided'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedGuest.email || 'Not provided'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedGuest.location}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsWhatsAppOpen(true)}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-[#25d366] hover:bg-[#20ba5a] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-white stroke-[0.5]" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={openEditModal}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* 2. TWO-COLUMN DETAILS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <h3 className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-4">
                    Key Dates
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-center">
                      <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-2">
                        <Gift className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">
                        Birthday
                      </p>
                      <p className="text-sm font-extrabold text-rose-700 mt-1">
                        {selectedGuest.birthday || '—'}
                      </p>
                    </div>

                    <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-center">
                      <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-2">
                        <Heart className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">
                        Anniversary
                      </p>
                      <p className="text-sm font-extrabold text-rose-700 mt-1">
                        {selectedGuest.anniversary || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                      Guest Preferences
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingPref((p) => !p)}
                      className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>

                  {isAddingPref && (
                    <form onSubmit={(e) => void handleAddInlinePref(e)} className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="e.g. Vegetarian, Sea Facing..."
                        value={newPrefTag}
                        onChange={(e) => setNewPrefTag(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-teal-700"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-teal-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Save
                      </button>
                    </form>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {selectedGuest.preferences.map((pref, i) => {
                      const isSevere =
                        pref.toLowerCase().includes('allergy') ||
                        pref.toLowerCase().includes('allergic');
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
                            type="button"
                            onClick={() => {
                              void onUpdateGuest({
                                ...selectedGuest,
                                preferences: selectedGuest.preferences.filter((_, idx) => idx !== i),
                              });
                            }}
                            className="hover:text-slate-900 ml-0.5 focus:outline-none cursor-pointer"
                            title="Remove preference"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                    {selectedGuest.preferences.length === 0 && (
                      <p className="text-xs text-slate-400 italic">
                        No special preference tags added yet.
                      </p>
                    )}
                  </div>

                  {/* General Notes */}
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                        General Notes
                      </span>
                      {!isEditingNoteInline && (
                        <button
                          type="button"
                          onClick={() => {
                            setInlineNoteText(selectedGuest.generalNotes);
                            setIsEditingNoteInline(true);
                          }}
                          className="text-[11px] text-teal-800 hover:text-teal-950 font-bold cursor-pointer"
                        >
                          Edit Note
                        </button>
                      )}
                    </div>

                    {isEditingNoteInline ? (
                      <div className="space-y-2">
                        <textarea
                          value={inlineNoteText}
                          onChange={(e) => setInlineNoteText(e.target.value)}
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-700"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingNoteInline(false)}
                            className="px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleSaveInlineNote()}
                            className="px-3 py-1 text-xs font-bold bg-teal-900 text-white rounded-lg cursor-pointer"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          &ldquo;{selectedGuest.generalNotes}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-7 space-y-6">
                {/* VISIT HISTORY */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      Visit History ({mergedVisitHistory.length})
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsNewVisitOpen(true)}
                        className="text-xs font-bold text-teal-800 hover:text-teal-950 cursor-pointer"
                      >
                        + Log Stay
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAllVisitsModal(true)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        View All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {mergedVisitHistory.slice(0, 4).map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl hover:bg-slate-50 transition-colors gap-2"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 shrink-0">
                            <Compass className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-slate-800 leading-snug truncate">
                              {v.roomName}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                              {v.dateRange} <span className="text-slate-300 mx-1">•</span>{' '}
                              {v.nightsCount} Night{v.nightsCount === 1 ? '' : 's'}
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0">
                          {v.status}
                        </span>
                      </div>
                    ))}

                    {mergedVisitHistory.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No stays on record yet. Reservations created in Bookings appear here automatically.
                      </div>
                    )}
                  </div>
                </div>

                {/* FEEDBACK & REVIEWS */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      Feedback &amp; Reviews
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsNewFeedbackOpen(true)}
                      className="text-xs font-bold text-teal-800 hover:text-teal-950 cursor-pointer"
                    >
                      + Add Feedback
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedGuest.feedback.map((f) => (
                      <div
                        key={f.id}
                        className="bg-white border border-slate-200/80 p-4 rounded-2xl relative flex flex-col justify-between"
                      >
                        <div>
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
                            &ldquo;{f.comments}&rdquo;
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                          {f.stayLabel}
                        </div>
                      </div>
                    ))}

                    {selectedGuest.feedback.length === 0 && (
                      <div className="col-span-2 p-6 text-center text-xs text-slate-400">
                        No feedback entered yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* RECENT PAYMENTS */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      Recent Payments ({mergedPayments.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsNewPaymentOpen(true)}
                      className="text-xs font-bold text-teal-800 hover:text-teal-950 cursor-pointer"
                    >
                      + Log Payment
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 min-w-[460px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                          <th className="py-2.5 font-bold">Invoice ID</th>
                          <th className="py-2.5 font-bold">Date</th>
                          <th className="py-2.5 font-bold">Amount</th>
                          <th className="py-2.5 font-bold">Status</th>
                          <th className="py-2.5 text-right font-bold">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mergedPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 font-bold text-teal-900">{p.invoiceId}</td>
                            <td className="py-3.5 text-slate-500 font-medium">{p.date}</td>
                            <td className="py-3.5 font-extrabold text-slate-900">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="py-3.5">
                              <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-slate-700">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    p.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                />
                                <span>{p.status}</span>
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => setReceiptPreviewPayment(p)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                                title="View Receipt"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {mergedPayments.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                              No payments recorded yet for this guest.
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
            <p className="text-sm">Select or add a Guest CRM Profile to view history &amp; folios.</p>
          </div>
        )}
      </div>

      {/* MODAL A: EDIT PROFILE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Edit Profile Details</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
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
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="editVIP"
                    checked={editVIP}
                    onChange={(e) => setEditVIP(e.target.checked)}
                    className="rounded border-slate-300 text-teal-800 focus:ring-teal-700"
                  />
                  <label htmlFor="editVIP" className="font-bold text-slate-700">
                    VIP Guest
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Birthday
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
                    Anniversary
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
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL B: REAL WHATSAPP LINK MODAL */}
      {isWhatsAppOpen && selectedGuest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-slate-900">WhatsApp Guest Concierge</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWhatsAppOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Compose message for <strong>{selectedGuest.name}</strong> ({selectedGuest.phone}):
              </p>

              <textarea
                value={whatsAppText}
                onChange={(e) => setWhatsAppText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 h-24 focus:outline-none focus:border-teal-700 font-medium"
              />

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsWhatsAppOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <a
                  href={buildWhatsAppLink(selectedGuest.phone, whatsAppText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    void upsertCollectionDoc('whatsappLogs', {
                      id: `wa-crm-${Date.now()}`,
                      guestName: selectedGuest.name,
                      guestPhone: selectedGuest.phone,
                      workflowName: 'Direct CRM Concierge',
                      nodeTitle: 'Manual Guest Message',
                      direction: 'outbound' as const,
                      messageText: whatsAppText,
                      status: 'sent' as const,
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    });
                    setIsWhatsAppOpen(false);
                    notify(`Opened WhatsApp chat for ${selectedGuest.name}.`);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-xl"
                >
                  <span>Open WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL C: ADD NEW GUEST */}
      {isAddGuestOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Create Guest CRM Profile</h3>
              <button
                type="button"
                onClick={() => setIsAddGuestOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGuest} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Full Name *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Phone *"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>
              <input
                type="text"
                placeholder="City / Location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Birthday (e.g. Oct 12)"
                  value={newBirthday}
                  onChange={(e) => setNewBirthday(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Anniversary"
                  value={newAnniversary}
                  onChange={(e) => setNewAnniversary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>
              <label className="flex items-center gap-2 font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={newVIP}
                  onChange={(e) => setNewVIP(e.target.checked)}
                />
                <span>Flag as Loyal / VIP Guest</span>
              </label>
              <textarea
                placeholder="Notes or dietary preferences..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 h-16"
              />
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGuestOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL D: LOG VISIT */}
      {isNewVisitOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Log Past / External Stay</h3>
              <button
                type="button"
                onClick={() => setIsNewVisitOpen(false)}
                className="p-1 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateVisit} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={newVisitRoom}
                onChange={(e) => setNewVisitRoom(e.target.value)}
                placeholder="Cottage / Room"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <input
                type="text"
                required
                value={newVisitDates}
                onChange={(e) => setNewVisitDates(e.target.value)}
                placeholder="Date Range (e.g. May 10 - May 12)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="1"
                  value={newVisitNights}
                  onChange={(e) => setNewVisitNights(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
                <select
                  value={newVisitStatus}
                  onChange={(e) =>
                    setNewVisitStatus(e.target.value as 'Completed' | 'Active' | 'Upcoming')
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                >
                  <option value="Completed">Completed</option>
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewVisitOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white font-bold rounded-xl cursor-pointer"
                >
                  Log Stay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL E: LOG FEEDBACK */}
      {isNewFeedbackOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Record Guest Feedback</h3>
              <button
                type="button"
                onClick={() => setIsNewFeedbackOpen(false)}
                className="p-1 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFeedback} className="space-y-3 text-xs">
              <select
                value={newFeedbackRating}
                onChange={(e) => setNewFeedbackRating(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              >
                <option value={5}>5 Stars — Outstanding</option>
                <option value={4}>4 Stars — Very Good</option>
                <option value={3}>3 Stars — Satisfactory</option>
                <option value={2}>2 Stars — Needs Attention</option>
                <option value={1}>1 Star — Escalation</option>
              </select>
              <input
                type="text"
                value={newFeedbackStay}
                onChange={(e) => setNewFeedbackStay(e.target.value)}
                placeholder="Stay context"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <textarea
                required
                placeholder="Guest review or front-desk remarks..."
                value={newFeedbackComments}
                onChange={(e) => setNewFeedbackComments(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 h-24"
              />
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewFeedbackOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL F: LOG PAYMENT */}
      {isNewPaymentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Log Guest Payment</h3>
              <button
                type="button"
                onClick={() => setIsNewPaymentOpen(false)}
                className="p-1 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePayment} className="space-y-3 text-xs">
              <input
                type="text"
                value={newPayInvoice}
                onChange={(e) => setNewPayInvoice(e.target.value)}
                placeholder="Invoice Ref (auto if blank)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <input
                type="text"
                value={newPayDate}
                onChange={(e) => setNewPayDate(e.target.value)}
                placeholder="Date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <input
                type="number"
                required
                min="1"
                value={newPayAmount}
                onChange={(e) => setNewPayAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
              <select
                value={newPayStatus}
                onChange={(e) => setNewPayStatus(e.target.value as GuestCRMPayment['status'])}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              >
                <option value="Paid via UPI">Paid via UPI</option>
                <option value="Paid via Card">Paid via Card</option>
                <option value="Paid via Cash">Paid via Cash</option>
                <option value="Pending">Pending</option>
              </select>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPaymentOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL G: ALL VISITS HISTORY */}
      {showAllVisitsModal && selectedGuest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">
                Complete Stay Archive — {selectedGuest.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowAllVisitsModal(false)}
                className="p-1 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 max-h-80 overflow-y-auto text-xs">
              {mergedVisitHistory.map((v) => (
                <div
                  key={v.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">{v.roomName}</p>
                    <p className="text-[11px] text-slate-500">
                      {v.dateRange} • {v.nightsCount} nights
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL H: RECEIPT PREVIEW / PRINT */}
      {receiptPreviewPayment && selectedGuest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Payment Receipt</h3>
              <button
                type="button"
                onClick={() => setReceiptPreviewPayment(null)}
                className="p-1 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="font-bold text-teal-950">Mykonos Cottage, Tarkarli</p>
              <p>Guest: {selectedGuest.name}</p>
              <p>Invoice / Ref: {receiptPreviewPayment.invoiceId}</p>
              <p>Date: {receiptPreviewPayment.date}</p>
              <p className="font-bold text-sm text-slate-900">
                Amount: {formatCurrency(receiptPreviewPayment.amount)}
              </p>
              <p>Status: {receiptPreviewPayment.status}</p>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReceiptPreviewPayment(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-teal-900 text-white font-bold rounded-xl cursor-pointer"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
