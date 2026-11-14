import React, { useState, useEffect, useMemo } from 'react';
import {
  InventoryItem,
  PurchaseOrder,
  InventorySupplier,
  InventoryCategory,
  InventoryUserRole,
  StockMovementType,
  InventoryAIInsight,
  StockMovement,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  deleteCollectionDoc,
  subscribeCollection,
  upsertCollectionDoc,
} from '../services/resortDataService';
import { formatShortDate, getTodayISO } from '../utils/bookingUtils';

import InventoryHeader from './inventory/InventoryHeader';
import LowStockAlertBanner from './inventory/LowStockAlertBanner';
import InventoryKpiGrid from './inventory/InventoryKpiGrid';
import CurrentInventoryTable from './inventory/CurrentInventoryTable';
import RecentPurchasesPanel from './inventory/RecentPurchasesPanel';
import InventoryInsightCard from './inventory/InventoryInsightCard';
import AIDemandForecastingSection from './inventory/AIDemandForecastingSection';
import AutoRestockPipelineSection from './inventory/AutoRestockPipelineSection';
import InventoryItemDetailDrawer from './inventory/InventoryItemDetailDrawer';
import StockMovementModal from './inventory/StockMovementModal';
import AddNewItemModal from './inventory/AddNewItemModal';
import LogPurchaseModal from './inventory/LogPurchaseModal';
import PurchaseOrdersModal from './inventory/PurchaseOrdersModal';
import SuppliersModal from './inventory/SuppliersModal';
import InventoryAnalyticsModal from './inventory/InventoryAnalyticsModal';
import InventoryAuditModal from './inventory/InventoryAuditModal';
import LowStockAlertsDrawer from './inventory/LowStockAlertsDrawer';
import InventoryAICopilot from './inventory/InventoryAICopilot';

interface InventoryViewProps {
  triggerToast: (msg: string) => void;
}

