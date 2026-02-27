// src/app/core/services/order.service.ts
// Order service with API-ready patterns

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { Order, OrderStats } from '../models/order.model';
import { ApiResponse, PageParams, PageResponse } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly BASE_URL = 'assets/data';
  private readonly ORDERS_URL = `${this.BASE_URL}/dashboard/recent-orders.json`;
  
  private orders = signal<Order[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  
  readonly allOrders = computed(() => this.orders());
  readonly recentOrders = computed(() => this.orders().slice(0, 5));
  readonly isLoading = computed(() => this.loading());
  readonly currentError = computed(() => this.error());
  
  // Stats computed from orders
  readonly orderStats = computed<OrderStats>(() => {
    const all = this.orders();
    return {
      total: all.length,
      pending: all.filter(o => o.status === 'pending').length,
      processing: all.filter(o => o.status === 'processing').length,
      shipped: all.filter(o => o.status === 'shipped').length,
      delivered: all.filter(o => o.status === 'delivered').length,
      cancelled: all.filter(o => o.status === 'cancelled').length
    };
  });

  constructor(private http: HttpClient) {
    this.loadOrders();
  }

  // ==================== Data Loading ====================

  loadOrders(): void {
    this.loading.set(true);
    this.http.get<Order[]>(this.ORDERS_URL).pipe(
      delay(300),
      map(orders => this.transformDates(orders)),
      catchError(this.handleError('loadOrders', []))
    ).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  /**
   * Get all orders
   * For Spring Boot: GET /api/v1/orders
   */
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.ORDERS_URL).pipe(
      map(orders => this.transformDates(orders)),
      catchError(this.handleError('getOrders', []))
    );
    
    // For Spring Boot:
    // return this.http.get<PageResponse<Order>>(`${this.BASE_URL}/orders`).pipe(
    //   map(response => response.content)
    // );
  }

  /**
   * Get order by ID
   * For Spring Boot: GET /api/v1/orders/{id}
   */
  getOrder(id: string): Observable<Order | null> {
    return this.getOrders().pipe(
      map(orders => orders.find(o => o.id === id) || null),
      catchError(this.handleError('getOrder', null))
    );
    
    // For Spring Boot:
    // return this.http.get<ApiResponse<Order>>(`${this.BASE_URL}/orders/${id}`).pipe(
    //   map(response => response.data)
    // );
  }

  /**
   * Get orders by status
   * For Spring Boot: GET /api/v1/orders?status={status}
   */
  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.getOrders().pipe(
      map(orders => orders.filter(o => o.status === status)),
      catchError(this.handleError('getOrdersByStatus', []))
    );
    
    // For Spring Boot:
    // const params = new HttpParams().set('status', status);
    // return this.http.get<Order[]>(`${this.BASE_URL}/orders`, { params });
  }

  // ==================== Order Operations ====================

  /**
   * Update order status
   * For Spring Boot: PUT /api/v1/orders/{id}/status
   */
  updateOrderStatus(id: string, status: Order['status']): Observable<Order> {
    this.orders.update(current =>
      current.map(o =>
        o.id === id ? { ...o, status, date: new Date() } : o
      )
    );
    
    const updated = this.orders().find(o => o.id === id);
    return of(updated!).pipe(delay(300));
    
    // For Spring Boot:
    // return this.http.put<ApiResponse<Order>>(
    //   `${this.BASE_URL}/orders/${id}/status`, 
    //   { status }
    // ).pipe(map(response => response.data));
  }

  /**
   * Cancel order
   * For Spring Boot: PUT /api/v1/orders/{id}/cancel
   */
  cancelOrder(id: string): Observable<void> {
    this.orders.update(current =>
      current.map(o =>
        o.id === id ? { ...o, status: 'cancelled' as const, date: new Date() } : o
      )
    );
    return of(void 0).pipe(delay(300));
  }

  // ==================== Stats ====================

  /**
   * Get order statistics
   * For Spring Boot: GET /api/v1/orders/stats
   */
  getOrderStats(): Observable<OrderStats> {
    return of(this.orderStats()).pipe(delay(200));
    
    // For Spring Boot:
    // return this.http.get<ApiResponse<OrderStats>>(`${this.BASE_URL}/orders/stats`).pipe(
    //   map(response => response.data)
    // );
  }

  // ==================== Helper Methods ====================

  private transformDates(orders: Order[]): Order[] {
    return orders.map(o => ({
      ...o,
      date: new Date(o.date)
    }));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
