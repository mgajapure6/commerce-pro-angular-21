// src/app/features/inventory/components/stock-transfer/stock-transfer.component.ts
import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Enums and Types
type TransferStatus = 'draft' | 'pending' | 'approved' | 'in_transit' | 'received' | 'completed' | 'cancelled';
type TransferPriority = 'low' | 'normal' | 'high' | 'urgent';
type TransferType = 'standard' | 'replenishment' | 'returns' | 'consignment';

interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  address: string;
  contactName: string;
  contactPhone: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  variant?: string;
  image: string;
  category: string;
  unitCost: number;
  weight: number; // in kg
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  unitOfMeasure: string;
  isHazmat: boolean;
  isFragile: boolean;
  requiresColdStorage: boolean;
}

interface InventoryItem {
  id: string;
  productId: string;
  product: Product;
  warehouseId: string;
  warehouse: Warehouse;
  binLocation?: string;
  availableQty: number;
  reservedQty: number;
  onHandQty: number;
}

interface TransferLineItem {
  id: string;
  inventoryItemId: string;
  product: Product;
  sourceBin?: string;
  destinationBin?: string;
  quantityRequested: number;
  quantityShipped: number;
  quantityReceived: number;
  unitCost: number;
  totalWeight: number;
  totalVolume: number;
  status: 'pending' | 'picked' | 'packed' | 'shipped' | 'received' | 'damaged';
  notes?: string;
  serialNumbers?: string[];
  lotNumber?: string;
  expiryDate?: Date;
}

interface ShipmentInfo {
  carrier: string;
  trackingNumber: string;
  shippedAt?: Date;
  estimatedArrival?: Date;
  actualArrival?: Date;
  shippingCost: number;
  insuranceValue: number;
  packages: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  documents: ShipmentDocument[];
}

interface ShipmentDocument {
  id: string;
  type: 'bol' | 'invoice' | 'packing_list' | 'customs' | 'other';
  name: string;
  url: string;
  uploadedAt: Date;
}

interface StockTransfer {
  id: string;
  transferNumber: string;
  createdAt: Date;
  updatedAt: Date;
  type: TransferType;
  status: TransferStatus;
  priority: TransferPriority;
  
  sourceWarehouseId: string;
  sourceWarehouse: Warehouse;
  destinationWarehouseId: string;
  destinationWarehouse: Warehouse;
  
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  shippedBy?: string;
  receivedBy?: string;
  
  lineItems: TransferLineItem[];
  shipment?: ShipmentInfo;
  
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  totalWeight: number;
  totalVolume: number;
  
  notes?: string;
  internalNotes?: string;
  reason?: string;
  
  requiredBy?: Date;
  completedAt?: Date;
}

@Component({
  selector: 'app-stock-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './stock-transfers.html',
  styleUrl: './stock-transfers.scss'
})
export class StockTransfers implements OnInit {
  private fb = inject(FormBuilder);

  // View State
  activeView = signal<'list' | 'create' | 'detail' | 'ship' | 'receive'>('list');
  selectedTransfer = signal<StockTransfer | null>(null);
  currentStep = signal<1 | 2 | 3 | 4>(1);
  
  // Modal States
  showLineItemModal = signal(false);
  showShipModal = signal(false);
  showReceiveModal = signal(false);
  showApproveModal = signal(false);
  showCancelModal = signal(false);
  showDeleteModal = signal(false);
  showPrintModal = signal(false);
  
  // Editing State
  editingLineItem = signal<TransferLineItem | null>(null);
  selectedLineItemForReceive = signal<TransferLineItem | null>(null);
  
  // Filters
  searchQuery = signal('');
  filterStatus = signal<TransferStatus | 'all'>('all');
  filterType = signal<TransferType | 'all'>('all');
  filterSourceWarehouse = signal<string>('all');
  filterDestinationWarehouse = signal<string>('all');
  filterPriority = signal<TransferPriority | 'all'>('all');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');

  // Forms
  transferForm!: FormGroup;
  lineItemForm!: FormGroup;
  shipmentForm!: FormGroup;
  receiveForm!: FormGroup;

