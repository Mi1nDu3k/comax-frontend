'use client'; // Dùng client component để fetch data đơn giản với useEffect hoặc SWR
import { useEffect, useState } from 'react';
import { comicService } from '@/services/comic.service';
import { Comic } from '@/types/comic';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const data = await comicService.getAll({ pageNumber: 1, pageSize: 10 });
        // Kiểm tra cấu trúc trả về của PageList backend để set state đúng
        setComics(data.items || data);
      } catch (error) {
        console.error("Failed to fetch comics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, []);

  if (loading) return <div className="p-10 text-center">Đang tải truyện...</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Truyện mới cập nhật</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {comics.map((comic) => (
          <Link href={`/comics/${comic.id}`} key={comic.id} className="group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              {/* Lưu ý: Cần cấu hình next.config.js để load ảnh từ domain MinIO */}
              <div className="aspect-[2/3] relative bg-gray-200">
                <Image
                  src={comic.thumbnailUrl || '/placeholder.jpg'}
                  alt={comic.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate group-hover:text-blue-600">
                  {comic.title}
                </h3>
                <p className="text-sm text-gray-500">{comic.authorName || 'Đang cập nhật'}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}