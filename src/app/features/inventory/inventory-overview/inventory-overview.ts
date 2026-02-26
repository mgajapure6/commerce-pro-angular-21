// src/app/features/products/components/inventory/inventory.component.ts
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  variant?: string;
  image: string;
  category: string;
  supplier?: string;
  
  // Stock levels
  quantity: number;
  reserved: number;
  available: number;
  incoming: number;
  lowStockThreshold: number;
  
  // Locations
  warehouseId: string;
  warehouseName: string;
  binLocation?: string;
  
  // Tracking
  unitCost: number;
  totalValue: number;
  lastRestocked?: Date;
  lastCounted?: Date;
  nextCountDate?: Date;
  
  // Status
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock' | 'discontinued';
  trackInventory: boolean;
  
  // History
  adjustments: StockAdjustment[];
  movements: StockMovement[];
}

interface StockAdjustment {
  id: string;
  date: Date;
  type: 'add' | 'remove' | 'set';
  quantity: number;
  reason: string;
  adjustedBy: string;
  notes?: string;
}

interface StockMovement {
  id: string;
  date: Date;
  type: 'in' | 'out' | 'transfer';
  quantity: number;
  reference: string;
  referenceType: 'purchase' | 'sale' | 'return' | 'adjustment' | 'transfer';
  fromLocation?: string;
  toLocation?: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './inventory-overview.html',
  styleUrl: './inventory-overview.scss'
})
export class InventoryOverview {
  // View state
  showFilters = signal(false);
  showAdjustmentModal = signal(false);
  adjustmentItem = signal<InventoryItem | null>(null);
  adjustmentType = signal<'add' | 'remove' | 'set'>('add');
  adjustmentQuantity = signal<number | null>(null);
  adjustmentReason = signal('');
  adjustmentNotes = signal('');
  
  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(25);
  
  // Filters
  searchQuery = signal('');
  filterWarehouse = signal('');
  filterStatus = signal('');
  filterCategory = signal('');
  filterSupplier = signal('');
  filterMinValue = signal<number | null>(null);
  filterMaxValue = signal<number | null>(null);
  filterTracking = signal('');
  
  // Selection
  selectedItems = signal<string[]>([]);
  openMenuId = signal<string | null>(null);
  
  // Sort
  sortField = signal('quantity');
  sortDirection = signal<'asc' | 'desc'>('desc');
  
  // Data
  warehouses = signal<Warehouse[]>([
    { id: '1', name: 'Main Warehouse', location: 'New York, NY', isActive: true },
    { id: '2', name: 'West Coast Hub', location: 'Los Angeles, CA', isActive: true },
    { id: '3', name: 'South Distribution', location: 'Dallas, TX', isActive: true }
  ]);
  
  categories = signal(['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books']);
  suppliers = signal(['TechCorp', 'FashionHub', 'HomeGoods Inc', 'SportsPro', 'GlobalSupply']);
  
