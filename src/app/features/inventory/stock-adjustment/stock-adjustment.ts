// src/app/features/inventory/components/stock-adjustment/stock-adjustment.component.ts
import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Enums and Interfaces
type AdjustmentType = 'count' | 'damage' | 'receiving' | 'return' | 'transfer' | 'correction' | 'expiry';
type AdjustmentStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
type AdjustmentReason = 'damage' | 'expired' | 'lost' | 'found' | 'theft' | 'correction' | 'system_error' | 'other';

interface Warehouse {
  id: string;
  name: string;
  location: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  variant?: string;
  image: string;
  category: string;
  unitCost: number;
  unitOfMeasure: string;
}

interface InventoryItem {
  id: string;
  productId: string;
  product: Product;
  warehouseId: string;
  warehouse: Warehouse;
  binLocation?: string;
  currentQty: number;
  reservedQty: number;
  availableQty: number;
  lastCounted?: Date;
}

interface AdjustmentLineItem {
  id: string;
  inventoryItemId: string;
  product: Product;
  warehouse: Warehouse;
  binLocation?: string;
  systemQty: number;
  countedQty: number | null;
  difference: number;
  unitCost: number;
  totalValue: number;
  reason: AdjustmentReason;
  notes: string;
  serialNumbers?: string[];
}

interface AdjustmentBatch {
  id: string;
  batchNumber: string;
  createdAt: Date;
  updatedAt: Date;
  type: AdjustmentType;
  status: AdjustmentStatus;
  reference?: string | null;
  warehouseId?: string;
  warehouse?: Warehouse;
  totalItems: number;
  totalDifference: number;
  totalValueImpact: number;
  positiveAdjustments: number;
  negativeAdjustments: number;
  createdBy: string;
  approvedBy?: string | null;
  approvedAt?: Date;
  notes?: string;
  lineItems: AdjustmentLineItem[];
}

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './stock-adjustment.html',
  styleUrl: './stock-adjustment.scss'
})
export class StockAdjustment implements OnInit {
  private fb = inject(FormBuilder);

  // View State Signals
  activeView = signal<'list' | 'create' | 'detail' | 'count'>('list');
  selectedBatch = signal<AdjustmentBatch | null>(null);
  showLineItemModal = signal(false);
  showSubmitModal = signal(false);
  showApproveModal = signal(false);
  showRejectModal = signal(false);
  showDeleteConfirm = signal(false);
  editingLineItem = signal<AdjustmentLineItem | null>(null);
  currentStep = signal<1 | 2 | 3>(1);
  
  // Filter Signals
  searchQuery = signal('');
  filterStatus = signal<AdjustmentStatus | 'all'>('all');
  filterType = signal<AdjustmentType | 'all'>('all');
  filterWarehouse = signal<string>('all');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');

  // Forms
  batchForm!: FormGroup;
  lineItemForm!: FormGroup;
  countForm!: FormGroup;

  // Mock Data - Warehouses
  warehouses = signal<Warehouse[]>([
    { id: '1', name: 'Main Distribution Center', location: 'New York, NY' },
    { id: '2', name: 'West Coast Hub', location: 'Los Angeles, CA' },
    { id: '3', name: 'South Distribution', location: 'Dallas, TX' },
    { id: '4', name: 'Chicago Facility', location: 'Chicago, IL' }
  ]);

