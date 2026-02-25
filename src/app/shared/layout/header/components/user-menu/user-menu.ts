import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OutsideClickDirective } from '../../../../directives/outside-click.directive';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, OutsideClickDirective],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss'
})
export class UserMenu {
  isOpen = signal(false);

  toggle() {
    this.isOpen.update(v => !v);
  }

  logout() {
    // Implement logout logic
    console.log('Logging out...');
  }
}