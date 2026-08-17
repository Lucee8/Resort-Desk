import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  GitBranch, 
  Check, 
  Play, 
  Pause, 
  TrendingUp, 
  Users, 
  Copy, 
  Trash2, 
  ArrowRight,
  Sparkles,
  Search
} from 'lucide-react';
import { WhatsAppWorkflow } from '../../types';

interface WorkflowsListModalProps {
  workflows: WhatsAppWorkflow[];
  activeWorkflowId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkflow: (wf: WhatsAppWorkflow) => void;
  onCreateNewWorkflow: () => void;
  onToggleStatus: (wfId: string) => void;
  onDuplicateWorkflow: (wf: WhatsAppWorkflow) => void;
}

export default function WorkflowsListModal({
  workflows,
  activeWorkflowId,
  isOpen,
  onClose,
  onSelectWorkflow,
  onCreateNewWorkflow,
  onToggleStatus,
  onDuplicateWorkflow
}: WorkflowsListModalProps) {
  const [search, setSearch] = useState('');

  const filtered = workflows.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.description.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Active WhatsApp Automations
              </h3>
              <p className="text-xs text-slate-500">
                Manage guest communication journeys, pre-arrival workflows, and post-stay campaigns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="px-6 py-3 border-b border-slate-200/80 flex items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          <button
            onClick={() => {
              onCreateNewWorkflow();
              onClose();
            }}
            className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Automation</span>
          </button>
        </div>

        {/* Workflow Cards List */}
        <div className="p-6 overflow-y-auto flex flex-col gap-3.5">
          {filtered.map((wf) => {
            const isSelected = wf.id === activeWorkflowId;

            return (
              <div
                key={wf.id}
                className={`border rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 ${
                  isSelected 
                    ? 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-600/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 font-sans">
                      {wf.name}
                    </h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      wf.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {wf.status}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-full">
                        Currently Open in Builder
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2">
                    {wf.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <strong>{wf.totalEnrolled || 0}</strong> guests enrolled
                    </span>
                    <span>•</span>
                    <span><strong>{wf.nodes.length}</strong> journey steps</span>
                    <span>•</span>
                    <span>Updated {wf.updatedAt}</span>
                  </div>
                </div>

                {/* Right Metrics & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleStatus(wf.id)}
                    title={wf.status === 'active' ? 'Pause Automation' : 'Activate Automation'}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      wf.status === 'active'
                        ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {wf.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onDuplicateWorkflow(wf)}
                    title="Duplicate Workflow"
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectWorkflow(wf);
                      onClose();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{isSelected ? 'Editing Now' : 'Open in Builder'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
