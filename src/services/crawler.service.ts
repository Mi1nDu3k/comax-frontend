import api from '@/lib/axios';

// Định nghĩa kiểu dữ liệu trả về (nếu cần)
interface CrawlResponse {
  message: string;
}

export const crawlerService = {
  /**
   * Gửi yêu cầu crawl thủ công 1 link truyện
   * @param url Link truyện tranh (Nettruyen/Luottruyen)
   */
  crawlManual: async (url: string) => {
    // Gọi vào endpoint: POST /api/crawler/manual
    const response = await api.post<CrawlResponse>("/crawler/manual", { url });
    return response.data;
  },
}