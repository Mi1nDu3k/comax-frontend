'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { FaSearch, FaUser, FaBars, FaTimes, FaSignOutAlt, FaTachometerAlt, FaBell } from 'react-icons/fa'; 
import { useAuth } from '@/context/auth.context';
import { notificationService } from '@/services/notification.service';
import { Notification } from '@/types/notification';
import Image from 'next/image';
// Import helper xử lý ảnh MinIO
import { getMinioUrl } from '@/utils/image-helper';

export default function Header() {
  const { user, logout } = useAuth();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [showNotiMenu, setShowNotiMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const menuRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setShowNotiMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
        const fetchNoti = async () => {
            try {
                const data = await notificationService.getAll(1, 5) as Notification[]; 
                setNotifications(data);
                const unread = data.filter((n: Notification) => !n.isRead).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error("Lỗi tải thông báo header", error);
            }
        };
        fetchNoti();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/login');
  };

  const handleReadNoti = async (noti: Notification) => {
      if (!noti.isRead) {
          try {
              await notificationService.markAsRead(noti.id);
              setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, isRead: true } : n));
              setUnreadCount(prev => Math.max(0, prev - 1));
          } catch (e) { console.error(e); }
      }
      setShowNotiMenu(false);
      if (noti.link) router.push(noti.link);
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

          {user ? (
            <>
                <div className="relative" ref={notiRef}>
                    <button 
                        onClick={() => setShowNotiMenu(!showNotiMenu)}
                        className="relative p-2 text-gray-600 hover:text-blue-600 transition"
                        title="Thông báo"
                    >
                        <FaBell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/4 -translate-y-1/4">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotiMenu && (
                        <div className="absolute right-[-60px] md:right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 overflow-hidden animate-fadeIn z-50 origin-top-right">
                            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-sm font-bold text-gray-800">Thông báo mới</h3>
                                <Link href="/profile" onClick={() => setShowNotiMenu(false)} className="text-xs text-blue-600 hover:underline">Xem tất cả</Link>
                            </div>
                            
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(noti => (
                                        <div 
                                            key={noti.id} 
                                            onClick={() => handleReadNoti(noti)}
                                            className={`px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer flex gap-3 ${!noti.isRead ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!noti.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                                            <div className="flex-1">
                                                <p className={`text-sm ${!noti.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                                    {noti.message}
                                                </p>
                                                <span className="text-xs text-gray-400 mt-1 block">
                                                    {new Date(noti.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                        Không có thông báo nào.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
                            unoptimized // Quan trọng: Sửa lỗi Private IP
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