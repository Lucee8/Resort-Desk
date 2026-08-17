import React, { useState } from 'react';
import { 
  mockInventoryItems, 
  mockPurchaseOrders, 
  mockSuppliers, 
  mockInventoryAlerts, 
  mockInventoryAIInsights 
} from '../data/inventoryData';
import { 
  InventoryItem, 
  PurchaseOrder, 
  InventorySupplier, 
  InventoryCategory, 
  InventoryUserRole, 
  StockMovementType, 
  InventoryAIInsight,
  StockMovement
} from '../types';

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

import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function InventoryView() {
  // Core Entities State
  const [items, setItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>(mockSuppliers);
  const [aiInsights, setAiInsights] = useState<InventoryAIInsight[]>(mockInventoryAIInsights);
  
  // Navigation & Filtering State
  const [userRole, setUserRole] = useState<InventoryUserRole>('Storekeeper');
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory>('All');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Modals & Drawers Visibility State
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

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to re-evaluate safety level
  const computeSafetyLevel = (current: number, min: number) => {
    if (current <= 0) return 'Out of Stock';
    if (current <= min * 0.5) return 'Critical';
    if (current <= min) return 'Low';
    return 'Healthy';
  };

  // Handlers: Log Stock Movement
  const handleOpenMovement = (item: InventoryItem) => {
    setItemForMovement(item);
    setIsMovementModalOpen(true);
  };

  const handleApplyMovement = (
    itemId: string,
    quantityDelta: number,
    type: StockMovementType,
    user: string,
    reference: string,
    notes: string
  ) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newStock = Math.max(0, item.currentStock + quantityDelta);
      const newTotalValue = newStock * item.costPerUnit;
      const newSafety = computeSafetyLevel(newStock, item.minStock);

      const newMovement: StockMovement = {
        id: `mov-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        type,
        quantity: quantityDelta,
        user,
        role: userRole,
        reference,
        notes
      };

      const updated = {
        ...item,
        currentStock: newStock,
        totalValue: newTotalValue,
        safetyLevel: newSafety as any,
        movements: [newMovement, ...(item.movements || [])]
      };

      if (selectedItemForDetail?.id === itemId) {
        setSelectedItemForDetail(updated);
      }
      return updated;
    }));

    showToast(`Stock updated for ${quantityDelta > 0 ? '+' : ''}${quantityDelta} units (${type})`);
  };

  // Handlers: Quick Restock PO
  const handleQuickRestock = (item: InventoryItem, qty?: number) => {
    const orderQty = qty || item.reorderQuantity;
    const poNum = `PO-2023-${Math.floor(200 + Math.random() * 700)}`;
    const lineTotal = orderQty * item.costPerUnit;
    const taxAmt = Math.round(lineTotal * 0.18);
    const grandTotal = lineTotal + taxAmt;
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: poNum,
      supplierName: item.supplier,
      orderDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      expectedDelivery: new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Ordered',
      items: [
        {
          itemId: item.id,
          name: item.name,
          quantity: orderQty,
          unitPrice: item.costPerUnit,
          total: lineTotal,
          unit: item.unit
        }
      ],
      subtotal: lineTotal,
      tax: taxAmt,
      discount: 0,
      totalAmount: grandTotal,
      paymentStatus: 'Pending',
      notes: 'Generated via AI 1-Click Fast Reorder'
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    showToast(`Purchase order ${poNum} created for ${item.name} (${orderQty} ${item.unit})`);
  };

  // Handlers: Add New Item
  const handleAddNewItem = (newItemData: Omit<InventoryItem, 'id' | 'movements' | 'totalValue' | 'safetyLevel'>) => {
    const totalValue = newItemData.currentStock * newItemData.costPerUnit;
    const safetyLevel = computeSafetyLevel(newItemData.currentStock, newItemData.minStock);
    const newItem: InventoryItem = {
      ...newItemData,
      id: `inv-${Date.now()}`,
      totalValue,
      safetyLevel: safetyLevel as any,
      movements: [
        {
          id: `mov-init-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          type: 'Purchase',
          quantity: newItemData.currentStock,
          user: userRole,
          role: userRole,
          reference: 'Initial Stock Onboarding'
        }
      ]
    };

    setItems(prev => [newItem, ...prev]);
    showToast(`New item "${newItem.name}" added to operational supplies.`);
  };

  // Handlers: Submit Full PO
  const handleSubmitPO = (newPOData: Omit<PurchaseOrder, 'id'>, autoReceiveStock: boolean) => {
    const newPO: PurchaseOrder = {
      ...newPOData,
      id: `po-${Date.now()}`
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    if (autoReceiveStock) {
      // Add items to stock immediately
      setItems(prev => prev.map(item => {
        const lineItem = newPO.items.find(i => i.itemId === item.id || i.name === item.name);
        if (!lineItem) return item;
        const newStock = item.currentStock + lineItem.quantity;
        const newTotalValue = newStock * item.costPerUnit;
        const newSafety = computeSafetyLevel(newStock, item.minStock);
        return {
          ...item,
          currentStock: newStock,
          totalValue: newTotalValue,
          safetyLevel: newSafety as any,
          lastRestocked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          movements: [
            {
              id: `mov-po-${Date.now()}-${item.id}`,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              type: 'Purchase',
              quantity: lineItem.quantity,
              user: userRole,
              role: userRole,
              reference: newPO.poNumber,
              notes: 'Stock received and inspected'
            },
            ...(item.movements || [])
          ]
        };
      }));
      showToast(`Purchase ${newPO.poNumber} received and stock updated immediately!`);
    } else {
      showToast(`Purchase Order ${newPO.poNumber} logged successfully.`);
    }
  };

  // Handlers: Mark PO as Received
  const handleMarkPOAsReceived = (poId: string) => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) return;

    setPurchaseOrders(prev => prev.map(po => {
      if (po.id !== poId) return po;
      return { ...po, status: 'Received' };
    }));

    // Update stock levels for line items
    setItems(prev => prev.map(item => {
      const lineItem = targetPO.items.find(i => i.itemId === item.id || i.sku === item.sku);
      if (!lineItem) return item;
      const newStock = item.currentStock + lineItem.quantity;
      const newTotalValue = newStock * item.costPerUnit;
      const newSafety = computeSafetyLevel(newStock, item.minStock);
      return {
        ...item,
        currentStock: newStock,
        totalValue: newTotalValue,
        safetyLevel: newSafety as any,
        lastRestocked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        movements: [
          {
            id: `mov-po-rec-${Date.now()}-${item.id}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            type: 'Purchase',
            quantity: lineItem.quantity,
            user: userRole,
            role: userRole,
            reference: targetPO.poNumber,
            notes: 'Goods received at central loading bay'
          },
          ...(item.movements || [])
        ]
      };
    }));

    showToast(`PO ${targetPO.poNumber} marked as Received. Inventory stock incremented.`);
  };

  // Handlers: Physical Audit Reconciliation
  const handleApplyReconciliation = (updates: { itemId: string; newStock: number; reason: string }[]) => {
    setItems(prev => prev.map(item => {
      const u = updates.find(x => x.itemId === item.id);
      if (!u) return item;
      const diff = u.newStock - item.currentStock;
      const newTotalValue = u.newStock * item.costPerUnit;
      const newSafety = computeSafetyLevel(u.newStock, item.minStock);
      return {
        ...item,
        currentStock: u.newStock,
        totalValue: newTotalValue,
        safetyLevel: newSafety as any,
        movements: [
          {
            id: `mov-audit-${Date.now()}-${item.id}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            type: 'Adjustment',
            quantity: diff,
            user: userRole,
            role: userRole,
            reference: 'Physical Stock Count Reconciliation',
            notes: u.reason
          },
          ...(item.movements || [])
        ]
      };
    }));

    showToast(`Physical audit applied. ${updates.length} items reconciled.`);
  };

  // Handlers: Bulk Reorder Critical
  const handleBulkRestockCritical = (criticalList: InventoryItem[]) => {
    criticalList.forEach(item => {
      handleQuickRestock(item);
    });
    setIsAlertsDrawerOpen(false);
    showToast(`Bulk purchase orders initiated for all ${criticalList.length} critical supplies.`);
  };

  // Handlers: Delete Item
  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    showToast('Inventory item removed from active catalog.', 'info');
  };

  // KPI Calculations
  const totalItemsCount = items.reduce((sum, item) => sum + item.currentStock, 0);
  const criticalItemsCount = items.filter(i => i.safetyLevel === 'Critical' || i.safetyLevel === 'Low').length;
  const recentDeliveriesCount = purchaseOrders.filter(p => p.status === 'Received').length;
  const pendingOrdersCount = purchaseOrders.filter(p => p.status === 'Ordered' || p.status === 'In Transit' || p.status === 'Delayed').length;

  const supplierNames = suppliers.map(s => s.name);

  return (
    <div id="inventory-module-root" className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2.5 bg-slate-950 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-teal-800/50">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 1. Header Component */}
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

      {/* 2. Low-Stock Alert Bar matching reference */}
      <LowStockAlertBanner
        criticalCount={criticalItemsCount}
        onViewAlerts={() => setIsAlertsDrawerOpen(true)}
      />

      {/* 3. KPI Cards Grid matching reference (Total Items, Low Stock, Recent Deliveries, Pending Orders) */}
      <InventoryKpiGrid
        totalItemsCount={totalItemsCount}
        lowStockCount={criticalItemsCount}
        recentDeliveriesCount={recentDeliveriesCount}
        pendingOrdersCount={pendingOrdersCount}
        onFilterLowStock={() => setIsAlertsDrawerOpen(true)}
        onViewDeliveries={() => setIsPurchaseOrdersOpen(true)}
        onViewPendingOrders={() => setIsPurchaseOrdersOpen(true)}
      />

      {/* 4. Main Content Area matching reference: Left 8 Cols (Current Inventory Table) + Right 4 Cols (Recent Purchases + Insight) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Current Inventory Table */}
        <div className="lg:col-span-8">
          <CurrentInventoryTable
            items={items}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectItem={(item) => setSelectedItemForDetail(item)}
            onLogMovement={(item) => handleOpenMovement(item)}
            onQuickRestock={(item) => handleQuickRestock(item)}
            onEditItem={(item) => setSelectedItemForDetail(item)}
            onDeleteItem={(id) => handleDeleteItem(id)}
            onExportCSV={() => showToast('Inventory CSV exported successfully.')}
          />
        </div>

        {/* Right 4 Cols: Recent Purchases Panel + Inventory Insight Card matching reference */}
        <div className="lg:col-span-4 space-y-6">
          <RecentPurchasesPanel
            purchaseOrders={purchaseOrders}
            onSeeAll={() => setIsPurchaseOrdersOpen(true)}
            onSelectPO={(po) => setIsPurchaseOrdersOpen(true)}
            onNewPO={() => setIsLogPurchaseOpen(true)}
          />

          <InventoryInsightCard
            insight={aiInsights[0]}
            onApplyRecommendation={(insight) => {
              const targetItem = items.find(i => i.id === insight.targetItemId) || items[0];
              handleQuickRestock(targetItem, insight.suggestedQty);
            }}
            onViewAllInsights={() => setIsAICopilotOpen(true)}
          />
        </div>

      </div>

      {/* 5. AI Demand Forecasting Section (Section 14 & 15) */}
      <AIDemandForecastingSection
        items={items}
        onGeneratePOFromForecast={(item, recQty) => {
          handleQuickRestock(item, recQty);
        }}
      />

      {/* 6. Automatic Restocking Pipeline Section (Section 16) */}
      <AutoRestockPipelineSection
        onTriggerPipelineAudit={() => {
          showToast('Pipeline diagnostics verified. Automatic safety stock triggers are live and healthy.');
        }}
      />

      {/* MODALS & DRAWERS */}

      {/* Item Details Drawer */}
      {selectedItemForDetail && (
        <InventoryItemDetailDrawer
          item={selectedItemForDetail}
          onClose={() => setSelectedItemForDetail(null)}
          onLogMovement={(item) => handleOpenMovement(item)}
          onQuickRestock={(item) => handleQuickRestock(item)}
          onEditItem={(item) => showToast(`Edit mode for ${item.name}`)}
          onPrintQR={(item) => showToast(`QR Barcode printed for ${item.sku}`)}
        />
      )}

      {/* Log Stock Movement Modal */}
      {isMovementModalOpen && (
        <StockMovementModal
          item={itemForMovement}
          items={items}
          onClose={() => setIsMovementModalOpen(false)}
          onSubmitMovement={handleApplyMovement}
        />
      )}

      {/* Add New Item Modal */}
      {isAddItemOpen && (
        <AddNewItemModal
          onClose={() => setIsAddItemOpen(false)}
          onAddItem={handleAddNewItem}
          existingSuppliers={supplierNames}
        />
      )}

      {/* Log Purchase Modal */}
      {isLogPurchaseOpen && (
        <LogPurchaseModal
          items={items}
          existingSuppliers={supplierNames}
          onClose={() => setIsLogPurchaseOpen(false)}
          onSubmitPO={handleSubmitPO}
        />
      )}

      {/* Purchase Orders Modal */}
      {isPurchaseOrdersOpen && (
        <PurchaseOrdersModal
          purchaseOrders={purchaseOrders}
          onClose={() => setIsPurchaseOrdersOpen(false)}
          onOpenNewPO={() => {
            setIsPurchaseOrdersOpen(false);
            setIsLogPurchaseOpen(true);
          }}
          onMarkAsReceived={handleMarkPOAsReceived}
        />
      )}

      {/* Suppliers Modal */}
      {isSuppliersOpen && (
        <SuppliersModal
          suppliers={suppliers}
          onClose={() => setIsSuppliersOpen(false)}
          onOpenNewPOForSupplier={(supName) => {
            setIsSuppliersOpen(false);
            setIsLogPurchaseOpen(true);
          }}
        />
      )}

      {/* Valuation & Analytics Modal */}
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

      {/* Physical Count Reconciliation Modal */}
      {isAuditOpen && (
        <InventoryAuditModal
          items={items}
          onClose={() => setIsAuditOpen(false)}
          onApplyReconciliation={handleApplyReconciliation}
        />
      )}

      {/* Low Stock Alerts Drawer */}
      {isAlertsDrawerOpen && (
        <LowStockAlertsDrawer
          items={items}
          onClose={() => setIsAlertsDrawerOpen(false)}
          onQuickRestock={(item) => handleQuickRestock(item)}
          onBulkRestockCritical={handleBulkRestockCritical}
        />
      )}

      {/* AI Copilot Drawer */}
      {isAICopilotOpen && (
        <InventoryAICopilot
          items={items}
          onClose={() => setIsAICopilotOpen(false)}
          onQuickRestock={(item) => handleQuickRestock(item)}
          onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        />
      )}

    </div>
  );
}
