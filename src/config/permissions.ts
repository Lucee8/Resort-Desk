import { AppModuleId, PermissionAction, StaffAccountRole, StaffDepartment } from '../types';

export interface RoleDefinition {
  role: StaffAccountRole;
  shortLabel: string;
  description: string;
  department: StaffDepartment;
  defaultRoute: string;
  defaultModule: AppModuleId;
  modules: AppModuleId[];
  permissions: PermissionAction[];
  badgeColor: string;
}

export const ALL_STAFF_ROLES: StaffAccountRole[] = [
  'Administrator',
  'General Manager',
  'Receptionist',
  'Housekeeping Staff',
  'Maintenance Staff',
  'Accountant',
  'Inventory Manager',
];

export const ALL_PERMISSION_ACTIONS: Array<{
  id: PermissionAction;
  label: string;
  group: 'Operations' | 'Finance & Reports' | 'Property & Stock' | 'Administration';
}> = [
  { id: 'view_dashboard', label: 'View Executive Dashboard', group: 'Operations' },
  { id: 'manage_bookings', label: 'Create & Edit Reservations', group: 'Operations' },
  { id: 'checkin_checkout', label: 'Guest Check-In & Check-Out', group: 'Operations' },
  { id: 'view_guests', label: 'View Guest CRM Profiles', group: 'Operations' },
  { id: 'manage_guests', label: 'Edit Guest CRM & ID Docs', group: 'Operations' },
  { id: 'manage_whatsapp', label: 'WhatsApp Automation & Dispatch', group: 'Operations' },
  { id: 'manage_reviews', label: 'Reviews & Reputation Replies', group: 'Operations' },
  { id: 'view_billing', label: 'View Invoices & Billing Ledger', group: 'Finance & Reports' },
  { id: 'manage_billing', label: 'Create Invoices & Collect Payments', group: 'Finance & Reports' },
  { id: 'process_refunds', label: 'Process Refunds & Credit Notes', group: 'Finance & Reports' },
  { id: 'view_reports', label: 'View Analytics & Operational Reports', group: 'Finance & Reports' },
  { id: 'export_reports', label: 'Export Financial & Ops Reports', group: 'Finance & Reports' },
  { id: 'view_rooms', label: 'View Cottages & Availability', group: 'Property & Stock' },
  { id: 'manage_rooms', label: 'Manage Cottage Rates & Categories', group: 'Property & Stock' },
  { id: 'update_room_status', label: 'Update Room Cleanliness/Status', group: 'Property & Stock' },
  { id: 'view_housekeeping', label: 'View Housekeeping Queue', group: 'Property & Stock' },
  { id: 'manage_housekeeping', label: 'Assign & Verify Housekeeping', group: 'Property & Stock' },
  { id: 'update_housekeeping_tasks', label: 'Update Cleaning Checklists & Photos', group: 'Property & Stock' },
  { id: 'view_maintenance', label: 'View Maintenance Tickets', group: 'Property & Stock' },
  { id: 'manage_maintenance', label: 'Assign & Close Maintenance Tickets', group: 'Property & Stock' },
  { id: 'update_maintenance_tickets', label: 'Update Repair Notes & Photos', group: 'Property & Stock' },
  { id: 'view_inventory', label: 'View Inventory Stock', group: 'Property & Stock' },
  { id: 'manage_inventory', label: 'Update Stock & Suppliers', group: 'Property & Stock' },
  { id: 'manage_purchase_orders', label: 'Create & Approve Purchase Orders', group: 'Property & Stock' },
  { id: 'view_staff', label: 'View Staff Directory & Rosters', group: 'Administration' },
  { id: 'manage_staff_hr', label: 'Manage Shifts, Leave & Payroll', group: 'Administration' },
  { id: 'manage_staff_accounts', label: 'Create & Deactivate Staff Accounts', group: 'Administration' },
  { id: 'manage_roles', label: 'Assign Roles & Permissions', group: 'Administration' },
  { id: 'manage_settings', label: 'Configure System & Property Settings', group: 'Administration' },
  { id: 'delete_records', label: 'Delete Records & Cancel Audits', group: 'Administration' },
  { id: 'seed_data', label: 'Initialize Starter Dataset', group: 'Administration' },
];

