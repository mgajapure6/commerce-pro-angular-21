// order-refund.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface Refund {
  id: string;
  refundId: string;
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    avatar: string;
    type: 'new' | 'returning' | 'vip' | 'wholesale';
  };
  amount: number;
  originalAmount: number;
  type: 'full' | 'partial' | 'store_credit';
  method: 'original_payment' | 'store_credit' | 'bank_transfer' | 'paypal';
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'rejected';
  reason: string;
  reasonDetails?: string;
  requestedAt: Date;
  approvedAt?: Date;
  processedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  processedBy?: string;
  priority: 'normal' | 'high' | 'urgent';
  items?: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    reason?: string;
  }[];
}

@Component({
  selector: 'app-order-refund',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './order-refund.html',
  styleUrl: './order-refund.scss'
})
export class OrderRefund implements OnInit {
  readonly Math: typeof Math = Math;

  // View State
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  selectedRefunds = signal<string[]>([]);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(25);

  // Filters
  searchQuery = signal('');
  filterStatus = signal<string>('');
  filterType = signal<string>('');
  filterMethod = signal<string>('');
  filterPriority = signal<string>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterMinAmount = signal<number | null>(null);
  filterMaxAmount = signal<number | null>(null);

  // Sorting
  sortField = signal<string>('requestedAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Refunds Data
  refunds = signal<Refund[]>([]);

  exportItems: DropdownItem[] = [
    { id: 'csv', label: 'Export as CSV', icon: 'filetype-csv' },
    { id: 'excel', label: 'Export as Excel', icon: 'filetype-xlsx' },
    { id: 'pdf', label: 'Export as PDF', icon: 'filetype-pdf' }
  ];

  ngOnInit() {
    this.loadRefunds();
  }

  loadRefunds() {
    this.refunds.set([
      {
        id: 'ref_001',
        refundId: 'REF-2024-001',
        orderId: 'ord_011',
        orderNumber: 'ORD-2024-011',
        customer: {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        amount: 299.99,
        originalAmount: 299.99,
        type: 'full',
        method: 'original_payment',
        status: 'completed',
        reason: 'customer_request',
        reasonDetails: 'Changed mind',
        requestedAt: new Date('2024-01-16T10:30:00'),
        approvedAt: new Date('2024-01-16T11:00:00'),
        processedAt: new Date('2024-01-16T14:30:00'),
        processedBy: 'Agent Smith',
        priority: 'normal'
      },
      {
        id: 'ref_002',
        refundId: 'REF-2024-002',
        orderId: 'ord_012',
        orderNumber: 'ORD-2024-012',
        customer: {
          name: 'Michael Chen',
          email: 'michael.c@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        amount: 149.99,
        originalAmount: 149.99,
        type: 'full',
        method: 'original_payment',
        status: 'pending',
        reason: 'out_of_stock',
        requestedAt: new Date('2024-01-16T09:15:00'),
        priority: 'high',
        items: [
          { productId: 'prod_022', name: 'Mechanical Keyboard', quantity: 1, price: 149.99 }
        ]
      },
      {
        id: 'ref_003',
        refundId: 'REF-2024-003',
        orderId: 'ord_015',
        orderNumber: 'ORD-2024-015',
        customer: {
          name: 'Lisa Anderson',
          email: 'lisa.a@example.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        amount: 124.99,
        originalAmount: 249.99,
        type: 'partial',
        method: 'store_credit',
        status: 'processing',
        reason: 'damaged_item',
        reasonDetails: 'Item arrived damaged',
        requestedAt: new Date('2024-01-15T16:45:00'),
        approvedAt: new Date('2024-01-15T17:30:00'),
        priority: 'urgent',
        items: [
          { productId: 'prod_026', name: 'Designer Handbag', quantity: 1, price: 249.99, reason: 'Damaged zipper' }
        ]
      },
      {
        id: 'ref_004',
        refundId: 'REF-2024-004',
        orderId: 'ord_016',
        orderNumber: 'ORD-2024-016',
        customer: {
          name: 'Robert Taylor',
          email: 'robert.t@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        amount: 199.99,
        originalAmount: 199.99,
        type: 'full',
        method: 'original_payment',
        status: 'failed',
        reason: 'customer_request',
        requestedAt: new Date('2024-01-16T13:20:00'),
        approvedAt: new Date('2024-01-16T14:00:00'),
        failedAt: new Date('2024-01-16T14:15:00'),
        failureReason: 'Card expired',
        priority: 'high'
      },
      {
        id: 'ref_005',
        refundId: 'REF-2024-005',
        orderId: 'ord_018',
        orderNumber: 'ORD-2024-018',
        customer: {
          name: 'David Brown',
          email: 'david.b@example.com',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        amount: 1499.99,
        originalAmount: 1499.99,
        type: 'full',
        method: 'original_payment',
        status: 'approved',
        reason: 'out_of_stock',
        requestedAt: new Date('2024-01-15T15:30:00'),
        approvedAt: new Date('2024-01-15T16:00:00'),
        priority: 'urgent'
      },
      {
        id: 'ref_006',
        refundId: 'REF-2024-006',
        orderId: 'ord_019',
        orderNumber: 'ORD-2024-019',
        customer: {
          name: 'Jennifer Martinez',
          email: 'jennifer.m@example.com',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        amount: 79.99,
        originalAmount: 79.99,
        type: 'store_credit',
        method: 'store_credit',
        status: 'completed',
        reason: 'wrong_size',
        requestedAt: new Date('2024-01-14T11:00:00'),
        approvedAt: new Date('2024-01-14T12:00:00'),
        processedAt: new Date('2024-01-14T12:30:00'),
        priority: 'normal'
      },
      {
        id: 'ref_007',
        refundId: 'REF-2024-007',
        orderId: 'ord_020',
        orderNumber: 'ORD-2024-020',
        customer: {
          name: 'Amanda White',
          email: 'amanda.w@example.com',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        amount: 189.99,
        originalAmount: 189.99,
        type: 'full',
        method: 'paypal',
        status: 'rejected',
        reason: 'fraudulent',
        requestedAt: new Date('2024-01-16T08:00:00'),
        priority: 'high'
      },
      {
        id: 'ref_008',
        refundId: 'REF-2024-008',
        orderId: 'ord_021',
        orderNumber: 'ORD-2024-021',
        customer: {
          name: 'Thomas Garcia',
          email: 'thomas.g@example.com',
          avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        amount: 89.50,
        originalAmount: 179.00,
        type: 'partial',
        method: 'original_payment',
        status: 'pending',
        reason: 'not_as_described',
        requestedAt: new Date('2024-01-16T10:00:00'),
        priority: 'normal',
        items: [
          { productId: 'prod_030', name: 'Bluetooth Speaker', quantity: 1, price: 89.99 },
          { productId: 'prod_031', name: 'Charging Cable', quantity: 1, price: 12.99 }
        ]
      }
    ]);
  }

  // Computed Properties
  filteredRefunds = computed(() => {
    let result = this.refunds();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(r =>
        r.refundId.toLowerCase().includes(query) ||
        r.orderNumber.toLowerCase().includes(query) ||
        r.customer.name.toLowerCase().includes(query) ||
        r.customer.email.toLowerCase().includes(query)
      );
    }

    if (this.filterStatus()) {
      result = result.filter(r => r.status === this.filterStatus());
    }

    if (this.filterType()) {
      result = result.filter(r => r.type === this.filterType());
    }

    if (this.filterMethod()) {
      result = result.filter(r => r.method === this.filterMethod());
    }

    if (this.filterPriority()) {
      result = result.filter(r => r.priority === this.filterPriority());
    }

    if (this.filterDateFrom()) {
      result = result.filter(r => r.requestedAt >= new Date(this.filterDateFrom()));
    }
    if (this.filterDateTo()) {
      result = result.filter(r => r.requestedAt <= new Date(this.filterDateTo()));
    }

    if (this.filterMinAmount()) {
      result = result.filter(r => r.amount >= this.filterMinAmount()!);
    }
    if (this.filterMaxAmount()) {
      result = result.filter(r => r.amount <= this.filterMaxAmount()!);
    }

    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (this.sortField()) {
        case 'refundId': aVal = a.refundId; bVal = b.refundId; break;
        case 'customer': aVal = a.customer.name; bVal = b.customer.name; break;
        case 'amount': aVal = a.amount; bVal = b.amount; break;
        default: aVal = a.requestedAt; bVal = b.requestedAt;
      }

      if (this.sortDirection() === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  });

  paginatedRefunds = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredRefunds().slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() => Math.ceil(this.filteredRefunds().length / this.itemsPerPage()));

  highPriorityRefunds = computed(() =>
    this.refunds().filter(r => r.priority === 'urgent' && r.status !== 'completed')
  );

  highPriorityAmount = computed(() =>
    this.highPriorityRefunds().reduce((sum, r) => sum + r.amount, 0)
  );

  refundStats = computed(() => [
    {
      label: 'Pending',
      value: this.refunds().filter(r => r.status === 'pending').length.toString(),
      trend: -12.5,
      icon: 'hourglass',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      filter: 'pending'
    },
    {
      label: 'Processing',
      value: this.refunds().filter(r => r.status === 'processing').length.toString(),
      trend: 8.2,
      icon: 'arrow-repeat',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      filter: 'processing'
    },
    {
      label: 'Completed',
      value: this.refunds().filter(r => r.status === 'completed').length.toString(),
      trend: 24.3,
      icon: 'check-circle',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      filter: 'completed'
    },
    {
      label: 'Failed',
      value: this.refunds().filter(r => r.status === 'failed').length.toString(),
      trend: -5.1,
      icon: 'x-circle',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      filter: 'failed'
    },
    {
      label: 'Total Value',
      value: '$' + this.refunds().reduce((sum, r) => sum + r.amount, 0).toFixed(2),
      trend: 15.8,
      icon: 'cash-stack',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      filter: 'value'
    },
    {
      label: 'Avg Time',
      value: this.getAverageProcessingTime(),
      trend: -18.4,
      icon: 'clock-history',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      filter: 'time'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterStatus()) count++;
    if (this.filterType()) count++;
    if (this.filterMethod()) count++;
    if (this.filterPriority()) count++;
    if (this.filterDateFrom() || this.filterDateTo()) count++;
    if (this.filterMinAmount() || this.filterMaxAmount()) count++;
    return count;
  });

  selectedQuickFilter = signal<string>('');

  // Helper Methods
  getAverageProcessingTime(): string {
    const completed = this.refunds().filter(r => r.requestedAt && r.processedAt);
    if (completed.length === 0) return '0h';

    const totalHours = completed.reduce((sum, r) => {
      const diff = r.processedAt!.getTime() - r.requestedAt.getTime();
      return sum + (diff / (1000 * 60 * 60));
    }, 0);

    const avg = totalHours / completed.length;
    if (avg < 1) return Math.round(avg * 60) + 'm';
    return Math.round(avg) + 'h';
  }

  getRefundPercentage(refund: Refund): string {
    return Math.round((refund.amount / refund.originalAmount) * 100).toString();
  }

  getDaysPending(refund: Refund): number {
    const diff = new Date().getTime() - refund.requestedAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // Action Methods
  toggleFilters() { this.showFilters.update(v => !v); }
  toggleViewMode() { this.viewMode.update(v => v === 'table' ? 'grid' : 'table'); }

  getRefundMenuItems(refund: Refund): DropdownItem[] {
    const items: DropdownItem[] = [
      { id: 'details', label: 'View Details', icon: 'eye' },
      { id: 'history', label: 'Refund History', icon: 'clock-history' }
    ];

    if (refund.status === 'pending') {
      items.push(
        { id: 'approve', label: 'Approve Refund', icon: 'check-lg' },
        { id: 'reject', label: 'Reject Refund', icon: 'x-lg', danger: true }
      );
    }

    if (refund.status === 'approved') {
      items.push({ id: 'process', label: 'Process Refund', icon: 'arrow-repeat' });
    }

    if (refund.status === 'failed') {
      items.push({ id: 'retry', label: 'Retry Refund', icon: 'arrow-clockwise' });
    }

    items.push(
      { id: 'divider', label: '', divider: true },
      { id: 'notes', label: 'Add Notes', icon: 'sticky' }
    );

    return items;
  }

  onExport(item: DropdownItem) { console.log('Export', item.id); }

  onRefundAction(item: DropdownItem, refund: Refund) {
    switch (item.id) {
      case 'details': this.viewRefundDetails(refund); break;
      case 'approve': this.approveRefund(refund); break;
      case 'reject': this.rejectRefund(refund); break;
      case 'process': this.processRefund(refund); break;
      case 'retry': this.retryRefund(refund); break;
    }
  }

  toggleSelection(refundId: string) {
    this.selectedRefunds.update(selected =>
      selected.includes(refundId)
        ? selected.filter(id => id !== refundId)
        : [...selected, refundId]
    );
  }

  isSelected(refundId: string) { return this.selectedRefunds().includes(refundId); }

  isAllSelected() {
    return this.paginatedRefunds().length > 0 && this.paginatedRefunds().every(r => this.isSelected(r.id));
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedRefunds.set([]);
    } else {
      this.selectedRefunds.set(this.paginatedRefunds().map(r => r.id));
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

    if (filter === 'pending') {
      this.filterStatus.set('pending');
    } else if (filter === 'processing') {
      this.filterStatus.set('processing');
    } else if (filter === 'completed') {
      this.filterStatus.set('completed');
    } else if (filter === 'failed') {
      this.filterStatus.set('failed');
    }
  }

  clearAllFilters() {
    this.filterStatus.set('');
    this.filterType.set('');
    this.filterMethod.set('');
    this.filterPriority.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterMinAmount.set(null);
    this.filterMaxAmount.set(null);
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  // Status Helpers
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-blue-100 text-blue-700',
      processing: 'bg-indigo-100 text-indigo-700',
      completed: 'bg-emerald-100 text-emerald-700',
      failed: 'bg-red-100 text-red-700',
      rejected: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusDot(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500 status-pending',
      approved: 'bg-blue-500',
      processing: 'bg-indigo-500',
      completed: 'bg-emerald-500',
      failed: 'bg-red-500',
      rejected: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      full: 'bg-emerald-100 text-emerald-700',
      partial: 'bg-amber-100 text-amber-700',
      store_credit: 'bg-purple-100 text-purple-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      full: 'cash-stack',
      partial: 'cash',
      store_credit: 'credit-card'
    };
    return icons[type] || 'question-circle';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      full: 'Full Refund',
      partial: 'Partial',
      store_credit: 'Store Credit'
    };
    return labels[type] || type;
  }

  getMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      original_payment: 'credit-card',
      store_credit: 'wallet2',
      bank_transfer: 'bank',
      paypal: 'paypal'
    };
    return icons[method] || 'cash';
  }

  getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      original_payment: 'Original Payment',
      store_credit: 'Store Credit',
      bank_transfer: 'Bank Transfer',
      paypal: 'PayPal'
    };
    return labels[method] || method;
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      normal: 'text-gray-500',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || 'text-gray-500';
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
  bulkApprove() {
    console.log('Approving', this.selectedRefunds().length, 'refunds');
    this.refunds.update(refunds =>
      refunds.map(r => this.selectedRefunds().includes(r.id) && r.status === 'pending'
        ? { ...r, status: 'approved' as const, approvedAt: new Date() }
        : r)
    );
  }

  bulkProcess() {
    console.log('Processing', this.selectedRefunds().length, 'refunds');
    this.refunds.update(refunds =>
      refunds.map(r => this.selectedRefunds().includes(r.id) && r.status === 'approved'
        ? { ...r, status: 'processing' as const }
        : r)
    );
  }

  bulkReject() {
    console.log('Rejecting', this.selectedRefunds().length, 'refunds');
    this.refunds.update(refunds =>
      refunds.map(r => this.selectedRefunds().includes(r.id) && r.status === 'pending'
        ? { ...r, status: 'rejected' as const }
        : r)
    );
  }

  // Individual Actions
  viewRefundDetails(refund: Refund) { console.log('View details', refund.refundId); }

  approveRefund(refund: Refund) {
    console.log('Approving refund', refund.refundId);
    this.refunds.update(refunds =>
      refunds.map(r => r.id === refund.id ? { ...r, status: 'approved' as const, approvedAt: new Date() } : r)
    );
  }

  rejectRefund(refund: Refund) {
    console.log('Rejecting refund', refund.refundId);
    this.refunds.update(refunds =>
      refunds.map(r => r.id === refund.id ? { ...r, status: 'rejected' as const } : r)
    );
  }

  processRefund(refund: Refund) {
    console.log('Processing refund', refund.refundId);
    this.refunds.update(refunds =>
      refunds.map(r => r.id === refund.id ? { ...r, status: 'processing' as const } : r)
    );
  }

  retryRefund(refund: Refund) {
    console.log('Retrying refund', refund.refundId);
    this.refunds.update(refunds =>
      refunds.map(r => r.id === refund.id ? { ...r, status: 'processing' as const, failureReason: undefined } : r)
    );
  }

  processHighPriority() { console.log('Processing high priority refunds'); }
  showRefundAnalytics() { console.log('Showing refund analytics'); }

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