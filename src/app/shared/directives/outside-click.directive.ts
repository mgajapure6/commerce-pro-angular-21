import { Directive, ElementRef, Output, EventEmitter, HostListener, inject, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appOutsideClick]',
  standalone: true
})
export class OutsideClickDirective implements OnDestroy {
  @Output() appOutsideClick = new EventEmitter<void>();
  
  private elementRef = inject(ElementRef);
  private static activeDropdowns: Set<OutsideClickDirective> = new Set();
  private static documentListenerAdded = false;

  constructor() {
    OutsideClickDirective.activeDropdowns.add(this);
    if (!OutsideClickDirective.documentListenerAdded) {
      document.addEventListener('click', OutsideClickDirective.handleGlobalClick, true);
      OutsideClickDirective.documentListenerAdded = true;
    }
  }

  private static handleGlobalClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // Find which dropdown (if any) contains the clicked element
    let clickedInsideDropdown: OutsideClickDirective | null = null;
    
    for (const dropdown of OutsideClickDirective.activeDropdowns) {
      if (dropdown.elementRef.nativeElement.contains(target)) {
        clickedInsideDropdown = dropdown;
        break;
      }
    }

    // Close all dropdowns except the one clicked inside (if any)
    for (const dropdown of OutsideClickDirective.activeDropdowns) {
      if (dropdown !== clickedInsideDropdown) {
        dropdown.appOutsideClick.emit();
      }
    }
  };

  ngOnDestroy() {
    OutsideClickDirective.activeDropdowns.delete(this);
    if (OutsideClickDirective.activeDropdowns.size === 0 && OutsideClickDirective.documentListenerAdded) {
      document.removeEventListener('click', OutsideClickDirective.handleGlobalClick, true);
      OutsideClickDirective.documentListenerAdded = false;
    }
  }
}