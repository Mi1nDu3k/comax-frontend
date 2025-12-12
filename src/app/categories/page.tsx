'use client';
import { useEffect, useState } from 'react';
import { categoryService } from '@/services/category.service';
import { comicService } from '@/services/comic.service';
import { Category, Comic } from '@/types/comic';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [comics, setComics] = useState<Comic[]>([]);

  // 1. Load danh sách thể loại
  useEffect(() => {
    categoryService.getAll().then(setCategories);
  }, []);

  // 2. Load truyện khi thay đổi thể loại
  useEffect(() => {
    const fetchComics = async () => {
      const params: { pageSize: number; categoryId?: string } = { pageSize: 20 };
      if (selectedCat) params.categoryId = selectedCat;
      
      const data = await comicService.getAll(params);
      setComics(data.items || []);
    };
    fetchComics();
  }, [selectedCat]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Kho Truyện</h1>

      {/* Bộ lọc thể loại */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCat('')}
          className={`px-4 py-2 rounded-full text-sm ${!selectedCat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Tất cả
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-4 py-2 rounded-full text-sm transition
              ${selectedCat === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Danh sách truyện */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {comics.map((comic) => (
          <Link href={`/comics/${comic.id}`} key={comic.id} className="group">
             {/* Copy card truyện từ trang chủ sang đây */}
             <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
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
                  <h3 className="font-semibold text-lg truncate group-hover:text-blue-600">{comic.title}</h3>
                </div>
             </div>
          </Link>
        ))}
      </div>
      {comics.length === 0 && <p className="text-center text-gray-500 w-full mt-10">Không tìm thấy truyện nào.</p>}
    </div>
  );
}