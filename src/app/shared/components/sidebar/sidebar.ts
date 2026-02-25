import { Component, Output, EventEmitter, signal, computed, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Role and Permission types
type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
type Permission =
  | 'manage_users'
  | 'manage_roles'
  | 'manage_integrations'
  | 'manage_flags'
  | 'manage_products'
  | 'manage_orders'
  | 'manage_customers'
  | 'view_analytics'
  | 'manage_marketing'
  | 'manage_inventory';

interface MenuChild {
  id: string;
  label: string;
  route: string;
  permissions?: Permission[];
  badge?: number;
  icon?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  roles?: UserRole[];
  permissions?: Permission[];
  children?: MenuChild[];
  divider?: boolean;
  section?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {


  @Input() isOpen = true;
  @Output() close = new EventEmitter<void>();
  @Output() collapseChange = new EventEmitter<boolean>();

  private router = inject(Router);

  private _expandedMenu = signal<string | null>(null);
  private _isCollapsed = signal(false);

  expandedMenu = computed(() => this._expandedMenu());
  isCollapsed = computed(() => this._isCollapsed());
  isMobile = computed(() => window.innerWidth < 768);

  // Current user context (inject from auth service in real app)
  private currentUserRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN']; // Example
  private currentUserPermissions: Permission[] = [
    'manage_users',
    'manage_roles',
    'manage_products',
    'manage_orders',
    'view_analytics'
  ];

  // Translation helper (replace with i18n service in real app)
  private t(key: string): string {
    const translations: Record<string, string> = {
      'menu.dashboard': 'Dashboard',
      'menu.products': 'Products',
      'menu.products.all': 'All Products',
      'menu.products.add': 'Add Product',
      'menu.products.categories': 'Categories',
      'menu.products.inventory': 'Inventory',
      'menu.orders': 'Orders',
      'menu.orders.all': 'All Orders',
      'menu.orders.pending': 'Pending',
      'menu.orders.processing': 'Processing',
      'menu.orders.shipped': 'Shipped',
      'menu.orders.return': 'Return',
      'menu.customers': 'Customers',
      'menu.customers.all': 'All Customers',
      'menu.customers.vip': 'VIP Customers',
      'menu.customers.reviews': 'Reviews',
      'menu.marketing': 'Marketing',
      'menu.marketing.promotions': 'Promotions',
      'menu.marketing.coupons': 'Coupons',
      'menu.marketing.email': 'Email Campaigns',
      'menu.analytics': 'Analytics',
      'menu.analytics.sales': 'Sales Reports',
      'menu.analytics.traffic': 'Traffic',
      'menu.analytics.conversion': 'Conversion',
      'menu.suppliers': 'Suppliers',
      'menu.system': 'System',
      'menu.system.users': 'User Management',
      'menu.system.roles': 'Roles & Permissions',
      'menu.system.integrations': 'Integrations',
      'menu.system.flags': 'Feature Flags',
      'menu.help': 'Help & Support'
    };
    return translations[key] || key;
  }

  // Raw menu schema with RBAC
  private rawMenuSchema: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'menu.dashboard',
      icon: 'speedometer2',
      route: '/dashboard',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER']
    },
    {
      id: 'products',
      label: 'menu.products',
      icon: 'boxes',
      permissions: ['manage_products'],
      children: [
        { id: 'products-all', label: 'menu.products.all', route: '/products/list' },
        { id: 'products-add', label: 'menu.products.add', route: '/products/add' },
        { id: 'products-categories', label: 'menu.products.categories', route: '/products/categories' },
        { id: 'products-inventory', label: 'menu.products.inventory', route: '/products/inventory', permissions: ['manage_inventory'] }
      ]
    },
    {
      id: 'orders',
      label: 'menu.orders',
      icon: 'cart-check',
      badge: 12,
      permissions: ['manage_orders'],
      children: [
        { id: 'orders-all', label: 'menu.orders.all', route: '/orders/list' },
        { id: 'orders-pending', label: 'menu.orders.pending', route: '/orders/pending', badge: 8 },
        { id: 'orders-processing', label: 'menu.orders.processing', route: '/orders/processing', badge: 3 },
        { id: 'orders-shipped', label: 'menu.orders.shipped', route: '/orders/shipped', badge: 1 },
        { id: 'orders-return', label: 'menu.orders.return', route: '/orders/return', badge: 1 }
      ]
    },
    {
      id: 'customers',
      label: 'menu.customers',
      icon: 'people',
      permissions: ['manage_customers'],
      children: [
        { id: 'customers-all', label: 'menu.customers.all', route: '/customers' },
        { id: 'customers-vip', label: 'menu.customers.vip', route: '/customers/vip' },
        { id: 'customers-reviews', label: 'menu.customers.reviews', route: '/customers/reviews' }
      ]
    },
    {
      id: 'marketing',
      label: 'menu.marketing',
      icon: 'megaphone',
      permissions: ['manage_marketing'],
      children: [
        { id: 'marketing-promotions', label: 'menu.marketing.promotions', route: '/marketing/promotions' },
        { id: 'marketing-coupons', label: 'menu.marketing.coupons', route: '/marketing/coupons' },
        { id: 'marketing-email', label: 'menu.marketing.email', route: '/marketing/email' }
      ]
    },
    {
      id: 'analytics',
      label: 'menu.analytics',
      icon: 'bar-chart-line',
      permissions: ['view_analytics'],
      children: [
        { id: 'analytics-sales', label: 'menu.analytics.sales', route: '/analytics/sales' },
        { id: 'analytics-traffic', label: 'menu.analytics.traffic', route: '/analytics/traffic' },
        { id: 'analytics-conversion', label: 'menu.analytics.conversion', route: '/analytics/conversion' }
      ]
    },
    {
      id: 'suppliers',
      label: 'menu.suppliers',
      icon: 'truck',
      route: '/suppliers',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
    },
    {
      id: 'system',
      label: 'menu.system',
      icon: 'gear',
      roles: ['SUPER_ADMIN'],
      children: [
        { id: 'system-users', label: 'menu.system.users', route: '/system/users', permissions: ['manage_users'] },
        { id: 'system-roles', label: 'menu.system.roles', route: '/system/roles', permissions: ['manage_roles'] },
        { id: 'system-integrations', label: 'menu.system.integrations', route: '/system/integrations', permissions: ['manage_integrations'] },
        { id: 'system-flags', label: 'menu.system.flags', route: '/system/flags', permissions: ['manage_flags'] }
      ]
    },
    {
      id: 'help',
      label: 'menu.help',
      icon: 'question-circle',
      route: '/help',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER']
    }
  ];

  // Filtered menu based on user permissions
  filteredMenuItems = computed(() => {
    return this.rawMenuSchema
      .filter(item => this.hasAccess(item))
      .map(item => ({
        ...item,
        label: this.t(item.label),
        children: item.children
          ?.filter(child => this.hasChildAccess(child))
          .map(child => ({
            ...child,
            label: this.t(child.label)
          }))
      }));
  });

  // Separate system items for visual grouping
  mainMenuItems = computed(() =>
    this.filteredMenuItems().filter(item =>
      !['system', 'help'].includes(item.id)
    )
  );

  systemMenuItems = computed(() =>
    this.filteredMenuItems().filter(item =>
      ['system', 'help'].includes(item.id)
    )
  );

  isMenuExpanded = (id: string) => this.expandedMenu() === id;

  toggleCollapse() {
    this._isCollapsed.update(v => !v);
    this.collapseChange.emit(this._isCollapsed());
  }

  // Check if route is currently active
  isActive(route: string | undefined): boolean {
    if (!route) return false;
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  private hasAccess(item: MenuItem): boolean {
    // Check roles if specified
    if (item.roles && !item.roles.some(role => this.currentUserRoles.includes(role))) {
      return false;
    }
    // Check permissions if specified
    if (item.permissions && !item.permissions.some(perm => this.currentUserPermissions.includes(perm))) {
      return false;
    }
    return true;
  }

  private hasChildAccess(child: MenuChild): boolean {
    if (child.permissions && !child.permissions.some(perm => this.currentUserPermissions.includes(perm))) {
      return false;
    }
    return true;
  }

  toggleSubmenu(id: string) {
    this._expandedMenu.update(current => current === id ? null : id);
  }

  open() {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeDrawer() {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.close.emit();
  }

  // Auto-expand based on current route
  expandForRoute(route: string) {
    const parent = this.rawMenuSchema.find(item =>
      item.children?.some(child => child.route === route)
    );
    if (parent) {
      this._expandedMenu.set(parent.id);
    }
  }

  // Check if any child is active (for highlighting parent)
  hasActiveChild(item: MenuItem): boolean {
    // Implementation would check current route against children
    return false;
  }
}