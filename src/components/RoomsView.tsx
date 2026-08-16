import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
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
  Check, 
  X, 
  Sparkles,
  BedDouble,
  Sliders,
  Wind
} from 'lucide-react';
import { RoomCategory, PropertyAmenity, RoomMaintenanceStatus } from '../types';

interface RoomsViewProps {
  categories: RoomCategory[];
  amenities: PropertyAmenity[];
  maintenance: RoomMaintenanceStatus[];
  onUpdateCategory: (category: RoomCategory) => void;
  onUpdateAmenity: (amenity: PropertyAmenity) => void;
  onAddAmenity: (amenity: PropertyAmenity) => void;
  onUpdateMaintenance: (maint: RoomMaintenanceStatus) => void;
  onAddCategory: (category: RoomCategory) => void;
  onAddMaintenance: (maint: RoomMaintenanceStatus) => void;
}

export default function RoomsView({
  categories,
  amenities,
  maintenance,
  onUpdateCategory,
  onUpdateAmenity,
  onAddAmenity,
  onUpdateMaintenance,
  onAddCategory,
  onAddMaintenance
}: RoomsViewProps) {
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingCategory, setEditingCategory] = useState<RoomCategory | null>(null);
  const [isUpdateRatesOpen, setIsUpdateRatesOpen] = useState(false);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isNewAmenityOpen, setIsNewAmenityOpen] = useState(false);
  const [isNewMaintenanceOpen, setIsNewMaintenanceOpen] = useState(false);

  // New Category input states
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatActive, setNewCatActive] = useState(10);
  const [newCatBase, setNewCatBase] = useState(5000);
  const [newCatWeekend, setNewCatWeekend] = useState(6000);
  const [newCatPeak, setNewCatPeak] = useState(8000);
  const [newCatAmenities, setNewCatAmenities] = useState<string[]>(['Wi-Fi 6']);

  // New Amenity input states
  const [newAmenityName, setNewAmenityName] = useState('');
  const [newAmenityStatus, setNewAmenityStatus] = useState<'Enabled' | 'Offline'>('Enabled');

  // New Maintenance input states
  const [newMaintRoom, setNewMaintRoom] = useState('');
  const [newMaintType, setNewMaintType] = useState('Deluxe');
  const [newMaintIssue, setNewMaintIssue] = useState('');
  const [newMaintStatus, setNewMaintStatus] = useState<'Under Repair' | 'Pending' | 'Verified' | 'Scheduled'>('Pending');

  // Interactive blocked dates state for October 2023
  // Circled red in screenshot: 6, 7. Selected teal: 11
  const [blockedDays, setBlockedDays] = useState<number[]>([6, 7]);
  const [selectedDay, setSelectedDay] = useState<number | null>(11);

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // Handle price update submission
  const handleSaveCategoryPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      onUpdateCategory(editingCategory);
      setEditingCategory(null);
    }
  };

  // Toggle calendar block day
  const handleDayClick = (dayNum: number) => {
    if (blockedDays.includes(dayNum)) {
      setBlockedDays(prev => prev.filter(d => d !== dayNum));
    } else {
      setBlockedDays(prev => [...prev, dayNum]);
    }
    setSelectedDay(dayNum);
  };

  // Toggle Property Amenity Status
  const handleToggleAmenity = (amenity: PropertyAmenity) => {
    const nextStatus = amenity.status === 'Enabled' ? 'Offline' : 'Enabled';
    onUpdateAmenity({
      ...amenity,
      status: nextStatus
    });
  };

  // Save new Amenity
  const handleSaveNewAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmenityName.trim()) return;
    const item: PropertyAmenity = {
      id: `pa-${Date.now()}`,
      name: newAmenityName.trim(),
      status: newAmenityStatus,
      icon: 'sparkles'
    };
    onAddAmenity(item);
    setNewAmenityName('');
    setIsNewAmenityOpen(false);
  };

  // Save new Category
  const handleSaveNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const cat: RoomCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      description: newCatDesc.trim() || 'No description provided.',
      activeCount: Number(newCatActive),
      amenities: newCatAmenities,
      basePrice: Number(newCatBase),
      weekendPrice: Number(newCatWeekend),
      peakPrice: Number(newCatPeak),
      iconType: 'suite'
    };
    onAddCategory(cat);
    setNewCatName('');
    setNewCatDesc('');
    setIsNewCategoryOpen(false);
  };

  // Save new Maintenance status item
  const handleSaveNewMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaintRoom.trim() || !newMaintIssue.trim()) return;
    const maint: RoomMaintenanceStatus = {
      id: `rm-${Date.now()}`,
      roomNumber: newMaintRoom.trim(),
      roomType: newMaintType,
      issue: newMaintIssue.trim(),
      status: newMaintStatus
    };
    onAddMaintenance(maint);
    setNewMaintRoom('');
    setNewMaintIssue('');
    setIsNewMaintenanceOpen(false);
  };

  // Helper formatting for currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Icon chooser helper for categories
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
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-700">
            <Compass className="w-5 h-5" />
          </div>
        );
    }
  };

  // Render small icons for category amenities
  const renderAmenityTagIcon = (amenityName: string) => {
    const lowercase = amenityName.toLowerCase();
    if (lowercase.includes('wifi') || lowercase.includes('wi-fi')) {
      return <Wifi className="w-3.5 h-3.5 text-slate-400" />;
    }
    if (lowercase.includes('jacuzzi') || lowercase.includes('pool') || lowercase.includes('bath')) {
      return <Flame className="w-3.5 h-3.5 text-slate-400" />;
    }
    if (lowercase.includes('bar') || lowercase.includes('drink') || lowercase.includes('dining')) {
      return <Coffee className="w-3.5 h-3.5 text-slate-400" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-slate-400" />;
  };

  // Cycle maintenance status
  const handleCycleMaintStatus = (item: RoomMaintenanceStatus) => {
    const statuses: ('Under Repair' | 'Pending' | 'Verified' | 'Scheduled')[] = ['Under Repair', 'Pending', 'Verified', 'Scheduled'];
    const currentIndex = statuses.indexOf(item.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onUpdateMaintenance({
      ...item,
      status: nextStatus
    });
  };

  // Calendar constant details for Oct 2023 (Starts on Sunday Oct 1st, 31 days)
  const oct2023Days = Array.from({ length: 31 }, (_, i) => i + 1);
  const octStartOffset = 0; // Sunday Oct 1 is day 0 offset index

  return (
    <div id="room-management-layout" className="flex h-full w-full bg-[#f8fafc] overflow-hidden font-sans text-slate-800">
      
      {/* LEFT & CENTER PANEL (Main contents) */}
      <div className="flex-1 p-8 overflow-y-auto h-full flex flex-col gap-8">
        
        {/* Upper Header Row with Title & Inner search bar matching screenshot */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-200/60 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-teal-950 flex items-center gap-2">
              <span>Room Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure room inventory segments, optimize seasonal rates, lock dates, and monitor real-time maintenance.
            </p>
          </div>

          {/* Search bar inside header container */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Find room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-teal-700 transition-all text-slate-700 shadow-sm"
              />
            </div>
            
            <button
              onClick={() => setIsNewCategoryOpen(true)}
              className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            SECTION 1: ROOM CATEGORIES
            ----------------------------------------------------------------- */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-850">Room Categories</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage inventory segments and base values.</p>
            </div>
            <button 
              onClick={() => alert(`Resort currently manages a total of ${categories.reduce((acc, c) => acc + c.activeCount, 0)} live active rooms across coastal segments.`)}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1"
            >
              <span>View All Categories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid Layout of Room Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => (
              <div 
                key={cat.id}
                id={`room-cat-card-${cat.id}`}
                className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between min-h-[190px] group"
              >
                {/* Upper row */}
                <div>
                  <div className="flex justify-between items-start mb-3">
                    {renderCategoryIcon(cat.iconType)}
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-full">
                      {cat.activeCount} Active
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-850 group-hover:text-teal-900 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Amenities pills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {cat.amenities.map((amenity, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-150 rounded-lg text-[10px] font-bold text-slate-500"
                      >
                        {renderAmenityTagIcon(amenity)}
                        <span>{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom row */}
                <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Base Rate</span>
                    <p className="text-base font-extrabold text-teal-900 mt-0.5">
                      {formatCurrency(cat.basePrice)}
                      <span className="text-xs font-normal text-slate-400">/night</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setEditingCategory(cat)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors border border-slate-150"
                    title="Edit Rate Values"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -----------------------------------------------------------------
            SECTION 2: SEASONAL PRICING ADJUSTMENTS
            ----------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-850">Seasonal Pricing Adjustments</h2>
              <p className="text-xs text-slate-400 mt-0.5">Automated rate variations for weekends and monsoons.</p>
            </div>
            <button
              onClick={() => setIsUpdateRatesOpen(true)}
              className="px-4 py-2 bg-teal-850 hover:bg-teal-950 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Update Rates</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-2.5 font-bold text-slate-500">Category</th>
                  <th className="py-2.5 font-bold text-slate-500">Weekday</th>
                  <th className="py-2.5 font-bold text-slate-500">Weekend</th>
                  <th className="py-2.5 font-bold text-slate-500">Peak (Monsoon)</th>
                  <th className="py-2.5 text-right font-bold text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-bold text-slate-800 text-xs">
                      {cat.name}
                    </td>
                    <td className="py-4 font-semibold text-slate-700">
                      {formatCurrency(cat.basePrice)}
                    </td>
                    <td className="py-4 font-bold text-orange-700">
                      {formatCurrency(cat.weekendPrice)}
                    </td>
                    <td className="py-4 font-bold text-teal-800">
                      {formatCurrency(cat.peakPrice)}
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => setEditingCategory(cat)}
                        className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
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

        {/* -----------------------------------------------------------------
            SECTION 3: MAINTENANCE STATUS
            ----------------------------------------------------------------- */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-850">Maintenance Status</h2>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold rounded-full">
                {maintenance.filter(m => m.status === 'Under Repair' || m.status === 'Pending').length} Attention Required
              </span>
            </div>
            <button
              onClick={() => setIsNewMaintenanceOpen(true)}
              className="text-xs font-bold text-teal-800 hover:text-teal-950"
            >
              + Add Log
            </button>
          </div>

          {/* Grid stack for maintenance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenance.map((item) => {
              
              // Define statuses matching mockups
              let statusColor = '';
              let badgeText = item.status;
              let iconBox = null;

              if (item.status === 'Under Repair') {
                statusColor = 'bg-rose-50 text-rose-700 border-rose-100';
                iconBox = (
                  <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
                    <Wrench className="w-4 h-4" />
                  </div>
                );
              } else if (item.status === 'Pending') {
                statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                iconBox = (
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                    <Eye className="w-4 h-4" />
                  </div>
                );
              } else if (item.status === 'Verified') {
                statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                iconBox = (
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                );
              } else {
                statusColor = 'bg-slate-100 text-slate-600 border-slate-200';
                iconBox = (
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-600">
                    <Compass className="w-4 h-4" />
                  </div>
                );
              }

              return (
                <div 
                  key={item.id}
                  onClick={() => handleCycleMaintStatus(item)}
                  title="Click to cycle maintenance status"
                  className="bg-white rounded-2xl border border-slate-200/60 p-4.5 flex items-center justify-between shadow-sm hover:bg-slate-50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    {iconBox}
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">
                        {item.roomNumber} - <span className="font-medium text-slate-500">{item.roomType}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.issue}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border uppercase tracking-wider ${statusColor}`}>
                    {badgeText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* -----------------------------------------------------------------
          RIGHT SIDEBAR PANEL (Matching Screenshot Layout perfectly)
          ----------------------------------------------------------------- */}
      <div className="w-[360px] border-l border-slate-200/80 bg-white p-6 overflow-y-auto h-full shrink-0 flex flex-col gap-6 font-sans">
        
        {/* CARD 1: INVENTORY LOCK */}
        <div className="bg-slate-50/50 rounded-3xl border border-slate-200/70 p-5 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-slate-150">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <span>Inventory Lock</span>
            </h3>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-4">
            <p className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 text-center mb-3">
              October 2023
            </p>

            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 font-bold mb-4">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              
              {/* Render offset empty spaces if needed */}
              {Array.from({ length: octStartOffset }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

              {/* Render Days */}
              {oct2023Days.map((dayNum) => {
                const isBlocked = blockedDays.includes(dayNum);
                const isSelected = selectedDay === dayNum;

                let classes = 'w-7 h-7 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer font-bold ';
                if (isBlocked) {
                  classes += 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 ';
                } else if (isSelected) {
                  classes += 'bg-teal-850 text-white hover:bg-teal-900 ';
                } else {
                  classes += 'hover:bg-slate-150 text-slate-700 ';
                }

                return (
                  <div 
                    key={dayNum} 
                    className={classes}
                    onClick={() => handleDayClick(dayNum)}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>

            {/* Legend block */}
            <div className="p-3.5 bg-white border border-slate-150 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1" />
              <div>
                <p className="font-bold text-slate-800 text-[11px]">Block for Maintenance</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Blocking inventory prevents automatic bookings for selected dates.
                </p>
              </div>
            </div>

            <button
              onClick={() => alert(`Currently locked calendar dates: ${blockedDays.join(', ')} October 2023. Automatic bookings are blocked for these days.`)}
              className="w-full text-center py-2.5 mt-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Manage Blocked Dates
            </button>
          </div>
        </div>

        {/* CARD 2: PROPERTY AMENITIES */}
        <div className="bg-slate-50/50 rounded-3xl border border-slate-200/70 p-5 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-slate-150 mb-4">
            <h3 className="font-extrabold text-slate-800 text-sm">Property Amenities</h3>
            <button 
              onClick={() => setIsNewAmenityOpen(true)}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {amenities.map((amenity) => (
              <div 
                key={amenity.id}
                onClick={() => handleToggleAmenity(amenity)}
                className="flex items-center justify-between p-3 bg-white border border-slate-150 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-sm">🏝</span>
                  {amenity.name}
                </span>

                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ${
                  amenity.status === 'Enabled' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {amenity.status}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => alert("Custom Property Amenities management interface opened!")}
            className="w-full text-center py-2.5 mt-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Manage All Amenities
          </button>
        </div>

      </div>

      {/* -----------------------------------------------------------------
          MODAL 1: EDIT CATEGORY RATE DIALOG
          ----------------------------------------------------------------- */}
      {editingCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Update Rates: {editingCategory.name}</h3>
              <button 
                onClick={() => setEditingCategory(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
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
                  onChange={(e) => setEditingCategory({ ...editingCategory, basePrice: Number(e.target.value) })}
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
                  onChange={(e) => setEditingCategory({ ...editingCategory, weekendPrice: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Peak (Monsoon) Rate (₹)
                </label>
                <input
                  type="number"
                  value={editingCategory.peakPrice}
                  onChange={(e) => setEditingCategory({ ...editingCategory, peakPrice: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-850 text-white rounded-xl hover:bg-teal-905"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------
          MODAL 2: UPDATE ALL RATES MULTI-SELECT
          ----------------------------------------------------------------- */}
      {isUpdateRatesOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Global Seasonal Rate Update</h3>
              <button 
                onClick={() => setIsUpdateRatesOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose a pricing tier configuration to adjust rates sitewide.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div 
                  onClick={() => {
                    categories.forEach(c => {
                      onUpdateCategory({
                        ...c,
                        basePrice: Math.round(c.basePrice * 1.1),
                        weekendPrice: Math.round(c.weekendPrice * 1.1)
                      });
                    });
                    setIsUpdateRatesOpen(false);
                    alert("Rates incremented by 10% for peak seasonal demand.");
                  }}
                  className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center cursor-pointer hover:bg-rose-100/50"
                >
                  <p className="font-bold text-rose-700 text-xs">Peak Surge</p>
                  <p className="text-[10px] text-rose-400 mt-1">+10% markup</p>
                </div>

                <div 
                  onClick={() => {
                    categories.forEach(c => {
                      onUpdateCategory({
                        ...c,
                        basePrice: Math.round(c.basePrice * 0.9),
                        weekendPrice: Math.round(c.weekendPrice * 0.9)
                      });
                    });
                    setIsUpdateRatesOpen(false);
                    alert("Rates discounted by 10% for off-season promo campaign.");
                  }}
                  className="p-4 bg-teal-50 border border-teal-100 rounded-2xl text-center cursor-pointer hover:bg-teal-100/50"
                >
                  <p className="font-bold text-teal-800 text-xs">Off-Season</p>
                  <p className="text-[10px] text-teal-400 mt-1">-10% discount</p>
                </div>

                <div 
                  onClick={() => {
                    alert("Custom tier optimization configured.");
                    setIsUpdateRatesOpen(false);
                  }}
                  className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center cursor-pointer hover:bg-slate-100"
                >
                  <p className="font-bold text-slate-700 text-xs">Balanced</p>
                  <p className="text-[10px] text-slate-400 mt-1">Default baselines</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  onClick={() => setIsUpdateRatesOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------
          MODAL 3: ADD NEW CATEGORY
          ----------------------------------------------------------------- */}
      {isNewCategoryOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Add Custom Room Segment</h3>
              <button 
                onClick={() => setIsNewCategoryOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
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
                  placeholder="e.g. Deluxe Villa, Beachfront Suite"
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
                  placeholder="e.g. Premium panoramic ocean views with private terrace..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Active Inventory
                  </label>
                  <input
                    type="number"
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
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-850 text-white rounded-xl hover:bg-teal-905"
                >
                  Add Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------
          MODAL 4: ADD NEW AMENITY
          ----------------------------------------------------------------- */}
      {isNewAmenityOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Add Property Amenity</h3>
              <button 
                onClick={() => setIsNewAmenityOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
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
                  placeholder="e.g. Wellness Spa, Tennis Court"
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
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-850 text-white rounded-xl hover:bg-teal-905"
                >
                  Add Amenity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------
          MODAL 5: ADD NEW MAINTENANCE LOG
          ----------------------------------------------------------------- */}
      {isNewMaintenanceOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Add Maintenance Log</h3>
              <button 
                onClick={() => setIsNewMaintenanceOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMaintenance} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 402"
                  value={newMaintRoom}
                  onChange={(e) => setNewMaintRoom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Room Segment
                </label>
                <input
                  type="text"
                  placeholder="e.g. Suite, Cottage, Deluxe"
                  value={newMaintType}
                  onChange={(e) => setNewMaintType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Issue Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Geyser thermostat malfunctioning"
                  value={newMaintIssue}
                  onChange={(e) => setNewMaintIssue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Initial Status
                </label>
                <select
                  value={newMaintStatus}
                  onChange={(e) => setNewMaintStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  <option value="Under Repair">Under Repair</option>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewMaintenanceOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-850 text-white rounded-xl hover:bg-teal-905"
                >
                  Log Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
