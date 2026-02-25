import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { Header } from './shared/components/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Header],
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-50/50">
      <!-- Sidebar -->
      <app-sidebar 
        [isOpen]="sidebarOpen()"
        (close)="closeSidebar()"
        (collapseChange)="sidebarCollapsed.set($event)">
      </app-sidebar>

      <!-- Main Content -->
      <div 
        class="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out">
        
        <app-header 
          (toggleSidebar)="toggleSidebar()"
          [sidebarOpen]="sidebarOpen()"
          [sidebarCollapsed]="sidebarCollapsed()">
        </app-header>

        <main class="flex-1 overflow-y-auto overflow-x-hidden">
          <div class="mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class AppComponent {
  sidebarOpen = signal(false);
  sidebarCollapsed = signal(false);

  toggleSidebar() {
    // On mobile: toggle drawer
    // On desktop: toggle collapse state
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      this.sidebarOpen.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}