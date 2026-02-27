// src/app/core/services/review.service.ts
// Review service with API-ready patterns

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';
import { Review, ReviewStats, ReviewReply, ReviewStatus } from '../models/review.model';
import { ApiResponse, PageParams, PageResponse } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly BASE_URL = 'assets/data/catalog';
  private readonly REVIEWS_URL = `${this.BASE_URL}/reviews.json`;
  
  private reviews = signal<Review[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  
  readonly allReviews = computed(() => this.reviews());
  readonly isLoading = computed(() => this.loading());
  readonly currentError = computed(() => this.error());
  
  readonly reviewStats = computed<ReviewStats>(() => {
    const all = this.reviews();
    const ratings = all.map(r => r.rating);
    
    return {
      total: all.length,
      pending: all.filter(r => r.status === 'pending').length,
      approved: all.filter(r => r.status === 'approved').length,
      rejected: all.filter(r => r.status === 'rejected').length,
      averageRating: ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0,
      fiveStar: ratings.filter(r => r === 5).length,
      fourStar: ratings.filter(r => r === 4).length,
      threeStar: ratings.filter(r => r === 3).length,
      twoStar: ratings.filter(r => r === 2).length,
      oneStar: ratings.filter(r => r === 1).length
    };
  });

  constructor(private http: HttpClient) {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading.set(true);
    this.http.get<Review[]>(this.REVIEWS_URL).pipe(
      delay(300),
      map(reviews => this.transformDates(reviews)),
      catchError(this.handleError('loadReviews', []))
    ).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.REVIEWS_URL).pipe(
      map(reviews => this.transformDates(reviews)),
      catchError(this.handleError('getReviews', []))
    );
  }

  getReviewsByProduct(productId: string): Observable<Review[]> {
    return this.getReviews().pipe(
      map(reviews => reviews.filter(r => r.productId === productId)),
      catchError(this.handleError('getReviewsByProduct', []))
    );
  }

  getReview(id: string): Observable<Review | null> {
    return this.getReviews().pipe(
      map(reviews => reviews.find(r => r.id === id) || null),
      catchError(this.handleError('getReview', null))
    );
  }

  // Status management
  approveReview(id: string): Observable<Review> {
    return this.updateReview(id, { status: 'approved' });
  }

  rejectReview(id: string): Observable<Review> {
    return this.updateReview(id, { status: 'rejected' });
  }

  pendingReview(id: string): Observable<Review> {
    return this.updateReview(id, { status: 'pending' });
  }

  updateReview(id: string, updates: Partial<Review>): Observable<Review> {
    this.reviews.update(current =>
      current.map(r =>
        r.id === id
          ? { ...r, ...updates, updatedAt: new Date() }
          : r
      )
    );
    
    const updated = this.reviews().find(r => r.id === id);
    return updated ? of(updated).pipe(delay(300)) : throwError(() => new Error('Review not found'));
  }

  deleteReview(id: string): Observable<void> {
    this.reviews.update(current => current.filter(r => r.id !== id));
    return of(void 0).pipe(delay(300));
  }

  bulkUpdateStatus(ids: string[], status: ReviewStatus): Observable<void> {
    this.reviews.update(current =>
      current.map(r =>
        ids.includes(r.id)
          ? { ...r, status, updatedAt: new Date() }
          : r
      )
    );
    return of(void 0).pipe(delay(500));
  }

  bulkDelete(ids: string[]): Observable<void> {
    this.reviews.update(current => current.filter(r => !ids.includes(r.id)));
    return of(void 0).pipe(delay(500));
  }

  // Reply management
  addReply(reviewId: string, reply: Partial<ReviewReply>): Observable<Review> {
    const newReply: ReviewReply = {
      id: `reply_${Date.now()}`,
      authorId: reply.authorId || 'admin',
      authorName: reply.authorName || 'Admin',
      authorRole: reply.authorRole || 'admin',
      content: reply.content || '',
      createdAt: new Date()
    };
    
    return this.updateReview(reviewId, { reply: newReply });
  }

  removeReply(reviewId: string): Observable<Review> {
    return this.updateReview(reviewId, { reply: undefined });
  }

  // Helpful votes
  markHelpful(reviewId: string): Observable<Review> {
    const review = this.reviews().find(r => r.id === reviewId);
    if (!review) return throwError(() => new Error('Review not found'));
    
    return this.updateReview(reviewId, {
      helpfulCount: review.helpfulCount + 1
    });
  }

  markUnhelpful(reviewId: string): Observable<Review> {
    const review = this.reviews().find(r => r.id === reviewId);
    if (!review) return throwError(() => new Error('Review not found'));
    
    return this.updateReview(reviewId, {
      unhelpfulCount: review.unhelpfulCount + 1
    });
  }

  // Helper methods
  private transformDates(reviews: Review[]): Review[] {
    return reviews.map(r => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
      reply: r.reply ? {
        ...r.reply,
        createdAt: new Date(r.reply.createdAt)
      } : undefined
    }));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
