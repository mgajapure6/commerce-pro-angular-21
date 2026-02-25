import { Injectable, signal } from '@angular/core';
import { OrderStats } from '../models/order.model';
import { InventoryStats } from '../models/product.model';
import { CustomerStats } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // KPI Signals
  totalRevenue = signal<number>(124592);
  revenueGrowth = signal<number>(12.5);
  
  totalOrders = signal<number>(1482);
  ordersGrowth = signal<number>(8.2);
  
  averageOrderValue = signal<number>(84.12);
  aovGrowth = signal<number>(-2.4);
  
  conversionRate = signal<number>(3.24);
  conversionGrowth = signal<number>(4.1);

  // Sales data for chart
  salesData = signal<number[]>([4500, 7200, 5100, 8900, 6200, 9800, 7800]);
  ordersData = signal<number[]>([45, 72, 51, 89, 62, 98, 78]);

  // Traffic sources
  trafficSources = signal([
    { name: 'Direct', value: 42, color: '#6366f1' },
    { name: 'Social Media', value: 28, color: '#3b82f6' },
    { name: 'Organic Search', value: 18, color: '#22c55e' },
    { name: 'Referral', value: 8, color: '#eab308' },
    { name: 'Email', value: 4, color: '#ef4444' }
  ]);

  getKpiData() {
    return {
      revenue: { value: this.totalRevenue(), growth: this.revenueGrowth() },
      orders: { value: this.totalOrders(), growth: this.ordersGrowth() },
      aov: { value: this.averageOrderValue(), growth: this.aovGrowth() },
      conversion: { value: this.conversionRate(), growth: this.conversionGrowth() }
    };
  }
}