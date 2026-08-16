import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Calendar, 
  User, 
  DollarSign, 
  CheckCircle, 
  Plus, 
  X, 
  Layers, 
  FileText, 
  Brush, 
  TrendingUp, 
  MessageSquare, 
  AlertCircle 
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import StatsGrid from './components/StatsGrid';
import ArrivalsCard from './components/ArrivalsCard';
import DeparturesCard from './components/DeparturesCard';
import OccupancyChart from './components/OccupancyChart';
import PendingPaymentsCard from './components/PendingPaymentsCard';
import PulseCard from './components/PulseCard';
import AIDeskCard from './components/AIDeskCard';
import BookingsView from './components/BookingsView';
import RoomsView from './components/RoomsView';
import GuestsCRMView from './components/GuestsCRMView';
import HousekeepingView from './components/HousekeepingView';

import { 
  initialArrivals, 
  initialDepartures, 
  initialHousekeeping, 
  initialMaintenance, 
  initialOccupancyHistory, 
  initialStats, 
  resortDetails,
  initialBookings,
  initialRoomCategories,
  initialPropertyAmenities,
  initialRoomMaintenance,
  initialGuestsCRM
} from './data';

import { Arrival, Departure, HousekeepingTask, MaintenanceAlert, Booking, RoomCategory, PropertyAmenity, RoomMaintenanceStatus, GuestCRM } from './types';

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core entities state
  const [arrivals, setArrivals] = useState<Arrival[]>(initialArrivals);
  const [departures, setDepartures] = useState<Departure[]>(initialDepartures);
  const [housekeeping, setHousekeeping] = useState<HousekeepingTask[]>(initialHousekeeping);
  const [maintenance, setMaintenance] = useState<MaintenanceAlert[]>(initialMaintenance);
  const [stats, setStats] = useState(initialStats);
  const [occupancyHistory, setOccupancyHistory] = useState(initialOccupancyHistory);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  // Room Management states
  const [categories, setCategories] = useState<RoomCategory[]>(initialRoomCategories);
  const [propertyAmenities, setPropertyAmenities] = useState<PropertyAmenity[]>(initialPropertyAmenities);
  const [roomMaintenance, setRoomMaintenance] = useState<RoomMaintenanceStatus[]>(initialRoomMaintenance);

  // Guest CRM states
  const [guestsCRM, setGuestsCRM] = useState<GuestCRM[]>(() => {
    const saved = localStorage.getItem('resortdesk_guests_crm');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return initialGuestsCRM;
  });

  const handleUpdateGuestCRM = (updated: GuestCRM) => {
    setGuestsCRM(prev => {
      const next = prev.map(g => g.id === updated.id ? updated : g);
      localStorage.setItem('resortdesk_guests_crm', JSON.stringify(next));
      return next;
    });
    triggerToast(`CRM profile updated for ${updated.name}`);
  };

  const handleAddGuestCRM = (newGuest: GuestCRM) => {
    setGuestsCRM(prev => {
      const next = [...prev, newGuest];
      localStorage.setItem('resortdesk_guests_crm', JSON.stringify(next));
      return next;
    });
    triggerToast(`New guest ${newGuest.name} registered to CRM database!`);
  };

  // Modal toggle states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showAiActionModal, setShowAiActionModal] = useState(false);
  
  // Custom toast notification banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected billing detail for modal
  const [billingDetail, setBillingDetail] = useState<{ name: string; amount: number } | null>(null);

  // Notifications count state
  const [notificationsCount, setNotificationsCount] = useState(2);

  // Quick reservation input form state
  const [newBookingName, setNewBookingName] = useState('');
  const [newBookingRoom, setNewBookingRoom] = useState('');
  const [newBookingPrice, setNewBookingPrice] = useState('5500');

  // Helper: Trigger custom transient toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Housekeeping remaining count for badge
  const pendingHousekeepingCount = useMemo(() => {
    return housekeeping.filter(h => h.status !== 'Verified').length;
  }, [housekeeping]);

  // Handle: Confirm custom Walk-in Booking
  const handleCreateWalkInBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingName || !newBookingRoom) return;

    const parsedPrice = parseFloat(newBookingPrice) || 5000;

    // Create a new arrival record
    const newArrival: Arrival = {
      id: `arr-${Date.now()}`,
      guestName: newBookingName,
      roomNumber: newBookingRoom,
      status: 'Expected',
      avatar: newBookingName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    };

    setArrivals(prev => [newArrival, ...prev]);

    // Create a matching booking record for Bookings timeline/crm
    const matchedBooking: Booking = {
      id: `b-${Date.now()}`,
      guestName: newBookingName,
      guestEmail: `${newBookingName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      guestPhone: '+91 99123 45678',
      roomNumber: `${newBookingRoom} Deluxe`,
      roomType: `${newBookingRoom} Deluxe`,
      roomCategory: 'King Bed',
      startDate: 'Oct 14',
      endDate: 'Oct 17',
      nights: 3,
      amount: parsedPrice,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Unpaid',
      avatar: newBookingName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      membership: 'Regular Guest',
      totalSpend: parsedPrice,
      avgDailyRate: parsedPrice,
      notes: [
        "Created via walk-in desk manager.",
        "Expected early evening check-in on Mon Oct 14."
      ],
      preferences: ["Deluxe Cottage Room", "Walk-in Guest"],
      stayHistory: [],
      invoice: {
        invoiceNumber: `KR-2023-${Math.floor(1000 + Math.random() * 9000)}`,
        date: 'October 14, 2023',
        items: [
          { description: `${newBookingRoom} Deluxe cottage accommodation`, qty: 3, price: Math.round(parsedPrice / 3), amount: parsedPrice }
        ],
        subtotal: parsedPrice,
        cgst: Math.round(parsedPrice * 0.09),
        sgst: Math.round(parsedPrice * 0.09),
        total: Math.round(parsedPrice * 1.18)
      }
    };
    setBookings(prev => [matchedBooking, ...prev]);

    // Update resort stats dynamically
    setStats(prev => {
      const nextOccupancy = Math.min(100, prev.occupancyRate + 3);
      return {
        ...prev,
        arrivalsTodayCount: prev.arrivalsTodayCount + 1,
        occupancyRate: nextOccupancy,
        revenue: prev.revenue + parsedPrice,
        revenueGrowth: prev.revenueGrowth + 1
      };
    });

    // Update occupancy history with fresh active rates
    setOccupancyHistory(prev => {
      return prev.map((day, idx) => {
        if (idx === prev.length - 1) { // Update Sunday (today)
          return { ...day, rate: Math.min(100, day.rate + 3), bookings: day.bookings + 1 };
        }
        return day;
      });
    });

    // Reset inputs & close
    setNewBookingName('');
    setNewBookingRoom('');
    setShowBookingModal(false);
    triggerToast(`Booking successfully added for ${newBookingName} (Room ${newBookingRoom})`);
  };

  // Handle adding arrival from the card form
  const handleAddArrival = (newArr: Omit<Arrival, 'id' | 'avatar'>) => {
    const fresh: Arrival = {
      ...newArr,
      id: `arr-${Date.now()}`,
      avatar: newArr.guestName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    };

    setArrivals(prev => [fresh, ...prev]);

    // Dynamic stat adjustments
    setStats(prev => ({
      ...prev,
      arrivalsTodayCount: prev.arrivalsTodayCount + 1,
      occupancyRate: Math.min(100, prev.occupancyRate + 2)
    }));

    triggerToast(`Arrival scheduled for ${newArr.guestName} in Room ${newArr.roomNumber}`);
  };

  // Handle: Guest Check-In Action
  const handleCheckInGuest = (id: string) => {
    setArrivals(prev => prev.map(item => {
      if (item.id === id) {
        triggerToast(`Checked In: ${item.guestName} to Room ${item.roomNumber}`);
        return { ...item, status: 'Checked In' };
      }
      return item;
    }));

    // Generate ₹5,500 checked-in revenue
    setStats(prev => ({
      ...prev,
      revenue: prev.revenue + 5500,
      revenueGrowth: prev.revenueGrowth + 2
    }));
  };

  // Handle: Guest Check-Out Action
  const handleCheckOutGuest = (id: string) => {
    setDepartures(prev => prev.map(item => {
      if (item.id === id) {
        triggerToast(`Checked Out: ${item.guestName} from Room ${item.roomNumber}`);
        return { ...item, status: 'Checked Out' };
      }
      return item;
    }));

    // Update stats departures count
    setStats(prev => ({
      ...prev,
      departuresTodayCount: Math.max(0, prev.departuresTodayCount - 1)
    }));
  };

  // Handle: AI Assistant "Take Action" (resolves priority housekeeping alerts)
  const handleAiAutoResolveHousekeeping = () => {
    setShowAiActionModal(true);
  };

  const confirmAiHousekeepingClean = () => {
    // Instantly set dirty/cleaning rooms to Cleaned
    setHousekeeping(prev => prev.map(task => ({ ...task, status: 'Cleaned' })));
    
    // Notify user
    triggerToast("AI Action: Ramesh Singh & Sunita Bai completed high priority Room cleanups!");
    setShowAiActionModal(false);
  };

  // Handle: Review guest bill from Pending Payments
  const handleReviewBilling = (name: string, amount: number) => {
    setBillingDetail({ name, amount });
    setShowBillingModal(true);
  };

  const handleClearNotifications = () => {
    setNotificationsCount(0);
    triggerToast("All notifications marked as read.");
  };

  // Dynamic filter lists based on Search Query
  const filteredArrivals = useMemo(() => {
    if (!searchQuery) return arrivals;
    const query = searchQuery.toLowerCase();
    return arrivals.filter(arr => 
      arr.guestName.toLowerCase().includes(query) || 
      arr.roomNumber.includes(query)
    );
  }, [arrivals, searchQuery]);

  const filteredDepartures = useMemo(() => {
    if (!searchQuery) return departures;
    const query = searchQuery.toLowerCase();
    return departures.filter(dep => 
      dep.guestName.toLowerCase().includes(query) || 
      dep.roomNumber.includes(query)
    );
  }, [departures, searchQuery]);

  return (
    <div id="resortdesk-container" className="flex h-screen bg-slate-100 overflow-hidden text-slate-800 font-sans">
      
      {/* Toast banner notifications */}
      {toastMessage && (
        <div id="toast-banner" className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-teal-950 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-xl border border-teal-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        branding={resortDetails.branding}
        housekeepingCount={pendingHousekeepingCount}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <DashboardHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notificationsCount={notificationsCount}
          onClearNotifications={handleClearNotifications}
        />

        {/* Dynamic Navigation Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' ? (
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
              
              {/* Morning Overview Banner Title */}
              <div id="dashboard-title-area">
                <h2 className="text-3xl font-bold font-serif text-teal-950 tracking-tight leading-none">
                  Morning Overview
                </h2>
                <p className="text-slate-500 text-sm mt-2 font-medium">
                  Here is what is happening at <span className="font-bold text-teal-800">{resortDetails.name}</span> today.
                </p>
              </div>

              {/* 4 Stat Cards Row */}
              <StatsGrid stats={stats} />

              {/* Lower Section Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Columns (Occupies 2 columns on desktop) */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Today's Arrivals */}
                  <ArrivalsCard 
                    arrivals={filteredArrivals}
                    onAddArrival={handleAddArrival}
                    onCheckIn={handleCheckInGuest}
                  />

                  {/* Today's Departures */}
                  <DeparturesCard 
                    departures={filteredDepartures}
                    onCheckOut={handleCheckOutGuest}
                    onReviewBilling={(name, amt) => handleReviewBilling(name, amt)}
                  />

                  {/* Local Area Pulse Banner Image Card (span full bottom left block) */}
                  <div className="md:col-span-2">
                    <PulseCard 
                      location={resortDetails.location}
                      weather={resortDetails.weather}
                      event={resortDetails.event}
                      bannerImage={resortDetails.bannerImage}
                    />
                  </div>
                </div>

                {/* Right Column Stack */}
                <div className="flex flex-col gap-6">
                  {/* 7-Day Occupancy Chart */}
                  <OccupancyChart history={occupancyHistory} />

                  {/* Pending Payments Widget */}
                  <PendingPaymentsCard 
                    amount={stats.pendingPaymentsAmount} 
                    onReview={() => handleReviewBilling('Amit Shah', 8200)}
                  />

                  {/* ResortDesk AI Operations Assistant */}
                  <AIDeskCard 
                    housekeepingTaskCount={pendingHousekeepingCount}
                    maintenanceAlertCount={maintenance.filter(m => m.status === 'Open').length}
                    onTakeAction={handleAiAutoResolveHousekeeping}
                    onNewBookingClick={() => setShowBookingModal(true)}
                  />
                </div>

              </div>

            </div>
          ) : activeTab === 'rooms' ? (
            <RoomsView 
              categories={categories}
              amenities={propertyAmenities}
              maintenance={roomMaintenance}
              onUpdateCategory={(updated) => {
                setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
                triggerToast(`Pricing rates updated successfully for ${updated.name}`);
              }}
              onUpdateAmenity={(updated) => {
                setPropertyAmenities(prev => prev.map(a => a.id === updated.id ? updated : a));
                triggerToast(`${updated.name} amenity status set to ${updated.status}`);
              }}
              onAddAmenity={(newA) => {
                setPropertyAmenities(prev => [...prev, newA]);
                triggerToast(`Custom property amenity ${newA.name} added!`);
              }}
              onUpdateMaintenance={(updated) => {
                setRoomMaintenance(prev => prev.map(m => m.id === updated.id ? updated : m));
                triggerToast(`Maintenance alert status updated!`);
              }}
              onAddCategory={(newC) => {
                setCategories(prev => [...prev, newC]);
                triggerToast(`New category segment ${newC.name} created!`);
              }}
              onAddMaintenance={(newM) => {
                setRoomMaintenance(prev => [...prev, newM]);
                triggerToast(`Maintenance log entered for ${newM.roomNumber}`);
              }}
            />
          ) : activeTab === 'guests' ? (
            <GuestsCRMView 
              guests={guestsCRM}
              onUpdateGuest={handleUpdateGuestCRM}
              onAddGuest={handleAddGuestCRM}
            />
          ) : activeTab === 'bookings' || activeTab === 'billing' ? (
            <BookingsView 
              bookings={bookings}
              onAddBooking={(newB) => {
                setBookings(prev => [newB, ...prev]);
                triggerToast(`Booking successfully added for ${newB.guestName}`);
              }}
              onUpdateBooking={(updatedB) => {
                setBookings(prev => prev.map(b => b.id === updatedB.id ? updatedB : b));
                triggerToast(`Preference profile updated for ${updatedB.guestName}`);
              }}
              onOpenBookingModal={() => setShowBookingModal(true)}
            />
          ) : activeTab === 'housekeeping' ? (
            <HousekeepingView 
              tasks={housekeeping}
              onUpdateTasks={setHousekeeping}
              triggerToast={triggerToast}
            />
          ) : (
            // Placeholder view for other modules
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 p-8 rounded-3xl shadow-sm text-center py-20 flex flex-col items-center gap-4">
              <div className="p-4 bg-teal-50 text-teal-800 rounded-full">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 capitalize">{activeTab} Module</h3>
              <p className="text-slate-500 text-sm max-w-md">
                You are currently viewing the placeholder shell for the <strong>{activeTab}</strong> management interface. 
                As requested, we are building 1 module at a time. ResortDesk AI is fully structured to activate this system block in the next sequence!
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-1 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full uppercase tracking-wider border border-teal-100">
                  Ready for Module Integration
                </span>
              </div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="mt-6 px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-semibold hover:bg-teal-900 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: WALK-IN / NEW BOOKING */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-teal-950 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">New Walk-In Reservation</h3>
              </div>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="text-teal-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateWalkInBooking} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Guest Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Mahindra"
                  value={newBookingName}
                  onChange={(e) => setNewBookingName(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-700 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Room Allocation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 104"
                    value={newBookingRoom}
                    onChange={(e) => setNewBookingRoom(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-700 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Room Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={newBookingPrice}
                    onChange={(e) => setNewBookingPrice(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-100 p-3.5 rounded-xl text-[11px] text-teal-800 flex items-start gap-2 leading-relaxed">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">AI Smart Suggestion</strong>
                  Our dynamic pricing system detects 85% occupancy. Suggested premium walk-in rate is <strong>₹6,200</strong>.
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-teal-900/10"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REVIEW PENDING BILLING */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-amber-950 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-200" />
                <h3 className="font-bold text-base">Guest Outstanding Invoice</h3>
              </div>
              <button 
                onClick={() => {
                  setShowBillingModal(false);
                  setBillingDetail(null);
                }}
                className="text-orange-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Primary Guest</h4>
                  <p className="text-sm font-bold text-slate-800">{billingDetail?.name || "Amit Shah"}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Room No.</h4>
                  <p className="text-sm font-bold text-slate-800">Room 105</p>
                </div>
              </div>

              {/* Bill Details */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Line Item Summary</h4>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Deluxe Cottage Stay (2 Nights)</span>
                  <span className="font-semibold text-slate-800">₹11,000</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Room Service & Seafood Platter</span>
                  <span className="font-semibold text-slate-800">₹3,200</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 border-b border-slate-100 pb-2.5">
                  <span>Spa & Massage Package</span>
                  <span className="font-semibold text-slate-800">₹2,200</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>Total Bill Amount</span>
                  <span>₹16,400</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                  <span>Amount Paid (Advance Checkout)</span>
                  <span>-₹8,200</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100">
                  <span>Outstanding Balances</span>
                  <span>₹{billingDetail?.amount || 8200}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => {
                    setShowBillingModal(false);
                    setBillingDetail(null);
                  }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    // Collect outstanding balances
                    setStats(prev => ({
                      ...prev,
                      pendingPaymentsAmount: Math.max(0, prev.pendingPaymentsAmount - (billingDetail?.amount || 8200)),
                      revenue: prev.revenue + (billingDetail?.amount || 8200)
                    }));
                    // Clear outstanding in departure list
                    setDepartures(prev => prev.map(d => d.guestName === (billingDetail?.name || "Amit Shah") ? { ...d, amountDue: 0 } : d));
                    setShowBillingModal(false);
                    setBillingDetail(null);
                    triggerToast("Payment successful! Outstanding balances collected.");
                  }}
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-teal-900/10"
                >
                  Collect ₹{billingDetail?.amount || 8200} Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AI DISPATCH ACTION OVERLAY */}
      {showAiActionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-teal-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Brush className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-base">AI Housekeeping Dispatcher</h3>
              </div>
              <button 
                onClick={() => setShowAiActionModal(false)}
                className="text-teal-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                ResortDesk AI identifies that early check-in is expected for **Sarah D'Souza** (Room 204) and **Rajesh Kumar** has already entered Room 102. 
                Our operations agent proposes dispatching **Ramesh Singh** and **Sunita Bai** immediately:
              </p>

              {/* Dispatch proposal list */}
              <div className="flex flex-col gap-2.5 mt-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Room 204 (Priority Prepare)</h4>
                    <p className="text-[10px] text-slate-400">Assigned: Ramesh Singh</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold rounded-lg">Cleaning</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Room 105 (Checkout Cleaning)</h4>
                    <p className="text-[10px] text-slate-400">Assigned: Sunita Bai</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 font-semibold rounded-lg">Dirty</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAiActionModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel Proposal
                </button>
                <button
                  type="button"
                  onClick={confirmAiHousekeepingClean}
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                >
                  Confirm Dispatch List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
