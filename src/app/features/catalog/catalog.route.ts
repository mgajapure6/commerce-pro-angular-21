import { Routes } from '@angular/router';
import { Catalog } from './catalog';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: 'catalog',
    component: Catalog
  },
  {
    path: 'products',
    loadComponent: () => import('./product-list/product-list').then(m => m.ProductList)
  },
  {
    path: 'products/add',
    loadComponent: () => import('./product-form/product-form').then(m => m.ProductForm)
  },
  {
    path: 'products/edit/:id',
    loadComponent: () => import('./product-form/product-form').then(m => m.ProductForm)
  },
  {
    path: 'bulk-operations',
    loadComponent: () => import('./bulk-operations/bulk-operations').then(m => m.BulkOperations)
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
    path: 'attributes',
    loadComponent: () => import('./attributes/attributes').then(m => m.Attributes)
  },
  {
    path: 'brands',
    loadComponent: () => import('./brands/brands').then(m => m.Brands)
  },
  {
    path: 'reviews',
    loadComponent: () => import('./reviews/reviews').then(m => m.Reviews)
  },
  {
    path: 'collections',
    loadComponent: () => import('./collections/collections').then(m => m.Collections)
  },
  {
    path: 'seo',
    loadComponent: () => import('./seo/seo').then(m => m.Seo)
  }
];