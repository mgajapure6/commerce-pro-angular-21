
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Dropdown, DropdownItem } from '../../../shared/components/dropdown/dropdown';

interface AttributeOption {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
}

interface Attribute {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: 'select' | 'multiselect' | 'text' | 'textarea' | 'color' | 'image' | 'boolean' | 'number' | 'date';
  options: AttributeOption[];
  isFilterable: boolean;
  isRequired: boolean;
  isVariant: boolean;
  isVisible: boolean;
  isComparable: boolean;
  isActive: boolean;
  color?: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-attributes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, Dropdown],
  templateUrl: './attributes.html',
  styleUrl: './attributes.scss'
})
export class Attributes {
  private fb = inject(FormBuilder);

  // expose global Math for template
  readonly Math: typeof Math = Math;

  // View State
  viewMode = signal<'table' | 'grid'>('table');
  showFilters = signal(false);
  showModal = signal(false);
  isSaving = signal(false);
  selectedAttributes = signal<string[]>([]);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // Filters
  searchQuery = signal('');
  filterType = signal<string>('');
  filterStatus = signal<string>('');
  filterFilterable = signal<string>('');
  filterRequired = signal<string>('');
  filterVariant = signal<string>('');
  sortBy = signal('name');

  // Sorting
  sortField = signal<string>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Data
  attributes = signal<Attribute[]>([
    {
      id: 'attr_001',
      name: 'Color',
      code: 'color',
      description: 'Product color options',
      type: 'color',
      options: [
        { id: 'opt_001', label: 'Red', value: '#ef4444', sortOrder: 0 },
        { id: 'opt_002', label: 'Blue', value: '#3b82f6', sortOrder: 1 },
        { id: 'opt_003', label: 'Green', value: '#10b981', sortOrder: 2 },
        { id: 'opt_004', label: 'Black', value: '#1f2937', sortOrder: 3 },
        { id: 'opt_005', label: 'White', value: '#f9fafb', sortOrder: 4 }
      ],
      isFilterable: true,
      isRequired: false,
      isVariant: true,
      isVisible: true,
      isComparable: true,
      isActive: true,
      color: '#ef4444',
      productCount: 456,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: 'attr_002',
      name: 'Size',
      code: 'size',
      description: 'Product size options',
      type: 'select',
      options: [
        { id: 'opt_006', label: 'XS', value: 'xs', sortOrder: 0 },
        { id: 'opt_007', label: 'S', value: 's', sortOrder: 1 },
        { id: 'opt_008', label: 'M', value: 'm', sortOrder: 2 },
        { id: 'opt_009', label: 'L', value: 'l', sortOrder: 3 },
        { id: 'opt_010', label: 'XL', value: 'xl', sortOrder: 4 },
        { id: 'opt_011', label: 'XXL', value: 'xxl', sortOrder: 5 }
      ],
      isFilterable: true,
      isRequired: true,
      isVariant: true,
      isVisible: true,
      isComparable: true,
      isActive: true,
      color: '#8b5cf6',
      productCount: 892,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-02-18')
    },
    {
      id: 'attr_003',
      name: 'Material',
      code: 'material',
      description: 'Product material composition',
      type: 'multiselect',
      options: [
        { id: 'opt_012', label: 'Cotton', value: 'cotton', sortOrder: 0 },
        { id: 'opt_013', label: 'Polyester', value: 'polyester', sortOrder: 1 },
        { id: 'opt_014', label: 'Wool', value: 'wool', sortOrder: 2 },
        { id: 'opt_015', label: 'Silk', value: 'silk', sortOrder: 3 },
        { id: 'opt_016', label: 'Leather', value: 'leather', sortOrder: 4 }
      ],
      isFilterable: true,
      isRequired: false,
      isVariant: false,
      isVisible: true,
      isComparable: true,
      isActive: true,
      color: '#f59e0b',
      productCount: 234,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-02-10')
    },
    {
      id: 'attr_004',
      name: 'Brand',
      code: 'brand',
      description: 'Product manufacturer brand',
      type: 'select',
      options: [
        { id: 'opt_017', label: 'Nike', value: 'nike', sortOrder: 0 },
        { id: 'opt_018', label: 'Adidas', value: 'adidas', sortOrder: 1 },
        { id: 'opt_019', label: 'Apple', value: 'apple', sortOrder: 2 },
        { id: 'opt_020', label: 'Samsung', value: 'samsung', sortOrder: 3 },
        { id: 'opt_021', label: 'Sony', value: 'sony', sortOrder: 4 }
      ],
      isFilterable: true,
      isRequired: false,
      isVariant: false,
      isVisible: true,
      isComparable: true,
      isActive: true,
      color: '#06b6d4',
      productCount: 1234,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-02-20')
    },
    {
      id: 'attr_005',
      name: 'Warranty',
      code: 'warranty',
      description: 'Product warranty period',
      type: 'select',
      options: [
        { id: 'opt_022', label: '1 Year', value: '1-year', sortOrder: 0 },
        { id: 'opt_023', label: '2 Years', value: '2-years', sortOrder: 1 },
        { id: 'opt_024', label: '3 Years', value: '3-years', sortOrder: 2 },
        { id: 'opt_025', label: '5 Years', value: '5-years', sortOrder: 3 },
        { id: 'opt_026', label: 'Lifetime', value: 'lifetime', sortOrder: 4 }
      ],
      isFilterable: true,
      isRequired: false,
      isVariant: false,
      isVisible: true,
      isComparable: true,
      isActive: true,
      color: '#10b981',
      productCount: 567,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-02-12')
    },
    {
      id: 'attr_006',
      name: 'Weight',
      code: 'weight',
      description: 'Product weight specification',
      type: 'number',
      options: [],
      isFilterable: true,
      isRequired: false,
      isVariant: false,
      isVisible: true,
      isComparable: true,
      isActive: true,
      color: '#6366f1',
      productCount: 789,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-02-14')
    },
    {
      id: 'attr_007',
      name: 'Dimensions',
      code: 'dimensions',
      description: 'Product dimensions (L x W x H)',
      type: 'text',
      options: [],
      isFilterable: false,
      isRequired: false,
      isVariant: false,
      isVisible: true,
      isComparable: false,
      isActive: true,
      color: '#ec4899',
      productCount: 345,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-16')
    },
    {
      id: 'attr_008',
      name: 'Pattern',
      code: 'pattern',
      description: 'Product pattern or design',
      type: 'image',
      options: [
        { id: 'opt_027', label: 'Solid', value: '/patterns/solid.jpg', sortOrder: 0 },
        { id: 'opt_028', label: 'Striped', value: '/patterns/striped.jpg', sortOrder: 1 },
        { id: 'opt_029', label: 'Floral', value: '/patterns/floral.jpg', sortOrder: 2 },
        { id: 'opt_030', label: 'Checkered', value: '/patterns/checkered.jpg', sortOrder: 3 }
      ],
      isFilterable: true,
      isRequired: false,
      isVariant: true,
      isVisible: true,
      isComparable: true,
      isActive: false,
      color: '#f43f5e',
      productCount: 123,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-02-08')
    }
  ]);

