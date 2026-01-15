'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ComicImage from '@/components/ui/ComicImage'; 
import Skeleton from '@/components/ui/Skeleton';
import { Comic, ChapterItem } from '@/types/comic'; 
import { ReadingHistoryItem } from '@/types/history';
import CommentSection from '@/components/CommentSection';
import { FaHeart, FaRegHeart, FaBookOpen, FaHistory, FaAngleDoubleRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '@/lib/axios';
import StarRating from '@/components/home/StarRating';
import { useAuth } from '@/context/auth.context'; 
import RelatedComics from '@/components/comic/RelatedComics';

// 1. Đưa Skeleton ra ngoài để tránh Re-creation
const DetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-6xl">
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3 lg:w-1/4"><Skeleton className="w-full aspect-[2/3] rounded-lg shadow-lg" /></div>
      <div className="flex-1 space-y-4">
         <Skeleton className="h-10 w-3/4 rounded" /><Skeleton className="h-6 w-1/3 rounded" />
         <div className="flex gap-3 py-2"><Skeleton className="h-10 w-32 rounded" /><Skeleton className="h-10 w-32 rounded" /></div>
         <Skeleton className="h-32 w-full rounded" />
      </div>
    </div>
  </div>
);

export default function ComicDetailPage() {
  const params = useParams();
  const comicId = Number(params.id);
  const { user } = useAuth(); // Lấy user để biết có nên gọi API cá nhân không

  const [comic, setComic] = useState<Comic | null>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]); 
  const [loading, setLoading] = useState(true);
  const [lastReadChapter, setLastReadChapter] = useState<ReadingHistoryItem | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [myRating, setMyRating] = useState(0); 

  useEffect(() => {
    if (!comicId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // --- BƯỚC 1: Lấy thông tin chính (Truyện) ---
        const comicRes = await api.get<Comic>(`/comics/${comicId}`);
        const comicData = comicRes.data;
        setComic(comicData);

        // Xử lý danh sách chương (Ưu tiên lấy từ comicData nếu có, không thì gọi API riêng)
        let initialChapters = comicData.chapters || [];
        
        // --- BƯỚC 2: Gọi song song các API phụ (Chapters, Favorite, Rating, History) ---
        // Sử dụng Promise.allSettled để 1 cái lỗi không làm chết các cái khác
        const promises = [
            // 1. Nếu chưa có chapters thì gọi thêm
            (initialChapters.length === 0) ? api.get(`/comics/${comicId}/chapters`) : Promise.resolve({ data: initialChapters })
        ];

        // Chỉ gọi các API cá nhân nếu user đã đăng nhập
        if (user) {
            promises.push(api.get(`/favorites/check/${comicId}`)); // 2. Check Favorite
            promises.push(api.get(`/rating/check/${comicId}`));    // 3. Check Rating
            promises.push(api.get('/history'));                    // 4. Check History
        }

        const results = await Promise.allSettled(promises);

        // --- BƯỚC 3: Xử lý kết quả trả về ---
        
        // [0] Chapters
        if (results[0].status === 'fulfilled') {
            // Nếu gọi API chapter riêng thì lấy data, còn nếu là Promise.resolve thì lấy data gốc
            const chapData = results[0].value.data;
            setChapters(Array.isArray(chapData) ? chapData : []);
        }

        if (user) {
            // [1] Favorite
            if (results[1] && results[1].status === 'fulfilled') {
                setIsFavorite(results[1].value.data.isFavorited);
            }
            // [2] Rating
            if (results[2] && results[2].status === 'fulfilled') {
                setMyRating(results[2].value.data.score);
            }
            // [3] History
            if (results[3] && results[3].status === 'fulfilled') {
                const historyList: ReadingHistoryItem[] = results[3].value.data;
                const found = historyList.find(h => h.comicId === comicId);
                if (found) setLastReadChapter(found);
            }
        }

      } catch (error) {
        console.error("Lỗi tải trang chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [comicId, user]); // Thêm user vào dependency

  const handleToggleFavorite = async () => {
    if (!user) return toast.error("Vui lòng đăng nhập để sử dụng tính năng này!");
    
    // Optimistic Update (Cập nhật UI trước khi gọi API cho mượt)
    const previousState = isFavorite;
    setIsFavorite(!isFavorite); 

    try {
      await api.post(`/favorites/${comicId}`);
      toast.success(!previousState ? "Đã thêm vào yêu thích" : "Đã bỏ theo dõi");
    } catch (error) {
      setIsFavorite(previousState); // Revert nếu lỗi
      toast.error("Lỗi kết nối, vui lòng thử lại!");
    }
  };

  // 2. Tối ưu: Chỉ sort lại khi chapters thay đổi
  const sortedChapters = useMemo(() => {
    return [...chapters].sort((a, b) => b.chapterNumber - a.chapterNumber);
  }, [chapters]);

  const latestChapter = sortedChapters.length > 0 ? sortedChapters[0] : null;
  const firstChapter = sortedChapters.length > 0 ? sortedChapters[sortedChapters.length - 1] : null;

  if (loading) return <DetailSkeleton />;
  if (!comic) return <div className="text-red-500 text-center p-10 font-medium">Không tìm thấy truyện hoặc truyện đã bị xóa.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cột trái: Ảnh bìa */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div className="rounded-lg overflow-hidden shadow-xl relative aspect-[2/3] border border-gray-100">
             <ComicImage src={comic.thumbnailUrl || ''} alt={comic.title} fill className="object-cover" unoptimized />
             {/* Label trạng thái */}
             <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                {comic.status === 1 ? 'Đang tiến hành' : 'Hoàn thành'}
             </div>
          </div>
        </div>
        
        {/* Cột phải: Thông tin */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900 leading-tight">{comic.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
             <p>Tác giả: <span className="font-semibold text-blue-600">{comic.authorName || 'Đang cập nhật'}</span></p>
             <span className="hidden md:inline text-gray-300">|</span>
             <p className="flex items-center gap-1"><span className="text-yellow-500">★</span> {comic.rating?.toFixed(1) || '0.0'}</p>
             <span className="hidden md:inline text-gray-300">|</span>
             <p>👁️ {comic.viewCount?.toLocaleString() || 0} View</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex gap-3">
                 {/* Logic nút Đọc */}
                 {lastReadChapter ? (
                     <Link href={`/comics/${comicId}/chapter/${lastReadChapter.chapterId}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
                         <FaHistory /> Đọc tiếp Chap {lastReadChapter.chapterNumber}
                     </Link>
                 ) : (
                     firstChapter && (
                         <Link href={`/comics/${comicId}/chapter/${firstChapter.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
                             <FaBookOpen /> Đọc từ đầu
                         </Link>
                     )
                 )}
                 {latestChapter && (
                     <Link href={`/comics/${comicId}/chapter/${latestChapter.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all">
                         Mới nhất: Chap {latestChapter.chapterNumber}
                     </Link>
                 )}
              </div>

              {/* Follow Button */}
              <button 
                onClick={handleToggleFavorite} 
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                    isFavorite 
                    ? 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100' 
                    : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'
                }`}
              >
                 {isFavorite ? <FaHeart className="text-pink-500" /> : <FaRegHeart />} 
                 {isFavorite ? 'Đã theo dõi' : 'Theo dõi'}
              </button>
          </div>

          {/* Rating & Categories */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6">
             <div className="flex items-center gap-4 mb-3">
                <span className="font-semibold text-gray-700">Đánh giá:</span>
                <StarRating comicId={comic.id} initialRating={myRating} />
             </div>
             <div className="flex flex-wrap gap-2">
                {comic.categoryNames?.map((cat, index) => (
                    <span key={index} className="px-3 py-1 bg-white border border-blue-100 text-blue-600 text-xs font-medium rounded-full hover:border-blue-300 transition cursor-default">
                        {cat}
                    </span>
                ))}
             </div>
          </div>

          <div className="prose max-w-none text-gray-600 mb-10 leading-relaxed">
             <h3 className="text-lg font-bold text-gray-900 mb-2">Sơ lược</h3>
             <p className="whitespace-pre-line">{comic.description || 'Chưa có mô tả cho truyện này.'}</p>
          </div>

          {/* Danh sách chương */}
          <div id="chapters">
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaBookOpen className="text-blue-600" /> Danh sách chương 
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{chapters.length}</span>
             </h3>
             <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white max-h-[600px] overflow-y-auto custom-scrollbar">
                {sortedChapters.length > 0 ? (
                   sortedChapters.map((chapter) => {
                      const isReading = Number(lastReadChapter?.chapterId) === Number(chapter.id);
                      return (
                         <Link 
                            href={`/comics/${comicId}/chapter/${chapter.id}`} 
                            key={chapter.id} 
                            className={`flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50 transition-colors ${
                                isReading ? 'bg-blue-50/60' : ''
                            }`}
                         >
                            <div className="flex items-center gap-3">
                                <span className={`font-medium ${isReading ? 'text-blue-600' : 'text-gray-700'}`}>
                                    Chương {chapter.chapterNumber}
                                </span>
                                {chapter.title && <span className="text-gray-400 hidden sm:inline">- {chapter.title}</span>}
                                {isReading && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">Đang đọc</span>}
                            </div>
                            <span className="text-xs text-gray-400 font-mono">
                                {new Date(chapter.publishDate).toLocaleDateString('vi-VN')}
                            </span>
                         </Link>
                      );
                   })
                ) : (
                    <div className="p-8 text-center text-gray-400 italic">Chưa có chương nào được cập nhật.</div>
                )}
             </div>
          </div>

          {/* Comment Section */}
          <div className="mt-12">
             <CommentSection comicId={comicId} />
          </div>
         
        <div className="container mx-auto px-4 pb-10">

           <RelatedComics currentId={Number(comicId)} />
        </div>
        </div>
      </div>
    </div>
  );
}