  // Mock Data - Products
  products = signal<Product[]>([
    { 
      id: 'p1', 
      name: 'Wireless Bluetooth Headphones Pro', 
      sku: 'WBH-PM-001', 
      variant: 'Black', 
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100', 
      category: 'Electronics', 
      unitCost: 45.00,
      unitOfMeasure: 'pcs'
    },
    { 
      id: 'p2', 
      name: 'Smart Watch Series 5', 
      sku: 'SW-S5-002', 
      variant: 'Silver', 
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100', 
      category: 'Electronics', 
      unitCost: 120.00,
      unitOfMeasure: 'pcs'
    },
    { 
      id: 'p3', 
      name: 'Organic Cotton T-Shirt', 
      sku: 'OCT-001-BLK', 
      variant: 'Black', 
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100', 
      category: 'Clothing', 
      unitCost: 12.00,
      unitOfMeasure: 'pcs'
    },
    { 
      id: 'p4', 
      name: 'Running Shoes Pro', 
      sku: 'RS-PRO-001', 
      variant: 'Size 10', 
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100', 
      category: 'Sports', 
      unitCost: 35.00,
      unitOfMeasure: 'pairs'
    },
    { 
      id: 'p5', 
      name: 'Leather Laptop Bag', 
      sku: 'LLB-ES-001', 
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100', 
      category: 'Accessories', 
      unitCost: 55.00,
      unitOfMeasure: 'pcs'
    },
    { 
      id: 'p6', 
      name: 'Mechanical Keyboard', 
      sku: 'MK-RGB-001', 
      variant: 'RGB Backlit', 
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100', 
      category: 'Electronics', 
      unitCost: 89.00,
      unitOfMeasure: 'pcs'
    }
  ]);

  // Mock Data - Inventory Items
  inventoryItems = signal<InventoryItem[]>([
    { 
      id: 'inv-1', 
      productId: 'p1', 
      product: this.products()[0], 
      warehouseId: '1', 
      warehouse: this.warehouses()[0],
      binLocation: 'A-12-3',
      currentQty: 150,
      reservedQty: 25,
      availableQty: 125,
      lastCounted: new Date('2024-01-15')
    },
    { 
      id: 'inv-2', 
      productId: 'p2', 
      product: this.products()[1], 
      warehouseId: '1', 
      warehouse: this.warehouses()[0],
      binLocation: 'A-12-5',
      currentQty: 8,
      reservedQty: 3,
      availableQty: 5,
      lastCounted: new Date('2024-01-20')
    },
    { 
      id: 'inv-3', 
      productId: 'p3', 
      product: this.products()[2], 
      warehouseId: '2', 
      warehouse: this.warehouses()[1],
      binLocation: 'B-05-2',
      currentQty: 0,
      reservedQty: 0,
      availableQty: 0,
      lastCounted: new Date('2024-02-01')
    },
    { 
      id: 'inv-4', 
      productId: 'p4', 
      product: this.products()[3], 
      warehouseId: '1', 
      warehouse: this.warehouses()[0],
      binLocation: 'C-08-1',
      currentQty: 500,
      reservedQty: 50,
      availableQty: 450,
      lastCounted: new Date('2024-02-10')
    },
    { 
      id: 'inv-5', 
      productId: 'p5', 
      product: this.products()[4], 
      warehouseId: '3', 
      warehouse: this.warehouses()[2],
      binLocation: 'D-03-4',
      currentQty: 45,
      reservedQty: 5,
      availableQty: 40,
      lastCounted: new Date('2024-02-05')
    },
    { 
      id: 'inv-6', 
      productId: 'p6', 
      product: this.products()[5], 
      warehouseId: '1', 
      warehouse: this.warehouses()[0],
      binLocation: 'A-15-2',
      currentQty: 75,
      reservedQty: 10,
      availableQty: 65,
      lastCounted: new Date('2024-02-15')
    }
  ]);

