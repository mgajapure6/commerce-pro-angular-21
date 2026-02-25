import { Component, Input, Output, EventEmitter, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutsideClickDirective } from './../../directives/outside-click.directive';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, OutsideClickDirective],
  templateUrl: './dropdown.html'
})
export class Dropdown implements AfterViewInit, OnDestroy {
  @Input() label?: string;
  @Input() icon?: string;
  @Input() items: DropdownItem[] = [];
  @Input() position: 'auto' | 'top' | 'bottom' | 'left' | 'right' = 'auto';
  @Input() align: 'auto' | 'start' | 'center' | 'end' = 'auto';
  @Input() showChevron = true;
  @Input() disabled = false;
  @Input() triggerClass = '';
  @Input() menuClass = '';
  @Input() closeOnSelect = true;
  @Input() offset = 8;
  @Input() closeOnScroll = false; // Option to close on scroll instead of following
  
  @Output() itemSelected = new EventEmitter<DropdownItem>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('dropdownContainer') containerRef!: ElementRef<HTMLElement>;
  @ViewChild('dropdownMenu') menuRef!: ElementRef<HTMLElement>;

  isOpen = signal(false);
  menuPosition = signal<{
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    maxHeight?: number;
  }>({});

  private scrollListeners: (() => void)[] = [];
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;

  ngAfterViewInit() {
    // Watch for resize
    this.resizeObserver = new ResizeObserver(() => {
      if (this.isOpen()) {
        this.calculatePosition();
      }
    });
    this.resizeObserver.observe(document.body);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.removeScrollListeners();
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isOpen()) {
      this.calculatePosition();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.isOpen()) {
      if (this.closeOnScroll) {
        this.close();
      } else {
        this.calculatePosition();
      }
    }
  }

  private addScrollListeners() {
    // Listen to all scrollable ancestors
    let element: HTMLElement | null = this.containerRef.nativeElement.parentElement;
    
    while (element) {
      const style = window.getComputedStyle(element);
      const isScrollable = style.overflow === 'auto' || style.overflow === 'scroll' || 
                          style.overflowY === 'auto' || style.overflowY === 'scroll';
      
      if (isScrollable || element.tagName === 'MAIN' || element.tagName === 'DIV') {
        const listener = () => {
          if (this.isOpen()) {
            if (this.closeOnScroll) {
              this.close();
            } else {
              this.calculatePosition();
            }
          }
        };
        element.addEventListener('scroll', listener, { passive: true });
        this.scrollListeners.push(() => element?.removeEventListener('scroll', listener));
      }
      
      element = element.parentElement;
    }
  }

  private removeScrollListeners() {
    this.scrollListeners.forEach(remove => remove());
    this.scrollListeners = [];
  }

  toggle(event: Event) {
    event.stopPropagation();
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen.set(true);
    this.addScrollListeners();
    
    // Watch trigger visibility
    if (this.containerRef) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting && this.isOpen()) {
            this.close();
          }
        },
        { threshold: 0 }
      );
      this.intersectionObserver.observe(this.containerRef.nativeElement);
    }
    
    setTimeout(() => this.calculatePosition(), 0);
    this.opened.emit();
  }

  close() {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.menuPosition.set({});
      this.removeScrollListeners();
      this.intersectionObserver?.disconnect();
      this.closed.emit();
    }
  }

  private calculatePosition() {
    if (!this.containerRef) return;

    const triggerRect = this.containerRef.nativeElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Estimate menu height (will be updated after render)
    const estimatedMenuHeight = Math.min(this.items.length * 40 + 16, 400);

    let position: { top?: number; left?: number; right?: number; bottom?: number; maxHeight?: number } = {};

    // Vertical position
    if (this.position === 'auto') {
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (spaceBelow >= estimatedMenuHeight + this.offset || spaceBelow >= spaceAbove) {
        position.top = triggerRect.bottom + this.offset;
        position.maxHeight = Math.min(400, spaceBelow - this.offset);
      } else {
        position.bottom = viewportHeight - triggerRect.top + this.offset;
        position.maxHeight = Math.min(400, spaceAbove - this.offset);
      }
    } else if (this.position === 'top') {
      position.bottom = viewportHeight - triggerRect.top + this.offset;
      position.maxHeight = Math.min(400, triggerRect.top - this.offset);
    } else if (this.position === 'bottom') {
      position.top = triggerRect.bottom + this.offset;
      position.maxHeight = Math.min(400, viewportHeight - triggerRect.bottom - this.offset);
    }

    // Horizontal alignment
    const align = this.align === 'auto' ? 'start' : this.align;
    
    if (this.position === 'left') {
      position.right = viewportWidth - triggerRect.left + this.offset;
    } else if (this.position === 'right') {
      position.left = triggerRect.right + this.offset;
    } else {
      if (align === 'start') {
        position.left = triggerRect.left;
        if (position.left + 224 > viewportWidth) { // 224 = w-56
          position.left = undefined;
          position.right = viewportWidth - triggerRect.right;
        }
      } else if (align === 'end') {
        position.right = viewportWidth - triggerRect.right;
        if (position.right + 224 > viewportWidth) {
          position.right = undefined;
          position.left = triggerRect.left;
        }
      } else if (align === 'center') {
        const centerPos = triggerRect.left + (triggerRect.width / 2) - 112; // 112 = half of w-56
        if (centerPos < 0) {
          position.left = 8;
        } else if (centerPos + 224 > viewportWidth) {
          position.right = 8;
        } else {
          position.left = centerPos;
        }
      }
    }

    // Edge protection
    if (position.left !== undefined && position.left < 8) position.left = 8;
    if (position.right !== undefined && position.right < 8) position.right = 8;

    this.menuPosition.set(position);
  }

  selectItem(item: DropdownItem, event: Event) {
    event.stopPropagation();
    if (item.disabled) return;
    this.itemSelected.emit(item);
    if (this.closeOnSelect) this.close();
  }
}