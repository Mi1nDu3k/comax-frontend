export interface Notification {
    id: number;
    userId: number;
    message: string;
    url: string;
    isRead: boolean;
    createdAt: string;
}