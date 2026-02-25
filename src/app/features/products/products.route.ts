import { Routes } from '@angular/router';
import { Products } from './products';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: 'products',
    component: Products
  },
  {
    path: 'list',
    loadComponent: () => import('./product-list/product-list').then(m => m.ProductList)
  },
  {
    path: 'add',
    loadComponent: () => import('./product-form/product-form').then(m => m.ProductForm)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./product-form/product-form').then(m => m.ProductForm)
  },
  {
    path: 'categories',
    loadComponent: () => import('./categories/categories').then(m => m.Categories)
  },
  {
    path: 'categories/add',
    loadComponent: () => import('./categories/category-form/category-form').then(m => m.CategoryForm)
  },
  {
    path: 'categories/edit/:id',
    loadComponent: () => import('./categories/category-form/category-form').then(m => m.CategoryForm)
  },
  {
    path: 'inventory',
    loadComponent: () => import('./inventory/inventory').then(m => m.Inventory)
  }
];