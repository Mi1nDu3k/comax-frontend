import api from '@/lib/axios';
import { Comic } from '@/types/comic'; // Đảm bảo bạn đã có file type này, nếu chưa có thì xem bên dưới

// 1. Interface cho tham số tìm kiếm (Fix lỗi ESLint strict)
export interface ComicQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryIds?: number[]; // Mảng số để lọc nhiều thể loại
}

// 2. Interface cho kết quả phân trang trả về từ Backend
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const comicService = {
  // --- LẤY DANH SÁCH (CÓ PHÂN TRANG & LỌC) ---
  getAll: async (params?: ComicQueryParams) => {
    const response = await api.get<PagedResult<Comic>>('/comics', { 
      params: params,
      // Cấu hình này giúp Axios chuyển mảng [1, 2] thành "categoryIds=1&categoryIds=2"
      // Đây là định dạng mà .NET Web API yêu cầu
      paramsSerializer: {
        indexes: null 
      }
    });
    return response.data; 
  },
  /// --- TÌM KIẾM ---
search: async (keyword: string) => {
    // Gọi endpoint: /api/comics/search?q=abc
    const response = await api.get<Comic[]>(`/comics/search?q=${encodeURIComponent(keyword)}`);
    return response.data;
  },
  // --- LẤY CHI TIẾT THEO ID ---
  getById: async (id: string | number) => {
    const response = await api.get<Comic>(`/comics/${id}`);
    return response.data;
  },

  // --- LẤY CHI TIẾT THEO SLUG (SEO) ---
  getBySlug: async (slug: string) => {
    const response = await api.get<Comic>(`/comics/slug/${slug}`);
    return response.data;
  },

  // --- TẠO MỚI (CÓ UPLOAD ẢNH) ---
  create: async (data: FormData) => {
    return await api.post<Comic>('/comics', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // --- CẬP NHẬT (CÓ UPLOAD ẢNH) ---
  update: async (id: number, data: FormData) => {
    return await api.put<Comic>(`/comics/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // --- XÓA ---
  delete: async (id: number) => {
    return await api.delete(`/comics/${id}`);
  },

  // --- TĂNG LƯỢT XEM ---
  increaseView: async (id: number) => {
    return await api.post(`/comics/${id}/view`);
  },
  // --- LẤY DANH SÁCH TRUYỆN LIÊN QUAN ---
  getRelated: async (id: number) => {
    // Gọi vào endpoint ta vừa tạo ở bước 2
    const res = await api.get<Comic[]>(`/comics/${id}/related`);
    return res.data;
},
};