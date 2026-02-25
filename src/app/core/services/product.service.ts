import { Injectable, signal } from '@angular/core';
import { Product, InventoryStats } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  topProducts = signal<Product[]>([
    {
      id: '1',
      name: 'Wireless Headphones Pro',
      category: 'Electronics',
      price: 299.00,
      sold: 142,
      revenue: 42458,
      stock: 45,
      stockStatus: 'in-stock',
      icon: 'headphones'
    },
    {
      id: '2',
      name: 'Smart Watch Series 5',
      category: 'Electronics',
      price: 399.00,
      sold: 98,
      revenue: 39102,
      stock: 8,
      stockStatus: 'low-stock',
      icon: 'watch'
    },
    {
      id: '3',
      name: 'Premium Phone Case',
      category: 'Accessories',
      price: 49.00,
      sold: 256,
      revenue: 12544,
      stock: 120,
      stockStatus: 'in-stock',
      icon: 'phone'
    },
    {
      id: '4',
      name: 'Laptop Stand Pro',
      category: 'Accessories',
      price: 89.00,
      sold: 87,
      revenue: 7743,
      stock: 0,
      stockStatus: 'out-of-stock',
      icon: 'laptop'
    }
  ]);

  inventoryStats = signal<InventoryStats>({
    inStock: 1248,
    lowStock: 23,
    outOfStock: 8
  });
}