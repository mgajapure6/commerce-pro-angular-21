// src/app/features/inventory/components/low-stock-alert/low-stock-alert.component.ts
import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Enums and Types
type StockStatus = 'critical' | 'low' | 'adequate' | 'excess' | 'untracked';
type AlertSeverity = 'critical' | 'warning' | 'info';
type ReorderFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'as_needed';
type SupplierRating = 'preferred' | 'approved' | 'conditional' | 'blocked';

interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  leadTimeDays: number;
  minOrderValue: number;
  rating: SupplierRating;
  isActive: boolean;
  paymentTerms: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  variant?: string;
  image: string;
  category: string;
  subcategory?: string;
  brand: string;
  unitCost: number;
  unitOfMeasure: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  suppliers: string[]; // supplier IDs
  preferredSupplier?: string;
}

interface InventoryItem {
  id: string;
  productId: string;
  product: Product;
  warehouseId: string;
  warehouse: Warehouse;
  binLocation?: string;
  
  // Stock levels
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  incomingQty: number; // POs in transit
  
  // Reorder configuration
  reorderPoint: number;
  reorderQty: number;
  maxStockLevel: number;
  safetyStock: number;
  
  // Calculated fields
  daysOfSupply: number;
  avgDailyUsage: number;
  stockStatus: StockStatus;
  lastSold?: Date;
  lastReceived?: Date;
  
  // Alerts
  alertConfig?: {
    enabled: boolean;
    notifyBuyers: boolean;
    notifyManagers: boolean;
    autoCreatePO: boolean;
  };
}

interface LowStockAlert {
  id: string;
  inventoryItemId: string;
  product: Product;
  warehouse: Warehouse;
  severity: AlertSeverity;
  currentStock: number;
  reorderPoint: number;
  shortageQty: number;
  daysUntilStockout: number;
  suggestedOrderQty: number;
  suggestedSupplier?: Supplier;
  estimatedCost: number;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  isRead: boolean;
  notes?: string;
}

interface PurchaseOrderSuggestion {
  id: string;
  supplier: Supplier;
  warehouse: Warehouse;
  items: POItemSuggestion[];
  totalItems: number;
  totalQty: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  estimatedDeliveryDate: Date;
  consolidationOpportunities: number;
}

interface POItemSuggestion {
  inventoryItemId: string;
  product: Product;
  currentStock: number;
  reorderPoint: number;
  suggestedQty: number;
  unitCost: number;
  lineTotal: number;
  urgency: AlertSeverity;
  notes?: string;
}

interface ReorderRule {
  id: string;
  name: string;
  description?: string;
  category?: string;
  supplier?: string;
  warehouse?: string;
  reorderPointFormula: 'fixed' | 'dynamic' | 'forecast';
  reorderPointValue?: number;
  reorderPointDays?: number;
  reorderQtyFormula: 'eoq' | 'fixed' | 'max_minus_current';
  reorderQtyValue?: number;
  safetyStockDays: number;
  leadTimeBuffer: number;
  isActive: boolean;
  priority: number;
}

@Component({
  selector: 'app-low-stock-alert',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './low-stock.html',
  styleUrl: './low-stock.scss'
})
export class LowStock implements OnInit {
  private fb = inject(FormBuilder);

  // View State
  activeView = signal<'dashboard' | 'alerts' | 'items' | 'rules' | 'suggestions'>('dashboard');
  selectedItem = signal<InventoryItem | null>(null);
  selectedAlert = signal<LowStockAlert | null>(null);
  selectedSuggestion = signal<PurchaseOrderSuggestion | null>(null);
  
  // Modal States
  showSettingsModal = signal(false);
  showBulkEditModal = signal(false);
  showPOModal = signal(false);
  showAcknowledgeModal = signal(false);
  showResolveModal = signal(false);
  showRuleModal = signal(false);
  showSupplierModal = signal(false);
  
  // Filters
  searchQuery = signal('');
  filterSeverity = signal<AlertSeverity | 'all'>('all');
  filterWarehouse = signal<string>('all');
  filterCategory = signal<string>('all');
  filterSupplier = signal<string>('all');
  filterStatus = signal<'active' | 'acknowledged' | 'resolved' | 'all'>('active');
  showOnlyUnread = signal(false);
  