  inventoryItems = signal<InventoryItem[]>([
    {
      id: '1',
      productId: 'p1',
      productName: 'Wireless Bluetooth Headphones Pro',
      sku: 'WBH-PM-001',
      variant: 'Black',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
      category: 'Electronics',
      supplier: 'TechCorp',
      quantity: 150,
      reserved: 25,
      available: 125,
      incoming: 50,
      lowStockThreshold: 20,
      warehouseId: '1',
      warehouseName: 'Main Warehouse',
      binLocation: 'A-12-3',
      unitCost: 45.00,
      totalValue: 6750.00,
      lastRestocked: new Date('2024-02-15'),
      lastCounted: new Date('2024-02-01'),
      status: 'in-stock',
      trackInventory: true,
      adjustments: [],
      movements: []
    },
    {
      id: '2',
      productId: 'p2',
      productName: 'Smart Watch Series 5',
      sku: 'SW-S5-002',
      variant: 'Silver',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
      category: 'Electronics',
      supplier: 'TechCorp',
      quantity: 8,
      reserved: 3,
      available: 5,
      incoming: 0,
      lowStockThreshold: 10,
      warehouseId: '1',
      warehouseName: 'Main Warehouse',
      binLocation: 'A-12-5',
      unitCost: 120.00,
      totalValue: 960.00,
      lastRestocked: new Date('2024-01-20'),
      status: 'low-stock',
      trackInventory: true,
      adjustments: [],
      movements: []
    },
    {
      id: '3',
      productId: 'p3',
      productName: 'Organic Cotton T-Shirt',
      sku: 'OCT-001-BLK',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
      category: 'Clothing',
      supplier: 'FashionHub',
      quantity: 0,
      reserved: 0,
      available: 0,
      incoming: 100,
      lowStockThreshold: 15,
      warehouseId: '2',
      warehouseName: 'West Coast Hub',
      binLocation: 'B-05-2',
      unitCost: 12.00,
      totalValue: 0.00,
      status: 'out-of-stock',
      trackInventory: true,
      adjustments: [],
      movements: []
    },
    {
      id: '4',
      productId: 'p4',
      productName: 'Running Shoes Pro',
      sku: 'RS-PRO-001',
      variant: 'Size 10',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
      category: 'Sports',
      supplier: 'SportsPro',
      quantity: 500,
      reserved: 50,
      available: 450,
      incoming: 0,
      lowStockThreshold: 30,
      warehouseId: '1',
      warehouseName: 'Main Warehouse',
      binLocation: 'C-08-1',
      unitCost: 35.00,
      totalValue: 17500.00,
      lastRestocked: new Date('2024-02-18'),
      status: 'overstock',
      trackInventory: true,
      adjustments: [],
      movements: []
    },
    {
      id: '5',
      productId: 'p5',
      productName: 'Leather Laptop Bag',
      sku: 'LLB-ES-001',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100',
      category: 'Accessories',
      supplier: 'FashionHub',
      quantity: 45,
      reserved: 5,
      available: 40,
      incoming: 0,
      lowStockThreshold: 10,
      warehouseId: '3',
      warehouseName: 'South Distribution',
      binLocation: 'D-03-4',
      unitCost: 55.00,
      totalValue: 2475.00,
      status: 'in-stock',
      trackInventory: false,
      adjustments: [],
      movements: []
    }
  ]);
  
  alerts = signal([
    { id: '1', type: 'critical', title: '5 Products Out of Stock', message: 'These items need immediate restocking to avoid lost sales.' },
    { id: '2', type: 'warning', title: '12 Products Low on Stock', message: 'Consider placing purchase orders for these items soon.' },
    { id: '3', type: 'info', title: 'Incoming Shipment', message: '3 purchase orders with 250 units are arriving today.' }
  ]);

  // Computed
  filteredItems = computed(() => {
    let result = this.inventoryItems();
    
    // Search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(i => 
        i.productName.toLowerCase().includes(query) ||
        i.sku.toLowerCase().includes(query) ||
        i.supplier?.toLowerCase().includes(query)
      );
    }
    
    // Filters
    if (this.filterWarehouse()) {
      result = result.filter(i => i.warehouseId === this.filterWarehouse());
    }
    if (this.filterStatus()) {
      result = result.filter(i => i.status === this.filterStatus());
    }
    if (this.filterCategory()) {
      result = result.filter(i => i.category === this.filterCategory());
    }
    if (this.filterSupplier()) {
      result = result.filter(i => i.supplier === this.filterSupplier());
    }
    if (this.filterMinValue()) {
      result = result.filter(i => i.totalValue >= this.filterMinValue()!);
    }
    if (this.filterMaxValue()) {
      result = result.filter(i => i.totalValue <= this.filterMaxValue()!);
    }
    if (this.filterTracking()) {
      result = result.filter(i => i.trackInventory === (this.filterTracking() === 'tracked'));
    }
    
