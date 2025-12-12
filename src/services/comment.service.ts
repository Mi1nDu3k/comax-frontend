import api from '@/lib/axios';
import { Comment } from '@/types/comment';

export const commentService = {
  // 1. Lấy comment cha (có phân trang)
  getParents: async (comicId: string, page: number = 1) => {
    const response = await api.get<Comment[]>(`/comments/comic/${comicId}?page=${page}`);
    return response.data;
  },

  // 2. Lấy comment con (có phân trang)
  getReplies: async (parentId: number, page: number = 1) => {
    const response = await api.get<Comment[]>(`/comments/${parentId}/replies?page=${page}`);
    return response.data;
  },

  // 3. Tạo comment
  create: async (data: { comicId: number; content: string; parentId?: number }) => {
    const response = await api.post<Comment>('/comments', data);
    return response.data;
  }
};