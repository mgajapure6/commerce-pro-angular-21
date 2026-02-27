// src/app/core/services/collection.service.ts
// Collection service with API-ready patterns

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';
import { Collection, CollectionStats, CollectionCondition } from '../models/collection.model';
import { ApiResponse } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly BASE_URL = 'assets/data/catalog';
  private readonly COLLECTIONS_URL = `${this.BASE_URL}/collections.json`;
  
  private collections = signal<Collection[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  
  readonly allCollections = computed(() => this.collections());
  readonly isLoading = computed(() => this.loading());
  readonly currentError = computed(() => this.error());
  
  readonly collectionStats = computed<CollectionStats>(() => {
    const all = this.collections();
    return {
      total: all.length,
      manual: all.filter(c => c.type === 'manual').length,
      automated: all.filter(c => c.type === 'automated').length,
      active: all.filter(c => c.isActive).length
    };
  });

  constructor(private http: HttpClient) {
    this.loadCollections();
  }

  loadCollections(): void {
    this.loading.set(true);
    this.http.get<Collection[]>(this.COLLECTIONS_URL).pipe(
      delay(300),
      map(colls => this.transformDates(colls)),
      catchError(this.handleError('loadCollections', []))
    ).subscribe({
      next: (colls) => {
        this.collections.set(colls);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(this.COLLECTIONS_URL).pipe(
      map(colls => this.transformDates(colls)),
      catchError(this.handleError('getCollections', []))
    );
  }

  getCollection(id: string): Observable<Collection | null> {
    return this.getCollections().pipe(
      map(colls => colls.find(c => c.id === id) || null),
      catchError(this.handleError('getCollection', null))
    );
  }

  getCollectionBySlug(slug: string): Observable<Collection | null> {
    return this.getCollections().pipe(
      map(colls => colls.find(c => c.slug === slug) || null),
      catchError(this.handleError('getCollectionBySlug', null))
    );
  }

  createCollection(collection: Partial<Collection>): Observable<Collection> {
    const newCollection: Collection = {
      ...collection as Collection,
      id: this.generateId(),
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.collections.update(current => [...current, newCollection]);
    return of(newCollection).pipe(delay(500));
  }

  updateCollection(id: string, updates: Partial<Collection>): Observable<Collection> {
    this.collections.update(current =>
      current.map(c =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date() }
          : c
      )
    );
    
    const updated = this.collections().find(c => c.id === id);
    return updated ? of(updated).pipe(delay(500)) : throwError(() => new Error('Collection not found'));
  }

  deleteCollection(id: string): Observable<void> {
    this.collections.update(current => current.filter(c => c.id !== id));
    return of(void 0).pipe(delay(500));
  }

  // Manual collection operations
  addProductToCollection(collectionId: string, productId: string): Observable<Collection> {
    const collection = this.collections().find(c => c.id === collectionId);
    if (!collection) return throwError(() => new Error('Collection not found'));
    if (collection.type !== 'manual') return throwError(() => new Error('Not a manual collection'));
    
    const productIds = collection.productIds || [];
    if (productIds.includes(productId)) {
      return throwError(() => new Error('Product already in collection'));
    }
    
    return this.updateCollection(collectionId, {
      productIds: [...productIds, productId],
      productCount: (collection.productCount || 0) + 1
    });
  }

  removeProductFromCollection(collectionId: string, productId: string): Observable<Collection> {
    const collection = this.collections().find(c => c.id === collectionId);
    if (!collection) return throwError(() => new Error('Collection not found'));
    
    const productIds = (collection.productIds || []).filter(id => id !== productId);
    return this.updateCollection(collectionId, {
      productIds,
      productCount: productIds.length
    });
  }

  // Automated collection conditions
  addCondition(collectionId: string, condition: Partial<CollectionCondition>): Observable<Collection> {
    const collection = this.collections().find(c => c.id === collectionId);
    if (!collection) return throwError(() => new Error('Collection not found'));
    
    const newCondition: CollectionCondition = {
      id: `cond_${Date.now()}`,
      field: condition.field!,
      relation: condition.relation!,
      value: condition.value!
    };
    
    return this.updateCollection(collectionId, {
      conditions: [...(collection.conditions || []), newCondition]
    });
  }

  removeCondition(collectionId: string, conditionId: string): Observable<Collection> {
    const collection = this.collections().find(c => c.id === collectionId);
    if (!collection) return throwError(() => new Error('Collection not found'));
    
    return this.updateCollection(collectionId, {
      conditions: (collection.conditions || []).filter(c => c.id !== conditionId)
    });
  }

  // Helper methods
  private transformDates(collections: Collection[]): Collection[] {
    return collections.map(c => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt)
    }));
  }

  private generateId(): string {
    return `coll_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
