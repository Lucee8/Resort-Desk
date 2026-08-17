import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  Sparkles, 
  Clock, 
  FileCode2, 
  MessageSquare, 
  AlertCircle,
  Smartphone,
  Bot
} from 'lucide-react';

import WhatsAppKPIHeader from './whatsapp/WhatsAppKPIHeader';
import WorkflowBuilderCanvas from './whatsapp/WorkflowBuilderCanvas';
import MyraAIAssistantPanel from './whatsapp/MyraAIAssistantPanel';
import NodeConfigModal from './whatsapp/NodeConfigModal';
import WhatsAppChatSimulator from './whatsapp/WhatsAppChatSimulator';
import TemplateManagerModal from './whatsapp/TemplateManagerModal';
import WorkflowsListModal from './whatsapp/WorkflowsListModal';
import MessageLogsModal from './whatsapp/MessageLogsModal';

import { 
  initialWhatsAppKPIs, 
  initialWhatsAppTemplates, 
  initialWorkflows, 
  initialMyraAIInsights, 
  initialMessageLogs 
} from '../data/whatsappData';

import { 
  WhatsAppWorkflow, 
  WhatsAppWorkflowNode, 
  WhatsAppNodeType, 
  WhatsAppTemplate, 
  MyraAIWorkflowInsight, 
  WhatsAppMessageLog 
} from '../types';

