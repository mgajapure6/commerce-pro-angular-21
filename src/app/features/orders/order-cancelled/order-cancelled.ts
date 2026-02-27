// order-cancelled.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface CancelledOrder {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    avatar: string;
    type: 'new' | 'returning' | 'vip' | 'wholesale';
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    image: string;
  }[];
  total: number;
  reason: 'customer_request' | 'out_of_stock' | 'payment_failed' | 'fraudulent' | 'shipping_issue' | 'other';
  reasonDetails?: string;
  cancelledAt: Date;
  cancelledBy?: string;
  isAutoCancel: boolean;
  refundStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'not_required';
  refundAmount?: number;
  refundMethod?: 'original_payment' | 'store_credit' | 'bank_transfer';
  originalStatus: 'pending' | 'processing' | 'shipped';
}

@Component({
  selector: 'app-order-cancelled',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './order-cancelled.html',
  styleUrl: './order-cancelled.scss'
})
export class OrderCancelled implements OnInit {
  readonly Math: typeof Math = Math;

  // View State
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  selectedOrders = signal<string[]>([]);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(25);

  // Filters
  searchQuery = signal('');
  filterReason = signal<string>('');
  filterRefundStatus = signal<string>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterMinAmount = signal<number | null>(null);
  filterMaxAmount = signal<number | null>(null);
  filterAutoCancel = signal<boolean | null>(null);

