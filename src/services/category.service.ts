import api from '@/lib/axios';
import { Category } from '@/types/comic';

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/category');
    return response.data;
  },
  create: async (name: string, description?: string) => {
    return await api.post('/category', { name, description });
  },

  // Cập nhật
  update: async (id: number, name: string, description?: string) => {
    return await api.put(`/category/${id}`, { id, name, description });
  },

  // Xóa
  delete: async (id: number) => {
    return await api.delete(`/category/${id}`);
  }
};