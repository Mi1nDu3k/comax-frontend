'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { reportService } from '@/services/report.service';
import { Comic } from '@/types/comic';

export default function TopComicsPage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [filterType, setFilterType] = useState<'view' | 'rating'>('view');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await reportService.getTopComics(filterType, 10);
        setComics(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterType]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
            Bảng Xếp Hạng
        </h1>
        
        {/* Switch Filter */}
        <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
                onClick={() => setFilterType('view')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${filterType === 'view' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Top Lượt xem
            </button>
            <button
                onClick={() => setFilterType('rating')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${filterType === 'rating' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Top Đánh giá
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {loading ? (
            <div className="p-10 text-center">Đang tải bảng xếp hạng...</div>
        ) : (
            <div className="divide-y divide-gray-100">
                {comics.map((comic, index) => (
                    <div key={comic.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                        {/* Rank Number */}
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg
                            ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                              index === 1 ? 'bg-gray-200 text-gray-600' : 
                              index === 2 ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}
                        `}>
                            {index + 1}
                        </div>

                        {/* Thumbnail */}
                        <Link href={`/comics/${comic.id}`} className="shrink-0">
                            <div className="w-16 h-24 relative rounded overflow-hidden shadow-sm">
                                <Image 
                                    src={comic.thumbnailUrl || '/placeholder.jpg'} 
                                    alt={comic.title} 
                                    fill 
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <Link href={`/comics/${comic.id}`}>
                                <h3 className="font-bold text-gray-800 truncate text-lg">{comic.title}</h3>
                            </Link>
                            <p className="text-sm text-gray-500">{comic.authorName || 'Đang cập nhật'}</p>
                            <div className="mt-1 flex items-center gap-4 text-sm">
                                <span className="text-gray-600">👁️ {comic.viewCount.toLocaleString()}</span>
                                {/* Nếu có rating thì hiển thị: <span>⭐ {comic.averageRating}</span> */}
                            </div>
                        </div>

                        {/* Action */}
                        <Link 
                            href={`/comics/${comic.id}`}
                            className="hidden md:block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100"
                        >
                            Đọc ngay
                        </Link>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}