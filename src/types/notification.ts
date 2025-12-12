export interface Notification {
  id: number;
  userId: number;
  message: string;
  link?: string; 
  isRead: boolean;
  createdAt: string;
  type?: number; 
}