import React, { useState, useEffect } from 'react';
import {
  SettingsSectionId,
  ResortDeskSettings,
  BackupHistoryItem,
} from '../../types';

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
  settings: ResortDeskSettings;
  onSaveSettings: (nextSettings: ResortDeskSettings) => Promise<void>;
  onNavigateToBilling?: () => void;
  triggerToast?: (msg: string) => void;
}

export default function SettingsView({
  settings: incomingSettings,
  onSaveSettings,
  onNavigateToBilling,
  triggerToast,
}: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('resort-profile');
  const [searchQuery, setSearchQuery] = useState('');

  const [settings, setSettings] = useState<ResortDeskSettings>(incomingSettings);
  const [savedSettings, setSavedSettings] = useState<ResortDeskSettings>(incomingSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync incoming Firestore settings when there are no unsaved edits
  useEffect(() => {
    if (!isDirty) {
      setSettings(incomingSettings);
      setSavedSettings(incomingSettings);
    }
  }, [incomingSettings, isDirty]);

  useEffect(() => {
    const dirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
    setIsDirty(dirty);
  }, [settings, savedSettings]);

  const sectionTitles: Record<SettingsSectionId, { title: string; subtitle: string }> = {
    'resort-profile': {
      title: 'Resort Profile & Contact Info',
      subtitle:
        'Official property legal details, Tarkarli coordinates, check-in/out policy, and guest support hotlines.',
    },
    'staff-roles': {
      title: 'Staff Directory & RBAC Roles',
      subtitle:
        'Manage administrative staff credentials, department permissions, shift rosters, and security settings.',
    },
    'myra-ai': {
      title: 'Myra AI Intelligence Engine',
      subtitle:
        'Tune assistant persona tone, booking rules grounding, and property knowledge base.',
    },
    integrations: {
      title: 'Connected Systems & Channel Managers',
      subtitle:
        'Configure PMS, OTA calendars, payment gateways, and accounting sync status.',
    },
    'billing-gst': {
      title: 'Billing, GST & Tax Rates',
      subtitle:
        'Manage statutory GST tax rates, HSN/SAC code mapping, invoice series, and reconciliation.',
    },
    notifications: {
      title: 'Notifications & Event Matrix',
      subtitle:
        'Configure automated event routing via WhatsApp, SMS, Email, and In-App Push alerts.',
    },
    whatsapp: {
      title: 'WhatsApp Automation & Cloud API',
      subtitle:
        'Meta Cloud API endpoint configuration, approved templates, and concierge routing.',
    },
    'booking-rules': {
      title: 'Booking & Property Rules',
      subtitle:
        'Configure stay constraints, advance deposits, cancellation terms, and extra guest fees.',
    },
    operations: {
      title: 'Operations, Housekeeping & SLAs',
      subtitle:
        'Turnover duration targets, mandatory inspection photo verification, and maintenance SLAs.',
    },
    'security-privacy': {
      title: 'Security, 2FA & Data Privacy',
      subtitle:
        'Password policies, session idle timeout, and guest identity retention schedules.',
    },
    'audit-logs': {
      title: 'Audit Logs & Security Trail',
      subtitle:
        'Timestamped records tracking configuration changes, logins, and policy updates.',
    },
    'api-developer': {
      title: 'API Keys & Developer Webhooks',
      subtitle: 'Manage API keys, outbound webhooks, and integration endpoints.',
    },
    'backup-data': {
      title: 'Backup & Disaster Recovery',
      subtitle: 'Property export archives and Cloud Firestore snapshot history.',
    },
    localization: {
      title: 'Localization, Currency & Format',
      subtitle: 'Set currency symbols, date & time formatting, and language presets.',
    },
    appearance: {
      title: 'Appearance, Theme & Density',
      subtitle: 'Customize dashboard interface theme, accent colors, and UI density.',
    },
    'emergency-safety': {
      title: 'Emergency SOS & Property Safety',
      subtitle: 'Verified Sindhudurg/Malvan emergency contacts and on-call medical support.',
    },
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings(settings);
      const snapshot = JSON.parse(JSON.stringify(settings)) as ResortDeskSettings;
      setSavedSettings(snapshot);
      setIsDirty(false);
      triggerToast?.('All settings saved to Cloud Firestore (`settings/resortDesk`).');
    } catch (err) {
      triggerToast?.(
        err instanceof Error ? err.message : 'Failed to save settings to Firestore.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setSettings(JSON.parse(JSON.stringify(savedSettings)));
    setIsDirty(false);
    triggerToast?.('Unsaved changes discarded.');
  };

  return (
    <div
      id="resortdesk-settings-container"
      className="flex flex-col lg:flex-row gap-6 w-full min-h-[calc(100vh-140px)] overflow-x-hidden"
    >
      <div className="w-full lg:w-60 lg:shrink-0">
        <div className="lg:sticky lg:top-20">
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

      <div className="flex-1 flex flex-col gap-6 min-w-0 pb-16">
        <SettingsHeader
          activeSection={activeSection}
          title={sectionTitles[activeSection]?.title || 'Settings'}
          subtitle={
            sectionTitles[activeSection]?.subtitle ||
            'Configure property preferences and policies.'
          }
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={() => void handleSave()}
          onDiscard={handleDiscard}
        />

        <div className="w-full">
          {activeSection === 'resort-profile' && (
            <ResortProfileSection
              profile={settings.profile}
              onChange={(updated) =>
                setSettings({ ...settings, profile: { ...settings.profile, ...updated } })
              }
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
                  modulePermissions: settings.modulePermissions.map((m) => {
                    if (m.moduleId === moduleId) {
                      return {
                        ...m,
                        permissions: {
                          ...m.permissions,
                          [roleKey]: {
                            ...m.permissions[roleKey],
                            [permKey]: value,
                          },
                        },
                      };
                    }
                    return m;
                  }),
                });
              }}
              onTerminateSession={(sessionId) => {
                setSettings({
                  ...settings,
                  staffSessions: settings.staffSessions.filter((s) => s.id !== sessionId),
                });
                triggerToast?.('Session removed. Click Save Changes to persist.');
              }}
              onRevokeAllOtherSessions={() => {
                setSettings({
                  ...settings,
                  staffSessions: settings.staffSessions.filter((s) => s.isCurrent),
                });
                triggerToast?.('Other sessions cleared. Click Save Changes to persist.');
              }}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'myra-ai' && (
            <MyraAIEngineSection
              settings={settings.myraEngine}
              knowledgeBase={settings.knowledgeBase}
              onChangeSettings={(updated) =>
                setSettings({
                  ...settings,
                  myraEngine: { ...settings.myraEngine, ...updated },
                })
              }
              onAddKnowledgeItem={(item) => {
                const newItem = {
                  ...item,
                  id: `kb-${Date.now()}`,
                  lastUpdated: 'Just now',
                };
                setSettings({
                  ...settings,
                  knowledgeBase: [newItem, ...settings.knowledgeBase],
                });
                triggerToast?.('Knowledge base article added. Click Save to commit.');
              }}
              onDeleteKnowledgeItem={(id) => {
                setSettings({
                  ...settings,
                  knowledgeBase: settings.knowledgeBase.filter((k) => k.id !== id),
                });
                triggerToast?.('Knowledge base article removed.');
              }}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'integrations' && (
            <IntegrationsSection
              integrations={settings.integrations}
              onUpdateIntegration={(id, updated) =>
                setSettings({
                  ...settings,
                  integrations: settings.integrations.map((i) =>
                    i.id === id ? { ...i, ...updated } : i
                  ),
                })
              }
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'billing-gst' && (
            <BillingGSTSection
              settings={settings.billingGst}
              onChange={(updated) =>
                setSettings({
                  ...settings,
                  billingGst: { ...settings.billingGst, ...updated },
                })
              }
              onNavigateToBilling={onNavigateToBilling}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'notifications' && (
            <NotificationsSection
              rules={settings.notifications}
              onUpdateRule={(id, updated) =>
                setSettings({
                  ...settings,
                  notifications: settings.notifications.map((n) =>
                    n.id === id ? { ...n, ...updated } : n
                  ),
                })
              }
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'whatsapp' && (
            <WhatsAppSection
              config={settings.whatsapp}
              onChange={(updated) =>
                setSettings({
                  ...settings,
                  whatsapp: { ...settings.whatsapp, ...updated },
                })
              }
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'booking-rules' && (
            <BookingRulesSection
              rules={settings.bookingRules}
              onChange={(updated) =>
                setSettings({
                  ...settings,
                  bookingRules: { ...settings.bookingRules, ...updated },
                })
              }
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'operations' && (
            <OperationsSection
              settings={settings.operations}
              onChange={(updated) =>
                setSettings({
                  ...settings,
                  operations: { ...settings.operations, ...updated },
                })
              }
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'security-privacy' && (
            <SecurityPrivacySection
              settings={settings.security}
              onChange={(updated) =>
                setSettings({
                  ...settings,
                  security: { ...settings.security, ...updated },
                })
              }
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'audit-logs' && (
            <AuditLogsSection logs={settings.auditLogs} triggerToast={triggerToast} />
          )}

          {activeSection === 'api-developer' && (
            <APIDeveloperSection
              apiKeys={settings.apiKeys}
              webhooks={settings.webhooks}
              onAddApiKey={(item) =>
                setSettings({ ...settings, apiKeys: [item, ...settings.apiKeys] })
              }
              onRevokeApiKey={(id) =>
                setSettings({
                  ...settings,
                  apiKeys: settings.apiKeys.filter((k) => k.id !== id),
                })
              }
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'backup-data' && (
            <BackupDataSection
              backupHistory={settings.backups}
              onTakeBackup={() => {
                const newBk: BackupHistoryItem = {
                  id: `bk-${Date.now()}`,
                  timestamp: new Date().toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }),
                  type: 'Manual Snapshot',
                  size: 'JSON Export',
                  storageLocation: 'Cloud Firestore (asia-south1)',
                  status: 'Completed (Verified)',
                };
                setSettings({ ...settings, backups: [newBk, ...settings.backups] });
              }}
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'localization' && (
            <LocalizationSection
              settings={settings.localization}
              onChange={(updated) =>
                setSettings({
                  ...settings,
                  localization: { ...settings.localization, ...updated },
                })
              }
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'appearance' && (
            <AppearanceSection
              settings={settings.appearance}
              onChange={(updated) =>
                setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, ...updated },
                })
              }
              triggerToast={triggerToast}
            />
          )}

          {activeSection === 'emergency-safety' && (
            <EmergencySafetySection
              contacts={settings.emergencyContacts}
              onAddContact={(item) =>
                setSettings({
                  ...settings,
                  emergencyContacts: [item, ...settings.emergencyContacts],
                })
              }
              onDeleteContact={(id) =>
                setSettings({
                  ...settings,
                  emergencyContacts: settings.emergencyContacts.filter((c) => c.id !== id),
                })
              }
              triggerToast={triggerToast}
            />
          )}
        </div>
      </div>
    </div>
  );
}
