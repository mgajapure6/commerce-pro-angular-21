// src/app/core/services/product.service.ts
// Product service with API-ready patterns for Spring Boot integration

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { 
  Product, 
  ProductSummary, 
  ProductFilterState, 
  ProductStats,
  ProductStatusCount 
} from '../models/product.model';

// API Response wrapper - matches Spring Boot typical response structure
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

// Pagination params - matches Spring Boot Pageable
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

// Paginated response - matches Spring Boot Page<T>
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Base URL - easily switchable between JSON files and Spring Boot API
  private readonly BASE_URL = 'assets/data/catalog'; // For JSON files
  // private readonly BASE_URL = '/api/v1'; // For Spring Boot API
  
  private readonly PRODUCTS_URL = `${this.BASE_URL}/products.json`;
  
  // State management with signals
  private products = signal<Product[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  
  // Public readonly signals
  readonly allProducts = computed(() => this.products());
  readonly isLoading = computed(() => this.loading());
  readonly currentError = computed(() => this.error());
  
  // Stats computed signals
  readonly productStats = computed<ProductStats>(() => {
    const all = this.products();
    return {
      total: all.length,
      active: all.filter(p => p.status === 'active').length,
      lowStock: all.filter(p => p.stockStatus === 'low_stock').length,
      outOfStock: all.filter(p => p.stockStatus === 'out_of_stock').length,
      drafts: all.filter(p => p.status === 'draft').length,
      revenue: all.reduce((sum, p) => sum + (p.revenue || 0), 0)
    };
  });

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  // ==================== CRUD Operations ====================

  /**
   * Load all products
   * For Spring Boot: GET /api/v1/products
   */
  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.http.get<Product[]>(this.PRODUCTS_URL).pipe(
      // Simulate network delay for demo
      delay(300),
      map(products => this.transformDates(products)),
      catchError(this.handleError('loadProducts', []))
    ).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  /**
   * Get all products as observable
   * For Spring Boot: GET /api/v1/products
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.PRODUCTS_URL).pipe(
      map(products => this.transformDates(products)),
      catchError(this.handleError('getProducts', []))
    );
  }

  /**
   * Get paginated products
   * For Spring Boot: GET /api/v1/products?page=0&size=10&sort=name,asc
   */
  getProductsPaginated(params: PageParams = {}): Observable<PageResponse<Product>> {
    const { page = 0, size = 10, sort = 'createdAt', direction = 'desc' } = params;
    
    // For JSON files, we simulate pagination
    return this.getProducts().pipe(
      map(products => this.paginateLocally(products, page, size, sort, direction))
    );
    
    // For Spring Boot API:
    // let httpParams = new HttpParams()
    //   .set('page', page.toString())
    //   .set('size', size.toString())
    //   .set('sort', `${sort},${direction}`);
    // return this.http.get<PageResponse<Product>>(`${this.BASE_URL}/products`, { params: httpParams });
  }

  /**
   * Get product by ID
   * For Spring Boot: GET /api/v1/products/{id}
   */
  getProduct(id: string): Observable<Product | null> {
    return this.http.get<Product[]>(this.PRODUCTS_URL).pipe(
      map(products => {
        const product = products.find(p => p.id === id);
        return product ? this.transformDate(product) : null;
      }),
      catchError(this.handleError('getProduct', null))
    );
    
    // For Spring Boot API:
    // return this.http.get<ApiResponse<Product>>(`${this.BASE_URL}/products/${id}`).pipe(
    //   map(response => response.data),
    //   catchError(this.handleError('getProduct', null))
    // );
  }

  /**
   * Create new product
   * For Spring Boot: POST /api/v1/products
   */
  createProduct(product: Partial<Product>): Observable<Product> {
    const newProduct: Product = {
      ...product as Product,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      salesCount: product.salesCount ?? 0,
      revenue: product.revenue ?? 0,
      rating: product.rating ?? 0,
      reviewCount: product.reviewCount ?? 0,
      tags: product.tags ?? [],
      status: product.status ?? 'draft',
      visibility: product.visibility ?? 'hidden',
      featured: product.featured ?? false
    };
    
    // Update local state
    this.products.update(current => [...current, newProduct]);
    
    return of(newProduct).pipe(delay(500)); // Simulate API delay
    
    // For Spring Boot API:
    // return this.http.post<ApiResponse<Product>>(`${this.BASE_URL}/products`, product).pipe(
    //   map(response => response.data),
    //   tap(() => this.loadProducts()), // Refresh list
    //   catchError(this.handleError('createProduct'))
    // );
  }

  /**
   * Update product
   * For Spring Boot: PUT /api/v1/products/{id}
   */
  updateProduct(id: string, updates: Partial<Product>): Observable<Product> {
    this.products.update(current => 
      current.map(p => 
        p.id === id 
          ? { ...p, ...updates, updatedAt: new Date() } 
          : p
      )
    );
    
    const updated = this.products().find(p => p.id === id);
    return updated ? of(updated).pipe(delay(500)) : throwError(() => new Error('Product not found'));
    
    // For Spring Boot API:
    // return this.http.put<ApiResponse<Product>>(`${this.BASE_URL}/products/${id}`, updates).pipe(
    //   map(response => response.data),
    //   tap(() => this.loadProducts()),
    //   catchError(this.handleError('updateProduct'))
    // );
  }

  /**
   * Delete product
   * For Spring Boot: DELETE /api/v1/products/{id}
   */
  deleteProduct(id: string): Observable<void> {
    this.products.update(current => current.filter(p => p.id !== id));
    return of(void 0).pipe(delay(500));
    
    // For Spring Boot API:
    // return this.http.delete<void>(`${this.BASE_URL}/products/${id}`).pipe(
    //   tap(() => this.loadProducts()),
    //   catchError(this.handleError('deleteProduct'))
    // );
  }

  /**
   * Bulk delete products
   * For Spring Boot: DELETE /api/v1/products/bulk with body { ids: string[] }
   */
  bulkDelete(ids: string[]): Observable<void> {
    this.products.update(current => current.filter(p => !ids.includes(p.id)));
    return of(void 0).pipe(delay(800));
    
    // For Spring Boot API:
    // return this.http.delete<void>(`${this.BASE_URL}/products/bulk`, { body: { ids } }).pipe(
    //   tap(() => this.loadProducts()),
    //   catchError(this.handleError('bulkDelete'))
    // );
  }

  // ==================== Search & Filter ====================

  /**
   * Search products
   * For Spring Boot: GET /api/v1/products/search?query={query}
   */
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.PRODUCTS_URL).pipe(
      map(products => {
        const lowerQuery = query.toLowerCase();
        return products.filter(p =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.sku.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery) ||
          p.brand.toLowerCase().includes(lowerQuery) ||
          p.tags.some(t => t.toLowerCase().includes(lowerQuery))
        );
      }),
      catchError(this.handleError('searchProducts', []))
    );
  }

  /**
   * Filter products
   * For Spring Boot: POST /api/v1/products/filter with filter body
   */
  filterProducts(filters: Partial<ProductFilterState>): Observable<Product[]> {
    return this.http.get<Product[]>(this.PRODUCTS_URL).pipe(
      map(products => this.applyFilters(products, filters)),
      catchError(this.handleError('filterProducts', []))
    );
  }

  // ==================== Stats & Analytics ====================

  /**
   * Get inventory stats
   * For Spring Boot: GET /api/v1/products/stats/inventory
   */
  getInventoryStats(): Observable<ProductStatusCount[]> {
    return of(this.calculateInventoryStats()).pipe(delay(200));
    
    // For Spring Boot API:
    // return this.http.get<ApiResponse<ProductStatusCount[]>>(`${this.BASE_URL}/products/stats/inventory`).pipe(
    //   map(response => response.data)
    // );
  }

  /**
   * Get top selling products
   * For Spring Boot: GET /api/v1/products/top-selling?limit=5
   */
  getTopSelling(limit: number = 5): Observable<Product[]> {
    return this.http.get<Product[]>(this.PRODUCTS_URL).pipe(
      map(products => 
        products
          .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
          .slice(0, limit)
      ),
      catchError(this.handleError('getTopSelling', []))
    );
  }

  // ==================== Helper Methods ====================

  private transformDates(products: Product[]): Product[] {
    return products.map(p => this.transformDate(p));
  }

  private transformDate(product: Product): Product {
    return {
      ...product,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt)
    };
  }

  private paginateLocally(
    products: Product[], 
    page: number, 
    size: number, 
    sort: string, 
    direction: string
  ): PageResponse<Product> {
    // Sort
    const sorted = [...products].sort((a, b) => {
      const aVal = (a as any)[sort] ?? a.createdAt;
      const bVal = (b as any)[sort] ?? b.createdAt;
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });

    // Paginate
    const start = page * size;
    const content = sorted.slice(start, start + size);
    const total = products.length;

    return {
      content,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size,
      number: page,
      first: page === 0,
      last: start + size >= total,
      empty: content.length === 0
    };
  }

  private applyFilters(products: Product[], filters: Partial<ProductFilterState>): Product[] {
    return products.filter(p => {
      if (filters.status && p.status !== filters.status) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.stockStatus && p.stockStatus !== filters.stockStatus) return false;
      if (filters.minPrice && p.price < filters.minPrice) return false;
      if (filters.maxPrice && p.price > filters.maxPrice) return false;
      if (filters.minRating && p.rating < filters.minRating) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matches = 
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }

  private calculateInventoryStats(): ProductStatusCount[] {
    const stats: Record<string, number> = {};
    this.products().forEach(p => {
      stats[p.status] = (stats[p.status] || 0) + 1;
    });
    return Object.entries(stats).map(([status, count]) => ({ status, count }));
  }

  private generateId(): string {
    return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      this.error.set(error.message);
      return of(result as T);
    };
  }
}
