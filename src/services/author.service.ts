import api from '@/lib/axios';

export interface Author {
  id: number;
  name: string;
}

export const authorService = {
  getAll: async () => {
    const response = await api.get<Author[]>('/author');
    return response.data;
  },
  create: async (data: { name: string }) => {
    const response = await api.post('/author', data);
    return response.data;
  }
};