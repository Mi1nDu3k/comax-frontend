import Link from 'next/link';
import Image from 'next/image';
import { FaBookOpen, FaHistory, FaTrash, FaBroom } from 'react-icons/fa'; // Import thêm icon FaBroom
import { ReadingHistoryItem } from '@/types/history';
import { historyService } from '@/services/history.service';
import { toast } from 'react-toastify';
import { useState } from 'react';

interface HistoryTabProps {
    historyList: ReadingHistoryItem[];
    // Cần truyền setter xuống để cập nhật UI sau khi xóa
    setHistoryList: (list: ReadingHistoryItem[]) => void;
}

export const HistoryTab = ({ historyList, setHistoryList }: HistoryTabProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    // Xử lý XÓA MỘT
    const handleDeleteOne = async (e: React.MouseEvent, id: number) => {
        e.preventDefault(); // Chặn click vào link truyện
        if (!confirm("Bạn muốn xóa truyện này khỏi lịch sử?")) return;

        try {
            await historyService.deleteHistory(id);
            // Cập nhật UI: Lọc bỏ item vừa xóa
            setHistoryList(historyList.filter(item => item.id !== id));
            toast.success("Đã xóa truyện khỏi lịch sử");
        } catch (error) {
            toast.error("Lỗi khi xóa lịch sử");
        }
    };

    // Xử lý XÓA TẤT CẢ
    const handleDeleteAll = async () => {
        if (!confirm("CẢNH BÁO: Bạn có chắc muốn xóa TOÀN BỘ lịch sử đọc truyện không? Hành động này không thể hoàn tác.")) return;

        setIsDeleting(true);
        try {
            await historyService.deleteAllHistory();
            setHistoryList([]); // Xóa sạch list trên UI
            toast.success("Đã dọn dẹp toàn bộ lịch sử!");
        } catch (error) {
            toast.error("Lỗi kết nối server");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!historyList || historyList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FaHistory size={48} className="mb-4 opacity-20" />
                <p>Lịch sử trống.</p>
                <Link href="/" className="mt-4 text-blue-500 hover:underline">
                    Đọc truyện ngay
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* NÚT XÓA TẤT CẢ (Đặt ở góc trên phải) */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                <h3 className="font-bold text-gray-700">Đã đọc gần đây ({historyList.length})</h3>
                <button 
                    onClick={handleDeleteAll}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                    <FaBroom /> {isDeleting ? "Đang xóa..." : "Xóa tất cả"}
                </button>
            </div>

            {/* DANH SÁCH LỊCH SỬ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historyList.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-gray-50 hover:bg-white hover:shadow-md transition group relative">
                        
                        {/* Ảnh Truyện */}
                        <Link href={`/comics/${item.comicSlug}`} className="shrink-0 w-20 h-28 relative rounded overflow-hidden shadow-sm">
                            <Image
                                src={item.comicImage || '/images/placeholder.png'}
                                alt={item.comicTitle}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </Link>

                        {/* Thông tin */}
                        <div className="flex flex-col justify-between flex-1 py-1">
                            <div>
                                <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600">
                                    <Link href={`/comics/${item.comicSlug}`}>{item.comicTitle}</Link>
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(item.lastReadTime).toLocaleString('vi-VN')}
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded border">
                                    Chương {item.chapterNumber}
                                </span>
                                <Link
                                    href={`/comics/${item.comicSlug}/chapter/${item.chapterId}`}
                                    className="text-xs flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition"
                                >
                                    <FaBookOpen /> Đọc tiếp
                                </Link>
                            </div>
                        </div>

                        {/* NÚT XÓA TỪNG CÁI (Hiện khi hover vào thẻ) */}
                        <button 
                            onClick={(e) => handleDeleteOne(e, item.id)}
                            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-gray-400 hover:text-red-600 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                            title="Xóa khỏi lịch sử"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};