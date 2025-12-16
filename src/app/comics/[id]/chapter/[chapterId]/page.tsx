'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chapterService } from '@/services/chapter.service';
import { Chapter } from '@/types/chapter'; // Giữ nguyên import này
import { FaArrowLeft, FaArrowRight, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

// 1. Định nghĩa thêm Interface cục bộ để tránh dùng ANY
// (Giúp TypeScript hiểu cấu trúc trả về mà không cần sửa file types gốc ngay lập tức)
interface PageItem {
  id: number | string;
  imageUrl?: string; // Có thể backend trả về imageUrl
  url?: string;      // Hoặc trả về url
  index: number;
}

// Mở rộng type Chapter để bao gồm mảng pages (nếu backend có trả về)
interface ChapterDetail extends Chapter {
  pages?: PageItem[];
  images?: { url: string }[];
}

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  
  const comicId = params?.id as string; 
  const rawChapterId = params?.chapterId;
  const chapterId = Number(rawChapterId);

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!chapterId || !comicId || isNaN(chapterId)) {
          setLoading(false);
          return;
      }
      
      try {
        setLoading(true);
        const [detailData, listData] = await Promise.all([
          chapterService.getById(chapterId.toString()),
          chapterService.getByComicId(comicId)
        ]);

        setCurrentChapter(detailData);
        setChapters(listData);

        // --- XỬ LÝ ẢNH (TYPE SAFE) ---
        let extractedImages: string[] = [];
        
        // Ép kiểu detailData sang Interface mở rộng đã định nghĩa ở trên
        const data = detailData as unknown as ChapterDetail;

        // 1. Ưu tiên: Check mảng 'pages'
        if (data.pages && Array.isArray(data.pages) && data.pages.length > 0) {
            extractedImages = data.pages
                .sort((a, b) => a.index - b.index)
                .map((p) => p.imageUrl || p.url || '') // Lấy link ảnh an toàn
                .filter(url => url !== '');
        } 
        // 2. Fallback: Check trường 'content' cũ
        else if (data.content) {
            try {
                const parsed = JSON.parse(data.content);
                extractedImages = Array.isArray(parsed) ? parsed : [data.content];
            } catch {
                extractedImages = data.content.includes(',') 
                    ? data.content.split(',').map((s) => s.trim()) 
                    : [data.content];
            }
        }

        setImages(extractedImages.filter(img => img && img.length > 0));

      } catch (error) {
        console.error("Lỗi tải chương:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chapterId, comicId]);

  // Logic chuyển chương
  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentIndex = sortedChapters.findIndex(c => c.id === chapterId);
  const prevChapter = sortedChapters[currentIndex - 1];
  const nextChapter = sortedChapters[currentIndex + 1];

  const handleChangeChapter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    router.push(`/comics/${comicId}/chapter/${newId}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Đang tải chương...</p>
    </div>
  );
  
  if (!currentChapter) return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <p className="text-xl mb-4">Không tìm thấy nội dung chương.</p>
        <Link href={`/comics/${comicId}`} className="text-blue-400 hover:underline">
            Quay lại trang truyện
        </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-20">
      {/* Header Sticky */}
      <div className="sticky top-0 z-50 bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <Link 
          href={`/comics/${comicId}`} 
          className="flex items-center gap-2 hover:text-blue-400 transition"
        >
            <FaHome /> <span className="hidden md:inline line-clamp-1">{currentChapter.title}</span>
        </Link>
        
        <div className="flex items-center gap-2">
            <button 
                aria-label='Chapter trước'
                disabled={!prevChapter}
                onClick={() => router.push(`/comics/${comicId}/chapter/${prevChapter.id}`)}
                className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
                <FaArrowLeft />
            </button>

            <select 
                aria-label='Chương'
                value={currentChapter.id} 
                onChange={handleChangeChapter}
                className="bg-gray-700 border-none rounded py-2 px-2 md:px-4 outline-none max-w-[120px] md:max-w-[200px] cursor-pointer"
            >
                {sortedChapters.map(c => (
                    <option key={c.id} value={c.id}>Chương {c.chapterNumber}</option>
                ))}
            </select>

            <button 
                aria-label='Chapter tiep theo'
                disabled={!nextChapter}
                onClick={() => router.push(`/comics/${comicId}/chapter/${nextChapter.id}`)}
                className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
                <FaArrowRight />
            </button>
        </div>
      </div>

      {/* Reader Content */}
      <div className="max-w-4xl mx-auto bg-black min-h-screen flex flex-col items-center">
        {images.length > 0 ? (
            images.map((imgUrl, index) => (
                <div key={index} className="relative w-full">
                    {/* Sửa lỗi eslint: dùng Next Image */}
                    <Image
                        src={imgUrl}
                        alt={`Trang ${index + 1}`}
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-full h-auto"
                        loading={index < 2 ? "eager" : "lazy"}
                        // Quan trọng: unoptimized giúp tránh lỗi config domain và behavior giống thẻ img thường nhưng chuẩn cú pháp Next
                        unoptimized={true} 
                    />
                </div>
             ))
         ) : (
             <div className="p-20 text-center text-gray-500">
                <p>Không tải được ảnh.</p>
                <p className="text-xs mt-2">ID: {chapterId}</p>
             </div>
         )}
      </div>

      {/* Footer Nav */}
      <div className="max-w-4xl mx-auto p-6 flex justify-between items-center bg-gray-800 mt-8 rounded-lg mb-10">
         <button 
            disabled={!prevChapter}
            onClick={() => router.push(`/comics/${comicId}/chapter/${prevChapter.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 transition"
         >
            <FaArrowLeft /> Trước
         </button>
         
         <span className="font-bold text-lg">Chương {currentChapter.chapterNumber}</span>

         <button 
            disabled={!nextChapter}
            onClick={() => router.push(`/comics/${comicId}/chapter/${nextChapter.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 transition"
         >
            Sau <FaArrowRight />
         </button>
      </div>
    </div>
  );
}