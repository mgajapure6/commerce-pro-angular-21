import { Routes } from '@angular/router';
import { Fulfillment } from './fulfillment';

export const FULFILLMENT_ROUTES: Routes = [
  {
    path: 'fulfillment',
    component: Fulfillment
  },
  {
    path: 'shipments',
    loadComponent: () => import('./shipments/shipments').then(m => m.Shipments)
  },
  {
    path: 'pick-pack',
    loadComponent: () => import('./pick-pack/pick-pack').then(m => m.PickPack)
  },
  {
    path: 'dropship',
    loadComponent: () => import('./dropship/dropship').then(m => m.Dropship)
  },
  {
    path: '3pl',
    loadComponent: () => import('./three-pl/three-pl').then(m => m.ThreePL)
  },
  {
    path: 'shipping-rules',
    loadComponent: () => import('./shipping-rules/shipping-rules').then(m => m.ShippingRules)
  },
  {
    path: 'labels',
    loadComponent: () => import('./labels/labels').then(m => m.Labels)
  },
  {
    path: 'tracking',
    loadComponent: () => import('./tracking/tracking').then(m => m.Tracking)
  }
];