  // Selection
  selectedAlertIds = signal<string[]>([]);
  selectedItemIds = signal<string[]>([]);
  
  // Forms
  settingsForm!: FormGroup;
  bulkEditForm!: FormGroup;
  poForm!: FormGroup;
  ruleForm!: FormGroup;
  supplierForm!: FormGroup;

  // Mock Data
  warehouses = signal<Warehouse[]>([
    { id: '1', name: 'Main Distribution Center', code: 'NYC', location: 'New York, NY' },
    { id: '2', name: 'West Coast Hub', code: 'LAX', location: 'Los Angeles, CA' },
    { id: '3', name: 'South Distribution', code: 'DAL', location: 'Dallas, TX' },
    { id: '4', name: 'Chicago Facility', code: 'CHI', location: 'Chicago, IL' }
  ]);

  suppliers = signal<Supplier[]>([
    {
      id: 'sup-1',
      name: 'TechCorp Industries',
      code: 'TCI',
      contactName: 'John Smith',
      contactEmail: 'orders@techcorp.com',
      contactPhone: '+1 (555) 123-4567',
      leadTimeDays: 5,
      minOrderValue: 500,
      rating: 'preferred',
      isActive: true,
      paymentTerms: 'Net 30'
    },
    {
      id: 'sup-2',
      name: 'Global Supply Co',
      code: 'GSC',
      contactName: 'Maria Garcia',
      contactEmail: 'sales@globalsupply.com',
      contactPhone: '+1 (555) 987-6543',
      leadTimeDays: 10,
      minOrderValue: 1000,
      rating: 'approved',
      isActive: true,
      paymentTerms: 'Net 45'
    },
    {
      id: 'sup-3',
      name: 'Premium Parts Ltd',
      code: 'PPL',
      contactName: 'David Chen',
      contactEmail: 'orders@premiumparts.com',
      contactPhone: '+1 (555) 456-7890',
      leadTimeDays: 3,
      minOrderValue: 250,
      rating: 'preferred',
      isActive: true,
      paymentTerms: 'Net 15'
    },
    {
      id: 'sup-4',
      name: 'Budget Wholesale',
      code: 'BWH',
      contactName: 'Sarah Johnson',
      contactEmail: 'wholesale@budget.com',
      contactPhone: '+1 (555) 234-5678',
      leadTimeDays: 14,
      minOrderValue: 200,
      rating: 'conditional',
      isActive: true,
      paymentTerms: 'Net 60'
    }
  ]);

  categories = signal<string[]>([
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 
    'Books', 'Toys', 'Health & Beauty', 'Automotive'
  ]);

