// src/app/features/inventory/components/demand-forecasting/demand-forecasting.component.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  image: string;
  supplier: string;
  unitCost: number;
  leadTimeDays: number;
}

interface HistoricalData {
  month: string;
  sales: number;
  trend: number;
  seasonality: number;
}

interface ForecastData {
  period: string;
  predictedDemand: number;
  confidenceLower: number;
  confidenceUpper: number;
  recommendedStock: number;
  reorderPoint: number;
}

interface DemandForecast {
  id: string;
  product: Product;
  currentStock: number;
  avgDailySales: number;
  forecastHorizon: number;
  historicalData: HistoricalData[];
  forecasts: ForecastData[];
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  seasonalityScore: number;
  lastUpdated: Date;
  alertLevel: 'none' | 'low' | 'medium' | 'high';
  recommendedAction: string;
}

interface ForecastAccuracy {
  mape: number;
  rmse: number;
  bias: number;
  lastTested: Date;
}

@Component({
  selector: 'app-demand-forecasting',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forecasting.html',
  styleUrl: './forecasting.scss'
})
export class Forecasting implements OnInit {
  private fb = new FormBuilder();

  activeView = signal<'list' | 'detail' | 'create'>('list');
  selectedForecast = signal<DemandForecast | null>(null);
  showFilters = signal(false);
  showSettingsModal = signal(false);
  showGenerateModal = signal(false);
  showExportModal = signal(false);

  filterForm!: FormGroup;
  settingsForm!: FormGroup;
  generateForm!: FormGroup;

  searchQuery = signal('');
  filterCategory = signal('');
  filterTrend = signal('');
  filterAlertLevel = signal('');
  filterTimeRange = signal(30);

  products = signal<Product[]>([
    {
      id: 'p1',
      name: 'Wireless Bluetooth Headphones Pro',
      sku: 'WBH-PM-001',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
      supplier: 'TechCorp',
      unitCost: 45.00,
      leadTimeDays: 14
    },
    {
      id: 'p2',
      name: 'Smart Watch Series 5',
      sku: 'SW-S5-002',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
      supplier: 'TechCorp',
      unitCost: 120.00,
      leadTimeDays: 21
    },
    {
      id: 'p3',
      name: 'Organic Cotton T-Shirt',
      sku: 'OCT-001-BLK',
      category: 'Clothing',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
      supplier: 'FashionHub',
      unitCost: 12.00,
      leadTimeDays: 7
    },
    {
      id: 'p4',
      name: 'Running Shoes Pro',
      sku: 'RS-PRO-001',
      category: 'Sports',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
      supplier: 'SportsPro',
      unitCost: 35.00,
      leadTimeDays: 10
    },
    {
      id: 'p5',
      name: 'Leather Laptop Bag',
      sku: 'LLB-ES-001',
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100',
      supplier: 'FashionHub',
      unitCost: 55.00,
      leadTimeDays: 14
    }
  ]);

  categories = signal(['Electronics', 'Clothing', 'Sports', 'Accessories', 'Home & Garden']);
  forecasts = signal<DemandForecast[]>([]);

  forecastAccuracy = signal<ForecastAccuracy>({
    mape: 8.5,
    rmse: 12.3,
    bias: 2.1,
    lastTested: new Date('2024-02-20')
  });

  ngOnInit() {
    this.initializeForms();
    this.generateMockForecasts();
  }

  initializeForms() {
    this.filterForm = this.fb.group({
      category: [''],
      trend: [''],
      alertLevel: [''],
      timeRange: [30]
    });

    this.settingsForm = this.fb.group({
      forecastHorizon: [30, [Validators.required, Validators.min(7), Validators.max(365)]],
      confidenceLevel: [95, [Validators.required, Validators.min(80), Validators.max(99)]],
      seasonalityEnabled: [true],
      trendAnalysisEnabled: [true],
      autoReorderSuggestions: [true],
      safetyStockMultiplier: [1.5, [Validators.required, Validators.min(1), Validators.max(3)]],
      reviewFrequency: ['weekly']
    });

    this.generateForm = this.fb.group({
      productIds: [[], Validators.required],
      forecastDays: [30, [Validators.required, Validators.min(7), Validators.max(90)]],
      includeSeasonality: [true],
      includeTrend: [true]
    });
  }

  generateMockForecasts() {
    const mockForecasts: DemandForecast[] = this.products().map((product) => {
      const baseDemand = 50 + Math.random() * 100;
      const trend = Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down';
      const trendPct = Math.floor(Math.random() * 25);

      const historicalData: HistoricalData[] = [];
      const forecasts: ForecastData[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        historicalData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          sales: Math.floor(baseDemand + Math.random() * 30 - 15),
          trend: trend === 'up' ? trendPct / 6 : trend === 'down' ? -trendPct / 6 : 0,
          seasonality: Math.sin(i) * 10
        });
      }

      for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const predicted = Math.floor(baseDemand / 30 + (trend === 'up' ? i * 0.5 : trend === 'down' ? -i * 0.3 : 0));
        forecasts.push({
          period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          predictedDemand: predicted,
          confidenceLower: Math.floor(predicted * 0.85),
          confidenceUpper: Math.floor(predicted * 1.15),
          recommendedStock: Math.floor(predicted * 1.5),
          reorderPoint: Math.floor(predicted * product.leadTimeDays * 0.8)
        });
      }

      const currentStock = Math.floor(Math.random() * 200);
      const avgDailySales = Math.floor(baseDemand / 30);
      const stockCoverageDays = currentStock / avgDailySales;

      let alertLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
      let recommendedAction = 'Stock levels optimal';

