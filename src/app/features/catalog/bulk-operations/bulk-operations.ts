import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  hasOrders?: boolean;
}

interface EditableField {
  id: string;
  label: string;
  icon: string;
}

interface ExportField {
  id: string;
  label: string;
  selected: boolean;
}

interface OperationHistoryItem {
  id: string;
  type: 'edit' | 'import' | 'export' | 'copy' | 'delete';
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  affectedCount: number;
  duration?: number;
  canUndo: boolean;
}

@Component({
  selector: 'app-bulk-operations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Dropdown],
  templateUrl: './bulk-operations.html',
  styleUrl: './bulk-operations.scss'
})
export class BulkOperations {
  private router = inject(Router);

  // View State
  activeOperation = signal<'edit' | 'import' | 'export' | 'copy' | 'delete'>('edit');
  showHistory = signal(false);
  showSettings = signal(false);
  showProductSelector = signal(false);
  isProcessing = signal(false);

  // Selection
  selectedProducts = signal<Product[]>([
    {
      id: 'prod_001',
      name: 'Wireless Headphones Pro',
      sku: 'WH-PRO-001',
      category: 'Electronics',
      brand: 'Sony',
      price: 299.99,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      hasOrders: true
    },
    {
      id: 'prod_002',
      name: 'Mechanical Keyboard RGB',
      sku: 'KB-RGB-002',
      category: 'Electronics',
      brand: 'Keychron',
      price: 149.99,
      stock: 23,
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100&h=100&fit=crop',
      hasOrders: false
    },
    {
      id: 'prod_004',
      name: 'Running Shoes Pro',
      sku: 'RS-PRO-004',
      category: 'Sports',
      brand: 'Nike',
      price: 129.99,
      stock: 78,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
      hasOrders: true
    }
  ]);

  // Operations Configuration
  operations = signal([
    { id: 'edit' as const, label: 'Mass Edit', icon: 'pencil-square' },
    { id: 'import' as const, label: 'Import', icon: 'upload' },
    { id: 'export' as const, label: 'Export', icon: 'download' },
    { id: 'copy' as const, label: 'Duplicate', icon: 'copy' },
    { id: 'delete' as const, label: 'Delete', icon: 'trash3' }
  ]);

  // Edit Operation
  editableFields = signal<EditableField[]>([
    { id: 'status', label: 'Status', icon: 'check-circle' },
    { id: 'category', label: 'Category', icon: 'folder' },
    { id: 'price', label: 'Price', icon: 'currency-dollar' },
    { id: 'stock', label: 'Stock', icon: 'box-seam' },
    { id: 'tags', label: 'Tags', icon: 'tags' },
    { id: 'brand', label: 'Brand', icon: 'tag' },
    { id: 'weight', label: 'Weight', icon: 'weight' },
    { id: 'description', label: 'Description', icon: 'text-left' }
  ]);
  selectedFields = signal<string[]>(['status']);
  bulkValues = signal<any>({
    status: 'active',
    category: '',
    priceOperation: 'set',
    priceValue: null,
    stockOperation: 'set',
    stockValue: null,
    tags: [],
    tagOperation: 'add',
    brand: '',
    weight: null,
    weightUnit: 'kg',
    description: '',
    descriptionOperation: 'replace',
    findText: '',
    replaceText: ''
  });
  newTagInput = signal('');
  validationErrors = signal<{ id: string; product: string; message: string }[]>([]);

  // Import Operation
  uploadedFile = signal<File | null>(null);
  importMode = signal<'create' | 'update' | 'upsert' | 'replace'>('upsert');
  skipValidation = signal(false);
  importPreview = signal<any[]>([]);

