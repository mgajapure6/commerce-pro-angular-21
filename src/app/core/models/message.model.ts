export interface Message {
  id: string;
  sender: string;
  senderAvatar: string;
  subject: string;
  preview: string;
  timestamp: Date;
  type: 'customer' | 'supplier';
  read: boolean;
}