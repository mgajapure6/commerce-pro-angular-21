import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'analytics',
    loadChildren: () => import('./features/analytics/analytics.route').then(m => m.ANALYTICS_ROUTES)
  },
  {
    path: 'catalog',
    loadChildren: () => import('./features/catalog/catalog.route').then(m => m.PRODUCTS_ROUTES)
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.route').then(m => m.ORDERS_ROUTES)
  },
  {
    path: 'inventory',
    loadChildren: () => import('./features/inventory/inventory.route').then(m => m.INVENTORY_ROUTES)
  },
  {
    path: 'customers',
    loadChildren: () => import('./features/customers/customers.route').then(m => m.CUSTOMERS_ROUTES)
  },
  {
    path: 'fulfillment',
    loadChildren: () => import('./features/fulfillment/fulfillment.route').then(m => m.FULFILLMENT_ROUTES)
  }
];