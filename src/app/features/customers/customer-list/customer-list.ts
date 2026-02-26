import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface CustomerAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface CustomerOrder {
  orderId: string;
  orderNumber: string;
  total: number;
  status: string;
  date: Date;
}

interface Customer {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  type: 'new' | 'returning' | 'vip' | 'wholesale';
  status: 'active' | 'inactive' | 'blocked';
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  registeredAt: Date;
  addresses: {
    shipping: CustomerAddress;
    billing: CustomerAddress;
  };
  recentOrders: CustomerOrder[];
  tags: string[];
  notes?: string;
  marketingConsent: boolean;
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './customer-list.html'
})
export class CustomerList implements OnInit {
  // View State
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  selectedCustomers = signal<string[]>([]);
  expandedCustomer = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(25);

  // Filters
  searchQuery = signal('');
  filterType = signal<string>('');
  filterStatus = signal<string>('');
  filterMinOrders = signal<number | null>(null);
  filterMaxOrders = signal<number | null>(null);
  filterMinSpent = signal<number | null>(null);
  filterMaxSpent = signal<number | null>(null);
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterTags = signal<string>('');
  filterMarketingConsent = signal<boolean | null>(null);

  // Sorting
  sortField = signal<string>('registeredAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Data
  customers = signal<Customer[]>([]);

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customers.set([
      {
        id: 'cust_001',
        customerNumber: 'C-2024-0001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        type: 'vip',
        status: 'active',
        totalOrders: 24,
        totalSpent: 4850.75,
        averageOrderValue: 202.11,
        lastOrderDate: new Date('2024-01-15'),
        registeredAt: new Date('2022-03-15'),
        addresses: {
          shipping: {
            line1: '123 Park Avenue',
            line2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA'
          },
          billing: {
            line1: '123 Park Avenue',
            line2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA'
          }
        },
        recentOrders: [
          { orderId: 'ord_001', orderNumber: 'ORD-2024-001', total: 368.97, status: 'shipped', date: new Date('2024-01-15') },
          { orderId: 'ord_045', orderNumber: 'ORD-2023-145', total: 520.50, status: 'delivered', date: new Date('2023-12-20') }
        ],
        tags: ['vip', 'newsletter', 'mobile-app'],
        marketingConsent: true
      },
      {
        id: 'cust_002',
        customerNumber: 'C-2024-0002',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@email.com',
        phone: '+1 (555) 234-5678',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        type: 'returning',
        status: 'active',
        totalOrders: 8,
        totalSpent: 1245.80,
        averageOrderValue: 155.73,
        lastOrderDate: new Date('2024-01-14'),
        registeredAt: new Date('2023-06-20'),
        addresses: {
          shipping: {
            line1: '456 Tech Boulevard',
            city: 'San Francisco',
            state: 'CA',
            zip: '94105',
            country: 'USA'
          },
          billing: {
            line1: '456 Tech Boulevard',
            city: 'San Francisco',
            state: 'CA',
            zip: '94105',
            country: 'USA'
          }
        },
        recentOrders: [
          { orderId: 'ord_002', orderNumber: 'ORD-2024-002', total: 174.99, status: 'shipped', date: new Date('2024-01-14') }
        ],
        tags: ['tech-enthusiast'],
        marketingConsent: true
      },
      {
        id: 'cust_003',
        customerNumber: 'C-2024-0003',
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@email.com',
        phone: '+1 (555) 345-6789',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        type: 'new',
        status: 'active',
        totalOrders: 1,
        totalSpent: 488.56,
        averageOrderValue: 488.56,
        lastOrderDate: new Date('2024-01-15'),
        registeredAt: new Date('2024-01-10'),
        addresses: {
          shipping: {
            line1: '789 Fashion Street',
            line2: 'Suite 100',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90001',
            country: 'USA'
          },
          billing: {
            line1: '789 Fashion Street',
            line2: 'Suite 100',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90001',
            country: 'USA'
          }
        },
        recentOrders: [
          { orderId: 'ord_003', orderNumber: 'ORD-2024-003', total: 488.56, status: 'pending', date: new Date('2024-01-15') }
        ],
        tags: ['first-time', 'high-value'],
        marketingConsent: false
      },
      {
        id: 'cust_004',
        customerNumber: 'C-2024-0004',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@email.com',
        phone: '+1 (555) 456-7890',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        type: 'returning',
        status: 'active',
        totalOrders: 15,
        totalSpent: 2890.25,
        averageOrderValue: 192.68,
        lastOrderDate: new Date('2024-01-10'),
        registeredAt: new Date('2021-08-05'),
        addresses: {
          shipping: {
            line1: '321 Sports Lane',
            city: 'Chicago',
            state: 'IL',
            zip: '60601',
            country: 'USA'
          },
          billing: {
            line1: '321 Sports Lane',
            city: 'Chicago',
            state: 'IL',
            zip: '60601',
            country: 'USA'
          }
        },
        recentOrders: [
          { orderId: 'ord_004', orderNumber: 'ORD-2024-004', total: 187.97, status: 'delivered', date: new Date('2024-01-10') }
        ],
        tags: ['sports', 'loyal'],
        marketingConsent: true
      },
      {
        id: 'cust_005',
        customerNumber: 'C-2024-0005',
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@email.com',
        phone: '+1 (555) 567-8901',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        type: 'vip',
        status: 'active',
        totalOrders: 42,
        totalSpent: 12580.50,
        averageOrderValue: 299.54,
        lastOrderDate: new Date('2024-01-15'),
        registeredAt: new Date('2020-01-15'),
        addresses: {
          shipping: {
            line1: '555 Luxury Avenue',
            line2: 'Penthouse',
            city: 'Miami',
            state: 'FL',
            zip: '33101',
            country: 'USA'
          },
          billing: {
            line1: '555 Luxury Avenue',
            line2: 'Penthouse',
            city: 'Miami',
            state: 'FL',
            zip: '33101',
            country: 'USA'
          }
        },
        recentOrders: [
          { orderId: 'ord_005', orderNumber: 'ORD-2024-005', total: 393.98, status: 'processing', date: new Date('2024-01-15') }
        ],
        tags: ['vip', 'wholesale-eligible', 'influencer'],
        notes: 'High-value customer, prioritize support',
        marketingConsent: true
      },
      {
        id: 'cust_006',
        customerNumber: 'C-2024-0006',
        firstName: 'Robert',
        lastName: 'Taylor',
        email: 'robert.taylor@email.com',
        phone: '+1 (555) 678-9012',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        type: 'new',
        status: 'inactive',
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        registeredAt: new Date('2024-01-05'),
        addresses: {
          shipping: {
            line1: '888 Coffee Street',
            city: 'Seattle',
            state: 'WA',
            zip: '98101',
            country: 'USA'
          },
          billing: {
            line1: '888 Coffee Street',
            city: 'Seattle',
            state: 'WA',
            zip: '98101',
            country: 'USA'
          }
        },
        recentOrders: [],
        tags: ['abandoned-cart'],
        marketingConsent: false
      },
      {
        id: 'cust_007',
        customerNumber: 'C-2024-0007',
        firstName: 'Jennifer',
        lastName: 'Martinez',
        email: 'jennifer.martinez@email.com',
        phone: '+1 (555) 789-0123',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        type: 'returning',
        status: 'active',
        totalOrders: 12,
        totalSpent: 1890.00,
        averageOrderValue: 157.50,
        lastOrderDate: new Date('2024-01-13'),
        registeredAt: new Date('2022-11-20'),
        addresses: {
          shipping: {
            line1: '777 Wellness Way',
            city: 'Denver',
            state: 'CO',
            zip: '80201',
            country: 'USA'
          },
          billing: {
            line1: '777 Wellness Way',
            city: 'Denver',
            state: 'CO',
            zip: '80201',
            country: 'USA'
          }
        },
        recentOrders: [
          { orderId: 'ord_007', orderNumber: 'ORD-2024-007', total: 158.47, status: 'pending', date: new Date('2024-01-13') }
        ],
        tags: ['fitness', 'subscription'],
        marketingConsent: true
      },
      {
        id: 'cust_008',
        customerNumber: 'C-2024-0008',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@email.com',
        phone: '+1 (555) 890-1234',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        type: 'vip',
        status: 'active',
        totalOrders: 67,
        totalSpent: 28500.75,
        averageOrderValue: 425.38,
        lastOrderDate: new Date('2024-01-12'),
        registeredAt: new Date('2019-05-10'),
        addresses: {
          shipping: {
            line1: '999 Gaming Boulevard',
            city: 'Austin',
            state: 'TX',
            zip: '78701',
            country: 'USA'
          },
          billing: {
            line1: '999 Gaming Boulevard',
            city: 'Austin',
            state: 'TX',
            zip: '78701',
            country: 'USA'
          }
        },
        recentOrders: [
          { orderId: 'ord_008', orderNumber: 'ORD-2024-008', total: 1662.98, status: 'processing', date: new Date('2024-01-12') }
        ],
        tags: ['vip', 'gaming', 'early-adopter'],
        marketingConsent: true
      },
      {
        id: 'cust_009',
        customerNumber: 'C-2024-0009',
        firstName: 'Amanda',
        lastName: 'White',
        email: 'amanda.white@email.com',
        phone: '+1 (555) 901-2345',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
        type: 'new',
        status: 'blocked',
        totalOrders: 1,
        totalSpent: 189.99,
        averageOrderValue: 189.99,
        lastOrderDate: new Date('2024-01-11'),
        registeredAt: new Date('2024-01-08'),
        addresses: {
          shipping: {
            line1: '111 Beauty Lane',
            city: 'Phoenix',
            state: 'AZ',
            zip: '85001',
            country: 'USA'
          },
          billing: {
            line1: '111 Beauty Lane',
            city: 'Phoenix',
            state: 'AZ',
            zip: '85001',
            country: 'USA'
          }
        },
        recentOrders: [
          { orderId: 'ord_009', orderNumber: 'ORD-2024-009', total: 0, status: 'cancelled', date: new Date('2024-01-11') }
        ],
        tags: ['fraud-suspected'],
        notes: 'Payment failed multiple times, account blocked',
        marketingConsent: false
      },
      {
        id: 'cust_010',
        customerNumber: 'C-2024-0010',
        firstName: 'Thomas',
        lastName: 'Garcia',
        email: 'thomas.garcia@email.com',
        phone: '+1 (555) 012-3456',
        avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
        type: 'wholesale',
        status: 'active',
        totalOrders: 156,
        totalSpent: 45000.00,
        averageOrderValue: 288.46,
        lastOrderDate: new Date('2024-01-08'),
        registeredAt: new Date('2018-03-01'),
        addresses: {
          shipping: {
            line1: '2000 Business Park Drive',
            city: 'Dallas',
            state: 'TX',
            zip: '75201',
            country: 'USA'
          },
          billing: {
            line1: '2000 Business Park Drive',
            city: 'Dallas',
            state: 'TX',
            zip: '75201',
            country: 'USA'
          }
        },
        recentOrders: [
          { orderId: 'ord_010', orderNumber: 'ORD-2024-010', total: 204.97, status: 'delivered', date: new Date('2024-01-08') }
        ],
        tags: ['wholesale', 'b2b', 'net-30'],
        marketingConsent: true
      }
    ]);
  }

