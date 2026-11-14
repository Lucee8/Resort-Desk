import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  KeyRound, 
  Plus, 
  UserPlus, 
  Check, 
  X, 
  Laptop, 
  Smartphone, 
  Lock, 
  ShieldAlert, 
  History, 
  Edit3,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  StaffRoleItem, 
  ModulePermissionRow, 
  StaffSession, 
  LoginHistoryItem,
  RolePermissions 
} from '../../types';

interface StaffRolesSectionProps {
  roles: StaffRoleItem[];
  permissions: ModulePermissionRow[];
  sessions: StaffSession[];
  loginHistory: LoginHistoryItem[];
  onUpdatePermission: (moduleId: string, roleKey: string, permKey: keyof RolePermissions, value: boolean) => void;
  onTerminateSession: (sessionId: string) => void;
  onRevokeAllOtherSessions: () => void;
  triggerToast?: (msg: string) => void;
}

export default function StaffRolesSection({
  roles,
  permissions,
  sessions,
  loginHistory,
  onUpdatePermission,
  onTerminateSession,
  onRevokeAllOtherSessions,
  triggerToast
}: StaffRolesSectionProps) {
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('manager');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCustomRoleModal, setShowCustomRoleModal] = useState(false);
  const [enforce2FA, setEnforce2FA] = useState(true);

  // Invite staff form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('front_desk');
  const [inviteDept, setInviteDept] = useState('Front Office');

  // Custom role state
  const [customRoleName, setCustomRoleName] = useState('');
  const [customRoleDesc, setCustomRoleDesc] = useState('');

  const selectedRole = roles.find(r => r.roleKey === selectedRoleKey) || roles[0];

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    if (triggerToast) triggerToast(`Invitation email with temporary credentials dispatched to ${inviteEmail}`);
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleName) return;
    if (triggerToast) triggerToast(`New custom role "${customRoleName}" established.`);
    setCustomRoleName('');
    setCustomRoleDesc('');
    setShowCustomRoleModal(false);
  };

  return (
    <div id="settings-staff-roles-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header & Overview KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Staff & Granular Role Permissions</h2>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
              Active Security Layer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage operational team access, view & edit permissions, enforce two-factor authentication, and monitor active sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-teal-700 hover:text-teal-800 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Staff</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCustomRoleModal(true)}
            className="px-3.5 py-2 bg-teal-900 hover:bg-teal-950 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom Role</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Matches Screenshot 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-teal-50 text-teal-800 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">[STAFF_COUNT]</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">42</div>
            <div className="text-xs text-slate-500 mt-0.5">Active Team Members</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">[ROLE_TYPES]</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{roles.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Defined Role Archetypes</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">[LAST_AUDIT]</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">2 hrs ago</div>
            <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Security audit passed
            </div>
          </div>
        </div>
      </div>

      {/* 2. Role Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {roles.map((role) => {
          const isSelected = selectedRoleKey === role.roleKey;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleKey(role.roleKey)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-teal-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {role.name}
            </button>
          );
        })}
      </div>

      {/* 3. Selected Role Card & Permissions Matrix */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Role Header Banner */}
        <div className="p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <ShieldCheck className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{selectedRole.name}</h3>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                  {selectedRole.badgeType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {selectedRole.description}
              </p>
            </div>
          </div>

          {/* Member Avatars */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex -space-x-2">
              {selectedRole.membersAvatars.map((av, idx) => (
                <img
                  key={idx}
                  src={av}
                  alt="Member"
                  className="w-7 h-7 rounded-full border-2 border-white object-cover"
                />
              ))}
              <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                +{selectedRole.memberCount}
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <th className="py-3 px-6">MODULE ACCESS</th>
                <th className="py-3 px-4 text-center">VIEW</th>
                <th className="py-3 px-4 text-center">CREATE / EDIT</th>
                <th className="py-3 px-4 text-center">DELETE</th>
                <th className="py-3 px-4 text-center">EXPORT</th>
                <th className="py-3 px-4 text-center">APPROVE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((row) => {
                const rolePerm = row.permissions[selectedRoleKey] || {
                  view: false,
                  createEdit: false,
                  delete: false,
                  export: false,
                  approve: false
                };

                return (
                  <tr key={row.moduleId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{row.moduleName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{row.description}</div>
                    </td>

                    {/* View Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={rolePerm.view}
                        onChange={(e) => onUpdatePermission(row.moduleId, selectedRoleKey, 'view', e.target.checked)}
                        className="w-4 h-4 rounded text-teal-800 focus:ring-teal-700 accent-teal-800 cursor-pointer"
                      />
                    </td>

                    {/* Create / Edit Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={rolePerm.createEdit}
                        onChange={(e) => onUpdatePermission(row.moduleId, selectedRoleKey, 'createEdit', e.target.checked)}
                        className="w-4 h-4 rounded text-teal-800 focus:ring-teal-700 accent-teal-800 cursor-pointer"
                      />
                    </td>

                    {/* Delete Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={rolePerm.delete}
                        onChange={(e) => onUpdatePermission(row.moduleId, selectedRoleKey, 'delete', e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
                      />
                    </td>

                    {/* Export Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={rolePerm.export}
                        onChange={(e) => onUpdatePermission(row.moduleId, selectedRoleKey, 'export', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                    </td>

                    {/* Approve Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={rolePerm.approve}
                        onChange={(e) => onUpdatePermission(row.moduleId, selectedRoleKey, 'approve', e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Two-Factor Authentication & Active Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2FA Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Lock className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">Two-Factor Authentication (2FA)</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Enforce mandatory time-based OTP (Google Authenticator / SMS) for all Managerial and Financial roles prior to accessing sensitive folios or guest PII.
            </p>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Mandatory 2FA Policy</span>
                <span className="text-[11px] text-slate-400">Required for Manager & Finance</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enforce2FA}
                  onChange={(e) => {
                    setEnforce2FA(e.target.checked);
                    if (triggerToast) triggerToast(e.target.checked ? "2FA enforced for high-privilege roles." : "2FA policy updated to optional.");
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-800"></div>
              </label>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>FIPS 140-2 Level 1 compliant crypto tokens</span>
          </div>
        </div>

        {/* Active Staff Sessions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">Active Staff Sessions</h3>
            </div>
            <button
              type="button"
              onClick={onRevokeAllOtherSessions}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              Revoke Others
            </button>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {sessions.map((sess) => (
              <div key={sess.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {sess.device.includes('iPhone') || sess.device.includes('Galaxy') ? (
                    <Smartphone className="w-4 h-4 text-slate-400 mt-0.5" />
                  ) : (
                    <Laptop className="w-4 h-4 text-slate-400 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800">{sess.userName}</span>
                      {sess.isCurrent && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {sess.device} • {sess.location} ({sess.loginTime})
                    </div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    type="button"
                    onClick={() => onTerminateSession(sess.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Terminate Session"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Login History Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-3 border-b border-slate-100">
          <History className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Recent Login History & Access Audits</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <th className="py-2 px-3">USER</th>
                <th className="py-2 px-3">ROLE</th>
                <th className="py-2 px-3">IP ADDRESS</th>
                <th className="py-2 px-3">LOCATION</th>
                <th className="py-2 px-3">TIMESTAMP</th>
                <th className="py-2 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loginHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{item.userName}</td>
                  <td className="py-2.5 px-3 text-slate-500">{item.role}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{item.ipAddress}</td>
                  <td className="py-2.5 px-3 text-slate-500">{item.location}</td>
                  <td className="py-2.5 px-3 text-slate-400">{item.timestamp}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Invite Staff */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-teal-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm">Invite Team Member</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-teal-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohini Deshmukh"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Staff Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rohini.d@mykonoscottage.in"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Role Assigned</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                  >
                    <option value="manager">General Manager</option>
                    <option value="front_desk">Front Desk & Concierge</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="finance">Finance & Accountant</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Department</label>
                  <select
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                  >
                    <option value="Front Office">Front Office</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="F&B Service">F&B Service</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-[11px] text-teal-900 flex items-start gap-2 mt-1">
                <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>An invitation link will be sent with automated 2FA setup instructions.</span>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl text-xs font-semibold hover:bg-teal-950 shadow-sm cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Custom Role */}
      {showCustomRoleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-teal-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm">Create Custom Operational Role</h3>
              </div>
              <button onClick={() => setShowCustomRoleModal(false)} className="text-teal-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomRole} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spa & Wellness Supervisor"
                  value={customRoleName}
                  onChange={(e) => setCustomRoleName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Scope & Responsibilities</label>
                <textarea
                  rows={3}
                  placeholder="Describe what modules and actions this role has authority to perform..."
                  value={customRoleDesc}
                  onChange={(e) => setCustomRoleDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomRoleModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl text-xs font-semibold hover:bg-teal-950 shadow-sm cursor-pointer"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
