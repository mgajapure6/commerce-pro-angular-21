// src/app/features/inventory/components/inventory-valuation/inventory-valuation.component.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

type ValuationMethod = 'fifo' | 'lifo' | 'weighted_average' | 'specific_identification';
type ValuationStatus = 'active' | 'pending_review' | 'deprecated';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  image: string;
  supplier: string;
}

interface CostLayer {
  id: string;
  purchaseDate: Date;
  quantity: number;
  unitCost: number;
  totalCost: number;
  remainingQuantity: number;
  batchNumber?: string;
  expiryDate?: Date;
}

interface InventoryValuation {
  id: string;
  product: Product;
  currentMethod: ValuationMethod;
  totalQuantity: number;
  totalValue: number;
  avgUnitCost: number;
  costLayers: CostLayer[];
  cogs: number; // Cost of Goods Sold
  turnoverRatio: number;
  daysInInventory: number;
  lastValuationDate: Date;
  status: ValuationStatus;
  variance?: number; // Variance from last period
  variancePercentage?: number;
}

interface ValuationSummary {
  totalInventoryValue: number;
  totalCOGS: number;
  grossMargin: number;
  inventoryTurnover: number;
  avgDaysInInventory: number;
  methodBreakdown: Record<ValuationMethod, number>;
}

interface ValuationMethodConfig {
  method: ValuationMethod;
  name: string;
  description: string;
  icon: string;
  color: string;
  taxImplication: string;
  bestFor: string[];
}

@Component({
  selector: 'app-inventory-valuation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './valuation.html',
  styleUrl: './valuation.scss'
})
export class Valuation implements OnInit {
  private fb = new FormBuilder();

  // View State
  activeView = signal<'list' | 'detail' | 'adjust'>('list');
  selectedValuation = signal<InventoryValuation | null>(null);
  showFilters = signal(false);
  showMethodComparison = signal(false);

  // Modals
  showMethodModal = signal(false);
  showAdjustModal = signal(false);
  showExportModal = signal(false);
  showRecalculateModal = signal(false);

  // Forms
  filterForm!: FormGroup;
  adjustForm!: FormGroup;
  methodForm!: FormGroup;

  // Filters
  searchQuery = signal('');
  filterCategory = signal('');
  filterMethod = signal<ValuationMethod | ''>('');
  filterStatus = signal<ValuationStatus | ''>('');

  // Data
  products = signal<Product[]>([
    {
      id: 'p1',
      name: 'Wireless Bluetooth Headphones Pro',
      sku: 'WBH-PM-001',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
      supplier: 'TechCorp'
    },
    {
      id: 'p2',
      name: 'Smart Watch Series 5',
      sku: 'SW-S5-002',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
      supplier: 'TechCorp'
    },
    {
      id: 'p3',
      name: 'Organic Cotton T-Shirt',
      sku: 'OCT-001-BLK',
      category: 'Clothing',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100',
      supplier: 'FashionHub'
    },
    {
      id: 'p4',
      name: 'Running Shoes Pro',
      sku: 'RS-PRO-001',
      category: 'Sports',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
      supplier: 'SportsPro'
    },
    {
      id: 'p5',
      name: 'Leather Laptop Bag',
      sku: 'LLB-ES-001',
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100',
      supplier: 'FashionHub'
    },
    {
      id: 'p6',
      name: 'Premium Coffee Beans',
      sku: 'PCB-001-ORG',
      category: 'Food & Beverage',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100',
      supplier: 'GlobalSupply'
    }
  ]);

  categories = signal(['Electronics', 'Clothing', 'Sports', 'Accessories', 'Food & Beverage']);

  valuationMethods: ValuationMethodConfig[] = [
    {
      method: 'fifo',
      name: 'FIFO',
      description: 'First-In, First-Out. Oldest inventory costs are assigned to COGS first.',
      icon: 'bi-arrow-down-circle',
      color: 'bg-blue-100 text-blue-700',
      taxImplication: 'Higher taxable income during inflation',
      bestFor: ['Perishable goods', 'Stable prices', 'International reporting']
    },
    {
      method: 'lifo',
      name: 'LIFO',
      description: 'Last-In, First-Out. Newest inventory costs are assigned to COGS first.',
      icon: 'bi-arrow-up-circle',
      color: 'bg-purple-100 text-purple-700',
      taxImplication: 'Lower taxable income during inflation (US only)',
      bestFor: ['Inflationary periods', 'Tax optimization', 'Non-perishable goods']
    },
    {
      method: 'weighted_average',
      name: 'Weighted Average',
      description: 'Average cost of all inventory items is calculated and applied uniformly.',
      icon: 'bi-calculator',
      color: 'bg-green-100 text-green-700',
      taxImplication: 'Moderate and consistent tax treatment',
      bestFor: ['High-volume items', 'Homogeneous products', 'Simplified accounting']
    },
    {
      method: 'specific_identification',
      name: 'Specific ID',
      description: 'Each item is tracked individually by its actual purchase cost.',
      icon: 'bi-fingerprint',
      color: 'bg-orange-100 text-orange-700',
      taxImplication: 'Exact cost matching to revenue',
      bestFor: ['High-value items', 'Unique products', 'Serialized inventory']
    }
  ];

