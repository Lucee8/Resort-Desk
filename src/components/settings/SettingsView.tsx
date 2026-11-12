import React, { useState, useEffect } from 'react';
import { 
  SettingsSectionId, 
  ResortDeskSettings, 
  BackupHistoryItem 
} from '../../types';
import { initialSettingsData } from '../../data/settingsData';

import SettingsNav from './SettingsNav';
import SettingsHeader from './SettingsHeader';

import ResortProfileSection from './ResortProfileSection';
import StaffRolesSection from './StaffRolesSection';
import MyraAIEngineSection from './MyraAIEngineSection';
import IntegrationsSection from './IntegrationsSection';
import BillingGSTSection from './BillingGSTSection';
import NotificationsSection from './NotificationsSection';
import WhatsAppSection from './WhatsAppSection';
import BookingRulesSection from './BookingRulesSection';
import OperationsSection from './OperationsSection';
import SecurityPrivacySection from './SecurityPrivacySection';
import AuditLogsSection from './AuditLogsSection';
import APIDeveloperSection from './APIDeveloperSection';
import BackupDataSection from './BackupDataSection';
import LocalizationSection from './LocalizationSection';
import AppearanceSection from './AppearanceSection';
import EmergencySafetySection from './EmergencySafetySection';

interface SettingsViewProps {
  onNavigateToBilling?: () => void;
  triggerToast?: (msg: string) => void;
}

