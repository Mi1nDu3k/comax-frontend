
import api from '@/lib/axios';
import { Chapter } from '@/types/chapter';

export const chapterService = {
  getDetail: async (id: string) => {
    // API backend Comax.API/Controllers/ChapterController.cs: [HttpGet("{id}")]
    const response = await api.get(`/chapter/${id}`); 
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Chapter>(`/chapters/${id}`);
    return response.data;
  },

  // Lấy danh sách chương của 1 truyện (để hiển thị menu chọn chương)
  getByComicId: async (comicId: string) => {
    const response = await api.get<Chapter[]>(`/comics/${comicId}/chapters`);
    return response.data;
  },
  create: async (data: { comicId: number; title: string; content: string; chapterNumber: number }) => {
    return await api.post('/chapters', data);
  },

  update: async (id: number | string, data: FormData) => {
  const response = await api.put(`/chapters/${id}`, data);
  return response.data;
  },

  delete: async (id: number) => {
    return await api.delete(`/chapters/${id}`);
  },
  createWithImages: async (formData: FormData, onProgress: (percent: number) => void) => {
    return await api.post('/chapter/create-with-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // Theo dõi tiến trình upload của toàn bộ payload (bao gồm tất cả ảnh)
      onUploadProgress: (progressEvent) => {
        const total = progressEvent.total || 1;
        const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
        onProgress(percentCompleted); // Gửi phần trăm về component
      },
    });
  },
}