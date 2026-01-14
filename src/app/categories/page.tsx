'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { comicService } from '@/services/comic.service';
import { categoryService } from '@/services/category.service';
import { Comic } from '@/types/comic';
import Link from 'next/link';
import ComicImage from '@/components/ui/ComicImage';
import Skeleton from '@/components/ui/Skeleton';

// Interface Category cục bộ (hoặc import từ file types)
interface Category {
  id: number;
  name: string;
  slug?: string;
}

function CategoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State dữ liệu
  const [categories, setCategories] = useState<Category[]>([]);
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  // --- SỬA LỖI 1: KHÔNG DÙNG STATE CHO CATEGORY IDS ---
  // Tính toán trực tiếp từ URL mỗi khi render.
  // Điều này giúp nút Back/Forward của trình duyệt hoạt động đúng.
  const selectedCats = useMemo(() => {
    const catsParam = searchParams.get('cats');
    return catsParam ? catsParam.split(',').map(Number) : [];
  }, [searchParams]);

  // 1. Tải danh sách Categories (Chỉ chạy 1 lần)
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoryService.getAll(); // data trả về Category[]
        setCategories(data as unknown as Category[]); // Ép kiểu nếu cần
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    fetchCats();
  }, []);

  // 2. Tải truyện khi URL thay đổi (selectedCats thay đổi)
  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);
      try {
        // Gọi API với params chuẩn
        const res = await comicService.getAll({
          pageNumber: 1,
          pageSize: 20,
          categoryIds: selectedCats // Truyền thẳng mảng số
        });

        // --- SỬA LỖI 2: XỬ LÝ DỮ LIỆU CHUẨN ---
        // Service đã định nghĩa trả về PagedResult, nên res.items là chuẩn.
        // Kiểm tra an toàn: nếu res.items tồn tại thì dùng, không thì fallback về mảng rỗng
        setComics(res.items || []);

      } catch (error) {
        console.error("Lỗi tải truyện:", error);
        setComics([]); // Reset nếu lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, [selectedCats]); // Dependency là selectedCats (được memo từ URL)

  // 3. Xử lý Toggle (Chỉ update URL, không update State)
  const handleToggleCategory = (catId: number) => {
    let newSelected: number[];
    if (selectedCats.includes(catId)) {
      newSelected = selectedCats.filter(id => id !== catId);
    } else {
      newSelected = [...selectedCats, catId];
    }

    // Update URL -> URL thay đổi -> useMemo tính lại selectedCats -> useEffect gọi API
    const params = new URLSearchParams(searchParams.toString());
    if (newSelected.length > 0) {
      params.set('cats', newSelected.join(','));
    } else {
      params.delete('cats');
    }
    router.push(`/categories?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Thể loại truyện</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR */}
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-24">
            <h3 className="font-bold text-lg mb-4 flex justify-between items-center">
              Bộ lọc
              {selectedCats.length > 0 && (
                <button 
                  onClick={() => router.push('/categories')}
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
                    {/* Icon check SVG giữ nguyên */}
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

        {/* LIST TRUYỆN */}
        <div className="flex-1">
          {loading ? (
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
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 h-full flex flex-col">
                    <div className="aspect-[2/3] relative bg-gray-200">
                      <ComicImage
                        src={comic.thumbnailUrl || ''}
                        alt={comic.title}
                        fill
                        className="group-hover:scale-105 transition-transform duration-300 w-full h-full object-cover"
                      />
                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8">
                          <span className="text-white text-xs font-bold">Ch. {comic.latestChapterNumber || 0}</span>
                      </div>
                    </div>
                    <div className="p-3 flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600" title={comic.title}>
                        {comic.title}
                      </h3>
                      {/* Hiển thị thêm view nếu có */}
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                         <span className="truncate max-w-[70%]">{comic.authorName || 'N/A'}</span>
                         <span className="flex items-center gap-1">
                            👁️ {comic.viewCount?.toLocaleString() || 0}
                         </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
               <p className="text-gray-500 font-medium">Không tìm thấy truyện nào phù hợp.</p>
               <button 
                 onClick={() => router.push('/categories')}
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