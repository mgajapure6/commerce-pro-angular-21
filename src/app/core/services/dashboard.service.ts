// src/app/core/services/dashboard.service.ts
// Dashboard service with API-ready patterns for Spring Boot integration

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { 
  KpiCard, 
  KpiData, 
  SalesChartData, 
  TrafficSource, 
  DashboardSummary,
  DashboardStats,
  ChartPeriod,
  Activity,
  RealtimeMetrics
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Base URL - easily switchable between JSON files and Spring Boot API
  private readonly BASE_URL = 'assets/data/dashboard'; // For JSON files
  // private readonly BASE_URL = '/api/v1/dashboard'; // For Spring Boot API
  
  // State signals
  private summary = signal<DashboardSummary | null>(null);
  private salesData = signal<SalesChartData | null>(null);
  private trafficSources = signal<TrafficSource[]>([]);
  private activities = signal<Activity[]>([]);
  private realtimeMetrics = signal<RealtimeMetrics | null>(null);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  private currentPeriod = signal<ChartPeriod>('daily');
  
  // Public readonly computed signals
  readonly dashboardSummary = computed(() => this.summary());
  readonly isLoading = computed(() => this.loading());
  readonly currentError = computed(() => this.error());
  readonly period = computed(() => this.currentPeriod());
  
  // KPI computed signals
  readonly totalRevenue = computed(() => this.summary()?.totalRevenue || 0);
  readonly revenueGrowth = computed(() => this.summary()?.revenueGrowth || 0);
  
  readonly totalOrders = computed(() => this.summary()?.totalOrders || 0);
  readonly ordersGrowth = computed(() => this.summary()?.ordersGrowth || 0);
  
  readonly averageOrderValue = computed(() => this.summary()?.averageOrderValue || 0);
  readonly aovGrowth = computed(() => this.summary()?.aovGrowth || 0);
  
  readonly conversionRate = computed(() => this.summary()?.conversionRate || 0);
  readonly conversionGrowth = computed(() => this.summary()?.conversionGrowth || 0);
  
  // Chart data signals
  readonly salesChartData = computed(() => {
    const data = this.salesData();
    return data?.revenue || [];
  });
  
  readonly ordersChartData = computed(() => {
    const data = this.salesData();
    return data?.orders || [];
  });
  
  readonly chartLabels = computed(() => {
    const data = this.salesData();
    return data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  });
  
  readonly trafficSourcesList = computed(() => this.trafficSources());
  
  readonly recentActivities = computed(() => 
    this.activities().slice(0, 10)
  );
  
  readonly unreadActivitiesCount = computed(() => 
    this.activities().filter(a => !a.isRead).length
  );

  constructor(private http: HttpClient) {
    this.loadDashboardData();
  }

  // ==================== Data Loading ====================

  /**
   * Load all dashboard data
   * For Spring Boot: GET /api/v1/dashboard/summary
   */
  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);
    
    // Load summary
    this.http.get<DashboardSummary>(`${this.BASE_URL}/summary.json`).pipe(
      delay(200),
      catchError(this.handleError('loadSummary', null))
    ).subscribe(data => {
      if (data) this.summary.set(data);
    });
    
    // Load sales chart data
    this.http.get<SalesChartData>(`${this.BASE_URL}/sales-chart.json`).pipe(
      delay(300),
      catchError(this.handleError('loadSalesData', null))
    ).subscribe(data => {
      if (data) this.salesData.set(data);
    });
    
    // Load traffic sources
    this.http.get<TrafficSource[]>(`${this.BASE_URL}/traffic-sources.json`).pipe(
      delay(400),
      catchError(this.handleError('loadTrafficSources', []))
    ).subscribe(data => {
      this.trafficSources.set(data);
    });
    
    // Load activities
    this.http.get<Activity[]>(`${this.BASE_URL}/recent-activities.json`).pipe(
      delay(500),
      map(activities => this.transformActivityDates(activities)),
      catchError(this.handleError('loadActivities', []))
    ).subscribe(data => {
      this.activities.set(data);
      this.loading.set(false);
    });
    
    // For Spring Boot API:
    // this.http.get<DashboardStats>(`${this.BASE_URL}/stats`).pipe(
    //   tap(stats => {
    //     this.summary.set(stats.summary);
    //     this.salesData.set(stats.salesData);
    //     this.trafficSources.set(stats.trafficSources);
    //     this.loading.set(false);
    //   }),
    //   catchError(this.handleError('loadDashboardData', null))
    // ).subscribe();
  }

  /**
   * Refresh dashboard data
   */
  refresh(): void {
    this.loadDashboardData();
  }

  /**
   * Change time period
   * For Spring Boot: GET /api/v1/dashboard/summary?period={period}
   */
  setPeriod(period: ChartPeriod): void {
    this.currentPeriod.set(period);
    
    // Reload data for new period
    // In real API, this would fetch different data
    this.loading.set(true);
    
    // Simulate different data for different periods
    this.http.get<SalesChartData>(`${this.BASE_URL}/sales-chart.json`).pipe(
      map(data => this.transformDataForPeriod(data, period)),
      delay(300),
      catchError(this.handleError('setPeriod', null))
    ).subscribe(data => {
      if (data) {
        this.salesData.set(data);
      }
      this.loading.set(false);
    });
    
    // For Spring Boot:
    // const params = new HttpParams().set('period', period);
    // this.http.get<DashboardStats>(`${this.BASE_URL}/stats`, { params })...
  }

  // ==================== KPI Cards ====================

  /**
   * Get KPI cards for display with gradient styles
   */
  getKpiCards(): KpiCard[] {
    const summary = this.summary();
    if (!summary) return [];
    
    return [
      {
        title: 'Total Revenue',
        value: this.formatCurrency(summary.totalRevenue),
        previous: this.formatCurrency(summary.totalRevenue / (1 + summary.revenueGrowth / 100)),
        growth: summary.revenueGrowth,
        icon: 'cash-coin',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        gradient: 'from-indigo-500 via-purple-500 to-pink-500'
      },
      {
        title: 'Total Orders',
        value: summary.totalOrders.toLocaleString(),
        previous: Math.round(summary.totalOrders / (1 + summary.ordersGrowth / 100)).toLocaleString(),
        growth: summary.ordersGrowth,
        icon: 'bag-check',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        gradient: 'from-blue-500 via-cyan-500 to-teal-500'
      },
      {
        title: 'Average Order Value',
        value: '$' + summary.averageOrderValue.toFixed(2),
        previous: '$' + (summary.averageOrderValue / (1 + summary.aovGrowth / 100)).toFixed(2),
        growth: summary.aovGrowth,
        icon: 'receipt',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-500'
      },
      {
        title: 'Conversion Rate',
        value: summary.conversionRate.toFixed(2) + '%',
        previous: (summary.conversionRate / (1 + summary.conversionGrowth / 100)).toFixed(2) + '%',
        growth: summary.conversionGrowth,
        icon: 'percent',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        gradient: 'from-orange-500 via-amber-500 to-yellow-500'
      }
    ];
  }

  /**
   * Get raw KPI data
   */
  getKpiData(): KpiData {
    return {
      revenue: { value: this.totalRevenue(), growth: this.revenueGrowth() },
      orders: { value: this.totalOrders(), growth: this.ordersGrowth() },
      aov: { value: this.averageOrderValue(), growth: this.aovGrowth() },
      conversion: { value: this.conversionRate(), growth: this.conversionGrowth() }
    };
  }

  // ==================== Sales Data ====================

  /**
   * Get sales data for charts
   * For Spring Boot: GET /api/v1/dashboard/sales?period={period}
   */
  getSalesData(period?: ChartPeriod): Observable<SalesChartData> {
    const url = `${this.BASE_URL}/sales-chart.json`;
    
    return this.http.get<SalesChartData>(url).pipe(
      map(data => period ? this.transformDataForPeriod(data, period) : data),
      catchError(this.handleError('getSalesData', { labels: [], revenue: [], orders: [] }))
    );
    
    // For Spring Boot:
    // const params = new HttpParams().set('period', period || this.currentPeriod());
    // return this.http.get<SalesChartData>(`${this.BASE_URL}/sales`, { params });
  }

  // ==================== Traffic Sources ====================

  /**
   * Get traffic sources
   * For Spring Boot: GET /api/v1/dashboard/traffic-sources
   */
  getTrafficSources(): Observable<TrafficSource[]> {
    return this.http.get<TrafficSource[]>(`${this.BASE_URL}/traffic-sources.json`).pipe(
      catchError(this.handleError('getTrafficSources', []))
    );
    
    // For Spring Boot:
    // return this.http.get<TrafficSource[]>(`${this.BASE_URL}/traffic-sources`);
  }

  // ==================== Activities ====================

  /**
   * Get recent activities
   * For Spring Boot: GET /api/v1/dashboard/activities
   */
  getActivities(limit: number = 10): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.BASE_URL}/recent-activities.json`).pipe(
      map(activities => this.transformActivityDates(activities).slice(0, limit)),
      catchError(this.handleError('getActivities', []))
    );
  }

  /**
   * Mark activity as read
   * For Spring Boot: PUT /api/v1/dashboard/activities/{id}/read
   */
  markActivityAsRead(id: string): Observable<void> {
    this.activities.update(current =>
      current.map(a => a.id === id ? { ...a, isRead: true } : a)
    );
    return of(void 0).pipe(delay(100));
  }

  /**
   * Mark all activities as read
   * For Spring Boot: PUT /api/v1/dashboard/activities/read-all
   */
  markAllActivitiesAsRead(): Observable<void> {
    this.activities.update(current =>
      current.map(a => ({ ...a, isRead: true }))
    );
    return of(void 0).pipe(delay(100));
  }

  // ==================== Real-time Metrics ====================

  /**
   * Get real-time metrics (for live dashboard)
   * For Spring Boot: GET /api/v1/dashboard/realtime
   */
  getRealtimeMetrics(): Observable<RealtimeMetrics> {
    // Mock real-time data
    const mockMetrics: RealtimeMetrics = {
      activeUsers: Math.floor(Math.random() * 100) + 50,
      activeUsersChange: Math.random() * 20 - 10,
      cartAdditions: Math.floor(Math.random() * 20) + 5,
      checkoutInitiated: Math.floor(Math.random() * 10) + 2,
      currentRevenue: Math.random() * 1000 + 500
    };
    
    return of(mockMetrics).pipe(delay(200));
    
    // For Spring Boot:
    // return this.http.get<RealtimeMetrics>(`${this.BASE_URL}/realtime`);
  }

  // ==================== Export ====================

  /**
   * Export dashboard data
   * For Spring Boot: POST /api/v1/dashboard/export
   */
  exportDashboard(format: 'pdf' | 'csv' | 'excel'): Observable<Blob> {
    // Mock export
    const content = `Dashboard Export - ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    return of(blob).pipe(delay(1000));
    
    // For Spring Boot:
    // return this.http.post(`${this.BASE_URL}/export`, { format }, { responseType: 'blob' });
  }

  // ==================== Helper Methods ====================

  private formatCurrency(value: number): string {
    return '$' + value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  private transformDataForPeriod(data: SalesChartData, period: ChartPeriod): SalesChartData {
    // Transform data based on selected period
    // This is a mock transformation - real implementation would fetch different data
    switch (period) {
      case 'weekly':
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          revenue: data.revenue.map(v => v * 7).slice(0, 4),
          orders: data.orders.map(v => v * 7).slice(0, 4)
        };
      case 'monthly':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          revenue: [28500, 32400, 29800, 35600, 38200, 41500],
          orders: [285, 324, 298, 356, 382, 415]
        };
      case 'yearly':
        return {
          labels: ['2020', '2021', '2022', '2023', '2024'],
          revenue: [320000, 380000, 450000, 520000, 680000],
          orders: [3200, 3800, 4500, 5200, 6800]
        };
      default:
        return data;
    }
  }

  private transformActivityDates(activities: Activity[]): Activity[] {
    return activities.map(a => ({
      ...a,
      timestamp: new Date(a.timestamp)
    }));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      this.error.set(error.message);
      return of(result as T);
    };
  }
}
