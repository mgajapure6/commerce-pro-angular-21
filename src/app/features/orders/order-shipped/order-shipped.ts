// order-shipped.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface ShippedOrder {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    avatar: string;
    type: 'new' | 'returning' | 'vip' | 'wholesale';
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    image: string;
  }[];
  carrier: 'fedex' | 'ups' | 'usps' | 'dhl';
  trackingNumber: string;
  serviceLevel: string;
  shipmentStatus: 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'returned';
  estimatedDelivery: Date;
  lastTrackingUpdate: Date;
  lastTrackingEvent?: string;
  lastTrackingLocation?: string;
  shippingAddress: {
    city: string;
    state: string;
    zip: string;
  };
}

@Component({
  selector: 'app-order-shipped',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './order-shipped.html',
  styleUrl: './order-shipped.scss'
})
export class OrderShipped implements OnInit {
  readonly Math: typeof Math = Math;

  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  selectedOrders = signal<string[]>([]);
  isRefreshing = signal(false);

  currentPage = signal(1);
  itemsPerPage = signal(25);

  searchQuery = signal('');
  filterCarrier = signal<string>('');
  filterShipmentStatus = signal<string>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterServiceLevel = signal<string>('');

  sortField = signal<string>('estimatedDelivery');
  sortDirection = signal<'asc' | 'desc'>('asc');

  orders = signal<ShippedOrder[]>([]);

