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

export type MaintenanceCategory = 
  | 'Electrical' 
  | 'Plumbing' 
  | 'HVAC' 
  | 'Furniture' 
  | 'Door & Lock' 
  | 'Internet/Wi-Fi' 
  | 'Appliance' 
  | 'Civil/Structural' 
  | 'Cleaning Equipment' 
  | 'Other';

export type MaintenancePriority = 'Emergency' | 'High' | 'Medium' | 'Low';
export type MaintenanceStatus = 'Reported' | 'Assigned' | 'In Progress' | 'Waiting for Parts' | 'Resolved' | 'Closed';

export interface MaintenanceTimelineEvent {
  id: string;
  title: string;
  time: string;
  author: string;
  note?: string;
  done: boolean;
}

export interface MaintenanceAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'doc';
  size?: string;
}

export interface MaintenancePart {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  status: 'In Stock' | 'Ordered' | 'Delivered';
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  roomNumber: string;
  area: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reportedBy: string;
  reportedDate: string;
  reportedTime: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  assignedTechnicianAvatar?: string;
  assignedDepartment?: string;
  estimatedCompletionTime?: string;
  actualResolutionTime?: string;
  isRoomBlocked: boolean;
  cost: {
    parts: number;
    labor: number;
    vendor: number;
    total: number;
  };
  attachments: MaintenanceAttachment[];
  timeline: MaintenanceTimelineEvent[];
  parts?: MaintenancePart[];
  repairPhotoUrl?: string;
  managerNotes?: string;
}

export interface Technician {
  id: string;
  name: string;
  avatar: string;
  department: string;
  experience: string;
  activeTicketsCount: number;
  completedTicketsCount: number;
  efficiency: number;
  avgResolutionTime: string;
  status: 'Available' | 'Busy' | 'On Break' | 'Offline';
  phone: string;
  rating: number;
  specialization: string[];
}

export interface RecentlyResolvedMaintenance {
  id: string;
  title: string;
  roomNumber: string;
  technicianName: string;
  technicianAvatar: string;
  completedAgo: string;
  resolutionTime: string;
  verificationStatus: 'Verified' | 'Auto-Closed';
}

export interface PredictiveMaintenanceAlert {
  id: string;
  equipment: string;
  roomNumber: string;
  issuePrediction: string;
  riskScore: number;
  reason: string;
  recommendedAction: string;
  category: MaintenanceCategory;
}

export type MaintenanceUserRole = 'Resort Owner' | 'Manager' | 'Technician' | 'Receptionist';


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

// ----------------------------------------------------
// INVENTORY MANAGEMENT MODULE TYPES (ResortDesk AI 2.0)
// ----------------------------------------------------

export type InventoryCategory = 
  | 'All'
  | 'Linens'
  | 'Toiletries'
  | 'Cleaning'
  | 'Kitchen'
  | 'Food & Beverage'
  | 'Maintenance'
  | 'Guest Supplies'
  | 'Office Supplies'
  | 'Other';

export type InventorySafetyLevel = 'Healthy' | 'Low' | 'Critical' | 'Out of Stock';

export type InventoryUnit = 'pieces' | 'liters' | 'cans' | 'kg' | 'boxes' | 'bottles' | 'packets' | 'rolls' | 'sets';

export type StockMovementType = 
  | 'Purchase' 
  | 'Housekeeping' 
  | 'Restaurant' 
  | 'Maintenance' 
  | 'Room Replacement' 
  | 'Adjustment' 
  | 'Damaged' 
  | 'Return' 
  | 'Transfer';

export interface StockMovement {
  id: string;
  date: string;
  quantity: number; // positive for addition, negative for deduction
  type: StockMovementType;
  user: string;
  role: string;
  reference?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: Exclude<InventoryCategory, 'All'>;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderQuantity: number;
  unit: InventoryUnit;
  safetyLevel: InventorySafetyLevel;
  lastRestocked: string;
  supplier: string;
  supplierSku?: string;
  costPerUnit: number; // in ₹ INR
  totalValue: number; // currentStock * costPerUnit
  storageLocation: string;
  warehouseZone?: string;
  shelfBin?: string;
  nextExpectedDelivery?: string;
  image?: string;
  iconType?: 'linen' | 'toiletry' | 'clean' | 'kitchen' | 'fnb' | 'maintenance' | 'guest' | 'office' | 'other';
  description?: string;
  batchNumber?: string;
  expiryDate?: string;
  isExpiringSoon?: boolean;
  movements: StockMovement[];
  consumptionRateWeekly: number;
  fastMoving?: boolean;
  turnoverDays: number;
}

