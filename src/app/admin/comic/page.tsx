'use client';
import { useEffect, useState } from 'react';
import { comicService } from '@/services/comic.service';
import { Comic } from '@/types/comic';
import { FaTrash, FaEdit, FaPlus, FaEye } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function ComicManagementPage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComics = async () => {
    try {
      // Lấy tất cả (phân trang lớn để demo)
      const data = await comicService.getAll({ pageSize: 100 });
      setComics(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComics();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn truyện và các chương liên quan. Bạn có chắc chắn không?')) return;
    try {
      await comicService.delete(id);
      alert('Đã xóa truyện thành công.');
      fetchComics(); // Reload list
    } catch (error) {
      console.error('Xóa thất bại. Có thể do lỗi server hoặc quyền hạn.', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Truyện tranh</h1>
        <Link
          href="/admin/comic/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          <FaPlus size={12} /> Thêm truyện mới
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4 w-16">Ảnh</th>
              <th className="p-4">Tên truyện</th>
              <th className="p-4">Tác giả</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-center">Lượt xem</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? <tr><td colSpan={6} className="p-4 text-center">Đang tải...</td></tr> :
              comics.map((comic) => (
                <tr key={comic.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="relative w-10 h-14 rounded overflow-hidden bg-gray-200">
                      <Image
                        src={comic.thumbnailUrl || '/placeholder.jpg'}
                        alt={comic.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-800">
                    {comic.title}
                  </td>
                  <td className="p-4 text-gray-500">{comic.authorName || 'N/A'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium 
                        ${comic.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {comic.status === 1 ? 'Đang tiến hành' : 'Hoàn thành'}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-500">
                    {comic.viewCount.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/comic/${comic.id}`} target="_blank" className="p-2 text-blue-500 hover:bg-blue-50 rounded" title="Xem thử">
                        <FaEye />
                      </Link>
                      <Link
                        href={`/admin/comic/edit/${comic.id}`} // Đường dẫn tới trang Edit
                        className="p-2 text-yellow-500 hover:bg-yellow-50 rounded"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(comic.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                        title="Xóa truyện"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}