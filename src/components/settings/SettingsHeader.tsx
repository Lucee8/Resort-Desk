import React from 'react';
import { 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { SettingsSectionId } from '../../types';

interface SettingsHeaderProps {
  title: string;
  subtitle: string;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  lastSavedAt?: string;
  activeSection: SettingsSectionId;
}

export default function SettingsHeader({
  title,
  subtitle,
  isDirty,
  isSaving,
  onSave,
  onDiscard,
  lastSavedAt,
  activeSection
}: SettingsHeaderProps) {
  return (
    <div id="settings-view-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200/80">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {isDirty ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
              <AlertCircle className="w-3 h-3 text-amber-600" /> Unsaved Changes
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Up to date
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Discard Changes Button */}
        <button
          id="settings-discard-btn"
          type="button"
          onClick={onDiscard}
          disabled={!isDirty || isSaving}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            isDirty && !isSaving
              ? 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 hover:text-slate-900 shadow-sm cursor-pointer'
              : 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Discard Changes</span>
        </button>

        {/* Save Configuration Button */}
        <button
          id="settings-save-btn"
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-white transition-all shadow-sm ${
            isSaving 
              ? 'bg-teal-700 opacity-80 cursor-wait' 
              : isDirty
                ? 'bg-teal-900 hover:bg-teal-950 shadow-teal-900/20 hover:scale-[1.02] cursor-pointer'
                : 'bg-teal-900 hover:bg-teal-950 cursor-pointer'
          }`}
        >
          {isSaving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 text-teal-200" />
          )}
          <span>{isSaving ? 'Saving Configuration...' : 'Save Configuration'}</span>
        </button>
      </div>
    </div>
  );
}
