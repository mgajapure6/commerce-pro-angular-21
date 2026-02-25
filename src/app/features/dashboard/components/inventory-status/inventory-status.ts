import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-inventory-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-status.html',
  styleUrl: './inventory-status.scss'
})
export class InventoryStatus {
  stats = computed(() => this.productService.inventoryStats());

  constructor(private productService: ProductService) {}
}