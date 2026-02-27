// src/app/features/products/components/add-product/add-product.component.ts
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { 
  Category, 
  ProductVariant,
  Product,
  ProductStatus,
  StockStatus
} from '../../../core/models';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { BrandService } from '../../../core/services/brand.service';
import { CollectionService } from '../../../core/services/collection.service';
import { AttributeService } from '../../../core/services/attribute.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private collectionService = inject(CollectionService);
  private attributeService = inject(AttributeService);

  productId = signal<string | null>(null);
  isEditMode = computed(() => !!this.productId());

  productForm!: FormGroup;
  currentStep = signal(0);
  isSubmitting = signal(false);
  isLoading = signal(false);

  steps = signal([
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'variants', label: 'Variants' },
    { id: 'images', label: 'Images' },
    { id: 'seo', label: 'SEO' }
  ]);

  // Data from services
  categories = this.categoryService.allCategories;
  brands = computed(() => 
    this.brandService.allBrands().map(b => b.name)
  );
  collections = this.collectionService.allCollections;
  attributes = this.attributeService.allAttributes;

  selectedTags = signal<string[]>([]);
  tagInput = signal('');

  variants = signal<ProductVariant[]>([]);

  featuredImage = signal<string | null>(null);
  galleryImages = signal<string[]>([]);

  selectedCollections = signal<string[]>([]);

  ngOnInit() {
    this.initForm();
    
    // Check for edit mode
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');
      if (id && id !== 'new') {
        this.productId.set(id);
        this.loadProduct(id);
      }
    });
  }

  private initForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      shortDescription: [''],
      category: ['', Validators.required],
      brand: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      comparePrice: [null],
      cost: [null],
      sku: ['', Validators.required],
      barcode: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      lowStockThreshold: [10],
      weight: [null],
      trackInventory: [true],
      allowBackorders: [false],
      visibility: ['visible'],
      publishDate: [''],
      status: ['draft' as ProductStatus],
      productType: ['Physical'],
      vendor: [''],
      seoTitle: [''],
      seoDescription: [''],
      urlHandle: ['', Validators.required],
      imageAlt: ['']
    });
  }

  private loadProduct(id: string) {
    this.isLoading.set(true);
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        if (product) {
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            category: product.category,
            brand: product.brand,
            price: product.price,
            comparePrice: product.compareAtPrice,
            cost: product.cost,
            sku: product.sku,
            quantity: product.stock,
            lowStockThreshold: product.lowStockThreshold,
            weight: product.weight,
            status: product.status,
            seoTitle: product.seoTitle,
            seoDescription: product.seoDescription,
            urlHandle: product.urlHandle
          });
          
          this.featuredImage.set(product.image);
          this.galleryImages.set(product.gallery || []);
          this.selectedTags.set(product.tags || []);
          this.variants.set(product.variants || []);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/catalog/products']);
      }
    });
  }

  getStepClass(index: number): string {
    if (this.currentStep() === index) {
      return 'bg-indigo-600 text-white ring-4 ring-indigo-100';
    }
    if (this.isStepComplete(index)) {
      return 'bg-green-500 text-white';
    }
    return 'bg-gray-100 text-gray-500';
  }

  isStepComplete(index: number): boolean {
    return index < this.currentStep();
  }

  goToStep(index: number) {
    if (index <= this.currentStep() + 1) {
      this.currentStep.set(index);
    }
  }

  nextStep() {
    if (this.currentStep() < this.steps().length - 1) {
      this.currentStep.update(s => s + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  addTag() {
    const tag = this.tagInput().trim();
    if (tag && !this.selectedTags().includes(tag)) {
      this.selectedTags.update(tags => [...tags, tag]);
      this.tagInput.set('');
    }
  }

  removeTag(tag: string) {
    this.selectedTags.update(tags => tags.filter(t => t !== tag));
  }

  addVariant() {
    const id = Math.random().toString(36).substr(2, 9);
    this.variants.update(v => [...v, { id, name: '', options: [] }]);
  }

  removeVariant(index: number) {
    this.variants.update(v => v.filter((_, i) => i !== index));
  }

  updateVariantName(index: number, name: string) {
    this.variants.update(v => {
      const updated = [...v];
      updated[index] = { ...updated[index], name };
      return updated;
    });
  }

  addVariantOption(variantIndex: number, option: string) {
    const trimmed = option.trim();
    if (trimmed && !this.variants()[variantIndex].options.includes(trimmed)) {
      this.variants.update(v => {
        const updated = [...v];
        updated[variantIndex] = {
          ...updated[variantIndex],
          options: [...updated[variantIndex].options, trimmed]
        };
        return updated;
      });
    }
  }

  removeVariantOption(variantIndex: number, option: string) {
    this.variants.update(v => {
      const updated = [...v];
      updated[variantIndex] = {
        ...updated[variantIndex],
        options: updated[variantIndex].options.filter(o => o !== option)
      };
      return updated;
    });
  }

  variantCombinations = computed(() => {
    const vars = this.variants();
    if (vars.length === 0) return [];

    const generateCombos = (index: number, current: string[]): string[] => {
      if (index === vars.length) return [current.join(' / ')];
      const combos: string[] = [];
      for (const option of vars[index].options) {
        combos.push(...generateCombos(index + 1, [...current, option]));
      }
      return combos;
    };

    return generateCombos(0, []);
  });

  onDrop(event: DragEvent, type: string) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      this.handleImage(files[0], type);
    }
  }

  onFileSelected(event: Event, type: string) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.handleImage(file, type);
    }
  }

  onGallerySelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      Array.from(files).forEach(file => {
        if (this.galleryImages().length < 8) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.galleryImages.update(imgs => [...imgs, e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  handleImage(file: File, type: string) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'featured') {
        this.featuredImage.set(e.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  removeImage(type: string) {
    if (type === 'featured') {
      this.featuredImage.set(null);
    }
  }

  setAsFeatured(index: number) {
    const imgs = this.galleryImages();
    const featured = imgs[index];
    this.galleryImages.update(imgs => [featured, ...imgs.filter((_, i) => i !== index)]);
  }

  removeGalleryImage(index: number) {
    this.galleryImages.update(imgs => imgs.filter((_, i) => i !== index));
  }

  generateSKU() {
    const prefix = 'PRD';
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.productForm.patchValue({ sku: `${prefix}-${random}` });
  }

  adjustQuantity(delta: number) {
    const current = this.productForm.get('quantity')?.value || 0;
    const newValue = Math.max(0, current + delta);
    this.productForm.patchValue({ quantity: newValue });
  }

  showProfitPreview = computed(() => {
    const price = this.productForm.get('price')?.value;
    const cost = this.productForm.get('cost')?.value;
    return price && cost && price > cost;
  });

  calculateProfit(): number {
    const price = this.productForm.get('price')?.value || 0;
    const cost = this.productForm.get('cost')?.value || 0;
    return price - cost;
  }

  calculateMargin(): number {
    const price = this.productForm.get('price')?.value || 0;
    const profit = this.calculateProfit();
    return price > 0 ? (profit / price) * 100 : 0;
  }

  addCollection(name: string) {
    const trimmed = name.trim();
    if (trimmed && !this.selectedCollections().includes(trimmed)) {
      this.selectedCollections.update(c => [...c, trimmed]);
    }
  }

  removeCollection(collection: string) {
    this.selectedCollections.update(c => c.filter(col => col !== collection));
  }

  saveAsDraft() {
    this.productForm.patchValue({ status: 'draft' as ProductStatus });
    this.submitProduct();
  }

  previewProduct() {
    console.log('Preview:', this.productForm.value);
  }

  publishProduct() {
    if (this.productForm.valid) {
      this.productForm.patchValue({ status: 'active' as ProductStatus });
      this.submitProduct();
    } else {
      this.markAllAsTouched();
    }
  }

  submitProduct() {
    if (this.productForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.productForm.value;
    
    const productData: Partial<Product> = {
      ...formValue,
      tags: this.selectedTags(),
      variants: this.variants(),
      image: this.featuredImage() || '',
      gallery: this.galleryImages(),
      stock: formValue.quantity,
      compareAtPrice: formValue.comparePrice,
      revenue: 0,
      salesCount: 0
    };

    if (this.isEditMode()) {
      this.productService.updateProduct(this.productId()!, productData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/catalog/products']);
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/catalog/products']);
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  markAllAsTouched() {
    Object.values(this.productForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  deleteProduct() {
    if (!this.isEditMode()) return;
    
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      this.productService.deleteProduct(this.productId()!).subscribe(() => {
        this.router.navigate(['/catalog/products']);
      });
    }
  }
}