export type PurchaseOrderStatus = 
  | 'Draft' 
  | 'Ordered' 
  | 'In Transit' 
  | 'Partially Received' 
  | 'Received' 
  | 'Cancelled' 
  | 'Delayed';

export interface PurchaseOrderItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierContact?: string;
  supplierEmail?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string;
  status: PurchaseOrderStatus;
  paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Unpaid';
  notes?: string;
  createdByUser?: string;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categoriesSupplied: Exclude<InventoryCategory, 'All'>[];
  totalPurchases: number;
  outstandingAmount: number;
  avgDeliveryTime: string;
  rating: number;
  status: 'Active' | 'Preferred' | 'Under Review';
}

export interface InventoryAlert {
  id: string;
  type: 'Low Stock' | 'Critical Stock' | 'Out of Stock' | 'Expiring Soon' | 'Delayed Delivery' | 'Unusual Consumption' | 'Overstock' | 'Supplier Issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  itemId?: string;
  itemName: string;
  currentStock?: number;
  threshold?: number;
  recommendedAction: string;
  date: string;
  resolved?: boolean;
}

export interface InventoryAuditItem {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  category: Exclude<InventoryCategory, 'All'>;
  systemQty: number;
  physicalQty: number;
  difference: number;
  varianceValue: number;
  unit: string;
  reason: string;
  status: 'Pending Review' | 'Reconciled' | 'Discrepancy Flagged';
  countedBy: string;
  approvedBy?: string;
  date: string;
}

export interface InventoryAIInsight {
  id: string;
  title: string;
  insight: string;
  recommendation: string;
  category: string;
  impactBadge: string;
  actionType: 'reorder' | 'supplier' | 'audit' | 'forecast' | 'expiry';
  targetItemId?: string;
  suggestedQty?: number;
  confidenceScore: number;
}

export type InventoryUserRole = 
  | 'Resort Owner' 
  | 'Manager' 
  | 'Storekeeper' 
  | 'Housekeeping' 
  | 'Restaurant Staff' 
  | 'Accountant' 
  | 'Receptionist';

// ==================== STAFF MANAGEMENT TYPES ====================

export type StaffDepartment = 
  | 'Front Desk' 
  | 'Kitchen' 
  | 'Housekeeping' 
  | 'Maintenance' 
  | 'Restaurant' 
  | 'Security' 
  | 'Spa & Wellness' 
  | 'Management';

export type StaffRole = string;

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Seasonal' | 'Internship' | string;

export type StaffStatus = 'On Duty' | 'Off Duty' | 'On Leave' | 'Absent' | 'Late';

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Half Day' | 'On Leave' | 'Holiday' | 'Work From Home';

export type LeaveType = 
  | 'Casual Leave' 
  | 'Sick Leave' 
  | 'Annual Leave' 
  | 'Emergency Leave' 
  | 'Marriage Leave' 
  | 'Maternity/Paternity Leave' 
  | 'Unpaid Leave';

export interface StaffDocument {
  id: string;
  name: string;
  type: 'ID Proof' | 'Employment Contract' | 'Certifications' | 'Training Certificates' | 'Bank Details' | 'Emergency Contact' | 'Other';
  uploadDate: string;
  size: string;
  status: 'Verified' | 'Pending' | 'Expired';
  verifiedBy?: string;
  isConfidential?: boolean;
  fileNumber?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  department: StaffDepartment;
  status: StaffStatus;
  todayShift: string;
  avatar: string;
  avatarBg?: string;
  avatarImage?: string;
  email: string;
  phone: string;
  joiningDate?: string;
  joinDate?: string;
  employmentType?: string;
  manager?: string;
  performanceScore: number;
  tasksCompleted: number;
  guestRating: number;
  attendanceRate: number;
  taskCompletionRate: number;
  responseTimeMins: number;
  complaintsCount: number;
  managerRating: number;
  baseSalary: number;
  overtimeHours: number;
  overtimePay: number;
  bonus: number;
  deductions: number;
  netPay: number;
  payrollStatus: 'Paid' | 'Pending' | 'Ready' | 'Processing';
  leaveBalance: {
    casual: number;
    sick: number;
    annual: number;
    emergency: number;
  };
  documents?: StaffDocument[];
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  } | string;
  skills: string[];
  isTopPerformer?: boolean;
  rank?: number;
  aiInsightNote?: string;
  performanceTrend?: number[];
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
}

