import { Injectable, signal } from '@angular/core';
import { Customer, CustomerStats } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  topCustomers = signal<Customer[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'https://i.pravatar.cc/150?img=32',
      orders: 24,
      totalSpent: 4240,
      tier: 'gold'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@example.com',
      avatar: 'https://i.pravatar.cc/150?img=12',
      orders: 18,
      totalSpent: 3180,
      tier: 'silver'
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma@example.com',
      avatar: 'https://i.pravatar.cc/150?img=45',
      orders: 15,
      totalSpent: 2850,
      tier: 'silver'
    },
    {
      id: '4',
      name: 'John Kamna',
      email: 'john@example.com',
      avatar: 'https://i.pravatar.cc/150?img=50',
      orders: 19,
      totalSpent: 5080,
      tier: 'platinum'
    }
  ]);

  customerStats = signal<CustomerStats>({
    total: 8549,
    newThisWeek: 156,
    growth: 12
  });
}