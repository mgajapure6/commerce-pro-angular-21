import { Component, ElementRef, viewChild, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { DashboardService } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-chart.html',
  styleUrl: './sales-chart.scss',
})
export class SalesChart {
  chartCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');
  chart: Chart | null = null;
  activeChart = signal<'revenue' | 'orders'>('revenue');

  constructor(private dashboardService: DashboardService) {
    afterNextRender(() => {
      this.initChart();
    });
  }

  setChartType(type: 'revenue' | 'orders') {
    this.activeChart.set(type);
    this.updateChart();
  }

  private initChart() {
    const ctx = this.chartCanvas().nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: this.getChartData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6' },
            ticks: {
              callback: (value) => this.activeChart() === 'revenue' ? '$' + value : value
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart() {
    if (!this.chart) return;
    this.chart.data = this.getChartData();
    this.chart.update();
  }

  private getChartData() {
    const isRevenue = this.activeChart() === 'revenue';
    const data = isRevenue ? this.dashboardService.salesData() : this.dashboardService.ordersData();
    const color = isRevenue ? '#6366f1' : '#3b82f6';

    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: data,
        backgroundColor: color,
        borderRadius: 6,
        barThickness: 32
      }]
    };
  }
}