  exportItems: DropdownItem[] = [
    { id: 'csv', label: 'Export as CSV', icon: 'filetype-csv' },
    { id: 'excel', label: 'Export as Excel', icon: 'filetype-xlsx' },
    { id: 'pdf', label: 'Export as PDF', icon: 'filetype-pdf' }
  ];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const now = new Date();
    this.orders.set([
      {
        id: 'ship_001',
        orderId: 'ord_002',
        orderNumber: 'ORD-2024-002',
        customer: {
          name: 'Michael Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_003', name: 'Mechanical Keyboard', quantity: 1, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=150&h=150&fit=crop' }
        ],
        carrier: 'ups',
        trackingNumber: '1Z999AA10123456784',
        serviceLevel: 'ground',
        shipmentStatus: 'in_transit',
        estimatedDelivery: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        lastTrackingUpdate: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        lastTrackingEvent: 'Departed from facility',
        lastTrackingLocation: 'Louisville, KY',
        shippingAddress: { city: 'San Francisco', state: 'CA', zip: '94105' }
      },
      {
        id: 'ship_002',
        orderId: 'ord_006',
        orderNumber: 'ORD-2024-006',
        customer: {
          name: 'Robert Taylor',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          { productId: 'prod_011', name: 'Coffee Maker', quantity: 1, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=150&h=150&fit=crop' }
        ],
        carrier: 'fedex',
        trackingNumber: '784512369852',
        serviceLevel: 'express',
        shipmentStatus: 'out_for_delivery',
        estimatedDelivery: new Date(now.getTime() + 8 * 60 * 60 * 1000),
        lastTrackingUpdate: new Date(now.getTime() - 30 * 60 * 1000),
        lastTrackingEvent: 'Out for delivery',
        lastTrackingLocation: 'Seattle, WA',
        shippingAddress: { city: 'Seattle', state: 'WA', zip: '98101' }
      },
      {
        id: 'ship_003',
        orderId: 'ord_010',
        orderNumber: 'ORD-2024-010',
        customer: {
          name: 'Thomas Garcia',
          avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_019', name: 'Bluetooth Speaker', quantity: 2, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=150&h=150&fit=crop' }
        ],
        carrier: 'usps',
        trackingNumber: '9400100000000000000001',
        serviceLevel: 'priority',
        shipmentStatus: 'exception',
        estimatedDelivery: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        lastTrackingUpdate: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        lastTrackingEvent: 'Delivery attempted - Address incorrect',
        lastTrackingLocation: 'Dallas, TX',
        shippingAddress: { city: 'Dallas', state: 'TX', zip: '75201' }
      }
    ]);
  }

  filteredOrders = computed(() => {
    let result = this.orders();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.trackingNumber.toLowerCase().includes(query) ||
        o.customer.name.toLowerCase().includes(query)
      );
    }

    if (this.filterCarrier()) {
      result = result.filter(o => o.carrier === this.filterCarrier());
    }

    if (this.filterShipmentStatus()) {
      result = result.filter(o => o.shipmentStatus === this.filterShipmentStatus());
    }

    if (this.filterServiceLevel()) {
      result = result.filter(o => o.serviceLevel === this.filterServiceLevel());
    }

    if (this.filterDateFrom()) {
      result = result.filter(o => o.estimatedDelivery >= new Date(this.filterDateFrom()));
    }
    if (this.filterDateTo()) {
      result = result.filter(o => o.estimatedDelivery <= new Date(this.filterDateTo()));
    }

    result = [...result].sort((a, b) => {
      let aVal: any = a.estimatedDelivery;
      let bVal: any = b.estimatedDelivery;

      if (this.sortField() === 'orderNumber') {
        aVal = a.orderNumber;
        bVal = b.orderNumber;
      } else if (this.sortField() === 'customer') {
        aVal = a.customer.name;
        bVal = b.customer.name;
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

  shippedOrders = computed(() => this.orders());

  exceptionOrders = computed(() => this.orders().filter(o => o.shipmentStatus === 'exception'));

  shipmentStats = computed(() => [
    {
      label: 'In Transit',
      value: this.orders().filter(o => o.shipmentStatus === 'in_transit').length.toString(),
      trend: 12.5,
      icon: 'truck',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      filter: 'in_transit'
    },
    {
      label: 'Out for Delivery',
      value: this.orders().filter(o => o.shipmentStatus === 'out_for_delivery').length.toString(),
      trend: 8.3,
      icon: 'box-seam',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      filter: 'out_for_delivery'
    },
    {
      label: 'Exceptions',
      value: this.exceptionOrders().length.toString(),
      trend: -5.2,
      icon: 'exclamation-triangle',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      filter: 'exception'
    },
    {
      label: 'Delivered Today',
      value: '12',
      trend: 15.0,
      icon: 'check-circle',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      filter: 'delivered_today'
    },
    {
      label: 'Avg Transit Time',
      value: '2.3 days',
      trend: -8.1,
      icon: 'clock-history',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      filter: 'transit_time'
    },
    {
      label: 'On-Time Rate',
      value: '94%',
      trend: 2.4,
      icon: 'graph-up-arrow',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      filter: 'on_time'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterCarrier()) count++;
    if (this.filterShipmentStatus()) count++;
    if (this.filterServiceLevel()) count++;
    if (this.filterDateFrom() || this.filterDateTo()) count++;
    return count;
  });

  selectedQuickFilter = signal<string>('');

  toggleFilters() { this.showFilters.update(v => !v); }
  toggleViewMode() { this.viewMode.update(v => v === 'table' ? 'grid' : 'table'); }

  refreshTracking() {
    this.isRefreshing.set(true);
    setTimeout(() => this.isRefreshing.set(false), 1000);
  }

  getOrderMenuItems(order: ShippedOrder): DropdownItem[] {
    return [
      { id: 'track', label: 'Track Package', icon: 'geo-alt' },
      { id: 'details', label: 'Shipment Details', icon: 'box' },
      { id: 'print', label: 'Print Label', icon: 'printer' },
      { id: 'divider', label: '', divider: true },
      { id: 'mark_delivered', label: 'Mark Delivered', icon: 'check-lg' },
      { id: 'report_issue', label: 'Report Issue', icon: 'exclamation-circle', danger: true }
    ];
  }

  onExport(item: DropdownItem) { console.log('Export', item.id); }

  onOrderAction(item: DropdownItem, order: ShippedOrder) {
    if (item.id === 'track') this.viewTrackingDetails(order);
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
      this.sortDirection.set('asc');
    }
  }

  applyQuickFilter(filter: string) {
    this.selectedQuickFilter.set(filter);
    this.clearAllFilters();
    if (['in_transit', 'out_for_delivery', 'exception'].includes(filter)) {
      this.filterShipmentStatus.set(filter);
    }
  }

  clearAllFilters() {
    this.filterCarrier.set('');
    this.filterShipmentStatus.set('');
    this.filterServiceLevel.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  viewExceptions() { this.filterShipmentStatus.set('exception'); }

  copyTracking(trackingNumber: string) {
    navigator.clipboard.writeText(trackingNumber);
  }

  viewTrackingDetails(order: ShippedOrder) {
    console.log('View tracking for', order.trackingNumber);
  }

  printShippingLabels() { console.log('Print labels'); }
  bulkUpdateTracking() { console.log('Bulk refresh tracking'); }
  bulkPrintLabels() { console.log('Bulk print labels'); }
  bulkNotifyCustomers() { console.log('Bulk notify'); }
  bulkMarkDelivered() { console.log('Bulk mark delivered'); }

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

  getShipmentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      in_transit: 'bg-blue-100 text-blue-800',
      out_for_delivery: 'bg-green-100 text-green-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      exception: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getShipmentStatusDot(status: string): string {
    const colors: Record<string, string> = {
      in_transit: 'bg-blue-500',
      out_for_delivery: 'bg-green-500 animate-pulse',
      delivered: 'bg-emerald-500',
      exception: 'bg-red-500',
      returned: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  getShipmentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      exception: 'Exception',
      returned: 'Returned'
    };
    return labels[status] || status;
  }

  getDeliveryColor(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    if (diff < 0) return 'text-gray-500';
    if (diff < 24 * 60 * 60 * 1000) return 'text-amber-600';
    return 'text-green-600';
  }

  getDeliveryCountdown(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    if (diff < 0) return 'Delivered';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  }

  getTimeAgo(date: Date): string {
    const diff = new Date().getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}