  products = signal<Product[]>([
    {
      id: 'p1',
      name: 'Wireless Bluetooth Headphones Pro',
      sku: 'WBH-PM-001',
      variant: 'Black',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
      category: 'Electronics',
      subcategory: 'Audio',
      brand: 'TechSound',
      unitCost: 45.00,
      unitOfMeasure: 'pcs',
      weight: 0.3,
      dimensions: { length: 20, width: 15, height: 8 },
      suppliers: ['sup-1', 'sup-3'],
      preferredSupplier: 'sup-1'
    },
    {
      id: 'p2',
      name: 'Smart Watch Series 5',
      sku: 'SW-S5-002',
      variant: 'Silver',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
      category: 'Electronics',
      subcategory: 'Wearables',
      brand: 'TechWatch',
      unitCost: 120.00,
      unitOfMeasure: 'pcs',
      weight: 0.05,
      dimensions: { length: 10, width: 8, height: 3 },
      suppliers: ['sup-1'],
      preferredSupplier: 'sup-1'
    },
    {
      id: 'p3',
      name: 'Organic Cotton T-Shirt',
      sku: 'OCT-001-BLK',
      variant: 'Black',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
      category: 'Clothing',
      subcategory: 'Basics',
      brand: 'EcoWear',
      unitCost: 12.00,
      unitOfMeasure: 'pcs',
      weight: 0.2,
      dimensions: { length: 30, width: 25, height: 2 },
      suppliers: ['sup-2', 'sup-4'],
      preferredSupplier: 'sup-2'
    },
    {
      id: 'p4',
      name: 'Running Shoes Pro',
      sku: 'RS-PRO-001',
      variant: 'Size 10',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
      category: 'Sports',
      subcategory: 'Footwear',
      brand: 'RunFast',
      unitCost: 35.00,
      unitOfMeasure: 'pairs',
      weight: 0.8,
      dimensions: { length: 35, width: 20, height: 12 },
      suppliers: ['sup-2', 'sup-3'],
      preferredSupplier: 'sup-3'
    },
    {
      id: 'p5',
      name: 'Leather Laptop Bag',
      sku: 'LLB-ES-001',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100',
      category: 'Electronics',
      subcategory: 'Accessories',
      brand: 'LeatherCraft',
      unitCost: 55.00,
      unitOfMeasure: 'pcs',
      weight: 1.2,
      dimensions: { length: 40, width: 30, height: 8 },
      suppliers: ['sup-3', 'sup-4'],
      preferredSupplier: 'sup-3'
    },
    {
      id: 'p6',
      name: 'Mechanical Keyboard RGB',
      sku: 'MK-RGB-001',
      variant: 'RGB Backlit',
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100',
      category: 'Electronics',
      subcategory: 'Peripherals',
      brand: 'KeyMaster',
      unitCost: 89.00,
      unitOfMeasure: 'pcs',
      weight: 1.1,
      dimensions: { length: 45, width: 15, height: 4 },
      suppliers: ['sup-1', 'sup-2'],
      preferredSupplier: 'sup-1'
    },
    {
      id: 'p7',
      name: 'Yoga Mat Premium',
      sku: 'YM-PRM-001',
      variant: 'Purple',
      image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=100',
      category: 'Sports',
      subcategory: 'Yoga',
      brand: 'ZenFit',
      unitCost: 28.00,
      unitOfMeasure: 'pcs',
      weight: 1.5,
      dimensions: { length: 60, width: 15, height: 15 },
      suppliers: ['sup-4'],
      preferredSupplier: 'sup-4'
    },
    {
      id: 'p8',
      name: 'Stainless Steel Water Bottle',
      sku: 'WB-SS-001',
      variant: '32oz',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=100',
      category: 'Sports',
      subcategory: 'Accessories',
      brand: 'HydroMax',
      unitCost: 15.00,
      unitOfMeasure: 'pcs',
      weight: 0.4,
      dimensions: { length: 10, width: 10, height: 25 },
      suppliers: ['sup-2', 'sup-3', 'sup-4'],
      preferredSupplier: 'sup-3'
    }
  ]);

  // Inventory Items with Low Stock Scenarios
  inventoryItems = signal<InventoryItem[]>([]);

  // Low Stock Alerts
  alerts = signal<LowStockAlert[]>([]);

  // Reorder Rules
  reorderRules = signal<ReorderRule[]>([
    {
      id: 'rule-1',
      name: 'Electronics Standard',
      description: 'Standard reorder configuration for electronics',
      category: 'Electronics',
      reorderPointFormula: 'dynamic',
      reorderPointDays: 14,
      reorderQtyFormula: 'eoq',
      safetyStockDays: 7,
      leadTimeBuffer: 1.2,
      isActive: true,
      priority: 1
    },
    {
      id: 'rule-2',
      name: 'Fast Moving Clothing',
      description: 'Aggressive reorder for fast-moving apparel',
      category: 'Clothing',
      reorderPointFormula: 'dynamic',
      reorderPointDays: 7,
      reorderQtyFormula: 'max_minus_current',
      safetyStockDays: 3,
      leadTimeBuffer: 1.5,
      isActive: true,
      priority: 2
    },
    {
      id: 'rule-3',
      name: 'Seasonal Sports',
      description: 'Conservative reorder for seasonal items',
      category: 'Sports',
      reorderPointFormula: 'fixed',
      reorderPointValue: 50,
      reorderQtyFormula: 'fixed',
      reorderQtyValue: 200,
      safetyStockDays: 14,
      leadTimeBuffer: 1.0,
      isActive: true,
      priority: 3
    }
  ]);

