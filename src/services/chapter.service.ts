
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

  update: async (id: number, data: { title?: string; content?: string; chapterNumber?: number }) => {
    return await api.put(`/chapters/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/chapters/${id}`);
  }
};