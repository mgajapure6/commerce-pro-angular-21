import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../../core/services/notification.service';
import { OutsideClickDirective } from '../../../../directives/outside-click.directive';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, OutsideClickDirective],
  templateUrl: './inbox.html',
  styleUrl: './inbox.scss'
})
export class Inbox {
  isOpen = signal(false);
  messages;
  unreadCount;

  constructor(private notificationService: NotificationService) {
    this.messages = this.notificationService.messages;
    this.unreadCount = this.notificationService.unreadMessages;
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  markAllRead() {
    // Implementation for marking messages as read
  }
}