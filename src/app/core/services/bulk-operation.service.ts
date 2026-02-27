// src/app/core/services/bulk-operation.service.ts
// Bulk operation service with API-ready patterns

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, delay, tap } from 'rxjs/operators';
import { 
  OperationHistoryItem, 
  BulkOperationType,
  BulkEditValues,
  CopyOptions,
  DeleteOptions,
  ExportOptions,
  ImportMode,
  ExportFormat,
  ImportPreviewRow
} from '../models/catalog-shared.model';
import { ApiResponse, PageParams, PageResponse } from './product.service';

export interface BulkOperationResult {
  success: boolean;
  affectedCount: number;
  errors: string[];
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class BulkOperationService {
  private readonly BASE_URL = 'assets/data/catalog';
  private readonly HISTORY_URL = `${this.BASE_URL}/operation-history.json`;
  
  private history = signal<OperationHistoryItem[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  private processing = signal<boolean>(false);
  
  readonly operationHistory = computed(() => this.history());
  readonly isLoading = computed(() => this.loading());
  readonly isProcessing = computed(() => this.processing());
  readonly currentError = computed(() => this.error());

  constructor(private http: HttpClient) {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.http.get<OperationHistoryItem[]>(this.HISTORY_URL).pipe(
      delay(300),
      map(items => this.transformDates(items)),
      catchError(this.handleError('loadHistory', []))
    ).subscribe({
      next: (items) => {
        this.history.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  getHistory(): Observable<OperationHistoryItem[]> {
    return this.http.get<OperationHistoryItem[]>(this.HISTORY_URL).pipe(
      map(items => this.transformDates(items)),
      catchError(this.handleError('getHistory', []))
    );
  }

  // ==================== Bulk Edit Operations ====================

  /**
   * Execute bulk edit on products
   * For Spring Boot: POST /api/v1/products/bulk/edit
   */
  executeBulkEdit(
    productIds: string[], 
    fields: string[], 
    values: BulkEditValues
  ): Observable<BulkOperationResult> {
    this.processing.set(true);
    
    // Simulate API call
    return of({
      success: true,
      affectedCount: productIds.length,
      errors: [],
      duration: 2.5
    }).pipe(
      delay(2000),
      tap(result => {
        this.addToHistory({
          id: `hist_${Date.now()}`,
          type: 'edit',
          title: 'Mass Edit - ' + fields.join(', '),
          description: `Updated ${fields.length} fields on ${result.affectedCount} products`,
          icon: 'pencil-square',
          status: 'completed',
          timestamp: new Date(),
          affectedCount: result.affectedCount,
          duration: result.duration,
          canUndo: true
        });
        this.processing.set(false);
      }),
      catchError(error => {
        this.processing.set(false);
        return throwError(() => error);
      })
    );
    
    // For Spring Boot:
    // return this.http.post<ApiResponse<BulkOperationResult>>(
    //   `${this.BASE_URL}/products/bulk/edit`,
    //   { productIds, fields, values }
    // ).pipe(map(response => response.data));
  }

  // ==================== Import Operations ====================

  /**
   * Validate import file
   * For Spring Boot: POST /api/v1/products/import/validate
   */
  validateImport(file: File, mode: ImportMode): Observable<ImportPreviewRow[]> {
    this.processing.set(true);
    
    // Mock validation
    const mockPreview: ImportPreviewRow[] = [
      { name: 'New Product 1', sku: 'NEW-001', status: 'valid' },
      { name: 'New Product 2', sku: 'NEW-002', status: 'valid' },
      { name: 'Existing Product', sku: 'WH-PRO-001', status: 'error', message: 'SKU already exists' },
      { name: 'New Product 3', sku: 'NEW-003', status: 'valid' },
      { name: 'Invalid Data', sku: '', status: 'error', message: 'SKU is required' }
    ];
    
    return of(mockPreview).pipe(
      delay(1500),
      tap(() => this.processing.set(false)),
      catchError(error => {
        this.processing.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Execute import
   * For Spring Boot: POST /api/v1/products/import
   */
  executeImport(
    file: File, 
    mode: ImportMode, 
    skipValidation: boolean
  ): Observable<BulkOperationResult> {
    this.processing.set(true);
    
    return of({
      success: true,
      affectedCount: 125,
      errors: [],
      duration: 15.3
    }).pipe(
      delay(3000),
      tap(result => {
        this.addToHistory({
          id: `hist_${Date.now()}`,
          type: 'import',
          title: 'Product Import',
          description: `Imported ${result.affectedCount} products via ${mode} mode`,
          icon: 'upload',
          status: 'completed',
          timestamp: new Date(),
          affectedCount: result.affectedCount,
          duration: result.duration,
          canUndo: false
        });
        this.processing.set(false);
      })
    );
  }

  // ==================== Export Operations ====================

  /**
   * Execute export
   * For Spring Boot: POST /api/v1/products/export
   */
  executeExport(
    productIds: string[] | 'all',
    format: ExportFormat,
    fields: string[],
    options: ExportOptions
  ): Observable<Blob> {
    this.processing.set(true);
    
    // Simulate file generation
    const mockContent = 'mock export data';
    const blob = new Blob([mockContent], { type: 'text/csv' });
    
    return of(blob).pipe(
      delay(2000),
      tap(() => {
        this.addToHistory({
          id: `hist_${Date.now()}`,
          type: 'export',
          title: 'Product Export',
          description: `Exported ${fields.length} fields to ${format.toUpperCase()}`,
          icon: 'download',
          status: 'completed',
          timestamp: new Date(),
          affectedCount: Array.isArray(productIds) ? productIds.length : 1247,
          duration: 5.2,
          canUndo: false
        });
        this.processing.set(false);
      })
    );
    
    // For Spring Boot:
    // return this.http.post(
    //   `${this.BASE_URL}/products/export`,
    //   { productIds, format, fields, options },
    //   { responseType: 'blob' }
    // );
  }

  downloadTemplate(format: 'csv' | 'excel'): Observable<Blob> {
    const mockContent = 'SKU,Name,Description,Price,Stock...';
    const blob = new Blob([mockContent], { 
      type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    return of(blob).pipe(delay(500));
  }

  // ==================== Copy Operations ====================

  /**
   * Duplicate products
   * For Spring Boot: POST /api/v1/products/bulk/duplicate
   */
  executeCopy(
    productIds: string[], 
    options: CopyOptions
  ): Observable<BulkOperationResult> {
    this.processing.set(true);
    
    return of({
      success: true,
      affectedCount: productIds.length,
      errors: [],
      duration: 4.1
    }).pipe(
      delay(2500),
      tap(result => {
        this.addToHistory({
          id: `hist_${Date.now()}`,
          type: 'copy',
          title: 'Duplicate Products',
          description: `Created ${result.affectedCount} product copies`,
          icon: 'copy',
          status: 'completed',
          timestamp: new Date(),
          affectedCount: result.affectedCount,
          duration: result.duration,
          canUndo: true
        });
        this.processing.set(false);
      })
    );
  }

  // ==================== Delete Operations ====================

  /**
   * Delete or archive products
   * For Spring Boot: DELETE /api/v1/products/bulk or POST /api/v1/products/bulk/archive
   */
  executeDelete(
    productIds: string[], 
    options: DeleteOptions
  ): Observable<BulkOperationResult> {
    this.processing.set(true);
    
    const isArchive = options.archiveInstead;
    
    return of({
      success: true,
      affectedCount: productIds.length,
      errors: [],
      duration: isArchive ? 1.5 : 2.0
    }).pipe(
      delay(isArchive ? 1500 : 2000),
      tap(result => {
        this.addToHistory({
          id: `hist_${Date.now()}`,
          type: 'delete',
          title: isArchive ? 'Archive Products' : 'Delete Products',
          description: isArchive 
            ? `Archived ${result.affectedCount} products`
            : `Permanently deleted ${result.affectedCount} products`,
          icon: isArchive ? 'archive' : 'trash3',
          status: 'completed',
          timestamp: new Date(),
          affectedCount: result.affectedCount,
          duration: result.duration,
          canUndo: isArchive
        });
        this.processing.set(false);
      })
    );
  }

  // ==================== Undo Operations ====================

  undoOperation(historyId: string): Observable<boolean> {
    const item = this.history().find(h => h.id === historyId);
    if (!item || !item.canUndo) {
      return throwError(() => new Error('Operation cannot be undone'));
    }
    
    // Mark as undone in history
    this.history.update(current =>
      current.map(h =>
        h.id === historyId
          ? { ...h, status: 'failed' as const, description: h.description + ' (Undone)' }
          : h
      )
    );
    
    return of(true).pipe(delay(1000));
  }

  // ==================== History Management ====================

  private addToHistory(item: OperationHistoryItem): void {
    this.history.update(current => [item, ...current]);
  }

  clearHistory(): Observable<void> {
    this.history.set([]);
    return of(void 0);
  }

  // Helper methods
  private transformDates(items: OperationHistoryItem[]): OperationHistoryItem[] {
    return items.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
