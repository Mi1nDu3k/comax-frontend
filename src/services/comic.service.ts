import api from '@/lib/axios';
import { Comic } from '@/types/comic';
import { PaginationParams } from '@/types/common';

export const comicService = {
  getAll: async (params?: PaginationParams) => {
    const response = await api.get('/comics', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Comic>(`/comics/${id}`);
    return response.data;
  },
  
  getChapters: async (comicId: string) => {
    const response = await api.get(`/comics/${comicId}/chapters`);
    return response.data;
  },
  delete: async (id: number) => {
    // Gọi DELETE /api/comics/{id}
    return await api.delete(`/comics/${id}`);
  },
  create: async (formData: FormData) => {
    return await api.post('/comics', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  update: async (id: number, formData: FormData) => {
    return await api.put(`/comics/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }
};