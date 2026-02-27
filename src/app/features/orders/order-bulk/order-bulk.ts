// order-bulk.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface BulkOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    avatar: string;
    type: 'new' | 'returning' | 'vip' | 'b2b';
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'ready_to_ship' | 'shipped' | 'on_hold' | 'payment_pending';
  shippingMethod: 'standard' | 'express' | 'overnight' | 'pickup';
  trackingNumber?: string;
  invoiceCreated: boolean;
  shipmentCreated: boolean;
  paymentStatus: 'paid' | 'pending' | 'failed';
  processingLocked: boolean;
  createdAt: Date;
  tags: string[];
}

interface ProcessingLog {
  id: string;
  message: string;
  icon: string;
  color: string;
  timestamp: Date;
}

interface BatchTemplate {
  id: string;
  name: string;
  filters: {
    status?: string;
    action?: string;
    shippingMethod?: string;
  };
  count: number;
}

@Component({
  selector: 'app-order-bulk',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './order-bulk.html',
  styleUrl: './order-bulk.scss'
})
export class OrderBulk implements OnInit {
  readonly Math: typeof Math = Math;

  // View State
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  showProcessingLog = signal(false);
  selectedOrders = signal<string[]>([]);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(25);

  // Filters
  searchQuery = signal('');
  filterStatus = signal<string>('');
  filterAction = signal<string>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterMinAmount = signal<number | null>(null);
  filterMaxAmount = signal<number | null>(null);
  filterShippingMethod = signal<string>('');

  // Sorting
  sortField = signal<string>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Data
  orders = signal<BulkOrder[]>([]);
  processingLogs = signal<ProcessingLog[]>([]);
  savedTemplates = signal<BatchTemplate[]>([]);

  // Dropdown Items
  statusUpdateItems: DropdownItem[] = [
    { id: 'pending', label: 'Set Pending', icon: 'clock' },
    { id: 'processing', label: 'Set Processing', icon: 'gear' },
    { id: 'ready_to_ship', label: 'Set Ready to Ship', icon: 'box-seam' },
    { id: 'shipped', label: 'Set Shipped', icon: 'truck' },
    { id: 'on_hold', label: 'Set On Hold', icon: 'pause-circle' }
  ];

  moreActionItems: DropdownItem[] = [
    { id: 'print_packing_slips', label: 'Print Packing Slips', icon: 'file-text' },
    { id: 'print_pick_list', label: 'Print Pick List', icon: 'list-check' },
    { id: 'export_csv', label: 'Export to CSV', icon: 'filetype-csv' },
    { id: 'assign_tags', label: 'Assign Tags', icon: 'tags' },
    { id: 'divider', label: '', divider: true },
    { id: 'archive', label: 'Archive Orders', icon: 'archive' }
  ];

  ngOnInit() {
    this.loadOrders();
    this.loadTemplates();
  }

