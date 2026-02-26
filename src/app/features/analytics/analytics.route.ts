import { Routes } from '@angular/router';
import { Analytics } from './analytics';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: 'analytics',
    component: Analytics
  },
  {
    path: 'sales',
    loadComponent: () => import('./sales/sales').then(m => m.Sales)
  },
  {
    path: 'traffic',
    loadComponent: () => import('./traffic/traffic').then(m => m.Traffic)
  },
  {
    path: 'conversion',
    loadComponent: () => import('./conversion/conversion').then(m => m.Conversion)
  },
  {
    path: 'customer',
    loadComponent: () => import('./customer/customer').then(m => m.Customer)
  },
  {
    path: 'product',
    loadComponent: () => import('./product/product').then(m => m.Product)
  },
  {
    path: 'financial',
    loadComponent: () => import('./financial/financial').then(m => m.Financial)
  },
  {
    path: 'inventory',
    loadComponent: () => import('./inventory/inventory').then(m => m.Inventory)
  },
  {
    path: 'custom-reports',
    loadComponent: () => import('./custom-reports/custom-reports').then(m => m.CustomReports)
  }
];