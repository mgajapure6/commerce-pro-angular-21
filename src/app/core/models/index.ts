// src/app/core/models/index.ts
// Central export for all models

// Product models
export * from './product.model';

// Category models
export * from './category.model';

// Attribute models
export * from './attribute.model';

// Brand models
export * from './brand.model';

// Collection models
export * from './collection.model';

// Review models
export * from './review.model';

// SEO models
export * from './seo.model';

// Catalog shared models (bulk operations, etc.)
export * from './catalog-shared.model';

// Dashboard models
export * from './dashboard.model';

// Legacy exports for backward compatibility
export type { Product as ProductModel } from './product.model';
export type { Category as CategoryModel } from './category.model';