export default function InventoryView({ triggerToast }: InventoryViewProps) {
  const { user, firestoreStatus } = useAuth();
  const operatorName =
    user?.displayName || user?.email?.split('@')[0] || 'Mykonos Storekeeper';

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([]);
  const [aiInsights, setAiInsights] = useState<InventoryAIInsight[]>([]);

  const [userRole, setUserRole] = useState<InventoryUserRole>('Storekeeper');
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory>('All');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [selectedItemForDetail, setSelectedItemForDetail] = useState<InventoryItem | null>(null);
  const [itemForMovement, setItemForMovement] = useState<InventoryItem | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isLogPurchaseOpen, setIsLogPurchaseOpen] = useState(false);
  const [isPurchaseOrdersOpen, setIsPurchaseOrdersOpen] = useState(false);
  const [isSuppliersOpen, setIsSuppliersOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);

  useEffect(() => {
    if (firestoreStatus === 'permission-denied') return;
    const unsubItems = subscribeCollection<InventoryItem>('inventoryItems', setItems);
    const unsubPOs = subscribeCollection<PurchaseOrder>('purchaseOrders', setPurchaseOrders);
    const unsubSups = subscribeCollection<InventorySupplier>('inventorySuppliers', setSuppliers);
    const unsubAI = subscribeCollection<InventoryAIInsight>('inventoryAIInsights', setAiInsights);
    return () => {
      unsubItems();
      unsubPOs();
      unsubSups();
      unsubAI();
    };
  }, [firestoreStatus]);

  const computeSafetyLevel = (current: number, min: number) => {
    if (current <= 0) return 'Out of Stock' as const;
    if (current <= min * 0.5) return 'Critical' as const;
    if (current <= min) return 'Low' as const;
    return 'Healthy' as const;
  };

  const filteredItems = useMemo(() => {
    if (!globalSearch.trim()) return items;
    const q = globalSearch.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.supplier.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [items, globalSearch]);

  const handleOpenMovement = (item: InventoryItem) => {
    setItemForMovement(item);
    setIsMovementModalOpen(true);
  };

  const handleApplyMovement = async (
    itemId: string,
    quantityDelta: number,
    type: StockMovementType,
    actor: string,
    reference: string,
    notes: string
  ) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    const newStock = Math.max(0, target.currentStock + quantityDelta);
    const newTotalValue = newStock * target.costPerUnit;
    const newSafety = computeSafetyLevel(newStock, target.minStock);

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: formatShortDate(getTodayISO()),
      type,
      quantity: quantityDelta,
      user: actor || operatorName,
      role: userRole,
      reference,
      notes,
    };

    const updated: InventoryItem = {
      ...target,
      currentStock: newStock,
      totalValue: newTotalValue,
      safetyLevel: newSafety,
      movements: [newMovement, ...(target.movements || [])],
    };

    try {
      await upsertCollectionDoc('inventoryItems', updated);
      if (selectedItemForDetail?.id === itemId) setSelectedItemForDetail(updated);
      triggerToast(
        `Stock updated (${quantityDelta > 0 ? '+' : ''}${quantityDelta} units • ${type})`
      );
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to save stock movement to Firestore.'
      );
    }
  };

  const handleQuickRestock = async (item: InventoryItem, qty?: number) => {
    const orderQty = qty || item.reorderQuantity;
    const year = new Date().getFullYear();
    const poNum = `PO-${year}-${Date.now().toString().slice(-4)}`;
    const lineTotal = orderQty * item.costPerUnit;
    const taxAmt = Math.round(lineTotal * 0.18);
    const grandTotal = lineTotal + taxAmt;
    const expectedDate = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: poNum,
      supplierName: item.supplier,
      orderDate: formatShortDate(getTodayISO()),
      expectedDelivery: formatShortDate(expectedDate),
      status: 'Ordered',
      items: [
        {
          itemId: item.id,
          name: item.name,
          quantity: orderQty,
          unitPrice: item.costPerUnit,
          total: lineTotal,
          unit: item.unit,
        },
      ],
      subtotal: lineTotal,
      tax: taxAmt,
      discount: 0,
      totalAmount: grandTotal,
      paymentStatus: 'Pending',
      notes: 'Generated via Quick Restock',
    };

    try {
      await upsertCollectionDoc('purchaseOrders', newPO);
      triggerToast(
        `Purchase Order ${poNum} created for ${item.name} (${orderQty} ${item.unit})`
      );
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to create Purchase Order.'
      );
    }
  };

  const handleAddNewItem = async (
    newItemData: Omit<InventoryItem, 'id' | 'movements' | 'totalValue' | 'safetyLevel'>
  ) => {
    const totalValue = newItemData.currentStock * newItemData.costPerUnit;
    const safetyLevel = computeSafetyLevel(newItemData.currentStock, newItemData.minStock);
    const newItem: InventoryItem = {
      ...newItemData,
      id: `inv-${Date.now()}`,
      totalValue,
      safetyLevel,
      movements: [
        {
          id: `mov-init-${Date.now()}`,
          date: formatShortDate(getTodayISO()),
          type: 'Purchase',
          quantity: newItemData.currentStock,
          user: operatorName,
          role: userRole,
          reference: 'Initial Stock Onboarding',
        },
      ],
    };

    try {
      await upsertCollectionDoc('inventoryItems', newItem);
      triggerToast(`Item "${newItem.name}" added to Firestore inventory.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to add inventory item.'
      );
    }
  };

  const handleSubmitPO = async (
    newPOData: Omit<PurchaseOrder, 'id'>,
    autoReceiveStock: boolean
  ) => {
    const newPO: PurchaseOrder = {
      ...newPOData,
      id: `po-${Date.now()}`,
    };

    try {
      await upsertCollectionDoc('purchaseOrders', newPO);

      if (autoReceiveStock) {
        const updates: Promise<void>[] = [];
        for (const item of items) {
          const lineItem = newPO.items.find(
            (i) => i.itemId === item.id || i.name === item.name
          );
          if (!lineItem) continue;
          const newStock = item.currentStock + lineItem.quantity;
          updates.push(
            upsertCollectionDoc('inventoryItems', {
              ...item,
              currentStock: newStock,
              totalValue: newStock * item.costPerUnit,
              safetyLevel: computeSafetyLevel(newStock, item.minStock),
              lastRestocked: formatShortDate(getTodayISO()),
              movements: [
                {
                  id: `mov-po-${Date.now()}-${item.id}`,
                  date: formatShortDate(getTodayISO()),
                  type: 'Purchase',
                  quantity: lineItem.quantity,
                  user: operatorName,
                  role: userRole,
                  reference: newPO.poNumber,
                  notes: 'Stock received and inspected',
                },
                ...(item.movements || []),
              ],
            })
          );
        }
        await Promise.all(updates);
        triggerToast(`Purchase ${newPO.poNumber} received & stock updated in Firestore.`);
      } else {
        triggerToast(`Purchase Order ${newPO.poNumber} saved to Firestore.`);
      }
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to log Purchase Order.'
      );
    }
  };

  const handleMarkPOAsReceived = async (poId: string) => {
    const targetPO = purchaseOrders.find((p) => p.id === poId);
    if (!targetPO) return;

    try {
      await upsertCollectionDoc('purchaseOrders', {
        ...targetPO,
        status: 'Received',
      });

      const updates: Promise<void>[] = [];
      for (const item of items) {
        const lineItem = targetPO.items.find(
          (i) => i.itemId === item.id || i.sku === item.sku
        );
        if (!lineItem) continue;
        const newStock = item.currentStock + lineItem.quantity;
        updates.push(
          upsertCollectionDoc('inventoryItems', {
            ...item,
            currentStock: newStock,
            totalValue: newStock * item.costPerUnit,
            safetyLevel: computeSafetyLevel(newStock, item.minStock),
            lastRestocked: formatShortDate(getTodayISO()),
            movements: [
              {
                id: `mov-po-rec-${Date.now()}-${item.id}`,
                date: formatShortDate(getTodayISO()),
                type: 'Purchase',
                quantity: lineItem.quantity,
                user: operatorName,
                role: userRole,
                reference: targetPO.poNumber,
                notes: 'Goods received at store desk',
              },
              ...(item.movements || []),
            ],
          })
        );
      }
      await Promise.all(updates);
      triggerToast(`PO ${targetPO.poNumber} marked Received & stock incremented.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to receive Purchase Order.'
      );
    }
  };

  const handleApplyReconciliation = async (
    updates: { itemId: string; newStock: number; reason: string }[]
  ) => {
    try {
      await Promise.all(
        updates.map(async (u) => {
          const item = items.find((i) => i.id === u.itemId);
          if (!item) return;
          const diff = u.newStock - item.currentStock;
          await upsertCollectionDoc('inventoryItems', {
            ...item,
            currentStock: u.newStock,
            totalValue: u.newStock * item.costPerUnit,
            safetyLevel: computeSafetyLevel(u.newStock, item.minStock),
            movements: [
              {
                id: `mov-audit-${Date.now()}-${item.id}`,
                date: formatShortDate(getTodayISO()),
                type: 'Adjustment',
                quantity: diff,
                user: operatorName,
                role: userRole,
                reference: 'Physical Stock Count Reconciliation',
                notes: u.reason,
              },
              ...(item.movements || []),
            ],
          });
        })
      );
      triggerToast(`Physical audit saved to Firestore (${updates.length} items reconciled).`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to save stock reconciliation.'
      );
    }
  };

  const handleBulkRestockCritical = async (criticalList: InventoryItem[]) => {
    for (const item of criticalList) {
      await handleQuickRestock(item);
    }
    setIsAlertsDrawerOpen(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteCollectionDoc('inventoryItems', itemId);
      if (selectedItemForDetail?.id === itemId) setSelectedItemForDetail(null);
      triggerToast('Inventory item deleted from Firestore.');
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to delete inventory item.'
      );
    }
  };

  const handleExportCSV = () => {
    const header = [
      'SKU',
      'Name',
      'Category',
      'Current Stock',
      'Unit',
      'Min Stock',
      'Unit Cost (INR)',
      'Total Value (INR)',
      'Safety Level',
      'Supplier',
    ];
    const rows = items.map((i) => [
      i.sku,
      i.name,
      i.category,
      String(i.currentStock),
      i.unit,
      String(i.minStock),
      String(i.costPerUnit),
      String(i.totalValue),
      i.safetyLevel,
      i.supplier,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mykonos-inventory-${getTodayISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Exported ${items.length} inventory SKUs to CSV.`);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.currentStock, 0);
  const criticalItemsCount = items.filter(
    (i) => i.safetyLevel === 'Critical' || i.safetyLevel === 'Low' || i.safetyLevel === 'Out of Stock'
  ).length;
  const recentDeliveriesCount = purchaseOrders.filter(
    (p) => p.status === 'Received'
  ).length;
  const pendingOrdersCount = purchaseOrders.filter(
    (p) => p.status === 'Ordered' || p.status === 'In Transit' || p.status === 'Delayed'
  ).length;

  const supplierNames = suppliers.map((s) => s.name);

  return (
    <div
      id="inventory-module-root"
      className="min-h-screen bg-[#f8fafc] text-slate-900 space-y-6 overflow-x-hidden"
    >
      <InventoryHeader
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        userRole={userRole}
        onRoleChange={setUserRole}
        onOpenLogPurchase={() => setIsLogPurchaseOpen(true)}
        onOpenAddItem={() => setIsAddItemOpen(true)}
        onOpenSuppliers={() => setIsSuppliersOpen(true)}
        onOpenPurchaseOrders={() => setIsPurchaseOrdersOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenAICopilot={() => setIsAICopilotOpen(true)}
        onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
        alertCount={criticalItemsCount}
      />

      <LowStockAlertBanner
        criticalCount={criticalItemsCount}
        onViewAlerts={() => setIsAlertsDrawerOpen(true)}
      />

      <InventoryKpiGrid
        totalItemsCount={totalItemsCount}
        lowStockCount={criticalItemsCount}
        recentDeliveriesCount={recentDeliveriesCount}
        pendingOrdersCount={pendingOrdersCount}
        onFilterLowStock={() => setIsAlertsDrawerOpen(true)}
        onViewDeliveries={() => setIsPurchaseOrdersOpen(true)}
        onViewPendingOrders={() => setIsPurchaseOrdersOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 min-w-0">
          <CurrentInventoryTable
            items={filteredItems}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectItem={(item) => setSelectedItemForDetail(item)}
            onLogMovement={(item) => handleOpenMovement(item)}
            onQuickRestock={(item) => void handleQuickRestock(item)}
            onEditItem={(item) => setSelectedItemForDetail(item)}
            onDeleteItem={(id) => void handleDeleteItem(id)}
            onExportCSV={handleExportCSV}
          />
        </div>

        <div className="lg:col-span-4 space-y-6 min-w-0">
          <RecentPurchasesPanel
            purchaseOrders={purchaseOrders}
            onSeeAll={() => setIsPurchaseOrdersOpen(true)}
            onSelectPO={() => setIsPurchaseOrdersOpen(true)}
            onNewPO={() => setIsLogPurchaseOpen(true)}
          />

          {aiInsights[0] && (
            <InventoryInsightCard
              insight={aiInsights[0]}
              onApplyRecommendation={(insight) => {
                const targetItem =
                  items.find((i) => i.id === insight.targetItemId) || items[0];
                if (targetItem) {
                  void handleQuickRestock(targetItem, insight.suggestedQty);
                }
              }}
              onViewAllInsights={() => setIsAICopilotOpen(true)}
            />
          )}
        </div>
      </div>

      <AIDemandForecastingSection
        items={items}
        onGeneratePOFromForecast={(item, recQty) => {
          void handleQuickRestock(item, recQty);
        }}
      />

      <AutoRestockPipelineSection
        onTriggerPipelineAudit={() => {
          triggerToast(
            `${criticalItemsCount} low/critical SKUs currently flagged below minimum par levels.`
          );
        }}
      />

      {selectedItemForDetail && (
        <InventoryItemDetailDrawer
          item={selectedItemForDetail}
          onClose={() => setSelectedItemForDetail(null)}
          onLogMovement={(item) => handleOpenMovement(item)}
          onQuickRestock={(item) => void handleQuickRestock(item)}
          onEditItem={(item) => triggerToast(`Viewing stock ledger for ${item.name}`)}
          onPrintQR={(item) => {
            window.print();
            triggerToast(`Print view opened for SKU ${item.sku}`);
          }}
        />
      )}

      {isMovementModalOpen && (
        <StockMovementModal
          item={itemForMovement}
          items={items}
          onClose={() => setIsMovementModalOpen(false)}
          onSubmitMovement={(id, delta, type, usr, ref, notes) =>
            void handleApplyMovement(id, delta, type, usr, ref, notes)
          }
        />
      )}

      {isAddItemOpen && (
        <AddNewItemModal
          onClose={() => setIsAddItemOpen(false)}
          onAddItem={(data) => void handleAddNewItem(data)}
          existingSuppliers={supplierNames}
        />
      )}

      {isLogPurchaseOpen && (
        <LogPurchaseModal
          items={items}
          existingSuppliers={supplierNames}
          onClose={() => setIsLogPurchaseOpen(false)}
          onSubmitPO={(poData, autoRec) => void handleSubmitPO(poData, autoRec)}
        />
      )}

      {isPurchaseOrdersOpen && (
        <PurchaseOrdersModal
          purchaseOrders={purchaseOrders}
          onClose={() => setIsPurchaseOrdersOpen(false)}
          onOpenNewPO={() => {
            setIsPurchaseOrdersOpen(false);
            setIsLogPurchaseOpen(true);
          }}
          onMarkAsReceived={(id) => void handleMarkPOAsReceived(id)}
        />
      )}

      {isSuppliersOpen && (
        <SuppliersModal
          suppliers={suppliers}
          onClose={() => setIsSuppliersOpen(false)}
          onOpenNewPOForSupplier={() => {
            setIsSuppliersOpen(false);
            setIsLogPurchaseOpen(true);
          }}
        />
      )}

      {isAnalyticsOpen && (
        <InventoryAnalyticsModal
          items={items}
          onClose={() => setIsAnalyticsOpen(false)}
          onSelectFastMovingItem={(item) => {
            setIsAnalyticsOpen(false);
            setSelectedItemForDetail(item);
          }}
        />
      )}

      {isAuditOpen && (
        <InventoryAuditModal
          items={items}
          onClose={() => setIsAuditOpen(false)}
          onApplyReconciliation={(updates) => void handleApplyReconciliation(updates)}
        />
      )}

      {isAlertsDrawerOpen && (
        <LowStockAlertsDrawer
          items={items}
          onClose={() => setIsAlertsDrawerOpen(false)}
          onQuickRestock={(item) => void handleQuickRestock(item)}
          onBulkRestockCritical={(list) => void handleBulkRestockCritical(list)}
        />
      )}

      {isAICopilotOpen && (
        <InventoryAICopilot
          items={items}
          onClose={() => setIsAICopilotOpen(false)}
          onQuickRestock={(item) => void handleQuickRestock(item)}
          onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        />
      )}
    </div>
  );
}
