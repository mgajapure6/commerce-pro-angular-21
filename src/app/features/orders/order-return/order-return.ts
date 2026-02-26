import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from './../../../shared/components/dropdown/dropdown';

interface ReturnItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  reason: string;
  condition: 'unopened' | 'opened' | 'damaged' | 'defective';
}

interface OrderReturned {
  id: string;
  returnNumber: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    avatar: string;
    type: 'new' | 'returning' | 'vip';
  };
  items: ReturnItem[];
  status: 'requested' | 'approved' | 'rejected' | 'received' | 'inspecting' | 'refunded' | 'completed' | 'cancelled';
  returnReason: string;
  returnMethod: 'refund' | 'exchange' | 'store_credit';
  refundAmount: number;
  originalOrderTotal: number;
  shippingLabel?: string;
  trackingNumber?: string;
  requestedAt: Date;
  updatedAt: Date;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
}

@Component({
  selector: 'app-order-return',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './order-return.html'
})
export class OrderReturn implements OnInit {
  // expose global Math for template
  readonly Math: typeof Math = Math;
  // View State
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  selectedReturns = signal<string[]>([]);
  expandedReturn = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(25);

  // Filters
  searchQuery = signal('');
  filterStatus = signal<string>('');
  filterReturnMethod = signal<string>('');
  filterPriority = signal<string>('');
  filterCondition = signal<string>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterMinAmount = signal<number | null>(null);
  filterMaxAmount = signal<number | null>(null);

