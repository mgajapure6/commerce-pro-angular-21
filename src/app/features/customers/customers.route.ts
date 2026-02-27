import { Routes } from '@angular/router';
import { Customers } from './customers';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: 'customers',
    component: Customers
  },
  {
    path: 'all',
    loadComponent: () => import('./customer-list/customer-list').then(m => m.CustomerList)
  },
  {
    path: 'add',
    loadComponent: () => import('./customer-form/customer-form').then(m => m.CustomerForm)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./customer-form/customer-form').then(m => m.CustomerForm)
  },
  {
    path: 'segments',
    loadComponent: () => import('./segments/segments').then(m => m.Segments)
  },
  {
    path: 'vip',
    loadComponent: () => import('./vip/vip').then(m => m.Vip)
  },
  {
    path: 'companies',
    loadComponent: () => import('./companies/companies').then(m => m.Companies)
  },
  {
    path: 'reviews',
    loadComponent: () => import('./reviews/reviews').then(m => m.Reviews)
  },
  {
    path: 'support',
    loadComponent: () => import('./support/support').then(m => m.Support)
  },
  {
    path: 'feedback',
    loadComponent: () => import('./feedback/feedback').then(m => m.Feedback)
  },
  {
    path: 'import',
    loadComponent: () => import('./import/import').then(m => m.Import)
  }
];