import api from '@/lib/axios';
import { User } from '@/types/user';

export const userService = {
  // Lấy danh sách user (Admin)
  getAll: async () => {
    const response = await api.get<User[]>('/user');
    return response.data;
  },

  // Khóa tài khoản
  ban: async (id: number) => {
    return await api.post(`/user/${id}/ban`);
  },

  // Mở khóa
  unban: async (id: number) => {
    return await api.post(`/user/${id}/unban`);
  },

  // Nâng VIP
  upgradeVip: async (id: number) => {
    return await api.post(`/user/${id}/upgrade-vip`);
  },

  // Hủy VIP
  downgradeVip: async (id: number) => {
    return await api.post(`/user/${id}/downgrade-vip`);
  }
};