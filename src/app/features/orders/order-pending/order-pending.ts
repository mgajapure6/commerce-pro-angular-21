// pending-approvals.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface Approval {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    avatar: string;
    type: 'new' | 'returning' | 'vip' | 'wholesale';
  };
  approvalType: 'price_override' | 'discount' | 'credit_limit' | 'bulk_order' | 'custom_product' | 'return';
  reason: string;
  amount: number;
  originalAmount?: number;
  items: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedAt: Date;
  requestedBy: string;
  assignedTo?: {
    name: string;
    avatar: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  notes?: string;
}

@Component({
  selector: 'app-order-pending',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './order-pending.html',
  styleUrl: './order-pending.scss'
})
export class OrderPending implements OnInit {
  // expose global Math for template
  readonly Math: typeof Math = Math;
  
  // View State
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  selectedApprovals = signal<string[]>([]);
  isRefreshing = signal(false);
  selectedApproval = signal<Approval | null>(null);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  
  // Filters
  searchQuery = signal('');
  filterApprovalType = signal<string>('');
  filterPriority = signal<string>('');
  filterMinAmount = signal<number | null>(null);
  filterMaxAmount = signal<number | null>(null);
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterApprover = signal<string>('');

  // Sorting
  sortField = signal<string>('requestedAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Data
  approvals = signal<Approval[]>([]);

  exportItems: DropdownItem[] = [
    { id: 'csv', label: 'Export as CSV', icon: 'filetype-csv' },
    { id: 'excel', label: 'Export as Excel', icon: 'filetype-xlsx' },
    { id: 'pdf', label: 'Export as PDF', icon: 'filetype-pdf' }
  ];
  
  ngOnInit() {
    this.loadApprovals();
  }

  loadApprovals() {
    this.approvals.set([
      {
        id: 'appr_001',
        orderId: 'ord_003',
        orderNumber: 'ORD-2024-003',
        customer: {
          name: 'Emma Davis',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        approvalType: 'discount',
        reason: 'Discount exceeds standard 10% threshold - requesting 15% VIP discount for first-time high-value customer',
        amount: 488.56,
        originalAmount: 538.56,
        items: 3,
        priority: 'urgent',
        requestedAt: new Date('2024-01-15T14:20:00'),
        requestedBy: 'Sales Rep',
        assignedTo: {
          name: 'John Smith',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        status: 'pending',
        notes: 'Customer willing to place recurring orders if approved'
      },
      {
        id: 'appr_002',
        orderId: 'ord_008',
        orderNumber: 'ORD-2024-008',
        customer: {
          name: 'David Brown',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        approvalType: 'credit_limit',
        reason: 'Order exceeds current credit limit of $1,500. Customer requesting $1,662.98 on net-30 terms',
        amount: 1662.98,
        items: 2,
        priority: 'high',
        requestedAt: new Date('2024-01-12T16:00:00'),
        requestedBy: 'Account Manager',
        status: 'pending'
      },
      {
        id: 'appr_003',
        orderId: 'ord_011',
        orderNumber: 'ORD-2024-011',
        customer: {
          name: 'Acme Corp',
          avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop',
          type: 'wholesale'
        },
        approvalType: 'bulk_order',
        reason: 'Bulk order of 500 units - exceeds standard wholesale threshold',
        amount: 12500.00,
        items: 500,
        priority: 'medium',
        requestedAt: new Date('2024-01-14T09:30:00'),
        requestedBy: 'Wholesale Team',
        assignedTo: {
          name: 'Sarah Jones',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
        },
        status: 'pending'
      },
      {
        id: 'appr_004',
        orderId: 'ord_012',
        orderNumber: 'ORD-2024-012',
        customer: {
          name: 'TechStart Inc',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
          type: 'new'
        },
        approvalType: 'custom_product',
        reason: 'Custom configuration requested - non-standard SKU with extended warranty',
        amount: 8999.99,
        items: 10,
        priority: 'high',
        requestedAt: new Date('2024-01-15T11:00:00'),
        requestedBy: 'Product Specialist',
        status: 'pending'
      },
      {
        id: 'appr_005',
        orderId: 'ord_013',
        orderNumber: 'ORD-2024-013',
        customer: {
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        approvalType: 'price_override',
        reason: 'Price match request - competitor offering 5% lower on identical product',
        amount: 284.99,
        originalAmount: 299.99,
        items: 1,
        priority: 'low',
        requestedAt: new Date('2024-01-15T08:15:00'),
        requestedBy: 'Customer Service',
        assignedTo: {
          name: 'Mike Wilson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        status: 'pending'
      },
      {
        id: 'appr_006',
        orderId: 'ord_014',
        orderNumber: 'ORD-2024-014',
        customer: {
          name: 'Global Retail Ltd',
          avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&h=150&fit=crop',
          type: 'wholesale'
        },
        approvalType: 'return',
        reason: 'Partial return approval - 50 items from order ORD-2024-009, customer claims manufacturing defect',
        amount: -2500.00,
        items: 50,
        priority: 'urgent',
        requestedAt: new Date('2024-01-13T16:45:00'),
        requestedBy: 'Returns Dept',
        status: 'pending',
        notes: 'Quality control inspection required before approval'
      },
      {
        id: 'appr_007',
        orderId: 'ord_015',
        orderNumber: 'ORD-2024-015',
        customer: {
          name: 'Michael Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          type: 'returning'
        },
        approvalType: 'discount',
        reason: 'Loyalty reward - 20% discount for 5th order milestone',
        amount: 139.99,
        originalAmount: 174.99,
        items: 1,
        priority: 'medium',
        requestedAt: new Date('2024-01-14T13:20:00'),
        requestedBy: 'Loyalty Program',
        status: 'pending'
      },
      {
        id: 'appr_008',
        orderId: 'ord_016',
        orderNumber: 'ORD-2024-016',
        customer: {
          name: 'Lisa Anderson',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          type: 'vip'
        },
        approvalType: 'credit_limit',
        reason: 'Temporary credit extension for holiday season - customer has excellent payment history',
        amount: 2500.00,
        items: 8,
        priority: 'medium',
        requestedAt: new Date('2024-01-12T10:00:00'),
        requestedBy: 'Finance Team',
        assignedTo: {
          name: 'Sarah Jones',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
        },
        status: 'pending'
      }
    ]);
  }

  filteredApprovals = computed(() => {
    let result = this.approvals().filter(a => a.status === 'pending');

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(a => 
        a.orderNumber.toLowerCase().includes(query) ||
        a.customer.name.toLowerCase().includes(query) ||
        a.reason.toLowerCase().includes(query) ||
        a.requestedBy.toLowerCase().includes(query)
      );
    }

    if (this.filterApprovalType()) {
      result = result.filter(a => a.approvalType === this.filterApprovalType());
    }

    if (this.filterPriority()) {
      result = result.filter(a => a.priority === this.filterPriority());
    }

    if (this.filterMinAmount()) {
      result = result.filter(a => Math.abs(a.amount) >= this.filterMinAmount()!);
    }
    if (this.filterMaxAmount()) {
      result = result.filter(a => Math.abs(a.amount) <= this.filterMaxAmount()!);
    }

    if (this.filterDateFrom()) {
      result = result.filter(a => a.requestedAt >= new Date(this.filterDateFrom()));
    }
    if (this.filterDateTo()) {
      result = result.filter(a => a.requestedAt <= new Date(this.filterDateTo()));
    }

    if (this.filterApprover()) {
      if (this.filterApprover() === 'unassigned') {
        result = result.filter(a => !a.assignedTo);
      } else {
        result = result.filter(a => a.assignedTo?.name.toLowerCase().includes(this.filterApprover().toLowerCase()));
      }
    }

    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (this.sortField()) {
        case 'amount': aVal = Math.abs(a.amount); bVal = Math.abs(b.amount); break;
        case 'customer': aVal = a.customer.name; bVal = b.customer.name; break;
        case 'orderNumber': aVal = a.orderNumber; bVal = b.orderNumber; break;
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

  paginatedApprovals = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredApprovals().slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() => Math.ceil(this.filteredApprovals().length / this.itemsPerPage()));

  pendingApprovals = computed(() => this.approvals().filter(a => a.status === 'pending'));

  urgentApprovals = computed(() => this.pendingApprovals().filter(a => a.priority === 'urgent'));

  approvalStats = computed(() => [
    { 
      label: 'Pending', 
      value: this.pendingApprovals().length.toString(), 
      trend: -5.2, 
      icon: 'clock-history', 
      bgColor: 'bg-amber-100', 
      iconColor: 'text-amber-600',
      filter: 'all'
    },
    { 
      label: 'Price Override', 
      value: this.pendingApprovals().filter(a => a.approvalType === 'price_override').length.toString(), 
      trend: 12.5, 
      icon: 'tag', 
      bgColor: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      filter: 'price_override'
    },
    { 
      label: 'Discount', 
      value: this.pendingApprovals().filter(a => a.approvalType === 'discount').length.toString(), 
      trend: 8.1, 
      icon: 'percent', 
      bgColor: 'bg-purple-100', 
      iconColor: 'text-purple-600',
      filter: 'discount'
    },
    { 
      label: 'Credit Limit', 
      value: this.pendingApprovals().filter(a => a.approvalType === 'credit_limit').length.toString(), 
      trend: 15.3, 
      icon: 'credit-card', 
      bgColor: 'bg-indigo-100', 
      iconColor: 'text-indigo-600',
      filter: 'credit_limit'
    },
    { 
      label: 'Bulk Orders', 
      value: this.pendingApprovals().filter(a => a.approvalType === 'bulk_order').length.toString(), 
      trend: 22.7, 
      icon: 'boxes', 
      bgColor: 'bg-green-100', 
      iconColor: 'text-green-600',
      filter: 'bulk_order'
    },
    { 
      label: 'Total Value', 
      value: '$' + this.pendingApprovals().reduce((sum, a) => sum + Math.abs(a.amount), 0).toFixed(2), 
      trend: 18.4, 
      icon: 'cash-stack', 
      bgColor: 'bg-emerald-100', 
      iconColor: 'text-emerald-600',
      filter: 'value'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterApprovalType()) count++;
    if (this.filterPriority()) count++;
    if (this.filterDateFrom() || this.filterDateTo()) count++;
    if (this.filterMinAmount() || this.filterMaxAmount()) count++;
    if (this.filterApprover()) count++;
    return count;
  });

  selectedQuickFilter = signal<string>('');

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  toggleViewMode() {
    this.viewMode.update(v => v === 'table' ? 'grid' : 'table');
  }

  refreshApprovals() {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
      this.loadApprovals();
    }, 1000);
  }

  getApprovalMenuItems(approval: Approval): DropdownItem[] {
    const items: DropdownItem[] = [
      { id: 'view', label: 'View Details', icon: 'eye', shortcut: '⌘V' },
      { id: 'history', label: 'Approval History', icon: 'clock-history' }
    ];

    if (!approval.assignedTo) {
      items.push({ id: 'assign', label: 'Assign to Me', icon: 'person-check' });
    } else {
      items.push({ id: 'reassign', label: 'Reassign', icon: 'arrow-left-right' });
    }

    items.push(
      { id: 'escalate', label: 'Escalate', icon: 'arrow-up-circle' },
      { id: 'divider', label: '', divider: true },
      { id: 'request_info', label: 'Request More Info', icon: 'question-circle' }
    );

    return items;
  }

  onExport(item: DropdownItem) {
    console.log('Exporting as', item.id);
  }

  onApprovalAction(item: DropdownItem, approval: Approval) {
    switch (item.id) {
      case 'view':
        this.selectedApproval.set(approval);
        break;
      case 'assign':
        this.assignToMe(approval);
        break;
      case 'escalate':
        this.escalateApproval(approval);
        break;
      case 'request_info':
        this.requestMoreInfo(approval);
        break;
    }
  }

  toggleSelection(approvalId: string) {
    this.selectedApprovals.update(selected => {
      if (selected.includes(approvalId)) {
        return selected.filter(id => id !== approvalId);
      } else {
        return [...selected, approvalId];
      }
    });
  }

  isSelected(approvalId: string): boolean {
    return this.selectedApprovals().includes(approvalId);
  }

  isAllSelected(): boolean {
    return this.paginatedApprovals().length > 0 && 
           this.paginatedApprovals().every(a => this.isSelected(a.id));
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedApprovals.set([]);
    } else {
      this.selectedApprovals.set(this.paginatedApprovals().map(a => a.id));
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
    
    if (filter === 'price_override' || filter === 'discount' || filter === 'credit_limit' || filter === 'bulk_order') {
      this.filterApprovalType.set(filter);
    }
  }

  clearAllFilters() {
    this.filterApprovalType.set('');
    this.filterPriority.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterMinAmount.set(null);
    this.filterMaxAmount.set(null);
    this.filterApprover.set('');
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  viewUrgentApprovals() {
    this.filterPriority.set('urgent');
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

  approveOrder(approval: Approval) {
    console.log('Approving:', approval.orderNumber);
    this.updateApprovalStatus(approval.id, 'approved');
  }

  rejectOrder(approval: Approval) {
    console.log('Rejecting:', approval.orderNumber);
    this.updateApprovalStatus(approval.id, 'rejected');
  }

  assignApprover(approval: Approval) {
    console.log('Assigning approver for:', approval.orderNumber);
  }

  bulkApprove() {
    console.log('Bulk approving:', this.selectedApprovals().length, 'orders');
  }

  bulkReject() {
    console.log('Bulk rejecting:', this.selectedApprovals().length, 'orders');
  }

  bulkRequestInfo() {
    console.log('Requesting info for:', this.selectedApprovals().length, 'orders');
  }

  bulkAssign() {
    console.log('Bulk assigning:', this.selectedApprovals().length, 'orders');
  }

  assignToMe(approval: Approval) {
    console.log('Assigning to me:', approval.orderNumber);
  }

  escalateApproval(approval: Approval) {
    console.log('Escalating:', approval.orderNumber);
  }

  requestMoreInfo(approval: Approval) {
    console.log('Requesting more info:', approval.orderNumber);
  }

  updateApprovalStatus(id: string, status: 'approved' | 'rejected') {
    this.approvals.update(approvals => 
      approvals.map(a => a.id === id ? { ...a, status } : a)
    );
  }

  closeModal() {
    this.selectedApproval.set(null);
  }

  getApprovalTypeColor(type: string): string {
    const colors: Record<string, string> = {
      price_override: 'bg-blue-100 text-blue-800',
      discount: 'bg-purple-100 text-purple-800',
      credit_limit: 'bg-indigo-100 text-indigo-800',
      bulk_order: 'bg-green-100 text-green-800',
      custom_product: 'bg-orange-100 text-orange-800',
      return: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  getApprovalTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      price_override: 'tag',
      discount: 'percent',
      credit_limit: 'credit-card',
      bulk_order: 'boxes',
      custom_product: 'gear',
      return: 'arrow-counterclockwise'
    };
    return icons[type] || 'question-circle';
  }

  getApprovalTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      price_override: 'Price Override',
      discount: 'High Discount',
      credit_limit: 'Credit Limit',
      bulk_order: 'Bulk Order',
      custom_product: 'Custom Product',
      return: 'Return/Refund'
    };
    return labels[type] || type;
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  }

  getPriorityDot(priority: string): string {
    const colors: Record<string, string> = {
      low: 'bg-gray-400',
      medium: 'bg-blue-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[priority] || 'bg-gray-400';
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
    return `${Math.floor(days / 7)}w ago`;
  }
}