  // Export Operation
  exportFormats = signal([
    { id: 'csv', label: 'CSV', icon: 'filetype-csv' },
    { id: 'excel', label: 'Excel', icon: 'filetype-xlsx' },
    { id: 'json', label: 'JSON', icon: 'filetype-json' },
    { id: 'xml', label: 'XML', icon: 'filetype-xml' }
  ]);
  selectedFormat = signal('csv');
  exportableFields = signal<ExportField[]>([
    { id: 'id', label: 'ID', selected: true },
    { id: 'name', label: 'Name', selected: true },
    { id: 'sku', label: 'SKU', selected: true },
    { id: 'description', label: 'Description', selected: true },
    { id: 'category', label: 'Category', selected: true },
    { id: 'brand', label: 'Brand', selected: true },
    { id: 'price', label: 'Price', selected: true },
    { id: 'comparePrice', label: 'Compare at Price', selected: false },
    { id: 'cost', label: 'Cost', selected: false },
    { id: 'stock', label: 'Stock', selected: true },
    { id: 'weight', label: 'Weight', selected: false },
    { id: 'status', label: 'Status', selected: true },
    { id: 'tags', label: 'Tags', selected: false },
    { id: 'createdAt', label: 'Created Date', selected: false },
    { id: 'updatedAt', label: 'Updated Date', selected: false }
  ]);
  exportOptions = signal({
    includeImages: false,
    includeVariants: false,
    includeMetadata: true,
    useHeaders: true
  });
  totalProductCount = signal(1247);

  // Copy Operation
  copyOptions = signal({
    namingPattern: 'suffix' as 'suffix' | 'prefix' | 'custom',
    customPattern: '{original} - Copy',
    skuPattern: 'suffix' as 'suffix' | 'timestamp' | 'random' | 'custom',
    customSkuPattern: 'SKU-{original}-COPY',
    copyImages: true,
    copyVariants: true,
    setAsDraft: true,
    resetInventory: false
  });

  // Delete Operation
  deleteOptions = signal({
    deleteImages: false,
    deleteVariants: true,
    archiveInstead: false
  });
  deleteConfirmation = signal('');

  // Settings
  settings = signal({
    autoSave: true,
    confirmBeforeExecute: true,
    emailNotifications: false,
    defaultPageSize: 25
  });

  // History
  operationHistory = signal<OperationHistoryItem[]>([
    {
      id: 'hist_001',
      type: 'edit',
      title: 'Mass Price Update',
      description: 'Increased prices by 10% for Electronics category',
      icon: 'pencil-square',
      status: 'completed',
      timestamp: new Date('2024-02-20T10:30:00'),
      affectedCount: 45,
      duration: 3.2,
      canUndo: true
    },
    {
      id: 'hist_002',
      type: 'import',
      title: 'Product Import',
      description: 'Imported 125 new products from CSV',
      icon: 'upload',
      status: 'completed',
      timestamp: new Date('2024-02-19T14:15:00'),
      affectedCount: 125,
      duration: 12.5,
      canUndo: false
    },
    {
      id: 'hist_003',
      type: 'export',
      title: 'Full Catalog Export',
      description: 'Exported all products to Excel format',
      icon: 'download',
      status: 'completed',
      timestamp: new Date('2024-02-18T09:00:00'),
      affectedCount: 1247,
      duration: 8.3,
      canUndo: false
    }
  ]);

  // Product Selector
  productSelectorQuery = signal('');
  productSelectorResults = signal<Product[]>([]);
  productSelectorSelected = signal<Product[]>([]);

  // Templates
  templateItems: DropdownItem[] = [
    { id: 'price_update', label: 'Price Update Template', icon: 'currency-dollar' },
    { id: 'stock_sync', label: 'Stock Sync Template', icon: 'box-seam' },
    { id: 'category_reassign', label: 'Category Reassign', icon: 'folder' },
    { id: 'seasonal_prep', label: 'Seasonal Preparation', icon: 'sun' }
  ];

