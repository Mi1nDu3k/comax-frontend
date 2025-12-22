'use client'; 
import { useEffect, useState } from 'react';
import { comicService } from '@/services/comic.service';
import { Comic } from '@/types/comic';
import Link from 'next/link';
import Image from 'next/image';
import HeroSlider from '@/components/home/HeroSlider'; // Đảm bảo đã import đúng đường dẫn

export default function HomePage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [featuredComics, setFeaturedComics] = useState<Comic[]>([]); // State riêng cho Slider
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chỉ cần 1 hàm fetch duy nhất cho toàn bộ dữ liệu trang chủ
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lấy 5 truyện tiêu biểu cho Slider
        const featuredRes = await comicService.getAll({ pageSize: 5 });
        setFeaturedComics(featuredRes.data || featuredRes.items || []);

        // 2. Lấy 10 truyện mới cập nhật cho danh sách bên dưới
        const listRes = await comicService.getAll({ pageNumber: 1, pageSize: 10 });
        // Kiểm tra cấu trúc trả về (PageList thường có thuộc tính .items)
        setComics(listRes.items || listRes.data || listRes);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center">Đang tải truyện...</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      {/* Hiển thị Slider nếu có dữ liệu */}
      {featuredComics.length > 0 && <HeroSlider comics={featuredComics} />}

      <h1 className="text-3xl font-bold mt-8 mb-6 text-gray-800">Truyện mới cập nhật</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {comics.map((comic) => {
          // Logic kiểm tra nhãn "NEW" (Nếu chapter mới nhất cập nhật trong 48 giờ)
          const isNew = comic.latestChapterDate && 
            (new Date().getTime() - new Date(comic.latestChapterDate).getTime()) < 48 * 60 * 60 * 1000;

          return (
            <Link href={`/comics/${comic.id}`} key={comic.id} className="group relative">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                <div className="aspect-[2/3] relative bg-gray-200">
                  <Image
                    src={comic.thumbnailUrl || '/placeholder.jpg'}
                    alt={comic.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  
                  {/* Nhãn NEW */}
                  {isNew && (
                    <div className="absolute top-2 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-l-md shadow-md z-10">
                      NEW
                    </div>
                  )}

                  {/* Chapter Number trên ảnh */}
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                    Ch. {comic.latestChapterNumber || 0}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-base truncate group-hover:text-blue-600">
                    {comic.title}
                  </h3>
                  
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-blue-500 font-medium">
                      Chapter {comic.latestChapterNumber || '??'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {comic.authorName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}