  loadOrders() {
    this.orders.set([
      {
        id: 'ord_001',
        orderNumber: 'ORD-2024-001',
        customer: {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_001', name: 'Wireless Headphones Pro', quantity: 1, price: 299.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop' }
        ],
        total: 368.97,
        status: 'pending',
        shippingMethod: 'express',
        invoiceCreated: false,
        shipmentCreated: false,
        paymentStatus: 'paid',
        processingLocked: false,
        createdAt: new Date('2024-01-15T10:30:00'),
        tags: ['vip', 'express']
      },
      {
        id: 'ord_002',
        orderNumber: 'ORD-2024-002',
        customer: {
          name: 'Michael Chen',
          email: 'michael.c@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          type: 'b2b'
        },
        items: [
          { productId: 'prod_003', name: 'Mechanical Keyboard RGB', quantity: 5, price: 129.99, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=150&h=150&fit=crop' }
        ],
        total: 714.95,
        status: 'processing',
        shippingMethod: 'standard',
        invoiceCreated: true,
        shipmentCreated: false,
        paymentStatus: 'paid',
        processingLocked: false,
        createdAt: new Date('2024-01-14T09:15:00'),
        tags: ['b2b', 'bulk']
      },
      {
        id: 'ord_003',
        orderNumber: 'ORD-2024-003',
        customer: {
          name: 'Emma Davis',
          email: 'emma.d@example.com',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          { productId: 'prod_004', name: 'Smart Watch Series 5', quantity: 1, price: 399.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop' }
        ],
        total: 454.99,
        status: 'ready_to_ship',
        shippingMethod: 'express',
        invoiceCreated: true,
        shipmentCreated: false,
        paymentStatus: 'paid',
        processingLocked: false,
        createdAt: new Date('2024-01-15T14:20:00'),
        tags: ['fragile']
      },
      {
        id: 'ord_004',
        orderNumber: 'ORD-2024-004',
        customer: {
          name: 'James Wilson',
          email: 'james.w@example.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_007', name: 'Running Shoes Pro', quantity: 1, price: 129.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop' }
        ],
        total: 187.97,
        status: 'shipped',
        shippingMethod: 'standard',
        trackingNumber: '1Z999AA10123456784',
        invoiceCreated: true,
        shipmentCreated: true,
        paymentStatus: 'paid',
        processingLocked: false,
        createdAt: new Date('2024-01-10T11:45:00'),
        tags: ['sports']
      },
      {
        id: 'ord_005',
        orderNumber: 'ORD-2024-005',
        customer: {
          name: 'Lisa Anderson',
          email: 'lisa.a@example.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_009', name: 'Leather Handbag', quantity: 1, price: 249.99, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop' }
        ],
        total: 393.98,
        status: 'payment_pending',
        shippingMethod: 'overnight',
        invoiceCreated: false,
        shipmentCreated: false,
        paymentStatus: 'pending',
        processingLocked: true,
        createdAt: new Date('2024-01-15T16:00:00'),
        tags: ['vip', 'fashion']
      }
    ]);
  }

  loadTemplates() {
    this.savedTemplates.set([
      { id: 'tpl_001', name: 'Ready to Invoice', filters: { status: 'pending', action: 'create_invoice' }, count: 12 },
      { id: 'tpl_002', name: 'Ready to Ship', filters: { status: 'ready_to_ship', action: 'generate_shipment' }, count: 8 },
      { id: 'tpl_003', name: 'VIP Orders', filters: { status: 'processing' }, count: 5 },
      { id: 'tpl_004', name: 'B2B Bulk', filters: { shippingMethod: 'standard' }, count: 3 }
    ]);
  }

  // Computed Properties
  filteredOrders = computed(() => {
    let result = this.orders();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customer.name.toLowerCase().includes(query) ||
        o.customer.email.toLowerCase().includes(query) ||
        o.items.some(i => i.name.toLowerCase().includes(query))
      );
    }

    if (this.filterStatus()) {
      result = result.filter(o => o.status === this.filterStatus());
    }

    if (this.filterAction()) {
      result = result.filter(o => this.isActionAvailable(o, this.filterAction()));
    }

    if (this.filterDateFrom()) {
      result = result.filter(o => o.createdAt >= new Date(this.filterDateFrom()));
    }
    if (this.filterDateTo()) {
      result = result.filter(o => o.createdAt <= new Date(this.filterDateTo()));
    }

    if (this.filterMinAmount()) {
      result = result.filter(o => o.total >= this.filterMinAmount()!);
    }
    if (this.filterMaxAmount()) {
      result = result.filter(o => o.total <= this.filterMaxAmount()!);
    }

    if (this.filterShippingMethod()) {
      result = result.filter(o => o.shippingMethod === this.filterShippingMethod());
    }

    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (this.sortField()) {
        case 'orderNumber': aVal = a.orderNumber; bVal = b.orderNumber; break;
        case 'customer': aVal = a.customer.name; bVal = b.customer.name; break;
        case 'total': aVal = a.total; bVal = b.total; break;
        default: aVal = a.createdAt; bVal = b.createdAt;
      }

      if (this.sortDirection() === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  });

  paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredOrders().slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() => Math.ceil(this.filteredOrders().length / this.itemsPerPage()));

  selectedOrdersTotal = computed(() =>
    this.orders()
      .filter(o => this.selectedOrders().includes(o.id))
      .reduce((sum, o) => sum + o.total, 0)
  );

  selectedOrdersPreview = computed(() =>
    this.orders().filter(o => this.selectedOrders().includes(o.id)).slice(0, 5)
  );

  readyForProcessing = computed(() =>
    this.orders().filter(o =>
      (o.status === 'pending' || o.status === 'ready_to_ship') &&
      !o.processingLocked &&
      o.paymentStatus === 'paid'
    )
  );

  processingStats = computed(() => [
    {
      label: 'Pending',
      value: this.orders().filter(o => o.status === 'pending').length.toString(),
      trend: -5.2,
      icon: 'clock',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      filter: 'pending'
    },
    {
      label: 'Processing',
      value: this.orders().filter(o => o.status === 'processing').length.toString(),
      trend: 12.5,
      icon: 'gear',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      filter: 'processing'
    },
    {
      label: 'Ready to Ship',
      value: this.orders().filter(o => o.status === 'ready_to_ship').length.toString(),
      trend: 8.3,
      icon: 'box-seam',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      filter: 'ready_to_ship'
    },
    {
      label: 'Shipped',
      value: this.orders().filter(o => o.status === 'shipped').length.toString(),
      trend: 15.7,
      icon: 'truck',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      filter: 'shipped'
    },
    {
      label: 'Need Invoice',
      value: this.orders().filter(o => !o.invoiceCreated && o.paymentStatus === 'paid').length.toString(),
      trend: -12.1,
      icon: 'receipt',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      filter: 'need_invoice'
    },
    {
      label: 'Need Shipment',
      value: this.orders().filter(o => o.status === 'ready_to_ship' && !o.shipmentCreated).length.toString(),
      trend: 6.8,
      icon: 'package',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      filter: 'need_shipment'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterStatus()) count++;
    if (this.filterAction()) count++;
    if (this.filterDateFrom() || this.filterDateTo()) count++;
    if (this.filterMinAmount() || this.filterMaxAmount()) count++;
    if (this.filterShippingMethod()) count++;
    return count;
  });

  selectedQuickFilter = signal<string>('');

  // Helper Methods
  isActionAvailable(order: BulkOrder, action: string): boolean {
    switch (action) {
      case 'create_invoice': return !order.invoiceCreated && order.paymentStatus === 'paid';
      case 'generate_shipment': return order.status === 'ready_to_ship' && !order.shipmentCreated;
      case 'print_labels': return order.status === 'ready_to_ship' || order.status === 'shipped';
      case 'update_status': return true;
      case 'send_notification': return true;
      default: return false;
    }
  }

  getAvailableActions(order: BulkOrder): { id: string; label: string; icon: string; color: string }[] {
    const actions: { id: string; label: string; icon: string; color: string }[] = [];

    if (!order.invoiceCreated && order.paymentStatus === 'paid') {
      actions.push({ id: 'invoice', label: 'Invoice', icon: 'receipt', color: 'bg-indigo-100 text-indigo-700' });
    }
    if (order.status === 'ready_to_ship' && !order.shipmentCreated) {
      actions.push({ id: 'ship', label: 'Ship', icon: 'box-seam', color: 'bg-emerald-100 text-emerald-700' });
    }
    if (order.status === 'pending' && order.paymentStatus === 'paid') {
      actions.push({ id: 'process', label: 'Process', icon: 'gear', color: 'bg-blue-100 text-blue-700' });
    }
    if (!order.trackingNumber && order.status !== 'pending') {
      actions.push({ id: 'track', label: 'Tracking', icon: 'geo-alt', color: 'bg-amber-100 text-amber-700' });
    }

    return actions;
  }

  canCreateInvoice(order: BulkOrder): boolean {
    return !order.invoiceCreated && order.paymentStatus === 'paid';
  }

  canCreateShipment(order: BulkOrder): boolean {
    return order.status === 'ready_to_ship' && !order.shipmentCreated;
  }

  // Action Methods
  toggleFilters() { this.showFilters.update(v => !v); }
  toggleViewMode() { this.viewMode.update(v => v === 'table' ? 'grid' : 'table'); }
  toggleProcessingLog() { this.showProcessingLog.update(v => !v); }

  getOrderMenuItems(order: BulkOrder): DropdownItem[] {
    const items: DropdownItem[] = [
      { id: 'view', label: 'View Order', icon: 'eye' },
      { id: 'edit', label: 'Edit Order', icon: 'pencil' }
    ];

    if (this.canCreateInvoice(order)) {
      items.push({ id: 'create_invoice', label: 'Create Invoice', icon: 'receipt' });
    }
    if (this.canCreateShipment(order)) {
      items.push({ id: 'create_shipment', label: 'Create Shipment', icon: 'box-seam' });
    }

    items.push(
      { id: 'print_packing', label: 'Print Packing Slip', icon: 'file-text' },
      { id: 'divider', label: '', divider: true },
      { id: 'hold', label: 'Put On Hold', icon: 'pause-circle' },
      { id: 'cancel', label: 'Cancel Order', icon: 'x-circle', danger: true }
    );

    return items;
  }

  onOrderAction(item: DropdownItem, order: BulkOrder) {
    switch (item.id) {
      case 'create_invoice': this.quickInvoice(order); break;
      case 'create_shipment': this.quickShip(order); break;
      case 'hold': this.putOnHold(order); break;
    }
  }

  onMoreAction(item: DropdownItem) {
    console.log('More action:', item.id);
  }

  toggleSelection(orderId: string) {
    this.selectedOrders.update(selected =>
      selected.includes(orderId)
        ? selected.filter(id => id !== orderId)
        : [...selected, orderId]
    );
  }

  isSelected(orderId: string) { return this.selectedOrders().includes(orderId); }

  isAllSelected() {
    return this.paginatedOrders().length > 0 && this.paginatedOrders().every(o => this.isSelected(o.id));
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedOrders.set([]);
    } else {
      this.selectedOrders.set(this.paginatedOrders().map(o => o.id));
    }
  }

  selectAllReady() {
    this.selectedOrders.set(this.readyForProcessing().map(o => o.id));
  }

  sort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  applyQuickFilter(filter: string) {
    this.selectedQuickFilter.set(filter);
    this.clearAllFilters();

    if (filter === 'pending') {
      this.filterStatus.set('pending');
    } else if (filter === 'processing') {
      this.filterStatus.set('processing');
    } else if (filter === 'ready_to_ship') {
      this.filterStatus.set('ready_to_ship');
    } else if (filter === 'shipped') {
      this.filterStatus.set('shipped');
    } else if (filter === 'need_invoice') {
      this.filterAction.set('create_invoice');
    } else if (filter === 'need_shipment') {
      this.filterAction.set('generate_shipment');
    }
  }

  clearAllFilters() {
    this.filterStatus.set('');
    this.filterAction.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterMinAmount.set(null);
    this.filterMaxAmount.set(null);
    this.filterShippingMethod.set('');
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  applyTemplate(template: BatchTemplate) {
    this.clearAllFilters();
    if (template.filters.status) this.filterStatus.set(template.filters.status);
    if (template.filters.action) this.filterAction.set(template.filters.action);
    if (template.filters.shippingMethod) this.filterShippingMethod.set(template.filters.shippingMethod);
  }

  saveCurrentFilter() {
    const newTemplate: BatchTemplate = {
      id: `tpl_${Date.now()}`,
      name: `Custom Filter ${this.savedTemplates().length + 1}`,
      filters: {
        status: this.filterStatus() || undefined,
        action: this.filterAction() || undefined,
        shippingMethod: this.filterShippingMethod() || undefined
      },
      count: this.filteredOrders().length
    };
    this.savedTemplates.update(templates => [...templates, newTemplate]);
  }

  // Status Helpers
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      ready_to_ship: 'bg-emerald-100 text-emerald-700',
      shipped: 'bg-purple-100 text-purple-700',
      on_hold: 'bg-orange-100 text-orange-700',
      payment_pending: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusDot(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500',
      processing: 'bg-blue-500',
      ready_to_ship: 'bg-emerald-500',
      shipped: 'bg-purple-500',
      on_hold: 'bg-orange-500',
      payment_pending: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-400';
  }

  // Bulk Actions
  bulkCreateInvoices() {
    this.addLog(`Creating invoices for ${this.selectedOrders().length} orders`, 'receipt', 'text-indigo-600');
    this.orders.update(orders =>
      orders.map(o => this.selectedOrders().includes(o.id) ? { ...o, invoiceCreated: true } : o)
    );
  }

  bulkPrintInvoices() {
    this.addLog(`Printing invoices for ${this.selectedOrders().length} orders`, 'printer', 'text-gray-600');
  }

  bulkCreateShipments() {
    this.addLog(`Creating shipments for ${this.selectedOrders().length} orders`, 'box-seam', 'text-emerald-600');
    this.orders.update(orders =>
      orders.map(o => this.selectedOrders().includes(o.id) ? { ...o, shipmentCreated: true, status: 'shipped' as const } : o)
    );
  }

  bulkPrintLabels() {
    this.addLog(`Printing shipping labels for ${this.selectedOrders().length} orders`, 'upc', 'text-blue-600');
  }

  bulkAddTracking() {
    this.addLog(`Adding tracking numbers to ${this.selectedOrders().length} orders`, 'geo-alt', 'text-amber-600');
  }

  bulkUpdateStatus(item: DropdownItem) {
    this.addLog(`Updating status to "${item.label}" for ${this.selectedOrders().length} orders`, 'arrow-repeat', 'text-indigo-600');
    this.orders.update(orders =>
      orders.map(o => this.selectedOrders().includes(o.id) ? { ...o, status: item.id as any } : o)
    );
  }

  bulkSendEmail() {
    this.addLog(`Sending email notifications to ${this.selectedOrders().length} customers`, 'envelope', 'text-blue-600');
  }

  bulkSendSms() {
    this.addLog(`Sending SMS notifications to ${this.selectedOrders().length} customers`, 'chat-dots', 'text-green-600');
  }

  bulkExport() {
    this.addLog(`Exporting ${this.selectedOrders().length} orders to CSV`, 'download', 'text-gray-600');
  }

  // Quick Actions
  quickInvoice(order: BulkOrder) {
    this.addLog(`Created invoice for ${order.orderNumber}`, 'receipt', 'text-indigo-600');
    this.orders.update(orders =>
      orders.map(o => o.id === order.id ? { ...o, invoiceCreated: true } : o)
    );
  }

  quickShip(order: BulkOrder) {
    this.addLog(`Created shipment for ${order.orderNumber}`, 'box-seam', 'text-emerald-600');
    this.orders.update(orders =>
      orders.map(o => o.id === order.id ? { ...o, shipmentCreated: true, status: 'shipped' as const } : o)
    );
  }

  putOnHold(order: BulkOrder) {
    this.addLog(`Put ${order.orderNumber} on hold`, 'pause-circle', 'text-orange-600');
    this.orders.update(orders =>
      orders.map(o => o.id === order.id ? { ...o, status: 'on_hold' as const } : o)
    );
  }

  // Logs
  addLog(message: string, icon: string, color: string) {
    const log: ProcessingLog = {
      id: `log_${Date.now()}`,
      message,
      icon,
      color,
      timestamp: new Date()
    };
    this.processingLogs.update(logs => [log, ...logs].slice(0, 50));
  }

  // Navigation
  showProcessingHistory() { console.log('Showing processing history'); }
  showBatchTemplates() { console.log('Showing batch templates'); }

  // Pagination
  previousPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  goToPage(page: number) { this.currentPage.set(page); }

  visiblePages(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    return pages;
  }
}