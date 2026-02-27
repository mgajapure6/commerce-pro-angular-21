// src/app/core/services/seo.service.ts
// SEO service with API-ready patterns

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';
import { 
  SeoMetadata, 
  SeoTemplate, 
  SeoAuditResult, 
  SeoStats 
} from '../models/seo.model';
import { ApiResponse } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly BASE_URL = 'assets/data/catalog';
  
  private templates = signal<SeoTemplate[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  
  readonly allTemplates = computed(() => this.templates());
  readonly isLoading = computed(() => this.loading());
  readonly currentError = computed(() => this.error());

  constructor(private http: HttpClient) {
    this.loadTemplates();
  }

  loadTemplates(): void {
    // Mock templates - in real app, load from JSON or API
    const mockTemplates: SeoTemplate[] = [
      {
        id: 'default_product',
        name: 'Default Product',
        entityType: 'product',
        titlePattern: '{name} - {brand} | Store Name',
        descriptionPattern: 'Buy {name} from {brand}. {shortDescription}',
        isDefault: true
      },
      {
        id: 'default_category',
        name: 'Default Category',
        entityType: 'category',
        titlePattern: '{name} - Shop {name} Online | Store Name',
        descriptionPattern: 'Browse our collection of {name}. {description}',
        isDefault: true
      }
    ];
    
    this.templates.set(mockTemplates);
  }

  getTemplates(): Observable<SeoTemplate[]> {
    return of(this.templates());
  }

  getTemplate(id: string): Observable<SeoTemplate | null> {
    const template = this.templates().find(t => t.id === id);
    return of(template || null);
  }

  createTemplate(template: Partial<SeoTemplate>): Observable<SeoTemplate> {
    const newTemplate: SeoTemplate = {
      ...template as SeoTemplate,
      id: `template_${Date.now()}`
    };
    
    this.templates.update(current => [...current, newTemplate]);
    return of(newTemplate).pipe(delay(300));
  }

  updateTemplate(id: string, updates: Partial<SeoTemplate>): Observable<SeoTemplate> {
    this.templates.update(current =>
      current.map(t =>
        t.id === id ? { ...t, ...updates } : t
      )
    );
    
    const updated = this.templates().find(t => t.id === id);
    return updated ? of(updated).pipe(delay(300)) : throwError(() => new Error('Template not found'));
  }

  deleteTemplate(id: string): Observable<void> {
    this.templates.update(current => current.filter(t => t.id !== id));
    return of(void 0).pipe(delay(300));
  }

  // ==================== SEO Generation ====================

  /**
   * Generate SEO metadata from template and entity data
   */
  generateMetadata(
    template: SeoTemplate, 
    entityData: Record<string, string>
  ): SeoMetadata {
    let title = template.titlePattern;
    let description = template.descriptionPattern;
    
    // Replace placeholders
    Object.entries(entityData).forEach(([key, value]) => {
      title = title.replace(new RegExp(`{${key}}`, 'g'), value);
      description = description.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    
    return {
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      twitterTitle: title,
      twitterDescription: description
    };
  }

  /**
   * Preview SEO metadata without saving
   */
  previewMetadata(
    templateId: string, 
    entityData: Record<string, string>
  ): Observable<SeoMetadata | null> {
    return this.getTemplate(templateId).pipe(
      map(template => 
        template ? this.generateMetadata(template, entityData) : null
      )
    );
  }

  // ==================== SEO Audit ====================

  /**
   * Run SEO audit on entity
   * For Spring Boot: POST /api/v1/seo/audit
   */
  auditEntity(
    entityType: string, 
    entityId: string
  ): Observable<SeoAuditResult> {
    // Mock audit
    const mockResult: SeoAuditResult = {
      entityId,
      entityType,
      entityName: 'Sample Entity',
      score: 85,
      issues: [
        {
          type: 'warning',
          field: 'metaDescription',
          message: 'Meta description is too short',
          suggestion: 'Add at least 50 characters to meta description'
        }
      ],
      suggestions: [
        'Add more keywords to the title',
        'Include structured data markup',
        'Optimize images with alt text'
      ]
    };
    
    return of(mockResult).pipe(delay(1000));
  }

  /**
   * Get SEO stats
   * For Spring Boot: GET /api/v1/seo/stats
   */
  getStats(): Observable<SeoStats> {
    const mockStats: SeoStats = {
      totalEntities: 150,
      audited: 120,
      averageScore: 78,
      errors: 15,
      warnings: 45
    };
    
    return of(mockStats).pipe(delay(500));
  }

  /**
   * Bulk update SEO metadata
   * For Spring Boot: POST /api/v1/seo/bulk-update
   */
  bulkUpdateMetadata(
    entityType: string,
    entityIds: string[],
    metadata: Partial<SeoMetadata>
  ): Observable<{ updated: number; failed: number }> {
    return of({ updated: entityIds.length, failed: 0 }).pipe(delay(1500));
  }

  // ==================== Sitemap ====================

  /**
   * Generate sitemap
   * For Spring Boot: GET /api/v1/seo/sitemap
   */
  generateSitemap(): Observable<string> {
    const mockSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap generated -->
</urlset>`;
    return of(mockSitemap).pipe(delay(1000));
  }

  /**
   * Generate robots.txt
   */
  generateRobotsTxt(): Observable<string> {
    const content = `User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml`;
    return of(content);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
