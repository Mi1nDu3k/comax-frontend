import api from '@/lib/axios';
import { LoginDTO, AuthResponse } from '@/types/auth';

export const authService = {
  login: async (data: LoginDTO) => {
    const response = await api.post<AuthResponse>('/user/login', data);
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
    }
    return response.data;
  },
  
 register: async (data: Record<string, unknown>) => {
    return await api.post('/user/register', data);
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
  },
  
};