  // PO Suggestions
  poSuggestions = signal<PurchaseOrderSuggestion[]>([]);

  ngOnInit() {
    this.initializeInventory();
    this.initializeAlerts();
    this.initializeSuggestions();
    this.initializeForms();
  }

  initializeInventory() {
    const items: InventoryItem[] = [];
    const warehouseIds = ['1', '2', '3'];
    
    // Create inventory scenarios
    const scenarios = [
      // Critical stock - below reorder point, urgent
      { productId: 'p1', whId: '1', onHand: 8, reorderPoint: 50, reorderQty: 200, avgDaily: 15, daysSupply: 0.5, status: 'critical' as StockStatus },
      { productId: 'p2', whId: '1', onHand: 3, reorderPoint: 20, reorderQty: 50, avgDaily: 5, daysSupply: 0.6, status: 'critical' as StockStatus },
      
      // Low stock - approaching reorder point
      { productId: 'p3', whId: '2', onHand: 45, reorderPoint: 100, reorderQty: 500, avgDaily: 20, daysSupply: 2.25, status: 'low' as StockStatus },
      { productId: 'p4', whId: '1', onHand: 25, reorderPoint: 75, reorderQty: 250, avgDaily: 12, daysSupply: 2.08, status: 'low' as StockStatus },
      
      // Adequate stock
      { productId: 'p5', whId: '3', onHand: 150, reorderPoint: 50, reorderQty: 100, avgDaily: 3, daysSupply: 50, status: 'adequate' as StockStatus },
      { productId: 'p6', whId: '1', onHand: 80, reorderPoint: 40, reorderQty: 80, avgDaily: 8, daysSupply: 10, status: 'adequate' as StockStatus },
      
      // Excess stock
      { productId: 'p7', whId: '2', onHand: 500, reorderPoint: 30, reorderQty: 100, avgDaily: 2, daysSupply: 250, status: 'excess' as StockStatus },
      
      // Zero stock - out of stock
      { productId: 'p8', whId: '3', onHand: 0, reorderPoint: 100, reorderQty: 500, avgDaily: 25, daysSupply: 0, status: 'critical' as StockStatus }
    ];

    scenarios.forEach((scenario, idx) => {
      const product = this.products().find(p => p.id === scenario.productId)!;
      const warehouse = this.warehouses().find(w => w.id === scenario.whId)!;
      
      items.push({
        id: `inv-${idx}`,
        productId: scenario.productId,
        product: product,
        warehouseId: scenario.whId,
        warehouse: warehouse,
        binLocation: `${String.fromCharCode(65 + idx)}-${String(idx + 1).padStart(2, '0')}`,
        onHandQty: scenario.onHand,
        reservedQty: Math.floor(scenario.onHand * 0.1),
        availableQty: scenario.onHand - Math.floor(scenario.onHand * 0.1),
        incomingQty: scenario.status === 'critical' ? 100 : 0,
        reorderPoint: scenario.reorderPoint,
        reorderQty: scenario.reorderQty,
        maxStockLevel: scenario.reorderQty * 2,
        safetyStock: Math.floor(scenario.reorderPoint * 0.3),
        daysOfSupply: scenario.daysSupply,
        avgDailyUsage: scenario.avgDaily,
        stockStatus: scenario.status,
        lastSold: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        lastReceived: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        alertConfig: {
          enabled: true,
          notifyBuyers: true,
          notifyManagers: scenario.status === 'critical',
          autoCreatePO: false
        }
      });
    });

    this.inventoryItems.set(items);
  }

  initializeAlerts() {
    const criticalItems = this.inventoryItems().filter(i => i.stockStatus === 'critical' || i.stockStatus === 'low');
    
    const alerts: LowStockAlert[] = criticalItems.map((item, idx) => {
      const shortage = Math.max(0, item.reorderPoint - item.availableQty);
      const daysUntilStockout = item.avgDailyUsage > 0 ? Math.floor(item.availableQty / item.avgDailyUsage) : 0;
      const suggestedQty = Math.max(item.reorderQty, shortage + item.safetyStock);
      const preferredSupplier = this.suppliers().find(s => s.id === item.product.preferredSupplier);
      
      return {
        id: `alert-${idx}`,
        inventoryItemId: item.id,
        product: item.product,
        warehouse: item.warehouse,
        severity: item.stockStatus === 'critical' ? 'critical' : 'warning',
        currentStock: item.availableQty,
        reorderPoint: item.reorderPoint,
        shortageQty: shortage,
        daysUntilStockout: daysUntilStockout,
        suggestedOrderQty: suggestedQty,
        suggestedSupplier: preferredSupplier,
        estimatedCost: suggestedQty * item.product.unitCost,
        createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        isRead: Math.random() > 0.5
      };
    });

    this.alerts.set(alerts);
  }

