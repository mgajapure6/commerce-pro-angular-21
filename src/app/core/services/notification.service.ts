import { Injectable, signal } from '@angular/core';
import { Notification } from '../models/notification.model';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'Order #12345 - $299.00',
      timestamp: new Date(Date.now() - 120000),
      read: false
    },
    {
      id: '2',
      type: 'stock',
      title: 'Low Stock Alert',
      message: 'Wireless Headphones - 3 left',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: '3',
      type: 'shipped',
      title: 'Order Shipped',
      message: 'Order #12340 has been shipped',
      timestamp: new Date(Date.now() - 10800000),
      read: true
    },
    {
      id: '4',
      type: 'review',
      title: 'New Review',
      message: '5-star review on Smart Watch',
      timestamp: new Date(Date.now() - 18000000),
      read: true
    }
  ]);

  messages = signal<Message[]>([
    {
      id: '1',
      sender: 'Sarah Johnson',
      senderAvatar: 'https://i.pravatar.cc/150?img=32',
      subject: 'Order Inquiry',
      preview: 'Regarding my order #12342, when will it arrive?',
      timestamp: new Date(Date.now() - 3600000),
      type: 'customer',
      read: false
    },
    {
      id: '2',
      sender: 'Mike Chen',
      senderAvatar: 'https://i.pravatar.cc/150?img=12',
      subject: 'Bulk Order',
      preview: 'Can you help me with a bulk order inquiry?',
      timestamp: new Date(Date.now() - 86400000),
      type: 'supplier',
      read: true
    }
  ]);

  unreadCount = signal<number>(2);
  unreadMessages = signal<number>(1);

  markAllAsRead() {
    this.notifications.update(nots => nots.map(n => ({ ...n, read: true })));
    this.unreadCount.set(0);
  }
}