    // Sort
    result = [...result].sort((a, b) => {
      const field = this.sortField();
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      const aVal = a[field as keyof InventoryItem];
      const bVal = b[field as keyof InventoryItem];
  
      // Handle undefined/null consistently
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return -1 * dir;
      if (bVal == null) return 1 * dir;
  
      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        if (aVal < bVal) return -1 * dir;
        if (aVal > bVal) return 1 * dir;
        return 0;
      }
  
      // Date comparison
      if (aVal instanceof Date && bVal instanceof Date) {
        const aTime = aVal.getTime();
        const bTime = bVal.getTime();
        if (aTime < bTime) return -1 * dir;
        if (aTime > bTime) return 1 * dir;
        return 0;
      }
  
      // Fallback to string comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return -1 * dir;
      if (aStr > bStr) return 1 * dir;
      return 0;
    });
    
    return result;
  });
  
  paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredItems().slice(start, start + this.itemsPerPage());
  });
  
  totalPages = computed(() => Math.ceil(this.filteredItems().length / this.itemsPerPage()));
  
  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  });
  
  inventoryStats = computed(() => [
    { label: 'Total Items', value: this.inventoryItems().length, icon: 'bi-box-seam', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', subtext: 'Across all warehouses', filter: 'all' },
    { label: 'In Stock', value: this.inventoryItems().filter(i => i.status === 'in-stock').length, icon: 'bi-check-circle', bgColor: 'bg-green-100', iconColor: 'text-green-600', subtext: 'Ready to ship', filter: 'in-stock' },
    { label: 'Low Stock', value: this.inventoryItems().filter(i => i.status === 'low-stock').length, icon: 'bi-exclamation-triangle', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600', subtext: 'Needs reordering', filter: 'low-stock' },
    { label: 'Out of Stock', value: this.inventoryItems().filter(i => i.status === 'out-of-stock').length, icon: 'bi-x-circle', bgColor: 'bg-red-100', iconColor: 'text-red-600', subtext: 'No inventory', filter: 'out-of-stock' },
    { label: 'Overstock', value: this.inventoryItems().filter(i => i.status === 'overstock').length, icon: 'bi-arrow-up-circle', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', subtext: 'Excess inventory', filter: 'overstock' },
    { label: 'Not Tracked', value: this.inventoryItems().filter(i => !i.trackInventory).length, icon: 'bi-eye-slash', bgColor: 'bg-gray-100', iconColor: 'text-gray-600', subtext: 'Manual tracking', filter: 'untracked' }
  ]);
  
  totalInventoryValue = computed(() => 
    this.inventoryItems().reduce((sum, i) => sum + i.totalValue, 0)
  );
  
  totalUnits = computed(() => 
    this.inventoryItems().reduce((sum, i) => sum + i.quantity, 0)
  );
  
  totalIncoming = computed(() => 
    this.inventoryItems().reduce((sum, i) => sum + i.incoming, 0)
  );
  
  needsReorderCount = computed(() => 
    this.inventoryItems().filter(i => i.status === 'low-stock' || i.status === 'out-of-stock').length
  );
  
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchQuery()) count++;
    if (this.filterWarehouse()) count++;
    if (this.filterStatus()) count++;
    if (this.filterCategory()) count++;
    if (this.filterSupplier()) count++;
    if (this.filterMinValue() || this.filterMaxValue()) count++;
    if (this.filterTracking()) count++;
    return count;
  });
  
  isAllSelected = computed(() => {
    const visible = this.paginatedItems();
    return visible.length > 0 && visible.every(i => this.isSelected(i.id));
  });

  // Methods
  applyFilters() {
    this.currentPage.set(1);
  }
  
  clearFilters() {
    this.searchQuery.set('');
    this.filterWarehouse.set('');
    this.filterStatus.set('');
    this.filterCategory.set('');
    this.filterSupplier.set('');
    this.filterMinValue.set(null);
    this.filterMaxValue.set(null);
    this.filterTracking.set('');
    this.applyFilters();
  }
  
  applyQuickFilter(filter: string) {
    this.clearFilters();
    if (filter !== 'all') {
      if (filter === 'untracked') {
        this.filterTracking.set('untracked');
      } else {
        this.filterStatus.set(filter);
      }
    }
  }
  
  sort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }
  
  isSelected(id: string): boolean {
    return this.selectedItems().includes(id);
  }
  
  toggleSelection(id: string) {
    this.selectedItems.update(selected => {
      if (selected.includes(id)) {
        return selected.filter(s => s !== id);
      }
      return [...selected, id];
    });
  }
  
  toggleSelectAll() {
    const visible = this.paginatedItems().map(i => i.id);
    if (this.isAllSelected()) {
      this.selectedItems.update(selected => selected.filter(id => !visible.includes(id)));
    } else {
      this.selectedItems.update(selected => [...new Set([...selected, ...visible])]);
    }
  }
  
  toggleActionMenu(id: string) {
    this.openMenuId.update(current => current === id ? null : id);
  }
  
  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }
  
  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }
  
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }
  
  dismissAlert(id: string) {
    this.alerts.update(a => a.filter(alert => alert.id !== id));
  }
  
  // Actions
  quickAdjust(item: InventoryItem) {
    this.adjustmentItem.set(item);
    this.adjustmentType.set('add');
    this.adjustmentQuantity.set(null);
    this.adjustmentReason.set('');
    this.adjustmentNotes.set('');
    this.showAdjustmentModal.set(true);
  }
  
  openAdjustmentModal() {
    this.adjustmentItem.set(null);
    this.showAdjustmentModal.set(true);
  }
  
  closeAdjustmentModal() {
    this.showAdjustmentModal.set(false);
    this.adjustmentItem.set(null);
  }
  
  saveAdjustment() {
    const item = this.adjustmentItem();
    if (!item || !this.adjustmentQuantity() || !this.adjustmentReason()) return;
    
    const qty = this.adjustmentQuantity()!;
    const type = this.adjustmentType();
    
    // Update inventory
    this.inventoryItems.update(items => items.map(i => {
      if (i.id === item.id) {
        let newQuantity = i.quantity;
        if (type === 'add') newQuantity += qty;
        else if (type === 'remove') newQuantity = Math.max(0, newQuantity - qty);
        else if (type === 'set') newQuantity = qty;
        
        const newAvailable = newQuantity - i.reserved;
        let newStatus: InventoryItem['status'] = 'in-stock';
        if (newQuantity === 0) newStatus = 'out-of-stock';
        else if (newQuantity <= i.lowStockThreshold) newStatus = 'low-stock';
        else if (newQuantity > i.lowStockThreshold * 5) newStatus = 'overstock';
        
        return {
          ...i,
          quantity: newQuantity,
          available: Math.max(0, newAvailable),
          totalValue: newQuantity * i.unitCost,
          status: newStatus,
          lastCounted: new Date()
        };
      }
      return i;
    }));
    
    this.closeAdjustmentModal();
  }
  
  viewHistory(item: InventoryItem) {
    console.log('View history for:', item);
  }
  
  editItem(item: InventoryItem) {
    console.log('Edit item:', item);
  }
  
  transferStock(item: InventoryItem) {
    console.log('Transfer stock:', item);
  }
  
  setReorderPoint(item: InventoryItem) {
    console.log('Set reorder point:', item);
  }
  
  printLabel(item: InventoryItem) {
    console.log('Print label:', item);
  }
  
  // Bulk actions
  bulkAdjustStock() {
    console.log('Bulk adjust:', this.selectedItems());
  }
  
  bulkTransfer() {
    console.log('Bulk transfer:', this.selectedItems());
  }
  
  bulkSetThreshold() {
    console.log('Bulk set threshold:', this.selectedItems());
  }
  
  bulkExport() {
    console.log('Bulk export:', this.selectedItems());
  }
  
  // Other actions
  openCountModal() {
    console.log('Open stock count modal');
  }
  
  exportInventory() {
    console.log('Export inventory');
  }
  
  protected readonly Math = Math;
}