// src/app/features/products/components/warehouse/warehouse-management.component.ts
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  address: string;
  manager: string;
  contact: string;
  isActive: boolean;
  capacity: number;
  usedSpace: number;
  zones: Zone[];
  createdAt: Date;
  updatedAt: Date;
}

interface Zone {
  id: string;
  name: string;
  type: 'receiving' | 'storage' | 'picking' | 'shipping' | 'returns' | 'quarantine';
  aisles: Aisle[];
}

interface Aisle {
  id: string;
  name: string;
  racks: Rack[];
}

interface Rack {
  id: string;
  name: string;
  bins: Bin[];
}

interface Bin {
  id: string;
  code: string;
  capacity: number;
  used: number;
  status: 'empty' | 'partial' | 'full' | 'reserved' | 'blocked';
}

interface WarehouseStats {
  totalProducts: number;
  totalValue: number;
  inboundToday: number;
  outboundToday: number;
  utilizationRate: number;
}

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './warehouses.html',
  styleUrl: './warehouses.scss'
})
export class Warehouses {
  // View state
  showWarehouseModal = signal(false);
  showZoneModal = signal(false);
  showBinModal = signal(false);
  showDeleteConfirm = signal(false);
  activeTab = signal<'overview' | 'layout' | 'activity'>('overview');
  selectedWarehouse = signal<Warehouse | null>(null);
  expandedZones = signal<string[]>([]);

  // Filters
  searchQuery = signal('');
  filterStatus = signal<'all' | 'active' | 'inactive'>('all');
  filterUtilization = signal<'all' | 'high' | 'medium' | 'low'>('all');

  // Forms
  warehouseForm: FormGroup;
  zoneForm: FormGroup;

  // Data
  warehouseList = signal<Warehouse[]>([
    {
      id: '1',
      name: 'Main Distribution Center',
      code: 'WH-NYC-001',
      location: 'New York, NY',
      address: '450 Industrial Blvd, Brooklyn, NY 11222',
      manager: 'Sarah Johnson',
      contact: '+1 (555) 123-4567',
      isActive: true,
      capacity: 50000,
      usedSpace: 38500,
      zones: [
        {
          id: 'z1',
          name: 'Receiving Zone A',
          type: 'receiving',
          aisles: [
            {
              id: 'a1',
              name: 'Aisle R-01',
              racks: [
                { id: 'r1', name: 'Rack 1', bins: this.generateBins('R-01-01', 10) },
                { id: 'r2', name: 'Rack 2', bins: this.generateBins('R-01-02', 10) }
              ]
            }
          ]
        },
        {
          id: 'z2',
          name: 'Storage Zone B',
          type: 'storage',
          aisles: [
            {
              id: 'a2',
              name: 'Aisle S-01',
              racks: [
                { id: 'r3', name: 'Rack 1', bins: this.generateBins('S-01-01', 20) },
                { id: 'r4', name: 'Rack 2', bins: this.generateBins('S-01-02', 20) }
              ]
            }
          ]
        },
        {
          id: 'z3',
          name: 'Shipping Zone C',
          type: 'shipping',
          aisles: []
        }
      ],
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-02-20')
    },
    {
      id: '2',
      name: 'West Coast Hub',
      code: 'WH-LA-002',
      location: 'Los Angeles, CA',
      address: '2200 Commerce Way, Commerce, CA 90040',
      manager: 'Michael Chen',
      contact: '+1 (555) 987-6543',
      isActive: true,
      capacity: 35000,
      usedSpace: 28000,
      zones: [
        {
          id: 'z4',
          name: 'Main Storage',
          type: 'storage',
          aisles: [
            {
              id: 'a3',
              name: 'Aisle M-01',
              racks: [
                { id: 'r5', name: 'Rack 1', bins: this.generateBins('M-01-01', 15) }
              ]
            }
          ]
        }
      ],
      createdAt: new Date('2023-06-20'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: '3',
      name: 'South Distribution',
      code: 'WH-DAL-003',
      location: 'Dallas, TX',
      address: '8900 Logistics Pkwy, Dallas, TX 75235',
      manager: 'Emily Rodriguez',
      contact: '+1 (555) 456-7890',
      isActive: true,
      capacity: 42000,
      usedSpace: 15000,
      zones: [
        {
          id: 'z5',
          name: 'Storage East',
          type: 'storage',
          aisles: []
        }
      ],
      createdAt: new Date('2023-09-10'),
      updatedAt: new Date('2024-02-18')
    },
    {
      id: '4',
      name: 'Chicago Facility',
      code: 'WH-CHI-004',
      location: 'Chicago, IL',
      address: '3400 Industrial Dr, Chicago, IL 60608',
      manager: 'David Park',
      contact: '+1 (555) 234-5678',
      isActive: false,
      capacity: 28000,
      usedSpace: 0,
      zones: [],
      createdAt: new Date('2023-03-05'),
      updatedAt: new Date('2024-01-10')
    }
  ]);

  recentActivity = signal([
    { id: '1', type: 'inbound', description: 'Received 500 units of WBH-PM-001', warehouse: 'Main Distribution Center', time: '2 hours ago', user: 'John Smith' },
    { id: '2', type: 'transfer', description: 'Transferred 200 units to West Coast Hub', warehouse: 'Main Distribution Center', time: '4 hours ago', user: 'Sarah Johnson' },
    { id: '3', type: 'outbound', description: 'Shipped 150 units order #SO-4521', warehouse: 'West Coast Hub', time: '5 hours ago', user: 'Mike Chen' },
    { id: '4', type: 'adjustment', description: 'Stock count adjustment - Zone B', warehouse: 'South Distribution', time: '1 day ago', user: 'Emily Rodriguez' }
  ]);

  // Computed
  filteredWarehouses = computed(() => {
    let result = this.warehouseList();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(w =>
        w.name.toLowerCase().includes(query) ||
        w.code.toLowerCase().includes(query) ||
        w.location.toLowerCase().includes(query) ||
        w.manager.toLowerCase().includes(query)
      );
    }

    if (this.filterStatus() !== 'all') {
      result = result.filter(w => w.isActive === (this.filterStatus() === 'active'));
    }

    if (this.filterUtilization() !== 'all') {
      result = result.filter(w => {
        const rate = (w.usedSpace / w.capacity) * 100;
        switch (this.filterUtilization()) {
          case 'high': return rate > 80;
          case 'medium': return rate >= 50 && rate <= 80;
          case 'low': return rate < 50;
          default: return true;
        }
      });
    }

    return result;
  });

