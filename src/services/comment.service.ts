import api from '@/lib/axios';
import { Comment } from '@/types/comment';

export const commentService = {
  // 1. Lấy comment cha (Backend đã bao gồm 1 số replies mẫu bên trong)
  getParents: async (comicId: number, page: number = 1) => {
    // Lưu ý: comicId nên để number cho đồng bộ với DB
    const response = await api.get<Comment[]>(`/comments/comic/${comicId}?page=${page}`);
    return response.data;
  },

  
  getReplies: async (parentId: number, page: number = 1) => {
    const response = await api.get<Comment[]>(`/comments/${parentId}/replies?page=${page}`);
    return response.data;
  },

  // 3. Tạo comment (Gốc hoặc Trả lời)
  create: async (data: { 
    comicId: number; 
    content: string; 
    parentId?: number; 
    userId: number; // Đừng quên truyền userId từ frontend xuống (nếu backend không tự lấy từ token)
  }) => {
    const response = await api.post<Comment>('/comments', data);
    return response.data;
  },

  // 4. Xóa comment
  delete: async (id: number) => {
    return await api.delete(`/comments/${id}`);
  }
};