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
    localStorage.removeItem('Auth');
  },


  forgotPassword: (email: string) => {
    return api.post("/user/forgot-password", { email });
  },

  // 2. Kiểm tra mã OTP (Bước đệm)
  verifyOtp: (email: string, otp: string) => {
    return api.post("/user/verify-otp", { email, otp });
  },

  // 3. Đặt lại mật khẩu (Gửi kèm OTP để xác thực lần cuối)
  resetPassword: (email: string, otp: string, newPass: string) => {
    return api.post("/user/reset-password", {
      email: email,
      otp: otp,
      newPassword: newPass,
      confirmPassword: newPass, 
    });
  },
};