export default function WhatsAppAutomationView() {
  // 1. Workflows State (with localStorage persistence)
  const [workflows, setWorkflows] = useState<WhatsAppWorkflow[]>(() => {
    const saved = localStorage.getItem('resortdesk_whatsapp_workflows');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialWorkflows;
  });

  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(() => {
    return workflows[0]?.id || 'wf-standard-journey';
  });

  // 2. Templates State
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(() => {
    const saved = localStorage.getItem('resortdesk_whatsapp_templates');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialWhatsAppTemplates;
  });

  // 3. AI Insights State
  const [insights, setInsights] = useState<MyraAIWorkflowInsight[]>(() => {
    const saved = localStorage.getItem('resortdesk_whatsapp_insights');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialMyraAIInsights;
  });

  // 4. Message Logs State
  const [logs, setLogs] = useState<WhatsAppMessageLog[]>(initialMessageLogs);

  // 5. Header Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 6. Modals State
  const [selectedNodeToEdit, setSelectedNodeToEdit] = useState<WhatsAppWorkflowNode | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isWorkflowsModalOpen, setIsWorkflowsModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // 7. Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  // Save changes to localStorage helper
  const updateWorkflowState = (newWorkflows: WhatsAppWorkflow[]) => {
    setWorkflows(newWorkflows);
    localStorage.setItem('resortdesk_whatsapp_workflows', JSON.stringify(newWorkflows));
  };

  // Node editing handlers
  const handleNodeClick = (node: WhatsAppWorkflowNode) => {
    setSelectedNodeToEdit(node);
    setIsNodeModalOpen(true);
  };

  const handleSaveNodeConfig = (updatedNode: WhatsAppWorkflowNode) => {
    if (!activeWorkflow) return;
    const nextNodes = activeWorkflow.nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
    const updatedWf = {
      ...activeWorkflow,
      nodes: nextNodes,
      updatedAt: 'Just now'
    };
    const nextList = workflows.map(w => w.id === updatedWf.id ? updatedWf : w);
    updateWorkflowState(nextList);
    triggerToast(`Updated step: "${updatedNode.title}"`);
  };

  const handleAddNodeAfter = (index: number, type: WhatsAppNodeType) => {
    if (!activeWorkflow) return;

    let newNode: WhatsAppWorkflowNode;
    const newId = `node-${Date.now()}`;

    switch (type) {
      case 'wait':
        newNode = {
          id: newId,
          type: 'wait',
          title: 'Wait 1h',
          subtitle: 'Scheduled delay',
          config: {
            waitDuration: 1,
            waitUnit: 'hours',
            waitTimingType: 'after_previous'
          }
        };
        break;
      case 'action':
        newNode = {
          id: newId,
          type: 'action',
          title: 'Send Custom WhatsApp Message',
          subtitle: 'Utility or Concierge message',
          badgeLabel: 'ACTION',
          config: {
            messageText: 'Hi {{GuestName}}, thank you for connecting with {{ResortName}} concierge.',
            buttons: [{ type: 'quick_reply', label: 'View Resort Services' }]
          }
        };
        break;
      case 'ai_action':
        newNode = {
          id: newId,
          type: 'ai_action',
          title: 'Myra AI Smart Concierge',
          subtitle: 'Automated 24/7 guest answers',
          badgeLabel: 'AI AGENT',
          config: {
            aiPrompt: 'Respond politely to guest inquiries about dining, spa, and pool amenities using ResortDesk knowledge base.',
            aiTone: 'Warm & Hospitable',
            fallbackToHuman: true
          }
        };
        break;
      case 'condition':
        newNode = {
          id: newId,
          type: 'condition',
          title: 'Guest Has Replied?',
          badgeLabel: 'CONDITION',
          config: {
            conditionField: 'has_replied',
            conditionOperator: 'is_true',
            trueBranchLabel: 'Engage Myra AI',
            falseBranchLabel: 'Continue Timeline'
          }
        };
        break;
      case 'notification':
        newNode = {
          id: newId,
          type: 'notification',
          title: 'Notify Front Office Manager',
          subtitle: 'Internal staff alert',
          badgeLabel: 'STAFF NOTIFY',
          config: {
            notifyRole: 'front_desk',
            notificationTitle: 'Guest Request Logged',
            notificationBody: 'Guest in {{RoomNumber}} initiated inquiry.'
          }
        };
        break;
      default:
        newNode = {
          id: newId,
          type: 'action',
          title: 'Send Message',
          badgeLabel: 'ACTION',
          config: { messageText: 'Hello {{GuestName}}!' }
        };
    }

    const nextNodes = [...activeWorkflow.nodes];
    nextNodes.splice(index + 1, 0, newNode);

    const updatedWf = {
      ...activeWorkflow,
      nodes: nextNodes,
      updatedAt: 'Just now'
    };
    const nextList = workflows.map(w => w.id === updatedWf.id ? updatedWf : w);
    updateWorkflowState(nextList);
    triggerToast(`Added new step: "${newNode.title}"`);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!activeWorkflow) return;
    const nextNodes = activeWorkflow.nodes.filter(n => n.id !== nodeId);
    const updatedWf = {
      ...activeWorkflow,
      nodes: nextNodes,
      updatedAt: 'Just now'
    };
    const nextList = workflows.map(w => w.id === updatedWf.id ? updatedWf : w);
    updateWorkflowState(nextList);
    triggerToast('Step removed from journey');
  };

  const handleDuplicateNode = (nodeId: string) => {
    if (!activeWorkflow) return;
    const idx = activeWorkflow.nodes.findIndex(n => n.id === nodeId);
    if (idx === -1) return;

    const original = activeWorkflow.nodes[idx];
    const duplicate: WhatsAppWorkflowNode = {
      ...original,
      id: `node-${Date.now()}`,
      title: `${original.title} (Copy)`
    };

    const nextNodes = [...activeWorkflow.nodes];
    nextNodes.splice(idx + 1, 0, duplicate);

    const updatedWf = {
      ...activeWorkflow,
      nodes: nextNodes,
      updatedAt: 'Just now'
    };
    const nextList = workflows.map(w => w.id === updatedWf.id ? updatedWf : w);
    updateWorkflowState(nextList);
    triggerToast(`Duplicated step "${original.title}"`);
  };

  const handleMoveNode = (index: number, direction: 'up' | 'down') => {
    if (!activeWorkflow) return;
    const nextNodes = [...activeWorkflow.nodes];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= nextNodes.length) return;

    const temp = nextNodes[index];
    nextNodes[index] = nextNodes[targetIdx];
    nextNodes[targetIdx] = temp;

    const updatedWf = {
      ...activeWorkflow,
      nodes: nextNodes,
      updatedAt: 'Just now'
    };
    const nextList = workflows.map(w => w.id === updatedWf.id ? updatedWf : w);
    updateWorkflowState(nextList);
  };

  // Draft and Publish Handlers
  const handleSaveDraft = () => {
    if (!activeWorkflow) return;
    const updatedWf = {
      ...activeWorkflow,
      status: 'draft' as const,
      updatedAt: 'Just now'
    };
    const nextList = workflows.map(w => w.id === updatedWf.id ? updatedWf : w);
    updateWorkflowState(nextList);
    triggerToast(`Workflow "${activeWorkflow.name}" saved as draft.`);
  };

  const handlePublish = () => {
    if (!activeWorkflow) return;

    // Validation checks before publishing
    const invalidNodes = activeWorkflow.nodes.filter(
      n => n.type === 'action' && (!n.config.messageText || n.config.messageText.trim() === '')
    );

    if (invalidNodes.length > 0) {
      alert('Validation Error: One or more WhatsApp Message steps are missing message content. Please configure them before publishing.');
      return;
    }

    const updatedWf = {
      ...activeWorkflow,
      status: 'active' as const,
      updatedAt: 'Just now'
    };
    const nextList = workflows.map(w => w.id === updatedWf.id ? updatedWf : w);
    updateWorkflowState(nextList);
    triggerToast(`🎉 Successfully published "${activeWorkflow.name}" to live WhatsApp Cloud API!`);
  };

  // Myra AI Panel Action Handlers
  const handleApplyInsight = (insight: MyraAIWorkflowInsight) => {
    if (!activeWorkflow) return;

    if (insight.suggestedNode) {
      // Insert after welcome message or at index 5
      const nextNodes = [...activeWorkflow.nodes];
      const insertPos = Math.min(nextNodes.length - 1, 5);
      nextNodes.splice(insertPos, 0, {
        ...insight.suggestedNode,
        id: `ai-node-${Date.now()}`
      });

      const updatedWf = {
        ...activeWorkflow,
        nodes: nextNodes,
        updatedAt: 'Just now'
      };
      const nextList = workflows.map(w => w.id === updatedWf.id ? updatedWf : w);
      updateWorkflowState(nextList);
    }

    // Remove or mark applied
    const nextInsights = insights.filter(i => i.id !== insight.id);
    setInsights(nextInsights);
    localStorage.setItem('resortdesk_whatsapp_insights', JSON.stringify(nextInsights));
    triggerToast(`Myra AI optimization applied: ${insight.title}`);
  };

  const handleDismissInsight = (insightId: string) => {
    const nextInsights = insights.filter(i => i.id !== insightId);
    setInsights(nextInsights);
    localStorage.setItem('resortdesk_whatsapp_insights', JSON.stringify(nextInsights));
    triggerToast('Recommendation dismissed');
  };

  const handleInsertTemplate = (template: WhatsAppTemplate) => {
    if (!activeWorkflow) return;

    const newActionNode: WhatsAppWorkflowNode = {
      id: `tmpl-node-${Date.now()}`,
      type: 'action',
      title: template.name.replace(/resort_|v\d+|_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      subtitle: template.name,
      badgeLabel: 'ACTION',
      config: {
        templateId: template.id,
        templateName: template.name,
        messageText: template.body,
        buttons: template.buttons
      }
    };

    const nextNodes = [...activeWorkflow.nodes];
    const insertPos = Math.max(0, nextNodes.length - 1);
    nextNodes.splice(insertPos, 0, newActionNode);

    const updatedWf = {
      ...activeWorkflow,
      nodes: nextNodes,
      updatedAt: 'Just now'
    };
    const nextList = workflows.map(w => w.id === updatedWf.id ? updatedWf : w);
    updateWorkflowState(nextList);
    triggerToast(`Added template step: "${newActionNode.title}"`);
  };

  const handleCreateNewWorkflow = () => {
    const newWf: WhatsAppWorkflow = {
      id: `wf-custom-${Date.now()}`,
      name: 'New Custom Guest Journey',
      description: 'Custom automated guest messaging sequence for ResortDesk.',
      triggerType: 'Booking Created (Direct & OTA)',
      status: 'draft',
      createdAt: 'Today',
      updatedAt: 'Just now',
      totalEnrolled: 0,
      totalCompleted: 0,
      conversionRate: 0,
      nodes: [
        {
          id: `node-c1-${Date.now()}`,
          type: 'trigger',
          title: 'Booking Created',
          subtitle: 'All channels',
          badgeLabel: 'TRIGGER',
          config: { triggerEvent: 'booking_created' }
        },
        {
          id: `node-c2-${Date.now()}`,
          type: 'wait',
          title: 'Wait 5m',
          config: { waitDuration: 5, waitUnit: 'minutes', waitTimingType: 'after_previous' }
        },
        {
          id: `node-c3-${Date.now()}`,
          type: 'action',
          title: 'Send Confirmation',
          badgeLabel: 'ACTION',
          config: {
            messageText: 'Hi {{GuestName}}, your reservation at {{ResortName}} is confirmed for {{CheckInDate}} in {{RoomNumber}}.'
          }
        },
        {
          id: `node-c4-${Date.now()}`,
          type: 'end',
          title: 'Workflow Completed',
          badgeLabel: 'END',
          config: {}
        }
      ]
    };

    const nextList = [newWf, ...workflows];
    updateWorkflowState(nextList);
    setActiveWorkflowId(newWf.id);
    triggerToast('Created new draft workflow!');
  };

  return (
    <div id="whatsapp-automation-view" className="flex-1 flex flex-col p-6 bg-[#fcfdfd] overflow-y-auto font-sans relative min-h-screen">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-3 fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Section: Title, Search, Date/Status Filters, + Create Automation & 5 KPI Cards */}
      <WhatsAppKPIHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onCreateAutomation={handleCreateNewWorkflow}
        onViewAllAutomations={() => setIsWorkflowsModalOpen(true)}
        kpiData={initialWhatsAppKPIs}
      />

      {/* Quick Navigation Action Strip for Power Users */}
      <div className="flex items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Quick Access:</span>
          <button
            onClick={() => setIsWorkflowsModalOpen(true)}
            className="text-slate-600 hover:text-teal-900 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium transition-colors shadow-2xs cursor-pointer"
          >
            All Workflows ({workflows.length})
          </button>
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="text-slate-600 hover:text-teal-900 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <FileCode2 className="w-3 h-3 text-slate-400" />
            Meta Templates ({templates.length})
          </button>
          <button
            onClick={() => setIsLogsModalOpen(true)}
            className="text-slate-600 hover:text-teal-900 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <Clock className="w-3 h-3 text-slate-400" />
            Live Delivery Logs ({logs.length})
          </button>
        </div>

        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Launch WhatsApp Smartphone Simulator</span>
        </button>
      </div>

      {/* Main 2-Column Section: Workflow Canvas (Left) & Myra AI Assistant Panel (Right) */}
      <div className="flex flex-col lg:flex-row items-start gap-6 flex-1">
        {/* Left: Workflow Builder Canvas */}
        <WorkflowBuilderCanvas
          workflow={activeWorkflow}
          allWorkflows={workflows}
          onSelectWorkflow={(wf) => setActiveWorkflowId(wf.id)}
          onUpdateWorkflow={(wf) => {
            const nextList = workflows.map(w => w.id === wf.id ? wf : w);
            updateWorkflowState(nextList);
          }}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onNodeClick={handleNodeClick}
          onAddNodeAfter={handleAddNodeAfter}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onMoveNode={handleMoveNode}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onManageTemplates={() => setIsTemplatesModalOpen(true)}
        />

        {/* Right: Myra AI Assistant Panel */}
        <MyraAIAssistantPanel
          insights={insights}
          suggestedTemplates={templates.slice(2, 6)}
          onApplyInsight={handleApplyInsight}
          onDismissInsight={handleDismissInsight}
          onInsertTemplate={handleInsertTemplate}
          onAnalyzeWorkflow={() => {
            triggerToast('Myra AI audit completed: 0 critical friction points detected.');
          }}
        />
      </div>

      {/* Floating Bottom-Right AI Trigger Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => {
            if (insights.length > 0) {
              handleApplyInsight(insights[0]);
            } else {
              triggerToast('Myra AI Concierge is actively optimizing all workflows in the background.');
            }
          }}
          title="Myra AI Quick Assist"
          className="w-12 h-12 rounded-full bg-[#2e1d7a] hover:bg-[#201563] text-white flex items-center justify-center shadow-lg shadow-purple-900/30 hover:scale-105 transition-all cursor-pointer"
        >
          <Sparkles className="w-5 h-5 fill-white/20 text-white" />
        </button>
      </div>

      {/* MODALS */}
      {/* 1. Node Configuration Modal */}
      <NodeConfigModal
        node={selectedNodeToEdit}
        templates={templates}
        isOpen={isNodeModalOpen}
        onClose={() => {
          setIsNodeModalOpen(false);
          setSelectedNodeToEdit(null);
        }}
        onSaveNode={handleSaveNodeConfig}
      />

      {/* 2. WhatsApp Smartphone Simulator Modal */}
      <WhatsAppChatSimulator
        workflow={activeWorkflow}
        targetNode={selectedNodeToEdit}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      {/* 3. WhatsApp Template Library Modal */}
      <TemplateManagerModal
        templates={templates}
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onCreateTemplate={(newTmpl) => {
          const next = [newTmpl, ...templates];
          setTemplates(next);
          localStorage.setItem('resortdesk_whatsapp_templates', JSON.stringify(next));
          triggerToast(`Template "${newTmpl.name}" created and approved.`);
        }}
        onSelectTemplateForWorkflow={(tmpl) => {
          handleInsertTemplate(tmpl);
        }}
      />

      {/* 4. All Workflows List Modal */}
      <WorkflowsListModal
        workflows={workflows}
        activeWorkflowId={activeWorkflowId}
        isOpen={isWorkflowsModalOpen}
        onClose={() => setIsWorkflowsModalOpen(false)}
        onSelectWorkflow={(wf) => setActiveWorkflowId(wf.id)}
        onCreateNewWorkflow={handleCreateNewWorkflow}
        onToggleStatus={(wfId) => {
          const next = workflows.map(w => {
            if (w.id === wfId) {
              const newSt = w.status === 'active' ? 'paused' : 'active';
              return { ...w, status: newSt as any };
            }
            return w;
          });
          updateWorkflowState(next);
          triggerToast('Workflow status updated');
        }}
        onDuplicateWorkflow={(wf) => {
          const dup: WhatsAppWorkflow = {
            ...wf,
            id: `wf-dup-${Date.now()}`,
            name: `${wf.name} (Copy)`,
            status: 'draft',
            createdAt: 'Today',
            updatedAt: 'Just now'
          };
          updateWorkflowState([dup, ...workflows]);
          triggerToast(`Duplicated workflow "${wf.name}"`);
        }}
      />

      {/* 5. Live Message Logs Modal */}
      <MessageLogsModal
        logs={logs}
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </div>
  );
}
