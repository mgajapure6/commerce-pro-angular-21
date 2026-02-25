import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-traffic-sources',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './traffic-sources.html',
  styleUrl: './traffic-sources.scss' 
})
export class TrafficSources {
  trafficSources = computed(() => this.dashboardService.trafficSources());

  constructor(private dashboardService: DashboardService) {}
}