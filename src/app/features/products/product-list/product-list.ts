// src/app/features/products/components/product-list/product-list.component.ts
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OutsideClickDirective } from '../../../shared/directives/outside-click.directive';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  comparePrice?: number;
  cost: number;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  visibility: 'visible' | 'hidden';
  image: string;
  variants: number;
  sales: number;
  revenue: number;
  rating: number;
  reviews: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  description?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OutsideClickDirective],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList {
  // View state
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  showExportMenu = signal(false);
  openMenuId = signal<string | null>(null);
  
  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(25);
  
  // Sorting
  sortField = signal<string>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // Selection
  selectedProducts = signal<string[]>([]);
  
  // Filters
  searchQuery = signal('');
  filterCategory = signal('');
  filterBrand = signal('');
  filterStatus = signal('');
  filterStock = signal('');
  filterMinPrice = signal<number | null>(null);
  filterMaxPrice = signal<number | null>(null);
  filterTags = signal('');
  filterDateFrom = signal('');
  selectedQuickFilter = signal<string | null>(null);
  
  // Saved presets
  savedPresets = signal<Array<{name: string, filters: any}>>([]);
  
  // Sample data
  products = signal<Product[]>([
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones Pro Max with Noise Cancellation',
      sku: 'WBH-PM-001',
      category: 'Electronics',
      brand: 'TechBrand',
      price: 299.99,
      comparePrice: 399.99,
      cost: 150.00,
      stock: 45,
      status: 'active',
      visibility: 'visible',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      variants: 3,
      sales: 1234,
      revenue: 369876,
      rating: 4.8,
      reviews: 324,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-20'),
      tags: ['featured', 'bestseller', 'wireless'],
      description: 'Premium wireless headphones with active noise cancellation'
    },
    {
      id: '2',
      name: 'Smart Watch Series 5 - Fitness Tracker',
      sku: 'SW-S5-002',
      category: 'Electronics',
      brand: 'WatchCo',
      price: 399.00,
      cost: 200.00,
      stock: 8,
      status: 'active',
      visibility: 'visible',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      variants: 5,
      sales: 892,
      revenue: 355908,
      rating: 4.6,
      reviews: 198,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-18'),
      tags: ['fitness', 'smart-device'],
      description: 'Advanced fitness tracking smartwatch'
    },
    {
      id: '3',
      name: 'Organic Cotton T-Shirt - Premium Quality',
      sku: 'OCT-001-BLK',
      category: 'Clothing',
      brand: 'EcoWear',
      price: 49.99,
      comparePrice: 69.99,
      cost: 20.00,
      stock: 0,
      status: 'active',
      visibility: 'hidden',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      variants: 4,
      sales: 567,
      revenue: 28344,
      rating: 4.9,
      reviews: 89,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-15'),
      tags: ['eco-friendly', 'organic'],
      description: '100% organic cotton comfortable t-shirt'
    },
    {
      id: '4',
      name: 'Running Shoes - Professional Athletic',
      sku: 'RS-PRO-001',
      category: 'Footwear',
      brand: 'RunFast',
      price: 159.99,
      cost: 80.00,
      stock: 23,
      status: 'draft',
      visibility: 'visible',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      variants: 8,
      sales: 0,
      revenue: 0,
      rating: 0,
      reviews: 0,
      createdAt: new Date('2024-02-25'),
      updatedAt: new Date('2024-02-25'),
      tags: ['new-arrival', 'sports'],
      description: 'Professional running shoes for athletes'
    },
    {
      id: '5',
      name: 'Leather Laptop Bag - Executive Series',
      sku: 'LLB-ES-001',
      category: 'Accessories',
      brand: 'LuxLeather',
      price: 189.99,
      cost: 95.00,
      stock: 12,
      status: 'active',
      visibility: 'visible',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      variants: 2,
      sales: 445,
      revenue: 84545,
      rating: 4.7,
      reviews: 156,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-02-22'),
      tags: ['leather', 'business'],
      description: 'Premium leather laptop bag for professionals'
    },
    {
      id: '6',
      name: 'Wireless Mouse - Ergonomic Design',
      sku: 'WM-ED-001',
      category: 'Electronics',
      brand: 'TechBrand',
      price: 79.99,
      comparePrice: 99.99,
      cost: 35.00,
      stock: 156,
      status: 'active',
      visibility: 'visible',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      variants: 1,
      sales: 2341,
      revenue: 187279,
      rating: 4.5,
      reviews: 567,
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-02-20'),
      tags: ['bestseller', 'office'],
      description: 'Ergonomic wireless mouse for productivity'
    },
    {
      id: '7',
      name: 'Yoga Mat - Extra Thick Non-Slip',
      sku: 'YM-ET-001',
      category: 'Sports',
      brand: 'FitLife',
      price: 39.99,
      cost: 15.00,
      stock: 89,
      status: 'archived',
      visibility: 'hidden',
      image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
      variants: 3,
      sales: 1234,
      revenue: 49328,
      rating: 4.8,
      reviews: 234,
      createdAt: new Date('2023-10-15'),
      updatedAt: new Date('2024-01-15'),
      tags: ['fitness', 'yoga'],
      description: 'Extra thick non-slip yoga mat'
    },
    {
      id: '8',
      name: 'Coffee Maker - Automatic Espresso',
      sku: 'CM-AE-001',
      category: 'Home',
      brand: 'BrewMaster',
      price: 599.99,
      comparePrice: 799.99,
      cost: 300.00,
      stock: 5,
      status: 'active',
      visibility: 'visible',
      image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
      variants: 1,
      sales: 234,
      revenue: 140398,
      rating: 4.9,
      reviews: 89,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-02-23'),
      tags: ['premium', 'kitchen'],
      description: 'Automatic espresso coffee maker'
    }
  ]);

  // Computed values
  categories = computed(() => [...new Set(this.products().map(p => p.category))]);
  brands = computed(() => [...new Set(this.products().map(p => p.brand))]);
  
  filteredProducts = computed(() => {
    let result = this.products();
    
    // Search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    
    // Category filter
    if (this.filterCategory()) {
      result = result.filter(p => p.category === this.filterCategory());
    }
    
    // Brand filter
    if (this.filterBrand()) {
      result = result.filter(p => p.brand === this.filterBrand());
    }
    
    // Status filter
    if (this.filterStatus()) {
      result = result.filter(p => p.status === this.filterStatus());
    }
    
    // Stock filter
    if (this.filterStock()) {
      switch (this.filterStock()) {
        case 'in': result = result.filter(p => p.stock > 10); break;
        case 'low': result = result.filter(p => p.stock > 0 && p.stock <= 10); break;
        case 'out': result = result.filter(p => p.stock === 0); break;
      }
    }
    
    // Price range
    if (this.filterMinPrice()) {
      result = result.filter(p => p.price >= this.filterMinPrice()!);
    }
    if (this.filterMaxPrice()) {
      result = result.filter(p => p.price <= this.filterMaxPrice()!);
    }
    
    // Tags
    if (this.filterTags()) {
      const tagQuery = this.filterTags().toLowerCase();
      result = result.filter(p => p.tags.some(t => t.toLowerCase().includes(tagQuery)));
    }
    
    // Sorting
    result = [...result].sort((a, b) => {
      const field = this.sortField();
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      const aVal = a[field as keyof Product];
      const bVal = b[field as keyof Product];
      if (aVal == null || bVal == null) return 0;
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
    
    return result;
  });
  
  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredProducts().slice(start, start + this.itemsPerPage());
  });
  
  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.itemsPerPage()));
  
  visiblePages = computed(() => {
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
  });
  
  productStats = computed(() => [
    { label: 'Total Products', value: this.products().length, icon: 'boxes', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', trend: 12, filter: 'all' },
    { label: 'Active', value: this.products().filter(p => p.status === 'active').length, icon: 'check-circle', bgColor: 'bg-green-100', iconColor: 'text-green-600', trend: 8, filter: 'active' },
    { label: 'Low Stock', value: this.products().filter(p => p.stock > 0 && p.stock <= 10).length, icon: 'exclamation-triangle', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600', trend: -5, filter: 'low-stock' },
    { label: 'Out of Stock', value: this.products().filter(p => p.stock === 0).length, icon: 'bag-x', bgColor: 'bg-red-100', iconColor: 'text-red-600', trend: 2, filter: 'out-of-stock' },
    { label: 'Draft', value: this.products().filter(p => p.status === 'draft').length, icon: 'pencil-square', bgColor: 'bg-orange-100', iconColor: 'text-orange-600', trend: 15, filter: 'draft' },
    { label: 'Archived', value: this.products().filter(p => p.status === 'archived').length, icon: 'file-zip', bgColor: 'bg-gray-100', iconColor: 'text-gray-600', trend: -3, filter: 'archived' }
  ]);
  
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchQuery()) count++;
    if (this.filterCategory()) count++;
    if (this.filterBrand()) count++;
    if (this.filterStatus()) count++;
    if (this.filterStock()) count++;
    if (this.filterMinPrice() || this.filterMaxPrice()) count++;
    if (this.filterTags()) count++;
    return count;
  });
  
  isAllSelected = computed(() => {
    const visible = this.paginatedProducts();
    return visible.length > 0 && visible.every(p => this.selectedProducts().includes(p.id));
  });

  // Methods
  toggleFilters() {
    this.showFilters.update(v => !v);
  }
  
  toggleViewMode() {
    this.viewMode.update(v => v === 'table' ? 'grid' : 'table');
  }
  
  applyFilters() {
    this.currentPage.set(1);
    this.selectedProducts.set([]);
  }
  
  clearAllFilters() {
    this.searchQuery.set('');
    this.filterCategory.set('');
    this.filterBrand.set('');
    this.filterStatus.set('');
    this.filterStock.set('');
    this.filterMinPrice.set(null);
    this.filterMaxPrice.set(null);
    this.filterTags.set('');
    this.filterDateFrom.set('');
    this.selectedQuickFilter.set(null);
    this.applyFilters();
  }
  
  applyQuickFilter(filter: string) {
    this.clearAllFilters();
    this.selectedQuickFilter.set(filter);
    
    switch (filter) {
      case 'active': this.filterStatus.set('active'); break;
      case 'low-stock': this.filterStock.set('low'); break;
      case 'out-of-stock': this.filterStock.set('out'); break;
      case 'draft': this.filterStatus.set('draft'); break;
      case 'archived': this.filterStatus.set('archived'); break;
    }
    this.applyFilters();
  }
  
  sort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }
  
  toggleSelection(id: string) {
    this.selectedProducts.update(selected => {
      if (selected.includes(id)) {
        return selected.filter(s => s !== id);
      }
      return [...selected, id];
    });
  }
  
  toggleSelectAll() {
    const visible = this.paginatedProducts().map(p => p.id);
    if (this.isAllSelected()) {
      this.selectedProducts.update(selected => selected.filter(id => !visible.includes(id)));
    } else {
      this.selectedProducts.update(selected => [...new Set([...selected, ...visible])]);
    }
  }
  
  isSelected(id: string) {
    return this.selectedProducts().includes(id);
  }
  
  toggleProductMenu(id: string) {
    this.openMenuId.update(current => current === id ? null : id);
  }
  
  // Pagination
  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
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
  
  // Actions
  bulkUpdateStatus(status: string) {
    console.log('Bulk update status:', status, this.selectedProducts());
    // Implement API call
    this.selectedProducts.set([]);
  }
  
  bulkUpdateVisibility(visibility: string) {
    console.log('Bulk update visibility:', visibility, this.selectedProducts());
    this.selectedProducts.set([]);
  }
  
  bulkDelete() {
    if (confirm(`Delete ${this.selectedProducts().length} products?`)) {
      console.log('Bulk delete:', this.selectedProducts());
      this.selectedProducts.set([]);
    }
  }
  
  quickEdit(product: Product) {
    console.log('Quick edit:', product);
  }
  
  duplicateProduct(product: Product) {
    console.log('Duplicate:', product);
  }
  
  toggleProductVisibility(product: Product) {
    console.log('Toggle visibility:', product);
  }
  
  viewProductAnalytics(product: Product) {
    console.log('View analytics:', product);
  }
  
  deleteProduct(product: Product) {
    if (confirm(`Delete "${product.name}"?`)) {
      console.log('Delete:', product);
    }
  }
  
  exportProducts(format: string) {
    console.log('Export as:', format);
    this.showExportMenu.set(false);
  }
  
  saveFilterPreset() {
    const name = prompt('Enter preset name:');
    if (name) {
      this.savedPresets.update(presets => [...presets, {
        name,
        filters: {
          category: this.filterCategory(),
          brand: this.filterBrand(),
          status: this.filterStatus(),
          stock: this.filterStock()
        }
      }]);
    }
  }
  
  loadPreset(preset: any) {
    this.filterCategory.set(preset.filters.category);
    this.filterBrand.set(preset.filters.brand);
    this.filterStatus.set(preset.filters.status);
    this.filterStock.set(preset.filters.stock);
    this.applyFilters();
  }
  
  deletePreset(name: string) {
    this.savedPresets.update(presets => presets.filter(p => p.name !== name));
  }
  
  getStatusDot(status: string) {
    const dots: Record<string, string> = {
      active: 'bg-green-500',
      draft: 'bg-yellow-500',
      archived: 'bg-gray-500'
    };
    return dots[status] || 'bg-gray-500';
  }
  
  protected readonly Math = Math;
}