export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  department: StaffDepartment;
  avatar: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  overtimeHours?: number;
  notes?: string;
  shiftName?: string;
}

export interface StaffLeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  department: StaffDepartment;
  avatar: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  isUrgent?: boolean;
  appliedOn: string;
  approvedBy?: string;
  rejectionReason?: string;
  coveragePlan?: string;
}

export interface StaffShiftPlan {
  id: string;
  name: string;
  department: StaffDepartment;
  shiftType: 'Morning Shift' | 'Afternoon Shift' | 'Evening Shift' | 'Night Shift' | 'Custom Shift';
  startTime: string;
  endTime: string;
  requiredStaff: number;
  color: string;
}

export interface StaffCoverageDeptInfo {
  scheduled: number;
  required: number;
  staffNames: string[];
  hasGap: boolean;
  aiSuggestion?: string;
}

export interface StaffCoverageDay {
  day: string;
  dateStr: string;
  departments: Record<string, StaffCoverageDeptInfo>;
}

export interface StaffTask {
  id: string;
  title: string;
  department: StaffDepartment;
  assignedToId: string;
  assignedToName: string;
  assignedAvatar?: string;
  assignedToAvatar?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Normal';
  dueTime: string;
  roomOrArea?: string;
  location?: string;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Overdue';
  category?: 'Housekeeping' | 'Maintenance' | 'Restaurant' | 'Front Desk' | 'Guest Services' | 'Security' | string;
  description?: string;
  createdAt?: string;
  guestRating?: number;
}

export interface StaffNotificationItem {
  id: string;
  title: string;
  message: string;
  channel: 'In-app' | 'WhatsApp' | 'Email' | 'Push notification';
  time: string;
  recipientId: string;
  recipientName: string;
  type: 'shift' | 'leave' | 'task' | 'payroll' | 'announcement';
  read: boolean;
}

export interface StaffAIInsightItem {
  id: string;
  category: 'Performance' | 'Scheduling' | 'Attendance' | 'Workforce' | 'Cost';
  title: string;
  note: string;
  recommendation?: string;
  badge: string;
  author: string;
  confidence: number;
  actionLabel?: string;
  actionType?: string;
}

// ==========================================
// REVIEWS & REPUTATION MANAGEMENT INTERFACES
// ==========================================

export type ReviewPlatform = 'Google' | 'Booking.com' | 'Airbnb' | 'Tripadvisor' | 'Agoda' | 'MakeMyTrip';

export type ReviewSentiment = 'Positive' | 'Neutral' | 'Negative';

export type ReviewStatus = 'Replied' | 'Pending' | 'Action Required';

export type ReviewTopic = 
  | 'Staff & Service' 
  | 'Cleanliness' 
  | 'Food & Dining' 
  | 'Rooms' 
  | 'Wi-Fi' 
  | 'Spa & Wellness' 
  | 'Location & Views' 
  | 'Value & Pricing';

export interface ReviewReply {
  author: string;
  authorRole: string;
  replyDate: string;
  text: string;
  isPublishedToPlatform: boolean;
  publishedAt?: string;
}

export interface ReviewAISuggestion {
  tone: 'Warm & Hospitable' | 'Empathetic Problem Solver' | 'Executive & Crisp' | 'Luxury Concierge';
  text: string;
  suggestedAt: string;
  confidence: number;
  actionablePerk?: string;
  keyPointsCovered: string[];
}

export interface ReviewItem {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerBadge?: string;
  platform: ReviewPlatform;
  rating: number;
  date: string;
  relativeTime: string;
  roomOrBooking: string;
  stayDateRange?: string;
  reviewText: string;
  sentiment: ReviewSentiment;
  sentimentScore: number;
  topics: ReviewTopic[];
  status: ReviewStatus;
  actionRequiredReason?: string;
  reply?: ReviewReply;
  aiSuggestedReply?: ReviewAISuggestion;
  photos?: string[];
  likesCount?: number;
  externalUrl?: string;
  guestEmail?: string;
  guestPhone?: string;
  assignedStaffToAddress?: string;
}

export interface SentimentTopicMetric {
  topic: ReviewTopic | string;
  positivePercentage: number;
  trendDelta: number;
  totalMentions: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  flaggedWarning?: string;
  topKeywords: string[];
}

