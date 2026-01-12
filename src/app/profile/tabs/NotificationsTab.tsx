import Link from 'next/link';
import { FaBell, FaCheckDouble, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { notificationService } from '@/services/notification.service';
import { useRouter } from 'next/navigation';
import { Notification } from '@/types/notification';

interface NotificationsTabProps {
    notifications: Notification[];
    setNotifications: (notis: Notification[]) => void;
}

export const NotificationsTab = ({ notifications, setNotifications }: NotificationsTabProps) => {
    const router = useRouter();

    const handleMarkRead = async (id: number, url?: string) => {
        try {
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            await notificationService.markAsRead(id);
            if (url) router.push(url);
        } catch (err) { console.error(err); }
    };

    const handleMarkAllRead = async () => {
        try {
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            await notificationService.markAllRead();
            toast.success("Đã đánh dấu tất cả là đã đọc");
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // Chặn click nhầm vào item
        if (!confirm("Xóa thông báo này?")) return;
        try {
            await notificationService.delete(id);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success("Đã xóa thông báo");
        } catch {
            toast.error("Lỗi xóa thông báo");
        }
    };

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FaBell size={48} className="mb-4 opacity-20" />
                <p>Không có thông báo nào.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="font-bold text-gray-700">Tất cả thông báo ({notifications.length})</h3>
                <button 
                    onClick={handleMarkAllRead} 
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    title="Đánh dấu tất cả là đã đọc"
                >
                    <FaCheckDouble /> Đọc tất cả
                </button>
            </div>
            <div className="space-y-2">
                {notifications.map((noti) => (
                    <div
                        key={noti.id}
                        onClick={() => handleMarkRead(noti.id, noti.url)}
                        className={`group flex gap-4 p-4 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-200 
                            ${!noti.isRead ? 'bg-blue-50' : 'bg-white hover:shadow-sm'}
                        `}
                    >
                        {/* Dot indicator */}
                        <div className={`mt-2 w-2.5 h-2.5 rounded-full flex-shrink-0 ${!noti.isRead ? 'bg-blue-500' : 'bg-gray-200'}`} />
                        
                        <div className="flex-1">
                            <p className={`text-sm mb-1 ${!noti.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                {noti.message}
                            </p>
                            <span className="text-xs text-gray-400">
                                {new Date(noti.createdAt).toLocaleString('vi-VN')}
                            </span>
                        </div>
                        
                        <button
                            onClick={(e) => handleDelete(e, noti.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-2 transition self-center"
                            title="Xóa thông báo"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};