import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-cards.html',
  styleUrl: './kpi-cards.scss'
})
export class KpiCards {
  kpiCards = computed(() => [
    {
      title: 'Total Revenue',
      value: this.formatCurrency(this.dashboardService.totalRevenue()),
      previous: '$110,740',
      growth: this.dashboardService.revenueGrowth(),
      icon: 'cash-coin',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Total Orders',
      value: this.dashboardService.totalOrders().toLocaleString(),
      previous: '1,369',
      growth: this.dashboardService.ordersGrowth(),
      icon: 'bag-check',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Average Order Value',
      value: '$' + this.dashboardService.averageOrderValue().toFixed(2),
      previous: '$86.20',
      growth: this.dashboardService.aovGrowth(),
      icon: 'receipt',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Conversion Rate',
      value: this.dashboardService.conversionRate().toFixed(2) + '%',
      previous: '3.11%',
      growth: this.dashboardService.conversionGrowth(),
      icon: 'percent',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ]);

  constructor(private dashboardService: DashboardService) { }

  private formatCurrency(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}