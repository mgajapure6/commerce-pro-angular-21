// src/app/core/services/brand.service.ts
// Brand service with API-ready patterns

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';
import { Brand, BrandStats } from '../models/brand.model';
import { ApiResponse } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private readonly BASE_URL = 'assets/data/catalog';
  private readonly BRANDS_URL = `${this.BASE_URL}/brands.json`;
  
  private brands = signal<Brand[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  
  readonly allBrands = computed(() => this.brands());
  readonly isLoading = computed(() => this.loading());
  readonly currentError = computed(() => this.error());
  
  readonly brandStats = computed<BrandStats>(() => {
    const all = this.brands();
    return {
      total: all.length,
      active: all.filter(b => b.isActive).length,
      featured: all.filter(b => b.isFeatured).length
    };
  });

  constructor(private http: HttpClient) {
    this.loadBrands();
  }

  loadBrands(): void {
    this.loading.set(true);
    this.http.get<Brand[]>(this.BRANDS_URL).pipe(
      delay(300),
      map(brands => this.transformDates(brands)),
      catchError(this.handleError('loadBrands', []))
    ).subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.BRANDS_URL).pipe(
      map(brands => this.transformDates(brands)),
      catchError(this.handleError('getBrands', []))
    );
  }

  getBrand(id: string): Observable<Brand | null> {
    return this.getBrands().pipe(
      map(brands => brands.find(b => b.id === id) || null),
      catchError(this.handleError('getBrand', null))
    );
  }

  getBrandBySlug(slug: string): Observable<Brand | null> {
    return this.getBrands().pipe(
      map(brands => brands.find(b => b.slug === slug) || null),
      catchError(this.handleError('getBrandBySlug', null))
    );
  }

  createBrand(brand: Partial<Brand>): Observable<Brand> {
    const newBrand: Brand = {
      ...brand as Brand,
      id: this.generateId(),
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.brands.update(current => [...current, newBrand]);
    return of(newBrand).pipe(delay(500));
    
    // For Spring Boot:
    // return this.http.post<ApiResponse<Brand>>(`${this.BASE_URL}/brands`, brand).pipe(
    //   map(response => response.data),
    //   tap(() => this.loadBrands())
    // );
  }

  updateBrand(id: string, updates: Partial<Brand>): Observable<Brand> {
    this.brands.update(current =>
      current.map(b =>
        b.id === id
          ? { ...b, ...updates, updatedAt: new Date() }
          : b
      )
    );
    
    const updated = this.brands().find(b => b.id === id);
    return updated ? of(updated).pipe(delay(500)) : throwError(() => new Error('Brand not found'));
  }

  deleteBrand(id: string): Observable<void> {
    this.brands.update(current => current.filter(b => b.id !== id));
    return of(void 0).pipe(delay(500));
  }

  // Helper methods
  private transformDates(brands: Brand[]): Brand[] {
    return brands.map(b => ({
      ...b,
      createdAt: new Date(b.createdAt),
      updatedAt: new Date(b.updatedAt)
    }));
  }

  private generateId(): string {
    return `brand_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
