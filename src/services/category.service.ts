import api from '@/lib/axios';

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/category');
    return response.data;
  }
};