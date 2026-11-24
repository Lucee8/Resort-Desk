import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Search,
  KeyRound,
  Edit3,
  Power,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import {
  PermissionAction,
  StaffAccountProfile,
  StaffAccountRole,
  StaffDepartment,
} from '../../types';
import {
  ALL_PERMISSION_ACTIONS,
  ALL_STAFF_ROLES,
  getEffectivePermissions,
  ROLE_DEFINITIONS,
} from '../../config/permissions';
import {
  createStaffAccountRecord,
  sendStaffAccountPasswordReset,
  subscribeStaffAccounts,
  updateStaffAccountRecord,
} from '../../services/staffAccountsService';
import { useAuth } from '../../context/AuthContext';

interface StaffAccountsTabProps {
  triggerToast: (msg: string) => void;
}

const DEPARTMENTS: StaffDepartment[] = [
  'Management',
  'Front Desk',
  'Housekeeping',
  'Maintenance',
  'Kitchen',
  'Restaurant',
  'Security',
  'Spa & Wellness',
];

export default function StaffAccountsTab({ triggerToast }: StaffAccountsTabProps) {
  const { user, refreshProfile } = useAuth();
  const [accounts, setAccounts] = useState<StaffAccountProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<StaffAccountProfile | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<StaffAccountRole>('Receptionist');
  const [department, setDepartment] = useState<string>('Front Desk');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionAction[]>(
    ROLE_DEFINITIONS.Receptionist.permissions
  );
  const [isActive, setIsActive] = useState(true);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeStaffAccounts(
      (list) => {
        setAccounts(list);
        setLoading(false);
      },
      (err) => {
        triggerToast(err.message || 'Unable to load staff accounts.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [triggerToast]);

  const filteredAccounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((acc) => {
      if (roleFilter !== 'ALL' && acc.role !== roleFilter) return false;
      if (!q) return true;
      return (
        acc.fullName.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        acc.role.toLowerCase().includes(q) ||
        acc.department.toLowerCase().includes(q)
      );
    });
  }, [accounts, search, roleFilter]);

  const openCreateModal = () => {
    setEditingAccount(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setSelectedRole('Receptionist');
    setDepartment(ROLE_DEFINITIONS.Receptionist.department);
    setSelectedPermissions([...ROLE_DEFINITIONS.Receptionist.permissions]);
    setIsActive(true);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (account: StaffAccountProfile) => {
    setEditingAccount(account);
    setFullName(account.fullName);
    setEmail(account.email);
    setPhone(account.phone || '');
    setPassword('');
    setSelectedRole(account.role);
    setDepartment(account.department || ROLE_DEFINITIONS[account.role].department);
    setSelectedPermissions([...getEffectivePermissions(account.role, account.permissions)]);
    setIsActive(account.isActive);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleRoleChange = (nextRole: StaffAccountRole) => {
    setSelectedRole(nextRole);
    setDepartment(ROLE_DEFINITIONS[nextRole].department);
    setSelectedPermissions([...ROLE_DEFINITIONS[nextRole].permissions]);
  };

  const togglePermission = (perm: PermissionAction) => {
    if (selectedRole === 'Administrator') return;
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Full name is required.');
      return;
    }

    if (!editingAccount) {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setFormError('Valid staff email address is required.');
        return;
      }
      if (password.length < 8) {
        setFormError('Initial password must be at least 8 characters.');
        return;
      }
    }

    if (editingAccount && editingAccount.uid === user?.uid && !isActive) {
      setFormError('You cannot deactivate your own active Administrator account.');
      return;
    }

    setFormBusy(true);
    try {
      if (editingAccount) {
        await updateStaffAccountRecord({
          uid: editingAccount.uid,
          fullName: fullName.trim(),
          phone: phone.trim(),
          role: selectedRole,
          department,
          permissions: selectedPermissions,
          isActive,
        });
        if (editingAccount.uid === user?.uid) {
          await refreshProfile();
        }
        triggerToast(`Updated role & permissions for ${fullName.trim()} (${selectedRole}).`);
      } else {
        await createStaffAccountRecord({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          role: selectedRole,
          department,
          permissions: selectedPermissions,
          isActive,
        });
        triggerToast(`Created staff login for ${fullName.trim()} (${selectedRole}).`);
      }
      setIsCreateOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not save staff account.'
      );
    } finally {
      setFormBusy(false);
    }
  };

  const handleToggleActive = async (account: StaffAccountProfile) => {
    if (account.uid === user?.uid) {
      triggerToast('You cannot deactivate your own Administrator session.');
      return;
    }
    setBusyUid(account.uid);
    try {
      await updateStaffAccountRecord({
        uid: account.uid,
        fullName: account.fullName,
        phone: account.phone,
        role: account.role,
        department: account.department,
        permissions: account.permissions,
        isActive: !account.isActive,
      });
      triggerToast(
        `${account.fullName} is now ${!account.isActive ? 'Active' : 'Deactivated'}.`
      );
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleSendPasswordReset = async (account: StaffAccountProfile) => {
    setBusyUid(account.uid);
    try {
      await sendStaffAccountPasswordReset(account.email);
      triggerToast(`Password reset email sent to ${account.email}.`);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setBusyUid(null);
    }
  };

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, typeof ALL_PERMISSION_ACTIONS> = {};
    ALL_PERMISSION_ACTIONS.forEach((p) => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, []);

  return (
    <div className="space-y-5 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#004B38] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#B7F2DC]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Staff Accounts &amp; Role-Based Access Control (RBAC)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Provision Firebase login accounts in <code className="bg-slate-100 px-1 rounded">staff/&#123;uid&#125;</code>, assign roles, customize granular permissions, or deactivate access.
            </p>
          </div>
        </div>

        <button
          id="btn-create-staff-account"
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#004B38] hover:bg-[#003D2E] text-white text-xs font-bold flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-[#B7F2DC]" />
          <span>Create Staff Account</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by staff name, email, role, or department..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#004B38]"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#004B38]"
        >
          <option value="ALL">All Staff Roles ({accounts.length})</option>
          {ALL_STAFF_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#004B38]" />
            <span>Loading staff access directory...</span>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Lock className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No Staff Accounts Found</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Create your first staff login account for Reception, Housekeeping, Maintenance,
              Accountant, or Inventory Manager.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role &amp; Department</th>
                  <th className="py-3 px-4">Permissions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAccounts.map((acc) => {
                  const isSelf = acc.uid === user?.uid;
                  const roleMeta = ROLE_DEFINITIONS[acc.role];
                  return (
                    <tr key={acc.uid} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#004B38]/10 text-[#004B38] font-bold text-xs flex items-center justify-center shrink-0">
                            {acc.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{acc.fullName}</span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500">{acc.email}</p>
                            {acc.phone && (
                              <p className="text-[10px] text-slate-400">{acc.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            roleMeta?.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {acc.role}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">{acc.department}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700">
                          {acc.permissions.length} granted
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Landing: {roleMeta?.defaultRoute || '/'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        {acc.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                            <AlertCircle className="w-3 h-3" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(acc)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            title="Edit role & permissions"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            disabled={busyUid === acc.uid}
                            onClick={() => void handleSendPasswordReset(acc)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                            title="Send password reset email"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={busyUid === acc.uid || isSelf}
                            onClick={() => void handleToggleActive(acc)}
                            className={`p-1.5 rounded-lg border text-xs cursor-pointer disabled:opacity-40 ${
                              acc.isActive
                                ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title={
                              isSelf
                                ? 'Cannot deactivate your own account'
                                : acc.isActive
                                  ? 'Deactivate staff login'
                                  : 'Activate staff login'
                            }
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Staff Account Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#004B38] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold">
                  {editingAccount ? `Edit Staff Access · ${editingAccount.fullName}` : 'Create Staff Login Account'}
                </h3>
                <p className="text-[11px] text-[#B7F2DC]">
                  Assign RBAC role, department, and module permissions for Mykonos Cottage
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-5">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sneha Sawant"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#004B38]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Staff Email
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editingAccount}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@mykonoscottagetarkarli.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:border-[#004B38]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#004B38]"
                  />
                </div>

                {!editingAccount && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Initial Password (min 8 chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set temporary password"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#004B38]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value as StaffAccountRole)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#004B38]"
                  >
                    {ALL_STAFF_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {ROLE_DEFINITIONS[selectedRole].description}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#004B38]"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Account status toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">Account Active Status</p>
                  <p className="text-[11px] text-slate-500">
                    Deactivated accounts are immediately blocked from logging in or reading data.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#004B38] focus:ring-[#004B38]"
                  />
                  <span>{isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </div>

              {/* Granular Permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-800">
                    Granular Permissions ({selectedPermissions.length})
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPermissions([...ROLE_DEFINITIONS[selectedRole].permissions])
                    }
                    className="text-[11px] font-semibold text-[#004B38] hover:underline cursor-pointer"
                  >
                    Reset to {selectedRole} Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 rounded-2xl border border-slate-200 bg-slate-50/70">
                  {(
                    Object.entries(groupedPermissions) as Array<
                      [string, typeof ALL_PERMISSION_ACTIONS]
                    >
                  ).map(([group, perms]) => (
                    <div key={group} className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {group}
                      </p>
                      {perms.map((perm) => {
                        const checked = selectedPermissions.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={selectedRole === 'Administrator'}
                              onChange={() => togglePermission(perm.id)}
                              className="w-3.5 h-3.5 rounded text-[#004B38] focus:ring-[#004B38]"
                            />
                            <span>{perm.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formBusy}
                  className="px-5 py-2.5 rounded-xl bg-[#004B38] hover:bg-[#003D2E] disabled:opacity-60 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  {formBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {editingAccount ? 'Save Access Changes' : 'Create Staff Account'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