  valuations = signal<InventoryValuation[]>([]);

  ngOnInit() {
    this.initializeForms();
    this.generateMockValuations();
  }

  initializeForms() {
    this.filterForm = this.fb.group({
      category: [''],
      method: [''],
      status: ['']
    });

    this.adjustForm = this.fb.group({
      adjustmentType: ['value_increase', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      reason: ['', Validators.required],
      notes: ['']
    });

    this.methodForm = this.fb.group({
      method: ['fifo', Validators.required],
      effectiveDate: [new Date().toISOString().split('T')[0], Validators.required],
      reason: ['', Validators.required],
      applyToAll: [false]
    });
  }

  generateMockValuations() {
    const methods: ValuationMethod[] = ['fifo', 'lifo', 'weighted_average', 'specific_identification'];
    const mockValuations: InventoryValuation[] = this.products().map((product, idx) => {
      const method = methods[idx % methods.length];
      const totalQty = Math.floor(Math.random() * 500) + 50;
      const baseCost = 10 + Math.random() * 100;

      // Generate cost layers
      const costLayers: CostLayer[] = [];
      let remainingQty = totalQty;
      let totalValue = 0;

      for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
        const layerQty = Math.floor(remainingQty / (3 - i)) || remainingQty;
        const unitCost = baseCost + (Math.random() * 20 - 10);
        const layerValue = layerQty * unitCost;

        costLayers.push({
          id: `layer-${product.id}-${i}`,
          purchaseDate: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)),
          quantity: layerQty,
          unitCost: Math.round(unitCost * 100) / 100,
          totalCost: Math.round(layerValue * 100) / 100,
          remainingQuantity: layerQty,
          batchNumber: `BATCH-${2024}-${String(i + 1).padStart(3, '0')}`
        });

        totalValue += layerValue;
        remainingQty -= layerQty;
        if (remainingQty <= 0) break;
      }

      const avgCost = totalValue / totalQty;
      const cogs = totalQty * avgCost * 0.6; // Assume 60% sold
      const turnoverRatio = 4 + Math.random() * 8;

      // Calculate variance
      const previousValue = totalValue * (0.9 + Math.random() * 0.2);
      const variance = totalValue - previousValue;
      const variancePercentage = (variance / previousValue) * 100;

      return {
        id: `val-${product.id}`,
        product,
        currentMethod: method,
        totalQuantity: totalQty,
        totalValue: Math.round(totalValue * 100) / 100,
        avgUnitCost: Math.round(avgCost * 100) / 100,
        costLayers,
        cogs: Math.round(cogs * 100) / 100,
        turnoverRatio: Math.round(turnoverRatio * 100) / 100,
        daysInInventory: Math.round(365 / turnoverRatio),
        lastValuationDate: new Date(),
        status: 'active',
        variance: Math.round(variance * 100) / 100,
        variancePercentage: Math.round(variancePercentage * 100) / 100
      };
    });

    this.valuations.set(mockValuations);
  }

  // Computed
  filteredValuations = computed(() => {
    let result = this.valuations();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(v => 
        v.product.name.toLowerCase().includes(query) ||
        v.product.sku.toLowerCase().includes(query) ||
        v.product.supplier.toLowerCase().includes(query)
      );
    }

    if (this.filterCategory()) {
      result = result.filter(v => v.product.category === this.filterCategory());
    }
    if (this.filterMethod()) {
      result = result.filter(v => v.currentMethod === this.filterMethod());
    }
    if (this.filterStatus()) {
      result = result.filter(v => v.status === this.filterStatus());
    }

    return result.sort((a, b) => b.totalValue - a.totalValue);
  });

  summary = computed((): ValuationSummary => {
    const valuations = this.valuations();
    const totalValue = valuations.reduce((sum, v) => sum + v.totalValue, 0);
    const totalCOGS = valuations.reduce((sum, v) => sum + v.cogs, 0);
    const totalTurnover = valuations.reduce((sum, v) => sum + v.turnoverRatio, 0);

    const methodBreakdown: Record<ValuationMethod, number> = {
      fifo: 0,
      lifo: 0,
      weighted_average: 0,
      specific_identification: 0
    };

    valuations.forEach(v => {
      methodBreakdown[v.currentMethod] += v.totalValue;
    });

    return {
      totalInventoryValue: Math.round(totalValue * 100) / 100,
      totalCOGS: Math.round(totalCOGS * 100) / 100,
      grossMargin: Math.round(((totalValue - totalCOGS) / totalValue) * 10000) / 100,
      inventoryTurnover: Math.round((totalTurnover / valuations.length) * 100) / 100,
      avgDaysInInventory: Math.round(365 / (totalTurnover / valuations.length)),
      methodBreakdown
    };
  });

  stats = computed(() => {
    const valuations = this.valuations();
    return {
      totalProducts: valuations.length,
      fifoCount: valuations.filter(v => v.currentMethod === 'fifo').length,
      lifoCount: valuations.filter(v => v.currentMethod === 'lifo').length,
      weightedCount: valuations.filter(v => v.currentMethod === 'weighted_average').length,
      specificCount: valuations.filter(v => v.currentMethod === 'specific_identification').length,
      highValue: valuations.filter(v => v.totalValue > 10000).length,
      increasing: valuations.filter(v => v.variance && v.variance > 0).length
    };
  });

  // Methods
  viewValuationDetail(valuation: InventoryValuation) {
    this.selectedValuation.set(valuation);
    this.activeView.set('detail');
  }

  goToList() {
    this.activeView.set('list');
    this.selectedValuation.set(null);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.filterCategory.set('');
    this.filterMethod.set('');
    this.filterStatus.set('');
    this.filterForm.reset();
  }

  applyQuickFilter(filter: string) {
    this.clearFilters();
    if (filter === 'fifo') {
      this.filterMethod.set('fifo');
    } else if (filter === 'lifo') {
      this.filterMethod.set('lifo');
    } else if (filter === 'weighted') {
      this.filterMethod.set('weighted_average');
    } else if (filter === 'high-value') {
      // Sort by value in computed
    } else if (filter === 'increasing') {
      // Filter by positive variance
    }
  }

  getMethodConfig(method: ValuationMethod): ValuationMethodConfig {
    return this.valuationMethods.find(m => m.method === method) || this.valuationMethods[0];
  }

  getMethodName(method: ValuationMethod): string {
    const config = this.getMethodConfig(method);
    return config.name;
  }

  getMethodColor(method: ValuationMethod): string {
    const config = this.getMethodConfig(method);
    return config.color;
  }

  getVarianceColor(variance: number): string {
    if (variance > 0) return 'text-green-600 bg-green-100';
    if (variance < 0) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  }

  getVarianceIcon(variance: number): string {
    if (variance > 0) return 'bi-arrow-up-right';
    if (variance < 0) return 'bi-arrow-down-right';
    return 'bi-dash';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  }

  calculateCOGS(valuation: InventoryValuation, unitsSold: number): number {
    let cogs = 0;
    let remainingUnits = unitsSold;

    if (valuation.currentMethod === 'fifo') {
      // FIFO: Use oldest layers first
      for (const layer of [...valuation.costLayers].reverse()) {
        if (remainingUnits <= 0) break;
        const unitsFromLayer = Math.min(remainingUnits, layer.remainingQuantity);
        cogs += unitsFromLayer * layer.unitCost;
        remainingUnits -= unitsFromLayer;
      }
    } else if (valuation.currentMethod === 'lifo') {
      // LIFO: Use newest layers first
      for (const layer of valuation.costLayers) {
        if (remainingUnits <= 0) break;
        const unitsFromLayer = Math.min(remainingUnits, layer.remainingQuantity);
        cogs += unitsFromLayer * layer.unitCost;
        remainingUnits -= unitsFromLayer;
      }
    } else {
      // Weighted Average or Specific ID
      cogs = unitsSold * valuation.avgUnitCost;
    }

    return Math.round(cogs * 100) / 100;
  }

  compareMethods() {
    this.showMethodComparison.set(true);
  }

  changeMethod() {
    this.showMethodModal.set(true);
  }

  confirmMethodChange() {
    if (this.methodForm.invalid) return;
    // Logic to change valuation method
    this.showMethodModal.set(false);
    this.methodForm.reset();
  }

  adjustValuation() {
    this.showAdjustModal.set(true);
  }

  confirmAdjustment() {
    if (this.adjustForm.invalid) return;
    // Logic to adjust valuation
    this.showAdjustModal.set(false);
    this.adjustForm.reset();
  }

  exportValuations() {
    this.showExportModal.set(true);
  }

  confirmExport() {
    this.showExportModal.set(false);
  }

  recalculateValuations() {
    this.showRecalculateModal.set(true);
  }

  confirmRecalculate() {
    this.generateMockValuations();
    this.showRecalculateModal.set(false);
  }

  protected readonly Math = Math;
}