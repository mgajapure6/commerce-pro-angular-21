import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownItem } from './../../../shared/components/dropdown/dropdown';

interface TimelineEvent {
  id: string;
  type: 'order_placed' | 'payment_confirmed' | 'inventory_reserved' | 'picked' | 'packed' | 'shipped' | 
        'in_transit' | 'out_for_delivery' | 'delivered' | 'return_initiated' | 'return_received' | 
        'refund_processed' | 'note_added' | 'status_changed' | 'customer_contacted';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  userAvatar?: string;
  metadata?: Record<string, any>;
  icon: string;
  color: string;
}

interface InventoryUpdate {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  image: string;
  action: 'reserved' | 'released' | 'picked' | 'restocked' | 'adjusted';
  quantity: number;
  warehouse: string;
  location: string;
  timestamp: Date;
  user: string;
}

interface FulfillmentStage {
  stage: 'pick' | 'pack' | 'ship';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  assignedTo?: string;
  items: {
    productId: string;
    name: string;
    image: string;
    quantity: number;
    picked?: number;
    packed?: number;
    location: string;
  }[];
  notes?: string;
}

interface Shipment {
  id: string;
  carrier: string;
  service: string;
  trackingNumber: string;
  trackingUrl: string;
  status: 'label_created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  estimatedDelivery: Date;
  actualDelivery?: Date;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  cost: number;
  labelUrl?: string;
  events: {
    timestamp: Date;
    status: string;
    location: string;
    description: string;
  }[];
}

interface ReturnRequest {
  id: string;
  returnNumber: string;
  status: 'requested' | 'approved' | 'received' | 'inspecting' | 'refunded' | 'rejected';
  items: {
    productId: string;
    name: string;
    image: string;
    quantity: number;
    reason: string;
    condition: string;
  }[];
  refundAmount: number;
  returnMethod: 'refund' | 'exchange' | 'store_credit';
  shippingLabel?: string;
  trackingNumber?: string;
  requestedAt: Date;
  resolvedAt?: Date;
}

interface OrderActivity {
  id: string;
  type: 'email_sent' | 'sms_sent' | 'call_made' | 'note_added' | 'status_update' | 'payment_update';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  userAvatar?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    type: 'new' | 'returning' | 'vip';
    addresses: {
      shipping: {
        name: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
      billing: {
        name: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
    };
  };
  items: {
    productId: string;
    name: string;
    sku: string;
    image: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  financials: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
  timeline: TimelineEvent[];
  inventoryUpdates: InventoryUpdate[];
  fulfillment: FulfillmentStage[];
  shipments: Shipment[];
  returns: ReturnRequest[];
  activities: OrderActivity[];
  notes: {
    id: string;
    content: string;
    timestamp: Date;
    user: string;
    isInternal: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Dropdown],
  templateUrl: './order-details.html'
})
export class OrderDetails implements OnInit {
  activeTab = signal<'overview' | 'timeline' | 'inventory' | 'fulfillment' | 'logistics' | 'returns' | 'activity'>('overview');
  showAddNote = signal(false);
  newNote = signal('');
  noteIsInternal = signal(true);
  
  order = signal<Order | null>(null);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.loadOrder();
  }

