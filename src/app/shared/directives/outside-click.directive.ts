import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appOutsideClick]',
  standalone: true, // Mark as standalone
})
export class OutsideClickDirective {
  @Output() appOutsideClick = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Check if the clicked element is outside the host element
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.appOutsideClick.emit();
    }
  }
}
