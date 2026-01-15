'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { comicService } from '@/services/comic.service';
import { Comic } from '@/types/comic';
import ComicImage from '@/components/ui/ComicImage';
import Skeleton from '@/components/ui/Skeleton';
import { FaMagic } from 'react-icons/fa';

export default function RelatedComics({ currentId }: { currentId: number }) {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!currentId) return;
      try {
        setLoading(true);
        const data = await comicService.getRelated(currentId);
        setComics(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [currentId]);

  if (loading) return <Skeleton className="h-60 w-full rounded-lg" />;
  
  if (comics.length === 0) return null; // Không có thì ẩn đi

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-l-4 border-blue-500 pl-3">
        <FaMagic className="text-purple-500" /> CÓ THỂ BẠN SẼ THÍCH
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {comics.map((comic) => (
          <Link href={`/comics/${comic.id}`} key={comic.id} className="group">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
              <div className="aspect-[2/3] relative">
                <ComicImage 
                  src={comic.thumbnailUrl || ''} 
                  alt={comic.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                   Chương {comic.latestChapterNumber}
                </div>
              </div>
              <div className="p-2">
                <h4 className="font-semibold text-gray-800 text-xs line-clamp-2 group-hover:text-blue-600 h-8">
                  {comic.title}
                </h4>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}