import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../../core/services/notification.service';
import { OutsideClickDirective } from '../../../../directives/outside-click.directive';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, OutsideClickDirective],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss' 
})
export class Notifications {
  isOpen = signal(false);
  notifications;
  unreadCount;

  constructor(private notificationService: NotificationService) {
    this.notifications = this.notificationService.notifications;
    this.unreadCount = this.notificationService.unreadCount;
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  markAllRead() {
    this.notificationService.markAllAsRead();
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      order: 'cart',
      stock: 'exclamation-triangle',
      shipped: 'check-circle',
      review: 'star'
    };
    return icons[type] || 'bell';
  }

  getIconBg(type: string): string {
    const bgs: Record<string, string> = {
      order: 'bg-blue-100',
      stock: 'bg-yellow-100',
      shipped: 'bg-green-100',
      review: 'bg-purple-100'
    };
    return bgs[type] || 'bg-gray-100';
  }

  getIconColor(type: string): string {
    const colors: Record<string, string> = {
      order: 'text-blue-600',
      stock: 'text-yellow-600',
      shipped: 'text-green-600',
      review: 'text-purple-600'
    };
    return colors[type] || 'text-gray-600';
  }
}