  // Mock Data - Warehouses
  warehouses = signal<Warehouse[]>([
    {
      id: '1',
      name: 'Main Distribution Center',
      code: 'WH-NYC-001',
      location: 'New York, NY',
      address: '450 Industrial Blvd, Brooklyn, NY 11222',
      contactName: 'Sarah Johnson',
      contactPhone: '+1 (555) 123-4567',
      isActive: true
    },
    {
      id: '2',
      name: 'West Coast Hub',
      code: 'WH-LA-002',
      location: 'Los Angeles, CA',
      address: '2200 Commerce Way, Commerce, CA 90040',
      contactName: 'Michael Chen',
      contactPhone: '+1 (555) 987-6543',
      isActive: true
    },
    {
      id: '3',
      name: 'South Distribution',
      code: 'WH-DAL-003',
      location: 'Dallas, TX',
      address: '8900 Logistics Pkwy, Dallas, TX 75235',
      contactName: 'Emily Rodriguez',
      contactPhone: '+1 (555) 456-7890',
      isActive: true
    },
    {
      id: '4',
      name: 'Chicago Facility',
      code: 'WH-CHI-004',
      location: 'Chicago, IL',
      address: '3400 Industrial Dr, Chicago, IL 60608',
      contactName: 'David Park',
      contactPhone: '+1 (555) 234-5678',
      isActive: true
    }
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
      weight: 0.3,
      dimensions: { length: 20, width: 15, height: 8 },
      unitOfMeasure: 'pcs',
      isHazmat: false,
      isFragile: false,
      requiresColdStorage: false
    },
    {
      id: 'p2',
      name: 'Smart Watch Series 5',
      sku: 'SW-S5-002',
      variant: 'Silver',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
      category: 'Electronics',
      unitCost: 120.00,
      weight: 0.05,
      dimensions: { length: 10, width: 8, height: 3 },
      unitOfMeasure: 'pcs',
      isHazmat: false,
      isFragile: true,
      requiresColdStorage: false
    },
    {
      id: 'p3',
      name: 'Organic Cotton T-Shirt',
      sku: 'OCT-001-BLK',
      variant: 'Black',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
      category: 'Clothing',
      unitCost: 12.00,
      weight: 0.2,
      dimensions: { length: 30, width: 25, height: 2 },
      unitOfMeasure: 'pcs',
      isHazmat: false,
      isFragile: false,
      requiresColdStorage: false
    },
    {
      id: 'p4',
      name: 'Running Shoes Pro',
      sku: 'RS-PRO-001',
      variant: 'Size 10',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
      category: 'Sports',
      unitCost: 35.00,
      weight: 0.8,
      dimensions: { length: 35, width: 20, height: 12 },
      unitOfMeasure: 'pairs',
      isHazmat: false,
      isFragile: false,
      requiresColdStorage: false
    },
    {
      id: 'p5',
      name: 'Leather Laptop Bag',
      sku: 'LLB-ES-001',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100',
      category: 'Accessories',
      unitCost: 55.00,
      weight: 1.2,
      dimensions: { length: 40, width: 30, height: 8 },
      unitOfMeasure: 'pcs',
      isHazmat: false,
      isFragile: false,
      requiresColdStorage: false
    },
    {
      id: 'p6',
      name: 'Premium Coffee Beans',
      sku: 'PCB-001-ORG',
      variant: 'Organic',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100',
      category: 'Food & Beverage',
      unitCost: 18.50,
      weight: 1.0,
      dimensions: { length: 25, width: 15, height: 10 },
      unitOfMeasure: 'kg',
      isHazmat: false,
      isFragile: false,
      requiresColdStorage: true
    }
  ]);

  // Mock Data - Inventory
  inventoryItems = signal<InventoryItem[]>([]);

  // Mock Data - Transfers
  transfers = signal<StockTransfer[]>([]);

  // Draft Transfer
  draftTransfer = signal<Partial<StockTransfer>>({
    type: 'standard',
    priority: 'normal',
    status: 'draft',
    lineItems: []
  });

  // Carriers
  carriers = signal([
    { id: 'fedex', name: 'FedEx', icon: 'bi-truck' },
    { id: 'ups', name: 'UPS', icon: 'bi-truck' },
    { id: 'usps', name: 'USPS', icon: 'bi-mailbox' },
    { id: 'dhl', name: 'DHL', icon: 'bi-airplane' },
    { id: 'internal', name: 'Internal Fleet', icon: 'bi-building' }
  ]);

  ngOnInit() {
    this.initializeInventory();
    this.initializeTransfers();
    this.initializeForms();
  }

  getAvailableSourceInventoryItem(){
    return this.availableSourceInventory().find(i => i.id === this.lineItemForm.get('inventoryItemId')?.value);
  }

  getDestinationWarehouse(){
    return this.warehouses().find(w => w.id === this.transferForm.get('destinationWarehouseId')?.value)?.name;
  }

  getSourceWarehouse(){
    return this.warehouses().find(w => w.id ===
                            this.transferForm.get('sourceWarehouseId')?.value)?.name;
  }

  getAvailableSourceAvaliableQty(item: TransferLineItem){
    return this.availableSourceInventory().find(i => i.id === item.inventoryItemId)?.availableQty || 0;
  }

  getSourceWarehouseName() {
    return this.warehouses().find(w => w.id === this.transferForm.get('sourceWarehouseId')?.value)?.name;
  }

  initializeInventory() {
    const items: InventoryItem[] = [];
    const warehouseIds = ['1', '2', '3', '4'];
    
    warehouseIds.forEach(whId => {
      this.products().forEach((prod, idx) => {
        items.push({
          id: `inv-${whId}-${prod.id}`,
          productId: prod.id,
          product: prod,
          warehouseId: whId,
          warehouse: this.warehouses().find(w => w.id === whId)!,
          binLocation: `${String.fromCharCode(65 + idx)}-${String(idx + 1).padStart(2, '0')}-${idx + 1}`,
          availableQty: Math.floor(Math.random() * 500) + 50,
          reservedQty: Math.floor(Math.random() * 50),
          onHandQty: Math.floor(Math.random() * 500) + 50
        });
      });
    });
    
    this.inventoryItems.set(items);
  }

  initializeTransfers() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    this.transfers.set([
      {
        id: 'trf-001',
        transferNumber: 'TRF-2024-001',
        createdAt: lastWeek,
        updatedAt: yesterday,
        type: 'replenishment',
        status: 'completed',
        priority: 'high',
        sourceWarehouseId: '1',
        sourceWarehouse: this.warehouses()[0],
        destinationWarehouseId: '2',
        destinationWarehouse: this.warehouses()[1],
        requestedBy: 'John Smith',
        approvedBy: 'Sarah Johnson',
        approvedAt: lastWeek,
        shippedBy: 'Mike Chen',
        receivedBy: 'Emily Rodriguez',
        lineItems: [
          {
            id: 'li-001',
            inventoryItemId: 'inv-1-p1',
            product: this.products()[0],
            sourceBin: 'A-01-1',
            destinationBin: 'R-01-5',
            quantityRequested: 100,
            quantityShipped: 100,
            quantityReceived: 100,
            unitCost: 45.00,
            totalWeight: 30,
            totalVolume: 24000,
            status: 'received'
          },
          {
            id: 'li-002',
            inventoryItemId: 'inv-1-p2',
            product: this.products()[1],
            sourceBin: 'B-02-1',
            destinationBin: 'R-02-3',
            quantityRequested: 50,
            quantityShipped: 50,
            quantityReceived: 50,
            unitCost: 120.00,
            totalWeight: 2.5,
            totalVolume: 1200,
            status: 'received'
          }
        ],
        shipment: {
          carrier: 'FedEx',
          trackingNumber: '7845123695',
          shippedAt: lastWeek,
          estimatedArrival: yesterday,
          actualArrival: yesterday,
          shippingCost: 125.00,
          insuranceValue: 8500.00,
          packages: 2,
          weight: 32.5,
          dimensions: { length: 48, width: 40, height: 36 },
          documents: []
        },
        totalItems: 2,
        totalQuantity: 150,
        totalValue: 10500.00,
        totalWeight: 32.5,
        totalVolume: 25200,
        notes: 'Monthly replenishment for West Coast Hub',
        internalNotes: 'Fragile items - handle with care',
        reason: 'Replenishment',
        requiredBy: yesterday,
        completedAt: yesterday
      },
      {
        id: 'trf-002',
        transferNumber: 'TRF-2024-002',
        createdAt: yesterday,
        updatedAt: yesterday,
        type: 'standard',
        status: 'in_transit',
        priority: 'normal',
        sourceWarehouseId: '1',
        sourceWarehouse: this.warehouses()[0],
        destinationWarehouseId: '3',
        destinationWarehouse: this.warehouses()[2],
        requestedBy: 'Sarah Johnson',
        approvedBy: 'Sarah Johnson',
        approvedAt: yesterday,
        shippedBy: 'John Smith',
        lineItems: [
          {
            id: 'li-003',
            inventoryItemId: 'inv-1-p4',
            product: this.products()[3],
            sourceBin: 'C-03-1',
            destinationBin: 'S-01-2',
            quantityRequested: 200,
            quantityShipped: 200,
            quantityReceived: 0,
            unitCost: 35.00,
            totalWeight: 160,
            totalVolume: 1680000,
            status: 'shipped'
          }
        ],
        shipment: {
          carrier: 'UPS',
          trackingNumber: '1Z999AA10123456784',
          shippedAt: yesterday,
          estimatedArrival: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          shippingCost: 245.00,
          insuranceValue: 7000.00,
          packages: 4,
          weight: 160,
          dimensions: { length: 48, width: 40, height: 48 },
          documents: []
        },
        totalItems: 1,
        totalQuantity: 200,
        totalValue: 7000.00,
        totalWeight: 160,
        totalVolume: 1680000,
        notes: 'Transfer to support Dallas promotion',
        reason: 'Stock Balancing',
        requiredBy: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'trf-003',
        transferNumber: 'TRF-2024-003',
        createdAt: now,
        updatedAt: now,
        type: 'returns',
        status: 'pending',
        priority: 'urgent',
        sourceWarehouseId: '2',
        sourceWarehouse: this.warehouses()[1],
        destinationWarehouseId: '1',
        destinationWarehouse: this.warehouses()[0],
        requestedBy: 'Emily Rodriguez',
        lineItems: [
          {
            id: 'li-004',
            inventoryItemId: 'inv-2-p1',
            product: this.products()[0],
            quantityRequested: 25,
            quantityShipped: 0,
            quantityReceived: 0,
            unitCost: 45.00,
            totalWeight: 7.5,
            totalVolume: 6000,
            status: 'pending',
            notes: 'Customer returns - quality check required'
          }
        ],
        totalItems: 1,
        totalQuantity: 25,
        totalValue: 1125.00,
        totalWeight: 7.5,
        totalVolume: 6000,
        notes: 'Return of defective units from LA facility',
        reason: 'Quality Control',
        requiredBy: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'trf-004',
        transferNumber: 'TRF-2024-004',
        createdAt: now,
        updatedAt: now,
        type: 'standard',
        status: 'draft',
        priority: 'normal',
        sourceWarehouseId: '3',
        sourceWarehouse: this.warehouses()[2],
        destinationWarehouseId: '4',
        destinationWarehouse: this.warehouses()[3],
        requestedBy: 'David Park',
        lineItems: [],
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
        totalWeight: 0,
        totalVolume: 0,
        notes: 'Draft transfer for Chicago opening'
      }
    ]);
  }

  initializeForms() {
    this.transferForm = this.fb.group({
      type: ['standard', Validators.required],
      priority: ['normal', Validators.required],
      sourceWarehouseId: ['', Validators.required],
      destinationWarehouseId: ['', Validators.required],
      requiredBy: ['', Validators.required],
      notes: [''],
      internalNotes: [''],
      reason: ['', Validators.required]
    });

    this.lineItemForm = this.fb.group({
      inventoryItemId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      destinationBin: [''],
      notes: ['']
    });

    this.shipmentForm = this.fb.group({
      carrier: ['', Validators.required],
      trackingNumber: ['', Validators.required],
      estimatedArrival: ['', Validators.required],
      shippingCost: [0, [Validators.required, Validators.min(0)]],
      insuranceValue: [0],
      packages: [1, [Validators.required, Validators.min(1)]],
      weight: [0, Validators.required],
      length: [0, Validators.required],
      width: [0, Validators.required],
      height: [0, Validators.required]
    });

    this.receiveForm = this.fb.group({
      quantityReceived: [0, [Validators.required, Validators.min(0)]],
          condition: ['good', Validators.required],
      notes: ['']
    });

    // Subscribe to warehouse changes to validate different warehouses
    this.transferForm.get('sourceWarehouseId')?.valueChanges.subscribe(() => {
      this.validateWarehouses();
    });
    this.transferForm.get('destinationWarehouseId')?.valueChanges.subscribe(() => {
      this.validateWarehouses();
    });
  }

  // Computed
  filteredTransfers = computed(() => {
    let result = this.transfers();
    
    if (this.filterStatus() !== 'all') {
      result = result.filter(t => t.status === this.filterStatus());
    }
    if (this.filterType() !== 'all') {
      result = result.filter(t => t.type === this.filterType());
    }
    if (this.filterSourceWarehouse() !== 'all') {
      result = result.filter(t => t.sourceWarehouseId === this.filterSourceWarehouse());
    }
    if (this.filterDestinationWarehouse() !== 'all') {
      result = result.filter(t => t.destinationWarehouseId === this.filterDestinationWarehouse());
    }
    if (this.filterPriority() !== 'all') {
      result = result.filter(t => t.priority === this.filterPriority());
    }
    
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(t => 
        t.transferNumber.toLowerCase().includes(query) ||
        t.notes?.toLowerCase().includes(query) ||
        t.requestedBy.toLowerCase().includes(query)
      );
    }
    
    return [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  stats = computed(() => {
    const transfers = this.transfers();
    return {
      total: transfers.length,
      draft: transfers.filter(t => t.status === 'draft').length,
      pending: transfers.filter(t => t.status === 'pending').length,
      inTransit: transfers.filter(t => t.status === 'in_transit').length,
      completed: transfers.filter(t => t.status === 'completed').length,
      totalValue: transfers.reduce((sum, t) => sum + t.totalValue, 0)
    };
  });

  draftLineItems = computed(() => (this.draftTransfer().lineItems as TransferLineItem[]) || []);
  
  draftSummary = computed(() => {
    const items = this.draftLineItems();
    return {
      count: items.length,
      totalQty: items.reduce((sum, i) => sum + i.quantityRequested, 0),
      totalValue: items.reduce((sum, i) => sum + (i.quantityRequested * i.unitCost), 0),
      totalWeight: items.reduce((sum, i) => sum + i.totalWeight, 0),
      totalVolume: items.reduce((sum, i) => sum + i.totalVolume, 0)
    };
  });

  availableSourceInventory = computed(() => {
    const sourceId = this.transferForm?.get('sourceWarehouseId')?.value;
    if (!sourceId) return [];
    return this.inventoryItems().filter(i => 
      i.warehouseId === sourceId && i.availableQty > 0
    );
  });

  // Validation
  validateWarehouses() {
    const source = this.transferForm.get('sourceWarehouseId')?.value;
    const dest = this.transferForm.get('destinationWarehouseId')?.value;
    
    if (source && dest && source === dest) {
      this.transferForm.get('destinationWarehouseId')?.setErrors({ sameWarehouse: true });
    }
  }

  // Navigation
  goToList() {
    this.activeView.set('list');
    this.selectedTransfer.set(null);
    this.currentStep.set(1);
  }

  startNewTransfer() {
    this.draftTransfer.set({
      type: 'standard',
      priority: 'normal',
      status: 'draft',
      lineItems: []
    });
    this.transferForm.reset({
      type: 'standard',
      priority: 'normal',
      sourceWarehouseId: '',
      destinationWarehouseId: '',
      requiredBy: '',
      notes: '',
      internalNotes: '',
      reason: ''
    });
    this.currentStep.set(1);
    this.activeView.set('create');
  }

  viewTransferDetail(transfer: StockTransfer) {
    this.selectedTransfer.set(transfer);
    this.activeView.set('detail');
  }

  // Step Navigation
  nextStep() {
    if (this.currentStep() < 4) {
      this.currentStep.update(s => (s + 1) as 1 | 2 | 3 | 4);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => (s - 1) as 1 | 2 | 3 | 4);
    }
  }

  // Line Item Management
  openAddLineItem() {
    this.editingLineItem.set(null);
    this.lineItemForm.reset({
      inventoryItemId: '',
      quantity: 1,
      destinationBin: '',
      notes: ''
    });
    this.showLineItemModal.set(true);
  }

  editLineItem(item: TransferLineItem) {
    this.editingLineItem.set(item);
    this.lineItemForm.patchValue({
      inventoryItemId: item.inventoryItemId,
      quantity: item.quantityRequested,
      destinationBin: item.destinationBin || '',
      notes: item.notes || ''
    });
    this.showLineItemModal.set(true);
  }

  saveLineItem() {
    if (this.lineItemForm.invalid) return;

    const formValue = this.lineItemForm.value;
    const inventoryItem = this.inventoryItems().find(i => i.id === formValue.inventoryItemId);
    
    if (!inventoryItem) return;

    const lineItem: TransferLineItem = {
      id: this.editingLineItem()?.id || `li-${Date.now()}`,
      inventoryItemId: inventoryItem.id,
      product: inventoryItem.product,
      sourceBin: inventoryItem.binLocation,
      destinationBin: formValue.destinationBin || undefined,
      quantityRequested: formValue.quantity,
      quantityShipped: 0,
      quantityReceived: 0,
      unitCost: inventoryItem.product.unitCost,
      totalWeight: inventoryItem.product.weight * formValue.quantity,
      totalVolume: this.calculateVolume(inventoryItem.product.dimensions) * formValue.quantity,
      status: 'pending',
      notes: formValue.notes
    };

    this.draftTransfer.update(trf => {
      const items = (trf.lineItems as TransferLineItem[]) || [];
      const existingIndex = items.findIndex(i => i.id === lineItem.id);
      
      let newItems;
      if (existingIndex >= 0) {
        newItems = [...items];
        newItems[existingIndex] = lineItem;
      } else {
        newItems = [...items, lineItem];
      }
      
      return { ...trf, lineItems: newItems };
    });

    this.showLineItemModal.set(false);
    this.editingLineItem.set(null);
  }

  removeLineItem(itemId: string) {
    this.draftTransfer.update(trf => ({
      ...trf,
      lineItems: ((trf.lineItems as TransferLineItem[]) || []).filter(i => i.id !== itemId)
    }));
  }

  calculateVolume(dimensions: { length: number; width: number; height: number }): number {
    return dimensions.length * dimensions.width * dimensions.height;
  }

  // Save Operations
  saveDraft() {
    const formValue = this.transferForm.value;
    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber: `TRF-${new Date().getFullYear()}-${String(this.transfers().length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: formValue.type,
      status: 'draft',
      priority: formValue.priority,
      sourceWarehouseId: formValue.sourceWarehouseId,
      sourceWarehouse: this.warehouses().find(w => w.id === formValue.sourceWarehouseId)!,
      destinationWarehouseId: formValue.destinationWarehouseId,
      destinationWarehouse: this.warehouses().find(w => w.id === formValue.destinationWarehouseId)!,
      requestedBy: 'Current User',
      lineItems: this.draftLineItems(),
      totalItems: this.draftLineItems().length,
      totalQuantity: this.draftSummary().totalQty,
      totalValue: this.draftSummary().totalValue,
      totalWeight: this.draftSummary().totalWeight,
      totalVolume: this.draftSummary().totalVolume,
      notes: formValue.notes,
      internalNotes: formValue.internalNotes,
      reason: formValue.reason,
      requiredBy: new Date(formValue.requiredBy)
    };

    this.transfers.update(list => [newTransfer, ...list]);
    this.goToList();
  }

  submitTransfer() {
    const formValue = this.transferForm.value;
    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber: `TRF-${new Date().getFullYear()}-${String(this.transfers().length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: formValue.type,
      status: 'pending',
      priority: formValue.priority,
      sourceWarehouseId: formValue.sourceWarehouseId,
      sourceWarehouse: this.warehouses().find(w => w.id === formValue.sourceWarehouseId)!,
      destinationWarehouseId: formValue.destinationWarehouseId,
      destinationWarehouse: this.warehouses().find(w => w.id === formValue.destinationWarehouseId)!,
      requestedBy: 'Current User',
      lineItems: this.draftLineItems(),
      totalItems: this.draftLineItems().length,
      totalQuantity: this.draftSummary().totalQty,
      totalValue: this.draftSummary().totalValue,
      totalWeight: this.draftSummary().totalWeight,
      totalVolume: this.draftSummary().totalVolume,
      notes: formValue.notes,
      internalNotes: formValue.internalNotes,
      reason: formValue.reason,
      requiredBy: new Date(formValue.requiredBy)
    };

    this.transfers.update(list => [newTransfer, ...list]);
    this.goToList();
  }

  // Approval & Workflow
  approveTransfer(transfer: StockTransfer) {
    this.selectedTransfer.set(transfer);
    this.showApproveModal.set(true);
  }

  confirmApproval() {
    const transfer = this.selectedTransfer();
    if (!transfer) return;

    this.transfers.update(list =>
      list.map(t => t.id === transfer.id ? {
        ...t,
        status: 'approved',
        approvedBy: 'Current User',
        approvedAt: new Date(),
        updatedAt: new Date()
      } : t)
    );

    this.showApproveModal.set(false);
    this.goToList();
  }

  cancelTransfer(transfer: StockTransfer) {
    this.selectedTransfer.set(transfer);
    this.showCancelModal.set(true);
  }

  confirmCancel() {
    const transfer = this.selectedTransfer();
    if (!transfer) return;

    this.transfers.update(list =>
      list.map(t => t.id === transfer.id ? {
        ...t,
        status: 'cancelled',
        updatedAt: new Date()
      } : t)
    );

    this.showCancelModal.set(false);
    this.goToList();
  }

  // Shipping
  openShipModal(transfer: StockTransfer) {
    this.selectedTransfer.set(transfer);
    this.shipmentForm.reset({
      carrier: '',
      trackingNumber: '',
      estimatedArrival: '',
      shippingCost: 0,
      insuranceValue: transfer.totalValue,
      packages: 1,
      weight: transfer.totalWeight,
      length: 48,
      width: 40,
      height: 36
    });
    this.showShipModal.set(true);
  }

  confirmShipment() {
    if (this.shipmentForm.invalid) return;
    
    const transfer = this.selectedTransfer();
    if (!transfer) return;

    const formValue = this.shipmentForm.value;
    
    const shipment: ShipmentInfo = {
      carrier: formValue.carrier,
      trackingNumber: formValue.trackingNumber,
      shippedAt: new Date(),
      estimatedArrival: new Date(formValue.estimatedArrival),
      shippingCost: formValue.shippingCost,
      insuranceValue: formValue.insuranceValue,
      packages: formValue.packages,
      weight: formValue.weight,
      dimensions: {
        length: formValue.length,
        width: formValue.width,
        height: formValue.height
      },
      documents: []
    };

    this.transfers.update(list =>
      list.map(t => t.id === transfer.id ? {
        ...t,
        status: 'in_transit',
        shippedBy: 'Current User',
        shipment: shipment,
        lineItems: t.lineItems.map(li => ({ ...li, status: 'shipped' as const })),
        updatedAt: new Date()
      } : t)
    );

    this.showShipModal.set(false);
    this.goToList();
  }

  // Receiving
  openReceiveModal(transfer: StockTransfer) {
    this.selectedTransfer.set(transfer);
    this.activeView.set('receive');
  }

  receiveLineItem(item: TransferLineItem) {
    this.selectedLineItemForReceive.set(item);
    this.receiveForm.reset({
      quantityReceived: item.quantityShipped,
      condition: 'good',
      notes: ''
    });
    this.showReceiveModal.set(true);
  }

  confirmReceipt() {
    if (this.receiveForm.invalid) return;
    
    const transfer = this.selectedTransfer();
    const lineItem = this.selectedLineItemForReceive();
    if (!transfer || !lineItem) return;

    const formValue = this.receiveForm.value;

    this.transfers.update(list =>
      list.map(t => {
        if (t.id !== transfer.id) return t;
        
        const updatedLineItems = t.lineItems.map(li => {
          if (li.id !== lineItem.id) return li;
          return {
            ...li,
            quantityReceived: formValue.quantityReceived,
            status: formValue.condition === 'damaged' ? 'damaged' as const : 'received' as const,
            notes: formValue.notes
          };
        });

        const allReceived = updatedLineItems.every(li => li.status === 'received' || li.status === 'damaged');
        
        return {
          ...t,
          lineItems: updatedLineItems,
          status: allReceived ? 'completed' as const : t.status,
          receivedBy: allReceived ? 'Current User' : t.receivedBy,
          completedAt: allReceived ? new Date() : t.completedAt,
          updatedAt: new Date()
        };
      })
    );

    this.showReceiveModal.set(false);
    this.selectedLineItemForReceive.set(null);
  }

  // Helper Methods
  getStatusColor(status: TransferStatus): string {
    const colors: Record<TransferStatus, string> = {
      'draft': 'bg-gray-100 text-gray-700 border-gray-200',
      'pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'approved': 'bg-blue-50 text-blue-700 border-blue-200',
      'in_transit': 'bg-purple-50 text-purple-700 border-purple-200',
      'received': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'completed': 'bg-green-50 text-green-700 border-green-200',
      'cancelled': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status];
  }

  getStatusIcon(status: TransferStatus): string {
    const icons: Record<TransferStatus, string> = {
      'draft': 'bi-pencil-square',
      'pending': 'bi-hourglass-split',
      'approved': 'bi-check-circle',
      'in_transit': 'bi-truck',
      'received': 'bi-box-seam',
      'completed': 'bi-check-all',
      'cancelled': 'bi-x-octagon'
    };
    return icons[status];
  }

  getTypeColor(type: TransferType): string {
    const colors: Record<TransferType, string> = {
      'standard': 'bg-blue-100 text-blue-700',
      'replenishment': 'bg-green-100 text-green-700',
      'returns': 'bg-orange-100 text-orange-700',
      'consignment': 'bg-purple-100 text-purple-700'
    };
    return colors[type];
  }

  getPriorityColor(priority: TransferPriority): string {
    const colors: Record<TransferPriority, string> = {
      'low': 'bg-gray-100 text-gray-600',
      'normal': 'bg-blue-100 text-blue-700',
      'high': 'bg-orange-100 text-orange-700',
      'urgent': 'bg-red-100 text-red-700 animate-pulse'
    };
    return colors[priority];
  }

  getLineItemStatusColor(status: TransferLineItem['status']): string {
    const colors: Record<string, string> = {
      'pending': 'bg-gray-100 text-gray-600',
      'picked': 'bg-blue-100 text-blue-700',
      'packed': 'bg-yellow-100 text-yellow-700',
      'shipped': 'bg-purple-100 text-purple-700',
      'received': 'bg-green-100 text-green-700',
      'damaged': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
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

  formatWeight(kg: number): string {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)} tons`;
    }
    return `${kg.toFixed(2)} kg`;
  }

  formatVolume(cm3: number): string {
    const m3 = cm3 / 1000000;
    if (m3 >= 1) {
      return `${m3.toFixed(2)} m³`;
    }
    const liters = cm3 / 1000;
    if (liters >= 1) {
      return `${liters.toFixed(2)} L`;
    }
    return `${cm3} cm³`;
  }

  isOverdue(transfer: StockTransfer): boolean {
    if (!transfer.requiredBy || transfer.status === 'completed' || transfer.status === 'cancelled') {
      return false;
    }
    return new Date() > transfer.requiredBy;
  }

  getDaysUntilRequired(transfer: StockTransfer): number {
    if (!transfer.requiredBy) return 0;
    const diff = transfer.requiredBy.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  protected readonly Math = Math;
}