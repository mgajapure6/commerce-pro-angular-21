// src/app/core/models/product.model.ts
// Consolidated Product model for catalog module

export type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock' | 'discontinued';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type ProductVisibility = 'visible' | 'hidden';

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

/**
 * Full Product interface - used across catalog module
 * Consolidated from product-list.ts, product-form.ts, product.service.ts
 */
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  category: string;
  categoryId?: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  comparePrice?: number; // Alias for compareAtPrice
  cost: number;
  stock: number;
  quantity?: number; // Alias for stock
  lowStockThreshold: number;
  stockStatus: StockStatus;
  status: ProductStatus;
  visibility: ProductVisibility;
  image: string;
  gallery?: string[];
  galleryImages?: string[]; // Alias for gallery
  featuredImage?: string | null;
  weight?: number;
  dimensions?: ProductDimensions;
  tags: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  reviews?: number; // Alias for reviewCount
  salesCount: number;
  sales?: number; // Alias for salesCount
  revenue: number;
  variants?: ProductVariant[];
  variantCount?: number;
  hasOrders?: boolean;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  vendor?: string;
  productType?: 'Physical' | 'Digital';
  barcode?: string;
  urlHandle?: string;
  seoTitle?: string;
  seoDescription?: string;
  imageAlt?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Simplified Product interface for lists/selections
 */
export interface ProductSummary {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  status: ProductStatus;
  hasOrders?: boolean;
}

/**
 * Product for dashboard/top products view
 */
export interface ProductDashboardView {
  id: string;
  name: string;
  category: string;
  price: number;
  sold: number;
  revenue: number;
  stock: number;
  stockStatus: StockStatus;
  icon?: string;
  image?: string;
}

export interface ProductStatusCount {
  status: string;
  count: number;
}

export interface ProductFilterState {
  searchQuery: string;
  status: string;
  category: string;
  stockStatus: string;
  brand: string;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number;
}

export interface ProductStats {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
  drafts: number;
  revenue: number;
}
