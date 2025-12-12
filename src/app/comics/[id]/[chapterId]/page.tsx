'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chapterService } from '@/services/chapter.service';
import { Chapter } from '@/types/chapter';
// 1. Xóa FaList khỏi import vì không dùng
import { FaArrowLeft, FaArrowRight, FaHome } from 'react-icons/fa';
import Link from 'next/link';

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  
  // Lưu ý: Kiểm tra folder của bạn đặt là [id] hay [comicId]
  const comicId = params.id as string || params.comicId as string; 
  const chapterId = Number(params.chapterId);

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!chapterId || !comicId) return;
      
      try {
        setLoading(true);
        const [detailData, listData] = await Promise.all([
          chapterService.getById(chapterId.toString()),
          chapterService.getByComicId(comicId)
        ]);

        setCurrentChapter(detailData);
        setChapters(listData);

        try {
          const imgs = JSON.parse(detailData.content);
          setImages(Array.isArray(imgs) ? imgs : []);
        } catch {
          console.warn("Content không phải JSON");
        }
      } catch (error) {
        console.error("Lỗi tải chương:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chapterId, comicId]);

  const currentIndex = chapters.findIndex(c => c.id === chapterId);
  // Giả sử danh sách API trả về giảm dần (Mới -> Cũ)
  const nextChapter = chapters[currentIndex - 1]; 
  const prevChapter = chapters[currentIndex + 1];

  const handleChangeChapter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    // Kiểm tra đúng đường dẫn folder của bạn (vd: /comics/1/chapter/2)
    router.push(`/comics/${comicId}/chapter/${newId}`);
  };

  if (loading) return <div className="p-10 text-center text-white">Đang tải chương...</div>;
  if (!currentChapter) return <div className="p-10 text-center text-white">Không tìm thấy chương.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-20">
      {/* Header Sticky */}
      <div className="sticky top-0 z-50 bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <Link 
          href={`/comics/${comicId}`} 
          className="flex items-center gap-2 hover:text-blue-400"
          aria-label="Về trang chi tiết truyện" // Accessibility
        >
            <FaHome /> <span className="hidden md:inline">{currentChapter.title}</span>
        </Link>
        
        <div className="flex items-center gap-2">
            <button 
                disabled={!prevChapter}
                onClick={() => router.push(`/comics/${comicId}/chapter/${prevChapter.id}`)}
                className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Chương trước" // Accessibility (Sửa lỗi Button name)
            >
                <FaArrowLeft />
            </button>

            <select 
                value={currentChapter.id} 
                onChange={handleChangeChapter}
                className="bg-gray-700 border-none rounded py-2 px-4 outline-none max-w-[150px]"
                aria-label="Chọn chương" // Accessibility (Sửa lỗi Select name)
            >
                {chapters.map(c => (
                    <option key={c.id} value={c.id}>Chương {c.chapterNumber}</option>
                ))}
            </select>

            <button 
                disabled={!nextChapter}
                onClick={() => router.push(`/comics/${comicId}/chapter/${nextChapter.id}`)}
                className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Chương sau" // Accessibility (Sửa lỗi Button name)
            >
                <FaArrowRight />
            </button>
        </div>
      </div>

      {/* Reader Content */}
      <div className="max-w-4xl mx-auto bg-black min-h-screen">
         {images.length > 0 ? (
             images.map((imgUrl, index) => (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img 
                    key={index} 
                    src={imgUrl} 
                    alt={`Trang ${index + 1}`} 
                    className="w-full h-auto block"
                    loading="lazy"
                 />
             ))
         ) : (
             <div className="p-10 text-center text-gray-500">
                <p>Nội dung đang cập nhật.</p>
             </div>
         )}
      </div>

      {/* Footer Nav */}
      <div className="max-w-4xl mx-auto p-6 flex justify-between items-center bg-gray-800 mt-8 rounded-lg">
         <button 
            disabled={!prevChapter}
            onClick={() => router.push(`/comics/${comicId}/chapter/${prevChapter.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50"
         >
            <FaArrowLeft /> Chap trước
         </button>
         
         <span className="font-bold text-lg">Chương {currentChapter.chapterNumber}</span>

         <button 
            disabled={!nextChapter}
            onClick={() => router.push(`/comics/${comicId}/chapter/${nextChapter.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50"
         >
            Chap sau <FaArrowRight />
         </button>
      </div>
    </div>
  );
}