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
    loadComponent: () => import('./stock-transfers/stock-transfers').then(m => m.StockTransfers)
  },
  {
    path: 'adjustments',
    loadComponent: () => import('./stock-adjustment/stock-adjustment').then(m => m.StockAdjustment)
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