  // Computed
  filteredCustomers = computed(() => {
    let result = this.customers();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(c => 
        c.customerNumber.toLowerCase().includes(query) ||
        c.firstName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query)
      );
    }

    if (this.filterType()) {
      result = result.filter(c => c.type === this.filterType());
    }

    if (this.filterStatus()) {
      result = result.filter(c => c.status === this.filterStatus());
    }

    if (this.filterMinOrders() !== null) {
      result = result.filter(c => c.totalOrders >= this.filterMinOrders()!);
    }
    if (this.filterMaxOrders() !== null) {
      result = result.filter(c => c.totalOrders <= this.filterMaxOrders()!);
    }

    if (this.filterMinSpent() !== null) {
      result = result.filter(c => c.totalSpent >= this.filterMinSpent()!);
    }
    if (this.filterMaxSpent() !== null) {
      result = result.filter(c => c.totalSpent <= this.filterMaxSpent()!);
    }

    if (this.filterDateFrom()) {
      result = result.filter(c => c.registeredAt >= new Date(this.filterDateFrom()));
    }
    if (this.filterDateTo()) {
      result = result.filter(c => c.registeredAt <= new Date(this.filterDateTo()));
    }

    if (this.filterTags()) {
      const tagQuery = this.filterTags().toLowerCase();
      result = result.filter(c => c.tags.some(t => t.toLowerCase().includes(tagQuery)));
    }

