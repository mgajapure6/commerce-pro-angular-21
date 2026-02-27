import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-inventory-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-status.html',
  styleUrl: './inventory-status.scss'
})
export class InventoryStatus {
  private productService = inject(ProductService);
  
  products = this.productService.allProducts;
  isLoading = this.productService.isLoading;
  
  // Computed inventory stats
  stats = computed(() => {
    const all = this.products();
    const total = all.length;
    
    if (total === 0) {
      return {
        inStock: { count: 0, percentage: 0 },
        lowStock: { count: 0, percentage: 0 },
        outOfStock: { count: 0, percentage: 0 }
      };
    }
    
    const inStockCount = all.filter(p => p.stockStatus === 'in_stock').length;
    const lowStockCount = all.filter(p => p.stockStatus === 'low_stock').length;
    const outOfStockCount = all.filter(p => p.stockStatus === 'out_of_stock').length;
    
    return {
      inStock: { 
        count: inStockCount, 
        percentage: Math.round((inStockCount / total) * 100) 
      },
      lowStock: { 
        count: lowStockCount, 
        percentage: Math.round((lowStockCount / total) * 100) 
      },
      outOfStock: { 
        count: outOfStockCount, 
        percentage: Math.round((outOfStockCount / total) * 100) 
      }
    };
  });
  
  // Products needing attention (low or out of stock)
  attentionProducts = computed(() => {
    return this.products()
      .filter(p => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock')
      .slice(0, 5);
  });
}
