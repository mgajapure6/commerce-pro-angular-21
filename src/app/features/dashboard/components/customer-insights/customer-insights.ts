import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../../core/services/customer.service';

@Component({
  selector: 'app-customer-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-insights.html',
  styleUrl: './customer-insights.scss'
})
export class CustomerInsights {
  stats = computed(() => this.customerService.customerStats());
  topCustomers = computed(() => this.customerService.topCustomers());

  constructor(private customerService: CustomerService) {}
}