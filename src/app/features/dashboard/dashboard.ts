import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCards } from './components/kpi-cards/kpi-cards';
import { SalesChart } from './components/sales-chart/sales-chart';
import { TrafficSources } from './components/traffic-sources/traffic-sources';
import { TopProducts } from './components/top-products/top-products';
import { InventoryStatus } from './components/inventory-status/inventory-status';
import { RecentOrders } from './components/recent-orders/recent-orders';
import { CustomerInsights } from './components/customer-insights/customer-insights';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiCards,
    SalesChart,
    TrafficSources,
    TopProducts,
    InventoryStatus,
    RecentOrders,
    CustomerInsights
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss' 
})
export class Dashboard {}