'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AxiosError } from 'axios'; 

// Services
import { favoriteService } from '@/services/favorite.service';
import { notificationService } from '@/services/notification.service';
import { userService } from '@/services/user.service';

// Context & Utils
import { useAuth } from '@/context/auth.context';
import { toast } from 'react-toastify';

// Icons
import { 
    FaCrown, FaUserCircle, FaEnvelope, FaBell, FaBook, 
    FaCheckDouble, FaTrash, FaSignOutAlt, FaEdit, FaCamera, FaTimes 
} from 'react-icons/fa';

// --- Types Definitions ---
interface Comic {
    id: number;
    title: string;
    thumbnailUrl: string;
    slug: string;
}

interface Notification {
    id: number;
    message: string;
    url: string;
    isRead: boolean;
    createdAt: string;
}

interface BackendErrorResponse {
    title?: string;
    message?: string;
    errors?: Record<string, string[]>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  // --- States ---
  const [activeTab, setActiveTab] = useState<'favorites' | 'notifications'>('favorites');
  const [favorites, setFavorites] = useState<Comic[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Fetch Data ---
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    const fetchData = async () => {
        try {
            const [favData, notiData] = await Promise.all([
                favoriteService.getMyFavorites().catch(() => []),
                notificationService.getAll().catch(() => [])
            ]);
            setFavorites(favData || []);
            setNotifications(notiData || []);
        } catch (fetchError) {
            console.error("Lỗi tải dữ liệu:", fetchError);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [router]);

  // --- 2. Handlers: Favorites ---
  const handleRemoveFavorite = async (comicId: number) => {
    if (!confirm('Bạn có chắc muốn bỏ theo dõi truyện này?')) return;
    try {
      await favoriteService.remove(comicId.toString());
      setFavorites((prev) => prev.filter((c) => c.id !== comicId));
      toast.success("Đã bỏ theo dõi");
    } catch {
        toast.error('Có lỗi xảy ra khi xóa');
    }
  };
useEffect(() => {
    // Thu hồi URL khi component unmount hoặc khi previewAvatar thay đổi
    return () => {
        if (previewAvatar && previewAvatar.startsWith('blob:')) {
            URL.revokeObjectURL(previewAvatar);
        }
    };
  }, [previewAvatar]);
  // --- 3. Handlers: Notifications ---
  const handleMarkRead = async (id: number, url?: string) => {
    try {
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        if (url) router.push(url);
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
      try {
          await notificationService.markAllRead();
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          toast.success("Đã đánh dấu tất cả");
      } catch (err) { console.error(err); }
  };

  const handleDeleteNoti = async (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if(!confirm("Xóa thông báo này?")) return;
      try {
          await notificationService.delete(id);
          setNotifications(prev => prev.filter(n => n.id !== id));
          toast.success("Đã xóa");
      } catch { toast.error("Lỗi xóa thông báo"); }
  }

  // --- 4. Handlers: Edit Profile ---
  const openEditModal = () => {
      if (!user) return;
      setEditName(user.username || '');
      setPreviewAvatar(user.avatar || null); 
      setEditAvatar(null);
      setIsEditModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setEditAvatar(file);
          setPreviewAvatar(URL.createObjectURL(file));
      }
  };

  const handleSaveChanges = async () => {
      if (!editName.trim()) {
          toast.warning("Tên hiển thị không được để trống");
          return;
      }

      setIsUpdating(true);
      try {
          const res = await userService.updateProfile(
              editName, 
              user?.email || "", 
              editAvatar || undefined
          );

          if (res.success) {
              toast.success("Cập nhật hồ sơ thành công!");
              if (refreshUser) await refreshUser();
              setIsEditModalOpen(false);
          } else {
              toast.error(res.message || "Cập nhật thất bại");
          }
      } catch (saveError) {
          const axiosError = saveError as AxiosError<BackendErrorResponse>;
          let msg = "Lỗi kết nối đến máy chủ";

          if (axiosError.response?.data) {
              const data = axiosError.response.data;
              if (data.errors) {
                  const errorValues = Object.values(data.errors).flat();
                  if (errorValues.length > 0) msg = errorValues.join('\n');
              } else if (data.message) {
                  msg = data.message;
              }
          }
          toast.error(msg);
      } finally {
          setIsUpdating(false);
      }
  };

  const getAvatarUrl = (url: string | undefined | null) => {
      if (!url) return null;
      if (url.startsWith('blob:')) return url;
      const finalUrl = url.replace('http://minio:9000', 'http://localhost:9000');
      return `${finalUrl}?v=${new Date().getTime()}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-5xl">
            {/* HEADER CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative group flex-shrink-0">
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${user?.isvip ? 'border-yellow-400' : 'border-white'} shadow-lg bg-gray-100 flex items-center justify-center relative`}>
                        {user?.avatar ? (
                            <Image 
                                src={getAvatarUrl(user.avatar)!} 
                                alt="Avatar" 
                                fill 
                                className="object-cover" 
                                unoptimized 
                                key={user.avatar} 
                            />
                        ) : (
                            <FaUserCircle size={80} className="text-gray-300" />
                        )}
                    </div>
                    {user?.isvip && (
                        <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                            <FaCrown /> VIP
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left z-10">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.username || 'Khách'}</h1>
                    <p className="text-gray-500 mb-4 flex items-center justify-center md:justify-start gap-2">
                        <FaEnvelope /> {user?.email}
                    </p>
                    <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                        {!user?.isvip && (
            <Link 
                href="/recharge" 
                className="px-5 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 flex items-center gap-2 transition shadow-md animate-pulse"
            >
                <FaCrown /> Kích hoạt VIP ngay
            </Link>
        )}
                        
                        <button 
                            title="Mở form chỉnh sửa"
                            onClick={openEditModal}
                            className="px-5 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 transition shadow-sm"
                        >
                            <FaEdit /> Chỉnh sửa hồ sơ
                        </button>
                        <button title="Đăng xuất tài khoản" onClick={logout} className="px-5 py-2 rounded-full text-sm font-medium bg-white text-red-600 border border-red-200 hover:bg-red-50 flex items-center gap-2 transition">
                            <FaSignOutAlt /> Đăng xuất
                        </button>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="bg-white rounded-t-xl border-b border-gray-200 flex px-4 shadow-sm">
                <button 
                    title="Xem tủ truyện"
                    onClick={() => setActiveTab('favorites')} 
                    className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-all ${activeTab === 'favorites' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <FaBook /> Tủ truyện <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{favorites.length}</span>
                </button>
                <button 
                    title="Xem thông báo"
                    onClick={() => setActiveTab('notifications')} 
                    className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-all ${activeTab === 'notifications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <FaBell /> Thông báo {notifications.some(n => !n.isRead) && <span className="w-2 h-2 bg-red-500 rounded-full ml-1"></span>}
                </button>
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 min-h-[400px] p-6">
                {activeTab === 'favorites' && (
                    favorites.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {favorites.map((comic) => (
                            <div key={comic.id} className="group relative">
                                <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition mb-3 bg-gray-100">
                                    <Link href={`/comics/${comic.slug || comic.id}`}>
                                        <Image 
                                            src={comic.thumbnailUrl || '/images/placeholder.png'} 
                                            alt={comic.title} 
                                            fill 
                                            className="object-cover group-hover:scale-105 transition duration-300" 
                                            unoptimized 
                                        />
                                    </Link>
                                    <button 
                                        onClick={() => handleRemoveFavorite(comic.id)} 
                                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition z-20"
                                        title="Bỏ theo dõi truyện này"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-blue-600 transition">
                                    <Link href={`/comics/${comic.slug || comic.id}`}>{comic.title}</Link>
                                </h3>
                            </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <FaBook size={48} className="mb-4 opacity-20" />
                            <p>Tủ truyện trống.</p>
                        </div>
                    )
                )}

                {activeTab === 'notifications' && (
                    <div>
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                            <h3 className="font-bold text-gray-700">Thông báo</h3>
                            <button title="Đánh dấu tất cả đã đọc" onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <FaCheckDouble /> Đọc tất cả
                            </button>
                        </div>
                        <div className="space-y-2">
                            {notifications.map((noti) => (
                                <div 
                                    key={noti.id} 
                                    onClick={() => handleMarkRead(noti.id, noti.url)} 
                                    className={`group flex gap-4 p-4 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-200 ${!noti.isRead ? 'bg-blue-50' : 'bg-white'}`}
                                >
                                    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${!noti.isRead ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                    <div className="flex-1">
                                        <p className={`text-sm mb-1 ${!noti.isRead ? 'font-semibold' : ''}`}>{noti.message}</p>
                                        <span className="text-xs text-gray-400">{new Date(noti.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                    <button 
                                        title="Xóa thông báo này"
                                        onClick={(e) => handleDeleteNoti(e, noti.id)} 
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-2 transition"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* EDIT MODAL */}
        {isEditModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-800">Cập nhật thông tin</h3>
                        <button title="Đóng modal" onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-28 h-28 mb-3 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-50 relative">
                                    {previewAvatar ? (
                                        <Image src={previewAvatar} alt="Preview Avatar" fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-300">
                                            <FaUserCircle size={60} />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">
                                    <FaCamera className="text-white text-2xl" />
                                </div>
                            </div>
                            <input title="Chọn file ảnh" type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            <p className="text-xs text-gray-500">Chạm để đổi ảnh đại diện</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
                            <input
                                title="Nhập tên hiển thị mới"
                                placeholder="Nhập tên của bạn"
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="mb-6 opacity-60">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Không thể đổi)</label>
                            <input
                                title="Email tài khoản"
                                placeholder="Email"
                                type="text"
                                value={user?.email || ''}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                title="Hủy bỏ thay đổi"
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                                disabled={isUpdating}
                            >
                                Hủy
                            </button>
                            <button
                                title="Lưu thông tin hồ sơ"
                                onClick={handleSaveChanges}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}