  // Mock Data - Adjustment Batches
  adjustmentBatches = signal<AdjustmentBatch[]>([
    {
      id: 'batch-1',
      batchNumber: 'ADJ-2024-001',
      createdAt: new Date('2024-02-20T09:30:00'),
      updatedAt: new Date('2024-02-20T14:45:00'),
      type: 'count',
      status: 'completed',
      reference: 'SC-FEB-2024',
      warehouseId: '1',
      warehouse: this.warehouses()[0],
      totalItems: 45,
      totalDifference: -12,
      totalValueImpact: -540.00,
      positiveAdjustments: 3,
      negativeAdjustments: 9,
      createdBy: 'John Smith',
      approvedBy: 'Sarah Johnson',
      approvedAt: new Date('2024-02-20T14:45:00'),
      notes: 'Monthly stock count - February 2024. Variance found in electronics section due to counting error.',
      lineItems: []
    },
    {
      id: 'batch-2',
      batchNumber: 'ADJ-2024-002',
      createdAt: new Date('2024-02-19T11:15:00'),
      updatedAt: new Date('2024-02-19T16:20:00'),
      type: 'damage',
      status: 'approved',
      reference: 'DMG-2024-008',
      warehouseId: '1',
      warehouse: this.warehouses()[0],
      totalItems: 12,
      totalDifference: -12,
      totalValueImpact: -540.00,
      positiveAdjustments: 0,
      negativeAdjustments: 12,
      createdBy: 'Mike Chen',
      approvedBy: 'Sarah Johnson',
      approvedAt: new Date('2024-02-19T16:20:00'),
      notes: 'Water damage from leaking pipe in Zone B. 12 units of electronics affected.',
      lineItems: []
    },
    {
      id: 'batch-3',
      batchNumber: 'ADJ-2024-003',
      createdAt: new Date('2024-02-18T08:00:00'),
      updatedAt: new Date('2024-02-18T10:30:00'),
      type: 'receiving',
      status: 'completed',
      reference: 'PO-2024-156',
      warehouseId: '2',
      warehouse: this.warehouses()[1],
      totalItems: 200,
      totalDifference: 200,
      totalValueImpact: 8500.00,
      positiveAdjustments: 200,
      negativeAdjustments: 0,
      createdBy: 'Emily Rodriguez',
      approvedBy: 'Sarah Johnson',
      approvedAt: new Date('2024-02-18T10:30:00'),
      notes: 'Purchase order received - TechCorp delivery. All items verified and counted.',
      lineItems: []
    },
    {
      id: 'batch-4',
      batchNumber: 'ADJ-2024-004',
      createdAt: new Date('2024-02-18T13:45:00'),
      updatedAt: new Date('2024-02-18T13:45:00'),
      type: 'correction',
      status: 'pending',
      reference: null,
      warehouseId: '1',
      warehouse: this.warehouses()[0],
      totalItems: 3,
      totalDifference: -5,
      totalValueImpact: -120.00,
      positiveAdjustments: 0,
      negativeAdjustments: 3,
      createdBy: 'John Smith',
      approvedBy: null,
      approvedAt: undefined,
      notes: 'System discrepancy found during audit. Quantity mismatch in database vs physical.',
      lineItems: []
    },
    {
      id: 'batch-5',
      batchNumber: 'ADJ-2024-005',
      createdAt: new Date('2024-02-17T15:20:00'),
      updatedAt: new Date('2024-02-17T15:20:00'),
      type: 'return',
      status: 'draft',
      reference: 'RMA-2024-089',
      warehouseId: '3',
      warehouse: this.warehouses()[2],
      totalItems: 8,
      totalDifference: 8,
      totalValueImpact: 320.00,
      positiveAdjustments: 8,
      negativeAdjustments: 0,
      createdBy: 'John Smith',
      approvedBy: null,
      approvedAt: undefined,
      notes: 'Customer returns - pending inspection. Items need quality check before restocking.',
      lineItems: []
    },
    {
      id: 'batch-6',
      batchNumber: 'ADJ-2024-006',
      createdAt: new Date('2024-02-16T10:00:00'),
      updatedAt: new Date('2024-02-16T11:30:00'),
      type: 'transfer',
      status: 'completed',
      reference: 'TF-2024-023',
      warehouseId: '1',
      warehouse: this.warehouses()[0],
      totalItems: 150,
      totalDifference: 0,
      totalValueImpact: 0,
      positiveAdjustments: 150,
      negativeAdjustments: 150,
      createdBy: 'Sarah Johnson',
      approvedBy: 'Sarah Johnson',
      approvedAt: new Date('2024-02-16T11:30:00'),
      notes: 'Inter-warehouse transfer to West Coast Hub. Net zero adjustment.',
      lineItems: []
    }
  ]);