export interface ReputationSummary {
  overallScore: number;
  scoreDelta: number;
  totalVerifiedReviews: number;
  newThisWeekCount: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  responseRate: number;
  avgResponseTimeHours: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  monthlyTrends: {
    month: string;
    avgRating: number;
    count: number;
    responseRate: number;
  }[];
}

export interface GoogleReviewsIntegrationConfig {
  isConnected: boolean;
  connectedAccount: string;
  businessName: string;
  locationId: string;
  placeId: string;
  autoSyncEnabled: boolean;
  syncFrequencyMinutes: number;
  lastSyncedAt: string;
  autoReplyEnabled: boolean;
  autoReplyMinRating: number;
  autoReplyTone: string;
  oauthScopes: string[];
  verifiedLocationAddress: string;
  averageGoogleRating: number;
  totalGoogleReviews: number;
}

export interface ReviewAIInsight {
  id: string;
  type: 'issue' | 'commendation' | 'operational' | 'trend' | 'recovery_offer';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'positive';
  affectedArea?: string;
  suggestedAction: string;
  actionType: 'maintenance' | 'staff' | 'recovery_offer' | 'operations';
  prefilledData?: {
    roomNumber?: string;
    category?: string;
    staffName?: string;
    guestName?: string;
    guestEmail?: string;
    note?: string;
  };
}

// WhatsApp Automation Types
export type WhatsAppNodeType = 
  | 'trigger' 
  | 'wait' 
  | 'action' 
  | 'condition' 
  | 'ai_action' 
  | 'notification' 
  | 'end';

export interface WhatsAppButtonAction {
  type: 'quick_reply' | 'url' | 'phone';
  label: string;
  value?: string;
}

export interface WhatsAppNodeConfig {
  // For Trigger
  triggerEvent?: 
    | 'booking_created' 
    | 'checkin_reminder' 
    | 'guest_checked_in' 
    | 'guest_checked_out' 
    | 'payment_pending' 
    | 'special_request' 
    | 'review_submitted' 
    | 'vip_arrival';
  
  // For Wait
  waitDuration?: number;
  waitUnit?: 'minutes' | 'hours' | 'days';
  waitTimingType?: 'after_previous' | 'before_checkin' | 'after_checkin' | 'before_checkout' | 'after_checkout';
  waitSpecificTime?: string;

  // For Action (WhatsApp Message)
  templateId?: string;
  templateName?: string;
  messageText?: string;
  mediaType?: 'none' | 'image' | 'pdf' | 'location';
  mediaUrl?: string;
  buttons?: WhatsAppButtonAction[];
  sendTo?: 'guest' | 'primary_guest' | 'front_desk';

  // For Condition
  conditionField?: 'has_replied' | 'guest_type' | 'stay_length' | 'room_type' | 'channel' | 'special_requests' | 'total_spend';
  conditionOperator?: 'equals' | 'contains' | 'greater_than' | 'is_true' | 'is_false' | 'includes_keywords';
  conditionValue?: string;
  trueBranchLabel?: string;
  falseBranchLabel?: string;

  // For AI Action
  aiPrompt?: string;
  aiTone?: 'Warm & Hospitable' | 'Empathetic Problem Solver' | 'Luxury Concierge' | 'Executive & Crisp';
  aiCapability?: 'reply_faq' | 'menu_concierge' | 'upsell_spa_dining' | 'room_service_intake' | 'review_sentiment';
  fallbackToHuman?: boolean;

  // For Notification
  notifyRole?: 'front_desk' | 'concierge' | 'housekeeping' | 'manager' | 'fnb_lead';
  notificationTitle?: string;
  notificationBody?: string;
}

export interface WhatsAppWorkflowNode {
  id: string;
  type: WhatsAppNodeType;
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  config: WhatsAppNodeConfig;
  stats?: {
    sent: number;
    delivered: number;
    read: number;
    replied: number;
    dropoff?: number;
  };
  disabled?: boolean;
}

export interface WhatsAppWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'paused';
  triggerType: string;
  nodes: WhatsAppWorkflowNode[];
  createdAt: string;
  updatedAt: string;
  totalEnrolled: number;
  totalCompleted: number;
  conversionRate?: number;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'IN_REVIEW' | 'REJECTED' | 'DRAFT';
  headerType?: 'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT';
  headerContent?: string;
  body: string;
  footer?: string;
  variables: string[];
  sampleValues: Record<string, string>;
  buttons?: WhatsAppButtonAction[];
  lastUsed?: string;
  useCount?: number;
}