export const ROLE_DEFINITIONS: Record<StaffAccountRole, RoleDefinition> = {
  Administrator: {
    role: 'Administrator',
    shortLabel: 'Admin',
    description:
      'Full access to all property modules, staff account provisioning, roles & permissions, and system configuration.',
    department: 'Management',
    defaultRoute: '/',
    defaultModule: 'dashboard',
    modules: [
      'dashboard',
      'bookings',
      'whatsapp',
      'reviews',
      'reports',
      'guests',
      'rooms',
      'housekeeping',
      'maintenance',
      'inventory',
      'staff',
      'billing',
      'settings',
    ],
    permissions: ALL_PERMISSION_ACTIONS.map((p) => p.id),
    badgeColor: 'bg-[#004B38] text-white border-[#004B38]',
  },
  'General Manager': {
    role: 'General Manager',
    shortLabel: 'General Manager',
    description:
      'Full operational oversight across reservations, guest CRM, rooms, housekeeping, maintenance, inventory, reviews, billing, and HR.',
    department: 'Management',
    defaultRoute: '/',
    defaultModule: 'dashboard',
    modules: [
      'dashboard',
      'bookings',
      'whatsapp',
      'reviews',
      'reports',
      'guests',
      'rooms',
      'housekeeping',
      'maintenance',
      'inventory',
      'staff',
      'billing',
    ],
    permissions: [
      'view_dashboard',
      'manage_bookings',
      'checkin_checkout',
      'view_guests',
      'manage_guests',
      'view_billing',
      'manage_billing',
      'process_refunds',
      'view_rooms',
      'manage_rooms',
      'update_room_status',
      'view_housekeeping',
      'manage_housekeeping',
      'update_housekeeping_tasks',
      'view_maintenance',
      'manage_maintenance',
      'update_maintenance_tickets',
      'view_inventory',
      'manage_inventory',
      'manage_purchase_orders',
      'manage_whatsapp',
      'manage_reviews',
      'view_reports',
      'export_reports',
      'view_staff',
      'manage_staff_hr',
      'delete_records',
    ],
    badgeColor: 'bg-teal-50 text-teal-900 border-teal-200',
  },
  Receptionist: {
    role: 'Receptionist',
    shortLabel: 'Front Desk',
    description:
      'Front desk reservations, guest check-in/check-out, guest CRM, WhatsApp guest communication, and reservation billing.',
    department: 'Front Desk',
    defaultRoute: '/',
    defaultModule: 'dashboard',
    modules: ['dashboard', 'bookings', 'guests', 'whatsapp', 'billing'],
    permissions: [
      'view_dashboard',
      'manage_bookings',
      'checkin_checkout',
      'view_guests',
      'manage_guests',
      'manage_whatsapp',
      'view_billing',
      'manage_billing',
      'view_rooms',
    ],
    badgeColor: 'bg-sky-50 text-sky-900 border-sky-200',
  },
  'Housekeeping Staff': {
    role: 'Housekeeping Staff',
    shortLabel: 'Housekeeping',
    description:
      'Assigned room turnover tasks, cleaning checklists, verification photo uploads, and cottage readiness updates.',
    department: 'Housekeeping',
    defaultRoute: '/housekeeping',
    defaultModule: 'housekeeping',
    modules: ['housekeeping'],
    permissions: ['view_housekeeping', 'update_housekeeping_tasks', 'update_room_status'],
    badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  },
  'Maintenance Staff': {
    role: 'Maintenance Staff',
    shortLabel: 'Maintenance',
    description:
      'Assigned repair tickets, ticket progress status updates, diagnostic notes, and photo evidence uploads.',
    department: 'Maintenance',
    defaultRoute: '/maintenance',
    defaultModule: 'maintenance',
    modules: ['maintenance'],
    permissions: ['view_maintenance', 'update_maintenance_tickets'],
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  Accountant: {
    role: 'Accountant',
    shortLabel: 'Accountant',
    description:
      'GST billing ledger, guest invoices and folios, payment settlements, refunds, and financial reports.',
    department: 'Management',
    defaultRoute: '/billing',
    defaultModule: 'billing',
    modules: ['billing', 'reports'],
    permissions: [
      'view_billing',
      'manage_billing',
      'process_refunds',
      'view_reports',
      'export_reports',
    ],
    badgeColor: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  },
  'Inventory Manager': {
    role: 'Inventory Manager',
    shortLabel: 'Inventory',
    description:
      'Resort stock management, stock movements, supplier purchase orders, and inventory consumption reports.',
    department: 'Management',
    defaultRoute: '/inventory',
    defaultModule: 'inventory',
    modules: ['inventory', 'reports'],
    permissions: [
      'view_inventory',
      'manage_inventory',
      'manage_purchase_orders',
      'view_reports',
      'export_reports',
    ],
    badgeColor: 'bg-purple-50 text-purple-900 border-purple-200',
  },
};

export const MODULE_ROUTE_MAP: Record<AppModuleId, string> = {
  dashboard: '/',
  bookings: '/bookings',
  whatsapp: '/whatsapp',
  reviews: '/reviews',
  reports: '/analytics',
  guests: '/guests',
  rooms: '/rooms',
  housekeeping: '/housekeeping',
  maintenance: '/maintenance',
  inventory: '/inventory',
  staff: '/staff',
  billing: '/billing',
  settings: '/settings',
};

export const MODULE_REQUIRED_PERMISSIONS: Record<AppModuleId, PermissionAction[]> = {
  dashboard: ['view_dashboard'],
  bookings: ['manage_bookings', 'checkin_checkout'],
  whatsapp: ['manage_whatsapp'],
  reviews: ['manage_reviews'],
  reports: ['view_reports', 'export_reports'],
  guests: ['view_guests', 'manage_guests'],
  rooms: ['view_rooms', 'manage_rooms'],
  housekeeping: ['view_housekeeping', 'manage_housekeeping', 'update_housekeeping_tasks'],
  maintenance: ['view_maintenance', 'manage_maintenance', 'update_maintenance_tickets'],
  inventory: ['view_inventory', 'manage_inventory', 'manage_purchase_orders'],
  staff: ['view_staff', 'manage_staff_hr', 'manage_staff_accounts'],
  billing: ['view_billing', 'manage_billing', 'process_refunds'],
  settings: ['manage_settings'],
};

const VALID_PERMISSION_SET = new Set<string>(ALL_PERMISSION_ACTIONS.map((p) => p.id));

export function normalizeStaffRole(rawRole: unknown): StaffAccountRole | null {
  if (typeof rawRole !== 'string') return null;
  const cleaned = rawRole.trim().toLowerCase();
  if (!cleaned) return null;

  if (
    cleaned === 'administrator' ||
    cleaned === 'admin' ||
    cleaned === 'resort owner' ||
    cleaned === 'owner' ||
    cleaned === 'super admin'
  ) {
    return 'Administrator';
  }
  if (cleaned === 'general manager' || cleaned === 'manager') {
    return 'General Manager';
  }
  if (
    cleaned === 'receptionist' ||
    cleaned === 'front desk' ||
    cleaned === 'front desk associate'
  ) {
    return 'Receptionist';
  }
  if (
    cleaned === 'housekeeping staff' ||
    cleaned === 'housekeeping' ||
    cleaned === 'housekeeper' ||
    cleaned === 'steward'
  ) {
    return 'Housekeeping Staff';
  }
  if (
    cleaned === 'maintenance staff' ||
    cleaned === 'maintenance' ||
    cleaned === 'technician'
  ) {
    return 'Maintenance Staff';
  }
  if (cleaned === 'accountant' || cleaned === 'finance') {
    return 'Accountant';
  }
  if (
    cleaned === 'inventory manager' ||
    cleaned === 'storekeeper' ||
    cleaned === 'inventory'
  ) {
    return 'Inventory Manager';
  }

  return null;
}

export function getEffectivePermissions(
  role: StaffAccountRole | null,
  customPermissions?: string[] | null
): PermissionAction[] {
  if (!role) return [];
  if (role === 'Administrator') {
    return [...ROLE_DEFINITIONS.Administrator.permissions];
  }
  if (Array.isArray(customPermissions) && customPermissions.length > 0) {
    const filtered = customPermissions.filter((p): p is PermissionAction =>
      VALID_PERMISSION_SET.has(p)
    );
    if (filtered.length > 0) return Array.from(new Set(filtered));
  }
  return [...ROLE_DEFINITIONS[role].permissions];
}

export function hasPermission(
  permissions: PermissionAction[],
  required: PermissionAction | PermissionAction[]
): boolean {
  if (Array.isArray(required)) {
    return required.some((perm) => permissions.includes(perm));
  }
  return permissions.includes(required);
}

export function canAccessModule(
  role: StaffAccountRole | null,
  permissions: PermissionAction[],
  moduleId: AppModuleId
): boolean {
  if (!role) return false;
  if (role === 'Administrator') return true;
  const def = ROLE_DEFINITIONS[role];
  const required = MODULE_REQUIRED_PERMISSIONS[moduleId] || [];
  if (required.length > 0 && required.some((p) => permissions.includes(p))) {
    // Special guard: Receptionist has 'view_rooms' for booking modal room picker,
    // without exposing the Room Management pricing module in navigation unless granted 'manage_rooms'
    if (moduleId === 'rooms' && role === 'Receptionist') {
      return permissions.includes('manage_rooms');
    }
    return true;
  }
  return def.modules.includes(moduleId);
}

export function getDefaultRouteForRole(role: StaffAccountRole | null): string {
  if (!role) return '/login';
  return ROLE_DEFINITIONS[role].defaultRoute;
}

export function getDefaultModuleForRole(role: StaffAccountRole | null): AppModuleId {
  if (!role) return 'dashboard';
  return ROLE_DEFINITIONS[role].defaultModule;
}

export function getModuleFromPath(pathname: string): AppModuleId | 'login' {
  const normalized = (pathname || '/').replace(/\/+$/, '') || '/';
  if (normalized === '/login') return 'login';
  if (normalized === '/' || normalized === '/dashboard') return 'dashboard';
  if (normalized === '/bookings') return 'bookings';
  if (normalized === '/whatsapp') return 'whatsapp';
  if (normalized === '/reviews') return 'reviews';
  if (normalized === '/analytics' || normalized === '/reports') return 'reports';
  if (normalized === '/guests') return 'guests';
  if (normalized === '/rooms') return 'rooms';
  if (normalized === '/housekeeping') return 'housekeeping';
  if (normalized === '/maintenance') return 'maintenance';
  if (normalized === '/inventory') return 'inventory';
  if (normalized === '/staff') return 'staff';
  if (normalized === '/billing') return 'billing';
  if (normalized === '/settings') return 'settings';
  return 'dashboard';
}

export function getPathFromModule(moduleId: AppModuleId): string {
  return MODULE_ROUTE_MAP[moduleId] || '/';
}
