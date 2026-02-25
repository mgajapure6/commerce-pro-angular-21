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
    path: 'products',
    loadChildren: () => import('./features/products/products.route').then(m => m.PRODUCTS_ROUTES)
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.route').then(m => m.ORDERS_ROUTES)
  },
  {
    path: 'customers',
    loadChildren: () => import('./features/customers/customers.route').then(m => m.CUSTOMERS_ROUTES)
  }
];