  initializeSuggestions() {
    // Group alerts by supplier for consolidation
    const supplierGroups = new Map<string, LowStockAlert[]>();
    
    this.alerts().forEach(alert => {
      const supplierId = alert.suggestedSupplier?.id;
      if (!supplierId) return;
      
      if (!supplierGroups.has(supplierId)) {
        supplierGroups.set(supplierId, []);
      }
      supplierGroups.get(supplierId)!.push(alert);
    });

    const suggestions: PurchaseOrderSuggestion[] = [];
    let suggestionId = 1;

    supplierGroups.forEach((alerts, supplierId) => {
      const supplier = this.suppliers().find(s => s.id === supplierId)!;
      const warehouse = alerts[0].warehouse; // Assume same warehouse for simplicity
      
      const items: POItemSuggestion[] = alerts.map(alert => ({
        inventoryItemId: alert.inventoryItemId,
        product: alert.product,
        currentStock: alert.currentStock,
        reorderPoint: alert.reorderPoint,
        suggestedQty: alert.suggestedOrderQty,
        unitCost: alert.product.unitCost,
        lineTotal: alert.suggestedOrderQty * alert.product.unitCost,
        urgency: alert.severity,
        notes: alert.daysUntilStockout <= 2 ? 'URGENT: Stockout imminent' : undefined
      }));

      const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
      const shipping = subtotal > supplier.minOrderValue ? 0 : 25;
      const tax = subtotal * 0.08;
      
      suggestions.push({
        id: `sugg-${suggestionId++}`,
        supplier: supplier,
        warehouse: warehouse,
        items: items,
        totalItems: items.length,
        totalQty: items.reduce((sum, i) => sum + i.suggestedQty, 0),
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: subtotal + tax + shipping,
        estimatedDeliveryDate: new Date(Date.now() + supplier.leadTimeDays * 24 * 60 * 60 * 1000),
        consolidationOpportunities: alerts.length > 1 ? alerts.length - 1 : 0
      });
    });

    this.poSuggestions.set(suggestions);
  }