  // Sorting
  sortField = signal<string>('requestedAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Data
  returns = signal<OrderReturned[]>([]);

  ngOnInit() {
    this.loadReturns();
  }

  loadReturns() {
    this.returns.set([
      {
        id: 'ret_001',
        returnNumber: 'RET-2024-001',
        orderNumber: 'ORD-2024-001',
        customer: {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          {
            productId: 'prod_001',
            name: 'Wireless Headphones Pro',
            quantity: 1,
            price: 299.99,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
            reason: 'Defective - no sound in left ear',
            condition: 'defective'
          }
        ],
        status: 'received',
        returnReason: 'defective',
        returnMethod: 'refund',
        refundAmount: 299.99,
        originalOrderTotal: 368.97,
        shippingLabel: 'LBL-789456123',
        trackingNumber: 'TRK-RET-001',
        requestedAt: new Date('2024-01-16T09:30:00'),
        updatedAt: new Date('2024-01-18T14:20:00'),
        priority: 'high',
        assignedTo: 'Mike Returns'
      },
      {
        id: 'ret_002',
        returnNumber: 'RET-2024-002',
        orderNumber: 'ORD-2024-003',
        customer: {
          name: 'Emma Davis',
          email: 'emma.d@example.com',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          {
            productId: 'prod_004',
            name: 'Smart Watch Series 5',
            quantity: 1,
            price: 399.99,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop',
            reason: 'Wrong size - band too small',
            condition: 'unopened'
          }
        ],
        status: 'approved',
        returnReason: 'wrong_size',
        returnMethod: 'exchange',
        refundAmount: 0,
        originalOrderTotal: 488.56,
        requestedAt: new Date('2024-01-17T11:15:00'),
        updatedAt: new Date('2024-01-17T16:45:00'),
        priority: 'medium',
        assignedTo: 'Lisa Support'
      },
      {
        id: 'ret_003',
        returnNumber: 'RET-2024-003',
        orderNumber: 'ORD-2024-005',
        customer: {
          name: 'Lisa Anderson',
          email: 'lisa.a@example.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          {
            productId: 'prod_009',
            name: 'Leather Handbag',
            quantity: 1,
            price: 249.99,
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop',
            reason: 'Not as described - color different',
            condition: 'opened'
          },
          {
            productId: 'prod_010',
            name: 'Designer Scarf',
            quantity: 1,
            price: 89.99,
            image: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa33?w=150&h=150&fit=crop',
            reason: 'Changed mind',
            condition: 'unopened'
          }
        ],
        status: 'inspecting',
        returnReason: 'not_as_described',
        returnMethod: 'refund',
        refundAmount: 339.98,
        originalOrderTotal: 393.98,
        shippingLabel: 'LBL-456789123',
        trackingNumber: 'TRK-RET-003',
        requestedAt: new Date('2024-01-18T08:00:00'),
        updatedAt: new Date('2024-01-19T10:30:00'),
        priority: 'urgent',
        notes: 'VIP customer - prioritize inspection',
        assignedTo: 'Mike Returns'
      },
      {
        id: 'ret_004',
        returnNumber: 'RET-2024-004',
        orderNumber: 'ORD-2024-007',
        customer: {
          name: 'Jennifer Martinez',
          email: 'jennifer.m@example.com',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          {
            productId: 'prod_013',
            name: 'Yoga Mat Premium',
            quantity: 1,
            price: 79.99,
            image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=150&h=150&fit=crop',
            reason: 'Damaged in shipping - torn edge',
            condition: 'damaged'
          }
        ],
        status: 'requested',
        returnReason: 'damaged',
        returnMethod: 'refund',
        refundAmount: 79.99,
        originalOrderTotal: 158.47,
        requestedAt: new Date('2024-01-19T16:45:00'),
        updatedAt: new Date('2024-01-19T16:45:00'),
        priority: 'high'
      },
      {
        id: 'ret_005',
        returnNumber: 'RET-2024-005',
        orderNumber: 'ORD-2024-002',
        customer: {
          name: 'Michael Chen',
          email: 'michael.c@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          {
            productId: 'prod_003',
            name: 'Mechanical Keyboard RGB',
            quantity: 1,
            price: 149.99,
            image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=150&h=150&fit=crop',
            reason: 'Missing keycaps - incomplete product',
            condition: 'defective'
          }
        ],
        status: 'rejected',
        returnReason: 'incomplete',
        returnMethod: 'refund',
        refundAmount: 0,
        originalOrderTotal: 174.99,
        requestedAt: new Date('2024-01-15T13:20:00'),
        updatedAt: new Date('2024-01-16T09:00:00'),
        priority: 'medium',
        notes: 'Rejected - missing original packaging and accessories'
      },
      {
        id: 'ret_006',
        returnNumber: 'RET-2024-006',
        orderNumber: 'ORD-2024-010',
        customer: {
          name: 'Thomas Garcia',
          email: 'thomas.g@example.com',
          avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          {
            productId: 'prod_019',
            name: 'Bluetooth Speaker',
            quantity: 2,
            price: 89.99,
            image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=150&h=150&fit=crop',
            reason: 'Poor sound quality',
            condition: 'opened'
          }
        ],
        status: 'refunded',
        returnReason: 'quality_issue',
        returnMethod: 'refund',
        refundAmount: 179.98,
        originalOrderTotal: 204.97,
        requestedAt: new Date('2024-01-12T10:00:00'),
        updatedAt: new Date('2024-01-14T15:30:00'),
        priority: 'low',
        assignedTo: 'Auto Processed'
      },
      {
        id: 'ret_007',
        returnNumber: 'RET-2024-007',
        orderNumber: 'ORD-2024-008',
        customer: {
          name: 'David Brown',
          email: 'david.b@example.com',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          {
            productId: 'prod_016',
            name: 'Gaming Laptop Pro',
            quantity: 1,
            price: 1499.99,
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150&h=150&fit=crop',
            reason: 'Screen flickering issue',
            condition: 'defective'
          }
        ],
        status: 'completed',
        returnReason: 'defective',
        returnMethod: 'refund',
        refundAmount: 1499.99,
        originalOrderTotal: 1662.98,
        shippingLabel: 'LBL-987654321',
        trackingNumber: 'TRK-RET-007',
        requestedAt: new Date('2024-01-10T14:20:00'),
        updatedAt: new Date('2024-01-13T11:00:00'),
        priority: 'urgent',
        assignedTo: 'Senior Agent'
      },
      {
        id: 'ret_008',
        returnNumber: 'RET-2024-008',
        orderNumber: 'ORD-2024-004',
        customer: {
          name: 'James Wilson',
          email: 'james.w@example.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          {
            productId: 'prod_007',
            name: 'Running Shoes Pro',
            quantity: 1,
            price: 129.99,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop',
            reason: 'Too tight - need larger size',
            condition: 'unopened'
          },
          {
            productId: 'prod_008',
            name: 'Sports Socks 3-Pack',
            quantity: 2,
            price: 24.99,
            image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=150&h=150&fit=crop',
            reason: 'Wrong color received',
            condition: 'unopened'
          }
        ],
        status: 'approved',
        returnReason: 'wrong_size',
        returnMethod: 'exchange',
        refundAmount: 0,
        originalOrderTotal: 187.97,
        requestedAt: new Date('2024-01-14T09:30:00'),
        updatedAt: new Date('2024-01-15T10:15:00'),
        priority: 'medium',
        assignedTo: 'Lisa Support'
      },
      {
        id: 'ret_009',
        returnNumber: 'RET-2024-009',
        orderNumber: 'ORD-2024-006',
        customer: {
          name: 'Robert Taylor',
          email: 'robert.t@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          {
            productId: 'prod_011',
            name: 'Coffee Maker Deluxe',
            quantity: 1,
            price: 199.99,
            image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=150&h=150&fit=crop',
            reason: 'Leaking water from reservoir',
            condition: 'defective'
          }
        ],
        status: 'cancelled',
        returnReason: 'defective',
        returnMethod: 'refund',
        refundAmount: 0,
        originalOrderTotal: 286.97,
        requestedAt: new Date('2024-01-13T11:45:00'),
        updatedAt: new Date('2024-01-14T08:20:00'),
        priority: 'low',
        notes: 'Customer cancelled - decided to keep after troubleshooting'
      },
      {
        id: 'ret_010',
        returnNumber: 'RET-2024-010',
        orderNumber: 'ORD-2024-009',
        customer: {
          name: 'Amanda White',
          email: 'amanda.w@example.com',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          {
            productId: 'prod_018',
            name: 'Skincare Set Premium',
            quantity: 1,
            price: 189.99,
            image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=150&h=150&fit=crop',
            reason: 'Allergic reaction to product',
            condition: 'opened'
          }
        ],
        status: 'requested',
        returnReason: 'allergic_reaction',
        returnMethod: 'refund',
        refundAmount: 189.99,
        originalOrderTotal: 0,
        requestedAt: new Date('2024-01-19T20:00:00'),
        updatedAt: new Date('2024-01-19T20:00:00'),
        priority: 'high'
      }
    ]);
  }

  // Computed
  filteredReturns = computed(() => {
    let result = this.returns();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(r => 
        r.returnNumber.toLowerCase().includes(query) ||
        r.orderNumber.toLowerCase().includes(query) ||
        r.customer.name.toLowerCase().includes(query) ||
        r.customer.email.toLowerCase().includes(query) ||
        r.items.some(i => i.name.toLowerCase().includes(query))
      );
    }

    if (this.filterStatus()) {
      result = result.filter(r => r.status === this.filterStatus());
    }

    if (this.filterReturnMethod()) {
      result = result.filter(r => r.returnMethod === this.filterReturnMethod());
    }

    if (this.filterPriority()) {
      result = result.filter(r => r.priority === this.filterPriority());
    }

    if (this.filterCondition()) {
      result = result.filter(r => r.items.some(i => i.condition === this.filterCondition()));
    }

    if (this.filterMinAmount()) {
      result = result.filter(r => r.refundAmount >= this.filterMinAmount()!);
    }
    if (this.filterMaxAmount()) {
      result = result.filter(r => r.refundAmount <= this.filterMaxAmount()!);
    }

    if (this.filterDateFrom()) {
      result = result.filter(r => r.requestedAt >= new Date(this.filterDateFrom()));
    }
    if (this.filterDateTo()) {
      result = result.filter(r => r.requestedAt <= new Date(this.filterDateTo()));
    }

    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (this.sortField()) {
        case 'refundAmount': aVal = a.refundAmount; bVal = b.refundAmount; break;
        case 'customer': aVal = a.customer.name; bVal = b.customer.name; break;
        case 'items': aVal = a.items.length; bVal = b.items.length; break;
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

  paginatedReturns = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredReturns().slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() => Math.ceil(this.filteredReturns().length / this.itemsPerPage()));

  returnStats = computed(() => [
    { 
      label: 'Total Returns', 
      value: this.returns().length.toString(), 
      trend: 8.5, 
      icon: 'arrow-return-left', 
      bgColor: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      filter: 'all'
    },
    { 
      label: 'Requested', 
      value: this.returns().filter(r => r.status === 'requested').length.toString(), 
      trend: -12.3, 
      icon: 'inbox', 
      bgColor: 'bg-yellow-100', 
      iconColor: 'text-yellow-600',
      filter: 'requested'
    },
    { 
      label: 'In Progress', 
      value: this.returns().filter(r => ['approved', 'received', 'inspecting'].includes(r.status)).length.toString(), 
      trend: 15.2, 
      icon: 'gear', 
      bgColor: 'bg-indigo-100', 
      iconColor: 'text-indigo-600',
      filter: 'in_progress'
    },
    { 
      label: 'Refunded', 
      value: this.returns().filter(r => r.status === 'refunded').length.toString(), 
      trend: 22.8, 
      icon: 'cash-coin', 
      bgColor: 'bg-green-100', 
      iconColor: 'text-green-600',
      filter: 'refunded'
    },
    { 
      label: 'Rejected', 
      value: this.returns().filter(r => r.status === 'rejected').length.toString(), 
      trend: -5.4, 
      icon: 'x-octagon', 
      bgColor: 'bg-red-100', 
      iconColor: 'text-red-600',
      filter: 'rejected'
    },
    { 
      label: 'Refund Value', 
      value: '$' + this.returns().filter(r => r.status === 'refunded').reduce((sum, r) => sum + r.refundAmount, 0).toFixed(2), 
      trend: 18.6, 
      icon: 'wallet2', 
      bgColor: 'bg-emerald-100', 
      iconColor: 'text-emerald-600',
      filter: 'refund_value'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterStatus()) count++;
    if (this.filterReturnMethod()) count++;
    if (this.filterPriority()) count++;
    if (this.filterCondition()) count++;
    if (this.filterDateFrom() || this.filterDateTo()) count++;
    if (this.filterMinAmount() || this.filterMaxAmount()) count++;
    return count;
  });

  selectedQuickFilter = signal<string>('');

  // Methods
  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  toggleViewMode() {
    this.viewMode.update(v => v === 'table' ? 'grid' : 'table');
  }

  toggleSelection(returnId: string) {
    this.selectedReturns.update(selected => {
      if (selected.includes(returnId)) {
        return selected.filter(id => id !== returnId);
      } else {
        return [...selected, returnId];
      }
    });
  }

  isSelected(returnId: string): boolean {
    return this.selectedReturns().includes(returnId);
  }

  isAllSelected(): boolean {
    return this.paginatedReturns().length > 0 && 
           this.paginatedReturns().every(r => this.isSelected(r.id));
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedReturns.set([]);
    } else {
      this.selectedReturns.set(this.paginatedReturns().map(r => r.id));
    }
  }

  toggleExpand(returnId: string) {
    this.expandedReturn.update(current => current === returnId ? null : returnId);
  }

  isExpanded(returnId: string): boolean {
    return this.expandedReturn() === returnId;
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
    if (filter === 'all') {
      this.filterStatus.set('');
    } else if (filter === 'in_progress') {
      this.filterStatus.set('approved');
    } else if (filter !== 'refund_value') {
      this.filterStatus.set(filter);
    }
  }

  clearAllFilters() {
    this.filterStatus.set('');
    this.filterReturnMethod.set('');
    this.filterPriority.set('');
    this.filterCondition.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterMinAmount.set(null);
    this.filterMaxAmount.set(null);
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  exportReturns(format: any) {
    console.log('Exporting returns as', format);
  }

  bulkApprove() {
    console.log('Bulk approve returns');
  }

  bulkReject() {
    console.log('Bulk reject returns');
  }

  bulkPrintLabels() {
    console.log('Bulk print return labels');
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

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  visiblePages(): (number | string)[] {
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
  }

  getReturnMenuItems(returnItem: OrderReturned): DropdownItem[] {
    const items: DropdownItem[] = [
      { id: 'view', label: 'View Details', icon: 'eye', shortcut: '⌘V' },
      { id: 'edit', label: 'Edit Return', icon: 'pencil', shortcut: '⌘E' }
    ];

    if (returnItem.status === 'requested') {
      items.push({ id: 'approve', label: 'Approve Return', icon: 'check-circle', shortcut: '⌘A' });
      items.push({ id: 'reject', label: 'Reject Return', icon: 'x-circle', shortcut: '⌘R' });
    }

    if (['approved', 'received', 'inspecting'].includes(returnItem.status)) {
      items.push({ id: 'label', label: 'Print Label', icon: 'printer', shortcut: '⌘P' });
    }

    if (returnItem.status === 'inspecting') {
      items.push({ id: 'refund', label: 'Process Refund', icon: 'cash-coin', shortcut: '⌘F' });
    }

    items.push({ id: 'divider', label: '', divider: true });
    items.push({ id: 'email', label: 'Email Customer', icon: 'envelope' });
    items.push({ id: 'notes', label: 'Add Notes', icon: 'sticky' });

    if (returnItem.status !== 'completed' && returnItem.status !== 'cancelled') {
      items.push({ id: 'divider2', label: '', divider: true });
      items.push({ id: 'cancel', label: 'Cancel Return', icon: 'trash', danger: true });
    }

    return items;
  }

  onReturnAction(item: DropdownItem, returnItem: OrderReturned) {
    console.log('Action:', item.id, 'on return:', returnItem.returnNumber);
  }

  // Helper methods
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      requested: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      received: 'bg-indigo-100 text-indigo-800',
      inspecting: 'bg-purple-100 text-purple-800',
      refunded: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusDot(status: string): string {
    const colors: Record<string, string> = {
      requested: 'bg-yellow-500',
      approved: 'bg-blue-500',
      received: 'bg-indigo-500',
      inspecting: 'bg-purple-500',
      refunded: 'bg-green-500',
      completed: 'bg-emerald-500',
      rejected: 'bg-red-500',
      cancelled: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  getConditionColor(condition: string): string {
    const colors: Record<string, string> = {
      unopened: 'bg-green-100 text-green-700',
      opened: 'bg-blue-100 text-blue-700',
      damaged: 'bg-orange-100 text-orange-700',
      defective: 'bg-red-100 text-red-700'
    };
    return colors[condition] || 'bg-gray-100 text-gray-700';
  }

  getReturnMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      refund: 'cash-coin',
      exchange: 'arrow-left-right',
      store_credit: 'gift'
    };
    return icons[method] || 'question';
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  }

  getCustomerTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      new: 'star',
      returning: 'arrow-repeat',
      vip: 'gem'
    };
    return icons[type] || 'person';
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

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return this.formatDate(date);
  }

  formatReason(reason: string): string {
    const reasons: Record<string, string> = {
      defective: 'Defective',
      damaged: 'Damaged in Shipping',
      wrong_size: 'Wrong Size',
      wrong_color: 'Wrong Color',
      not_as_described: 'Not as Described',
      changed_mind: 'Changed Mind',
      quality_issue: 'Quality Issue',
      incomplete: 'Incomplete Product',
      allergic_reaction: 'Allergic Reaction',
      other: 'Other'
    };
    return reasons[reason] || reason;
  }
}