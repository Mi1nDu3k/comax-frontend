'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCrown, FaCheckCircle, FaRocket, FaAd, FaClock, FaGem } from 'react-icons/fa';
import { subscriptionService } from '@/services/subscription.service';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/auth.context';
import { AxiosError } from 'axios';

const VIP_PACKAGES = [
  { months: 1, price: "20.000", label: "1 Tháng", desc: "Trải nghiệm cơ bản", popular: false },
  { months: 6, price: "100.000", label: "6 Tháng", desc: "Tiết kiệm 20%", popular: true },
  { months: 12, price: "180.000", label: "1 Năm", desc: "Ưu đãi tốt nhất", popular: false },
];

const VIP_BENEFITS = [
  { icon: <FaAd className="text-red-500" />, text: "Không quảng cáo gây phiền nhiễu" },
  { icon: <FaRocket className="text-blue-500" />, text: "Đọc trước các chương mới nhất" },
  { icon: <FaGem className="text-yellow-500" />, text: "Huy hiệu Vương miện VIP độc quyền" },
  { icon: <FaClock className="text-green-500" />, text: "Tốc độ tải ảnh cực nhanh" },
];

export default function RechargePage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(VIP_PACKAGES[1]); // Mặc định gói 6 tháng
  const [loading, setLoading] = useState(false);

  const handleRecharge = async () => {
    setLoading(true);
    try {
      await subscriptionService.rechargeVip(selectedPackage.months);
      toast.success(`Chúc mừng! Bạn đã kích hoạt thành công ${selectedPackage.label} VIP.`);
      
      if (refreshUser) await refreshUser();
      router.push('/profile');
    } catch (error) {
      // 4. Sửa lỗi any: Ép kiểu AxiosError
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || "Giao dịch không thành công";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4 shadow-sm">
            <FaCrown className="text-yellow-500 text-3xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Nâng Cấp Tài Khoản VIP</h1>
          <p className="text-gray-500 max-w-lg mx-auto">Mở khóa toàn bộ đặc quyền, ủng hộ tác giả và trải nghiệm đọc truyện tuyệt vời nhất.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Cột Lợi ích (Bên trái/Dưới) */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-800 mb-6">Đặc quyền VIP</h3>
            <ul className="space-y-4">
              {VIP_BENEFITS.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="p-2 bg-gray-50 rounded-lg">{b.icon}</span>
                  {b.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Cột Chọn gói & Thanh toán (Bên phải/Trên) */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {VIP_PACKAGES.map((pkg) => (
                <div 
                  key={pkg.months}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPackage.months === pkg.months 
                    ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-100' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Phổ biến</span>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-500 mb-1">{pkg.label}</p>
                    <p className="text-2xl font-black text-gray-800">{pkg.price}đ</p>
                    <p className="text-[10px] text-gray-400 mt-2">{pkg.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng quan thanh toán */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-500">Gói đã chọn:</p>
                  <p className="text-lg font-bold text-gray-800">{selectedPackage.label} VIP</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Tổng cộng:</p>
                  <p className="text-3xl font-black text-blue-600">{selectedPackage.price}đ</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 mb-6 flex items-start gap-3">
                <FaCheckCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                <p className="text-xs text-yellow-800 leading-relaxed">
                  Lưu ý: Chức năng thanh toán hiện tại đang ở chế độ <b>Thử nghiệm</b>. Khi nhấn nút bên dưới, tài khoản sẽ được cộng hạn VIP trực tiếp.
                </p>
              </div>

              <button 
                onClick={handleRecharge}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Xác nhận Thanh toán"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}