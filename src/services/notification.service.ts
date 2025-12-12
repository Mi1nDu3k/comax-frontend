import api from '@/lib/axios';
import { Notification } from '@/types/notification';

export const notificationService = {
  getAll: async (page = 1, pageSize = 20) => {
    // Nếu chưa có API backend thì trả về mảng rỗng để không bị lỗi
    try {
        const response = await api.get<Notification[]>('/notifications', { params: { page, pageSize } });
        return response.data;
    } catch {
        return [];
    }
  },
  markAsRead: async (id: number) => {
    return await api.put(`/notifications/${id}/read`);
  },
  markAllRead: async () => {
    return await api.put(`/notifications/read-all`);
  },
  delete: async (id: number) => {
    return await api.delete(`/notifications/${id}`);
  }
};