  activeWarehouses = computed(() => this.warehouseList().filter(w => w.isActive).length);

  totalCapacity = computed(() => this.warehouseList().reduce((sum, w) => sum + w.capacity, 0));

  totalUsedSpace = computed(() => this.warehouseList().reduce((sum, w) => sum + w.usedSpace, 0));

  overallUtilization = computed(() =>
    this.totalCapacity() > 0 ? (this.totalUsedSpace() / this.totalCapacity()) * 100 : 0
  );

  totalZones = computed(() =>
    this.warehouseList().reduce((sum, w) => sum + w.zones.length, 0)
  );

  constructor(private fb: FormBuilder) {
    this.warehouseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}-[A-Z]{3}-\d{3}$/)]],
      location: ['', Validators.required],
      address: ['', Validators.required],
      manager: ['', Validators.required],
      contact: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1000)]]
    });

    this.zoneForm = this.fb.group({
      name: ['', Validators.required],
      type: ['storage', Validators.required]
    });
  }

  private generateBins(prefix: string, count: number): Bin[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `bin-${prefix}-${i + 1}`,
      code: `${prefix}-${String(i + 1).padStart(2, '0')}`,
      capacity: 100,
      used: Math.floor(Math.random() * 100),
      status: Math.random() > 0.7 ? 'full' : Math.random() > 0.4 ? 'partial' : 'empty'
    }));
  }

  getAisleBinCount(aisle: Aisle): number {
    return aisle.racks.reduce((sum, rack) => sum + rack.bins.length, 0);
  }

  getZoneCount(warehouse: Warehouse) {
    return warehouse.zones.reduce((sum, z) => sum +
      z.aisles.reduce((aSum, a) => aSum + a.racks.reduce((rSum, r) => rSum +
        r.bins.length, 0), 0), 0)
  }

  getRecentFilteredActivity(wh: Warehouse){
    return this.recentActivity().filter(a => a.warehouse === wh.name);
  }

  // Methods
  openWarehouseModal(warehouse?: Warehouse) {
    if (warehouse) {
      this.selectedWarehouse.set(warehouse);
      this.warehouseForm.patchValue({
        name: warehouse.name,
        code: warehouse.code,
        location: warehouse.location,
        address: warehouse.address,
        manager: warehouse.manager,
        contact: warehouse.contact,
        capacity: warehouse.capacity
      });
    } else {
      this.selectedWarehouse.set(null);
      this.warehouseForm.reset();
    }
    this.showWarehouseModal.set(true);
  }

  closeWarehouseModal() {
    this.showWarehouseModal.set(false);
    this.selectedWarehouse.set(null);
    this.warehouseForm.reset();
  }

  saveWarehouse() {
    if (this.warehouseForm.invalid) return;

    const formValue = this.warehouseForm.value;
    const existing = this.selectedWarehouse();

    if (existing) {
      this.warehouseList.update(list => list.map(w =>
        w.id === existing.id ? {
          ...w,
          ...formValue,
          updatedAt: new Date()
        } : w
      ));
    } else {
      const newWarehouse: Warehouse = {
        id: `wh-${Date.now()}`,
        ...formValue,
        isActive: true,
        usedSpace: 0,
        zones: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.warehouseList.update(list => [...list, newWarehouse]);
    }

    this.closeWarehouseModal();
  }

  toggleWarehouseStatus(warehouse: Warehouse) {
    this.warehouseList.update(list => list.map(w =>
      w.id === warehouse.id ? { ...w, isActive: !w.isActive, updatedAt: new Date() } : w
    ));
  }

  confirmDelete(warehouse: Warehouse) {
    this.selectedWarehouse.set(warehouse);
    this.showDeleteConfirm.set(true);
  }

  deleteWarehouse() {
    const id = this.selectedWarehouse()?.id;
    if (id) {
      this.warehouseList.update(list => list.filter(w => w.id !== id));
    }
    this.showDeleteConfirm.set(false);
    this.selectedWarehouse.set(null);
  }

  toggleZone(zoneId: string) {
    this.expandedZones.update(list =>
      list.includes(zoneId)
        ? list.filter(id => id !== zoneId)
        : [...list, zoneId]
    );
  }

  isZoneExpanded(zoneId: string): boolean {
    return this.expandedZones().includes(zoneId);
  }

  getZoneTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'receiving': 'bi-box-arrow-in-down',
      'storage': 'bi-box-seam',
      'picking': 'bi-hand-index-thumb',
      'shipping': 'bi-box-arrow-up',
      'returns': 'bi-arrow-counterclockwise',
      'quarantine': 'bi-shield-exclamation'
    };
    return icons[type] || 'bi-box';
  }

  getZoneTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'receiving': 'bg-blue-100 text-blue-700',
      'storage': 'bg-green-100 text-green-700',
      'picking': 'bg-yellow-100 text-yellow-700',
      'shipping': 'bg-purple-100 text-purple-700',
      'returns': 'bg-orange-100 text-orange-700',
      'quarantine': 'bg-red-100 text-red-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  }

  getUtilizationColor(rate: number): string {
    if (rate > 90) return 'text-red-600';
    if (rate > 75) return 'text-yellow-600';
    return 'text-green-600';
  }

  getUtilizationBg(rate: number): string {
    if (rate > 90) return 'bg-red-500';
    if (rate > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getBinStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'empty': 'bg-gray-200',
      'partial': 'bg-blue-400',
      'full': 'bg-green-500',
      'reserved': 'bg-yellow-400',
      'blocked': 'bg-red-400'
    };
    return colors[status] || 'bg-gray-200';
  }

  selectWarehouse(warehouse: Warehouse) {
    this.selectedWarehouse.set(warehouse);
    this.activeTab.set('layout');
  }

  clearSelection() {
    this.selectedWarehouse.set(null);
    this.activeTab.set('overview');
  }

  protected readonly Math = Math;
}