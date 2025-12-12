'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { FaSearch, FaUser, FaBars, FaTimes, FaBook, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { getUserRole, getUserName } from '@/lib/jwt';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', role: '' });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const checkLoginStatus = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      setUserInfo({
        name: getUserName(token),
        role: getUserRole(token) || 'User',
      });
    } else {
      setIsLoggedIn(false);
      setUserInfo({ name: '', role: '' });
    }
  }, []);

  useEffect(() => {
    // SỬA LỖI: Thêm dòng này để tắt cảnh báo lint
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    checkLoginStatus();

    window.addEventListener('auth-change', checkLoginStatus);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('auth-change', checkLoginStatus);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [checkLoginStatus]);

  const handleLogout = () => {
    authService.logout();
    window.dispatchEvent(new Event('auth-change'));
    setShowUserMenu(false);
    router.push('/login');
  };

  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Thể loại', href: '/categories' },
    { name: 'Bảng xếp hạng', href: '/top-comics' },
  ];

  if (!mounted) return <div className="h-16 bg-white shadow-sm"></div>;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
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

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-3 py-1.5">
             <input type="text" placeholder="Tìm truyện..." className="bg-transparent border-none outline-none text-sm w-32 lg:w-48 text-gray-700" />
             <button aria-label="Tìm kiếm" className="text-gray-500 hover:text-blue-600"><FaSearch /></button>
          </div>

          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {userInfo.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium leading-none">{userInfo.name}</span>
                    {userInfo.role === 'Admin' && <span className="text-[10px] text-red-500 font-bold">ADMIN</span>}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 overflow-hidden animate-fadeIn z-50">
                  {userInfo.role === 'Admin' && (
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 font-semibold bg-red-50 hover:bg-red-100" onClick={() => setShowUserMenu(false)}>
                      <FaTachometerAlt /> Quản trị viên
                    </Link>
                  )}
                  
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                    <FaUser className="text-gray-400" /> Hồ sơ cá nhân
                  </Link>
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                    <FaBook className="text-gray-400" /> Tủ truyện
                  </Link>
                  
                  <div className="border-t my-1"></div>
                  <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <FaSignOutAlt className="text-gray-400" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
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

          <button aria-label="Menu" className="md:hidden text-gray-600" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>
      
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
              <input type="text" placeholder="Tìm kiếm..." className="w-full border p-2 rounded-md mb-2" />
              {!isLoggedIn && (
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