'use client';
import { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheckDouble } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notificationService } from '@/services/notification.service';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import { Notification } from '@/types/notification';
import { useAuth } from '@/context/auth.context';

// --- IMPORT HÀM HELPER MỚI ---
import { formatTimeAgo } from '@/utils/Datetime-helpter'; 

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    const { newNotification } = useNotificationSocket();

    // Load dữ liệu ban đầu
    useEffect(() => {
        if (!user) return;
        const fetchNoti = async () => {
            try {
                const data = await notificationService.getAll(1, 10);
                const list = Array.isArray(data) ? data : (data as any).items || [];
                
                setNotifications(list);
                setUnreadCount(list.filter((n: Notification) => !n.isRead).length);
            } catch (err) { console.error("Lỗi tải thông báo:", err); }
        };
        fetchNoti();
    }, [user]);

    // Lắng nghe socket
  useEffect(() => {
        if (newNotification) {
            setNotifications(prev => {
                const isDuplicate = prev.some(n => n.id === newNotification.id);
                if (isDuplicate) return prev; 
                if (!newNotification.isRead) {
                    setUnreadCount(count => count + 1);
                }
                return [newNotification, ...prev];
            });
        }
    }, [newNotification]);

    const handleClickNotification = async (id: number, url: string, isRead: boolean) => {
        if (!isRead) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            notificationService.markAsRead(id).catch(console.error);
        }
        setIsOpen(false); 
        if(url) router.push(url);
    };

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        await notificationService.markAllRead();
    };

    return (
        <div 
            className="relative h-full flex items-center z-50"
            onMouseEnter={() => { if(timeoutRef.current) clearTimeout(timeoutRef.current); setIsOpen(true); }}
            onMouseLeave={() => { timeoutRef.current = setTimeout(() => setIsOpen(false), 200); }}
        >
            <button className="relative p-2 text-gray-600 hover:text-blue-600 transition outline-none">
                <FaBell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border border-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* DROPDOWN MENU */}
            <div className={`absolute right-0 top-full mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden transform origin-top-right transition-all duration-200 ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
                    <h3 className="font-bold text-gray-800 text-sm">Thông báo</h3>
                    <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <FaCheckDouble /> Đã đọc
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-gray-50">
                    {notifications.length === 0 ? (
                        <div className="py-10 text-center text-gray-400 text-sm">Chưa có thông báo nào</div>
                    ) : (
                        notifications.map(item => {
                            const message = item.message || (item as any).Message;
                            const created = item.createdAt || (item as any).CreatedAt;
                            const read = item.isRead !== undefined ? item.isRead : (item as any).IsRead;

                            return (
                                <div 
                                    key={item.id}
                                    onClick={() => handleClickNotification(item.id, item.url, read)}
                                    className={`cursor-pointer px-4 py-3 border-b border-gray-100 hover:bg-gray-100 ${!read ? 'bg-blue-50' : 'bg-white'}`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!read ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                        <div>
                                            <p className={`text-sm ${!read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{message}</p>
                                            {/* SỬ DỤNG HÀM MỚI Ở ĐÂY */}
                                            <p className="text-[10px] text-gray-400 mt-1 first-letter:uppercase">
                                                {formatTimeAgo(created)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            <div className={`absolute top-full right-0 w-full h-3 ${isOpen ? 'block' : 'hidden'}`}></div>
        </div>
    );
}