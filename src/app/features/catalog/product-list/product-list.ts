// product-list.ts
import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';
import { 
  Product, 
  ProductStatus, 
  StockStatus,
  ProductStats 
} from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  
  // expose global Math for template
  readonly Math: typeof Math = Math;
  
  // View State
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  selectedProducts = signal<string[]>([]);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  
  // Filters
  searchQuery = signal('');
  filterStatus = signal<string>('');
  filterCategory = signal<string>('');
  filterStockStatus = signal<string>('');
  filterBrand = signal<string>('');
  filterMinPrice = signal<number | null>(null);
  filterMaxPrice = signal<number | null>(null);
  filterMinRating = signal<number>(0);

  // Sorting
  sortField = signal<string>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Data from service
  products = this.productService.allProducts;
  isLoading = this.productService.isLoading;
  error = this.productService.currentError;
  
  // Stats from service
  productStats = this.productService.productStats;

  exportItems: DropdownItem[] = [
    { id: 'csv', label: 'Export as CSV', icon: 'filetype-csv' },
    { id: 'excel', label: 'Export as Excel', icon: 'filetype-xlsx' },
    { id: 'pdf', label: 'Export as PDF', icon: 'filetype-pdf' }
  ];
  
  ngOnInit() {
    // Service loads data automatically in constructor
  }

  filteredProducts = computed(() => {
    let result = this.products();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    if (this.filterStatus()) {
      result = result.filter(p => p.status === this.filterStatus());
    }

    if (this.filterCategory()) {
      result = result.filter(p => p.category === this.filterCategory());
    }

    if (this.filterStockStatus()) {
      result = result.filter(p => p.stockStatus === this.filterStockStatus());
    }

    if (this.filterBrand()) {
      result = result.filter(p => p.brand.toLowerCase() === this.filterBrand().toLowerCase());
    }

    if (this.filterMinPrice()) {
      result = result.filter(p => p.price >= this.filterMinPrice()!);
    }
    if (this.filterMaxPrice()) {
      result = result.filter(p => p.price <= this.filterMaxPrice()!);
    }

    if (this.filterMinRating() > 0) {
      result = result.filter(p => p.rating >= this.filterMinRating());
    }

    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (this.sortField()) {
        case 'price': aVal = a.price; bVal = b.price; break;
        case 'name': aVal = a.name; bVal = b.name; break;
        case 'sku': aVal = a.sku; bVal = b.sku; break;
        case 'stock': aVal = a.stock; bVal = b.stock; break;
        default: aVal = a.createdAt; bVal = b.createdAt;
      }

      if (this.sortDirection() === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  });

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredProducts().slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.itemsPerPage()));

  // Computed stats for display
  displayStats = computed(() => {
    const stats = this.productStats();
    return [
      { 
        label: 'Total Products', 
        value: stats.total.toString(), 
        trend: 8.2, 
        icon: 'box-seam', 
        bgColor: 'bg-blue-100', 
        iconColor: 'text-blue-600',
        filter: 'all'
      },
      { 
        label: 'Active', 
        value: stats.active.toString(), 
        trend: 12.5, 
        icon: 'check-circle', 
        bgColor: 'bg-green-100', 
        iconColor: 'text-green-600',
        filter: 'active'
      },
      { 
        label: 'Low Stock', 
        value: stats.lowStock.toString(), 
        trend: -3.1, 
        icon: 'exclamation-triangle', 
        bgColor: 'bg-orange-100', 
        iconColor: 'text-orange-600',
        filter: 'low_stock'
      },
      { 
        label: 'Out of Stock', 
        value: stats.outOfStock.toString(), 
        trend: -15.3, 
        icon: 'x-circle', 
        bgColor: 'bg-red-100', 
        iconColor: 'text-red-600',
        filter: 'out_of_stock'
      },
      { 
        label: 'Drafts', 
        value: stats.drafts.toString(), 
        trend: 5.7, 
        icon: 'file-earmark', 
        bgColor: 'bg-gray-100', 
        iconColor: 'text-gray-600',
        filter: 'draft'
      },
      { 
        label: 'Revenue', 
        value: '$' + stats.revenue.toFixed(0), 
        trend: 22.4, 
        icon: 'cash-stack', 
        bgColor: 'bg-emerald-100', 
        iconColor: 'text-emerald-600',
        filter: 'revenue'
      }
    ];
  });

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterStatus()) count++;
    if (this.filterCategory()) count++;
    if (this.filterStockStatus()) count++;
    if (this.filterBrand()) count++;
    if (this.filterMinPrice() || this.filterMaxPrice()) count++;
    if (this.filterMinRating() > 0) count++;
    return count;
  });

  selectedQuickFilter = signal<string>('');

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  toggleViewMode() {
    this.viewMode.update(v => v === 'table' ? 'grid' : 'table');
  }

  getProductMenuItems(product: Product): DropdownItem[] {
    const items: DropdownItem[] = [
      { id: 'edit', label: 'Edit Product', icon: 'pencil', shortcut: '⌘E' },
      { id: 'duplicate', label: 'Duplicate', icon: 'copy', shortcut: '⌘D' },
      { id: 'view', label: 'View on Store', icon: 'box-arrow-up-right' }
    ];

    if (product.status === 'active') {
      items.push({ id: 'draft', label: 'Move to Draft', icon: 'file-earmark' });
    } else {
      items.push({ id: 'activate', label: 'Activate', icon: 'check-circle' });
    }

    items.push(
      { id: 'divider', label: '', divider: true },
      { id: 'delete', label: 'Delete Product', icon: 'trash', danger: true }
    );

    return items;
  }

  onExport(item: DropdownItem) {
    this.exportProducts(item.id as 'csv' | 'excel' | 'pdf');
  }

  onProductAction(item: DropdownItem, product: Product) {
    switch (item.id) {
      case 'edit':
        // Navigate to edit
        break;
      case 'duplicate':
        // Duplicate product
        break;
      case 'view':
        // View on store
        break;
      case 'draft':
        this.productService.updateProduct(product.id, { status: 'draft' }).subscribe();
        break;
      case 'activate':
        this.productService.updateProduct(product.id, { status: 'active' }).subscribe();
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
          this.productService.deleteProduct(product.id).subscribe();
        }
        break;
    }
  }

  toggleSelection(productId: string) {
    this.selectedProducts.update(selected => {
      if (selected.includes(productId)) {
        return selected.filter(id => id !== productId);
      } else {
        return [...selected, productId];
      }
    });
  }

  isSelected(productId: string): boolean {
    return this.selectedProducts().includes(productId);
  }

  isAllSelected(): boolean {
    return this.paginatedProducts().length > 0 && 
           this.paginatedProducts().every(p => this.isSelected(p.id));
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedProducts.set([]);
    } else {
      this.selectedProducts.set(this.paginatedProducts().map(p => p.id));
    }
  }

  sort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  applyQuickFilter(filter: string) {
    this.selectedQuickFilter.set(filter);
    this.clearAllFilters();
    
    if (filter === 'active') {
      this.filterStatus.set('active');
    } else if (filter === 'low_stock') {
      this.filterStockStatus.set('low_stock');
    } else if (filter === 'out_of_stock') {
      this.filterStockStatus.set('out_of_stock');
    } else if (filter === 'draft') {
      this.filterStatus.set('draft');
    }
  }

  clearAllFilters() {
    this.filterStatus.set('');
    this.filterCategory.set('');
    this.filterStockStatus.set('');
    this.filterBrand.set('');
    this.filterMinPrice.set(null);
    this.filterMaxPrice.set(null);
    this.filterMinRating.set(0);
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
    this.currentPage.set(1);
  }

  exportProducts(format: 'csv' | 'excel' | 'pdf') {
    console.log('Exporting as', format);
    // Use BulkOperationService for actual export
  }

  bulkUpdateStatus(status: string) {
    const ids = this.selectedProducts();
    if (ids.length === 0) return;
    
    // Update each product
    ids.forEach(id => {
      this.productService.updateProduct(id, { status: status as ProductStatus }).subscribe();
    });
    this.selectedProducts.set([]);
  }

  bulkUpdateStock() {
    console.log('Bulk update stock');
  }

  bulkDelete() {
    const ids = this.selectedProducts();
    if (ids.length === 0) return;
    
    if (confirm(`Delete ${ids.length} products?`)) {
      this.productService.bulkDelete(ids).subscribe(() => {
        this.selectedProducts.set([]);
      });
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  visiblePages(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      archived: 'bg-slate-100 text-slate-800',
      out_of_stock: 'bg-red-100 text-red-800',
      discontinued: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusDot(status: string): string {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      draft: 'bg-gray-500',
      archived: 'bg-slate-500',
      out_of_stock: 'bg-red-500',
      discontinued: 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  getStockStatusColor(status: string): string {
    const colors: Record<string, string> = {
      in_stock: 'text-green-600',
      low_stock: 'text-orange-600',
      out_of_stock: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }

  getStockStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      in_stock: 'check-circle-fill',
      low_stock: 'exclamation-triangle-fill',
      out_of_stock: 'x-circle-fill'
    };
    return icons[status] || 'question-circle';
  }
}
