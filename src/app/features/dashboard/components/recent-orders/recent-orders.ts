import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-recent-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-orders.html',
  styleUrl: './recent-orders.scss'
})
export class RecentOrders {
  orders = computed(() => this.orderService.recentOrders());

  constructor(private orderService: OrderService) {}
}