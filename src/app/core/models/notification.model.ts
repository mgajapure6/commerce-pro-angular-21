export interface Notification {
  id: string;
  type: 'order' | 'stock' | 'shipped' | 'review';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}