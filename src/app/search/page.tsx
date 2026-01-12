'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaBookOpen, FaRegClock } from 'react-icons/fa';
import { comicService } from '@/services/comic.service';
import { Comic } from '@/types/comic';
import { getMinioUrl } from '@/utils/image-helper';
import Skeleton from '@/components/ui/Skeleton';

// Component con để dùng useSearchParams (yêu cầu của Next.js 13+ khi build)
function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComics = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Gọi API với limit lớn (hoặc 0 để lấy hết theo logic backend mới sửa)
        // Lưu ý: Bạn cần update comicService để chấp nhận tham số limit nếu cần,
        // hoặc cứ gọi hàm search cũ, backend sẽ tự xử lý.
        const data = await comicService.search(query); 
        setComics(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, [query]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
            </div>
        ))}
      </div>
    );
  }

  if (comics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <FaSearch size={48} className="mb-4 opacity-20" />
        <p className="text-lg">Không tìm thấy truyện nào với từ khóa: <span className="font-bold text-gray-600">"{query}"</span></p>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">Quay về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {comics.map((comic) => (
        <Link href={`/comics/${comic.id}`} key={comic.id} className="group flex flex-col">
          <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all border border-gray-100">
            <Image
              src={getMinioUrl(comic.thumbnailUrl)}
              alt={comic.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            {/* Overlay Chapter mới nhất */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                <span className="text-white text-xs font-semibold flex items-center gap-1">
                    <FaBookOpen className="text-yellow-400" /> 
                    Chap {comic.latestChapterNumber || '?'}
                </span>
            </div>
          </div>
          
          <div className="mt-3">
            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug" title={comic.title}>
              {comic.title}
            </h3>
            <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <span>{comic.authorName || 'Đang cập nhật'}</span>
                {comic.updatedAt && (
                   <span className="flex items-center gap-1"><FaRegClock /> {new Date(comic.updatedAt).toLocaleDateString('vi-VN')}</span>
                )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Component chính
export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
       <h1 className="text-2xl font-bold mb-6 border-b pb-4 flex items-center gap-2">
          <FaSearch className="text-blue-600" /> Kết quả tìm kiếm
       </h1>
       
       <Suspense fallback={<div className="text-center py-10">Đang tải bộ lọc...</div>}>
          <SearchResults />
       </Suspense>
    </div>
  );
}