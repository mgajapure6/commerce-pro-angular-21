// src/app/features/products/components/add-product/add-product.component.ts
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

interface Category {
  id: string;
  name: string;
  parent?: string;
  subcategories?: Category[];
}

interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productId = signal<string | null>(null);
  isEditMode = computed(() => !!this.productId());

  productForm!: FormGroup;
  currentStep = signal(0);
  isSubmitting = signal(false);

  steps = signal([
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'variants', label: 'Variants' },
    { id: 'images', label: 'Images' },
    { id: 'seo', label: 'SEO' }
  ]);

  categories = signal<Category[]>([
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Clothing' },
    { id: '3', name: 'Home & Garden' },
    { id: '4', name: 'Sports' },
    { id: '5', name: 'Books' }
  ]);

  brands = signal(['TechBrand', 'Nike', 'Apple', 'Samsung', 'Sony', 'Generic']);

  selectedTags = signal<string[]>([]);
  tagInput = signal('');

  variants = signal<ProductVariant[]>([]);

  featuredImage = signal<string | null>(null);
  galleryImages = signal<string[]>([]);

  selectedCollections = signal<string[]>([]);

  constructor() {

    // Get route params
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');
      if (id && id !== 'new') {
        this.productId.set(id);
        this.loadProduct(id);
      }
    });

    this.initForm();
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
      status: ['draft'],
      productType: ['Physical'],
      vendor: [''],
      seoTitle: [''],
      seoDescription: [''],
      urlHandle: ['', Validators.required],
      imageAlt: ['']
    });
  }

  private loadProduct(id: string) {
    // Simulate API call to load product
    console.log('Loading product:', id);
    // In real app: this.productService.getById(id).subscribe(product => {
    //   this.productForm.patchValue(product);
    // });
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
    this.productForm.patchValue({ status: 'draft' });
    this.submitProduct();
  }

  previewProduct() {
    console.log('Preview:', this.productForm.value);
  }

  publishProduct() {
    if (this.productForm.valid) {
      this.productForm.patchValue({ status: 'active' });
      this.submitProduct();
    } else {
      this.markAllAsTouched();
    }
  }

  submitProduct() {
    this.isSubmitting.set(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Product submitted:', {
        ...this.productForm.value,
        tags: this.selectedTags(),
        variants: this.variants(),
        featuredImage: this.featuredImage(),
        galleryImages: this.galleryImages(),
        collections: this.selectedCollections()
      });

      this.isSubmitting.set(false);
      this.router.navigate(['/products']);
    }, 2000);
  }

  markAllAsTouched() {
    Object.values(this.productForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  deleteProduct() {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      console.log('Deleting product:', this.productId());
      // this.productService.delete(this.productId()).subscribe(() => {
      //   this.router.navigate(['/products']);
      // });
    }
  }
}