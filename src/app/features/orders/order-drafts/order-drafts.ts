// order-drafts.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface DraftOrder {
  id: string;
  draftId: string;
  customer?: {
    id: string;
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
    variant?: string;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  appliedDiscount: number;
  total: number;
  currency: string;
  status: 'active' | 'pending_payment' | 'invoice_sent' | 'expired' | 'converted';
  source: 'manual' | 'abandoned_cart' | 'b2b_quote' | 'phone_order' | 'api';
  notes?: string;
  tags: string[];
  createdAt: Date;
  lastModifiedAt?: Date;
  expiresAt?: Date;
  convertedAt?: Date;
  convertedOrderId?: string;
  invoiceSentAt?: Date;
  invoiceSentCount: number;
  reservationExpiry?: Date;
}

@Component({
  selector: 'app-order-drafts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './order-drafts.html',
  styleUrl: './order-drafts.scss'
})
export class OrderDrafts implements OnInit {
  readonly Math: typeof Math = Math;

  // View State
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  selectedDrafts = signal<string[]>([]);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(25);

  // Filters
  searchQuery = signal('');
  filterStatus = signal<string>('');
  filterSource = signal<string>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterMinAmount = signal<number | null>(null);
  filterMaxAmount = signal<number | null>(null);
  filterHasItems = signal<boolean | null>(null);

  // Sorting
  sortField = signal<string>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Drafts Data
  drafts = signal<DraftOrder[]>([]);

  exportItems: DropdownItem[] = [
    { id: 'csv', label: 'Export as CSV', icon: 'filetype-csv' },
    { id: 'excel', label: 'Export as Excel', icon: 'filetype-xlsx' },
    { id: 'pdf', label: 'Export as PDF', icon: 'filetype-pdf' }
  ];

  ngOnInit() {
    this.loadDrafts();
  }

