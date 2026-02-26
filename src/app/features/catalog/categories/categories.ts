// src/app/features/products/components/categories/categories.component.ts
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  parentName?: string;
  image?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  productCount: number;
  subcategories: Category[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryTreeNode extends Category {
  level: number;
  isExpanded: boolean;
  isEditing: boolean;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class Categories {
  private fb = inject(FormBuilder);
  
  // View state
  viewMode = signal<'tree' | 'grid'>('tree');
  showViewOptions = signal(false);
  showModal = signal(false);
  isSaving = signal(false);
  
  // Filters
  searchQuery = signal('');
  filterStatus = signal('');
  sortBy = signal('name');
  
  // Data
  categories = signal<Category[]>([
    {
      id: '1',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets and electronic devices',
      parentId: null,
      color: '#6366f1',
      icon: 'laptop',
      isActive: true,
      isFeatured: true,
      sortOrder: 0,
      productCount: 1250,
      subcategories: [],
      seoTitle: 'Electronics - Buy Latest Gadgets Online',
      seoDescription: 'Shop the latest electronics including smartphones, laptops, and more.',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-20'),
      metaKeywords: 'electronics, gadgets, smartphones, laptops'
    },
    {
      id: '2',
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      parentId: '1',
      parentName: 'Electronics',
      color: '#8b5cf6',
      icon: 'phone',
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
      productCount: 450,
      subcategories: [],
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-02-18')
    },
    {
      id: '3',
      name: 'Laptops',
      slug: 'laptops',
      description: 'Notebooks and laptop computers',
      parentId: '1',
      parentName: 'Electronics',
      color: '#ec4899',
      icon: 'laptop',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      productCount: 320,
      subcategories: [],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: '4',
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel for all',
      parentId: null,
      color: '#f59e0b',
      icon: 'shirt',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      productCount: 890,
      subcategories: [],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-02-19')
    },
    {
      id: '5',
      name: "Men's Wear",
      slug: 'mens-wear',
      description: 'Clothing for men',
      parentId: '4',
      parentName: 'Clothing',
      color: '#10b981',
      icon: 'person',
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
      productCount: 420,
      subcategories: [],
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-02-16')
    },
    {
      id: '6',
      name: "Women's Wear",
      slug: 'womens-wear',
      description: 'Clothing for women',
      parentId: '4',
      parentName: 'Clothing',
      color: '#f43f5e',
      icon: 'person',
      isActive: false,
      isFeatured: false,
      sortOrder: 1,
      productCount: 380,
      subcategories: [],
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-02-14')
    },
    {
      id: '7',
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Everything for your home',
      parentId: null,
      color: '#06b6d4',
      icon: 'house',
      isActive: true,
      isFeatured: false,
      sortOrder: 2,
      productCount: 650,
      subcategories: [],
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-02-17')
    }
  ]);
  
  selectedCategories = signal<string[]>([]);
  expandedNodes = signal<Set<string>>(new Set());
  editingCategory = signal<Category | null>(null);
  previewImage = signal<string | null>(null);
  
  categoryForm: FormGroup;
  
  // Build category tree
  categoryTree = computed(() => {
    const buildTree = (parentId: string | null, level: number): CategoryTreeNode[] => {
      return this.categories()
        .filter(c => c.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(c => ({
          ...c,
          level,
          isExpanded: this.expandedNodes().has(c.id),
          isEditing: false,
          subcategories: buildTree(c.id, level + 1)
        }));
    };
    return buildTree(null, 0);
  });
  
  // Flatten tree for table view
  visibleTreeNodes = computed(() => {
    const nodes: CategoryTreeNode[] = [];
    const traverse = (treeNodes: CategoryTreeNode[]) => {
      for (const node of treeNodes) {
        nodes.push(node);
        if (node.isExpanded) {
          const childNodes = this.categoryTree()
            .flatMap(root => this.findChildNodes(root, node.id));
          if (childNodes.length > 0) {
            traverse(childNodes);
          }
        }
      }
    };
    traverse(this.categoryTree());
    return nodes;
  });
  
  private findChildNodes(node: CategoryTreeNode, parentId: string): CategoryTreeNode[] {
    if (node.id === parentId) {
      return node.subcategories.map(child => ({
        ...child,
        level: node.level + 1,
        isExpanded: this.expandedNodes().has(child.id),
        isEditing: false
      }));
    }
    return node.subcategories.flatMap(child => {
      const childNode: CategoryTreeNode = {
        ...child,
        level: node.level + 1,
        isExpanded: this.expandedNodes().has(child.id),
        isEditing: false
      };
      return this.findChildNodes(childNode, parentId);
    });
  }
  
  flatCategories = computed(() => {
    const flatten = (cats: Category[]): Category[] => {
      return cats.flatMap(c => [c, ...flatten(c.subcategories)]);
    };
    return flatten(this.categoryTree());
  });
  
  filteredCategories = computed(() => {
    let result = this.flatCategories();
    
    // Search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (this.filterStatus()) {
      const isActive = this.filterStatus() === 'active';
      result = result.filter(c => c.isActive === isActive);
    }
    
    // Sort
    result = [...result].sort((a, b) => {
      switch (this.sortBy()) {
        case 'name': return a.name.localeCompare(b.name);
        case 'products': return b.productCount - a.productCount;
        case 'date': return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'order': return a.sortOrder - b.sortOrder;
        default: return 0;
      }
    });
    
    return result;
  });
  
  availableParents = computed(() => {
    const currentId = this.editingCategory()?.id;
    return this.flatCategories().filter(c => c.id !== currentId);
  });
  
  categoryStats = computed(() => [
    { label: 'Total Categories', value: this.flatCategories().length, icon: 'bi-folder', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', trend: 12 },
    { label: 'Active', value: this.flatCategories().filter(c => c.isActive).length, icon: 'bi-check-circle', bgColor: 'bg-green-100', iconColor: 'text-green-600', trend: 8 },
    { label: 'Featured', value: this.flatCategories().filter(c => c.isFeatured).length, icon: 'bi-star', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600', trend: 5 },
    { label: 'Top Level', value: this.categoryTree().length, icon: 'bi-layers', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', trend: 2 }
  ]);

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      parentId: [null],
      description: [''],
      color: ['#6366f1'],
      icon: ['folder'],
      image: [''],
      isActive: [true],
      isFeatured: [false],
      seoTitle: [''],
      seoDescription: [''],
      metaKeywords: ['']
    });
    
    // Expand root categories by default
    this.categoryTree().forEach(node => {
      this.expandedNodes.update(set => new Set([...set, node.id]));
    });
  }

  // Selection
  isSelected(id: string): boolean {
    return this.selectedCategories().includes(id);
  }
  
  toggleSelection(id: string) {
    this.selectedCategories.update(selected => {
      if (selected.includes(id)) {
        return selected.filter(s => s !== id);
      }
      return [...selected, id];
    });
  }
  
  isAllSelected(): boolean {
    const visible = this.visibleTreeNodes();
    return visible.length > 0 && visible.every(n => this.isSelected(n.id));
  }
  
  toggleSelectAll() {
    const visible = this.visibleTreeNodes().map(n => n.id);
    if (this.isAllSelected()) {
      this.selectedCategories.update(selected => selected.filter(id => !visible.includes(id)));
    } else {
      this.selectedCategories.update(selected => [...new Set([...selected, ...visible])]);
    }
  }

  // Tree operations
  toggleExpand(id: string) {
    this.expandedNodes.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }
  
  expandAll() {
    const allIds = this.flatCategories().map(c => c.id);
    this.expandedNodes.update(() => new Set(allIds));
  }

  // CRUD operations
  openModal(category?: Category) {
    this.editingCategory.set(category || null);
    this.previewImage.set(category?.image || null);
    
    if (category) {
      this.categoryForm.patchValue({
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
        description: category.description,
        color: category.color,
        icon: category.icon,
        isActive: category.isActive,
        isFeatured: category.isFeatured,
        seoTitle: category.seoTitle,
        seoDescription: category.seoDescription,
        metaKeywords: category.metaKeywords
      });
    } else {
      this.categoryForm.reset({
        color: '#6366f1',
        icon: 'folder',
        isActive: true,
        isFeatured: false
      });
    }
    
    this.showModal.set(true);
  }
  
  closeModal() {
    this.showModal.set(false);
    this.editingCategory.set(null);
    this.previewImage.set(null);
    this.categoryForm.reset();
  }
  
  generateSlug() {
    const name = this.categoryForm.get('name')?.value;
    if (name && !this.editingCategory()) {
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.categoryForm.patchValue({ slug });
    }
  }
  
  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.handleImage(file);
  }
  
  onImageDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.handleImage(file);
  }
  
  handleImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImage.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
  
  clearImage() {
    this.previewImage.set(null);
    this.categoryForm.patchValue({ image: '' });
  }
  
  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    
    this.isSaving.set(true);
    const formValue = this.categoryForm.value;
    
    setTimeout(() => {
      if (this.editingCategory()) {
        // Update existing
        this.categories.update(cats => cats.map(c => 
          c.id === this.editingCategory()!.id
            ? {
                ...c,
                ...formValue,
                image: this.previewImage(),
                updatedAt: new Date()
              }
            : c
        ));
      } else {
        // Create new
        const newCategory: Category = {
          id: Math.random().toString(36).substr(2, 9),
          ...formValue,
          image: this.previewImage(),
          productCount: 0,
          subcategories: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.categories.update(cats => [...cats, newCategory]);
      }
      
      this.isSaving.set(false);
      this.closeModal();
    }, 1000);
  }
  
  editCategory(category: Category) {
    this.openModal(category);
  }
  
  addSubcategory(parent: Category) {
    this.openModal();
    this.categoryForm.patchValue({ parentId: parent.id });
  }
  
  deleteCategory(category: Category) {
    const hasSubcategories = this.categories().some(c => c.parentId === category.id);
    const hasProducts = category.productCount > 0;
    
    let message = `Are you sure you want to delete "${category.name}"?`;
    if (hasSubcategories) {
      message += '\n\nThis category has subcategories that will also be deleted.';
    }
    if (hasProducts) {
      message += `\n\nThis category contains ${category.productCount} products.`;
    }
    
    if (confirm(message)) {
      this.categories.update(cats => {
        const idsToDelete = new Set<string>([category.id]);
        const collectIds = (parentId: string) => {
          cats.filter(c => c.parentId === parentId).forEach(c => {
            idsToDelete.add(c.id);
            collectIds(c.id);
          });
        };
        collectIds(category.id);
        
        return cats.filter(c => !idsToDelete.has(c.id));
      });
    }
  }
  
  toggleStatus(category: Category) {
    this.categories.update(cats => cats.map(c => 
      c.id === category.id
        ? { ...c, isActive: !c.isActive, updatedAt: new Date() }
        : c
    ));
  }

  // Reordering
  moveUp(node: CategoryTreeNode) {
    if (node.sortOrder === 0) return;
    
    this.categories.update(cats => cats.map(c => {
      if (c.id === node.id) return { ...c, sortOrder: c.sortOrder - 1 };
      if (c.parentId === node.parentId && c.sortOrder === node.sortOrder - 1) {
        return { ...c, sortOrder: c.sortOrder + 1 };
      }
      return c;
    }));
  }
  
  moveDown(node: CategoryTreeNode) {
    const siblings = this.categories().filter(c => c.parentId === node.parentId);
    if (node.sortOrder >= siblings.length - 1) return;
    
    this.categories.update(cats => cats.map(c => {
      if (c.id === node.id) return { ...c, sortOrder: c.sortOrder + 1 };
      if (c.parentId === node.parentId && c.sortOrder === node.sortOrder + 1) {
        return { ...c, sortOrder: c.sortOrder - 1 };
      }
      return c;
    }));
  }

  // Bulk actions
  bulkActivate() {
    this.categories.update(cats => cats.map(c => 
      this.selectedCategories().includes(c.id)
        ? { ...c, isActive: true, updatedAt: new Date() }
        : c
    ));
    this.selectedCategories.set([]);
  }
  
  bulkDeactivate() {
    this.categories.update(cats => cats.map(c => 
      this.selectedCategories().includes(c.id)
        ? { ...c, isActive: false, updatedAt: new Date() }
        : c
    ));
    this.selectedCategories.set([]);
  }
  
  bulkDelete() {
    if (confirm(`Delete ${this.selectedCategories().length} categories?`)) {
      this.categories.update(cats => cats.filter(c => !this.selectedCategories().includes(c.id)));
      this.selectedCategories.set([]);
    }
  }

  // Filters
  applyFilters() {
    // Triggered by input changes
  }
  
  clearFilters() {
    this.searchQuery.set('');
    this.filterStatus.set('');
    this.sortBy.set('name');
  }
}