      if (stockCoverageDays < product.leadTimeDays) {
        alertLevel = 'high';
        recommendedAction = `Critical: Stock will deplete before next delivery. Order ${Math.ceil((product.leadTimeDays * avgDailySales * 2) - currentStock)} units immediately.`;
      } else if (stockCoverageDays < product.leadTimeDays * 1.5) {
        alertLevel = 'medium';
        recommendedAction = `Warning: Consider placing order soon. Recommended: ${Math.ceil(product.leadTimeDays * avgDailySales * 1.5)} units.`;
      } else if (stockCoverageDays > product.leadTimeDays * 4) {
        alertLevel = 'low';
        recommendedAction = 'Overstock alert: Consider promotional activities to reduce inventory.';
      }

      return {
        id: `fc-${product.id}`,
        product,
        currentStock,
        avgDailySales,
        forecastHorizon: 30,
        historicalData,
        forecasts,
        trend,
        trendPercentage: trendPct,
        seasonalityScore: Math.floor(Math.random() * 40) + 30,
        lastUpdated: new Date(),
        alertLevel,
        recommendedAction
      };
    });

    this.forecasts.set(mockForecasts);
  }

  filteredForecasts = computed(() => {
    let result = this.forecasts();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(f => 
        f.product.name.toLowerCase().includes(query) ||
        f.product.sku.toLowerCase().includes(query) ||
        f.product.supplier.toLowerCase().includes(query)
      );
    }

    if (this.filterCategory()) {
      result = result.filter(f => f.product.category === this.filterCategory());
    }
    if (this.filterTrend()) {
      result = result.filter(f => f.trend === this.filterTrend());
    }
    if (this.filterAlertLevel()) {
      result = result.filter(f => f.alertLevel === this.filterAlertLevel());
    }

    return result;
  });

  stats = computed(() => {
    const forecasts = this.forecasts();
    return {
      totalProducts: forecasts.length,
      highDemand: forecasts.filter(f => f.trend === 'up').length,
      lowDemand: forecasts.filter(f => f.trend === 'down').length,
      stableDemand: forecasts.filter(f => f.trend === 'stable').length,
      criticalAlerts: forecasts.filter(f => f.alertLevel === 'high').length,
      warningAlerts: forecasts.filter(f => f.alertLevel === 'medium').length,
      avgAccuracy: 92.5
    };
  });

  totalProjectedDemand = computed(() => {
    return this.forecasts().reduce((sum, f) => {
      return sum + f.forecasts.reduce((fs, forecast) => fs + forecast.predictedDemand, 0);
    }, 0);
  });

  totalRecommendedOrder = computed(() => {
    return this.forecasts()
      .filter(f => f.alertLevel === 'high' || f.alertLevel === 'medium')
      .reduce((sum, f) => {
        const avgForecast = f.forecasts.reduce((a, b) => a + b.predictedDemand, 0) / f.forecasts.length;
        const recommendedStock = avgForecast * f.forecastHorizon * 1.5;
        return sum + Math.max(0, recommendedStock - f.currentStock);
      }, 0);
  });

  viewForecastDetail(forecast: DemandForecast) {
    this.selectedForecast.set(forecast);
    this.activeView.set('detail');
  }

  goToList() {
    this.activeView.set('list');
    this.selectedForecast.set(null);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.filterCategory.set('');
    this.filterTrend.set('');
    this.filterAlertLevel.set('');
    this.filterForm.reset();
  }

  applyQuickFilter(filter: string) {
    this.clearFilters();
    if (filter === 'critical') {
      this.filterAlertLevel.set('high');
    } else if (filter === 'warning') {
      this.filterAlertLevel.set('medium');
    } else if (filter === 'trending-up') {
      this.filterTrend.set('up');
    } else if (filter === 'trending-down') {
      this.filterTrend.set('down');
    }
  }

  getTrendIcon(trend: string): string {
    const icons: Record<string, string> = {
      'up': 'bi-graph-up-arrow',
      'down': 'bi-graph-down-arrow',
      'stable': 'bi-dash-lg'
    };
    return icons[trend] || 'bi-dash-lg';
  }

  getTrendColor(trend: string): string {
    const colors: Record<string, string> = {
      'up': 'text-green-600 bg-green-100',
      'down': 'text-red-600 bg-red-100',
      'stable': 'text-gray-600 bg-gray-100'
    };
    return colors[trend] || 'text-gray-600 bg-gray-100';
  }

  getAlertColor(level: string): string {
    const colors: Record<string, string> = {
      'none': 'bg-green-100 text-green-700 border-green-200',
      'low': 'bg-blue-100 text-blue-700 border-blue-200',
      'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'high': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  }

  getAlertIcon(level: string): string {
    const icons: Record<string, string> = {
      'none': 'bi-check-circle',
      'low': 'bi-info-circle',
      'medium': 'bi-exclamation-triangle',
      'high': 'bi-exclamation-octagon'
    };
    return icons[level] || 'bi-circle';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  }

  generateNewForecast() {
    this.showGenerateModal.set(true);
  }

  confirmGenerate() {
    if (this.generateForm.invalid) return;
    this.showGenerateModal.set(false);
    this.generateForm.reset();
  }

  exportForecasts() {
    this.showExportModal.set(true);
  }

  confirmExport() {
    this.showExportModal.set(false);
  }

  saveSettings() {
    if (this.settingsForm.invalid) return;
    this.showSettingsModal.set(false);
  }

  refreshForecasts() {
    this.generateMockForecasts();
  }

  getForeCastCount(forecast: DemandForecast){
    return forecast.forecasts.slice(0, 30).reduce((a, b) => a +
                                        b.predictedDemand, 0);
  }

  protected readonly Math = Math;
}