import { Injectable, signal } from '@angular/core';
import { Order, OrderStats } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders = signal<Order[]>([
    {
      id: '#12345',
      customerName: 'Sarah Johnson',
      items: 3,
      total: 299.00,
      status: 'processing',
      date: new Date(Date.now() - 120000)
    },
    {
      id: '#12344',
      customerName: 'Mike Chen',
      items: 1,
      total: 89.00,
      status: 'shipped',
      date: new Date(Date.now() - 3600000)
    },
    {
      id: '#12343',
      customerName: 'Emma Davis',
      items: 5,
      total: 567.00,
      status: 'delivered',
      date: new Date(Date.now() - 10800000)
    },
    {
      id: '#12342',
      customerName: 'James Wilson',
      items: 2,
      total: 178.00,
      status: 'pending',
      date: new Date(Date.now() - 18000000)
    }
  ]);

  recentOrders = this.orders.asReadonly();

  getOrderStats(): OrderStats {
    const all = this.orders();
    return {
      total: all.length,
      pending: all.filter(o => o.status === 'pending').length,
      processing: all.filter(o => o.status === 'processing').length,
      shipped: all.filter(o => o.status === 'shipped').length,
      delivered: all.filter(o => o.status === 'delivered').length
    };
  }
}