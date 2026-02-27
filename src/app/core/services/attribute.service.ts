// src/app/core/services/attribute.service.ts
// Attribute service with API-ready patterns

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { 
  Attribute, 
  AttributeType, 
  AttributeOption, 
  AttributeStats 
} from '../models/attribute.model';
import { ApiResponse, PageParams, PageResponse } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class AttributeService {
  private readonly BASE_URL = 'assets/data/catalog';
  private readonly ATTRIBUTES_URL = `${this.BASE_URL}/attributes.json`;
  
  private attributes = signal<Attribute[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  
  readonly allAttributes = computed(() => this.attributes());
  readonly isLoading = computed(() => this.loading());
  readonly currentError = computed(() => this.error());
  
  readonly attributeStats = computed<AttributeStats>(() => {
    const all = this.attributes();
    return {
      total: all.length,
      active: all.filter(a => a.isActive).length,
      filterable: all.filter(a => a.isFilterable).length,
      variant: all.filter(a => a.isVariant).length,
      required: all.filter(a => a.isRequired).length,
      withOptions: all.filter(a => a.options.length > 0).length
    };
  });

  constructor(private http: HttpClient) {
    this.loadAttributes();
  }

  // ==================== CRUD Operations ====================

  loadAttributes(): void {
    this.loading.set(true);
    this.http.get<Attribute[]>(this.ATTRIBUTES_URL).pipe(
      delay(300),
      map(attrs => this.transformDates(attrs)),
      catchError(this.handleError('loadAttributes', []))
    ).subscribe({
      next: (attrs) => {
        this.attributes.set(attrs);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  getAttributes(): Observable<Attribute[]> {
    return this.http.get<Attribute[]>(this.ATTRIBUTES_URL).pipe(
      map(attrs => this.transformDates(attrs)),
      catchError(this.handleError('getAttributes', []))
    );
  }

  getAttribute(id: string): Observable<Attribute | null> {
    return this.getAttributes().pipe(
      map(attrs => attrs.find(a => a.id === id) || null),
      catchError(this.handleError('getAttribute', null))
    );
  }

  createAttribute(attribute: Partial<Attribute>): Observable<Attribute> {
    const newAttribute: Attribute = {
      ...attribute as Attribute,
      id: this.generateId(),
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.attributes.update(current => [...current, newAttribute]);
    return of(newAttribute).pipe(delay(500));
    
    // For Spring Boot:
    // return this.http.post<ApiResponse<Attribute>>(`${this.BASE_URL}/attributes`, attribute).pipe(
    //   map(response => response.data),
    //   tap(() => this.loadAttributes())
    // );
  }

  updateAttribute(id: string, updates: Partial<Attribute>): Observable<Attribute> {
    this.attributes.update(current =>
      current.map(a =>
        a.id === id
          ? { ...a, ...updates, updatedAt: new Date() }
          : a
      )
    );
    
    const updated = this.attributes().find(a => a.id === id);
    return updated ? of(updated).pipe(delay(500)) : throwError(() => new Error('Attribute not found'));
  }

  deleteAttribute(id: string): Observable<void> {
    this.attributes.update(current => current.filter(a => a.id !== id));
    return of(void 0).pipe(delay(500));
  }

  // ==================== Options Management ====================

  addOption(attributeId: string, option: Partial<AttributeOption>): Observable<Attribute> {
    const attribute = this.attributes().find(a => a.id === attributeId);
    if (!attribute) return throwError(() => new Error('Attribute not found'));
    
    const newOption: AttributeOption = {
      id: `opt_${Date.now()}`,
      label: option.label || '',
      value: option.value || '',
      sortOrder: attribute.options.length
    };
    
    return this.updateAttribute(attributeId, {
      options: [...attribute.options, newOption]
    });
  }

  removeOption(attributeId: string, optionId: string): Observable<Attribute> {
    const attribute = this.attributes().find(a => a.id === attributeId);
    if (!attribute) return throwError(() => new Error('Attribute not found'));
    
    return this.updateAttribute(attributeId, {
      options: attribute.options.filter(o => o.id !== optionId)
    });
  }

  reorderOptions(attributeId: string, optionIds: string[]): Observable<Attribute> {
    const attribute = this.attributes().find(a => a.id === attributeId);
    if (!attribute) return throwError(() => new Error('Attribute not found'));
    
    const optionMap = new Map(attribute.options.map(o => [o.id, o]));
    const reordered = optionIds
      .map((id, index) => ({ ...optionMap.get(id)!, sortOrder: index }))
      .filter(Boolean);
    
    return this.updateAttribute(attributeId, { options: reordered });
  }

  // ==================== Bulk Operations ====================

  bulkUpdateStatus(ids: string[], isActive: boolean): Observable<void> {
    this.attributes.update(current =>
      current.map(a =>
        ids.includes(a.id)
          ? { ...a, isActive, updatedAt: new Date() }
          : a
      )
    );
    return of(void 0).pipe(delay(500));
  }

  bulkDelete(ids: string[]): Observable<void> {
    this.attributes.update(current => current.filter(a => !ids.includes(a.id)));
    return of(void 0).pipe(delay(500));
  }

  bulkSetFilterable(ids: string[], isFilterable: boolean): Observable<void> {
    this.attributes.update(current =>
      current.map(a =>
        ids.includes(a.id)
          ? { ...a, isFilterable, updatedAt: new Date() }
          : a
      )
    );
    return of(void 0).pipe(delay(500));
  }

  // ==================== Type Helpers ====================

  getAttributeTypes(): { value: AttributeType; label: string; icon: string }[] {
    return [
      { value: 'select', label: 'Select', icon: 'menu-down' },
      { value: 'multiselect', label: 'Multi-Select', icon: 'check2-square' },
      { value: 'text', label: 'Text', icon: 'type' },
      { value: 'textarea', label: 'Text Area', icon: 'textarea' },
      { value: 'color', label: 'Color Swatch', icon: 'palette' },
      { value: 'image', label: 'Image Swatch', icon: 'image' },
      { value: 'boolean', label: 'Yes/No', icon: 'toggle-on' },
      { value: 'number', label: 'Number', icon: '123' },
      { value: 'date', label: 'Date', icon: 'calendar' }
    ];
  }

  // ==================== Helper Methods ====================

  private transformDates(attributes: Attribute[]): Attribute[] {
    return attributes.map(a => ({
      ...a,
      createdAt: new Date(a.createdAt),
      updatedAt: new Date(a.updatedAt)
    }));
  }

  private generateId(): string {
    return `attr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
