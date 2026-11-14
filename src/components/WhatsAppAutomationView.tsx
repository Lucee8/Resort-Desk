import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Clock, FileCode2, Smartphone } from 'lucide-react';

import WhatsAppKPIHeader from './whatsapp/WhatsAppKPIHeader';
import WorkflowBuilderCanvas from './whatsapp/WorkflowBuilderCanvas';
import MyraAIAssistantPanel from './whatsapp/MyraAIAssistantPanel';
import NodeConfigModal from './whatsapp/NodeConfigModal';
import WhatsAppChatSimulator from './whatsapp/WhatsAppChatSimulator';
import TemplateManagerModal from './whatsapp/TemplateManagerModal';
import WorkflowsListModal from './whatsapp/WorkflowsListModal';
import MessageLogsModal from './whatsapp/MessageLogsModal';

import {
  WhatsAppWorkflow,
  WhatsAppWorkflowNode,
  WhatsAppNodeType,
  WhatsAppTemplate,
  MyraAIWorkflowInsight,
  WhatsAppMessageLog,
  EmailLogItem,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  deleteCollectionDoc,
  subscribeCollection,
  upsertCollectionDoc,
} from '../services/resortDataService';
import {
  retryFailedEmailsViaCloud,
  retryFailedWhatsAppViaCloud,
  subscribeEmailLogs,
} from '../services/messagingService';

interface WhatsAppAutomationViewProps {
  triggerToast: (msg: string) => void;
}

