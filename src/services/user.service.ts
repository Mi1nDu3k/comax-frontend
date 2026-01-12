import api from '@/lib/axios';
import { User } from '@/types/user';
import { ReadingHistoryItem } from '@/types/history';

// Định nghĩa kiểu trả về từ Backend (ServiceResponse)
interface ServiceResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

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
  },

  // Lấy profile
  getProfile: async () => {
    const res = await api.get<User>('/user/profile');
    return res.data;
  },

  // Update thông tin (Mới)
 updateProfile: async (username: string, email: string, avatarFile?: File) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    if (avatarFile) {
      formData.append('avatarFile', avatarFile);
    }

    const response = await api.put('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getReadingHistory: async () => {
    const response = await api.get<ReadingHistoryItem[]>('/history');
    return response.data;
  },

  // Lưu lịch sử (Gọi khi vào trang đọc truyện)
  saveReadingHistory: async (comicId: number, chapterId: number) => {
    return await api.post('/history', { comicId, chapterId });
  }
};