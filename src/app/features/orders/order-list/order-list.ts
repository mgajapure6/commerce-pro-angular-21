import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    avatar: string;
    type: 'new' | 'returning' | 'vip';
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';
  shippingMethod: string;
  trackingNumber?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss'
})
export class OrderList implements OnInit {
  // expose global Math for template
  readonly Math: typeof Math = Math;
  
  // View State
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  selectedOrders = signal<string[]>([]);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  
  // Filters
  searchQuery = signal('');
  filterStatus = signal<string>('');
  filterPaymentStatus = signal<string>('');
  filterPriority = signal<string>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterMinAmount = signal<number | null>(null);
  filterMaxAmount = signal<number | null>(null);
  filterCustomerType = signal<string>('');
  filterTags = signal<string>('');

  // Sorting
  sortField = signal<string>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Orders Data
  orders = signal<Order[]>([]);

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
        id: 'ord_001',
        orderNumber: 'ORD-2024-001',
        customer: {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_001', name: 'Wireless Headphones Pro', quantity: 1, price: 299.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop' },
          { productId: 'prod_002', name: 'USB-C Cable 2m', quantity: 2, price: 19.99, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop' }
        ],
        status: 'processing',
        paymentStatus: 'paid',
        shippingMethod: 'Express Shipping',
        trackingNumber: 'TRK123456789',
        subtotal: 339.97,
        tax: 34.00,
        shipping: 15.00,
        discount: 20.00,
        total: 368.97,
        currency: 'USD',
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-15T14:20:00'),
        priority: 'high',
        tags: ['gift', 'express']
      },
      {
        id: 'ord_002',
        orderNumber: 'ORD-2024-002',
        customer: {
          name: 'Michael Chen',
          email: 'michael.c@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_003', name: 'Mechanical Keyboard RGB', quantity: 1, price: 149.99, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=150&h=150&fit=crop' }
        ],
        status: 'shipped',
        paymentStatus: 'paid',
        shippingMethod: 'Standard Shipping',
        trackingNumber: 'TRK987654321',
        subtotal: 149.99,
        tax: 15.00,
        shipping: 10.00,
        discount: 0,
        total: 174.99,
        currency: 'USD',
        createdAt: new Date('2024-01-14T09:15:00'),
        updatedAt: new Date('2024-01-14T16:30:00'),
        priority: 'medium',
        tags: []
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
          { productId: 'prod_004', name: 'Smart Watch Series 5', quantity: 1, price: 399.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop' },
          { productId: 'prod_005', name: 'Watch Band - Black', quantity: 1, price: 49.99, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=150&h=150&fit=crop' },
          { productId: 'prod_006', name: 'Screen Protector', quantity: 2, price: 12.99, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=150&h=150&fit=crop' }
        ],
        status: 'pending',
        paymentStatus: 'pending',
        shippingMethod: 'Express Shipping',
        subtotal: 475.96,
        tax: 47.60,
        shipping: 15.00,
        discount: 50.00,
        total: 488.56,
        currency: 'USD',
        createdAt: new Date('2024-01-15T14:20:00'),
        updatedAt: new Date('2024-01-15T14:20:00'),
        priority: 'urgent',
        tags: ['vip', 'fragile']
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
          { productId: 'prod_007', name: 'Running Shoes Pro', quantity: 1, price: 129.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop' },
          { productId: 'prod_008', name: 'Sports Socks 3-Pack', quantity: 2, price: 24.99, image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=150&h=150&fit=crop' }
        ],
        status: 'delivered',
        paymentStatus: 'paid',
        shippingMethod: 'Standard Shipping',
        trackingNumber: 'TRK456789123',
        subtotal: 179.97,
        tax: 18.00,
        shipping: 0,
        discount: 10.00,
        total: 187.97,
        currency: 'USD',
        createdAt: new Date('2024-01-10T11:45:00'),
        updatedAt: new Date('2024-01-13T09:30:00'),
        priority: 'low',
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
          { productId: 'prod_009', name: 'Leather Handbag', quantity: 1, price: 249.99, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop' },
          { productId: 'prod_010', name: 'Designer Scarf', quantity: 1, price: 89.99, image: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa33?w=150&h=150&fit=crop' }
        ],
        status: 'processing',
        paymentStatus: 'paid',
        shippingMethod: 'Express Shipping',
        trackingNumber: 'TRK789123456',
        subtotal: 339.98,
        tax: 34.00,
        shipping: 20.00,
        discount: 0,
        total: 393.98,
        currency: 'USD',
        createdAt: new Date('2024-01-15T16:00:00'),
        updatedAt: new Date('2024-01-15T18:30:00'),
        priority: 'high',
        tags: ['fashion', 'gift']
      },
      {
        id: 'ord_006',
        orderNumber: 'ORD-2024-006',
        customer: {
          name: 'Robert Taylor',
          email: 'robert.t@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          { productId: 'prod_011', name: 'Coffee Maker Deluxe', quantity: 1, price: 199.99, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=150&h=150&fit=crop' },
          { productId: 'prod_012', name: 'Coffee Beans 1kg', quantity: 2, price: 34.99, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=150&h=150&fit=crop' }
        ],
        status: 'shipped',
        paymentStatus: 'paid',
        shippingMethod: 'Standard Shipping',
        trackingNumber: 'TRK321654987',
        subtotal: 269.97,
        tax: 27.00,
        shipping: 15.00,
        discount: 25.00,
        total: 286.97,
        currency: 'USD',
        createdAt: new Date('2024-01-13T08:20:00'),
        updatedAt: new Date('2024-01-14T10:15:00'),
        priority: 'medium',
        tags: ['kitchen']
      },
      {
        id: 'ord_007',
        orderNumber: 'ORD-2024-007',
        customer: {
          name: 'Jennifer Martinez',
          email: 'jennifer.m@example.com',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_013', name: 'Yoga Mat Premium', quantity: 1, price: 79.99, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=150&h=150&fit=crop' },
          { productId: 'prod_014', name: 'Resistance Bands Set', quantity: 1, price: 29.99, image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=150&h=150&fit=crop' },
          { productId: 'prod_015', name: 'Water Bottle 1L', quantity: 1, price: 24.99, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=150&h=150&fit=crop' }
        ],
        status: 'pending',
        paymentStatus: 'failed',
        shippingMethod: 'Standard Shipping',
        subtotal: 134.97,
        tax: 13.50,
        shipping: 10.00,
        discount: 0,
        total: 158.47,
        currency: 'USD',
        createdAt: new Date('2024-01-15T20:00:00'),
        updatedAt: new Date('2024-01-15T20:05:00'),
        priority: 'low',
        tags: ['fitness']
      },
      {
        id: 'ord_008',
        orderNumber: 'ORD-2024-008',
        customer: {
          name: 'David Brown',
          email: 'david.b@example.com',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_016', name: 'Gaming Laptop Pro', quantity: 1, price: 1499.99, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150&h=150&fit=crop' },
          { productId: 'prod_017', name: 'Gaming Mouse RGB', quantity: 1, price: 79.99, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&h=150&fit=crop' }
        ],
        status: 'processing',
        paymentStatus: 'paid',
        shippingMethod: 'Express Shipping',
        trackingNumber: 'TRK147258369',
        subtotal: 1579.98,
        tax: 158.00,
        shipping: 25.00,
        discount: 100.00,
        total: 1662.98,
        currency: 'USD',
        createdAt: new Date('2024-01-12T14:30:00'),
        updatedAt: new Date('2024-01-12T16:00:00'),
        priority: 'urgent',
        tags: ['gaming', 'high-value']
      },
      {
        id: 'ord_009',
        orderNumber: 'ORD-2024-009',
        customer: {
          name: 'Amanda White',
          email: 'amanda.w@example.com',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          { productId: 'prod_018', name: 'Skincare Set Premium', quantity: 1, price: 189.99, image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=150&h=150&fit=crop' }
        ],
        status: 'cancelled',
        paymentStatus: 'refunded',
        shippingMethod: 'Standard Shipping',
        subtotal: 189.99,
        tax: 19.00,
        shipping: 0,
        discount: 0,
        total: 0,
        currency: 'USD',
        createdAt: new Date('2024-01-11T10:00:00'),
        updatedAt: new Date('2024-01-12T09:00:00'),
        priority: 'low',
        tags: ['beauty']
      },
      {
        id: 'ord_010',
        orderNumber: 'ORD-2024-010',
        customer: {
          name: 'Thomas Garcia',
          email: 'thomas.g@example.com',
          avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_019', name: 'Bluetooth Speaker', quantity: 2, price: 89.99, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=150&h=150&fit=crop' },
          { productId: 'prod_020', name: 'Phone Stand', quantity: 1, price: 19.99, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=150&h=150&fit=crop' }
        ],
        status: 'delivered',
        paymentStatus: 'paid',
        shippingMethod: 'Standard Shipping',
        trackingNumber: 'TRK369258147',
        subtotal: 199.97,
        tax: 20.00,
        shipping: 0,
        discount: 15.00,
        total: 204.97,
        currency: 'USD',
        createdAt: new Date('2024-01-08T13:45:00'),
        updatedAt: new Date('2024-01-11T11:30:00'),
        priority: 'medium',
        tags: ['electronics']
      }
    ]);
  }

  // Rest of the component remains the same...
  // (All computed properties and methods from previous version)

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

    if (this.filterPaymentStatus()) {
      result = result.filter(o => o.paymentStatus === this.filterPaymentStatus());
    }

    if (this.filterPriority()) {
      result = result.filter(o => o.priority === this.filterPriority());
    }

    if (this.filterMinAmount()) {
      result = result.filter(o => o.total >= this.filterMinAmount()!);
    }
    if (this.filterMaxAmount()) {
      result = result.filter(o => o.total <= this.filterMaxAmount()!);
    }

    if (this.filterDateFrom()) {
      result = result.filter(o => o.createdAt >= new Date(this.filterDateFrom()));
    }
    if (this.filterDateTo()) {
      result = result.filter(o => o.createdAt <= new Date(this.filterDateTo()));
    }

    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (this.sortField()) {
        case 'total': aVal = a.total; bVal = b.total; break;
        case 'customer': aVal = a.customer.name; bVal = b.customer.name; break;
        case 'items': aVal = a.items.length; bVal = b.items.length; break;
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

  orderStats = computed(() => [
    { 
      label: 'Total Orders', 
      value: this.orders().length.toString(), 
      trend: 12.5, 
      icon: 'bag-check', 
      bgColor: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      filter: 'all'
    },
    { 
      label: 'Pending', 
      value: this.orders().filter(o => o.status === 'pending').length.toString(), 
      trend: -5.2, 
      icon: 'clock-history', 
      bgColor: 'bg-yellow-100', 
      iconColor: 'text-yellow-600',
      filter: 'pending'
    },
    { 
      label: 'Processing', 
      value: this.orders().filter(o => o.status === 'processing').length.toString(), 
      trend: 8.1, 
      icon: 'gear', 
      bgColor: 'bg-indigo-100', 
      iconColor: 'text-indigo-600',
      filter: 'processing'
    },
    { 
      label: 'Shipped', 
      value: this.orders().filter(o => o.status === 'shipped').length.toString(), 
      trend: 15.3, 
      icon: 'truck', 
      bgColor: 'bg-purple-100', 
      iconColor: 'text-purple-600',
      filter: 'shipped'
    },
    { 
      label: 'Delivered', 
      value: this.orders().filter(o => o.status === 'delivered').length.toString(), 
      trend: 22.7, 
      icon: 'check-circle', 
      bgColor: 'bg-green-100', 
      iconColor: 'text-green-600',
      filter: 'delivered'
    },
    { 
      label: 'Revenue', 
      value: '$' + this.orders().filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0).toFixed(2), 
      trend: 18.4, 
      icon: 'cash-stack', 
      bgColor: 'bg-emerald-100', 
      iconColor: 'text-emerald-600',
      filter: 'revenue'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterStatus()) count++;
    if (this.filterPaymentStatus()) count++;
    if (this.filterPriority()) count++;
    if (this.filterDateFrom() || this.filterDateTo()) count++;
    if (this.filterMinAmount() || this.filterMaxAmount()) count++;
    if (this.filterCustomerType()) count++;
    if (this.filterTags()) count++;
    return count;
  });

  selectedQuickFilter = signal<string>('');
  

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  toggleViewMode() {
    this.viewMode.update(v => v === 'table' ? 'grid' : 'table');
  }

  getOrderMenuItems(order: Order): DropdownItem[] {
    return [
      { id: 'edit', label: 'Edit Order', icon: 'pencil', shortcut: '⌘E' },
      { id: 'invoice', label: 'Print Invoice', icon: 'printer', shortcut: '⌘P' },
      { id: 'email', label: 'Send Email', icon: 'send', shortcut: '⌘M' },
      { id: 'divider', label: '', divider: true },
      { id: 'cancel', label: 'Cancel Order', icon: 'x-circle', danger: true }
    ];
  }

  onExport(item: DropdownItem) {
    this.exportOrders(item.id as 'csv' | 'excel' | 'pdf');
  }

  onOrderAction(item: DropdownItem, order: Order) {
    switch (item.id) {
      case 'edit':
        // Navigate to edit
        break;
      case 'invoice':
        // Print invoice
        break;
      case 'email':
        // Send email
        break;
      case 'cancel':
        // Cancel order
        break;
    }
  }

  toggleSelection(orderId: string) {
    this.selectedOrders.update(selected => {
      if (selected.includes(orderId)) {
        return selected.filter(id => id !== orderId);
      } else {
        return [...selected, orderId];
      }
    });
  }

  isSelected(orderId: string): boolean {
    return this.selectedOrders().includes(orderId);
  }

  isAllSelected(): boolean {
    return this.paginatedOrders().length > 0 && 
           this.paginatedOrders().every(o => this.isSelected(o.id));
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
    if (filter === 'all') {
      this.filterStatus.set('');
    } else if (filter !== 'revenue') {
      this.filterStatus.set(filter);
    }
  }

  clearAllFilters() {
    this.filterStatus.set('');
    this.filterPaymentStatus.set('');
    this.filterPriority.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterMinAmount.set(null);
    this.filterMaxAmount.set(null);
    this.filterCustomerType.set('');
    this.filterTags.set('');
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  exportOrders(format: 'csv' | 'excel' | 'pdf') {
    console.log('Exporting as', format);
  }

  bulkUpdateStatus(status: string) {
    console.log('Bulk update status to', status);
  }

  bulkPrintInvoices() {
    console.log('Printing invoices');
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

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusDot(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      processing: 'bg-indigo-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
      refunded: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      paid: 'text-green-600',
      pending: 'text-yellow-600',
      failed: 'text-red-600',
      refunded: 'text-gray-600',
      partially_refunded: 'text-orange-600'
    };
    return colors[status] || 'text-gray-600';
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
}