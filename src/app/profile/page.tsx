'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { favoriteService } from '@/services/favorite.service';
import { notificationService } from '@/services/notification.service';
import { Comic } from '@/types/comic';
import { Notification } from '@/types/notification';
import { useAuth } from '@/context/auth.context';
import { FaCrown, FaUserCircle, FaEnvelope, FaBell, FaBook, FaCheckDouble, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'favorites' | 'notifications'>('favorites');
  const [favorites, setFavorites] = useState<Comic[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [router]);

  const handleRemoveFavorite = async (comicId: number | string) => {
    if (!confirm('Bỏ theo dõi truyện này?')) return;
    try {
      await favoriteService.remove(comicId.toString());
      setFavorites((prev) => prev.filter((c) => c.id.toString() !== comicId.toString()));
      toast.success("Đã bỏ theo dõi");
    } catch (error) {
        console.error(error);
        toast.error('Lỗi thao tác');
    }
  };

  const handleMarkRead = async (id: number, link?: string) => {
    try {
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        if (link) router.push(link);
    } catch (error) {
        console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
      try {
          await notificationService.markAllRead();
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          toast.success("Đã đánh dấu tất cả");
      } catch (error) { console.error(error); }
  };

  const handleDeleteNoti = async (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if(!confirm("Xóa thông báo này?")) return;
      try {
          await notificationService.delete(id);
          setNotifications(prev => prev.filter(n => n.id !== id));
      } catch { toast.error("Lỗi xóa"); }
  }

  if (loading) return <div className="p-10 text-center">Đang tải hồ sơ...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 1. INFO CARD */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-50 bg-gray-100 flex-shrink-0">
            {user?.avatar ? (
                <Image src={user.avatar} alt={user.username} fill className="object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><FaUserCircle size={60} /></div>
            )}
        </div>
        <div className="flex-1 text-center md:text-left">
           <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-2">
              {user?.username} {user?.isvip && <FaCrown className="text-yellow-500" title="VIP" />}
           </h1>
           <p className="text-gray-500 mt-1"><FaEnvelope className="inline mr-1" /> {user?.email}</p>
        </div>
      </div>

      {/* 2. TABS */}
      <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab('favorites')} className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'favorites' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
             <FaBook /> Tủ truyện ({favorites.length})
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'notifications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
             <FaBell /> Thông báo ({notifications.filter(n => !n.isRead).length})
          </button>
      </div>

      {/* 3. CONTENT */}
      <div className="min-h-[300px]">
        {activeTab === 'favorites' && (
            favorites.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {favorites.map((comic) => (
                    <div key={comic.id} className="group relative bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition">
                       <Link href={`/comics/${comic.id}`}>
                        <div className="aspect-[2/3] relative bg-gray-200">
                          <Image src={comic.thumbnailUrl || '/placeholder.jpg'} alt={comic.title} fill className="object-cover" unoptimized />
                        </div>
                      </Link>
                      <div className="p-3">
                         <h3 className="font-semibold text-sm truncate mb-1">{comic.title}</h3>
                         <button onClick={() => handleRemoveFavorite(comic.id)} className="text-xs text-red-500 hover:underline">Bỏ theo dõi</button>
                      </div>
                    </div>
                  ))}
                </div>
            ) : <div className="text-center py-10 text-gray-500">Chưa có truyện nào.</div>
        )}

        {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between">
                    <h3 className="font-bold text-gray-700">Thông báo</h3>
                    <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><FaCheckDouble /> Đọc tất cả</button>
                </div>
                <div className="divide-y divide-gray-100">
                    {notifications.map((noti) => (
                        <div key={noti.id} onClick={() => handleMarkRead(noti.id, noti.link)} className={`px-6 py-4 flex gap-4 cursor-pointer hover:bg-gray-50 ${!noti.isRead ? 'bg-blue-50/50' : ''}`}>
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!noti.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                            <div className="flex-1">
                                <p className="text-sm text-gray-800">{noti.message}</p>
                                <span className="text-xs text-gray-400">{new Date(noti.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            
                           
                            <button 
                                onClick={(e) => handleDeleteNoti(e, noti.id)} 
                                className="text-gray-300 hover:text-red-500 p-2"
                                aria-label="Xóa thông báo" 
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    ))}
                    {notifications.length === 0 && <div className="text-center py-10 text-gray-400">Không có thông báo.</div>}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}