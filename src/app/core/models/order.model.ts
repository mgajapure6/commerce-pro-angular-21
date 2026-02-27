export interface Order {
  id: string;
  customerName: string;
  customerAvatar?: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  date: Date;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}