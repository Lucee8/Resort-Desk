import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  ChevronRight,
  Wrench,
  Eye,
  CheckCircle2,
  MoreVertical,
  Edit3,
  Compass,
  Palmtree,
  Wifi,
  Flame,
  Coffee,
  X,
  Sparkles,
  BedDouble,
  Sliders,
  Wind,
  Calendar,
} from 'lucide-react';
import {
  RoomCategory,
  PropertyAmenity,
  RoomUnit,
  MaintenanceTicket,
} from '../types';
import { formatINR } from '../utils/bookingUtils';

interface RoomsViewProps {
  categories: RoomCategory[];
  rooms: RoomUnit[];
  amenities: PropertyAmenity[];
  maintenanceTickets: MaintenanceTicket[];
  blockedDays: number[];
  onUpdateCategory: (category: RoomCategory) => Promise<void> | void;
  onAddCategory: (category: RoomCategory) => Promise<void> | void;
  onUpdateAmenity: (amenity: PropertyAmenity) => Promise<void> | void;
  onAddAmenity: (amenity: PropertyAmenity) => Promise<void> | void;
  onUpdateRoomStatus: (
    roomId: string,
    status: RoomUnit['status'],
    note?: string
  ) => Promise<void> | void;
  onSaveBlockedDays: (days: number[]) => Promise<void> | void;
  onOpenMaintenanceModule: () => void;
  triggerToast: (msg: string) => void;
}

