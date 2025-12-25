'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { comicService, PagedResult } from '@/services/comic.service';
import { categoryService } from '@/services/category.service';
import { Comic } from '@/types/comic';
import Link from 'next/link';
import ComicImage from '@/components/ui/ComicImage';
import Skeleton from '@/components/ui/Skeleton';

interface Category {
  id: number;
  name: string;
  slug?: string;
}

function CategoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Lấy các ID đang được chọn từ URL (ví dụ: ?cats=1,2,3)
  const selectedIdsFromUrl = searchParams.get('cats')
    ? searchParams.get('cats')!.split(',').map(Number)
    : [];
    
  const [selectedCats, setSelectedCats] = useState<number[]>(selectedIdsFromUrl);

  // 1. Tải danh sách Categories khi vào trang
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    fetchCats();
  }, []);

  // 2. Tải truyện mỗi khi bộ lọc (selectedCats) thay đổi
  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);
      try {
        console.log("Đang lọc category IDs:", selectedCats);

        // Gọi API (Kiểu trả về là any để linh hoạt)
        const res: Comic[] | PagedResult<Comic> = await comicService.getAll({
          pageNumber: 1,
          pageSize: 20,
          categoryIds: selectedCats
        });

        // --- SỬA LỖI TẠI ĐÂY ---
        // Kiểm tra xem API trả về Mảng [...] hay Object { items: [...] }
        const comicsData = Array.isArray(res) ? res : (res.items || []);
        
        setComics(comicsData);

      } catch (error) {
        console.error("Lỗi tải truyện theo category:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, [selectedCats]);

  // 3. Xử lý khi click vào Checkbox
  const handleToggleCategory = (catId: number) => {
    let newSelected: number[];
    if (selectedCats.includes(catId)) {
      // Nếu đã chọn -> Bỏ chọn
      newSelected = selectedCats.filter(id => id !== catId);
    } else {
      // Nếu chưa chọn -> Thêm vào
      newSelected = [...selectedCats, catId];
    }

    setSelectedCats(newSelected);

    // Cập nhật URL
    const params = new URLSearchParams();
    if (newSelected.length > 0) {
      params.set('cats', newSelected.join(','));
    }
    router.push(`/categories?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Thể loại truyện</h1>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* --- SIDEBAR BỘ LỌC --- */}
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-24">
            <h3 className="font-bold text-lg mb-4 flex justify-between items-center">
              Bộ lọc
              {selectedCats.length > 0 && (
                <button 
                  onClick={() => { setSelectedCats([]); router.push('/categories'); }}
                  className="text-xs text-red-500 hover:underline font-normal"
                >
                  Xóa chọn
                </button>
              )}
            </h3>
            
            <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox"
                      checked={selectedCats.includes(cat.id)}
                      onChange={() => handleToggleCategory(cat.id)}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-blue-600 checked:bg-blue-600"
                    />
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <span className={`text-sm ${selectedCats.includes(cat.id) ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* --- DANH SÁCH TRUYỆN --- */}
        <div className="flex-1">
          {loading ? (
             // Skeleton Loading
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {[...Array(8)].map((_, i) => (
                 <div key={i}>
                   <Skeleton className="w-full aspect-[2/3] rounded-lg mb-2" />
                   <Skeleton className="h-4 w-3/4 mb-1" />
                   <Skeleton className="h-3 w-1/2" />
                 </div>
               ))}
             </div>
          ) : comics.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {comics.map((comic) => (
                <Link href={`/comics/${comic.id}`} key={comic.id} className="group">
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100">
                    <div className="aspect-[2/3] relative bg-gray-200">
                      <ComicImage
                        src={comic.thumbnailUrl || ''}
                        alt={comic.title}
                        fill
                        className="group-hover:scale-105 transition-transform duration-300 w-full h-full object-cover"
                        unoptimized={true}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8">
                          <span className="text-white text-xs font-bold">Ch. {comic.latestChapterNumber || 0}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600" title={comic.title}>
                        {comic.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">{comic.authorName || 'Đang cập nhật'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
               <p className="text-gray-500 font-medium">Không tìm thấy truyện nào phù hợp.</p>
               <button 
                 onClick={() => setSelectedCats([])} 
                 className="mt-2 text-blue-600 hover:underline text-sm"
               >
                 Xóa bộ lọc
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải bộ lọc...</div>}>
      <CategoryPageContent />
    </Suspense>
  );
}