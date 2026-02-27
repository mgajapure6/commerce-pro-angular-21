// order-processing.ts
import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface ProcessingOrder {
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
  status: 'confirmed' | 'picking' | 'packing' | 'ready_to_ship' | 'shipped';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRush: boolean;
  slaStatus: 'on_track' | 'at_risk' | 'overdue';
  slaDeadline: Date;
  warehouse?: {
    code: string;
    location: string;
  };
  updatedAt: Date;
  lastActionBy: string;
}

@Component({
  selector: 'app-order-processing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './order-processing.html',
  styleUrl: './order-processing.scss'
})
export class OrderProcessing implements OnInit, OnDestroy {
  // expose global Math for template
  readonly Math: typeof Math = Math;
  
  // View State
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  selectedOrders = signal<string[]>([]);
  autoRefresh = signal(false);
  private refreshInterval?: number;

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(25);
  
  // Filters
  searchQuery = signal('');
  filterStatus = signal<string>('');
  filterPriority = signal<string>('');
  filterWarehouse = signal<string>('');
  filterSlaStatus = signal<string>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');

  // Sorting
  sortField = signal<string>('updatedAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Data
  orders = signal<ProcessingOrder[]>([]);

  exportItems: DropdownItem[] = [
    { id: 'csv', label: 'Export as CSV', icon: 'filetype-csv' },
    { id: 'excel', label: 'Export as Excel', icon: 'filetype-xlsx' },
    { id: 'pdf', label: 'Export as PDF', icon: 'filetype-pdf' }
  ];
  
  ngOnInit() {
    this.loadOrders();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadOrders() {
    const now = new Date();
    this.orders.set([
      {
        id: 'proc_001',
        orderId: 'ord_003',
        orderNumber: 'ORD-2024-003',
        customer: {
          name: 'Emma Davis',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        items: [
          { productId: 'prod_004', name: 'Smart Watch', quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop' },
          { productId: 'prod_005', name: 'Watch Band', quantity: 1, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=150&h=150&fit=crop' }
        ],
        status: 'confirmed',
        priority: 'urgent',
        isRush: true,
        slaStatus: 'at_risk',
        slaDeadline: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours
        warehouse: { code: 'WH-EAST', location: 'New Jersey' },
        updatedAt: new Date('2024-01-15T14:20:00'),
        lastActionBy: 'System'
      },
      {
        id: 'proc_002',
        orderId: 'ord_005',
        orderNumber: 'ORD-2024-005',
        customer: {
          name: 'Lisa Anderson',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_009', name: 'Leather Handbag', quantity: 1, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop' }
        ],
        status: 'picking',
        priority: 'high',
        isRush: false,
        slaStatus: 'on_track',
        slaDeadline: new Date(now.getTime() + 8 * 60 * 60 * 1000), // 8 hours
        warehouse: { code: 'WH-WEST', location: 'California' },
        updatedAt: new Date('2024-01-15T16:30:00'),
        lastActionBy: 'J. Smith'
      },
      {
        id: 'proc_003',
        orderId: 'ord_008',
        orderNumber: 'ORD-2024-008',
        customer: {
          name: 'David Brown',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_016', name: 'Gaming Laptop', quantity: 1, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150&h=150&fit=crop' }
        ],
        status: 'packing',
        priority: 'urgent',
        isRush: true,
        slaStatus: 'overdue',
        slaDeadline: new Date(now.getTime() - 30 * 60 * 1000), // 30 min overdue
        warehouse: { code: 'WH-CENTRAL', location: 'Texas' },
        updatedAt: new Date('2024-01-15T12:00:00'),
        lastActionBy: 'M. Wilson'
      },
      {
        id: 'proc_004',
        orderId: 'ord_001',
        orderNumber: 'ORD-2024-001',
        customer: {
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        items: [
          { productId: 'prod_001', name: 'Wireless Headphones', quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop' }
        ],
        status: 'ready_to_ship',
        priority: 'high',
        isRush: false,
        slaStatus: 'on_track',
        slaDeadline: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        warehouse: { code: 'WH-EAST', location: 'New Jersey' },
        updatedAt: new Date('2024-01-15T18:00:00'),
        lastActionBy: 'S. Jones'
      },
      {
        id: 'proc_005',
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
        status: 'confirmed',
        priority: 'medium',
        isRush: false,
        slaStatus: 'on_track',
        slaDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        updatedAt: new Date('2024-01-15T10:15:00'),
        lastActionBy: 'System'
      },
      {
        id: 'proc_006',
        orderId: 'ord_007',
        orderNumber: 'ORD-2024-007',
        customer: {
          name: 'Jennifer Martinez',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        items: [
          { productId: 'prod_013', name: 'Yoga Mat', quantity: 1, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=150&h=150&fit=crop' }
        ],
        status: 'picking',
        priority: 'low',
        isRush: false,
        slaStatus: 'on_track',
        slaDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        warehouse: { code: 'WH-WEST', location: 'California' },
        updatedAt: new Date('2024-01-15T20:05:00'),
        lastActionBy: 'K. Lee'
      }
    ]);
  }

  filteredOrders = computed(() => {
    let result = this.orders().filter(o => 
      o.status !== 'shipped' && 
      (this.filterStatus() ? o.status === this.filterStatus() : true)
    );

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(o => 
        o.orderNumber.toLowerCase().includes(query) ||
        o.customer.name.toLowerCase().includes(query) ||
        o.items.some(i => i.name.toLowerCase().includes(query))
      );
    }

    if (this.filterPriority()) {
      result = result.filter(o => o.priority === this.filterPriority());
    }

    if (this.filterWarehouse()) {
      result = result.filter(o => o.warehouse?.code === this.filterWarehouse());
    }

    if (this.filterSlaStatus()) {
      result = result.filter(o => o.slaStatus === this.filterSlaStatus());
    }

    if (this.filterDateFrom()) {
      result = result.filter(o => o.updatedAt >= new Date(this.filterDateFrom()));
    }
    if (this.filterDateTo()) {
      result = result.filter(o => o.updatedAt <= new Date(this.filterDateTo()));
    }

    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (this.sortField()) {
        case 'orderNumber': aVal = a.orderNumber; bVal = b.orderNumber; break;
        case 'customer': aVal = a.customer.name; bVal = b.customer.name; break;
        case 'items': aVal = a.items.length; bVal = b.items.length; break;
        case 'updatedAt': aVal = a.updatedAt; bVal = b.updatedAt; break;
        default: aVal = a.slaDeadline; bVal = b.slaDeadline;
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

  activeOrders = computed(() => this.orders().filter(o => o.status !== 'shipped'));

  atRiskOrders = computed(() => this.activeOrders().filter(o => o.slaStatus === 'at_risk' || o.slaStatus === 'overdue'));

  processingStats = computed(() => [
    { 
      label: 'Confirmed', 
      value: this.activeOrders().filter(o => o.status === 'confirmed').length.toString(), 
      trend: 5.2, 
      icon: 'check-circle', 
      bgColor: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      filter: 'confirmed',
      avgTime: '2h 15m'
    },
    { 
      label: 'Picking', 
      value: this.activeOrders().filter(o => o.status === 'picking').length.toString(), 
      trend: -3.1, 
      icon: 'cart', 
      bgColor: 'bg-amber-100', 
      iconColor: 'text-amber-600',
      filter: 'picking',
      avgTime: '45m'
    },
    { 
      label: 'Packing', 
      value: this.activeOrders().filter(o => o.status === 'packing').length.toString(), 
      trend: 8.5, 
      icon: 'box-seam', 
      bgColor: 'bg-indigo-100', 
      iconColor: 'text-indigo-600',
      filter: 'packing',
      avgTime: '30m'
    },
    { 
      label: 'Ready to Ship', 
      value: this.activeOrders().filter(o => o.status === 'ready_to_ship').length.toString(), 
      trend: 12.3, 
      icon: 'box-arrow-right', 
      bgColor: 'bg-green-100', 
      iconColor: 'text-green-600',
      filter: 'ready_to_ship',
      avgTime: '15m'
    },
    { 
      label: 'At Risk', 
      value: this.atRiskOrders().length.toString(), 
      trend: -15.0, 
      icon: 'exclamation-triangle', 
      bgColor: 'bg-red-100', 
      iconColor: 'text-red-600',
      filter: 'at_risk'
    },
    { 
      label: 'Throughput', 
      value: '127/hr', 
      trend: 5.8, 
      icon: 'speedometer2', 
      bgColor: 'bg-emerald-100', 
      iconColor: 'text-emerald-600',
      filter: 'throughput'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterStatus()) count++;
    if (this.filterPriority()) count++;
    if (this.filterWarehouse()) count++;
    if (this.filterSlaStatus()) count++;
    if (this.filterDateFrom() || this.filterDateTo()) count++;
    return count;
  });

  selectedQuickFilter = signal<string>('');

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  toggleViewMode() {
    this.viewMode.update(v => v === 'table' ? 'grid' : 'table');
  }

  toggleAutoRefresh() {
    this.autoRefresh.update(v => !v);
    if (this.autoRefresh()) {
      this.refreshInterval = window.setInterval(() => {
        this.loadOrders();
      }, 30000); // Refresh every 30 seconds
    } else if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  getOrderMenuItems(order: ProcessingOrder): DropdownItem[] {
    const items: DropdownItem[] = [
      { id: 'view', label: 'View Details', icon: 'eye', shortcut: '⌘V' },
      { id: 'print', label: 'Print Pick List', icon: 'printer' },
      { id: 'history', label: 'Status History', icon: 'clock-history' }
    ];

    if (order.status === 'confirmed') {
      items.push({ id: 'start_picking', label: 'Start Picking', icon: 'cart' });
    } else if (order.status === 'picking') {
      items.push({ id: 'start_packing', label: 'Start Packing', icon: 'box-seam' });
    } else if (order.status === 'packing') {
      items.push({ id: 'mark_ready', label: 'Mark Ready to Ship', icon: 'check-circle' });
    }

    items.push(
      { id: 'divider', label: '', divider: true },
      { id: 'hold', label: 'Place on Hold', icon: 'pause-circle' },
      { id: 'priority', label: 'Change Priority', icon: 'arrow-up-circle' }
    );

    return items;
  }

  onExport(item: DropdownItem) {
    console.log('Exporting as', item.id);
  }

  onOrderAction(item: DropdownItem, order: ProcessingOrder) {
    switch (item.id) {
      case 'start_picking':
        this.updateStatus(order, 'picking');
        break;
      case 'start_packing':
        this.updateStatus(order, 'packing');
        break;
      case 'mark_ready':
        this.updateStatus(order, 'ready_to_ship');
        break;
      case 'hold':
        console.log('Placing on hold:', order.orderNumber);
        break;
      case 'priority':
        console.log('Changing priority:', order.orderNumber);
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
    this.clearAllFilters();
    
    if (filter === 'confirmed' || filter === 'picking' || filter === 'packing' || filter === 'ready_to_ship') {
      this.filterStatus.set(filter);
    } else if (filter === 'at_risk') {
      this.filterSlaStatus.set('at_risk');
    }
  }

  clearAllFilters() {
    this.filterStatus.set('');
    this.filterPriority.set('');
    this.filterWarehouse.set('');
    this.filterSlaStatus.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  viewAtRiskOrders() {
    this.filterSlaStatus.set('at_risk');
  }

  updateStatus(order: ProcessingOrder, newStatus: ProcessingOrder['status']) {
    console.log('Updating status:', order.orderNumber, '->', newStatus);
    this.orders.update(orders => 
      orders.map(o => o.id === order.id ? { ...o, status: newStatus, updatedAt: new Date() } : o)
    );
  }

  assignWarehouse(order: ProcessingOrder) {
    console.log('Assigning warehouse for:', order.orderNumber);
  }

  bulkUpdateStatus(status: ProcessingOrder['status']) {
    console.log('Bulk updating status to', status, 'for', this.selectedOrders().length, 'orders');
  }

  bulkPrintPackingSlips() {
    console.log('Printing packing slips for', this.selectedOrders().length, 'orders');
  }

  bulkAssignWarehouse() {
    console.log('Assigning warehouse to', this.selectedOrders().length, 'orders');
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
      confirmed: 'bg-blue-100 text-blue-800',
      picking: 'bg-amber-100 text-amber-800',
      packing: 'bg-indigo-100 text-indigo-800',
      ready_to_ship: 'bg-green-100 text-green-800',
      shipped: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusDot(status: string): string {
    const colors: Record<string, string> = {
      confirmed: 'bg-blue-500',
      picking: 'bg-amber-500',
      packing: 'bg-indigo-500',
      ready_to_ship: 'bg-green-500',
      shipped: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      confirmed: 'Confirmed',
      picking: 'Picking',
      packing: 'Packing',
      ready_to_ship: 'Ready to Ship',
      shipped: 'Shipped'
    };
    return labels[status] || status;
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

  getSlaColor(status: string): string {
    const colors: Record<string, string> = {
      on_track: 'text-green-600',
      at_risk: 'text-amber-600',
      overdue: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }

  getSlaIcon(status: string): string {
    const icons: Record<string, string> = {
      on_track: 'check-circle-fill',
      at_risk: 'exclamation-triangle-fill',
      overdue: 'x-circle-fill'
    };
    return icons[status] || 'question-circle';
  }

  getSlaLabel(status: string): string {
    const labels: Record<string, string> = {
      on_track: 'On Track',
      at_risk: 'At Risk',
      overdue: 'Overdue'
    };
    return labels[status] || status;
  }

  getSlaTimeRemaining(deadline: Date): string {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (diff < 0) {
      const overdueHours = Math.abs(hours);
      return `${overdueHours}h overdue`;
    }
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
    }
    return `${hours}h ${minutes}m left`;
  }

  getProgressPercentage(status: string): number {
    const percentages: Record<string, number> = {
      confirmed: 20,
      picking: 40,
      packing: 60,
      ready_to_ship: 80,
      shipped: 100
    };
    return percentages[status] || 0;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}