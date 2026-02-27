import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-top-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-products.html',
  styleUrl: './top-products.scss'
})
export class TopProducts {
  private productService = inject(ProductService);
  
  // Get top selling products from service
  products = computed(() => {
    const all = this.productService.allProducts();
    return [...all]
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 5);
  });
  
  isLoading = this.productService.isLoading;

  // Helper to calculate progress bar width
  getProgressWidth(product: Product): string {
    const maxSales = this.products()[0]?.salesCount || 1;
    const percentage = ((product.salesCount || 0) / maxSales) * 100;
    return `${percentage}%`;
  }
}