  // Current Draft Batch
  draftBatch = signal<Partial<AdjustmentBatch>>({
    type: 'correction',
    status: 'draft',
    lineItems: []
  });

  // Computed Values
  filteredBatches = computed(() => {
    let result = this.adjustmentBatches();
    
    // Search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(b => 
        b.batchNumber.toLowerCase().includes(query) ||
        b.notes?.toLowerCase().includes(query) ||
        b.createdBy.toLowerCase().includes(query) ||
        b.reference?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (this.filterStatus() !== 'all') {
      result = result.filter(b => b.status === this.filterStatus());
    }
    
    // Type filter
    if (this.filterType() !== 'all') {
      result = result.filter(b => b.type === this.filterType());
    }
    
    // Warehouse filter
    if (this.filterWarehouse() !== 'all') {
      result = result.filter(b => b.warehouseId === this.filterWarehouse());
    }
    
    // Date range filter
    if (this.filterDateFrom()) {
      const fromDate = new Date(this.filterDateFrom());
      result = result.filter(b => b.createdAt >= fromDate);
    }
    if (this.filterDateTo()) {
      const toDate = new Date(this.filterDateTo());
      toDate.setHours(23, 59, 59);
      result = result.filter(b => b.createdAt <= toDate);
    }
    
    // Sort by date descending
    return [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  stats = computed(() => {
    const batches = this.adjustmentBatches();
    return {
      total: batches.length,
      draft: batches.filter(b => b.status === 'draft').length,
      pending: batches.filter(b => b.status === 'pending').length,
      completed: batches.filter(b => b.status === 'completed').length,
      totalValue: batches.reduce((sum, b) => sum + Math.abs(b.totalValueImpact), 0)
    };
  });

  draftLineItems = computed(() => (this.draftBatch().lineItems as AdjustmentLineItem[]) || []);
  
  draftSummary = computed(() => {
    const items = this.draftLineItems();
    return {
      count: items.length,
      positiveQty: items.filter(i => i.difference > 0).reduce((sum, i) => sum + i.difference, 0),
      negativeQty: items.filter(i => i.difference < 0).reduce((sum, i) => sum + Math.abs(i.difference), 0),
      totalValue: items.reduce((sum, i) => sum + i.totalValue, 0)
    };
  });

  canSubmitDraft = computed(() => {
    return this.draftLineItems().length > 0 && this.batchForm?.valid;
  });

  ngOnInit() {
    this.initializeForms();
  }

  initializeForms() {
    this.batchForm = this.fb.group({
      type: ['correction', Validators.required],
      reference: [''],
      warehouseId: ['', Validators.required],
      notes: ['', Validators.required]
    });

    this.lineItemForm = this.fb.group({
      inventoryItemId: ['', Validators.required],
      countedQty: [0, [Validators.required, Validators.min(0)]],
      reason: ['correction', Validators.required],
      notes: ['']
    });

    this.countForm = this.fb.group({
      scannedSku: [''],
      countedQty: [1, [Validators.required, Validators.min(1)]]
    });

    // Subscribe to batch form changes
    this.batchForm.valueChanges.subscribe(values => {
      this.draftBatch.update(batch => ({
        ...batch,
        ...values,
        warehouse: this.warehouses().find(w => w.id === values.warehouseId)
      }));
    });
  }

  getSelectedInventoryItem(){
    return this.inventoryItems().find(i => i.id === this.lineItemForm.get('inventoryItemId')?.value);
  }

  // Navigation Methods
  goToList() {
    this.activeView.set('list');
    this.selectedBatch.set(null);
    this.currentStep.set(1);
  }

  startNewAdjustment() {
    this.draftBatch.set({
      type: 'correction',
      status: 'draft',
      lineItems: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.batchForm.reset({
      type: 'correction',
      reference: '',
      warehouseId: '',
      notes: ''
    });
    this.currentStep.set(1);
    this.activeView.set('create');
  }

  startStockCount() {
    this.activeView.set('count');
    this.countForm.reset({
      scannedSku: '',
      countedQty: 1
    });
  }

  viewBatchDetail(batch: AdjustmentBatch) {
    this.selectedBatch.set(batch);
    this.activeView.set('detail');
  }

  // Step Navigation
  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.update(s => (s + 1) as 1 | 2 | 3);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => (s - 1) as 1 | 2 | 3);
    }
  }

  // Line Item Management
  openAddLineItem() {
    this.editingLineItem.set(null);
    this.lineItemForm.reset({
      inventoryItemId: '',
      countedQty: 0,
      reason: 'correction',
      notes: ''
    });
    this.showLineItemModal.set(true);
  }

  editLineItem(item: AdjustmentLineItem) {
    this.editingLineItem.set(item);
    this.lineItemForm.patchValue({
      inventoryItemId: item.inventoryItemId,
      countedQty: item.countedQty,
      reason: item.reason,
      notes: item.notes
    });
    this.showLineItemModal.set(true);
  }

  saveLineItem() {
    if (this.lineItemForm.invalid) return;

    const formValue = this.lineItemForm.value;
    const inventoryItem = this.inventoryItems().find(i => i.id === formValue.inventoryItemId);
    
    if (!inventoryItem) return;

    const difference = (formValue.countedQty || 0) - inventoryItem.currentQty;
    
    const lineItem: AdjustmentLineItem = {
      id: this.editingLineItem()?.id || `line-${Date.now()}`,
      inventoryItemId: inventoryItem.id,
      product: inventoryItem.product,
      warehouse: inventoryItem.warehouse,
      binLocation: inventoryItem.binLocation,
      systemQty: inventoryItem.currentQty,
      countedQty: formValue.countedQty,
      difference: difference,
      unitCost: inventoryItem.product.unitCost,
      totalValue: Math.abs(difference) * inventoryItem.product.unitCost,
      reason: formValue.reason,
      notes: formValue.notes
    };

    this.draftBatch.update(batch => {
      const items = (batch.lineItems as AdjustmentLineItem[]) || [];
      const existingIndex = items.findIndex(i => i.id === lineItem.id);
      
      let newItems;
      if (existingIndex >= 0) {
        newItems = [...items];
        newItems[existingIndex] = lineItem;
      } else {
        newItems = [...items, lineItem];
      }
      
      return { ...batch, lineItems: newItems };
    });

    this.showLineItemModal.set(false);
    this.editingLineItem.set(null);
  }

  removeLineItem(itemId: string) {
    this.draftBatch.update(batch => ({
      ...batch,
      lineItems: ((batch.lineItems as AdjustmentLineItem[]) || []).filter(i => i.id !== itemId)
    }));
  }

  // Batch Operations
  saveDraft() {
    const formValue = this.batchForm.value;
    const newBatch: AdjustmentBatch = {
      id: `batch-${Date.now()}`,
      batchNumber: `ADJ-${new Date().getFullYear()}-${String(this.adjustmentBatches().length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: formValue.type,
      status: 'draft',
      reference: formValue.reference || undefined,
      warehouseId: formValue.warehouseId,
      warehouse: this.warehouses().find(w => w.id === formValue.warehouseId),
      totalItems: this.draftLineItems().length,
      totalDifference: this.draftLineItems().reduce((sum, i) => sum + i.difference, 0),
      totalValueImpact: this.draftSummary().totalValue,
      positiveAdjustments: this.draftLineItems().filter(i => i.difference > 0).length,
      negativeAdjustments: this.draftLineItems().filter(i => i.difference < 0).length,
      createdBy: 'Current User',
      notes: formValue.notes,
      lineItems: this.draftLineItems()
    };

    this.adjustmentBatches.update(list => [newBatch, ...list]);
    this.goToList();
  }

  submitForApproval() {
    this.showSubmitModal.set(true);
  }

  confirmSubmit() {
    const formValue = this.batchForm.value;
    const newBatch: AdjustmentBatch = {
      id: `batch-${Date.now()}`,
      batchNumber: `ADJ-${new Date().getFullYear()}-${String(this.adjustmentBatches().length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: formValue.type,
      status: 'pending',
      reference: formValue.reference || undefined,
      warehouseId: formValue.warehouseId,
      warehouse: this.warehouses().find(w => w.id === formValue.warehouseId),
      totalItems: this.draftLineItems().length,
      totalDifference: this.draftLineItems().reduce((sum, i) => sum + i.difference, 0),
      totalValueImpact: this.draftSummary().totalValue,
      positiveAdjustments: this.draftLineItems().filter(i => i.difference > 0).length,
      negativeAdjustments: this.draftLineItems().filter(i => i.difference < 0).length,
      createdBy: 'Current User',
      notes: formValue.notes,
      lineItems: this.draftLineItems()
    };

    this.adjustmentBatches.update(list => [newBatch, ...list]);
    this.showSubmitModal.set(false);
    this.goToList();
  }

  // Approval Operations
  openApproveModal(batch: AdjustmentBatch) {
    this.selectedBatch.set(batch);
    this.showApproveModal.set(true);
  }

  confirmApproval() {
    const batch = this.selectedBatch();
    if (!batch) return;

    this.adjustmentBatches.update(list =>
      list.map(b => b.id === batch.id ? {
        ...b,
        status: 'approved',
        approvedBy: 'Current User',
        approvedAt: new Date(),
        updatedAt: new Date()
      } : b)
    );

    this.showApproveModal.set(false);
    this.goToList();
  }

  openRejectModal(batch: AdjustmentBatch) {
    this.selectedBatch.set(batch);
    this.showRejectModal.set(true);
  }

  confirmRejection() {
    const batch = this.selectedBatch();
    if (!batch) return;

    this.adjustmentBatches.update(list =>
      list.map(b => b.id === batch.id ? {
        ...b,
        status: 'rejected',
        updatedAt: new Date()
      } : b)
    );

    this.showRejectModal.set(false);
    this.goToList();
  }

  completeBatch(batch: AdjustmentBatch) {
    this.adjustmentBatches.update(list =>
      list.map(b => b.id === batch.id ? {
        ...b,
        status: 'completed',
        updatedAt: new Date()
      } : b)
    );
  }

  confirmDelete() {
    const batch = this.selectedBatch();
    if (!batch) return;

    this.adjustmentBatches.update(list => list.filter(b => b.id !== batch.id));
    this.showDeleteConfirm.set(false);
    this.goToList();
  }

  // Helper Methods
  getStatusColor(status: AdjustmentStatus): string {
    const colors: Record<AdjustmentStatus, string> = {
      'draft': 'bg-gray-100 text-gray-700 border-gray-200',
      'pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'approved': 'bg-blue-50 text-blue-700 border-blue-200',
      'rejected': 'bg-red-50 text-red-700 border-red-200',
      'completed': 'bg-green-50 text-green-700 border-green-200'
    };
    return colors[status];
  }

  getTypeIcon(type: AdjustmentType | string): string {
    const icons: any = {
      'count': 'bi-clipboard-check',
      'damage': 'bi-exclamation-triangle',
      'receiving': 'bi-box-arrow-in-down',
      'return': 'bi-arrow-counterclockwise',
      'transfer': 'bi-arrow-left-right',
      'correction': 'bi-pencil-square',
      'expiry': 'bi-calendar-x'
    };
    return icons[type];
  }

  getTypeColor(type: AdjustmentType | string): string {
    const colors: any = {
      'count': 'bg-purple-100 text-purple-700',
      'damage': 'bg-red-100 text-red-700',
      'receiving': 'bg-green-100 text-green-700',
      'return': 'bg-orange-100 text-orange-700',
      'transfer': 'bg-blue-100 text-blue-700',
      'correction': 'bg-yellow-100 text-yellow-700',
      'expiry': 'bg-pink-100 text-pink-700'
    };
    return colors[type];
  }

  getTypeLabel(type: AdjustmentType | string): string {
    const labels: any = {
      'count': 'Stock Count',
      'damage': 'Damage/Loss',
      'receiving': 'Receiving',
      'return': 'Customer Return',
      'transfer': 'Transfer',
      'correction': 'Correction',
      'expiry': 'Expiry'
    };
    return labels[type];
  }

  getReasonLabel(reason: AdjustmentReason | string): string {
    const labels: any = {
      'damage': 'Damaged Goods',
      'expired': 'Expired Product',
      'lost': 'Lost/Missing',
      'found': 'Found/Recovered',
      'theft': 'Theft',
      'correction': 'Inventory Correction',
      'system_error': 'System Error',
      'other': 'Other'
    };
    return labels[reason];
  }

  getReasonColor(reason: AdjustmentReason | string): string {
    const colors: any = {
      'damage': 'text-red-600',
      'expired': 'text-orange-600',
      'lost': 'text-gray-600',
      'found': 'text-green-600',
      'theft': 'text-red-700',
      'correction': 'text-blue-600',
      'system_error': 'text-purple-600',
      'other': 'text-gray-600'
    };
    return colors[reason];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getDifferenceColor(diff: number): string {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  getDifferenceBg(diff: number): string {
    if (diff > 0) return 'bg-green-100';
    if (diff < 0) return 'bg-red-100';
    return 'bg-gray-100';
  }

  // Quick Count Mode
  onScanSubmit() {
    const sku = this.countForm.value.scannedSku;
    const qty = this.countForm.value.countedQty;
    
    // Find product by SKU
    const inventoryItem = this.inventoryItems().find(i => 
      i.product.sku.toLowerCase() === sku.toLowerCase()
    );

    if (inventoryItem) {
      // Add or update line item
      const existingIndex = this.draftLineItems().findIndex(i => 
        i.inventoryItemId === inventoryItem.id
      );

      const difference = qty - inventoryItem.currentQty;
      const lineItem: AdjustmentLineItem = {
        id: existingIndex >= 0 ? this.draftLineItems()[existingIndex].id : `line-${Date.now()}`,
        inventoryItemId: inventoryItem.id,
        product: inventoryItem.product,
        warehouse: inventoryItem.warehouse,
        binLocation: inventoryItem.binLocation,
        systemQty: inventoryItem.currentQty,
        countedQty: qty,
        difference: difference,
        unitCost: inventoryItem.product.unitCost,
        totalValue: Math.abs(difference) * inventoryItem.product.unitCost,
        reason: 'correction',
        notes: 'Added via quick count'
      };

      this.draftBatch.update(batch => {
        const items = [...(batch.lineItems as AdjustmentLineItem[]) || []];
        if (existingIndex >= 0) {
          items[existingIndex] = lineItem;
        } else {
          items.push(lineItem);
        }
        return { ...batch, lineItems: items };
      });

      // Reset scan field but keep focus
      this.countForm.patchValue({ scannedSku: '', countedQty: 1 });
    }
  }

  // Available inventory for current warehouse selection
  availableInventory = computed(() => {
    const warehouseId = this.batchForm?.get('warehouseId')?.value;
    if (!warehouseId) return this.inventoryItems();
    return this.inventoryItems().filter(i => i.warehouseId === warehouseId);
  });

  protected readonly Math = Math;
}