  loadOrder() {
    // Mock data - replace with API call
    this.order.set({
      id: 'ord_001',
      orderNumber: 'ORD-2024-001',
      status: 'shipped',
      paymentStatus: 'paid',
      customer: {
        id: 'cust_001',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '+1 (555) 123-4567',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        type: 'vip',
        addresses: {
          shipping: {
            name: 'Sarah Johnson',
            line1: '123 Main Street',
            line2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA'
          },
          billing: {
            name: 'Sarah Johnson',
            line1: '123 Main Street',
            line2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA'
          }
        }
      },
      items: [
        {
          productId: 'prod_001',
          name: 'Wireless Headphones Pro',
          sku: 'WHP-001-BLK',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
          quantity: 1,
          price: 299.99,
          total: 299.99
        },
        {
          productId: 'prod_002',
          name: 'USB-C Cable 2m',
          sku: 'USB-2M-WHT',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop',
          quantity: 2,
          price: 19.99,
          total: 39.98
        }
      ],
      financials: {
        subtotal: 339.97,
        shipping: 15.00,
        tax: 34.00,
        discount: 20.00,
        total: 368.97,
        currency: 'USD'
      },
      timeline: [
        {
          id: 'evt_001',
          type: 'order_placed',
          title: 'Order Placed',
          description: 'Customer placed order via website',
          timestamp: new Date('2024-01-15T10:30:00'),
          icon: 'cart-check',
          color: 'bg-blue-500'
        },
        {
          id: 'evt_002',
          type: 'payment_confirmed',
          title: 'Payment Confirmed',
          description: 'Payment of $368.97 confirmed via Stripe',
          timestamp: new Date('2024-01-15T10:31:00'),
          icon: 'credit-card',
          color: 'bg-green-500'
        },
        {
          id: 'evt_003',
          type: 'inventory_reserved',
          title: 'Inventory Reserved',
          description: '2 items reserved at Warehouse A',
          timestamp: new Date('2024-01-15T10:35:00'),
          user: 'System',
          icon: 'box-seam',
          color: 'bg-indigo-500'
        },
        {
          id: 'evt_004',
          type: 'picked',
          title: 'Picking Started',
          description: 'Order assigned to picker #42',
          timestamp: new Date('2024-01-15T14:00:00'),
          user: 'Mike Warehouse',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          icon: 'basket',
          color: 'bg-orange-500'
        },
        {
          id: 'evt_005',
          type: 'packed',
          title: 'Order Packed',
          description: 'Items packed in box #BOX-789. Weight: 1.2kg',
          timestamp: new Date('2024-01-15T16:30:00'),
          user: 'Lisa Packing',
          userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          icon: 'box',
          color: 'bg-purple-500'
        },
        {
          id: 'evt_006',
          type: 'shipped',
          title: 'Shipped',
          description: 'Handed to FedEx. Tracking: TRK123456789',
          timestamp: new Date('2024-01-15T18:00:00'),
          user: 'Shipping Dept',
          icon: 'truck',
          color: 'bg-cyan-500'
        },
        {
          id: 'evt_007',
          type: 'in_transit',
          title: 'In Transit',
          description: 'Package departed Memphis hub',
          timestamp: new Date('2024-01-16T02:30:00'),
          icon: 'geo-alt',
          color: 'bg-blue-400'
        }
      ],
      inventoryUpdates: [
        {
          id: 'inv_001',
          productId: 'prod_001',
          productName: 'Wireless Headphones Pro',
          sku: 'WHP-001-BLK',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
          action: 'reserved',
          quantity: 1,
          warehouse: 'Warehouse A',
          location: 'A-12-34',
          timestamp: new Date('2024-01-15T10:35:00'),
          user: 'System'
        },
        {
          id: 'inv_002',
          productId: 'prod_002',
          productName: 'USB-C Cable 2m',
          sku: 'USB-2M-WHT',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop',
          action: 'reserved',
          quantity: 2,
          warehouse: 'Warehouse A',
          location: 'B-05-12',
          timestamp: new Date('2024-01-15T10:35:00'),
          user: 'System'
        },
        {
          id: 'inv_003',
          productId: 'prod_001',
          productName: 'Wireless Headphones Pro',
          sku: 'WHP-001-BLK',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
          action: 'picked',
          quantity: 1,
          warehouse: 'Warehouse A',
          location: 'A-12-34',
          timestamp: new Date('2024-01-15T14:15:00'),
          user: 'Mike Warehouse'
        },
        {
          id: 'inv_004',
          productId: 'prod_002',
          productName: 'USB-C Cable 2m',
          sku: 'USB-2M-WHT',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop',
          action: 'picked',
          quantity: 2,
          warehouse: 'Warehouse A',
          location: 'B-05-12',
          timestamp: new Date('2024-01-15T14:20:00'),
          user: 'Mike Warehouse'
        }
      ],
      fulfillment: [
        {
          stage: 'pick',
          status: 'completed',
          startedAt: new Date('2024-01-15T14:00:00'),
          completedAt: new Date('2024-01-15T14:25:00'),
          assignedTo: 'Mike Warehouse',
          items: [
            {
              productId: 'prod_001',
              name: 'Wireless Headphones Pro',
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
              quantity: 1,
              picked: 1,
              location: 'A-12-34'
            },
            {
              productId: 'prod_002',
              name: 'USB-C Cable 2m',
              image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop',
              quantity: 2,
              picked: 2,
              location: 'B-05-12'
            }
          ],
          notes: 'Picked without issues'
        },
        {
          stage: 'pack',
          status: 'completed',
          startedAt: new Date('2024-01-15T16:15:00'),
          completedAt: new Date('2024-01-15T16:30:00'),
          assignedTo: 'Lisa Packing',
          items: [
            {
              productId: 'prod_001',
              name: 'Wireless Headphones Pro',
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
              quantity: 1,
              packed: 1,
              location: 'PACK-STATION-1'
            },
            {
              productId: 'prod_002',
              name: 'USB-C Cable 2m',
              image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop',
              quantity: 2,
              packed: 2,
              location: 'PACK-STATION-1'
            }
          ],
          notes: 'Packed in BOX-789 with bubble wrap'
        },
        {
          stage: 'ship',
          status: 'completed',
          startedAt: new Date('2024-01-15T17:45:00'),
          completedAt: new Date('2024-01-15T18:00:00'),
          assignedTo: 'Shipping Dept',
          items: [
            {
              productId: 'prod_001',
              name: 'Wireless Headphones Pro',
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
              quantity: 1,
              location: 'DOCK-3'
            },
            {
              productId: 'prod_002',
              name: 'USB-C Cable 2m',
              image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop',
              quantity: 2,
              location: 'DOCK-3'
            }
          ],
          notes: 'FedEx pickup completed'
        }
      ],
      shipments: [
        {
          id: 'ship_001',
          carrier: 'FedEx',
          service: 'Express Saver',
          trackingNumber: 'TRK123456789',
          trackingUrl: 'https://www.fedex.com/apps/fedextrack/?tracknumbers=TRK123456789',
          status: 'in_transit',
          estimatedDelivery: new Date('2024-01-18'),
          weight: 1.2,
          dimensions: { length: 12, width: 8, height: 6 },
          cost: 15.00,
          labelUrl: 'https://example.com/label/123',
          events: [
            {
              timestamp: new Date('2024-01-15T18:00:00'),
              status: 'Picked up',
              location: 'New York, NY',
              description: 'Shipment picked up from sender'
            },
            {
              timestamp: new Date('2024-01-16T02:30:00'),
              status: 'Departed facility',
              location: 'Memphis, TN',
              description: 'Package departed Memphis hub'
            },
            {
              timestamp: new Date('2024-01-17T08:15:00'),
              status: 'In transit',
              location: 'Indianapolis, IN',
              description: 'Package in transit to destination'
            }
          ]
        }
      ],
      returns: [],
      activities: [
        {
          id: 'act_001',
          type: 'email_sent',
          title: 'Order Confirmation Email',
          description: 'Sent to sarah.j@example.com',
          timestamp: new Date('2024-01-15T10:31:00'),
          user: 'System'
        },
        {
          id: 'act_002',
          type: 'email_sent',
          title: 'Shipping Confirmation',
          description: 'Tracking info sent to customer',
          timestamp: new Date('2024-01-15T18:05:00'),
          user: 'System'
        }
      ],
      notes: [
        {
          id: 'note_001',
          content: 'VIP customer - ensure priority handling',
          timestamp: new Date('2024-01-15T10:35:00'),
          user: 'Support Team',
          isInternal: true
        }
      ],
      createdAt: new Date('2024-01-15T10:30:00'),
      updatedAt: new Date('2024-01-17T08:15:00')
    });
  }

