// src/app/core/services/customer.service.ts
// Customer service with API-ready patterns

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { Customer, CustomerStats } from '../models/customer.model';
import { ApiResponse, PageParams, PageResponse } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly BASE_URL = 'assets/data';
  private readonly CUSTOMERS_URL = `${this.BASE_URL}/dashboard/top-customers.json`;
  private readonly STATS_URL = `${this.BASE_URL}/dashboard/customer-stats.json`;
  
  private customers = signal<Customer[]>([]);
  private stats = signal<CustomerStats | null>(null);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  
  readonly allCustomers = computed(() => this.customers());
  readonly topCustomers = computed(() => this.customers().slice(0, 5));
  readonly customerStats = computed(() => this.stats() || { total: 0, newThisWeek: 0, growth: 0 });
  readonly isLoading = computed(() => this.loading());
  readonly currentError = computed(() => this.error());

  constructor(private http: HttpClient) {
    this.loadCustomers();
    this.loadStats();
  }

  // ==================== Data Loading ====================

  loadCustomers(): void {
    this.loading.set(true);
    this.http.get<Customer[]>(this.CUSTOMERS_URL).pipe(
      delay(300),
      catchError(this.handleError('loadCustomers', []))
    ).subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.http.get<CustomerStats>(this.STATS_URL).pipe(
      delay(200),
      catchError(this.handleError('loadStats', { total: 0, newThisWeek: 0, growth: 0 }))
    ).subscribe(stats => {
      this.stats.set(stats);
    });
  }

  /**
   * Get all customers
   * For Spring Boot: GET /api/v1/customers
   */
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.CUSTOMERS_URL).pipe(
      catchError(this.handleError('getCustomers', []))
    );
    
    // For Spring Boot:
    // return this.http.get<PageResponse<Customer>>(`${this.BASE_URL}/customers`).pipe(
    //   map(response => response.content)
    // );
  }

  /**
   * Get customer by ID
   * For Spring Boot: GET /api/v1/customers/{id}
   */
  getCustomer(id: string): Observable<Customer | null> {
    return this.getCustomers().pipe(
      map(customers => customers.find(c => c.id === id) || null),
      catchError(this.handleError('getCustomer', null))
    );
    
    // For Spring Boot:
    // return this.http.get<ApiResponse<Customer>>(`${this.BASE_URL}/customers/${id}`).pipe(
    //   map(response => response.data)
    // );
  }

  /**
   * Get customers by tier
   * For Spring Boot: GET /api/v1/customers?tier={tier}
   */
  getCustomersByTier(tier: Customer['tier']): Observable<Customer[]> {
    return this.getCustomers().pipe(
      map(customers => customers.filter(c => c.tier === tier)),
      catchError(this.handleError('getCustomersByTier', []))
    );
    
    // For Spring Boot:
    // const params = new HttpParams().set('tier', tier);
    // return this.http.get<Customer[]>(`${this.BASE_URL}/customers`, { params });
  }

  // ==================== Stats ====================

  /**
   * Get customer statistics
   * For Spring Boot: GET /api/v1/customers/stats
   */
  getStats(): Observable<CustomerStats> {
    return this.http.get<CustomerStats>(this.STATS_URL).pipe(
      catchError(this.handleError('getStats', { total: 0, newThisWeek: 0, growth: 0 }))
    );
    
    // For Spring Boot:
    // return this.http.get<ApiResponse<CustomerStats>>(`${this.BASE_URL}/customers/stats`).pipe(
    //   map(response => response.data)
    // );
  }

  // ==================== Helper Methods ====================

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
