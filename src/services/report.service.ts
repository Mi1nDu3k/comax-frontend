import api from '@/lib/axios';
import { Comic } from '@/types/comic';

export const reportService = {
  // [HttpGet("top-comics")]
  getTopComics: async (type: 'view' | 'rating' = 'view', top: number = 10) => {
    const response = await api.get<Comic[]>('/report/top-comics', {
      params: { type, top }
    });
    return response.data;
  },

  // [HttpGet("dashboard")] - Dành cho Admin sau này
  getDashboardStats: async () => {
    const response = await api.get('/report/dashboard');
    return response.data;
  }
};