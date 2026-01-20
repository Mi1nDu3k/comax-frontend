'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaBook, FaUsers, FaArrowLeft, FaTrash, FaTags } from 'react-icons/fa';
import { FaBarcode } from 'react-icons/fa6';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FaTachometerAlt },
    { name: 'Quản lý User', href: '/admin/user', icon: FaUsers },
    { name: 'Quản lý Truyện', href: '/admin/comic', icon: FaBook },
    { name: 'Quản lý Thể loại', href: '/admin/category', icon: FaTags },
    { name: 'Crawler Truyện', href: '/admin/crawler', icon: FaBarcode },
    { name: 'Thùng rác', href:'/admin/recycle-bin',icon: FaTrash},
  ];

  return (
    // Thêm h-screen và sticky để sidebar luôn cố định chiều cao bằng màn hình
    <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 text-2xl font-bold text-blue-400 border-b border-slate-800">
        Admin CP
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          // Kiểm tra xem trang hiện tại có khớp với link không
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded transition ${
                isActive 
                  ? 'bg-slate-800 text-blue-300 font-medium shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon /> {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <FaArrowLeft /> Về trang chủ
        </Link>
      </div>
    </aside>
  );
}