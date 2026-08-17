import React, { useState } from 'react';
import { 
  GitBranch, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  Clock, 
  Calendar, 
  Send, 
  Sparkles, 
  Bell, 
  Split, 
  Flag, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Settings2, 
  Play, 
  MessageSquare,
  Bed,
  CheckCircle2,
  ChevronDown,
  FileCode2,
  Sliders,
  Smartphone
} from 'lucide-react';
import { 
  WhatsAppWorkflow, 
  WhatsAppWorkflowNode, 
  WhatsAppNodeType 
} from '../../types';

interface WorkflowBuilderCanvasProps {
  workflow: WhatsAppWorkflow;
  allWorkflows: WhatsAppWorkflow[];
  onSelectWorkflow: (wf: WhatsAppWorkflow) => void;
  onUpdateWorkflow: (updated: WhatsAppWorkflow) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onNodeClick: (node: WhatsAppWorkflowNode) => void;
  onAddNodeAfter: (index: number, type: WhatsAppNodeType) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onMoveNode: (index: number, direction: 'up' | 'down') => void;
  onOpenSimulator: (node?: WhatsAppWorkflowNode) => void;
  onManageTemplates: () => void;
}

export default function WorkflowBuilderCanvas({
  workflow,
  allWorkflows,
  onSelectWorkflow,
  onUpdateWorkflow,
  onSaveDraft,
  onPublish,
  onNodeClick,
  onAddNodeAfter,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  onOpenSimulator,
  onManageTemplates
}: WorkflowBuilderCanvasProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showWorkflowDropdown, setShowWorkflowDropdown] = useState<boolean>(false);
  const [hoveredAddIndex, setHoveredAddIndex] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 140));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 70));
  const handleResetZoom = () => setZoomLevel(100);

  const getNodeIcon = (node: WhatsAppWorkflowNode) => {
    switch (node.type) {
      case 'trigger':
        return <Bed className="w-5 h-5 text-white" />;
      case 'wait':
        return <Clock className="w-4 h-4 text-slate-600" />;
      case 'action':
        return <Send className="w-4 h-4 text-white" />;
      case 'condition':
        return <Split className="w-4 h-4 text-white" />;
      case 'ai_action':
        return <Sparkles className="w-4 h-4 text-white" />;
      case 'notification':
        return <Bell className="w-4 h-4 text-white" />;
      case 'end':
        return <Flag className="w-4 h-4 text-white" />;
      default:
        return <Send className="w-4 h-4 text-white" />;
    }
  };

  const getNodeBadgeColor = (type: WhatsAppNodeType) => {
    switch (type) {
      case 'trigger':
        return 'text-[#0f3833]';
      case 'wait':
        return 'text-slate-500';
      case 'action':
        return 'text-blue-700';
      case 'condition':
        return 'text-amber-700';
      case 'ai_action':
        return 'text-purple-700';
      case 'notification':
        return 'text-orange-700';
      case 'end':
        return 'text-emerald-700';
      default:
        return 'text-slate-600';
    }
  };

  const getNodeIconBg = (type: WhatsAppNodeType) => {
    switch (type) {
      case 'trigger':
        return 'bg-[#0f3833]';
      case 'action':
        return 'bg-blue-500';
      case 'condition':
        return 'bg-amber-500';
      case 'ai_action':
        return 'bg-[#5b3bf5]';
      case 'notification':
        return 'bg-orange-500';
      case 'end':
        return 'bg-emerald-600';
      default:
        return 'bg-slate-700';
    }
  };

  // Helper to format text with highlighted variables like {{GuestName}}
  const renderMessageTextWithVariables = (text?: string) => {
    if (!text) return null;
    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('{{') && part.endsWith('}}')) {
            return (
              <span 
                key={i} 
                className="inline-block bg-teal-100/80 text-teal-800 font-semibold px-1 py-0.2 rounded text-[11px] border border-teal-200/60 mx-0.5"
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div id="workflow-builder-container" className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[720px]">
      {/* Top Builder Control Bar */}
      <div className="border-b border-slate-200/80 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-white z-10">
        {/* Left: Workflow Name & Trigger Summary */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
            <GitBranch className="w-5 h-5 text-slate-700" />
          </div>
          <div className="relative">
            <div 
              onClick={() => setShowWorkflowDropdown(!showWorkflowDropdown)}
              className="flex items-center gap-1.5 cursor-pointer group"
            >
              <h2 className="text-base font-bold text-slate-900 font-sans group-hover:text-teal-900 transition-colors">
                {workflow.name}
              </h2>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              {workflow.status === 'active' && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ml-1">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-normal">
              {workflow.triggerType || 'Triggered on new booking'}
            </p>

            {/* Workflow Switcher Dropdown */}
            {showWorkflowDropdown && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Workflow
                </div>
                {allWorkflows.map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => {
                      onSelectWorkflow(wf);
                      setShowWorkflowDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      wf.id === workflow.id 
                        ? 'bg-teal-50 text-teal-900 font-semibold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-800">{wf.name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{wf.triggerType}</p>
                    </div>
                    {wf.id === workflow.id && <Check className="w-4 h-4 text-teal-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Zoom controls, Draft, and Publish buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Simulator preview button */}
          <button
            onClick={() => onOpenSimulator()}
            title="Preview WhatsApp Experience"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200/70 transition-all cursor-pointer mr-1"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Test Chat</span>
          </button>

          {/* Templates Library button */}
          <button
            onClick={onManageTemplates}
            title="Manage WhatsApp Approved Templates"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all cursor-pointer mr-1"
          >
            <FileCode2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Templates</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100/90 rounded-lg p-0.5 border border-slate-200/80 mr-2">
            <button
              onClick={handleZoomOut}
              title="Zoom out"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-medium text-slate-600 px-1 min-w-[36px] text-center select-none">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom in"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset zoom"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Save Draft Button */}
          <button
            id="workflow-save-draft-btn"
            onClick={onSaveDraft}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-3.5 py-1.5 text-xs font-semibold border border-slate-200 transition-all shadow-2xs cursor-pointer"
          >
            Save Draft
          </button>

          {/* Publish Button (Emerald) */}
          <button
            id="workflow-publish-btn"
            onClick={onPublish}
            className="bg-[#10b981] hover:bg-[#059669] text-white rounded-lg px-4 py-1.5 text-xs font-semibold transition-all shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Interactive Dotted Canvas */}
      <div 
        id="workflow-dotted-canvas"
        className="flex-1 w-full overflow-y-auto overflow-x-hidden p-8 flex flex-col items-center justify-start bg-slate-50/50 transition-transform origin-top"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center'
        }}
      >
        <div className="w-full max-w-xl flex flex-col items-center">
          {workflow.nodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            const isWaitNode = node.type === 'wait';

            return (
              <React.Fragment key={node.id}>
                {/* Connecting Line from previous node (if not the first node) */}
                {index > 0 && (
                  <div className="relative flex flex-col items-center group/line">
                    <div className="w-0.5 h-7 border-l-2 border-dashed border-slate-300 my-0.5 transition-colors group-hover/line:border-teal-500" />
                    
                    {/* Add Step between nodes (+) on hover */}
                    <div className="absolute top-1/2 -translate-y-1/2 z-20">
                      <div className="relative">
                        <button
                          onClick={() => setHoveredAddIndex(hoveredAddIndex === index ? null : index)}
                          title="Insert step here"
                          className="w-5 h-5 rounded-full bg-white hover:bg-teal-600 hover:text-white text-slate-400 border border-slate-300 hover:border-teal-600 flex items-center justify-center shadow-xs transition-all cursor-pointer group-hover/line:scale-110"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        {/* Add Step Dropdown Popover */}
                        {hoveredAddIndex === index && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-60 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95">
                            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Insert Step
                            </div>
                            <button
                              onClick={() => {
                                onAddNodeAfter(index - 1, 'wait');
                                setHoveredAddIndex(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                            >
                              <Clock className="w-4 h-4 text-slate-500" />
                              <span>Wait / Delay Timer</span>
                            </button>
                            <button
                              onClick={() => {
                                onAddNodeAfter(index - 1, 'action');
                                setHoveredAddIndex(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                            >
                              <Send className="w-4 h-4 text-blue-500" />
                              <span>Send WhatsApp Message</span>
                            </button>
                            <button
                              onClick={() => {
                                onAddNodeAfter(index - 1, 'ai_action');
                                setHoveredAddIndex(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                            >
                              <Sparkles className="w-4 h-4 text-purple-600" />
                              <span>Myra AI Auto-Reply</span>
                            </button>
                            <button
                              onClick={() => {
                                onAddNodeAfter(index - 1, 'condition');
                                setHoveredAddIndex(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                            >
                              <Split className="w-4 h-4 text-amber-500" />
                              <span>Branch / Condition</span>
                            </button>
                            <button
                              onClick={() => {
                                onAddNodeAfter(index - 1, 'notification');
                                setHoveredAddIndex(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                            >
                              <Bell className="w-4 h-4 text-orange-500" />
                              <span>Staff Notification</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* NODE RENDERING */}
                {isWaitNode ? (
                  /* WAIT PILL NODE (Exact reference style) */
                  <div 
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      onNodeClick(node);
                    }}
                    className={`relative group flex items-center gap-2 px-4 py-2 rounded-xl bg-[#eceff3]/90 hover:bg-[#e2e7ec] border border-slate-300/80 transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
                      isSelected ? 'ring-2 ring-teal-700 bg-teal-50/80 border-teal-300' : ''
                    }`}
                  >
                    {node.config.waitUnit === 'days' ? (
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span className="text-xs font-semibold text-slate-700 font-sans">
                      {node.title}
                    </span>

                    {/* Quick action buttons on node hover */}
                    <div className="hidden group-hover:flex items-center gap-1 pl-2 border-l border-slate-300 ml-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNode(node.id);
                        }}
                        title="Delete wait step"
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Top and Bottom Connection Connector Dots */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-300" />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-300" />
                  </div>
                ) : (
                  /* STANDARD CARD NODE (Trigger, Action, AI Agent, Condition, End) */
                  <div
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      onNodeClick(node);
                    }}
                    className={`relative w-full max-w-[420px] bg-white rounded-2xl border p-4.5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group ${
                      isSelected 
                        ? 'border-teal-700 ring-2 ring-teal-700/20' 
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Icon + Badge + Title + Quick Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Icon Circle */}
                        <div className={`w-10 h-10 rounded-full ${getNodeIconBg(node.type)} flex items-center justify-center shrink-0 shadow-sm`}>
                          {getNodeIcon(node)}
                        </div>

                        {/* Title & Type Badge */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold tracking-widest uppercase ${getNodeBadgeColor(node.type)}`}>
                              {node.badgeLabel || node.type}
                            </span>
                            {node.config.templateName && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                • {node.config.templateName}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 font-sans mt-0.5">
                            {node.title}
                          </h3>
                        </div>
                      </div>

                      {/* Right Connector Handle (Reference design dot) */}
                      <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-300 group-hover:border-teal-600 transition-colors shrink-0 mt-2" />
                    </div>

                    {/* Content Preview / Snippet */}
                    {node.config.messageText && (
                      <div className="mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-200/70 text-xs text-slate-600 font-normal leading-relaxed">
                        {renderMessageTextWithVariables(node.config.messageText)}

                        {/* Button action tags if present */}
                        {node.config.buttons && node.config.buttons.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-200/60">
                            {node.config.buttons.map((btn, bidx) => (
                              <span 
                                key={bidx} 
                                className="inline-flex items-center text-[10px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs"
                              >
                                {btn.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI Prompt Preview for AI Action */}
                    {node.type === 'ai_action' && node.config.aiPrompt && (
                      <div className="mt-3 bg-purple-50/70 rounded-xl p-2.5 border border-purple-100 text-xs text-purple-900 font-normal leading-relaxed">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-800 mb-1">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>Myra AI Agent Directives:</span>
                        </div>
                        <p className="line-clamp-2 text-purple-950/80">
                          {node.config.aiPrompt}
                        </p>
                      </div>
                    )}

                    {/* Condition details if condition node */}
                    {node.type === 'condition' && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-emerald-50 border border-emerald-200/70 rounded-lg p-2">
                          <span className="text-[10px] font-bold text-emerald-700 block uppercase tracking-wider">IF TRUE</span>
                          <span className="text-slate-800 font-medium">{node.config.trueBranchLabel || 'Continue Journey'}</span>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 rounded-lg p-2">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">ELSE</span>
                          <span className="text-slate-800 font-medium">{node.config.falseBranchLabel || 'Skip Step'}</span>
                        </div>
                      </div>
                    )}

                    {/* Node Hover Actions Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNodeClick(node);
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Settings2 className="w-3 h-3" />
                          Configure
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSimulator(node);
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Smartphone className="w-3 h-3" />
                          Test
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {index > 0 && index < workflow.nodes.length - 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveNode(index, 'up');
                              }}
                              title="Move Up"
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveNode(index, 'down');
                              }}
                              title="Move Down"
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateNode(node.id);
                          }}
                          title="Duplicate step"
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {node.type !== 'trigger' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNode(node.id);
                            }}
                            title="Delete step"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Top and Bottom Connector Dots */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-300" />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-300" />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Add Step at the End of Workflow */}
          <div className="mt-4 flex flex-col items-center">
            <button
              onClick={() => onAddNodeAfter(workflow.nodes.length - 1, 'action')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-dashed border-slate-300 hover:border-teal-700 text-xs font-semibold text-slate-600 hover:text-teal-900 transition-all shadow-2xs cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700" />
              <span>Add Next Step</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
