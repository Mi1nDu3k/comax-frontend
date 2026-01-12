'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react'; // <--- Thêm useEffect
import { FaSearch, FaUser, FaBars, FaTimes, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '@/context/auth.context';
import Image from 'next/image';
import { getMinioUrl } from '@/utils/image-helper';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';

export default function Header() {
  const { user, logout } = useAuth();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // --- SỬA TẠI ĐÂY ---
  const [mounted, setMounted] = useState(false); // Lấy cả setMounted

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true); // Cập nhật state khi component đã load xong ở client
  }, []);
  

  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Xử lý đóng menu khi click ra ngoài (Optional nhưng nên có)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/login');
  };

  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Thể loại', href: '/categories' },
    { name: 'Bảng xếp hạng', href: '/top-comics' },
  ];

  // Nếu chưa mount (đang ở server hoặc mới load), hiện khung skeleton để tránh layout shift
  if (!mounted) return <div className="h-16 bg-white shadow-sm"></div>;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO & NAV */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tighter">
            COMAX
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-semibold transition-colors duration-200
                  ${pathname === link.href ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}
                `}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* SEARCH & USER ACTIONS */}
        <div className="flex items-center gap-4">
          <SearchBar />

          {user ? (
            <>
                {/* Component Chuông thông báo */}
                <NotificationBell/>
                
                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 focus:outline-none ml-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden relative border border-blue-200 shadow-inner">
                      {user.avatar ? (
                          <Image 
                            src={getMinioUrl(user.avatar)} 
                            alt="User Avatar" 
                            fill 
                            className="object-cover"
                            unoptimized
                          />
                      ) : (
                          user.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium leading-none max-w-[100px] truncate">{user.username}</span>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 overflow-hidden animate-fadeIn z-50">
                      {user.roleName === 'Admin' && (
                        <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 font-semibold bg-red-50 hover:bg-red-100" onClick={() => setShowUserMenu(false)}>
                          <FaTachometerAlt /> Quản trị viên
                        </Link>
                      )}
                      
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                        <FaUser className="text-gray-400" /> Hồ sơ cá nhân
                      </Link>
                      
                      <div className="border-t my-1"></div>
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <FaSignOutAlt className="text-gray-400" /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hidden sm:block">
                Đăng nhập
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm transition">
                Đăng ký
              </Link>
            </div>
          )}

          <button aria-label="Menu" className="md:hidden text-gray-600 ml-2" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t p-4 space-y-3 shadow-lg">
           {navLinks.map(link => (
             <Link 
               key={link.href} 
               href={link.href}
               className="block text-gray-700 font-medium py-2 hover:text-blue-600"
               onClick={() => setShowMobileMenu(false)}
             >
               {link.name}
             </Link>
           ))}
           <div className="pt-2 border-t">
              {!user && (
                <Link href="/login" className="block text-center w-full py-2 bg-gray-100 rounded text-gray-700" onClick={() => setShowMobileMenu(false)}>
                   Đăng nhập
                </Link>
              )}
           </div>
        </div>
      )}
    </header>
  );
}