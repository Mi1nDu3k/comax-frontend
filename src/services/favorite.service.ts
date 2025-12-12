import api from '@/lib/axios';
import { Comic } from '@/types/comic';

export const favoriteService = {
  // Toggle: Thêm nếu chưa có, Xóa nếu đã có (tùy logic backend)
  toggle: async (comicId: string) => {
    const response = await api.post(`/favorites/${comicId}`);
    return response.data;
  },
  checkStatus: async (comicId: string) => {
    const response = await api.get(`/favorites/check/${comicId}`);
    return response.data; 
  },
  getMyFavorites: async () => {
    const response = await api.get<Comic[]>('/favorite/me');
    return response.data;
  },
  
  // [HttpDelete("{comicId}")]
  remove: async (comicId: string) => {
    return await api.delete(`/favorite/${comicId}`);
  }
};