export interface WhatsAppMessageLog {
  id: string;
  guestName: string;
  guestPhone: string;
  roomNumber?: string;
  workflowName: string;
  nodeTitle: string;
  direction: 'outbound' | 'inbound';
  messageText: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'replied';
  timestamp: string;
  aiHandled?: boolean;
  aiConfidence?: number;
  templateUsed?: string;
}

export interface MyraAIWorkflowInsight {
  id: string;
  type: 'condition' | 'template' | 'upsell' | 'timing' | 'review';
  title: string;
  description: string;
  recommendation: string;
  actionLabel: string;
  impact: string;
  suggestedNode?: WhatsAppWorkflowNode;
}

// ---------------------------------------------------------------------------
// BILLING & FINANCE MODULE INTERFACES
// ---------------------------------------------------------------------------

export type InvoiceStatus = 'Paid' | 'Pending' | 'Partial' | 'Refunded';

export interface InvoiceItem {
  id: string;
  description: string;
  sacCode?: string; // SAC code for GST compliance e.g. 996311 (Room), 996331 (F&B)
  qty: number;
  unitPrice: number;
  gstRate: number; // e.g. 12, 18, 5
  amount: number; // qty * unitPrice
  gstAmount: number; // (amount * gstRate) / 100
}

export interface InvoicePaymentRecord {
  id: string;
  amount: number;
  method: 'UPI' | 'Credit Card' | 'Debit Card' | 'Netbanking' | 'Cash' | 'Corporate Cheque' | 'Bank Transfer';
  referenceId: string;
  timestamp: string;
  collectedBy: string;
  receiptNumber: string;
}

export interface InvoiceRefundRecord {
  id: string;
  amount: number;
  reason: string;
  refundDate: string;
  mode: 'Original Payment Source' | 'Direct Bank Transfer' | 'Credit Voucher';
  approvedBy: string;
  creditNoteNumber: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string; // e.g. 'INV-2023-0891'
  guestName: string;
  bookingId?: string; // e.g. 'BK-992A'
  guestEmail?: string;
  guestPhone?: string;
  guestGstin?: string;
  companyName?: string;
  roomNumber: string;
  issueDate: string; // e.g. 'Oct 24, 2023'
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount?: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: InvoiceStatus;
  paymentMethod?: string;
  paymentReference?: string;
  paymentsHistory?: InvoicePaymentRecord[];
  refundHistory?: InvoiceRefundRecord[];
  notes?: string;
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
  isStrikethrough?: boolean; // for refunded invoices displayed in UI
}

export interface RevenueMonthlyMetric {
  month: string; // 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'
  revenue: number; // in Rupees e.g. 2450000
  gst: number; // e.g. 441000
  refunds: number; // e.g. 45000
  occupancyRate?: number;
  roomRevenue?: number;
  fnbRevenue?: number;
  spaRevenue?: number;
}

export interface BillingSubscriptionUsage {
  planName: string; // 'Enterprise AI'
  billingCycle: string; // 'Billed Annually'
  description: string; // 'Unlimited properties, full API access.'
  aiMinutesUsed: number; // 4200
  aiMinutesLimit: number; // 5000
  whatsappMessagesUsed: number; // 12400
  whatsappMessagesLimit: number; // 50000
  amountPerYear: number;
  nextBillingDate: string;
  autoRenew: boolean;
}

export interface UnbilledStayItem {
  id: string;
  roomNumber: string;
  guestName: string;
  bookingId: string;
  checkInDate: string;
  checkOutDate: string;
  nightsStayed: number;
  roomTariffPending: number;
  diningPending: number;
  spaPending: number;
  laundryPending: number;
  totalPending: number;
  status: 'In-House' | 'Checking Out Today' | 'Late Checkout';
  contactPhone: string;
}

export interface BankSettlementBatch {
  id: string;
  batchNumber: string;
  date: string;
  settlementDate: string;
  grossAmount: number;
  gatewayFee: number;
  gstOnFee: number;
  netPayout: number;
  status: 'Settled' | 'Processing' | 'Scheduled';
  bankName: string;
  accountNumberMasked: string;
  utrNumber?: string;
}

export interface MyraFinanceAssistantInsight {
  id: string;
  type: 'pending' | 'gst' | 'revenue' | 'refund' | 'unbilled' | 'subscription';
  title: string;
  description: string;
  amount?: string;
  impact?: string;
  actionText: string;
  actionType: 'open_unbilled' | 'filter_pending' | 'filter_gst' | 'filter_refunds' | 'open_subscription' | 'send_whatsapp_reminder';
  payload?: any;
}






