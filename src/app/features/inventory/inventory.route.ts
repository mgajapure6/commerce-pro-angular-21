import { Routes } from '@angular/router';
import { Inventory } from './inventory';

export const INVENTORY_ROUTES: Routes = [
  {
    path: 'inventory',
    component: Inventory
  },
  {
    path: 'overview',
    loadComponent: () => import('./inventory-overview/inventory-overview').then(m => m.InventoryOverview)
  },
  {
    path: 'warehouses',
    loadComponent: () => import('./warehouses/warehouses').then(m => m.Warehouses)
  },
  {
    path: 'transfers',
    loadComponent: () => import('./transfers/transfers').then(m => m.Transfers)
  },
  {
    path: 'adjustments',
    loadComponent: () => import('./adjustments/adjustments').then(m => m.Adjustments)
  },
  {
    path: 'low-stock',
    loadComponent: () => import('./low-stock/low-stock').then(m => m.LowStock)
  },
  {
    path: 'forecasting',
    loadComponent: () => import('./forecasting/forecasting').then(m => m.Forecasting)
  },
  {
    path: 'valuation',
    loadComponent: () => import('./valuation/valuation').then(m => m.Valuation)
  },
  
];