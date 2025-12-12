'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chapterService } from '@/services/chapter.service';
import { Chapter } from '@/types/chapter';
import { FaArrowLeft, FaArrowRight, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  
  // Lấy params an toàn (Log ra để kiểm tra)
  const comicId = params?.id as string; 
  const rawChapterId = params?.chapterId;
  const chapterId = Number(rawChapterId);

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug params
  useEffect(() => {
    console.log("Params nhận được:", params);
    if (!comicId) console.error("Thiếu comicId (folder [id])");
    if (!rawChapterId) console.error("Thiếu chapterId (folder [chapterId])");
    if (isNaN(chapterId)) console.error("ChapterId không phải số:", rawChapterId);
  }, [params, comicId, rawChapterId, chapterId]);

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

        // Xử lý Content ảnh (JSON hoặc String)
        if (detailData && detailData.content) {
            try {
                // Thử parse JSON
                const imgs = JSON.parse(detailData.content);
                setImages(Array.isArray(imgs) ? imgs : [detailData.content]);
            } catch {
                // Nếu không phải JSON, tách theo dấu phẩy hoặc lấy nguyên chuỗi
                if (detailData.content.includes(',')) {
                    setImages(detailData.content.split(',').map((s: string) => s.trim()));
                } else {
                    setImages([detailData.content]);
                }
            }
        }
      } catch (error) {
        console.error("Lỗi tải chương:", error);
      } finally {
        setLoading(false); // Luôn tắt loading khi xong
      }
    };

    fetchData();
  }, [chapterId, comicId]);

  // Logic chuyển chương (Sắp xếp theo ChapterNumber để chuẩn xác)
  // Sắp xếp chapters tăng dần để tìm Next/Prev dễ hơn
  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentIndex = sortedChapters.findIndex(c => c.id === chapterId);
  
  const prevChapter = sortedChapters[currentIndex - 1]; // Chương số nhỏ hơn
  const nextChapter = sortedChapters[currentIndex + 1]; // Chương số lớn hơn

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
        <p className="text-xl mb-4">Không tìm thấy chương này.</p>
        <Link href={`/comics/${comicId}`} className="text-blue-400 hover:underline">
            Quay lại trang truyện
        </Link>
        <p className="text-sm text-gray-500 mt-4">Debug ID: {comicId} - {chapterId}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-20">
      {/* Header Sticky */}
      <div className="sticky top-0 z-50 bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <Link 
          href={`/comics/${comicId}`} 
          className="flex items-center gap-2 hover:text-blue-400 transition"
          aria-label="Về trang chi tiết truyện"
        >
            <FaHome /> <span className="hidden md:inline line-clamp-1">{currentChapter.title}</span>
        </Link>
        
        <div className="flex items-center gap-2">
            <button 
                disabled={!prevChapter}
                onClick={() => router.push(`/comics/${comicId}/chapter/${prevChapter.id}`)}
                className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Chương trước"
            >
                <FaArrowLeft />
            </button>

            <select 
                value={currentChapter.id} 
                onChange={handleChangeChapter}
                className="bg-gray-700 border-none rounded py-2 px-2 md:px-4 outline-none max-w-[120px] md:max-w-[200px] cursor-pointer"
                aria-label="Chọn chương"
            >
                {sortedChapters.map(c => (
                    <option key={c.id} value={c.id}>Chương {c.chapterNumber}</option>
                ))}
            </select>

            <button 
                disabled={!nextChapter}
                onClick={() => router.push(`/comics/${comicId}/chapter/${nextChapter.id}`)}
                className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                aria-label="Chương sau"
            >
                <FaArrowRight />
            </button>
        </div>
      </div>

      {/* Reader Content */}
    <div className="max-w-4xl mx-auto bg-black min-h-screen">
    {images.length > 0 ? (
        images.map((imgUrl, index) => (
            <div key={index} className="relative w-full">
                {/* Dùng next/image với width/height auto */}
                <Image
                    src={imgUrl}
                    alt={`Trang ${index + 1}`}
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: '100%', height: 'auto' }} // CSS giúp ảnh scale theo chiều rộng
                    loading={index < 2 ? "eager" : "lazy"} // Load ngay 2 ảnh đầu, lazy các ảnh sau
                    quality={75} // Giảm chất lượng chút để load nhanh hơn (mặc định 75)
                    unoptimized={true} // Bật cái này nếu ảnh lấy từ link ngoài (không phải local)
                />
            </div>
             ))
         ) : (
             <div className="p-20 text-center text-gray-500">
                <p>Chưa có nội dung ảnh cho chương này.</p>
                <p className="text-xs mt-2 text-gray-600">{currentChapter.content}</p>
             </div>
         )}
      </div>

      {/* Footer Nav */}
      <div className="max-w-4xl mx-auto p-6 flex justify-between items-center bg-gray-800 mt-8 rounded-lg">
         <button 
            disabled={!prevChapter}
            onClick={() => router.push(`/comics/${comicId}/chapter/${prevChapter.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 transition"
         >
            <FaArrowLeft /> Chap trước
         </button>
         
         <span className="font-bold text-lg">Chương {currentChapter.chapterNumber}</span>

         <button 
            disabled={!nextChapter}
            onClick={() => router.push(`/comics/${comicId}/chapter/${nextChapter.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 transition"
         >
            Chap sau <FaArrowRight />
         </button>
      </div>
    </div>
  );
}