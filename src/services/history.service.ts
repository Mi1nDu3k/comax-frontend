import axios from 'axios';
import { HistoryCreateDTO, ReadingHistoryItem } from '@/types/history';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';


const getAuthHeaders = () => {

    if (typeof window === 'undefined') return {};
    
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};
// ---------------------------------

export const historyService = {
    // 1. Lưu lịch sử (Gọi khi đọc truyện)
    saveHistory: async (data: HistoryCreateDTO) => {
        const headers = getAuthHeaders();
        // Kiểm tra object rỗng (chưa có token)
        if (!headers.Authorization) return; 

        try {
            await axios.post(`${API_URL}/history`, data, { headers });
        } catch (error) {
            console.error("Lỗi lưu lịch sử:", error);
        }
    },

    // 2. Lấy danh sách lịch sử
    getMyHistory: async (): Promise<ReadingHistoryItem[]> => {
        const headers = getAuthHeaders();
        if (!headers.Authorization) return [];

        try {
            const response = await axios.get(`${API_URL}/history`, { headers });
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy lịch sử:", error);
            return [];
        }
    },

    // 3. Xóa 1 truyện
    deleteHistory: async (id: number) => {
        const headers = getAuthHeaders();
        if (!headers.Authorization) return;
        await axios.delete(`${API_URL}/history/${id}`, { headers });
    },

    // 4. Xóa tất cả
    deleteAllHistory: async () => {
        const headers = getAuthHeaders();
        if (!headers.Authorization) return;
        await axios.delete(`${API_URL}/history`, { headers });
    }
};