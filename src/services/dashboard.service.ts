import api from '@/lib/axios';
import { DashboardStats } from '@/types/dashboard';

export const dashboardService = {
  getStats: async () => {
    // Gọi vào: GET /api/report/dashboard
    const response = await api.get<DashboardStats>('/report/dashboard');
    return response.data;
  }
};