export default function SettingsView({ onNavigateToBilling, triggerToast }: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('resort-profile');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Persistent Settings State
  const [settings, setSettings] = useState<ResortDeskSettings>(() => {
    try {
      const cached = localStorage.getItem('resortdesk_settings_v2');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Failed reading cached settings:', e);
    }
    return initialSettingsData;
  });

  const [savedSettings, setSavedSettings] = useState<ResortDeskSettings>(() => {
    try {
      const cached = localStorage.getItem('resortdesk_settings_v2');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // fallback
    }
    return initialSettingsData;
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check dirtiness
  useEffect(() => {
    const dirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
    setIsDirty(dirty);
  }, [settings, savedSettings]);

  // Section title mapping
  const sectionTitles: Record<SettingsSectionId, { title: string; subtitle: string }> = {
    'resort-profile': {
      title: 'Resort Profile & Contact Info',
      subtitle: 'Official property legal details, geo-coordinates, check-in/out policy, and guest support hotlines.'
    },
    'staff-roles': {
      title: 'Staff Directory & RBAC Roles',
      subtitle: 'Manage administrative staff credentials, Department permissions, shift rosters, and mandatory 2FA.'
    },
    'myra-ai': {
      title: 'Myra AI Intelligence Engine',
      subtitle: 'Tune AI persona tone, automated booking autonomous action scopes, knowledge grounding, and live chat simulation.'
    },
    'integrations': {
      title: 'Connected Systems & Channel Managers',
      subtitle: 'Synchronize PMS, Channel Manager, OTA calendars, payment gateways, and accounting ledgers.'
    },
    'billing-gst': {
      title: 'Billing, GST & Tax Rates',
      subtitle: 'Manage statutory GST tax rates, HSN/SAC code mapping, automated invoice numbering series, and payment reconciliation.'
    },
    'notifications': {
      title: 'Notifications & Event Matrix',
      subtitle: 'Configure automated event routing via WhatsApp, SMS, Email, and In-App Push alerts to assigned staff roles.'
    },
    'whatsapp': {
      title: 'WhatsApp Automation & Cloud API',
      subtitle: 'Meta Cloud API endpoint configuration, approved HSM templates, human handoff triggers, and automated concierge routing.'
    },
    'booking-rules': {
      title: 'Booking & Property Rules',
      subtitle: 'Configure stay constraints, advance deposits, cancellation penalties, extra guest fees, and pet policies.'
    },
    'operations': {
      title: 'Operations, Housekeeping & SLAs',
      subtitle: 'Turnover duration targets, mandatory room inspection photo verification, and maintenance priority SLAs.'
    },
    'security-privacy': {
      title: 'Security, 2FA & Data Privacy',
      subtitle: 'Password complexity policies, session idle timeout, IP restriction firewalls, and guest identity retention schedules.'
    },
    'audit-logs': {
      title: 'Audit Logs & Security Trail',
      subtitle: 'Cryptographically timestamped audit records tracking configuration changes, user logins, and AI prompt modifications.'
    },
    'api-developer': {
      title: 'API Keys & Developer Webhooks',
      subtitle: 'Manage machine-to-machine authentication tokens, outbound event listeners, and API rate limits.'
    },
    'backup-data': {
      title: 'Backup & Disaster Recovery',
      subtitle: 'Automated daily cloud snapshots, point-in-time rollbacks, and complete exportable property archives.'
    },
    'localization': {
      title: 'Localization, Currency & Format',
      subtitle: 'Set default currency symbols, date & time formatting standards, numerical separators, and multi-language presets.'
    },
    'appearance': {
      title: 'Appearance, Theme & Density',
      subtitle: 'Personalize your dashboard interface theme, primary accent colors, UI information density, and brand headers.'
    },
    'emergency-safety': {
      title: 'Emergency SOS & Property Safety',
      subtitle: 'Verified local emergency services, designated on-call doctors, and emergency broadcast dispatchers for guests.'
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem('resortdesk_settings_v2', JSON.stringify(settings));
        setSavedSettings(JSON.parse(JSON.stringify(settings)));
        setIsDirty(false);
        if (triggerToast) triggerToast('All configuration changes committed and synchronized across ResortDesk services.');
      } catch (err) {
        console.error('Failed to save settings:', err);
      } finally {
        setIsSaving(false);
      }
    }, 600);
  };

  const handleDiscard = () => {
    setSettings(JSON.parse(JSON.stringify(savedSettings)));
    setIsDirty(false);
    if (triggerToast) triggerToast('Unsaved changes discarded.');
  };

  return (
    <div id="resortdesk-settings-container" className="flex flex-col lg:flex-row gap-6 w-full min-h-[calc(100vh-140px)]">
      {/* 1. Left Sidebar: Settings Navigation (240px width) */}
      <div className="w-full lg:w-60 lg:shrink-0">
        <div className="sticky top-20">
          <SettingsNav
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectSearchResult={(id) => {
              setActiveSection(id);
              setSearchQuery('');
            }}
          />
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 min-w-0 pb-16">
        {/* Sticky Action Header */}
        <SettingsHeader
          activeSection={activeSection}
          title={sectionTitles[activeSection]?.title || 'Settings'}
          subtitle={sectionTitles[activeSection]?.subtitle || 'Configure property preferences and AI policies.'}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />

        {/* Dynamic Section Renderer */}
        <div className="w-full">
          {activeSection === 'resort-profile' && (
            <ResortProfileSection
              profile={settings.profile}
              onChange={(updated) => setSettings({ ...settings, profile: { ...settings.profile, ...updated } })}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'staff-roles' && (
            <StaffRolesSection
              roles={settings.staffRoles}
              permissions={settings.modulePermissions}
              sessions={settings.staffSessions}
              loginHistory={settings.loginHistory}
              onUpdatePermission={(moduleId, roleKey, permKey, value) => {
                setSettings({
                  ...settings,
                  modulePermissions: settings.modulePermissions.map(m => {
                    if (m.moduleId === moduleId) {
                      return {
                        ...m,
                        permissions: {
                          ...m.permissions,
                          [roleKey]: {
                            ...m.permissions[roleKey],
                            [permKey]: value
                          }
                        }
                      };
                    }
                    return m;
                  })
                });
              }}
              onTerminateSession={(sessionId) => {
                setSettings({
                  ...settings,
                  staffSessions: settings.staffSessions.filter(s => s.id !== sessionId)
                });
                if (triggerToast) triggerToast('Staff session terminated successfully.');
              }}
              onRevokeAllOtherSessions={() => {
                setSettings({
                  ...settings,
                  staffSessions: settings.staffSessions.filter(s => s.isCurrent)
                });
                if (triggerToast) triggerToast('All other staff sessions revoked.');
              }}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'myra-ai' && (
            <MyraAIEngineSection
              settings={settings.myraEngine}
              knowledgeBase={settings.knowledgeBase}
              onChangeSettings={(updated) => setSettings({ ...settings, myraEngine: { ...settings.myraEngine, ...updated } })}
              onAddKnowledgeItem={(item) => {
                const newItem = {
                  ...item,
                  id: `kb-${Date.now()}`,
                  lastUpdated: 'Just now'
                };
                setSettings({ ...settings, knowledgeBase: [newItem, ...settings.knowledgeBase] });
                if (triggerToast) triggerToast('Knowledge base article created.');
              }}
              onDeleteKnowledgeItem={(id) => {
                setSettings({
                  ...settings,
                  knowledgeBase: settings.knowledgeBase.filter(k => k.id !== id)
                });
                if (triggerToast) triggerToast('Knowledge base article removed.');
              }}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'integrations' && (
            <IntegrationsSection
              integrations={settings.integrations}
              onUpdateIntegration={(id, updated) => setSettings({
                ...settings,
                integrations: settings.integrations.map(i => i.id === id ? { ...i, ...updated } : i)
              })}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'billing-gst' && (
            <BillingGSTSection
              settings={settings.billingGst}
              onChange={(updated) => setSettings({ ...settings, billingGst: { ...settings.billingGst, ...updated } })}
              onNavigateToBilling={onNavigateToBilling}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'notifications' && (
            <NotificationsSection
              rules={settings.notifications}
              onUpdateRule={(id, updated) => setSettings({
                ...settings,
                notifications: settings.notifications.map(n => n.id === id ? { ...n, ...updated } : n)
              })}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'whatsapp' && (
            <WhatsAppSection
              config={settings.whatsapp}
              onChange={(updated) => setSettings({ ...settings, whatsapp: { ...settings.whatsapp, ...updated } })}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'booking-rules' && (
            <BookingRulesSection
              rules={settings.bookingRules}
              onChange={(updated) => setSettings({ ...settings, bookingRules: { ...settings.bookingRules, ...updated } })}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'operations' && (
            <OperationsSection
              settings={settings.operations}
              onChange={(updated) => setSettings({ ...settings, operations: { ...settings.operations, ...updated } })}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'security-privacy' && (
            <SecurityPrivacySection
              settings={settings.security}
              onChange={(updated) => setSettings({ ...settings, security: { ...settings.security, ...updated } })}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'audit-logs' && (
            <AuditLogsSection
              logs={settings.auditLogs}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'api-developer' && (
            <APIDeveloperSection
              apiKeys={settings.apiKeys}
              webhooks={settings.webhooks}
              onAddApiKey={(item) => setSettings({ ...settings, apiKeys: [item, ...settings.apiKeys] })}
              onRevokeApiKey={(id) => setSettings({ ...settings, apiKeys: settings.apiKeys.filter(k => k.id !== id) })}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'backup-data' && (
            <BackupDataSection
              backupHistory={settings.backups}
              onTakeBackup={() => {
                const newBk: BackupHistoryItem = {
                  id: `bk-${Date.now()}`,
                  timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
                  type: 'Manual Snapshot',
                  size: '42.6 MB',
                  storageLocation: 'AWS S3 (ap-south-1)',
                  status: 'Completed (Verified)'
                };
                setSettings({ ...settings, backups: [newBk, ...settings.backups] });
              }}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'localization' && (
            <LocalizationSection
              settings={settings.localization}
              onChange={(updated) => setSettings({ ...settings, localization: { ...settings.localization, ...updated } })}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'appearance' && (
            <AppearanceSection
              settings={settings.appearance}
              onChange={(updated) => setSettings({ ...settings, appearance: { ...settings.appearance, ...updated } })}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'emergency-safety' && (
            <EmergencySafetySection
              contacts={settings.emergencyContacts}
              onAddContact={(item) => setSettings({ ...settings, emergencyContacts: [item, ...settings.emergencyContacts] })}
              onDeleteContact={(id) => setSettings({
                ...settings,
                emergencyContacts: settings.emergencyContacts.filter(c => c.id !== id)
              })}
              triggerToast={triggerToast}
            />
          )}
        </div>
      </div>
    </div>
  );
}