  // Computed
  orderStatusColor = computed(() => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-cyan-100 text-cyan-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[this.order()?.status || 'pending'];
  });

  paymentStatusColor = computed(() => {
    const colors: Record<string, string> = {
      paid: 'text-green-600',
      pending: 'text-yellow-600',
      failed: 'text-red-600',
      refunded: 'text-gray-600'
    };
    return colors[this.order()?.paymentStatus || 'pending'];
  });

  progressPercentage = computed(() => {
    const stages = ['order_placed', 'payment_confirmed', 'inventory_reserved', 'picked', 'packed', 'shipped', 'delivered'];
    const completedStages = this.order()?.timeline.filter(t => stages.includes(t.type)) || [];
    const lastStage = completedStages[completedStages.length - 1]?.type;
    const index = stages.indexOf(lastStage);
    return Math.round(((index + 1) / stages.length) * 100);
  });

  // Methods
  setActiveTab(tab: 'overview' | 'timeline' | 'inventory' | 'fulfillment' | 'logistics' | 'returns' | 'activity' | any) {
    this.activeTab.set(tab);
  }

  addNote() {
    if (!this.newNote().trim()) return;
    
    const note = {
      id: `note_${Date.now()}`,
      content: this.newNote(),
      timestamp: new Date(),
      user: 'Current User',
      isInternal: this.noteIsInternal()
    };
    
    this.order.update(o => {
      if (!o) return o;
      return { ...o, notes: [note, ...o.notes] };
    });
    
    this.newNote.set('');
    this.showAddNote.set(false);
  }

  getTimelineIcon(type: string): string {
    const icons: Record<string, string> = {
      order_placed: 'cart-check',
      payment_confirmed: 'credit-card',
      inventory_reserved: 'box-seam',
      picked: 'basket',
      packed: 'box',
      shipped: 'truck',
      in_transit: 'geo-alt',
      out_for_delivery: 'box-arrow-in-down',
      delivered: 'check-circle',
      return_initiated: 'arrow-return-left',
      return_received: 'inbox',
      refund_processed: 'cash-coin',
      note_added: 'sticky',
      status_changed: 'arrow-repeat',
      customer_contacted: 'envelope'
    };
    return icons[type] || 'circle';
  }

  getInventoryActionColor(action: string): string {
    const colors: Record<string, string> = {
      reserved: 'bg-blue-100 text-blue-700',
      released: 'bg-orange-100 text-orange-700',
      picked: 'bg-green-100 text-green-700',
      restocked: 'bg-purple-100 text-purple-700',
      adjusted: 'bg-yellow-100 text-yellow-700'
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  }

  getFulfillmentStageColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-600',
      in_progress: 'bg-blue-100 text-blue-600',
      completed: 'bg-green-100 text-green-600',
      failed: 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  }

  getShipmentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      label_created: 'bg-gray-100 text-gray-600',
      picked_up: 'bg-blue-100 text-blue-600',
      in_transit: 'bg-indigo-100 text-indigo-600',
      out_for_delivery: 'bg-orange-100 text-orange-600',
      delivered: 'bg-green-100 text-green-600',
      exception: 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return this.formatDate(date);
  }

  printInvoice() {
    console.log('Printing invoice for order:', this.order()?.orderNumber);
  }

  sendEmail() {
    console.log('Sending email to customer:', this.order()?.customer.email);
  }

  cancelOrder() {
    console.log('Cancelling order:', this.order()?.orderNumber);
  }
}