  loadDrafts() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    this.drafts.set([
      {
        id: 'draft_001',
        draftId: 'DRAFT-2024-001',
        customer: {
          id: 'cust_001',
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_001', name: 'Wireless Headphones Pro', quantity: 1, price: 299.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop' },
          { productId: 'prod_002', name: 'USB-C Cable 2m', quantity: 2, price: 19.99, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop' }
        ],
        subtotal: 339.97,
        tax: 34.00,
        shipping: 15.00,
        appliedDiscount: 20.00,
        total: 368.97,
        currency: 'USD',
        status: 'active',
        source: 'manual',
        notes: 'VIP customer - apply expedited shipping',
        tags: ['vip', 'expedite'],
        createdAt: twoDaysAgo,
        lastModifiedAt: now,
        expiresAt: tomorrow,
        invoiceSentCount: 0
      },
      {
        id: 'draft_002',
        draftId: 'DRAFT-2024-002',
        customer: {
          id: 'cust_002',
          name: 'Michael Chen',
          email: 'michael.c@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          type: 'b2b'
        },
        items: [
          { productId: 'prod_003', name: 'Mechanical Keyboard RGB', quantity: 10, price: 129.99, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=150&h=150&fit=crop', variant: 'Cherry MX Blue' }
        ],
        subtotal: 1299.90,
        tax: 130.00,
        shipping: 0,
        appliedDiscount: 130.00,
        total: 1299.90,
        currency: 'USD',
        status: 'pending_payment',
        source: 'b2b_quote',
        notes: 'B2B bulk order - 10% discount applied',
        tags: ['b2b', 'bulk', 'wholesale'],
        createdAt: lastWeek,
        lastModifiedAt: twoDaysAgo,
        expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        invoiceSentAt: twoDaysAgo,
        invoiceSentCount: 2,
        reservationExpiry: tomorrow
      },
      {
        id: 'draft_003',
        draftId: 'DRAFT-2024-003',
        customer: {
          id: 'cust_003',
          name: 'Emma Davis',
          email: 'emma.d@example.com',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          { productId: 'prod_004', name: 'Smart Watch Series 5', quantity: 1, price: 399.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop' }
        ],
        subtotal: 399.99,
        tax: 40.00,
        shipping: 15.00,
        appliedDiscount: 0,
        total: 454.99,
        currency: 'USD',
        status: 'expired',
        source: 'abandoned_cart',
        tags: ['abandoned', 'recovery'],
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        invoiceSentCount: 0
      },
      {
        id: 'draft_004',
        draftId: 'DRAFT-2024-004',
        customer: {
          id: 'cust_004',
          name: 'James Wilson',
          email: 'james.w@example.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_007', name: 'Running Shoes Pro', quantity: 1, price: 129.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop' },
          { productId: 'prod_008', name: 'Sports Socks 3-Pack', quantity: 2, price: 24.99, image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=150&h=150&fit=crop' }
        ],
        subtotal: 179.97,
        tax: 18.00,
        shipping: 0,
        appliedDiscount: 10.00,
        total: 187.97,
        currency: 'USD',
        status: 'converted',
        source: 'phone_order',
        notes: 'Phone order - customer will pay on delivery',
        tags: ['phone', 'cod'],
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        convertedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        convertedOrderId: 'ord_004',
        invoiceSentCount: 1
      },
      {
        id: 'draft_005',
        draftId: 'DRAFT-2024-005',
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        appliedDiscount: 0,
        total: 0,
        currency: 'USD',
        status: 'active',
        source: 'manual',
        notes: 'New draft - waiting for customer product selection',
        tags: ['empty', 'pending'],
        createdAt: now,
        invoiceSentCount: 0
      },
      {
        id: 'draft_006',
        draftId: 'DRAFT-2024-006',
        customer: {
          id: 'cust_006',
          name: 'Robert Taylor',
          email: 'robert.t@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_011', name: 'Coffee Maker Deluxe', quantity: 1, price: 199.99, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=150&h=150&fit=crop' },
          { productId: 'prod_012', name: 'Coffee Beans 1kg', quantity: 2, price: 34.99, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=150&h=150&fit=crop' }
        ],
        subtotal: 269.97,
        tax: 27.00,
        shipping: 15.00,
        appliedDiscount: 25.00,
        total: 286.97,
        currency: 'USD',
        status: 'invoice_sent',
        source: 'manual',
        tags: ['invoice-sent'],
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        lastModifiedAt: twoDaysAgo,
        expiresAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        invoiceSentAt: twoDaysAgo,
        invoiceSentCount: 1
      },
      {
        id: 'draft_007',
        draftId: 'DRAFT-2024-007',
        customer: {
          id: 'cust_007',
          name: 'Jennifer Martinez',
          email: 'jennifer.m@example.com',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          { productId: 'prod_013', name: 'Yoga Mat Premium', quantity: 1, price: 79.99, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=150&h=150&fit=crop' }
        ],
        subtotal: 79.99,
        tax: 8.00,
        shipping: 10.00,
        appliedDiscount: 0,
        total: 97.99,
        currency: 'USD',
        status: 'active',
        source: 'abandoned_cart',
        tags: ['abandoned'],
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        lastModifiedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        expiresAt: tomorrow,
        invoiceSentCount: 0
      },
      {
        id: 'draft_008',
        draftId: 'DRAFT-2024-008',
        customer: {
          id: 'cust_008',
          name: 'David Brown',
          email: 'david.b@example.com',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_016', name: 'Gaming Laptop Pro', quantity: 1, price: 1499.99, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150&h=150&fit=crop' }
        ],
        subtotal: 1499.99,
        tax: 150.00,
        shipping: 0,
        appliedDiscount: 150.00,
        total: 1499.99,
        currency: 'USD',
        status: 'active',
        source: 'api',
        notes: 'API generated from wishlist',
        tags: ['api', 'vip', 'high-value'],
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        invoiceSentCount: 0
      }
    ]);
  }

  // Computed Properties
  filteredDrafts = computed(() => {
    let result = this.drafts();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(d =>
        d.draftId.toLowerCase().includes(query) ||
        (d.customer?.name.toLowerCase().includes(query) ?? false) ||
        (d.customer?.email.toLowerCase().includes(query) ?? false) ||
        (d.notes?.toLowerCase().includes(query) ?? false)
      );
    }

    if (this.filterStatus()) {
      result = result.filter(d => d.status === this.filterStatus());
    }

    if (this.filterSource()) {
      result = result.filter(d => d.source === this.filterSource());
    }

    if (this.filterDateFrom()) {
      result = result.filter(d => d.createdAt >= new Date(this.filterDateFrom()));
    }
    if (this.filterDateTo()) {
      result = result.filter(d => d.createdAt <= new Date(this.filterDateTo()));
    }

    if (this.filterMinAmount()) {
      result = result.filter(d => d.total >= this.filterMinAmount()!);
    }
    if (this.filterMaxAmount()) {
      result = result.filter(d => d.total <= this.filterMaxAmount()!);
    }

    if (this.filterHasItems() !== null) {
      result = result.filter(d => (d.items.length > 0) === this.filterHasItems());
    }

    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (this.sortField()) {
        case 'draftId': aVal = a.draftId; bVal = b.draftId; break;
        case 'customer': aVal = a.customer?.name ?? ''; bVal = b.customer?.name ?? ''; break;
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

  paginatedDrafts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredDrafts().slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() => Math.ceil(this.filteredDrafts().length / this.itemsPerPage()));

  expiringSoonDrafts = computed(() => 
    this.drafts().filter(d => {
      if (!d.expiresAt || d.status === 'expired' || d.status === 'converted') return false;
      const hoursUntilExpiry = (d.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
    })
  );

  abandonedDrafts = computed(() => 
    this.drafts().filter(d => {
      if (d.status === 'expired' || d.status === 'converted') return false;
      const daysSinceCreation = (new Date().getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation > 7 && d.source === 'abandoned_cart';
    })
  );

  draftStats = computed(() => [
    {
      label: 'Active',
      value: this.drafts().filter(d => d.status === 'active').length.toString(),
      trend: 12.5,
      icon: 'file-earmark-text',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      filter: 'active'
    },
    {
      label: 'Pending Payment',
      value: this.drafts().filter(d => d.status === 'pending_payment').length.toString(),
      trend: -5.2,
      icon: 'credit-card',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      filter: 'pending_payment'
    },
    {
      label: 'Invoice Sent',
      value: this.drafts().filter(d => d.status === 'invoice_sent').length.toString(),
      trend: 8.1,
      icon: 'envelope-check',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      filter: 'invoice_sent'
    },
    {
      label: 'Converted',
      value: this.drafts().filter(d => d.status === 'converted').length.toString(),
      trend: 15.3,
      icon: 'check-circle',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      filter: 'converted'
    },
    {
      label: 'Expiring Soon',
      value: this.expiringSoonDrafts().length.toString(),
      trend: -22.7,
      icon: 'clock-history',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      filter: 'expiring'
    },
    {
      label: 'Total Value',
      value: '$' + this.drafts()
        .filter(d => d.status !== 'expired' && d.status !== 'converted')
        .reduce((sum, d) => sum + d.total, 0).toFixed(2),
      trend: 18.4,
      icon: 'cash-stack',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      filter: 'value'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterStatus()) count++;
    if (this.filterSource()) count++;
    if (this.filterDateFrom() || this.filterDateTo()) count++;
    if (this.filterMinAmount() || this.filterMaxAmount()) count++;
    if (this.filterHasItems() !== null) count++;
    return count;
  });

  selectedQuickFilter = signal<string>('');

  // Helper Methods
  isExpiringSoon(draft: DraftOrder): boolean {
    if (!draft.expiresAt || draft.status === 'expired' || draft.status === 'converted') return false;
    const hoursUntilExpiry = (draft.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  }

  getDaysUntilExpiry(draft: DraftOrder): number {
    if (!draft.expiresAt) return 0;
    const diff = draft.expiresAt.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Action Methods
  toggleFilters() { this.showFilters.update(v => !v); }
  toggleViewMode() { this.viewMode.update(v => v === 'table' ? 'grid' : 'table'); }

  getDraftMenuItems(draft: DraftOrder): DropdownItem[] {
    const items: DropdownItem[] = [
      { id: 'edit', label: 'Edit Draft', icon: 'pencil' },
      { id: 'duplicate', label: 'Duplicate', icon: 'copy' },
      { id: 'history', label: 'View History', icon: 'clock-history' }
    ];

    if (draft.status === 'active' || draft.status === 'pending_payment') {
      items.push(
        { id: 'send_invoice', label: 'Send Invoice', icon: 'envelope' },
        { id: 'convert', label: 'Convert to Order', icon: 'check-lg' }
      );
    }

    if (draft.status !== 'converted' && draft.status !== 'expired') {
      items.push(
        { id: 'extend', label: 'Extend Expiry', icon: 'calendar-plus' }
      );
    }

    items.push(
      { id: 'divider', label: '', divider: true },
      { id: 'delete', label: 'Delete Draft', icon: 'trash', danger: true }
    );

    return items;
  }

  onExport(item: DropdownItem) { console.log('Export', item.id); }

  onDraftAction(item: DropdownItem, draft: DraftOrder) {
    switch (item.id) {
      case 'edit': this.editDraft(draft); break;
      case 'duplicate': this.duplicateDraft(draft); break;
      case 'send_invoice': this.sendInvoice(draft); break;
      case 'convert': this.convertToOrder(draft); break;
      case 'extend': this.extendExpiry(draft); break;
      case 'delete': this.deleteDraft(draft); break;
    }
  }

  toggleSelection(draftId: string) {
    this.selectedDrafts.update(selected =>
      selected.includes(draftId)
        ? selected.filter(id => id !== draftId)
        : [...selected, draftId]
    );
  }

  isSelected(draftId: string) { return this.selectedDrafts().includes(draftId); }

  isAllSelected() { 
    return this.paginatedDrafts().length > 0 && this.paginatedDrafts().every(d => this.isSelected(d.id)); 
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedDrafts.set([]);
    } else {
      this.selectedDrafts.set(this.paginatedDrafts().map(d => d.id));
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

    if (filter === 'active') {
      this.filterStatus.set('active');
    } else if (filter === 'pending_payment') {
      this.filterStatus.set('pending_payment');
    } else if (filter === 'invoice_sent') {
      this.filterStatus.set('invoice_sent');
    } else if (filter === 'converted') {
      this.filterStatus.set('converted');
    } else if (filter === 'expiring') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.filterDateTo.set(tomorrow.toISOString().split('T')[0]);
    }
  }

  clearAllFilters() {
    this.filterStatus.set('');
    this.filterSource.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterMinAmount.set(null);
    this.filterMaxAmount.set(null);
    this.filterHasItems.set(null);
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  // Status Helpers
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'bg-amber-100 text-amber-700',
      pending_payment: 'bg-blue-100 text-blue-700',
      invoice_sent: 'bg-purple-100 text-purple-700',
      expired: 'bg-gray-100 text-gray-600',
      converted: 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusDot(status: string): string {
    const colors: Record<string, string> = {
      active: 'bg-amber-500',
      pending_payment: 'bg-blue-500',
      invoice_sent: 'bg-purple-500',
      expired: 'bg-gray-400',
      converted: 'bg-green-500'
    };
    return colors[status] || 'bg-gray-400';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Active',
      pending_payment: 'Pending Payment',
      invoice_sent: 'Invoice Sent',
      expired: 'Expired',
      converted: 'Converted'
    };
    return labels[status] || status;
  }

  getSourceColor(source: string): string {
    const colors: Record<string, string> = {
      manual: 'bg-gray-100 text-gray-700',
      abandoned_cart: 'bg-orange-100 text-orange-700',
      b2b_quote: 'bg-blue-100 text-blue-700',
      phone_order: 'bg-purple-100 text-purple-700',
      api: 'bg-indigo-100 text-indigo-700'
    };
    return colors[source] || 'bg-gray-100 text-gray-700';
  }

  getSourceIcon(source: string): string {
    const icons: Record<string, string> = {
      manual: 'hand-index',
      abandoned_cart: 'cart-x',
      b2b_quote: 'building',
      phone_order: 'telephone',
      api: 'code-slash'
    };
    return icons[source] || 'question-circle';
  }

  getSourceLabel(source: string): string {
    const labels: Record<string, string> = {
      manual: 'Manual',
      abandoned_cart: 'Abandoned Cart',
      b2b_quote: 'B2B Quote',
      phone_order: 'Phone Order',
      api: 'API'
    };
    return labels[source] || source;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    }).format(date);
  }

  // Bulk Actions
  bulkSendInvoices() { 
    console.log('Sending invoices to', this.selectedDrafts().length, 'drafts');
    this.drafts.update(drafts =>
      drafts.map(d => this.selectedDrafts().includes(d.id) && (d.status === 'active' || d.status === 'pending_payment')
        ? { ...d, status: 'invoice_sent' as const, invoiceSentAt: new Date(), invoiceSentCount: d.invoiceSentCount + 1 }
        : d)
    );
  }

  bulkExtendExpiry() { 
    console.log('Extending expiry for', this.selectedDrafts().length, 'drafts');
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);
    this.drafts.update(drafts =>
      drafts.map(d => this.selectedDrafts().includes(d.id) && d.status !== 'converted' && d.status !== 'expired'
        ? { ...d, expiresAt: newExpiry }
        : d)
    );
  }

  bulkDelete() { 
    console.log('Deleting', this.selectedDrafts().length, 'drafts');
    this.drafts.update(drafts => drafts.filter(d => !this.selectedDrafts().includes(d.id)));
    this.selectedDrafts.set([]);
  }

  // Individual Actions
  createDraftOrder() { console.log('Creating new draft order'); }

  editDraft(draft: DraftOrder) { 
    console.log('Editing draft', draft.draftId);
    this.drafts.update(drafts =>
      drafts.map(d => d.id === draft.id ? { ...d, lastModifiedAt: new Date() } : d)
    );
  }

  duplicateDraft(draft: DraftOrder) { 
    console.log('Duplicating draft', draft.draftId);
    const newDraft: DraftOrder = {
      ...draft,
      id: `draft_${Date.now()}`,
      draftId: `DRAFT-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: 'active',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
      convertedAt: undefined,
      convertedOrderId: undefined,
      invoiceSentAt: undefined,
      invoiceSentCount: 0
    };
    this.drafts.update(drafts => [...drafts, newDraft]);
  }

  sendInvoice(draft: DraftOrder) { 
    console.log('Sending invoice for', draft.draftId);
    this.drafts.update(drafts =>
      drafts.map(d => d.id === draft.id 
        ? { ...d, status: 'invoice_sent' as const, invoiceSentAt: new Date(), invoiceSentCount: d.invoiceSentCount + 1 }
        : d)
    );
  }

  convertToOrder(draft: DraftOrder) { 
    console.log('Converting draft to order', draft.draftId);
    this.drafts.update(drafts =>
      drafts.map(d => d.id === draft.id 
        ? { ...d, status: 'converted' as const, convertedAt: new Date(), convertedOrderId: `ord_${Date.now()}` }
        : d)
    );
  }

  extendExpiry(draft: DraftOrder) { 
    console.log('Extending expiry for', draft.draftId);
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);
    this.drafts.update(drafts =>
      drafts.map(d => d.id === draft.id ? { ...d, expiresAt: newExpiry } : d)
    );
  }

  deleteDraft(draft: DraftOrder) { 
    console.log('Deleting draft', draft.draftId);
    this.drafts.update(drafts => drafts.filter(d => d.id !== draft.id));
  }

  sendExpiryReminders() { console.log('Sending expiry reminders'); }
  sendRecoveryEmails() { console.log('Sending recovery emails'); }
  processHighPriority() { console.log('Processing high priority drafts'); }
  showDraftAnalytics() { console.log('Showing draft analytics'); }

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