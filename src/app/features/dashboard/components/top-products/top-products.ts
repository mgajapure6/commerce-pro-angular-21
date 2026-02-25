import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-top-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-products.html',
  styleUrl: './top-products.scss'
})
export class TopProducts {
  products = computed(() => this.productService.topProducts());

  constructor(private productService: ProductService) {}
}