// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { InventoryStatus } from '../../features/dashboard/components/inventory-status/inventory-status';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  comparePrice?: number;
  cost: number;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  visibility: 'visible' | 'hidden';
  image: string;
  variants: number;
  sales: number;
  revenue: number;
  rating: number;
  reviews: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  description?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
}

export interface ProductStatusCount {
  status: string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private productsUrl = 'assets/data/products.json'; // Local JSON for now

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.http.get<Product[]>(this.productsUrl).pipe(
      catchError(this.handleError<Product[]>('loadProducts', []))
    ).subscribe(products => {
      this.productsSubject.next(products.map(p => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      })));
    });
  }

  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getProduct(id: string): Observable<Product | null> {
    return this.getProducts().pipe(
      map(products => products.find(p => p.id === id) || null)
    );
  }

  topProducts(count: number = 5): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.sort((a, b) => b.sales - a.sales).slice(0, count))
    );
  }

  inventoryStats(): Observable<ProductStatusCount[]> {
    return this.getProducts().pipe(
      map(products => { 
        const statusCounts: Record<string, number> = {};
        products.forEach(p => {
          statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count
        }));
      })
    );
  } 

  addProduct(product: Partial<Product>): Observable<Product> {
    // For local: simulate add
    const newProduct: Product = {
      ...product as Product,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      sales: product.sales ?? 0,
      revenue: product.revenue ?? 0,
      rating: product.rating ?? 0,
      reviews: product.reviews ?? 0,
      variants: product.variants ?? 0,
      tags: product.tags ?? [],
      status: product.status ?? 'draft',
      visibility: product.visibility ?? 'hidden'
    };
    const current = this.productsSubject.value;
    this.productsSubject.next([...current, newProduct]);
    return of(newProduct); // In API: return this.http.post<Product>(`${apiUrl}/products`, product)
  }

  updateProduct(updatedProduct: Product): Observable<Product> {
    // For local: simulate update
    const current = this.productsSubject.value.map(p =>
      p.id === updatedProduct.id ? { ...updatedProduct, updatedAt: new Date() } : p
    );
    this.productsSubject.next(current);
    return of(updatedProduct); // In API: return this.http.put<Product>(`${apiUrl}/products/${updatedProduct.id}`, updatedProduct)
  }

  deleteProduct(id: string): Observable<void> {
    // For local: simulate delete
    const current = this.productsSubject.value.filter(p => p.id !== id);
    this.productsSubject.next(current);
    return of(void 0); // In API: return this.http.delete<void>(`${apiUrl}/products/${id}`)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9); // Simple ID generator; use UUID in prod
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}