export default function RoomsView({
  categories,
  rooms,
  amenities,
  maintenanceTickets,
  blockedDays,
  onUpdateCategory,
  onAddCategory,
  onUpdateAmenity,
  onAddAmenity,
  onUpdateRoomStatus,
  onSaveBlockedDays,
  onOpenMaintenanceModule,
  triggerToast,
}: RoomsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<RoomCategory | null>(null);
  const [isUpdateRatesOpen, setIsUpdateRatesOpen] = useState(false);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isNewAmenityOpen, setIsNewAmenityOpen] = useState(false);
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  const [isBlockedDatesModalOpen, setIsBlockedDatesModalOpen] = useState(false);
  const [isAllAmenitiesModalOpen, setIsAllAmenitiesModalOpen] = useState(false);
  const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);

  // New Category input states
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatActive, setNewCatActive] = useState(1);
  const [newCatBase, setNewCatBase] = useState(7200);
  const [newCatWeekend, setNewCatWeekend] = useState(8200);
  const [newCatPeak, setNewCatPeak] = useState(9800);

  // New Amenity input states
  const [newAmenityName, setNewAmenityName] = useState('');
  const [newAmenityStatus, setNewAmenityStatus] = useState<'Enabled' | 'Offline'>('Enabled');

  const now = new Date();
  const currentMonthLabel = now.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstWeekdayOffset = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const monthDays = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (r) =>
        r.roomName.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.categoryName.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [rooms, searchQuery]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const handleSaveCategoryPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await onUpdateCategory(editingCategory);
      setEditingCategory(null);
    } catch (err: any) {
      triggerToast(err?.message || 'Failed updating category rate in Firestore.');
    }
  };

  const handleDayClick = async (dayNum: number) => {
    const nextDays = blockedDays.includes(dayNum)
      ? blockedDays.filter((d) => d !== dayNum)
      : [...blockedDays, dayNum].sort((a, b) => a - b);
    setSelectedDay(dayNum);
    try {
      await onSaveBlockedDays(nextDays);
    } catch (err: any) {
      triggerToast(err?.message || 'Could not update blocked dates in Firestore.');
    }
  };

  const handleToggleAmenity = async (amenity: PropertyAmenity) => {
    const nextStatus = amenity.status === 'Enabled' ? 'Offline' : 'Enabled';
    try {
      await onUpdateAmenity({ ...amenity, status: nextStatus });
    } catch (err: any) {
      triggerToast(err?.message || 'Could not update amenity status.');
    }
  };

  const handleSaveNewAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmenityName.trim()) return;
    const item: PropertyAmenity = {
      id: `pa-${Date.now()}`,
      name: newAmenityName.trim(),
      status: newAmenityStatus,
      icon: 'sparkles',
    };
    try {
      await onAddAmenity(item);
      setNewAmenityName('');
      setIsNewAmenityOpen(false);
    } catch (err: any) {
      triggerToast(err?.message || 'Could not save amenity.');
    }
  };

  const handleSaveNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const cat: RoomCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      description: newCatDesc.trim() || 'Coastal Tarkarli cottage segment.',
      activeCount: Number(newCatActive) || 1,
      amenities: ['Wi-Fi 6', 'Sea Breeze Veranda'],
      basePrice: Number(newCatBase) || 7200,
      weekendPrice: Number(newCatWeekend) || 8200,
      peakPrice: Number(newCatPeak) || 9800,
      iconType: 'cottage',
    };
    try {
      await onAddCategory(cat);
      setNewCatName('');
      setNewCatDesc('');
      setIsNewCategoryOpen(false);
    } catch (err: any) {
      triggerToast(err?.message || 'Could not add category.');
    }
  };

  const handleRoomStatusChange = async (room: RoomUnit, nextStatus: RoomUnit['status']) => {
    setUpdatingRoomId(room.id);
    try {
      await onUpdateRoomStatus(
        room.id,
        nextStatus,
        nextStatus === 'Maintenance' ? 'Marked Maintenance from Rooms Management' : ''
      );
    } catch (err: any) {
      triggerToast(err?.message || 'Could not update room status.');
    } finally {
      setUpdatingRoomId(null);
    }
  };

  const renderCategoryIcon = (type: string) => {
    switch (type) {
      case 'suite':
        return (
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800">
            <BedDouble className="w-5 h-5" />
          </div>
        );
      case 'sea-view':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
            <Wind className="w-5 h-5" />
          </div>
        );
      case 'cottage':
        return (
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700">
            <Palmtree className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <Compass className="w-5 h-5" />
          </div>
        );
    }
  };

  const renderAmenityTagIcon = (amenityName: string) => {
    const lowercase = amenityName.toLowerCase();
    if (lowercase.includes('wifi') || lowercase.includes('wi-fi')) {
      return <Wifi className="w-3.5 h-3.5 text-slate-400" />;
    }
    if (lowercase.includes('pool') || lowercase.includes('bath') || lowercase.includes('shower')) {
      return <Flame className="w-3.5 h-3.5 text-slate-400" />;
    }
    if (lowercase.includes('bar') || lowercase.includes('espresso') || lowercase.includes('dining')) {
      return <Coffee className="w-3.5 h-3.5 text-slate-400" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-slate-400" />;
  };

  const activeMaintenanceTickets = useMemo(
    () => maintenanceTickets.filter((t) => t.status !== 'Closed' && t.status !== 'Resolved'),
    [maintenanceTickets]
  );

  const statusBadgeClass = (status: RoomUnit['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Occupied':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Deep Clean':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Maintenance':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      id="room-management-layout"
      className="flex flex-col xl:flex-row w-full bg-[#f8fafc] font-sans text-slate-800 min-h-full"
    >
      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8 min-w-0">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-200/60 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-teal-950 flex items-center gap-2">
              <span>Cottages &amp; Room Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live status for {rooms.length} Mykonos Cottage units, seasonal tariff tiers, inventory locks, and maintenance sync.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search cottage or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-teal-700 transition-all text-slate-700 shadow-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsNewCategoryOpen(true)}
              className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* SECTION 0: LIVE COTTAGE UNITS GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Cottage Units ({filteredRooms.length})</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update housekeeping/maintenance status directly in Cloud Firestore.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {rooms.filter((r) => r.status === 'Available').length} Available
              </span>
              <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {rooms.filter((r) => r.status === 'Occupied').length} Occupied
              </span>
              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {rooms.filter((r) => r.status === 'Maintenance').length} Maint.
              </span>
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No cottage units match your search filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{room.roomName}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusBadgeClass(
                            room.status
                          )}`}
                        >
                          {room.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {room.categoryName} • {room.floorOrWing}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-teal-900">
                      {formatINR(room.ratePerNight)}/nt
                    </span>
                  </div>

                  {room.maintenanceNote && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/70 rounded-lg px-2.5 py-1">
                      Note: {room.maintenanceNote}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Max {room.maxAdults}A + {room.maxChildren}C
                    </span>
                    <select
                      aria-label={`Status for ${room.roomName}`}
                      disabled={updatingRoomId === room.id}
                      value={room.status}
                      onChange={(e) =>
                        void handleRoomStatusChange(room, e.target.value as RoomUnit['status'])
                      }
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-teal-700 cursor-pointer"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Deep Clean">Deep Clean</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 1: ROOM CATEGORIES */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Room Categories</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage cottage segments and base tariff values.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAllCategoriesOpen(true)}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Categories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                id={`room-cat-card-${cat.id}`}
                className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between min-h-[190px] group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    {renderCategoryIcon(cat.iconType)}
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-full">
                      {cat.activeCount} Active
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-900 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {cat.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200/70 rounded-lg text-[10px] font-bold text-slate-500"
                      >
                        {renderAmenityTagIcon(amenity)}
                        <span>{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Base Rate
                    </span>
                    <p className="text-base font-extrabold text-teal-900 mt-0.5">
                      {formatINR(cat.basePrice)}
                      <span className="text-xs font-normal text-slate-400">/night</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingCategory(cat)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                    title="Edit Rate Values"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: SEASONAL PRICING ADJUSTMENTS */}
        <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Seasonal Pricing Adjustments</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tariff tiers for weekdays, Tarkarli weekends, and holiday peaks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsUpdateRatesOpen(true)}
              className="px-4 py-2 bg-teal-900 hover:bg-teal-950 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer self-start sm:self-auto"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Update Rates</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[480px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-2.5 font-bold text-slate-500">Category</th>
                  <th className="py-2.5 font-bold text-slate-500">Weekday</th>
                  <th className="py-2.5 font-bold text-slate-500">Weekend</th>
                  <th className="py-2.5 font-bold text-slate-500">Peak Season</th>
                  <th className="py-2.5 text-right font-bold text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-bold text-slate-800 text-xs">{cat.name}</td>
                    <td className="py-4 font-semibold text-slate-700">{formatINR(cat.basePrice)}</td>
                    <td className="py-4 font-bold text-orange-700">{formatINR(cat.weekendPrice)}</td>
                    <td className="py-4 font-bold text-teal-800">{formatINR(cat.peakPrice)}</td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(cat)}
                        className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: CANONICAL MAINTENANCE STATUS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Maintenance Status</h2>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold rounded-full">
                {activeMaintenanceTickets.length} Open Ticket{activeMaintenanceTickets.length === 1 ? '' : 's'}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenMaintenanceModule}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 cursor-pointer"
            >
              Open Maintenance Board →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenanceTickets.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-400">
                No maintenance tickets recorded in Firestore.
              </div>
            ) : (
              maintenanceTickets.map((ticket) => {
                const isClosed = ticket.status === 'Closed' || ticket.status === 'Resolved';
                const isInProgress =
                  ticket.status === 'In Progress' || ticket.status === 'Assigned';
                const statusColor = isClosed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : isInProgress
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-rose-50 text-rose-700 border-rose-100';

                return (
                  <div
                    key={ticket.id}
                    onClick={onOpenMaintenanceModule}
                    className="bg-white rounded-2xl border border-slate-200/70 p-4 flex items-center justify-between shadow-sm hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${statusColor}`}
                      >
                        {isClosed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isInProgress ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <Wrench className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 truncate">
                          {ticket.roomNumber} • {ticket.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {ticket.category} • {ticket.priority} Priority
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border uppercase tracking-wider shrink-0 ${statusColor}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR PANEL (Responsive: stacks below on small screens, 360px on xl) */}
      <div className="w-full xl:w-[360px] xl:border-l border-t xl:border-t-0 border-slate-200/80 bg-white p-6 shrink-0 flex flex-col gap-6 font-sans">
        {/* CARD 1: INVENTORY LOCK */}
        <div className="bg-slate-50/50 rounded-3xl border border-slate-200/70 p-5 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-800" />
              <span>Inventory Lock</span>
            </h3>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {blockedDays.length} Blocked
            </span>
          </div>

          <div className="mt-4">
            <p className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 text-center mb-3">
              {currentMonthLabel}
            </p>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 font-bold mb-4">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>

              {Array.from({ length: firstWeekdayOffset }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

              {monthDays.map((dayNum) => {
                const isBlocked = blockedDays.includes(dayNum);
                const isSelected = selectedDay === dayNum;

                let classes =
                  'w-7 h-7 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer font-bold ';
                if (isBlocked) {
                  classes += 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 ';
                } else if (isSelected) {
                  classes += 'bg-teal-900 text-white hover:bg-teal-950 ';
                } else {
                  classes += 'hover:bg-slate-200/70 text-slate-700 ';
                }

                return (
                  <button
                    type="button"
                    key={dayNum}
                    className={classes}
                    onClick={() => void handleDayClick(dayNum)}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 bg-white border border-slate-200/70 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1" />
              <div>
                <p className="font-bold text-slate-800 text-[11px]">Click Any Date to Lock/Unlock</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Blocked dates are saved in Firestore and prevent online booking slots.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBlockedDatesModalOpen(true)}
              className="w-full text-center py-2.5 mt-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              Manage Blocked Dates ({blockedDays.length})
            </button>
          </div>
        </div>

        {/* CARD 2: PROPERTY AMENITIES */}
        <div className="bg-slate-50/50 rounded-3xl border border-slate-200/70 p-5 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 mb-4">
            <h3 className="font-extrabold text-slate-800 text-sm">Property Amenities</h3>
            <button
              type="button"
              onClick={() => setIsNewAmenityOpen(true)}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Add Amenity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {amenities.map((amenity) => (
              <div
                key={amenity.id}
                onClick={() => void handleToggleAmenity(amenity)}
                className="flex items-center justify-between p-3 bg-white border border-slate-200/70 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  {amenity.name}
                </span>

                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ${
                    amenity.status === 'Enabled'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {amenity.status}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsAllAmenitiesModalOpen(true)}
            className="w-full text-center py-2.5 mt-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            Manage All Amenities
          </button>
        </div>
      </div>

      {/* MODAL 1: EDIT CATEGORY RATE DIALOG */}
      {editingCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Update Rates: {editingCategory.name}</h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryPrice} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Weekday Rate (₹)
                </label>
                <input
                  type="number"
                  value={editingCategory.basePrice}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, basePrice: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Weekend Rate (₹)
                </label>
                <input
                  type="number"
                  value={editingCategory.weekendPrice}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      weekendPrice: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Peak Season Rate (₹)
                </label>
                <input
                  type="number"
                  value={editingCategory.peakPrice}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, peakPrice: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl hover:bg-teal-950 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE ALL RATES */}
      {isUpdateRatesOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Global Seasonal Rate Update</h3>
              <button
                type="button"
                onClick={() => setIsUpdateRatesOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Apply a bulk tariff adjustment across all {categories.length} cottage categories in Cloud Firestore.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await Promise.all(
                      categories.map((c) =>
                        onUpdateCategory({
                          ...c,
                          basePrice: Math.round(c.basePrice * 1.1),
                          weekendPrice: Math.round(c.weekendPrice * 1.1),
                        })
                      )
                    );
                    setIsUpdateRatesOpen(false);
                    triggerToast('Applied +10% peak seasonal rate adjustment across all categories.');
                  }}
                  className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center cursor-pointer hover:bg-rose-100/60"
                >
                  <p className="font-bold text-rose-700 text-xs">Peak Surge</p>
                  <p className="text-[10px] text-rose-500 mt-1">+10% markup</p>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await Promise.all(
                      categories.map((c) =>
                        onUpdateCategory({
                          ...c,
                          basePrice: Math.round(c.basePrice * 0.9),
                          weekendPrice: Math.round(c.weekendPrice * 0.9),
                        })
                      )
                    );
                    setIsUpdateRatesOpen(false);
                    triggerToast('Applied -10% monsoon/off-season discount across all categories.');
                  }}
                  className="p-4 bg-teal-50 border border-teal-100 rounded-2xl text-center cursor-pointer hover:bg-teal-100/60"
                >
                  <p className="font-bold text-teal-800 text-xs">Off-Season</p>
                  <p className="text-[10px] text-teal-600 mt-1">-10% discount</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateRatesOpen(false);
                    if (categories[0]) setEditingCategory(categories[0]);
                  }}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center cursor-pointer hover:bg-slate-100"
                >
                  <p className="font-bold text-slate-700 text-xs">Custom Edit</p>
                  <p className="text-[10px] text-slate-400 mt-1">Per category</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW CATEGORY */}
      {isNewCategoryOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Add Custom Room Segment</h3>
              <button
                type="button"
                onClick={() => setIsNewCategoryOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCategory} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunset Plunge Cottage"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description Tagline
                </label>
                <textarea
                  placeholder="Describe the cottage views & amenities..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Active Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCatActive}
                    onChange={(e) => setNewCatActive(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Weekday Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={newCatBase}
                    onChange={(e) => setNewCatBase(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewCategoryOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl hover:bg-teal-950 cursor-pointer"
                >
                  Add Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD NEW AMENITY */}
      {isNewAmenityOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Add Property Amenity</h3>
              <button
                type="button"
                onClick={() => setIsNewAmenityOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAmenity} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Amenity Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kayaking Gear, Scuba Desk"
                  value={newAmenityName}
                  onChange={(e) => setNewAmenityName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={newAmenityStatus}
                  onChange={(e) => setNewAmenityStatus(e.target.value as 'Enabled' | 'Offline')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  <option value="Enabled">Enabled (Online)</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewAmenityOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl hover:bg-teal-950 cursor-pointer"
                >
                  Add Amenity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ALL CATEGORIES OVERVIEW */}
      {isAllCategoriesOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">
                Mykonos Cottage Segments ({categories.length})
              </h3>
              <button
                type="button"
                onClick={() => setIsAllCategoriesOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 max-h-80 overflow-y-auto text-xs">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-[11px] text-slate-500">{c.activeCount} cottage units</p>
                  </div>
                  <div className="text-right font-bold text-teal-900">
                    {formatINR(c.basePrice)} – {formatINR(c.peakPrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: MANAGE BLOCKED DATES */}
      {isBlockedDatesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">
                Blocked Dates — {currentMonthLabel}
              </h3>
              <button
                type="button"
                onClick={() => setIsBlockedDatesModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-3">
              {blockedDays.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">
                  No dates blocked this month. Click any date in the calendar to lock inventory.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {blockedDays.map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => void handleDayClick(d)}
                      className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {d} {currentMonthLabel.split(' ')[0]}
                      </span>
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
              <div className="pt-3 flex justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={async () => {
                    await onSaveBlockedDays([]);
                    setIsBlockedDatesModalOpen(false);
                  }}
                  className="px-3 py-1.5 text-rose-700 font-bold hover:bg-rose-50 rounded-xl cursor-pointer"
                >
                  Clear All Locks
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlockedDatesModalOpen(false)}
                  className="px-4 py-1.5 bg-teal-900 text-white font-bold rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: MANAGE ALL AMENITIES */}
      {isAllAmenitiesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">All Property Amenities</h3>
              <button
                type="button"
                onClick={() => setIsAllAmenitiesModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {amenities.map((a) => (
                <div
                  key={a.id}
                  onClick={() => void handleToggleAmenity(a)}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100"
                >
                  <span className="text-xs font-bold text-slate-800">{a.name}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      a.status === 'Enabled'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-200 text-slate-500 border-slate-300'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