  initializeForms() {
    this.settingsForm = this.fb.group({
      reorderPoint: [0, [Validators.required, Validators.min(0)]],
      reorderQty: [0, [Validators.required, Validators.min(1)]],
      safetyStock: [0, [Validators.required, Validators.min(0)]],
      maxStockLevel: [0, [Validators.required, Validators.min(1)]],
      notifyBuyers: [true],
      notifyManagers: [false],
      autoCreatePO: [false]
    });

    this.bulkEditForm = this.fb.group({
      reorderPoint: [null],
      reorderQty: [null],
      safetyStock: [null],
      applyToAll: [false]
    });

    this.poForm = this.fb.group({
      supplierId: ['', Validators.required],
      orderDate: [new Date().toISOString().split('T')[0], Validators.required],
      expectedDelivery: ['', Validators.required],
      notes: ['']
    });

    this.ruleForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: [''],
      supplier: [''],
      warehouse: [''],
      reorderPointFormula: ['dynamic', Validators.required],
      reorderPointValue: [null],
      reorderPointDays: [14],
      reorderQtyFormula: ['eoq', Validators.required],
      reorderQtyValue: [null],
      safetyStockDays: [7, Validators.required],
      leadTimeBuffer: [1.2, Validators.required]
    });

    this.supplierForm = this.fb.group({
      supplierId: ['', Validators.required],
      unitCost: [0, [Validators.required, Validators.min(0)]],
      minOrderQty: [1, Validators.min(1)],
      leadTimeDays: [7, Validators.min(1)],
      isPreferred: [false]
    });
  }

  // Computed Values
  filteredAlerts = computed(() => {
    let result = this.alerts();
    
    if (this.filterSeverity() !== 'all') {
      result = result.filter(a => a.severity === this.filterSeverity());
    }
    if (this.filterWarehouse() !== 'all') {
      result = result.filter(a => a.warehouse.id === this.filterWarehouse());
    }
    if (this.filterCategory() !== 'all') {
      result = result.filter(a => a.product.category === this.filterCategory());
    }
    if (this.filterSupplier() !== 'all') {
      result = result.filter(a => a.suggestedSupplier?.id === this.filterSupplier());
    }
    if (this.filterStatus() !== 'all') {
      switch (this.filterStatus()) {
        case 'active': result = result.filter(a => !a.acknowledgedAt && !a.resolvedAt); break;
        case 'acknowledged': result = result.filter(a => a.acknowledgedAt && !a.resolvedAt); break;
        case 'resolved': result = result.filter(a => a.resolvedAt); break;
      }
    }
    if (this.showOnlyUnread()) {
      result = result.filter(a => !a.isRead);
    }
    
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(a => 
        a.product.name.toLowerCase().includes(query) ||
        a.product.sku.toLowerCase().includes(query) ||
        a.warehouse.name.toLowerCase().includes(query)
      );
    }
    
    return result.sort((a, b) => {
      // Critical first, then by days until stockout
      if (a.severity !== b.severity) {
        return a.severity === 'critical' ? -1 : 1;
      }
      return a.daysUntilStockout - b.daysUntilStockout;
    });
  });

  filteredInventory = computed(() => {
    let result = this.inventoryItems();
    
    if (this.filterWarehouse() !== 'all') {
      result = result.filter(i => i.warehouseId === this.filterWarehouse());
    }
    if (this.filterCategory() !== 'all') {
      result = result.filter(i => i.product.category === this.filterCategory());
    }
    
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(i => 
        i.product.name.toLowerCase().includes(query) ||
        i.product.sku.toLowerCase().includes(query)
      );
    }
    
    return result.sort((a, b) => {
      // Sort by severity: critical, low, adequate, excess
      const severityOrder = { critical: 0, low: 1, adequate: 2, excess: 3, untracked: 4 };
      return severityOrder[a.stockStatus] - severityOrder[b.stockStatus];
    });
  });

  stats = computed(() => {
    const items = this.inventoryItems();
    const alerts = this.alerts();
    return {
      totalItems: items.length,
      criticalCount: items.filter(i => i.stockStatus === 'critical').length,
      lowCount: items.filter(i => i.stockStatus === 'low').length,
      adequateCount: items.filter(i => i.stockStatus === 'adequate').length,
      excessCount: items.filter(i => i.stockStatus === 'excess').length,
      
      totalAlerts: alerts.length,
      unreadAlerts: alerts.filter(a => !a.isRead).length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      warningAlerts: alerts.filter(a => a.severity === 'warning').length,
      
      totalShortageValue: alerts.reduce((sum, a) => sum + a.estimatedCost, 0),
      avgDaysUntilStockout: alerts.length > 0 
        ? alerts.reduce((sum, a) => sum + a.daysUntilStockout, 0) / alerts.length 
        : 0,
      
      poSuggestions: this.poSuggestions().length,
      totalSuggestedValue: this.poSuggestions().reduce((sum, s) => sum + s.total, 0)
    };
  });

  criticalAlerts = computed(() => this.alerts().filter(a => a.severity === 'critical'));
  warningAlerts = computed(() => this.alerts().filter(a => a.severity === 'warning'));

  setSelectedAlterIds(isChecked: Boolean){
    this.selectedAlertIds.set(isChecked ? this.filteredAlerts().map(a => a.id) : [])
  }

  // Navigation
  setView(view: 'dashboard' | 'alerts' | 'items' | 'rules' | 'suggestions') {
    this.activeView.set(view);
    this.selectedAlert.set(null);
    this.selectedItem.set(null);
    this.selectedSuggestion.set(null);
  }

  // Alert Actions
  acknowledgeAlert(alert: LowStockAlert) {
    this.selectedAlert.set(alert);
    this.showAcknowledgeModal.set(true);
  }

  confirmAcknowledge() {
    const alert = this.selectedAlert();
    if (!alert) return;

    this.alerts.update(list =>
      list.map(a => a.id === alert.id ? {
        ...a,
        acknowledgedAt: new Date(),
        acknowledgedBy: 'Current User',
        isRead: true
      } : a)
    );

    this.showAcknowledgeModal.set(false);
    this.selectedAlert.set(null);
  }

  resolveAlert(alert: LowStockAlert) {
    this.selectedAlert.set(alert);
    this.showResolveModal.set(true);
  }

  confirmResolve() {
    const alert = this.selectedAlert();
    if (!alert) return;

    this.alerts.update(list =>
      list.map(a => a.id === alert.id ? {
        ...a,
        resolvedAt: new Date(),
        isRead: true
      } : a)
    );

    this.showResolveModal.set(false);
    this.selectedAlert.set(null);
  }

  markAsRead(alert: LowStockAlert) {
    this.alerts.update(list =>
      list.map(a => a.id === alert.id ? { ...a, isRead: true } : a)
    );
  }

  // Bulk Actions
  toggleAlertSelection(alertId: string) {
    this.selectedAlertIds.update(ids => 
      ids.includes(alertId) 
        ? ids.filter(id => id !== alertId)
        : [...ids, alertId]
    );
  }

  acknowledgeSelected() {
    const ids = this.selectedAlertIds();
    this.alerts.update(list =>
      list.map(a => ids.includes(a.id) ? {
        ...a,
        acknowledgedAt: new Date(),
        acknowledgedBy: 'Current User',
        isRead: true
      } : a)
    );
    this.selectedAlertIds.set([]);
  }

  // PO Creation
  createPOFromSuggestion(suggestion: PurchaseOrderSuggestion) {
    this.selectedSuggestion.set(suggestion);
    this.poForm.patchValue({
      supplierId: suggestion.supplier.id,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: suggestion.estimatedDeliveryDate.toISOString().split('T')[0],
      notes: ''
    });
    this.showPOModal.set(true);
  }

  confirmPO() {
    // In real app, this would create a PO in the backend
    const suggestion = this.selectedSuggestion();
    if (!suggestion) return;

    // Mark related alerts as resolved
    const itemIds = suggestion.items.map(i => i.inventoryItemId);
    this.alerts.update(list =>
      list.map(a => itemIds.includes(a.inventoryItemId) ? {
        ...a,
        resolvedAt: new Date(),
        isRead: true
      } : a)
    );

    this.showPOModal.set(false);
    this.selectedSuggestion.set(null);
    this.setView('alerts');
  }

  // Item Settings
  openItemSettings(item: InventoryItem) {
    this.selectedItem.set(item);
    this.settingsForm.patchValue({
      reorderPoint: item.reorderPoint,
      reorderQty: item.reorderQty,
      safetyStock: item.safetyStock,
      maxStockLevel: item.maxStockLevel,
      notifyBuyers: item.alertConfig?.notifyBuyers ?? true,
      notifyManagers: item.alertConfig?.notifyManagers ?? false,
      autoCreatePO: item.alertConfig?.autoCreatePO ?? false
    });
    this.showSettingsModal.set(true);
  }

  saveItemSettings() {
    if (this.settingsForm.invalid) return;
    
    const item = this.selectedItem();
    if (!item) return;

    const formValue = this.settingsForm.value;

    this.inventoryItems.update(list =>
      list.map(i => i.id === item.id ? {
        ...i,
        reorderPoint: formValue.reorderPoint,
        reorderQty: formValue.reorderQty,
        safetyStock: formValue.safetyStock,
        maxStockLevel: formValue.maxStockLevel,
        alertConfig: {
          enabled: true,
          notifyBuyers: formValue.notifyBuyers,
          notifyManagers: formValue.notifyManagers,
          autoCreatePO: formValue.autoCreatePO
        }
      } : i)
    );

    this.showSettingsModal.set(false);
    this.selectedItem.set(null);
  }

  // Bulk Edit
  openBulkEdit() {
    this.bulkEditForm.reset({
      reorderPoint: null,
      reorderQty: null,
      safetyStock: null,
      applyToAll: false
    });
    this.showBulkEditModal.set(true);
  }

  applyBulkEdit() {
    // Apply to selected items or all filtered items
    const formValue = this.bulkEditForm.value;
    const targetItems = formValue.applyToAll 
      ? this.filteredInventory()
      : this.inventoryItems().filter(i => this.selectedItemIds().includes(i.id));

    this.inventoryItems.update(list =>
      list.map(i => {
        if (!targetItems.find(t => t.id === i.id)) return i;
        
        return {
          ...i,
          reorderPoint: formValue.reorderPoint ?? i.reorderPoint,
          reorderQty: formValue.reorderQty ?? i.reorderQty,
          safetyStock: formValue.safetyStock ?? i.safetyStock
        };
      })
    );

    this.showBulkEditModal.set(false);
    this.selectedItemIds.set([]);
  }

  // Rule Management
  openRuleModal(rule?: ReorderRule) {
    if (rule) {
      this.ruleForm.patchValue({
        name: rule.name,
        description: rule.description,
        category: rule.category,
        supplier: rule.supplier,
        warehouse: rule.warehouse,
        reorderPointFormula: rule.reorderPointFormula,
        reorderPointValue: rule.reorderPointValue,
        reorderPointDays: rule.reorderPointDays,
        reorderQtyFormula: rule.reorderQtyFormula,
        reorderQtyValue: rule.reorderQtyValue,
        safetyStockDays: rule.safetyStockDays,
        leadTimeBuffer: rule.leadTimeBuffer
      });
    } else {
      this.ruleForm.reset({
        reorderPointFormula: 'dynamic',
        reorderPointDays: 14,
        reorderQtyFormula: 'eoq',
        safetyStockDays: 7,
        leadTimeBuffer: 1.2
      });
    }
    this.showRuleModal.set(true);
  }

  saveRule() {
    if (this.ruleForm.invalid) return;
    // Add or update rule logic here
    this.showRuleModal.set(false);
  }

  // Helper Methods
  getSeverityColor(severity: AlertSeverity): string {
    const colors: Record<AlertSeverity, string> = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      warning: 'bg-orange-100 text-orange-700 border-orange-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[severity];
  }

  getStockStatusColor(status: StockStatus): string {
    const colors: Record<StockStatus, string> = {
      critical: 'bg-red-500',
      low: 'bg-orange-500',
      adequate: 'bg-green-500',
      excess: 'bg-blue-500',
      untracked: 'bg-gray-400'
    };
    return colors[status];
  }

  getStockStatusBg(status: StockStatus): string {
    const colors: Record<StockStatus, string> = {
      critical: 'bg-red-50 border-red-200',
      low: 'bg-orange-50 border-orange-200',
      adequate: 'bg-green-50 border-green-200',
      excess: 'bg-blue-50 border-blue-200',
      untracked: 'bg-gray-50 border-gray-200'
    };
    return colors[status];
  }

  getStockStatusLabel(status: StockStatus): string {
    const labels: Record<StockStatus, string> = {
      critical: 'Critical',
      low: 'Low Stock',
      adequate: 'Adequate',
      excess: 'Excess',
      untracked: 'Untracked'
    };
    return labels[status];
  }

  getDaysColor(days: number): string {
    if (days <= 2) return 'text-red-600 font-bold';
    if (days <= 7) return 'text-orange-600';
    return 'text-green-600';
  }

  getProgressColor(percentage: number): string {
    if (percentage <= 20) return 'bg-red-500';
    if (percentage <= 40) return 'bg-orange-500';
    if (percentage <= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  calculateStockPercentage(item: InventoryItem): number {
    return Math.min(100, Math.round((item.onHandQty / item.maxStockLevel) * 100));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getSupplierRatingColor(rating: SupplierRating): string {
    const colors: Record<SupplierRating, string> = {
      preferred: 'bg-green-100 text-green-700',
      approved: 'bg-blue-100 text-blue-700',
      conditional: 'bg-yellow-100 text-yellow-700',
      blocked: 'bg-red-100 text-red-700'
    };
    return colors[rating];
  }

  protected readonly Math = Math;
}