import { Routes } from '@angular/router';
import { Orders } from './orders';

export const ORDERS_ROUTES: Routes = [
  {
    path: 'orders',
    component: Orders
  },
  {
    path: 'list',
    loadComponent: () => import('./order-list/order-list').then(m => m.OrderList)
  },
  {
    path: 'add',
    loadComponent: () => import('./order-form/order-form').then(m => m.OrderForm)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./order-form/order-form').then(m => m.OrderForm)
  },
  {
    path: 'pending',
    loadComponent: () => import('./order-pending/order-pending').then(m => m.OrderPending)
  },
  {
    path: 'processing',
    loadComponent: () => import('./order-processing/order-processing').then(m => m.OrderProcessing)
  },
  {
    path: 'shipped',
    loadComponent: () => import('./order-shipped/order-shipped').then(m => m.OrderShipped)
  },
  {
    path: 'return',
    loadComponent: () => import('./order-return/order-return').then(m => m.OrderReturn)
  },

];