  editingAttribute = signal<Attribute | null>(null);
  selectedQuickFilter = signal<string>('');

  attributeForm!: FormGroup;

  exportItems: DropdownItem[] = [
    { id: 'csv', label: 'Export as CSV', icon: 'filetype-csv' },
    { id: 'excel', label: 'Export as Excel', icon: 'filetype-xlsx' },
    { id: 'pdf', label: 'Export as PDF', icon: 'filetype-pdf' }
  ];

  constructor() {
    this.initForm();
  }

  private initForm() {
    this.attributeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.pattern('^[a-z0-9_]+$')]],
      description: [''],
      type: ['select', Validators.required],
      isFilterable: [true],
      isRequired: [false],
      isVariant: [false],
      isVisible: [true],
      isComparable: [true],
      isActive: [true],
      color: ['#6366f1'],
      options: this.fb.array([])
    });
  }

  get optionsArray(): FormArray {
    return this.attributeForm.get('options') as FormArray;
  }

  filteredAttributes = computed(() => {
    let result = this.attributes();

    // Search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.code.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.options.some(o => o.label.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (this.filterType()) {
      result = result.filter(a => a.type === this.filterType());
    }

    // Status filter
    if (this.filterStatus()) {
      const isActive = this.filterStatus() === 'active';
      result = result.filter(a => a.isActive === isActive);
    }

    // Filterable filter
    if (this.filterFilterable()) {
      const isFilterable = this.filterFilterable() === 'yes';
      result = result.filter(a => a.isFilterable === isFilterable);
    }

    // Required filter
    if (this.filterRequired()) {
      const isRequired = this.filterRequired() === 'yes';
      result = result.filter(a => a.isRequired === isRequired);
    }

    // Variant filter
    if (this.filterVariant()) {
      const isVariant = this.filterVariant() === 'yes';
      result = result.filter(a => a.isVariant === isVariant);
    }

    // Sorting
    result = [...result].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (this.sortField()) {
        case 'name': aVal = a.name; bVal = b.name; break;
        case 'code': aVal = a.code; bVal = b.code; break;
        case 'type': aVal = a.type; bVal = b.type; break;
        case 'options': aVal = a.options.length; bVal = b.options.length; break;
        case 'products': aVal = a.productCount; bVal = b.productCount; break;
        default: aVal = a.updatedAt; bVal = b.updatedAt;
      }

      if (this.sortDirection() === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  });

  paginatedAttributes = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredAttributes().slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() => Math.ceil(this.filteredAttributes().length / this.itemsPerPage()));

  attributeStats = computed(() => [
    {
      label: 'Total Attributes',
      value: this.attributes().length.toString(),
      trend: 12.5,
      icon: 'tags',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      filter: 'all'
    },
    {
      label: 'Active',
      value: this.attributes().filter(a => a.isActive).length.toString(),
      trend: 8.3,
      icon: 'check-circle',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      filter: 'active'
    },
    {
      label: 'Filterable',
      value: this.attributes().filter(a => a.isFilterable).length.toString(),
      trend: 15.2,
      icon: 'funnel',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      filter: 'filterable'
    },
    {
      label: 'For Variants',
      value: this.attributes().filter(a => a.isVariant).length.toString(),
      trend: 5.7,
      icon: 'layers',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      filter: 'variant'
    },
    {
      label: 'Required',
      value: this.attributes().filter(a => a.isRequired).length.toString(),
      trend: -2.1,
      icon: 'asterisk',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      filter: 'required'
    },
    {
      label: 'With Options',
      value: this.attributes().filter(a => a.options.length > 0).length.toString(),
      trend: 10.4,
      icon: 'list-ul',
      bgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      filter: 'with_options'
    }
  ]);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterType()) count++;
    if (this.filterStatus()) count++;
    if (this.filterFilterable()) count++;
    if (this.filterRequired()) count++;
    if (this.filterVariant()) count++;
    return count;
  });

  showOptionsSection = computed(() => {
    const type = this.attributeForm.get('type')?.value;
    return ['select', 'multiselect', 'color', 'image'].includes(type);
  });

  // Type helpers
  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      select: 'menu-down',
      multiselect: 'check2-square',
      text: 'type',
      textarea: 'textarea',
      color: 'palette',
      image: 'image',
      boolean: 'toggle-on',
      number: '123',
      date: 'calendar'
    };
    return icons[type] || 'question-circle';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      select: 'Select',
      multiselect: 'Multi-Select',
      text: 'Text',
      textarea: 'Text Area',
      color: 'Color Swatch',
      image: 'Image Swatch',
      boolean: 'Yes/No',
      number: 'Number',
      date: 'Date'
    };
    return labels[type] || type;
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      select: 'bg-indigo-100 text-indigo-800',
      multiselect: 'bg-purple-100 text-purple-800',
      text: 'bg-gray-100 text-gray-800',
      textarea: 'bg-slate-100 text-slate-800',
      color: 'bg-pink-100 text-pink-800',
      image: 'bg-amber-100 text-amber-800',
      boolean: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      date: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  }

  // Actions
  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  toggleViewMode() {
    this.viewMode.update(v => v === 'table' ? 'grid' : 'table');
  }

  openModal(attribute?: Attribute) {
    this.editingAttribute.set(attribute || null);

    if (attribute) {
      this.attributeForm.patchValue({
        name: attribute.name,
        code: attribute.code,
        description: attribute.description,
        type: attribute.type,
        isFilterable: attribute.isFilterable,
        isRequired: attribute.isRequired,
        isVariant: attribute.isVariant,
        isVisible: attribute.isVisible,
        isComparable: attribute.isComparable,
        isActive: attribute.isActive,
        color: attribute.color || '#6366f1'
      });

      // Populate options
      this.optionsArray.clear();
      attribute.options.forEach(opt => {
        this.optionsArray.push(this.fb.group({
          id: [opt.id],
          label: [opt.label, Validators.required],
          value: [opt.value, Validators.required],
          sortOrder: [opt.sortOrder]
        }));
      });
    } else {
      this.attributeForm.reset({
        type: 'select',
        isFilterable: true,
        isRequired: false,
        isVariant: false,
        isVisible: true,
        isComparable: true,
        isActive: true,
        color: '#6366f1'
      });
      this.optionsArray.clear();
    }

    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingAttribute.set(null);
    this.attributeForm.reset();
    this.optionsArray.clear();
  }

  generateCode() {
    const name = this.attributeForm.get('name')?.value;
    if (name && !this.editingAttribute()) {
      const code = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      this.attributeForm.patchValue({ code });
    }
  }

  onTypeChange() {
    // Clear options if type doesn't support them
    if (!this.showOptionsSection()) {
      this.optionsArray.clear();
    }
  }

  addOption() {
    const id = 'opt_' + Math.random().toString(36).substr(2, 9);
    const type = this.attributeForm.get('type')?.value;
    const defaultValue = type === 'color' ? '#6366f1' : '';

    this.optionsArray.push(this.fb.group({
      id: [id],
      label: ['', Validators.required],
      value: [defaultValue, Validators.required],
      sortOrder: [this.optionsArray.length]
    }));
  }

  removeOption(index: number) {
    this.optionsArray.removeAt(index);
  }

  onOptionImageSelected(index: number, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const optionGroup = this.optionsArray.at(index);
        optionGroup.patchValue({ value: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  saveAttribute() {
    if (this.attributeForm.invalid) {
      this.attributeForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.attributeForm.value;

    setTimeout(() => {
      if (this.editingAttribute()) {
        // Update existing
        this.attributes.update(attrs => attrs.map(a =>
          a.id === this.editingAttribute()!.id
            ? {
                ...a,
                ...formValue,
                options: formValue.options.map((o: any) => ({
                  ...o,
                  id: o.id || 'opt_' + Math.random().toString(36).substr(2, 9)
                })),
                updatedAt: new Date()
              }
            : a
        ));
      } else {
        // Create new
        const newAttribute: Attribute = {
          id: 'attr_' + Math.random().toString(36).substr(2, 9),
          ...formValue,
          options: formValue.options.map((o: any) => ({
            ...o,
            id: o.id || 'opt_' + Math.random().toString(36).substr(2, 9)
          })),
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.attributes.update(attrs => [...attrs, newAttribute]);
      }

      this.isSaving.set(false);
      this.closeModal();
    }, 1000);
  }

  deleteAttribute(attribute: Attribute) {
    if (confirm(`Are you sure you want to delete "${attribute.name}"? This will remove it from all products.`)) {
      this.attributes.update(attrs => attrs.filter(a => a.id !== attribute.id));
      this.closeModal();
    }
  }

  // Selection
  toggleSelection(id: string) {
    this.selectedAttributes.update(selected => {
      if (selected.includes(id)) {
        return selected.filter(s => s !== id);
      }
      return [...selected, id];
    });
  }

  isSelected(id: string): boolean {
    return this.selectedAttributes().includes(id);
  }

  isAllSelected(): boolean {
    const visible = this.paginatedAttributes();
    return visible.length > 0 && visible.every(a => this.isSelected(a.id));
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedAttributes.set([]);
    } else {
      this.selectedAttributes.set(this.paginatedAttributes().map(a => a.id));
    }
  }

  // Sorting
  sort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  // Quick filters
  applyQuickFilter(filter: string) {
    this.selectedQuickFilter.set(filter);
    this.clearAllFilters();

    switch (filter) {
      case 'active':
        this.filterStatus.set('active');
        break;
      case 'filterable':
        this.filterFilterable.set('yes');
        break;
      case 'variant':
        this.filterVariant.set('yes');
        break;
      case 'required':
        this.filterRequired.set('yes');
        break;
    }
  }

  clearAllFilters() {
    this.filterType.set('');
    this.filterStatus.set('');
    this.filterFilterable.set('');
    this.filterRequired.set('');
    this.filterVariant.set('');
    this.searchQuery.set('');
    this.selectedQuickFilter.set('');
  }

  // Pagination
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

  // Dropdown menu
  getAttributeMenuItems(attribute: Attribute): DropdownItem[] {
    const items: DropdownItem[] = [
      { id: 'edit', label: 'Edit Attribute', icon: 'pencil', shortcut: '⌘E' },
      { id: 'duplicate', label: 'Duplicate', icon: 'copy', shortcut: '⌘D' }
    ];

    if (attribute.isActive) {
      items.push({ id: 'deactivate', label: 'Deactivate', icon: 'pause-circle' });
    } else {
      items.push({ id: 'activate', label: 'Activate', icon: 'check-circle' });
    }

    items.push(
      { id: 'divider', label: '', divider: true },
      { id: 'delete', label: 'Delete Attribute', icon: 'trash', danger: true }
    );

    return items;
  }

  onAttributeAction(item: DropdownItem, attribute: Attribute) {
    switch (item.id) {
      case 'edit':
        this.openModal(attribute);
        break;
      case 'duplicate':
        this.duplicateAttribute(attribute);
        break;
      case 'activate':
        this.toggleAttributeStatus(attribute, true);
        break;
      case 'deactivate':
        this.toggleAttributeStatus(attribute, false);
        break;
      case 'delete':
        this.deleteAttribute(attribute);
        break;
    }
  }

  duplicateAttribute(attribute: Attribute) {
    const newAttr: Attribute = {
      ...attribute,
      id: 'attr_' + Math.random().toString(36).substr(2, 9),
      name: attribute.name + ' (Copy)',
      code: attribute.code + '_copy',
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.attributes.update(attrs => [...attrs, newAttr]);
  }

  toggleAttributeStatus(attribute: Attribute, isActive: boolean) {
    this.attributes.update(attrs => attrs.map(a =>
      a.id === attribute.id
        ? { ...a, isActive, updatedAt: new Date() }
        : a
    ));
  }

  // Bulk actions
  bulkActivate() {
    this.attributes.update(attrs => attrs.map(a =>
      this.selectedAttributes().includes(a.id)
        ? { ...a, isActive: true, updatedAt: new Date() }
        : a
    ));
    this.selectedAttributes.set([]);
  }

  bulkDeactivate() {
    this.attributes.update(attrs => attrs.map(a =>
      this.selectedAttributes().includes(a.id)
        ? { ...a, isActive: false, updatedAt: new Date() }
        : a
    ));
    this.selectedAttributes.set([]);
  }

  bulkSetFilterable(filterable: boolean) {
    this.attributes.update(attrs => attrs.map(a =>
      this.selectedAttributes().includes(a.id)
        ? { ...a, isFilterable: filterable, updatedAt: new Date() }
        : a
    ));
    this.selectedAttributes.set([]);
  }

  bulkDelete() {
    if (confirm(`Delete ${this.selectedAttributes().length} attributes? This action cannot be undone.`)) {
      this.attributes.update(attrs => attrs.filter(a => !this.selectedAttributes().includes(a.id)));
      this.selectedAttributes.set([]);
    }
  }

  // Export
  onExport(item: DropdownItem) {
    console.log('Exporting as', item.id);
    // Implement export logic
  }
}