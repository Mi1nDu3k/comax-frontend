'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chapterService } from '@/services/chapter.service';
import { Chapter } from '@/types/chapter';
import { FaArrowLeft, FaArrowRight, FaHome, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { Page } from '@/types/chapter';

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  
  const comicId = params?.id as string; 
  const chapterId = Number(params?.chapterId);

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!chapterId || !comicId || isNaN(chapterId)) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setIsTransitioning(false);
        const [detailData, listData] = await Promise.all([
          chapterService.getById(chapterId.toString()),
          chapterService.getByComicId(comicId)
        ]);

        setCurrentChapter(detailData);
        setChapters(listData);

        let extractedImages: string[] = [];
        // FIX LỖI ANY: Ép kiểu hoặc dùng interface Page
        if (detailData.pages && detailData.pages.length > 0) {
          extractedImages = [...detailData.pages]
            .sort((a: Page, b: Page) => a.index - b.index)
            .map((p: Page) => p.imageUrl);
        } else if (detailData.content) {
          try {
            const parsed = JSON.parse(detailData.content);
            extractedImages = Array.isArray(parsed) ? parsed : [detailData.content];
          } catch {
            extractedImages = detailData.content.includes(',') 
              ? detailData.content.split(',').map((s: string) => s.trim()) 
              : [detailData.content];
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
    window.scrollTo(0, 0);
  }, [chapterId, comicId]);

  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentIndex = sortedChapters.findIndex(c => c.id === chapterId);
  const prevChapter = sortedChapters[currentIndex - 1];
  const nextChapter = sortedChapters[currentIndex + 1];

  useEffect(() => {
    if (!nextChapter || loading || isTransitioning) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsTransitioning(true);
          setTimeout(() => {
            router.push(`/comics/${comicId}/chapter/${nextChapter.id}`);
          }, 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextChapter, loading, isTransitioning, comicId, router]);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Đang tải chương...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-20">
      <div className="sticky top-0 z-50 bg-gray-800 shadow-md">
        <div className="p-4 flex justify-between items-center">
          <Link href={`/comics/${comicId}`} className="flex items-center gap-2 hover:text-blue-400">
            <FaHome /> <span className="hidden md:inline line-clamp-1">{currentChapter?.title}</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {/* FIX LỖI ACCESSIBILITY: Thêm title */}
            <button 
                title="Chương trước"
                disabled={!prevChapter} 
                onClick={() => router.push(`/comics/${comicId}/chapter/${prevChapter.id}`)} 
                className="p-2 bg-gray-700 rounded disabled:opacity-30"
            >
                <FaArrowLeft />
            </button>
            
            <select 
                title="Chọn chương"
                aria-label="Chọn chương"
                value={currentChapter?.id} 
                onChange={(e) => router.push(`/comics/${comicId}/chapter/${e.target.value}`)} 
                className="bg-gray-700 rounded py-2 px-2 outline-none cursor-pointer"
            >
              {sortedChapters.map(c => <option key={c.id} value={c.id}>Chương {c.chapterNumber}</option>)}
            </select>

            <button 
                title="Chương sau"
                disabled={!nextChapter} 
                onClick={() => router.push(`/comics/${comicId}/chapter/${nextChapter.id}`)} 
                className="p-2 bg-gray-700 rounded disabled:opacity-30"
            >
                <FaArrowRight />
            </button>
          </div>
        </div>
        <div className="w-full h-1 bg-gray-700">
          {/* Đối với scrollProgress, inline style là chấp nhận được vì nó thay đổi liên tục */}
          <div className="h-full bg-blue-500 transition-all duration-150" style={{ width: `${scrollProgress}%` }}></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-black min-h-screen flex flex-col items-center w-full">
        {images.map((imgUrl, index) => (
          <div 
            key={index} 
            className="relative w-full bg-gray-800 flex items-center justify-center min-h-[600px]"
          >
            <Image
              src={imgUrl}
              alt={`Trang ${index + 1}`}
              width={1200}
              height={1800}
              sizes="100vw"
              className="w-full h-auto block"
              loading={index < 2 ? "eager" : "lazy"}
              unoptimized={true}
            />
          </div>
        ))}

        <div ref={sentinelRef} className="w-full py-10 flex flex-col items-center justify-center bg-gray-900">
          {nextChapter ? (
            <div className="text-center p-8">
              {isTransitioning ? (
                <div className="flex flex-col items-center gap-3">
                  <FaSpinner className="animate-spin text-3xl text-blue-500" />
                  <p className="text-xl font-bold">Đang chuẩn bị chương {nextChapter.chapterNumber}...</p>
                </div>
              ) : (
                <p className="text-gray-400">Cuộn thêm để sang chương tiếp theo</p>
              )}
            </div>
          ) : (
            <p className="p-8 text-gray-500 italic">Bạn đã đọc hết chương mới nhất.</p>
          )}
        </div>
      </div>
    </div>
  );
}