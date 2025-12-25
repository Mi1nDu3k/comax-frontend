'use client'; 
import { useEffect, useState } from 'react';
import { Comic } from '@/types/comic';
import Link from 'next/link';
import { comicService, PagedResult } from '@/services/comic.service';
import ComicImage from '@/components/ui/ComicImage';
import Skeleton from '@/components/ui/Skeleton';
import HeroSlider from '@/components/home/HeroSlider';

export default function HomePage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [featuredComics, setFeaturedComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lấy truyện nổi bật (Slider)
        // SỬA: Đổi .getComics -> .getAll
        const featuredRes: Comic[] | PagedResult<Comic> = await comicService.getAll({ pageSize: 5 });
        
        // SỬA: Kiểm tra kỹ xem trả về là Mảng hay Object PagedList
        const featuredItems = Array.isArray(featuredRes) 
          ? featuredRes 
          : (featuredRes.items || []);
          
        setFeaturedComics(featuredItems);
      
        // 2. Lấy danh sách truyện mới
        const listRes: Comic[] | PagedResult<Comic> = await comicService.getAll({ pageNumber: 1, pageSize: 10 });
        
        // SỬA: Logic tương tự
        const listItems = Array.isArray(listRes) 
          ? listRes 
          : (listRes.items || []);

        setComics(listItems);

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- COMPONENT SKELETON (GIỮ NGUYÊN) ---
  const HomeSkeleton = () => (
    <main className="min-h-screen p-8 bg-gray-100">
      {/* Skeleton Slider */}
      <Skeleton className="w-full h-[300px] md:h-[400px] mb-8 rounded-xl shadow-md" />
      
      <div className="h-8 w-64 mb-6">
         <Skeleton className="h-full w-full" />
      </div>

      {/* Skeleton List */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="w-full aspect-[2/3] rounded-lg" />
            <div className="space-y-2">
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );

  if (loading) return <HomeSkeleton />;

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      {/* Hiển thị Slider nếu có dữ liệu */}
      {featuredComics.length > 0 && <HeroSlider comics={featuredComics} />}

      <h1 className="text-3xl font-bold mt-8 mb-6 text-gray-800">Truyện mới cập nhật</h1>

      {/* Grid hiển thị truyện */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {comics.map((comic) => {
          // Logic check truyện mới (trong vòng 48h)
          const isNew = comic.latestChapterDate && 
            (new Date().getTime() - new Date(comic.latestChapterDate).getTime()) < 48 * 60 * 60 * 1000;

          return (
            <Link href={`/comics/${comic.id}`} key={comic.id} className="group relative">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                <div className="aspect-[2/3] relative bg-gray-200">
                  
                  {/* --- COMIC IMAGE --- */}
                  <ComicImage
                    src={comic.thumbnailUrl || ''}
                    alt={comic.title}
                    fill
                    className="group-hover:scale-105 transition-transform duration-300 w-full h-full object-cover"
                    unoptimized={true}
                  />
                  
                  {/* Nhãn NEW */}
                  {isNew && (
                    <div className="absolute top-2 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-l-md shadow-md z-10">
                      NEW
                    </div>
                  )}

                  {/* Chapter Number */}
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded z-10">
                    Ch. {comic.latestChapterNumber || 0}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-base truncate group-hover:text-blue-600 text-gray-900" title={comic.title}>
                    {comic.title}
                  </h3>
                  
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-blue-500 font-medium">
                      Chapter {comic.latestChapterNumber || '??'}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[50%]">
                      {comic.authorName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Thông báo nếu không có truyện nào */}
      {comics.length === 0 && (
        <div className="text-center text-gray-500 mt-10 col-span-full">
            Chưa có truyện nào được cập nhật.
        </div>
      )}
    </main>
  );
}