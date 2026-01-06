'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

// 1. Định nghĩa Interface để thay thế 'any'
interface DeletedComic {
  id: number;
  title: string;
  deletedAt: string; // Hoặc Date nếu API trả về object Date
}

export default function RecycleBin() {
  // 2. Áp dụng kiểu dữ liệu cho state
  const [deletedComics, setDeletedComics] = useState<DeletedComic[]>([]);

  useEffect(() => {
    // 3. Di chuyển hàm fetch vào trong useEffect để tránh warning
    const fetchDeleted = async () => {
      try {
        const res = await api.get('/admin/recycle-bin/comics');
        setDeletedComics(res.data);
      } catch (error) {
        console.error("Failed to fetch deleted comics:", error);
      }
    };

    fetchDeleted();
  }, []); // Dependency array rỗng là đúng cho việc fetch 1 lần khi mount

  const handleRestore = async (id: number) => {
    try {
      await api.post(`/admin/recycle-bin/comics/${id}/restore`);
      // Gọi lại API để cập nhật danh sách thay vì gọi fetchDeleted từ bên ngoài
      const res = await api.get('/admin/recycle-bin/comics');
      setDeletedComics(res.data);
      alert('Đã khôi phục truyện thành công!');
    } catch (error) {
      console.error(error);
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn? Không thể hoàn tác!')) {
      try {
        await api.delete(`/admin/recycle-bin/comics/${id}/permanent`);
        const res = await api.get('/admin/recycle-bin/comics');
        setDeletedComics(res.data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Thùng rác (Lưu trữ 3 ngày)</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border p-2">Tên truyện</th>
            <th className="border p-2">Ngày xóa</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {/* 4. Sử dụng kiểu DeletedComic thay vì any */}
          {deletedComics.map((comic) => (
            <tr key={comic.id}>
              <td className="border p-2">{comic.title}</td>
              <td className="border p-2">
                {new Date(comic.deletedAt).toLocaleDateString()}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleRestore(comic.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                >
                  Khôi phục
                </button>
                <button
                  onClick={() => handlePermanentDelete(comic.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Xóa vĩnh viễn
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}