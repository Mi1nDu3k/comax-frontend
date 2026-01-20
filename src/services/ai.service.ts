import axios from "axios";

// Kiểu dữ liệu cho Comic trả về từ AI
export interface AIComicResult {
  id: number;
  title: string;
  slug: string;
  cover: string;
  score: number;
}

// Kiểu dữ liệu phản hồi từ Server
export interface AIChatResponse {
  answer: string;
  relatedComics: AIComicResult[];
}

export const aiService = {
  chat: async (message: string): Promise<AIChatResponse> => {
    // Gọi vào API .NET bạn đã viết
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/aisearch/chat`, {
      message,
    });
    return response.data;
  },
};