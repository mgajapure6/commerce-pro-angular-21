// src/app/core/services/category.service.ts
// Category service with API-ready patterns for Spring Boot integration

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { 
  Category, 
  CategoryTreeNode, 
  CategoryTemplate, 
  CategoryStats 
} from '../models/category.model';
import { ApiResponse, PageParams, PageResponse } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly BASE_URL = 'assets/data/catalog';
  private readonly CATEGORIES_URL = `${this.BASE_URL}/categories.json`;
  
  // State
  private categories = signal<Category[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  
  // Public signals
  readonly allCategories = computed(() => this.categories());
  readonly isLoading = computed(() => this.loading());
  readonly currentError = computed(() => this.error());
  
  // Computed stats
  readonly categoryStats = computed<CategoryStats>(() => {
    const all = this.categories();
    return {
      total: all.length,
      active: all.filter(c => c.isActive).length,
      featured: all.filter(c => c.isFeatured).length,
      topLevel: all.filter(c => !c.parentId).length
    };
  });

  // Tree structure computed
  readonly categoryTree = computed<CategoryTreeNode[]>(() => 
    this.buildCategoryTree(null, 0)
  );

  constructor(private http: HttpClient) {
    this.loadCategories();
  }

  // ==================== CRUD Operations ====================

  /**
   * Load all categories
   * For Spring Boot: GET /api/v1/categories
   */
  loadCategories(): void {
    this.loading.set(true);
    this.http.get<Category[]>(this.CATEGORIES_URL).pipe(
      delay(300),
      map(cats => this.transformDates(cats)),
      catchError(this.handleError('loadCategories', []))
    ).subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  /**
   * Get all categories
   * For Spring Boot: GET /api/v1/categories
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.CATEGORIES_URL).pipe(
      map(cats => this.transformDates(cats)),
      catchError(this.handleError('getCategories', []))
    );
  }

  /**
   * Get category by ID
   * For Spring Boot: GET /api/v1/categories/{id}
   */
  getCategory(id: string): Observable<Category | null> {
    return this.getCategories().pipe(
      map(cats => cats.find(c => c.id === id) || null),
      catchError(this.handleError('getCategory', null))
    );
  }

  /**
   * Get category by slug
   * For Spring Boot: GET /api/v1/categories/slug/{slug}
   */
  getCategoryBySlug(slug: string): Observable<Category | null> {
    return this.getCategories().pipe(
      map(cats => cats.find(c => c.slug === slug) || null),
      catchError(this.handleError('getCategoryBySlug', null))
    );
  }

  /**
   * Create category
   * For Spring Boot: POST /api/v1/categories
   */
  createCategory(category: Partial<Category>): Observable<Category> {
    const newCategory: Category = {
      ...category as Category,
      id: this.generateId(),
      subcategories: [],
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.categories.update(current => [...current, newCategory]);
    return of(newCategory).pipe(delay(500));
    
    // For Spring Boot:
    // return this.http.post<ApiResponse<Category>>(`${this.BASE_URL}/categories`, category).pipe(
    //   map(response => response.data),
    //   tap(() => this.loadCategories())
    // );
  }

  /**
   * Update category
   * For Spring Boot: PUT /api/v1/categories/{id}
   */
  updateCategory(id: string, updates: Partial<Category>): Observable<Category> {
    this.categories.update(current =>
      current.map(c =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date() }
          : c
      )
    );
    
    const updated = this.categories().find(c => c.id === id);
    return updated ? of(updated).pipe(delay(500)) : throwError(() => new Error('Category not found'));
  }

  /**
   * Delete category
   * For Spring Boot: DELETE /api/v1/categories/{id}
   */
  deleteCategory(id: string): Observable<void> {
    // Check for subcategories
    const hasChildren = this.categories().some(c => c.parentId === id);
    if (hasChildren) {
      return throwError(() => new Error('Cannot delete category with subcategories'));
    }
    
    this.categories.update(current => current.filter(c => c.id !== id));
    return of(void 0).pipe(delay(500));
  }

  /**
   * Bulk update category status
   * For Spring Boot: PUT /api/v1/categories/bulk/status
   */
  bulkUpdateStatus(ids: string[], isActive: boolean): Observable<void> {
    this.categories.update(current =>
      current.map(c => ids.includes(c.id) ? { ...c, isActive } : c)
    );
    return of(void 0).pipe(delay(500));
  }

  /**
   * Bulk delete categories
   * For Spring Boot: DELETE /api/v1/categories/bulk
   */
  bulkDelete(ids: string[]): Observable<void> {
    // Delete category and all its children
    const idsToDelete = new Set<string>(ids);
    const collectChildIds = (parentId: string) => {
      this.categories()
        .filter(c => c.parentId === parentId)
        .forEach(c => {
          idsToDelete.add(c.id);
          collectChildIds(c.id);
        });
    };
    ids.forEach(id => collectChildIds(id));
    
    this.categories.update(current => 
      current.filter(c => !idsToDelete.has(c.id))
    );
    return of(void 0).pipe(delay(800));
  }

  // ==================== Tree Operations ====================

  /**
   * Build category tree structure
   */
  private buildCategoryTree(parentId: string | null, level: number): CategoryTreeNode[] {
    return this.categories()
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(c => ({
        ...c,
        level,
        isExpanded: false,
        isEditing: false,
        subcategories: this.buildCategoryTree(c.id, level + 1)
      }));
  }

  /**
   * Get flat list of all categories (for dropdowns)
   * For Spring Boot: GET /api/v1/categories/flat
   */
  getFlatCategories(): Observable<Category[]> {
    return this.getCategories().pipe(
      map(cats => this.flattenCategories(cats))
    );
  }

  /**
   * Get available parent categories (exclude current and its children)
   */
  getAvailableParents(currentId?: string): Observable<Category[]> {
    return this.getCategories().pipe(
      map(cats => {
        if (!currentId) return cats;
        
        // Get all children of current to exclude
        const childrenIds = new Set<string>();
        const collectChildren = (parentId: string) => {
          cats.filter(c => c.parentId === parentId).forEach(c => {
            childrenIds.add(c.id);
            collectChildren(c.id);
          });
        };
        collectChildren(currentId);
        
        return cats.filter(c => c.id !== currentId && !childrenIds.has(c.id));
      })
    );
  }

  /**
   * Move category to new parent
   * For Spring Boot: PUT /api/v1/categories/{id}/move
   */
  moveCategory(id: string, newParentId: string | null): Observable<Category> {
    return this.updateCategory(id, { parentId: newParentId });
  }

  /**
   * Reorder categories
   * For Spring Boot: PUT /api/v1/categories/reorder
   */
  reorderCategory(id: string, newOrder: number): Observable<void> {
    this.categories.update(current => {
      const category = current.find(c => c.id === id);
      if (!category) return current;
      
      const siblings = current.filter(c => c.parentId === category.parentId);
      const oldOrder = category.sortOrder;
      
      return current.map(c => {
        if (c.id === id) return { ...c, sortOrder: newOrder };
        if (c.parentId === category.parentId) {
          if (oldOrder < newOrder && c.sortOrder > oldOrder && c.sortOrder <= newOrder) {
            return { ...c, sortOrder: c.sortOrder - 1 };
          }
          if (oldOrder > newOrder && c.sortOrder < oldOrder && c.sortOrder >= newOrder) {
            return { ...c, sortOrder: c.sortOrder + 1 };
          }
        }
        return c;
      });
    });
    
    return of(void 0).pipe(delay(300));
  }

  // ==================== Templates ====================

  /**
   * Get category templates
   * For Spring Boot: GET /api/v1/categories/templates
   */
  getTemplates(): Observable<CategoryTemplate[]> {
    const templates: CategoryTemplate[] = [
      {
        id: 'electronics',
        name: 'Electronics',
        description: 'For gadgets and devices',
        icon: 'laptop',
        color: '#6366f1',
        defaultFields: { icon: 'laptop', color: '#6366f1', isFeatured: true }
      },
      {
        id: 'fashion',
        name: 'Fashion',
        description: 'For clothing and apparel',
        icon: 'shirt',
        color: '#f59e0b',
        defaultFields: { icon: 'shirt', color: '#f59e0b', isFeatured: true }
      },
      {
        id: 'home',
        name: 'Home & Garden',
        description: 'For home and living',
        icon: 'house',
        color: '#10b981',
        defaultFields: { icon: 'house', color: '#10b981', isFeatured: false }
      },
      {
        id: 'sports',
        name: 'Sports',
        description: 'For sports and fitness',
        icon: 'bicycle',
        color: '#f43f5e',
        defaultFields: { icon: 'bicycle', color: '#f43f5e', isFeatured: false }
      }
    ];
    return of(templates).pipe(delay(200));
  }

  // ==================== Helper Methods ====================

  private flattenCategories(categories: Category[], parentId: string | null = null): Category[] {
    const result: Category[] = [];
    categories
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach(c => {
        result.push(c);
        result.push(...this.flattenCategories(categories, c.id));
      });
    return result;
  }

  private transformDates(categories: Category[]): Category[] {
    return categories.map(c => ({
      ...c,
      createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
      updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined
    }));
  }

  private generateId(): string {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
