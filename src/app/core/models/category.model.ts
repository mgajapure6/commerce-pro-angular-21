// src/app/core/models/category.model.ts
// Category models for catalog module

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  parentName?: string;
  image?: string;
  icon?: string;
  color: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  showInMenu?: boolean;
  showInFooter?: boolean;
  productCount: number;
  subcategories: Category[];
  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  robotsMeta?: string;
  // Custom fields
  customFields?: Record<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryTreeNode extends Category {
  level: number;
  isExpanded: boolean;
  isEditing: boolean;
}

export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultFields: Partial<Category>;
}

export interface CategoryStats {
  total: number;
  active: number;
  featured: number;
  topLevel: number;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  color: string;
  icon: string;
  image: string;
  imageAlt?: string;
  isActive: boolean;
  isFeatured: boolean;
  showInMenu: boolean;
  showInFooter: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
  canonicalUrl?: string;
  robotsMeta?: string;
}
