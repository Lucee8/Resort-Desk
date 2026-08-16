export interface Arrival {
  id: string;
  guestName: string;
  roomNumber: string;
  status: 'Checked In' | 'Arriving' | 'Expected';
  avatar: string;
  phone?: string;
  checkInTime?: string;
}

export interface Departure {
  id: string;
  guestName: string;
  roomNumber: string;
  status: 'Pending' | 'Checked Out' | 'Scheduled';
  avatar: string;
  checkoutTime?: string;
  amountDue?: number;
}

export interface HousekeepingChecklistItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  type: string; // e.g. 'Deluxe Sea View' or 'Standard Garden'
  status: 'Pending' | 'In Progress' | 'Cleaned' | 'Verified';
  assignedTo?: string; // Room Assignment
  assignedAvatar?: string;
  priority: 'Normal' | 'High' | 'Urgent'; // Priority Rooms (with ! URGENT badge)
  checklist: HousekeepingChecklistItem[]; // Cleaning Checklist
  photoVerified: boolean; // Photo Verification
  photoUrl?: string; // Photo Verification thumbnail
  completionTime?: string; // Completion Time (e.g. "25 mins" or "Active timer")
  elapsedMinutes?: number;
}

export interface MaintenanceAlert {
  id: string;
  roomNumber: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
}

export interface OccupancyDay {
  day: string;
  rate: number;
  bookings: number;
}

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomType: string;
  roomCategory: string; // 'King Bed', 'Terrace', etc.
  startDate: string;
  endDate: string;
  nights: number;
  amount: number;
  bookingStatus: 'Confirmed' | 'Pending' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  avatar: string;
  membership: string; // "Platinum Member", "Gold Member", "Regular Guest", etc.
  totalSpend: number;
  avgDailyRate: number;
  notes: string[];
  preferences: string[];
  stayHistory: {
    id: string;
    room: string;
    roomType: string;
    dates: string;
    nights: number;
    amount: number;
    status: 'PAID' | 'UNPAID';
  }[];
  invoice: {
    invoiceNumber: string;
    date: string;
    items: { description: string; qty: number; price: number; amount: number }[];
    subtotal: number;
    cgst: number;
    sgst: number;
    total: number;
  };
}

export interface ResortStats {
  occupancyRate: number;
  occupancyGrowth: number;
  revenue: number;
  revenueGrowth: number;
  arrivalsTodayCount: number;
  departuresTodayCount: number;
  pendingPaymentsAmount: number;
}

export interface RoomCategory {
  id: string;
  name: string;
  description: string;
  activeCount: number;
  amenities: string[];
  basePrice: number;
  weekendPrice: number;
  peakPrice: number;
  iconType: 'suite' | 'sea-view' | 'cottage';
}

export interface PropertyAmenity {
  id: string;
  name: string;
  status: 'Enabled' | 'Offline';
  icon: string;
}

export interface RoomMaintenanceStatus {
  id: string;
  roomNumber: string;
  roomType: string;
  issue: string;
  status: 'Under Repair' | 'Pending' | 'Verified' | 'Scheduled';
}

export interface GuestCRMHistoryItem {
  id: string;
  roomName: string;
  dateRange: string;
  nightsCount: number;
  status: 'Completed' | 'Active' | 'Upcoming';
}

export interface GuestCRMFeedback {
  id: string;
  rating: number;
  comments: string;
  stayLabel: string;
}

export interface GuestCRMPayment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  status: 'Paid via Card' | 'Paid via UPI' | 'Paid via Cash' | 'Pending';
}

export interface GuestCRM {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  avatar: string;
  isVIP: boolean;
  birthday: string;
  anniversary: string;
  preferences: string[];
  generalNotes: string;
  visitHistory: GuestCRMHistoryItem[];
  feedback: GuestCRMFeedback[];
  payments: GuestCRMPayment[];
}


