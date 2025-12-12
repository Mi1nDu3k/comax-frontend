import Link from 'next/link';
import { FaFacebook, FaDiscord, FaTwitter, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tighter">COMAX</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Nền tảng đọc truyện tranh bản quyền hàng đầu. Cập nhật liên tục các bộ truyện hot nhất, chất lượng cao và cộng đồng sôi nổi.
            </p>
            {/* 1. Thêm aria-label cho các link mạng xã hội */}
            <div className="flex gap-4">
               <a href="#" aria-label="Facebook" className="hover:text-white transition"><FaFacebook size={20} /></a>
               <a href="#" aria-label="Discord" className="hover:text-white transition"><FaDiscord size={20} /></a>
               <a href="#" aria-label="Twitter" className="hover:text-white transition"><FaTwitter size={20} /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Khám phá</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/top-comics" className="hover:text-blue-400 transition">Bảng xếp hạng</Link></li>
              <li><Link href="/categories" className="hover:text-blue-400 transition">Thể loại</Link></li>
              <li><Link href="/search" className="hover:text-blue-400 transition">Tìm kiếm nâng cao</Link></li>
              <li><Link href="/history" className="hover:text-blue-400 transition">Lịch sử đọc</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="hover:text-blue-400 transition">Câu hỏi thường gặp</Link></li>
              <li><Link href="/terms" className="hover:text-blue-400 transition">Điều khoản dịch vụ</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-400 transition">Chính sách bảo mật</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition">Liên hệ quảng cáo</Link></li>
            </ul>
          </div>

          <div>
             <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Liên hệ</h3>
             <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                   <FaEnvelope className="text-blue-500" />
                   <span>support@comax.vn</span>
                </li>
                <li className="flex items-center gap-2">
                   <FaPhone className="text-blue-500" />
                   <span>+84 123 456 789</span>
                </li>
                <li className="text-gray-500 text-xs mt-4">
                   Trụ sở: Tòa nhà Comax, Quận Cầu Giấy, Hà Nội.
                </li>
             </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Comax Entertainment. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}