  // Available Options
  availableCategories = signal([
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'sports', name: 'Sports' },
    { id: 'beauty', name: 'Beauty' }
  ]);

  availableBrands = signal(['Sony', 'Nike', 'Apple', 'Samsung', 'Keychron', 'Generic']);

  // Computed Values
  selectedCount = computed(() => this.selectedProducts().length);
  uniqueCategories = computed(() => new Set(this.selectedProducts().map(p => p.category)).size);
  uniqueBrands = computed(() => new Set(this.selectedProducts().map(p => p.brand)).size);
  totalValue = computed(() => this.selectedProducts().reduce((sum, p) => sum + (p.price * p.stock), 0));
  averagePrice = computed(() => this.selectedCount() > 0 ? this.totalValue() / this.selectedCount() : 0);
  
  pricePreview = computed(() => {
    const op = this.bulkValues().priceOperation;
    const val = this.bulkValues().priceValue;
    const avg = this.averagePrice();
    if (!val || val <= 0) return null;
    
    switch (op) {
      case 'set': return val;
      case 'increase_percent': return avg * (1 + val / 100);
      case 'decrease_percent': return avg * (1 - val / 100);
      case 'increase_fixed': return avg + val;
      case 'decrease_fixed': return avg - val;
      default: return null;
    }
  });

  hasOrders = computed(() => this.selectedProducts().some(p => p.hasOrders));
  productsWithOrders = computed(() => this.selectedProducts().filter(p => p.hasOrders).length);
  selectedExportFieldsCount = computed(() => this.exportableFields().filter(f => f.selected).length);
  estimatedFileSize = computed(() => {
    const fields = this.selectedExportFieldsCount();
    const products = this.selectedCount() || this.totalProductCount();
    const bytes = products * fields * 50; // Rough estimate
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  });

  constructor() {
    // Initialize product selector with all products
    this.productSelectorResults.set([
      {
        id: 'prod_001',
        name: 'Wireless Headphones Pro',
        sku: 'WH-PRO-001',
        category: 'Electronics',
        brand: 'Sony',
        price: 299.99,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'
      },
      {
        id: 'prod_002',
        name: 'Mechanical Keyboard RGB',
        sku: 'KB-RGB-002',
        category: 'Electronics',
        brand: 'Keychron',
        price: 149.99,
        stock: 23,
        image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100&h=100&fit=crop'
      },
      {
        id: 'prod_003',
        name: 'Smart Watch Series 5',
        sku: 'SW-S5-003',
        category: 'Electronics',
        brand: 'Apple',
        price: 399.99,
        stock: 0,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'
      },
      {
        id: 'prod_004',
        name: 'Running Shoes Pro',
        sku: 'RS-PRO-004',
        category: 'Sports',
        brand: 'Nike',
        price: 129.99,
        stock: 78,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop'
      },
      {
        id: 'prod_005',
        name: 'Leather Handbag',
        sku: 'BG-LTH-005',
        category: 'Clothing',
        brand: 'Coach',
        price: 249.99,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop'
      }
    ]);
  }

  // Operations
  setActiveOperation(op: 'edit' | 'import' | 'export' | 'copy' | 'delete') {
    this.activeOperation.set(op);
  }

  // Selection Management
  removeFromSelection(id: string) {
    this.selectedProducts.update(products => products.filter(p => p.id !== id));
  }

  clearSelection() {
    this.selectedProducts.set([]);
  }

  openProductSelector() {
    this.showProductSelector.set(true);
    this.productSelectorSelected.set([...this.selectedProducts()]);
  }

  closeProductSelector() {
    this.showProductSelector.set(false);
  }

  isProductSelected(id: string): boolean {
    return this.productSelectorSelected().some(p => p.id === id);
  }

  toggleProductSelection(product: Product) {
    this.productSelectorSelected.update(selected => {
      const exists = selected.some(p => p.id === product.id);
      if (exists) {
        return selected.filter(p => p.id !== product.id);
      }
      return [...selected, product];
    });
  }

  selectAllProducts() {
    this.productSelectorSelected.set([...this.productSelectorResults()]);
  }

  confirmProductSelection() {
    this.selectedProducts.set([...this.productSelectorSelected()]);
    this.closeProductSelector();
  }

  searchProducts() {
    const query = this.productSelectorQuery().toLowerCase();
    if (!query) {
      // Reset to all
      return;
    }
    this.productSelectorResults.update(products => 
      products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
    );
  }

  // Field Management
  toggleFieldSelection(fieldId: string) {
    this.selectedFields.update(fields => {
      if (fields.includes(fieldId)) {
        return fields.filter(f => f !== fieldId);
      }
      return [...fields, fieldId];
    });
  }

  // Tag Management
  addBulkTag() {
    const tag = this.newTagInput().trim();
    if (tag && !this.bulkValues().tags.includes(tag)) {
      this.bulkValues.update(v => ({ ...v, tags: [...v.tags, tag] }));
      this.newTagInput.set('');
    }
  }

  removeBulkTag(tag: string) {
    this.bulkValues.update(v => ({ ...v, tags: v.tags.filter((t: string) => t !== tag) }));
  }

  // Validation
  validateBulkEdit() {
    const errors: { id: string; product: string; message: string }[] = [];
    
    if (this.bulkValues().priceValue !== null && this.bulkValues().priceValue < 0) {
      this.selectedProducts().forEach(p => {
        errors.push({
          id: p.id,
          product: p.name,
          message: 'Price cannot be negative'
        });
      });
    }
    
    this.validationErrors.set(errors);
  }

  previewChanges() {
    console.log('Previewing changes:', this.bulkValues());
    alert('Preview would show a comparison table here');
  }

  executeBulkEdit() {
    this.isProcessing.set(true);
    
    setTimeout(() => {
      this.isProcessing.set(false);
      this.addToHistory({
        id: 'hist_' + Date.now(),
        type: 'edit',
        title: 'Mass Edit - ' + this.selectedFields().join(', '),
        description: `Updated ${this.selectedFields().length} fields on ${this.selectedCount()} products`,
        icon: 'pencil-square',
        status: 'completed',
        timestamp: new Date(),
        affectedCount: this.selectedCount(),
        duration: 2.5,
        canUndo: true
      });
      alert('Bulk edit completed successfully!');
    }, 2000);
  }

  // Import Operations
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadedFile.set(file);
      this.generateImportPreview();
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.uploadedFile.set(file);
      this.generateImportPreview();
    }
  }

  removeUploadedFile() {
    this.uploadedFile.set(null);
    this.importPreview.set([]);
  }

  generateImportPreview() {
    // Mock preview data
    this.importPreview.set([
      { name: 'New Product 1', sku: 'NEW-001', status: 'valid' },
      { name: 'New Product 2', sku: 'NEW-002', status: 'valid' },
      { name: 'Existing Product', sku: 'WH-PRO-001', status: 'error' },
      { name: 'New Product 3', sku: 'NEW-003', status: 'valid' },
      { name: 'Invalid Data', sku: '', status: 'error' }
    ]);
  }

  downloadTemplate(format: 'csv' | 'excel') {
    console.log('Downloading', format, 'template');
    alert(`Template download started for ${format.toUpperCase()}`);
  }

  validateImport() {
    console.log('Validating import...');
    alert('Validation complete! 3 valid rows, 2 errors found.');
  }

  executeImport() {
    this.isProcessing.set(true);
    
    setTimeout(() => {
      this.isProcessing.set(false);
      this.uploadedFile.set(null);
      this.addToHistory({
        id: 'hist_' + Date.now(),
        type: 'import',
        title: 'Product Import',
        description: `Imported products via ${this.importMode()} mode`,
        icon: 'upload',
        status: 'completed',
        timestamp: new Date(),
        affectedCount: 125,
        duration: 15.3,
        canUndo: false
      });
      alert('Import completed successfully!');
    }, 3000);
  }

  // Export Operations
  selectAllExportFields() {
    this.exportableFields.update(fields => fields.map(f => ({ ...f, selected: true })));
  }

  deselectAllExportFields() {
    this.exportableFields.update(fields => fields.map(f => ({ ...f, selected: false })));
  }

  previewExport() {
    console.log('Previewing export...');
    alert('Export preview would show sample data here');
  }

  executeExport() {
    this.isProcessing.set(true);
    
    setTimeout(() => {
      this.isProcessing.set(false);
      this.addToHistory({
        id: 'hist_' + Date.now(),
        type: 'export',
        title: 'Product Export',
        description: `Exported ${this.selectedExportFieldsCount()} fields to ${this.selectedFormat().toUpperCase()}`,
        icon: 'download',
        status: 'completed',
        timestamp: new Date(),
        affectedCount: this.selectedCount() || this.totalProductCount(),
        duration: 5.2,
        canUndo: false
      });
      alert('Export downloaded!');
    }, 2000);
  }

  // Copy Operations
  generateCopyNamePreview(): string {
    const original = this.selectedProducts()[0]?.name || 'Product Name';
    const pattern = this.copyOptions().namingPattern;
    const custom = this.copyOptions().customPattern;
    
    switch (pattern) {
      case 'suffix': return `${original} (Copy)`;
      case 'prefix': return `Copy - ${original}`;
      case 'custom': return custom.replace('{original}', original).replace('{date}', new Date().toISOString().split('T')[0]).replace('{index}', '1');
      default: return original;
    }
  }

  executeCopy() {
    this.isProcessing.set(true);
    
    setTimeout(() => {
      this.isProcessing.set(false);
      this.addToHistory({
        id: 'hist_' + Date.now(),
        type: 'copy',
        title: 'Duplicate Products',
        description: `Created ${this.selectedCount()} product copies`,
        icon: 'copy',
        status: 'completed',
        timestamp: new Date(),
        affectedCount: this.selectedCount(),
        duration: 4.1,
        canUndo: true
      });
      alert('Products duplicated successfully!');
    }, 2500);
  }

  // Delete Operations
  executeDelete() {
    if (this.deleteOptions().archiveInstead) {
      this.isProcessing.set(true);
      setTimeout(() => {
        this.isProcessing.set(false);
        this.selectedProducts.set([]);
        this.addToHistory({
          id: 'hist_' + Date.now(),
          type: 'delete',
          title: 'Archive Products',
          description: `Archived ${this.selectedCount()} products`,
          icon: 'archive',
          status: 'completed',
          timestamp: new Date(),
          affectedCount: this.selectedCount(),
          duration: 1.5,
          canUndo: true
        });
        alert('Products archived successfully!');
      }, 1500);
    } else {
      this.isProcessing.set(true);
      setTimeout(() => {
        this.isProcessing.set(false);
        this.selectedProducts.set([]);
        this.addToHistory({
          id: 'hist_' + Date.now(),
          type: 'delete',
          title: 'Delete Products',
          description: `Permanently deleted ${this.selectedCount()} products`,
          icon: 'trash3',
          status: 'completed',
          timestamp: new Date(),
          affectedCount: this.selectedCount(),
          duration: 2.0,
          canUndo: false
        });
        alert('Products deleted permanently!');
        this.router.navigate(['/products']);
      }, 2000);
    }
  }

  // History Management
  addToHistory(item: OperationHistoryItem) {
    this.operationHistory.update(history => [item, ...history]);
  }

  undoOperation(id: string) {
    console.log('Undoing operation:', id);
    alert('Undo operation initiated');
  }

  // Settings
  saveSettings() {
    this.showSettings.set(false);
    alert('Settings saved!');
  }

  // Templates
  onTemplateSelect(item: DropdownItem) {
    console.log('Selected template:', item.id);
    alert(`Template "${item.label}" loaded!`);
  }
}
