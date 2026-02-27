// order-delivered.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface DeliveredOrder {
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
  carrier: 'fedex' | 'ups' | 'usps' | 'dhl';
  trackingNumber: string;
  deliveredAt: Date;
  signedBy?: string;
  review?: {
    rating: number;
    comment?: string;
  };
  reviewRequested: boolean;
  returnStatus: 'none' | 'requested' | 'approved' | 'completed';
  returnReason?: string;
}

@Component({
  selector: 'app-order-delivered',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './order-delivered.html',
  styleUrl: './order-delivered.scss'
})
export class OrderDelivered implements OnInit {
  readonly Math: typeof Math = Math;

  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  selectedOrders = signal<string[]>([]);

  currentPage = signal(1);
  itemsPerPage = signal(25);

  searchQuery = signal('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterReviewStatus = signal<string>('');
  filterReturnStatus = signal<string>('');
  filterCarrier = signal<string>('');

  sortField = signal<string>('deliveredAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  orders = signal<DeliveredOrder[]>([]);

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
        id: 'del_001',
        orderId: 'ord_004',
        orderNumber: 'ORD-2024-004',
        customer: {
          name: 'James Wilson',
          email: 'james.w@example.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_007', name: 'Running Shoes', quantity: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop' }
        ],
        total: 187.97,
        carrier: 'ups',
        trackingNumber: '1Z999AA10123456784',
        deliveredAt: new Date('2024-01-13T14:30:00'),
        signedBy: 'J. Wilson',
        review: { rating: 5, comment: 'Great shoes, fast delivery!' },
        reviewRequested: false,
        returnStatus: 'none'
      },
      {
        id: 'del_002',
        orderId: 'ord_010',
        orderNumber: 'ORD-2024-010',
        customer: {
          name: 'Thomas Garcia',
          email: 'thomas.g@example.com',
          avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_019', name: 'Bluetooth Speaker', quantity: 2, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=150&h=150&fit=crop' }
        ],
        total: 204.97,
        carrier: 'fedex',
        trackingNumber: '784512369852',
        deliveredAt: new Date('2024-01-11T11:30:00'),
        reviewRequested: true,
        returnStatus: 'none'
      },
      {
        id: 'del_003',
        orderId: 'ord_009',
        orderNumber: 'ORD-2024-009',
        customer: {
          name: 'Amanda White',
          email: 'amanda.w@example.com',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          { productId: 'prod_018', name: 'Skincare Set', quantity: 1, image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=150&h=150&fit=crop' }
        ],
        total: 0,
        carrier: 'usps',
        trackingNumber: '9400100000000000000001',
        deliveredAt: new Date('2024-01-12T09:00:00'),
        reviewRequested: false,
        returnStatus: 'requested',
        returnReason: 'Product damaged in shipping'
      },
      {
        id: 'del_004',
        orderId: 'ord_012',
        orderNumber: 'ORD-2024-012',
        customer: {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_001', name: 'Wireless Headphones', quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop' }
        ],
        total: 368.97,
        carrier: 'fedex',
        trackingNumber: '794612385214',
        deliveredAt: new Date('2024-01-14T16:45:00'),
        signedBy: 'S. Johnson',
        review: { rating: 4 },
        reviewRequested: false,
        returnStatus: 'none'
      },
      {
        id: 'del_005',
        orderId: 'ord_015',
        orderNumber: 'ORD-2024-015',
        customer: {
          name: 'Michael Chen',
          email: 'michael.c@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_003', name: 'Mechanical Keyboard', quantity: 1, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=150&h=150&fit=crop' }
        ],
        total: 174.99,
        carrier: 'ups',
        trackingNumber: '1Z888BB20234567890',
        deliveredAt: new Date('2024-01-15T10:20:00'),
        reviewRequested: false,
        returnStatus: 'approved',
        returnReason: 'Wrong color'
      }
    ]);
  }

  filteredOrders = computed(() => {
    let result = this.orders();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customer.name.toLowerCase().includes(query) ||
        o.trackingNumber.toLowerCase().includes(query)
      );
    }

    if (this.filterDateFrom()) {
      result = result.filter(o => o.deliveredAt >= new Date(this.filterDateFrom()));
    }
    if (this.filterDateTo()) {
      result = result.filter(o => o.deliveredAt <= new Date(this.filterDateTo()));
    }

    if (this.filterReviewStatus()) {
      if (this.filterReviewStatus() === 'pending') {
        result = result.filter(o => !o.review && !o.reviewRequested);
      } else if (this.filterReviewStatus() === 'requested') {
        result = result.filter(o => o.reviewRequested && !o.review);
      } else if (this.filterReviewStatus() === 'completed') {
        result = result.filter(o => o.review);
      }
    }

    if (this.filterReturnStatus()) {
      result = result.filter(o => o.returnStatus === this.filterReturnStatus());
    }

    if (this.filterCarrier()) {
      result = result.filter(o => o.carrier === this.filterCarrier());
    }

    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (this.sortField()) {
        case 'orderNumber': aVal = a.orderNumber; bVal = b.orderNumber; break;
        case 'customer': aVal = a.customer.name; bVal = b.customer.name; break;
        default: aVal = a.deliveredAt; bVal = b.deliveredAt;
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

  deliveredOrders = computed(() => this.orders());

  returnRequests = computed(() => this.orders().filter(o => o.returnStatus === 'requested'));

  deliveryStats = computed(() => [
    {
      label: 'Delivered Today',
      value: this.orders().filter(o => this.isToday(o.deliveredAt)).length.toString(),
      trend: 15.2,
      icon: 'check-circle',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      filter: 'today'
    },
    {
      label: 'This Week',
      value: this.orders().filter(o => this.isThisWeek(o.deliveredAt)).length.toString(),
      trend: 8.5,
      icon: 'calendar-week',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      filter: 'week'
    },
    {
      label: 'Avg Rating',
      value: this.getAverageRating(),
      trend: 12.3,
      icon: 'star-fill',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      filter: 'rating'
    },
    {
      label: 'Pending Reviews',
      value: this.orders().filter(o => !o.review && !o.reviewRequested).length.toString(),
      trend: -5.2,
      icon: 'chat-square-text',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      filter: 'pending_reviews'
    },
    {
      label: 'Return Requests',
      value: this.returnRequests().length.toString(),
      trend: 3.1,
      icon: 'arrow-return-left',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      filter: 'returns'
    },
    {
      label: 'Total Revenue',
      value: '$' + this.orders().reduce((sum, o) => sum + o.total, 0).toFixed(2),
      trend: 22.7,
      icon: 'cash-stack',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      filter: 'revenue'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterDateFrom() || this.filterDateTo()) count++;
    if (this.filterReviewStatus()) count++;
    if (this.filterReturnStatus()) count++;
    if (this.filterCarrier()) count++;
    return count;
  });

  selectedQuickFilter = signal<string>('');

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isThisWeek(date: Date): boolean {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }

  getAverageRating(): string {
    const reviewed = this.orders().filter(o => o.review);
    if (reviewed.length === 0) return '0.0';
    const avg = reviewed.reduce((sum, o) => sum + (o.review?.rating || 0), 0) / reviewed.length;
    return avg.toFixed(1);
  }

  toggleFilters() { this.showFilters.update(v => !v); }
  toggleViewMode() { this.viewMode.update(v => v === 'table' ? 'grid' : 'table'); }

  getOrderMenuItems(order: DeliveredOrder): DropdownItem[] {
    const items: DropdownItem[] = [
      { id: 'details', label: 'View Details', icon: 'eye' },
      { id: 'invoice', label: 'Download Invoice', icon: 'receipt' },
      { id: 'tracking', label: 'Tracking History', icon: 'geo-alt' }
    ];

    if (!order.review && !order.reviewRequested) {
      items.push({ id: 'request_review', label: 'Request Review', icon: 'star' });
    }

    if (order.returnStatus === 'none') {
      items.push({ id: 'initiate_return', label: 'Initiate Return', icon: 'arrow-return-left' });
    }

    items.push(
      { id: 'divider', label: '', divider: true },
      { id: 'archive', label: 'Archive Order', icon: 'archive' }
    );

    return items;
  }

  onExport(item: DropdownItem) { console.log('Export', item.id); }

  onOrderAction(item: DropdownItem, order: DeliveredOrder) {
    if (item.id === 'request_review') this.requestReview(order);
    else if (item.id === 'details') this.viewDeliveryDetails(order);
    else if (item.id === 'invoice') this.printInvoice(order);
  }

  toggleSelection(orderId: string) {
    this.selectedOrders.update(selected =>
      selected.includes(orderId)
        ? selected.filter(id => id !== orderId)
        : [...selected, orderId]
    );
  }

  isSelected(orderId: string) { return this.selectedOrders().includes(orderId); }
  isAllSelected() { return this.paginatedOrders().length > 0 && this.paginatedOrders().every(o => this.isSelected(o.id)); }

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
    } else if (filter === 'pending_reviews') {
      this.filterReviewStatus.set('pending');
    } else if (filter === 'returns') {
      this.filterReturnStatus.set('requested');
    }
  }

  clearAllFilters() {
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterReviewStatus.set('');
    this.filterReturnStatus.set('');
    this.filterCarrier.set('');
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  viewReturnRequests() { this.filterReturnStatus.set('requested'); }

  requestReview(order: DeliveredOrder) {
    console.log('Requesting review for', order.orderNumber);
    this.orders.update(orders =>
      orders.map(o => o.id === order.id ? { ...o, reviewRequested: true } : o)
    );
  }

  requestFeedback() { console.log('Bulk request feedback'); }
  bulkRequestReview() { console.log('Bulk request reviews'); }
  bulkExportInvoices() { console.log('Bulk export invoices'); }
  bulkArchive() { console.log('Bulk archive'); }

  viewDeliveryDetails(order: DeliveredOrder) { console.log('View details', order.orderNumber); }
  printInvoice(order: DeliveredOrder) { console.log('Print invoice', order.orderNumber); }

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

  getReturnStatusColor(status: string): string {
    const colors: Record<string, string> = {
      none: 'bg-gray-100 text-gray-600',
      requested: 'bg-amber-100 text-amber-700',
      approved: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  }

  getReturnStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      none: 'dash',
      requested: 'arrow-return-left',
      approved: 'check-circle',
      completed: 'check-all'
    };
    return icons[status] || 'question-circle';
  }

  getReturnStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      none: 'No Return',
      requested: 'Requested',
      approved: 'Approved',
      completed: 'Completed'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }
}