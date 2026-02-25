import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notifications } from './components/notifications/notifications';
import { Inbox } from './components/inbox/inbox';
import { UserMenu } from './components/user-menu/user-menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    Notifications, 
    Inbox, 
    UserMenu  
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  @Input() sidebarOpen = false;
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
}