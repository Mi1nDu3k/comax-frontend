'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chapterService } from '@/services/chapter.service';
import { historyService } from '@/services/history.service';
import { useAuth } from '@/context/auth.context';
import { Chapter } from '@/types/chapter';
import { FaArrowLeft, FaArrowRight, FaHome, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

interface Page {
  index: number;
  imageUrl: string;
}

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const comicId = params?.id as string;
  const chapterId = Number(params?.chapterId);

  // 1. Ref để chặn double-post
  const hasLoggedRef = useRef<number | null>(null);

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Scroll Progress
  useEffect(() => {
    const updateScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  // Fetch Data
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

  // 3. LOGIC GHI LỊCH SỬ (ĐÃ FIX CHECK TRÙNG)
  useEffect(() => {
    // Điều kiện cơ bản: Phải load xong, có dữ liệu, có user
    if (loading || !currentChapter || !user || isNaN(Number(comicId))) return;

    const finalComicId = currentChapter.comicId || Number(comicId);
    
    // --- CHẶN GỬI 2 LẦN ---
    // Nếu ID chương hiện tại trùng với ID đã log trong Ref -> Dừng lại
    if (hasLoggedRef.current === chapterId) {
        return; 
    }

    if (finalComicId) {
        // Cập nhật Ref ngay lập tức để chặn lần gọi tiếp theo
        hasLoggedRef.current = chapterId;

        console.log(`[History] Gửi request lưu Chap ${chapterId}`);
        
        historyService.saveHistory({
            comicId: finalComicId,
            chapterId: chapterId
        });
    }
  }, [loading, currentChapter, user, comicId, chapterId]);
  
  // Logic chuyển chương
  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentIndex = sortedChapters.findIndex(c => c.id === chapterId);
  const prevChapter = sortedChapters[currentIndex - 1];
  const nextChapter = sortedChapters[currentIndex + 1];

  // Auto-next chapter
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
            <button 
                title="Chương trước"
                disabled={!prevChapter} 
                onClick={() => router.push(`/comics/${comicId}/chapter/${prevChapter.id}`)} 
                className="p-2 bg-gray-700 rounded disabled:opacity-30 hover:bg-gray-600 transition"
            >
                <FaArrowLeft />
            </button>
            
            <select 
                title="Chọn chương"
                value={currentChapter?.id} 
                onChange={(e) => router.push(`/comics/${comicId}/chapter/${e.target.value}`)} 
                className="bg-gray-700 rounded py-2 px-2 outline-none cursor-pointer hover:bg-gray-600 transition"
            >
              {sortedChapters.map(c => <option key={c.id} value={c.id}>Chương {c.chapterNumber}</option>)}
            </select>

            <button 
                title="Chương sau"
                disabled={!nextChapter} 
                onClick={() => router.push(`/comics/${comicId}/chapter/${nextChapter.id}`)} 
                className="p-2 bg-gray-700 rounded disabled:opacity-30 hover:bg-gray-600 transition"
            >
                <FaArrowRight />
            </button>
          </div>
        </div>
        <div className="w-full h-1 bg-gray-700">
          <div className="h-full bg-blue-500 transition-all duration-150" style={{ width: `${scrollProgress}%` }}></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-black min-h-screen flex flex-col items-center w-full shadow-2xl">
        {images.map((imgUrl, index) => (
          <div 
            key={index} 
            className="relative w-full bg-gray-800 flex items-center justify-center min-h-[400px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={`Trang ${index + 1}`}
              className="w-full h-auto block"
              loading={index < 2 ? "eager" : "lazy"}
            />
          </div>
        ))}

        <div ref={sentinelRef} className="w-full py-16 flex flex-col items-center justify-center bg-gray-900 border-t border-gray-800">
          {nextChapter ? (
            <div className="text-center p-8">
              {isTransitioning ? (
                <div className="flex flex-col items-center gap-3">
                  <FaSpinner className="animate-spin text-4xl text-blue-500" />
                  <p className="text-xl font-bold text-white">Đang mở chương {nextChapter.chapterNumber}...</p>
                </div>
              ) : (
                <div className="animate-bounce flex flex-col items-center gap-2 opacity-70">
                    <FaArrowRight className="rotate-90 text-2xl" />
                    <p className="text-gray-400">Cuộn xuống để sang chương tiếp theo</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
                <p className="text-xl font-bold text-gray-300 mb-4">Bạn đã đọc hết chương mới nhất!</p>
                <Link href={`/comics/${comicId}`} className="px-6 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 transition">
                    Quay về trang truyện
                </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}