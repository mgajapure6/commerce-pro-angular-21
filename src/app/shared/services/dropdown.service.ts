import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private activeDropdownId = signal<string | null>(null);

  register(id: string) {
    this.activeDropdownId.set(id);
  }

  unregister(id: string) {
    if (this.activeDropdownId() === id) {
      this.activeDropdownId.set(null);
    }
  }

  isActive(id: string): boolean {
    return this.activeDropdownId() === id;
  }

  getActiveId() {
    return this.activeDropdownId();
  }

  closeAll() {
    this.activeDropdownId.set(null);
  }
}