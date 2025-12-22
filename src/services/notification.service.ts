import api from '@/lib/axios';
import { Notification } from '@/types/notification';

export const notificationService = {
  getAll: async (page = 1, pageSize = 5) => {
    const response = await api.get(`/notification?page=${page}&pageSize=${pageSize}`);
    // Nếu backend trả về { data: [], totalCount: ... } thì return response.data.data
    // Nếu backend trả về [] thì return response.data
    return response.data.data || response.data; 
},
  markAsRead: async (id: number) => {
    return await api.put(`/notification/${id}/read`);
  },
  markAllRead: async () => {
    return await api.put(`/notification/read-all`);
  },
  delete: async (id: number) => {
    return await api.delete(`/notification/${id}`);
  }
};