  // Sorting
  sortField = signal<string>('cancelledAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Orders Data
  orders = signal<CancelledOrder[]>([]);

  exportItems: DropdownItem[] = [
    { id: 'csv', label: 'Export as CSV', icon: 'filetype-csv' },
    { id: 'excel', label: 'Export as Excel', icon: 'filetype-xlsx' },
    { id: 'pdf', label: 'Export as PDF', icon: 'filetype-pdf' }
  ];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orders.set([
      {
        id: 'can_001',
        orderId: 'ord_011',
        orderNumber: 'ORD-2024-011',
        customer: {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_021', name: 'Wireless Headphones Pro', quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop' }
        ],
        total: 299.99,
        reason: 'customer_request',
        reasonDetails: 'Customer changed mind',
        cancelledAt: new Date('2024-01-16T10:30:00'),
        cancelledBy: 'Support Agent',
        isAutoCancel: false,
        refundStatus: 'completed',
        refundAmount: 299.99,
        refundMethod: 'original_payment',
        originalStatus: 'pending'
      },
      {
        id: 'can_002',
        orderId: 'ord_012',
        orderNumber: 'ORD-2024-012',
        customer: {
          name: 'Michael Chen',
          email: 'michael.c@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_022', name: 'Mechanical Keyboard RGB', quantity: 1, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=150&h=150&fit=crop' }
        ],
        total: 149.99,
        reason: 'out_of_stock',
        reasonDetails: 'Supplier shortage',
        cancelledAt: new Date('2024-01-15T14:20:00'),
        isAutoCancel: true,
        refundStatus: 'pending',
        refundAmount: 149.99,
        originalStatus: 'processing'
      },
      {
        id: 'can_003',
        orderId: 'ord_013',
        orderNumber: 'ORD-2024-013',
        customer: {
          name: 'Emma Davis',
          email: 'emma.d@example.com',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          { productId: 'prod_023', name: 'Smart Watch Series 5', quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop' },
          { productId: 'prod_024', name: 'Watch Band', quantity: 1, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=150&h=150&fit=crop' }
        ],
        total: 449.98,
        reason: 'payment_failed',
        cancelledAt: new Date('2024-01-16T09:15:00'),
        isAutoCancel: true,
        refundStatus: 'not_required',
        originalStatus: 'pending'
      },
      {
        id: 'can_004',
        orderId: 'ord_014',
        orderNumber: 'ORD-2024-014',
        customer: {
          name: 'James Wilson',
          email: 'james.w@example.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_025', name: 'Running Shoes Pro', quantity: 2, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop' }
        ],
        total: 259.98,
        reason: 'fraudulent',
        reasonDetails: 'Suspicious activity detected',
        cancelledAt: new Date('2024-01-14T16:45:00'),
        cancelledBy: 'System',
        isAutoCancel: true,
        refundStatus: 'failed',
        originalStatus: 'processing'
      },
      {
        id: 'can_005',
        orderId: 'ord_015',
        orderNumber: 'ORD-2024-015',
        customer: {
          name: 'Lisa Anderson',
          email: 'lisa.a@example.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_026', name: 'Designer Handbag', quantity: 1, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop' }
        ],
        total: 249.99,
        reason: 'shipping_issue',
        reasonDetails: 'Address undeliverable',
        cancelledAt: new Date('2024-01-15T11:30:00'),
        cancelledBy: 'Shipping Dept',
        isAutoCancel: false,
        refundStatus: 'processing',
        refundAmount: 249.99,
        refundMethod: 'original_payment',
        originalStatus: 'shipped'
      },
      {
        id: 'can_006',
        orderId: 'ord_016',
        orderNumber: 'ORD-2024-016',
        customer: {
          name: 'Robert Taylor',
          email: 'robert.t@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          { productId: 'prod_027', name: 'Coffee Maker', quantity: 1, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=150&h=150&fit=crop' }
        ],
        total: 199.99,
        reason: 'customer_request',
        cancelledAt: new Date('2024-01-16T13:20:00'),
        isAutoCancel: false,
        refundStatus: 'pending',
        refundAmount: 199.99,
        originalStatus: 'pending'
      },
      {
        id: 'can_007',
        orderId: 'ord_017',
        orderNumber: 'ORD-2024-017',
        customer: {
          name: 'Jennifer Martinez',
          email: 'jennifer.m@example.com',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_028', name: 'Yoga Mat', quantity: 1, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=150&h=150&fit=crop' }
        ],
        total: 79.99,
        reason: 'other',
        reasonDetails: 'Duplicate order placed',
        cancelledAt: new Date('2024-01-15T08:45:00'),
        cancelledBy: 'Customer Service',
        isAutoCancel: false,
        refundStatus: 'completed',
        refundAmount: 79.99,
        refundMethod: 'store_credit',
        originalStatus: 'pending'
      },
      {
        id: 'can_008',
        orderId: 'ord_018',
        orderNumber: 'ORD-2024-018',
        customer: {
          name: 'David Brown',
          email: 'david.b@example.com',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_029', name: 'Gaming Laptop', quantity: 1, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150&h=150&fit=crop' }
        ],
        total: 1499.99,
        reason: 'out_of_stock',
        cancelledAt: new Date('2024-01-14T15:30:00'),
        isAutoCancel: true,
        refundStatus: 'processing',
        refundAmount: 1499.99,
        originalStatus: 'processing'
      }
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
        o.customer.email.toLowerCase().includes(query)
      );
    }

    if (this.filterReason()) {
      result = result.filter(o => o.reason === this.filterReason());
    }

    if (this.filterRefundStatus()) {
      result = result.filter(o => o.refundStatus === this.filterRefundStatus());
    }

    if (this.filterDateFrom()) {
      result = result.filter(o => o.cancelledAt >= new Date(this.filterDateFrom()));
    }
    if (this.filterDateTo()) {
      result = result.filter(o => o.cancelledAt <= new Date(this.filterDateTo()));
    }

    if (this.filterMinAmount()) {
      result = result.filter(o => o.total >= this.filterMinAmount()!);
    }
    if (this.filterMaxAmount()) {
      result = result.filter(o => o.total <= this.filterMaxAmount()!);
    }

    if (this.filterAutoCancel() !== null) {
      result = result.filter(o => o.isAutoCancel === this.filterAutoCancel());
    }

    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (this.sortField()) {
        case 'orderNumber': aVal = a.orderNumber; bVal = b.orderNumber; break;
        case 'customer': aVal = a.customer.name; bVal = b.customer.name; break;
        case 'total': aVal = a.total; bVal = b.total; break;
        default: aVal = a.cancelledAt; bVal = b.cancelledAt;
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

  pendingRefunds = computed(() => this.orders().filter(o => o.refundStatus === 'pending'));

  pendingRefundAmount = computed(() =>
    this.pendingRefunds().reduce((sum, o) => sum + (o.refundAmount || 0), 0)
  );

  cancellationStats = computed(() => [
    {
      label: 'Today',
      value: this.orders().filter(o => this.isToday(o.cancelledAt)).length.toString(),
      trend: 15.2,
      icon: 'calendar-event',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      filter: 'today'
    },
    {
      label: 'This Week',
      value: this.orders().filter(o => this.isThisWeek(o.cancelledAt)).length.toString(),
      trend: 8.5,
      icon: 'calendar-week',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      filter: 'week'
    },
    {
      label: 'Customer Req',
      value: this.orders().filter(o => o.reason === 'customer_request').length.toString(),
      trend: -5.2,
      icon: 'person-x',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      filter: 'customer_request'
    },
    {
      label: 'Out of Stock',
      value: this.orders().filter(o => o.reason === 'out_of_stock').length.toString(),
      trend: 12.3,
      icon: 'box-seam',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      filter: 'out_of_stock'
    },
    {
      label: 'Pending Refunds',
      value: this.pendingRefunds().length.toString(),
      trend: 3.1,
      icon: 'credit-card',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      filter: 'pending_refunds'
    },
    {
      label: 'Total Value',
      value: '$' + this.orders().reduce((sum, o) => sum + o.total, 0).toFixed(2),
      trend: 18.4,
      icon: 'cash-stack',
      bgColor: 'bg-rose-100',
      iconColor: 'text-rose-600',
      filter: 'value'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterReason()) count++;
    if (this.filterRefundStatus()) count++;
    if (this.filterDateFrom() || this.filterDateTo()) count++;
    if (this.filterMinAmount() || this.filterMaxAmount()) count++;
    if (this.filterAutoCancel() !== null) count++;
    return count;
  });

  selectedQuickFilter = signal<string>('');

  // Helper Methods
  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isThisWeek(date: Date): boolean {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }

  // Action Methods
  toggleFilters() { this.showFilters.update(v => !v); }
  toggleViewMode() { this.viewMode.update(v => v === 'table' ? 'grid' : 'table'); }

  getOrderMenuItems(order: CancelledOrder): DropdownItem[] {
    const items: DropdownItem[] = [
      { id: 'details', label: 'View Details', icon: 'eye' },
      { id: 'history', label: 'Order History', icon: 'clock-history' }
    ];

    if (order.refundStatus === 'pending') {
      items.push({ id: 'process_refund', label: 'Process Refund', icon: 'credit-card' });
    }

    items.push(
      { id: 'restore', label: 'Restore Order', icon: 'arrow-counterclockwise' },
      { id: 'divider', label: '', divider: true },
      { id: 'archive', label: 'Archive Order', icon: 'archive' }
    );

    return items;
  }

  onExport(item: DropdownItem) { console.log('Export', item.id); }

  onOrderAction(item: DropdownItem, order: CancelledOrder) {
    switch (item.id) {
      case 'details': this.viewCancellationDetails(order); break;
      case 'process_refund': this.processRefund(order); break;
      case 'restore': this.restoreOrder(order); break;
      case 'archive': this.archiveOrder(order); break;
    }
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

    const today = new Date().toISOString().split('T')[0];

    if (filter === 'today') {
      this.filterDateFrom.set(today);
      this.filterDateTo.set(today);
    } else if (filter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      this.filterDateFrom.set(weekAgo);
      this.filterDateTo.set(today);
    } else if (filter === 'customer_request') {
      this.filterReason.set('customer_request');
    } else if (filter === 'out_of_stock') {
      this.filterReason.set('out_of_stock');
    } else if (filter === 'pending_refunds') {
      this.filterRefundStatus.set('pending');
    }
  }

  clearAllFilters() {
    this.filterReason.set('');
    this.filterRefundStatus.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterMinAmount.set(null);
    this.filterMaxAmount.set(null);
    this.filterAutoCancel.set(null);
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  // Status Helpers
  getReasonColor(reason: string): string {
    const colors: Record<string, string> = {
      customer_request: 'bg-blue-100 text-blue-700',
      out_of_stock: 'bg-amber-100 text-amber-700',
      payment_failed: 'bg-red-100 text-red-700',
      fraudulent: 'bg-purple-100 text-purple-700',
      shipping_issue: 'bg-orange-100 text-orange-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[reason] || 'bg-gray-100 text-gray-700';
  }

  getReasonIcon(reason: string): string {
    const icons: Record<string, string> = {
      customer_request: 'person-x',
      out_of_stock: 'box-seam',
      payment_failed: 'credit-card-x',
      fraudulent: 'shield-exclamation',
      shipping_issue: 'truck-flatbed',
      other: 'question-circle'
    };
    return icons[reason] || 'question-circle';
  }

  getReasonLabel(reason: string): string {
    const labels: Record<string, string> = {
      customer_request: 'Customer Request',
      out_of_stock: 'Out of Stock',
      payment_failed: 'Payment Failed',
      fraudulent: 'Fraudulent',
      shipping_issue: 'Shipping Issue',
      other: 'Other'
    };
    return labels[reason] || reason;
  }

  getRefundStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      not_required: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  }

  getRefundStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'hourglass',
      processing: 'arrow-repeat',
      completed: 'check-circle',
      failed: 'x-circle',
      not_required: 'dash'
    };
    return icons[status] || 'question-circle';
  }

  getRefundStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      not_required: 'Not Required'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Bulk Actions
  bulkProcessRefunds() { console.log('Processing refunds for', this.selectedOrders().length, 'orders'); }
  bulkRestoreOrders() { console.log('Restoring', this.selectedOrders().length, 'orders'); }
  bulkArchive() { console.log('Archiving', this.selectedOrders().length, 'orders'); }

  // Individual Actions
  viewCancellationDetails(order: CancelledOrder) { console.log('View details', order.orderNumber); }
  processRefund(order: CancelledOrder) {
    console.log('Processing refund for', order.orderNumber);
    this.orders.update(orders =>
      orders.map(o => o.id === order.id ? { ...o, refundStatus: 'processing' as const } : o)
    );
  }
  restoreOrder(order: CancelledOrder) { console.log('Restoring order', order.orderNumber); }
  archiveOrder(order: CancelledOrder) { console.log('Archiving order', order.orderNumber); }
  processPendingRefunds() { console.log('Processing all pending refunds'); }
  showAnalytics() { console.log('Showing analytics'); }

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