export default function WhatsAppAutomationView({
  triggerToast,
}: WhatsAppAutomationViewProps) {
  const { firestoreStatus } = useAuth();

  const [workflows, setWorkflows] = useState<WhatsAppWorkflow[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>('');
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [insights, setInsights] = useState<MyraAIWorkflowInsight[]>([]);
  const [logs, setLogs] = useState<WhatsAppMessageLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>([]);

  useEffect(() => {
    if (firestoreStatus === 'permission-denied') return;
    const unsubWf = subscribeCollection<WhatsAppWorkflow>(
      'whatsappWorkflows',
      setWorkflows
    );
    const unsubTmpl = subscribeCollection<WhatsAppTemplate>(
      'whatsappTemplates',
      setTemplates
    );
    const unsubIns = subscribeCollection<MyraAIWorkflowInsight>(
      'whatsappInsights',
      setInsights
    );
    const unsubLogs = subscribeCollection<WhatsAppMessageLog>(
      'whatsappLogs',
      setLogs
    );
    const unsubEmailLogs = subscribeEmailLogs(setEmailLogs);
    return () => {
      unsubWf();
      unsubTmpl();
      unsubIns();
      unsubLogs();
      unsubEmailLogs();
    };
  }, [firestoreStatus]);

  useEffect(() => {
    if (workflows.length > 0 && !workflows.some((w) => w.id === activeWorkflowId)) {
      setActiveWorkflowId(workflows[0].id);
    }
  }, [workflows, activeWorkflowId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedNodeToEdit, setSelectedNodeToEdit] =
    useState<WhatsAppWorkflowNode | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isWorkflowsModalOpen, setIsWorkflowsModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  const activeWorkflow =
    workflows.find((w) => w.id === activeWorkflowId) || workflows[0];

  const kpiData = useMemo(() => {
    const activeCount = workflows.filter((w) => w.status === 'active').length;
    const totalMessages = logs.length;
    const deliveredCount = logs.filter(
      (l) => l.status === 'delivered' || l.status === 'read'
    ).length;
    const readCount = logs.filter((l) => l.status === 'read').length;

    return {
      activeWorkflows: activeCount,
      totalWorkflows: workflows.length,
      messagesSent30d: totalMessages,
      messagesTrend: `${logs.length} logged`,
      deliveryRate:
        totalMessages > 0 ? Math.round((deliveredCount / totalMessages) * 100) : 100,
      readRate: totalMessages > 0 ? Math.round((readCount / totalMessages) * 100) : 0,
      aiResolvedConversations: workflows.reduce(
        (s, w) => s + (w.totalCompleted || 0),
        0
      ),
      humanHandoffRate: 12,
    };
  }, [workflows, logs]);

  const saveWorkflowToFirestore = async (
    updatedWf: WhatsAppWorkflow,
    successMsg?: string
  ) => {
    try {
      await upsertCollectionDoc('whatsappWorkflows', updatedWf);
      if (successMsg) triggerToast(successMsg);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to save workflow to Firestore.'
      );
    }
  };

  const handleNodeClick = (node: WhatsAppWorkflowNode) => {
    setSelectedNodeToEdit(node);
    setIsNodeModalOpen(true);
  };

  const handleSaveNodeConfig = async (updatedNode: WhatsAppWorkflowNode) => {
    if (!activeWorkflow) return;
    const nextNodes = activeWorkflow.nodes.map((n) =>
      n.id === updatedNode.id ? updatedNode : n
    );
    await saveWorkflowToFirestore(
      { ...activeWorkflow, nodes: nextNodes, updatedAt: 'Just now' },
      `Updated step "${updatedNode.title}" in Firestore.`
    );
  };

  const handleAddNodeAfter = async (index: number, type: WhatsAppNodeType) => {
    if (!activeWorkflow) return;
    const newId = `node-${Date.now()}`;
    let newNode: WhatsAppWorkflowNode;

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
            waitTimingType: 'after_previous',
          },
        };
        break;
      case 'ai_action':
        newNode = {
          id: newId,
          type: 'ai_action',
          title: 'Concierge Auto-Response',
          subtitle: '24/7 guest Q&A',
          badgeLabel: 'AI AGENT',
          config: {
            aiPrompt:
              'Respond politely to Mykonos Cottage Tarkarli guest inquiries about check-in, dining, and scuba trips.',
            aiTone: 'Warm & Hospitable',
            fallbackToHuman: true,
          },
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
            trueBranchLabel: 'Engage Concierge',
            falseBranchLabel: 'Continue Timeline',
          },
        };
        break;
      case 'notification':
        newNode = {
          id: newId,
          type: 'notification',
          title: 'Notify Front Desk Manager',
          subtitle: 'Internal staff alert',
          badgeLabel: 'STAFF NOTIFY',
          config: {
            notifyRole: 'front_desk',
            notificationTitle: 'Guest Request Logged',
            notificationBody: 'Guest in {{RoomNumber}} initiated WhatsApp inquiry.',
          },
        };
        break;
      default:
        newNode = {
          id: newId,
          type: 'action',
          title: 'Send WhatsApp Message',
          subtitle: 'Utility or Concierge message',
          badgeLabel: 'ACTION',
          config: {
            messageText:
              'Hi {{GuestName}}, thank you for booking with Mykonos Cottage, Tarkarli.',
            buttons: [{ type: 'quick_reply', label: 'Directions & Check-in' }],
          },
        };
    }

    const nextNodes = [...activeWorkflow.nodes];
    nextNodes.splice(index + 1, 0, newNode);

    await saveWorkflowToFirestore(
      { ...activeWorkflow, nodes: nextNodes, updatedAt: 'Just now' },
      `Added step "${newNode.title}".`
    );
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!activeWorkflow) return;
    const nextNodes = activeWorkflow.nodes.filter((n) => n.id !== nodeId);
    await saveWorkflowToFirestore(
      { ...activeWorkflow, nodes: nextNodes, updatedAt: 'Just now' },
      'Step removed from journey.'
    );
  };

  const handleDuplicateNode = async (nodeId: string) => {
    if (!activeWorkflow) return;
    const idx = activeWorkflow.nodes.findIndex((n) => n.id === nodeId);
    if (idx === -1) return;
    const original = activeWorkflow.nodes[idx];
    const duplicate: WhatsAppWorkflowNode = {
      ...original,
      id: `node-${Date.now()}`,
      title: `${original.title} (Copy)`,
    };
    const nextNodes = [...activeWorkflow.nodes];
    nextNodes.splice(idx + 1, 0, duplicate);
    await saveWorkflowToFirestore(
      { ...activeWorkflow, nodes: nextNodes, updatedAt: 'Just now' },
      `Duplicated step "${original.title}".`
    );
  };

  const handleMoveNode = async (index: number, direction: 'up' | 'down') => {
    if (!activeWorkflow) return;
    const nextNodes = [...activeWorkflow.nodes];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= nextNodes.length) return;
    const temp = nextNodes[index];
    nextNodes[index] = nextNodes[targetIdx];
    nextNodes[targetIdx] = temp;
    await saveWorkflowToFirestore({
      ...activeWorkflow,
      nodes: nextNodes,
      updatedAt: 'Just now',
    });
  };

  const handleSaveDraft = async () => {
    if (!activeWorkflow) return;
    await saveWorkflowToFirestore(
      { ...activeWorkflow, status: 'draft', updatedAt: 'Just now' },
      `Workflow "${activeWorkflow.name}" saved as draft in Firestore.`
    );
  };

  const handlePublish = async () => {
    if (!activeWorkflow) return;
    const invalidNodes = activeWorkflow.nodes.filter(
      (n) =>
        n.type === 'action' &&
        (!n.config.messageText || n.config.messageText.trim() === '')
    );

    if (invalidNodes.length > 0) {
      triggerToast(
        'Validation Error: One or more WhatsApp message steps are missing message content.'
      );
      return;
    }

    await saveWorkflowToFirestore(
      { ...activeWorkflow, status: 'active', updatedAt: 'Just now' },
      `Workflow "${activeWorkflow.name}" saved & activated in Firestore (configure Meta Webhook for automated background sends).`
    );
  };

  const handleApplyInsight = async (insight: MyraAIWorkflowInsight) => {
    if (!activeWorkflow) return;
    if (insight.suggestedNode) {
      const nextNodes = [...activeWorkflow.nodes];
      const insertPos = Math.min(nextNodes.length - 1, 5);
      nextNodes.splice(insertPos, 0, {
        ...insight.suggestedNode,
        id: `ai-node-${Date.now()}`,
      });
      await saveWorkflowToFirestore({
        ...activeWorkflow,
        nodes: nextNodes,
        updatedAt: 'Just now',
      });
    }
    try {
      await deleteCollectionDoc('whatsappInsights', insight.id);
    } catch {
      // ignore if already removed
    }
    triggerToast(`Applied suggestion: ${insight.title}`);
  };

  const handleDismissInsight = async (insightId: string) => {
    try {
      await deleteCollectionDoc('whatsappInsights', insightId);
      triggerToast('Recommendation dismissed.');
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to dismiss recommendation.'
      );
    }
  };

  const handleInsertTemplate = async (template: WhatsAppTemplate) => {
    if (!activeWorkflow) return;
    const newActionNode: WhatsAppWorkflowNode = {
      id: `tmpl-node-${Date.now()}`,
      type: 'action',
      title: template.name
        .replace(/resort_|v\d+|_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      subtitle: template.name,
      badgeLabel: 'ACTION',
      config: {
        templateId: template.id,
        templateName: template.name,
        messageText: template.body,
        buttons: template.buttons,
      },
    };
    const nextNodes = [...activeWorkflow.nodes];
    const insertPos = Math.max(0, nextNodes.length - 1);
    nextNodes.splice(insertPos, 0, newActionNode);

    await saveWorkflowToFirestore(
      { ...activeWorkflow, nodes: nextNodes, updatedAt: 'Just now' },
      `Added template step "${newActionNode.title}".`
    );
  };

  const handleCreateNewWorkflow = async () => {
    const newWf: WhatsAppWorkflow = {
      id: `wf-custom-${Date.now()}`,
      name: 'New Mykonos Guest Journey',
      description: 'Guest messaging workflow for Mykonos Cottage, Tarkarli.',
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
          config: { triggerEvent: 'booking_created' },
        },
        {
          id: `node-c2-${Date.now()}`,
          type: 'wait',
          title: 'Wait 5m',
          config: {
            waitDuration: 5,
            waitUnit: 'minutes',
            waitTimingType: 'after_previous',
          },
        },
        {
          id: `node-c3-${Date.now()}`,
          type: 'action',
          title: 'Send Confirmation',
          badgeLabel: 'ACTION',
          config: {
            messageText:
              'Hi {{GuestName}}, your reservation at Mykonos Cottage, Tarkarli is confirmed for {{CheckInDate}} in {{RoomNumber}}.',
          },
        },
        {
          id: `node-c4-${Date.now()}`,
          type: 'end',
          title: 'Workflow Completed',
          badgeLabel: 'END',
          config: {},
        },
      ],
    };

    await saveWorkflowToFirestore(newWf, 'Created new draft workflow in Firestore.');
    setActiveWorkflowId(newWf.id);
  };

  return (
    <div
      id="whatsapp-automation-view"
      className="flex-1 flex flex-col bg-[#fcfdfd] overflow-x-hidden font-sans relative min-h-screen"
    >
      <WhatsAppKPIHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onCreateAutomation={() => void handleCreateNewWorkflow()}
        onViewAllAutomations={() => setIsWorkflowsModalOpen(true)}
        kpiData={kpiData}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium">Quick Access:</span>
          <button
            type="button"
            onClick={() => setIsWorkflowsModalOpen(true)}
            className="text-slate-600 hover:text-teal-900 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium transition-colors shadow-2xs cursor-pointer"
          >
            All Workflows ({workflows.length})
          </button>
          <button
            type="button"
            onClick={() => setIsTemplatesModalOpen(true)}
            className="text-slate-600 hover:text-teal-900 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <FileCode2 className="w-3 h-3 text-slate-400" />
            <span>Templates ({templates.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setIsLogsModalOpen(true)}
            className="text-slate-600 hover:text-teal-900 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Dispatch Logs ({logs.length})</span>
          </button>
        </div>

        {activeWorkflow && (
          <button
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            className="text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Preview Chat Simulator</span>
          </button>
        )}
      </div>

      {activeWorkflow ? (
        <div className="flex flex-col lg:flex-row items-start gap-6 flex-1 min-w-0">
          <WorkflowBuilderCanvas
            workflow={activeWorkflow}
            allWorkflows={workflows}
            onSelectWorkflow={(wf) => setActiveWorkflowId(wf.id)}
            onUpdateWorkflow={(wf) => void saveWorkflowToFirestore(wf)}
            onSaveDraft={() => void handleSaveDraft()}
            onPublish={() => void handlePublish()}
            onNodeClick={handleNodeClick}
            onAddNodeAfter={(i, t) => void handleAddNodeAfter(i, t)}
            onDeleteNode={(id) => void handleDeleteNode(id)}
            onDuplicateNode={(id) => void handleDuplicateNode(id)}
            onMoveNode={(i, d) => void handleMoveNode(i, d)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onManageTemplates={() => setIsTemplatesModalOpen(true)}
          />

          <MyraAIAssistantPanel
            insights={insights}
            suggestedTemplates={templates.slice(0, 4)}
            onApplyInsight={(ins) => void handleApplyInsight(ins)}
            onDismissInsight={(id) => void handleDismissInsight(id)}
            onInsertTemplate={(tmpl) => void handleInsertTemplate(tmpl)}
            onAnalyzeWorkflow={() => {
              triggerToast(
                `Audited "${activeWorkflow.name}": ${activeWorkflow.nodes.length} steps configured.`
              );
            }}
          />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-teal-700 mx-auto" />
          <h3 className="font-bold text-slate-900">No WhatsApp Workflows Yet</h3>
          <p className="text-xs text-slate-500">
            Create your first automated guest welcome journey or initialize starter data
            from the Dashboard.
          </p>
          <button
            type="button"
            onClick={() => void handleCreateNewWorkflow()}
            className="px-4 py-2 bg-teal-800 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Create First Workflow
          </button>
        </div>
      )}

      <NodeConfigModal
        node={selectedNodeToEdit}
        templates={templates}
        isOpen={isNodeModalOpen}
        onClose={() => {
          setIsNodeModalOpen(false);
          setSelectedNodeToEdit(null);
        }}
        onSaveNode={(n) => void handleSaveNodeConfig(n)}
      />

      {activeWorkflow && (
        <WhatsAppChatSimulator
          workflow={activeWorkflow}
          targetNode={selectedNodeToEdit}
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
        />
      )}

      <TemplateManagerModal
        templates={templates}
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onCreateTemplate={(newTmpl) => {
          void upsertCollectionDoc('whatsappTemplates', newTmpl).then(() =>
            triggerToast(`Template "${newTmpl.name}" saved to Firestore.`)
          );
        }}
        onSelectTemplateForWorkflow={(tmpl) => void handleInsertTemplate(tmpl)}
      />

      <WorkflowsListModal
        workflows={workflows}
        activeWorkflowId={activeWorkflowId}
        isOpen={isWorkflowsModalOpen}
        onClose={() => setIsWorkflowsModalOpen(false)}
        onSelectWorkflow={(wf) => setActiveWorkflowId(wf.id)}
        onCreateNewWorkflow={() => void handleCreateNewWorkflow()}
        onToggleStatus={(wfId) => {
          const target = workflows.find((w) => w.id === wfId);
          if (!target) return;
          const nextSt = target.status === 'active' ? 'paused' : 'active';
          void saveWorkflowToFirestore(
            { ...target, status: nextSt },
            `Workflow status set to ${nextSt}.`
          );
        }}
        onDuplicateWorkflow={(wf) => {
          const dup: WhatsAppWorkflow = {
            ...wf,
            id: `wf-dup-${Date.now()}`,
            name: `${wf.name} (Copy)`,
            status: 'draft',
            createdAt: 'Today',
            updatedAt: 'Just now',
          };
          void saveWorkflowToFirestore(dup, `Duplicated "${wf.name}" to Firestore.`);
        }}
      />

      <MessageLogsModal
        logs={logs}
        emailLogs={emailLogs}
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        onRetryWhatsApp={async () => {
          const res = await retryFailedWhatsAppViaCloud();
          triggerToast(res.message);
        }}
        onRetryEmails={async () => {
          const res = await retryFailedEmailsViaCloud();
          triggerToast(res.message);
        }}
      />
    </div>
  );
}