    if (this.filterMarketingConsent() !== null) {
      result = result.filter(c => c.marketingConsent === this.filterMarketingConsent());
    }

    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (this.sortField()) {
        case 'name': aVal = a.lastName + a.firstName; bVal = b.lastName + b.firstName; break;
        case 'totalOrders': aVal = a.totalOrders; bVal = b.totalOrders; break;
        case 'totalSpent': aVal = a.totalSpent; bVal = b.totalSpent; break;
        case 'averageOrderValue': aVal = a.averageOrderValue; bVal = b.averageOrderValue; break;
        case 'lastOrderDate': aVal = a.lastOrderDate || new Date(0); bVal = b.lastOrderDate || new Date(0); break;
        default: aVal = a.registeredAt; bVal = b.registeredAt;
      }

      if (this.sortDirection() === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  });

  paginatedCustomers = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredCustomers().slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() => Math.ceil(this.filteredCustomers().length / this.itemsPerPage()));

  customerStats = computed(() => [
    { 
      label: 'Total Customers', 
      value: this.customers().length.toString(), 
      trend: 12.5, 
      icon: 'people', 
      bgColor: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      filter: 'all'
    },
    { 
      label: 'New', 
      value: this.customers().filter(c => c.type === 'new').length.toString(), 
      trend: 25.3, 
      icon: 'star', 
      bgColor: 'bg-green-100', 
      iconColor: 'text-green-600',
      filter: 'new'
    },
    { 
      label: 'Returning', 
      value: this.customers().filter(c => c.type === 'returning').length.toString(), 
      trend: 8.1, 
      icon: 'arrow-repeat', 
      bgColor: 'bg-indigo-100', 
      iconColor: 'text-indigo-600',
      filter: 'returning'
    },
    { 
      label: 'VIP', 
      value: this.customers().filter(c => c.type === 'vip').length.toString(), 
      trend: 15.7, 
      icon: 'gem', 
      bgColor: 'bg-purple-100', 
      iconColor: 'text-purple-600',
      filter: 'vip'
    },
    { 
      label: 'Wholesale', 
      value: this.customers().filter(c => c.type === 'wholesale').length.toString(), 
      trend: 5.2, 
      icon: 'building', 
      bgColor: 'bg-orange-100', 
      iconColor: 'text-orange-600',
      filter: 'wholesale'
    },
    { 
      label: 'Total Revenue', 
      value: '$' + this.customers().reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2), 
      trend: 18.9, 
      icon: 'cash-stack', 
      bgColor: 'bg-emerald-100', 
      iconColor: 'text-emerald-600',
      filter: 'revenue'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterType()) count++;
    if (this.filterStatus()) count++;
    if (this.filterMinOrders() !== null || this.filterMaxOrders() !== null) count++;
    if (this.filterMinSpent() !== null || this.filterMaxSpent() !== null) count++;
    if (this.filterDateFrom() || this.filterDateTo()) count++;
    if (this.filterTags()) count++;
    if (this.filterMarketingConsent() !== null) count++;
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

  toggleSelection(customerId: string) {
    this.selectedCustomers.update(selected => {
      if (selected.includes(customerId)) {
        return selected.filter(id => id !== customerId);
      } else {
        return [...selected, customerId];
      }
    });
  }

  isSelected(customerId: string): boolean {
    return this.selectedCustomers().includes(customerId);
  }

  isAllSelected(): boolean {
    return this.paginatedCustomers().length > 0 && 
           this.paginatedCustomers().every(c => this.isSelected(c.id));
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedCustomers.set([]);
    } else {
      this.selectedCustomers.set(this.paginatedCustomers().map(c => c.id));
    }
  }

  toggleExpand(customerId: string) {
    this.expandedCustomer.update(current => current === customerId ? null : customerId);
  }

  isExpanded(customerId: string): boolean {
    return this.expandedCustomer() === customerId;
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
      this.filterType.set('');
    } else if (filter === 'revenue') {
      this.filterType.set('');
    } else {
      this.filterType.set(filter);
    }
  }

  clearAllFilters() {
    this.filterType.set('');
    this.filterStatus.set('');
    this.filterMinOrders.set(null);
    this.filterMaxOrders.set(null);
    this.filterMinSpent.set(null);
    this.filterMaxSpent.set(null);
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterTags.set('');
    this.filterMarketingConsent.set(null);
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  exportCustomers(format: 'csv' | 'excel' | 'pdf' | any) {
    console.log('Exporting customers as', format);
  }

  bulkEmail() {
    console.log('Sending bulk email to', this.selectedCustomers().length, 'customers');
  }

  bulkTag() {
    console.log('Adding tags to', this.selectedCustomers().length, 'customers');
  }

  bulkExport() {
    console.log('Exporting', this.selectedCustomers().length, 'customers');
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

  getCustomerMenuItems(customer: Customer): DropdownItem[] {
    const items: DropdownItem[] = [
      { id: 'view', label: 'View Profile', icon: 'person', shortcut: '⌘V' },
      { id: 'edit', label: 'Edit Customer', icon: 'pencil', shortcut: '⌘E' },
      { id: 'orders', label: 'View Orders', icon: 'bag', shortcut: '⌘O' }
    ];

    if (customer.status !== 'blocked') {
      items.push({ id: 'email', label: 'Send Email', icon: 'envelope', shortcut: '⌘M' });
    }

    items.push({ id: 'divider', label: '', divider: true });

    if (customer.status === 'active') {
      items.push({ id: 'deactivate', label: 'Deactivate', icon: 'pause-circle' });
    } else if (customer.status === 'inactive') {
      items.push({ id: 'activate', label: 'Activate', icon: 'play-circle' });
    }

    if (customer.status !== 'blocked') {
      items.push({ id: 'block', label: 'Block Customer', icon: 'shield-slash', danger: true });
    } else {
      items.push({ id: 'unblock', label: 'Unblock Customer', icon: 'shield-check' });
    }

    return items;
  }

  onCustomerAction(item: DropdownItem, customer: Customer) {
    console.log('Action:', item.id, 'on customer:', customer.customerNumber);
  }

  // Helper methods
  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      new: 'bg-green-100 text-green-800',
      returning: 'bg-blue-100 text-blue-800',
      vip: 'bg-purple-100 text-purple-800',
      wholesale: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusDot(status: string): string {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      inactive: 'bg-gray-500',
      blocked: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  getCustomerTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      new: 'star',
      returning: 'arrow-repeat',
      vip: 'gem',
      wholesale: 'building'
    };
    return icons[type] || 'person';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  getFullName(customer: Customer): string {
    return `${customer.firstName} ${customer.lastName}`;
  }
}