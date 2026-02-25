export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  sold: number;
  revenue: number;
  stock: number;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  icon: string;
}

export interface InventoryStats {
  inStock: number;
  lowStock: number;
  outOfStock: number;
}