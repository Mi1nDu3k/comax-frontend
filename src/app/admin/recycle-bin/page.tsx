'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface DeletedComic {
  id: number;
  title: string;
  deletedAt: string;
}

export default function RecycleBin() {
  const [deletedComics, setDeletedComics] = useState<DeletedComic[]>([]);

  useEffect(() => {
    // --- KHẮC PHỤC: Định nghĩa hàm ngay bên trong useEffect ---
    const fetchDeleted = async () => {
      try {
        const res = await api.get('/comics/trash', {
          params: { pageNumber: 1, pageSize: 100 } 
        });
        const data = res.data.items || res.data; 
        setDeletedComics(data);
      } catch (error) {
        console.error("Failed to fetch deleted comics:", error);
      }
    };

    fetchDeleted();
  }, []); // Dependency rỗng -> Chỉ chạy 1 lần khi mount

  const handleRestore = async (id: number) => {
    try {
      await api.put(`/comics/${id}/restore`);
      alert('Đã khôi phục truyện thành công!');
      
      // Cập nhật giao diện ngay lập tức (không cần gọi lại fetchDeleted)
      setDeletedComics(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Restore failed:", error);
      alert('Khôi phục thất bại');
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn? Không thể hoàn tác!')) {
      try {
        await api.delete(`/comics/${id}/purge`);
        
        // Cập nhật giao diện ngay lập tức
        setDeletedComics(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error("Delete failed:", error);
        alert('Xóa thất bại');
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Thùng rác (Lưu trữ 3 ngày)</h1>
      
      {deletedComics.length === 0 ? (
        <p className="text-gray-500">Thùng rác trống.</p>
      ) : (
        <table className="min-w-full bg-white border shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Tên truyện</th>
              <th className="border p-3 text-left">Ngày xóa</th>
              <th className="border p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {deletedComics.map((comic) => (
              <tr key={comic.id} className="hover:bg-gray-50">
                <td className="border p-3">{comic.title}</td>
                <td className="border p-3">
                  {new Date(comic.deletedAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="border p-3 space-x-2">
                  <button
                    onClick={() => handleRestore(comic.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
                  >
                    Khôi phục
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(comic.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                  >
                    Xóa vĩnh viễn
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}