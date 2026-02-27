// product-list.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  status: 'active' | 'draft' | 'archived' | 'out_of_stock' | 'discontinued';
  image: string;
  gallery: string[];
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit {
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

  // Products Data
  products = signal<Product[]>([]);

  exportItems: DropdownItem[] = [
    { id: 'csv', label: 'Export as CSV', icon: 'filetype-csv' },
    { id: 'excel', label: 'Export as Excel', icon: 'filetype-xlsx' },
    { id: 'pdf', label: 'Export as PDF', icon: 'filetype-pdf' }
  ];
  
  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.products.set([
      {
        id: 'prod_001',
        name: 'Wireless Headphones Pro',
        sku: 'WH-PRO-001',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
        category: 'electronics',
        brand: 'Sony',
        price: 299.99,
        compareAtPrice: 349.99,
        cost: 180.00,
        stock: 45,
        lowStockThreshold: 10,
        stockStatus: 'in_stock',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        gallery: [],
        weight: 0.25,
        dimensions: { length: 20, width: 18, height: 8 },
        tags: ['wireless', 'audio', 'premium'],
        featured: true,
        rating: 4.8,
        reviewCount: 128,
        salesCount: 342,
        createdAt: new Date('2024-01-10T09:00:00'),
        updatedAt: new Date('2024-01-15T14:30:00')
      },
      {
        id: 'prod_002',
        name: 'Mechanical Keyboard RGB',
        sku: 'KB-RGB-002',
        description: 'Full-size mechanical keyboard with customizable RGB lighting',
        category: 'electronics',
        brand: 'Keychron',
        price: 149.99,
        cost: 85.00,
        stock: 23,
        lowStockThreshold: 15,
        stockStatus: 'low_stock',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop',
        gallery: [],
        weight: 1.2,
        dimensions: { length: 44, width: 14, height: 4 },
        tags: ['gaming', 'office', 'mechanical'],
        featured: false,
        rating: 4.6,
        reviewCount: 89,
        salesCount: 256,
        createdAt: new Date('2024-01-08T11:20:00'),
        updatedAt: new Date('2024-01-14T10:15:00')
      },
      {
        id: 'prod_003',
        name: 'Smart Watch Series 5',
        sku: 'SW-S5-003',
        description: 'Advanced fitness tracking and health monitoring smartwatch',
        category: 'electronics',
        brand: 'Apple',
        price: 399.99,
        compareAtPrice: 429.99,
        cost: 250.00,
        stock: 0,
        lowStockThreshold: 5,
        stockStatus: 'out_of_stock',
        status: 'out_of_stock',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        gallery: [],
        weight: 0.05,
        dimensions: { length: 4, width: 3.5, height: 1 },
        tags: ['wearable', 'fitness', 'smart'],
        featured: true,
        rating: 4.9,
        reviewCount: 342,
        salesCount: 891,
        createdAt: new Date('2024-01-05T08:00:00'),
        updatedAt: new Date('2024-01-12T16:45:00')
      },
      {
        id: 'prod_004',
        name: 'Running Shoes Pro',
        sku: 'RS-PRO-004',
        description: 'Professional running shoes with advanced cushioning technology',
        category: 'sports',
        brand: 'Nike',
        price: 129.99,
        cost: 65.00,
        stock: 78,
        lowStockThreshold: 20,
        stockStatus: 'in_stock',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        gallery: [],
        weight: 0.8,
        dimensions: { length: 30, width: 12, height: 11 },
        tags: ['running', 'sports', 'footwear'],
        featured: false,
        rating: 4.5,
        reviewCount: 67,
        salesCount: 189,
        createdAt: new Date('2024-01-12T13:30:00'),
        updatedAt: new Date('2024-01-16T09:20:00')
      },
      {
        id: 'prod_005',
        name: 'Leather Handbag',
        sku: 'BG-LTH-005',
        description: 'Genuine leather handbag with multiple compartments',
        category: 'clothing',
        brand: 'Coach',
        price: 249.99,
        compareAtPrice: 299.99,
        cost: 120.00,
        stock: 12,
        lowStockThreshold: 10,
        stockStatus: 'low_stock',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
        gallery: [],
        weight: 0.6,
        dimensions: { length: 35, width: 12, height: 25 },
        tags: ['fashion', 'accessories', 'leather'],
        featured: true,
        rating: 4.7,
        reviewCount: 45,
        salesCount: 98,
        createdAt: new Date('2024-01-09T10:00:00'),
        updatedAt: new Date('2024-01-15T11:00:00')
      },
      {
        id: 'prod_006',
        name: 'Coffee Maker Deluxe',
        sku: 'CM-DLX-006',
        description: 'Programmable coffee maker with thermal carafe',
        category: 'home',
        brand: 'Breville',
        price: 199.99,
        cost: 110.00,
        stock: 34,
        lowStockThreshold: 8,
        stockStatus: 'in_stock',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop',
        gallery: [],
        weight: 3.5,
        dimensions: { length: 25, width: 18, height: 35 },
        tags: ['kitchen', 'appliances', 'coffee'],
        featured: false,
        rating: 4.4,
        reviewCount: 112,
        salesCount: 234,
        createdAt: new Date('2024-01-07T14:00:00'),
        updatedAt: new Date('2024-01-14T08:30:00')
      },
      {
        id: 'prod_007',
        name: 'Yoga Mat Premium',
        sku: 'YM-PRM-007',
        description: 'Extra thick non-slip yoga mat with carrying strap',
        category: 'sports',
        brand: 'Lululemon',
        price: 79.99,
        cost: 35.00,
        stock: 56,
        lowStockThreshold: 15,
        stockStatus: 'in_stock',
        status: 'draft',
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
        gallery: [],
        weight: 1.0,
        dimensions: { length: 183, width: 61, height: 0.6 },
        tags: ['yoga', 'fitness', 'wellness'],
        featured: false,
        rating: 4.6,
        reviewCount: 78,
        salesCount: 145,
        createdAt: new Date('2024-01-11T09:30:00'),
        updatedAt: new Date('2024-01-13T15:00:00')
      },
      {
        id: 'prod_008',
        name: 'Gaming Laptop Pro',
        sku: 'LP-GAM-008',
        description: 'High-performance gaming laptop with RTX 4070',
        category: 'electronics',
        brand: 'Asus',
        price: 1499.99,
        compareAtPrice: 1699.99,
        cost: 1100.00,
        stock: 8,
        lowStockThreshold: 5,
        stockStatus: 'low_stock',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
        gallery: [],
        weight: 2.3,
        dimensions: { length: 35, width: 25, height: 2.5 },
        tags: ['gaming', 'laptop', 'high-performance'],
        featured: true,
        rating: 4.8,
        reviewCount: 56,
        salesCount: 89,
        createdAt: new Date('2024-01-06T11:00:00'),
        updatedAt: new Date('2024-01-16T10:00:00')
      },
      {
        id: 'prod_009',
        name: 'Skincare Set Premium',
        sku: 'SK-SET-009',
        description: 'Complete skincare routine with natural ingredients',
        category: 'beauty',
        brand: 'Kiehl\'s',
        price: 189.99,
        cost: 95.00,
        stock: 0,
        lowStockThreshold: 10,
        stockStatus: 'out_of_stock',
        status: 'discontinued',
        image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400&h=400&fit=crop',
        gallery: [],
        weight: 0.8,
        dimensions: { length: 20, width: 15, height: 12 },
        tags: ['skincare', 'beauty', 'natural'],
        featured: false,
        rating: 4.3,
        reviewCount: 34,
        salesCount: 67,
        createdAt: new Date('2024-01-04T08:00:00'),
        updatedAt: new Date('2024-01-10T12:00:00')
      },
      {
        id: 'prod_010',
        name: 'Bluetooth Speaker',
        sku: 'SP-BT-010',
        description: 'Portable waterproof bluetooth speaker with 360 sound',
        category: 'electronics',
        brand: 'JBL',
        price: 89.99,
        compareAtPrice: 119.99,
        cost: 45.00,
        stock: 92,
        lowStockThreshold: 25,
        stockStatus: 'in_stock',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
        gallery: [],
        weight: 0.5,
        dimensions: { length: 18, width: 7, height: 7 },
        tags: ['audio', 'portable', 'waterproof'],
        featured: false,
        rating: 4.5,
        reviewCount: 201,
        salesCount: 567,
        createdAt: new Date('2024-01-03T10:00:00'),
        updatedAt: new Date('2024-01-15T14:00:00')
      },
      {
        id: 'prod_011',
        name: 'Designer Sunglasses',
        sku: 'SG-DSG-011',
        description: 'UV protection polarized sunglasses with titanium frame',
        category: 'clothing',
        brand: 'Ray-Ban',
        price: 159.99,
        cost: 80.00,
        stock: 28,
        lowStockThreshold: 10,
        stockStatus: 'in_stock',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
        gallery: [],
        weight: 0.03,
        dimensions: { length: 15, width: 5, height: 4 },
        tags: ['fashion', 'accessories', 'summer'],
        featured: false,
        rating: 4.7,
        reviewCount: 89,
        salesCount: 234,
        createdAt: new Date('2024-01-13T09:00:00'),
        updatedAt: new Date('2024-01-16T08:00:00')
      },
      {
        id: 'prod_012',
        name: 'Wireless Mouse Ergonomic',
        sku: 'MS-ERG-012',
        description: 'Ergonomic wireless mouse with customizable buttons',
        category: 'electronics',
        brand: 'Logitech',
        price: 59.99,
        cost: 30.00,
        stock: 0,
        lowStockThreshold: 20,
        stockStatus: 'out_of_stock',
        status: 'archived',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
        gallery: [],
        weight: 0.1,
        dimensions: { length: 12, width: 8, height: 4 },
        tags: ['office', 'ergonomic', 'wireless'],
        featured: false,
        rating: 4.4,
        reviewCount: 156,
        salesCount: 445,
        createdAt: new Date('2023-12-20T10:00:00'),
        updatedAt: new Date('2024-01-08T16:00:00')
      }
    ]);
  }

  filteredProducts = computed(() => {
    let result = this.products();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
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

  productStats = computed(() => [
    { 
      label: 'Total Products', 
      value: this.products().length.toString(), 
      trend: 8.2, 
      icon: 'box-seam', 
      bgColor: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      filter: 'all'
    },
    { 
      label: 'Active', 
      value: this.products().filter(p => p.status === 'active').length.toString(), 
      trend: 12.5, 
      icon: 'check-circle', 
      bgColor: 'bg-green-100', 
      iconColor: 'text-green-600',
      filter: 'active'
    },
    { 
      label: 'Low Stock', 
      value: this.products().filter(p => p.stockStatus === 'low_stock').length.toString(), 
      trend: -3.1, 
      icon: 'exclamation-triangle', 
      bgColor: 'bg-orange-100', 
      iconColor: 'text-orange-600',
      filter: 'low_stock'
    },
    { 
      label: 'Out of Stock', 
      value: this.products().filter(p => p.stockStatus === 'out_of_stock').length.toString(), 
      trend: -15.3, 
      icon: 'x-circle', 
      bgColor: 'bg-red-100', 
      iconColor: 'text-red-600',
      filter: 'out_of_stock'
    },
    { 
      label: 'Drafts', 
      value: this.products().filter(p => p.status === 'draft').length.toString(), 
      trend: 5.7, 
      icon: 'file-earmark', 
      bgColor: 'bg-gray-100', 
      iconColor: 'text-gray-600',
      filter: 'draft'
    },
    { 
      label: 'Revenue', 
      value: '$' + this.products().filter(p => p.status === 'active').reduce((sum, p) => sum + (p.price * p.salesCount), 0).toFixed(0), 
      trend: 22.4, 
      icon: 'cash-stack', 
      bgColor: 'bg-emerald-100', 
      iconColor: 'text-emerald-600',
      filter: 'revenue'
    }
  ]);

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
        // Move to draft
        break;
      case 'activate':
        // Activate product
        break;
      case 'delete':
        // Delete product
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
  }

  exportProducts(format: 'csv' | 'excel' | 'pdf') {
    console.log('Exporting as', format);
  }

  bulkUpdateStatus(status: string) {
    console.log('Bulk update status to', status);
  }

  bulkUpdateStock() {
    console.log('Bulk update stock');
  }

  bulkDelete() {
    console.log('Bulk delete');
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