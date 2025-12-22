import api from '@/lib/axios';

export const subscriptionService = {
  // Gửi yêu cầu nâng cấp VIP với số tháng tương ứng
  rechargeVip: async (months: number) => {
    const response = await api.post('/subscription/recharge', { months });
    return response.data;
  },
};