import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../../core/services/customer.service';
import { Customer } from '../../../../core/models/customer.model';

@Component({
  selector: 'app-customer-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-insights.html',
  styleUrl: './customer-insights.scss'
})
export class CustomerInsights {
  private customerService = inject(CustomerService);
  
  stats = this.customerService.customerStats;
  topCustomers = this.customerService.topCustomers;
  isLoading = this.customerService.isLoading;
  
  // Get tier color class
  getTierColor(tier: Customer['tier']): string {
    const colors: Record<string, string> = {
      bronze: 'bg-orange-100 text-orange-700',
      silver: 'bg-gray-100 text-gray-700',
      gold: 'bg-yellow-100 text-yellow-700',
      platinum: 'bg-indigo-100 text-indigo-700'
    };
    return colors[tier] || 'bg-gray-100 text-gray-700';
  }
  
  // Get tier icon
  getTierIcon(tier: Customer['tier']): string {
    const icons: Record<string, string> = {
      bronze: 'award',
      silver: 'award-fill',
      gold: 'star-fill',
      platinum: 'gem'
    };
    return icons[tier] || 'person';
  }
}
