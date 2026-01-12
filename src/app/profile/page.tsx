'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth.context';
import { toast } from 'react-toastify';

// --- IMPORT TYPE CHUẨN (Quan trọng) ---
// Đảm bảo file src/types/notification.ts đã có đủ các trường (id, userId, message, url, isRead, createdAt)
import { Notification } from '@/types/notification';
import { ReadingHistoryItem } from '@/types/history';

// Services
import { favoriteService } from '@/services/favorite.service';
import { notificationService } from '@/services/notification.service';
import { userService } from '@/services/user.service';

// Icons
import { FaBell, FaBook, FaHistory } from 'react-icons/fa';

// Components
import { ProfileHeader } from '@/app/profile/ProfileHeader'; // Lưu ý: Check lại đường dẫn import component
import { EditProfileModal } from '@/app/profile/EditProfileModal';
import { HistoryTab } from '@/app/profile/tabs/HistoryTab';
import { FavoritesTab } from '@/app/profile/tabs/FavoritesTab';
import { NotificationsTab } from '@/app/profile/tabs/NotificationsTab';

// Interfaces cục bộ cho Comic (Nếu chưa có file type riêng thì giữ lại)
interface Comic {
    id: number;
    title: string;
    thumbnailUrl: string;
    slug: string;
}

// --- XÓA ĐOẠN INTERFACE NOTIFICATION CỤC BỘ Ở ĐÂY ---
// (Bạn đã import nó ở trên rồi, không khai báo lại nữa)

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    
    // UI State
    const [activeTab, setActiveTab] = useState<'favorites' | 'notifications' | 'history'>('favorites');
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Data State
    const [favorites, setFavorites] = useState<Comic[]>([]);
    
    // Lúc này Notification sẽ dùng type import chuẩn, không bị lỗi thiếu userId nữa
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [historyList, setHistoryList] = useState<ReadingHistoryItem[]>([]);

    // Fetch Data
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [favData, notiData, histData] = await Promise.all([
                    favoriteService.getMyFavorites().catch(() => []),
                    notificationService.getAll().catch(() => []),
                    userService.getReadingHistory().catch(() => [])
                ]);
                setFavorites(favData || []);
                setNotifications(notiData || []);
                setHistoryList(histData || []);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    // Handlers
    const handleRemoveFavorite = async (id: number) => {
        if (!confirm('Bỏ theo dõi?')) return;
        try {
            await favoriteService.remove(id.toString());
            setFavorites(prev => prev.filter(c => c.id !== id));
            toast.success("Đã xóa");
        } catch { toast.error("Lỗi xóa"); }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* 1. Header */}
                <ProfileHeader 
                    user={user} 
                    onEdit={() => setIsEditModalOpen(true)} 
                    onLogout={logout} 
                />

                {/* 2. Tabs Navigation */}
                <div className="bg-white rounded-t-xl border-b border-gray-200 flex px-4 shadow-sm overflow-x-auto">
                    <TabButton 
                        isActive={activeTab === 'favorites'} 
                        onClick={() => setActiveTab('favorites')} 
                        icon={<FaBook />} 
                        label="Tủ truyện" 
                        count={favorites.length} 
                    />
                    <TabButton 
                        isActive={activeTab === 'history'} 
                        onClick={() => setActiveTab('history')} 
                        icon={<FaHistory />} 
                        label="Lịch sử" 
                        count={historyList.length} 
                    />
                    <TabButton 
                        isActive={activeTab === 'notifications'} 
                        onClick={() => setActiveTab('notifications')} 
                        icon={<FaBell />} 
                        label="Thông báo" 
                        badge={notifications.some(n => !n.isRead)} 
                    />
                </div>

                {/* 3. Tab Content */}
                <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 min-h-[400px] p-6">
                    {activeTab === 'favorites' && (
                        <FavoritesTab favorites={favorites} onRemove={handleRemoveFavorite} />
                    )}
                    {activeTab === 'history' && (
                        <HistoryTab 
                            historyList={historyList} 
                            setHistoryList={setHistoryList} 
                        />
                    )}
                    {activeTab === 'notifications' && (
                        <NotificationsTab 
                            notifications={notifications} 
                            setNotifications={setNotifications} 
                        />
                    )}
                </div>
            </div>

            {/* 4. Modal */}
            <EditProfileModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                user={user} 
            />
        </div>
    );
}

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    count?: number;
    badge?: boolean;
}

const TabButton = ({ isActive, onClick, icon, label, count, badge }: TabButtonProps) => (
    <button 
        onClick={onClick} 
        className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
    >
        {icon} {label} 
        {count !== undefined && <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{count}</span>}
        {badge && <span className="w-2 h-2 bg-red-500 rounded-full ml-1"></span>}
    </button>
);