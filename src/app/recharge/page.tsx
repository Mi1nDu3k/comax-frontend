'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCrown, FaCheckCircle, FaQrcode, FaCopy, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/auth.context';

// --- CẤU HÌNH TÀI KHOẢN NGÂN HÀNG (SỬA Ở ĐÂY) ---

 const BANK_CONFIG = {
  BANK_ID: process.env.NEXT_PUBLIC_BANK_ID || "",
  ACCOUNT_NO: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "",
  ACCOUNT_NAME: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "",
  TEMPLATE: process.env.NEXT_PUBLIC_BANK_TEMPLATE || "compact2"
};


const VIP_PACKAGES = [
  { id: 1, months: 1, price: 2000, label: "1 Tháng", desc: "Trải nghiệm cơ bản", popular: false },
  { id: 2, months: 6, price: 100000, label: "6 Tháng", desc: "Tiết kiệm 20%", popular: true },
  { id: 3, months: 12, price: 180000, label: "1 Năm", desc: "Ưu đãi tốt nhất", popular: false },
];

export default function RechargePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [selectedPackage, setSelectedPackage] = useState(VIP_PACKAGES[1]); // Mặc định gói 6 tháng
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [transferContent, setTransferContent] = useState("");

  // Tạo nội dung chuyển khoản và Link QR
  useEffect(() => {
    if (user) {
      // Nội dung chuyển khoản chuẩn theo Regex Backend: "COMAX <USERID>"
      const content = `COMAX ${user.id}`;
      setTransferContent(content);

      // Tạo link VietQR
      const url = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-${BANK_CONFIG.TEMPLATE}.png?amount=${selectedPackage.price}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;
      setQrUrl(url);
    }
  }, [user, selectedPackage]);

  const handleShowQR = () => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để thực hiện thanh toán");
      router.push('/login?redirect=/recharge');
      return;
    }
    setShowQR(true);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(transferContent);
    toast.success("Đã sao chép nội dung chuyển khoản!");
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4 shadow-sm animate-bounce">
            <FaCrown className="text-yellow-500 text-3xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Nâng Cấp VIP</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Mở khóa toàn bộ truyện, tắt quảng cáo và ủng hộ tác giả.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: DANH SÁCH GÓI */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Chọn gói VIP
            </h3>
            
            <div className="grid sm:grid-cols-3 gap-4">
              {VIP_PACKAGES.map((pkg) => (
                <div 
                  key={pkg.id}
                  onClick={() => { setSelectedPackage(pkg); setShowQR(false); }}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedPackage.id === pkg.id 
                    ? 'border-blue-600 bg-blue-50/50 shadow-md transform scale-[1.02]' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-sm">
                      Khuyên dùng
                    </span>
                  )}
                  <div className="text-center mt-2">
                    <p className="text-gray-500 font-medium mb-1">{pkg.label}</p>
                    <p className="text-3xl font-black text-gray-800 my-2">
                      {pkg.price.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-xs text-blue-600 font-medium bg-blue-100 py-1 px-2 rounded-lg inline-block">
                      {pkg.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Phần Lợi ích */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
              <h4 className="font-bold text-gray-800 mb-4">Quyền lợi thành viên VIP:</h4>
              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Không quảng cáo làm phiền</li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Mở khóa toàn bộ chương VIP</li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Huy hiệu Vương miện độc quyền</li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Tốc độ tải trang nhanh nhất</li>
              </ul>
            </div>
          </div>

          {/* CỘT PHẢI: THANH TOÁN */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Thanh toán
            </h3>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-8">
              {/* Header Bill */}
              <div className="bg-gray-50 p-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Gói đã chọn</span>
                  <span className="font-bold text-gray-800">{selectedPackage.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Thành tiền</span>
                  <span className="text-2xl font-black text-blue-600">{selectedPackage.price.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <div className="p-6">
                {!user ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4 text-sm">Vui lòng đăng nhập để lấy mã thanh toán</p>
                    <button 
                      onClick={() => router.push('/login?redirect=/recharge')}
                      className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                ) : !showQR ? (
                  <div>
                    <div className="bg-yellow-50 p-3 rounded-lg flex items-start gap-2 mb-6">
                      <FaShieldAlt className="text-yellow-600 mt-1 flex-shrink-0"/>
                      <p className="text-xs text-yellow-800 leading-relaxed">
                        Thanh toán chuyển khoản ngân hàng trực tiếp. Hệ thống tự động kích hoạt sau 1-3 phút.
                      </p>
                    </div>
                    <button 
                      onClick={handleShowQR}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2"
                    >
                      <FaQrcode /> Lấy mã QR Thanh toán
                    </button>
                  </div>
                ) : (
                  <div className="animate-fade-in text-center">
                    <p className="text-sm font-medium text-gray-500 mb-3">Quét mã bằng App ngân hàng</p>
                    
                    {/* Hình QR */}
                    <div className="border-2 border-blue-100 rounded-xl p-2 inline-block shadow-sm mb-4 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrUrl} alt="VietQR" className="w-full max-w-[220px] h-auto rounded-lg" />
                    </div>

                    {/* Thông tin chuyển khoản thủ công */}
                    <div className="bg-gray-100 rounded-lg p-3 text-left space-y-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Số tài khoản:</p>
                        <div className="flex justify-between items-center bg-white px-2 py-1.5 rounded border border-gray-200">
                          <span className="font-mono font-bold text-gray-800 text-sm">{BANK_CONFIG.ACCOUNT_NO}</span>
                          <button  onClick={() => { navigator.clipboard.writeText(BANK_CONFIG.ACCOUNT_NO); toast.success("Đã sao chép STK"); }} className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                            <FaCopy size={14}/>
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Nội dung (Bắt buộc):</p>
                        <div className="flex justify-between items-center bg-white px-2 py-1.5 rounded border border-blue-200 ring-1 ring-blue-100">
                          <span className="font-mono font-bold text-blue-700 text-sm">{transferContent}</span>
                          <button onClick={handleCopyContent} className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                            <FaCopy size={14}/>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-left bg-blue-50 p-3 rounded-lg mb-4">
                      <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0 text-sm"/>
                      <p className="text-xs text-blue-800">
                        Vui lòng giữ nguyên <b>Nội dung chuyển khoản</b> để hệ thống tự động kích hoạt.
                      </p>
                    </div>

                    <button 
                      onClick={() => setShowQR(false)} 
                      className="text-sm text-gray-500 hover:text-gray-800 underline"
                    >
                      Chọn gói khác
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Note an toàn */}
            <p className="text-center text-xs text-gray-400 mt-4">
              Mọi giao dịch đều được bảo mật. Nếu gặp sự cố, vui lòng liên hệ Admin.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}