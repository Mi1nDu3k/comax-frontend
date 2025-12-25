'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
// Thay Image bằng ComicImage và thêm Skeleton
import ComicImage from '@/components/ui/ComicImage'; 
import Skeleton from '@/components/ui/Skeleton';

import { Comic, ChapterItem } from '@/types/comic'; 
import CommentSection from '@/components/CommentSection';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '@/context/auth.context';
import { toast } from 'react-toastify';
import api from '@/lib/axios';
import StarRating from '@/components/home/StarRating';

export default function ComicDetailPage() {
  const params = useParams();
  const comicId = Number(params.id);

  const [comic, setComic] = useState<Comic | null>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // State cho chức năng Yêu thích & Đánh giá
  const [isFavorite, setIsFavorite] = useState(false);
  const [myRating, setMyRating] = useState(0); 

  // --- 1. Load dữ liệu khi vào trang ---
  useEffect(() => {
    if (!comicId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // A. Lấy thông tin chi tiết truyện
        const comicRes = await api.get(`/comics/${comicId}`);
        const comicData = comicRes.data;
        setComic(comicData);

        // Xử lý lấy danh sách chương
        if (comicData.chapters && comicData.chapters.length > 0) {
            setChapters(comicData.chapters);
        } else {
            try {
                const chapRes = await api.get(`/comics/${comicId}/chapters`);
                setChapters(chapRes.data);
            } catch (error) {
                console.log("Không tải được danh sách chương phụ hoặc truyện chưa có chương");
            }
        }

        // B. Kiểm tra User đã thích truyện chưa
        try {
            const favRes = await api.get(`/favorites/check/${comicId}`);
            setIsFavorite(favRes.data.isFavorited);
        } catch (err) {
            // Bỏ qua lỗi 401
        }

        // C. Lấy điểm User đã đánh giá
        try {
            const rateRes = await api.get(`/rating/check/${comicId}`);
            setMyRating(rateRes.data.score); 
        } catch (_) {
            // Bỏ qua lỗi 401
        }

      } catch (error) {
        console.error("Lỗi tải trang chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [comicId]);

  // --- 2. Xử lý Toggle Favorite ---
  const handleToggleFavorite = async () => {
    try {
      await api.post(`/favorites/${comicId}`);
      setIsFavorite(!isFavorite); 
      toast.success(isFavorite ? "Đã bỏ theo dõi" : "Đã thêm vào yêu thích");
    } catch (error) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này!");
    }
  };

  // --- 3. Tạo Skeleton cho trang chi tiết ---
  const DetailSkeleton = () => (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Skeleton Ảnh bìa */}
        <div className="w-full md:w-1/3 lg:w-1/4">
           <Skeleton className="w-full aspect-[2/3] rounded-lg shadow-lg" />
        </div>
        
        {/* Skeleton Thông tin */}
        <div className="flex-1 space-y-4">
           <Skeleton className="h-10 w-3/4 rounded" /> {/* Tên truyện */}
           <Skeleton className="h-6 w-1/3 rounded" />  {/* Tác giả */}
           
           <div className="flex gap-3 py-2">
              <Skeleton className="h-10 w-32 rounded" /> {/* Nút theo dõi */}
              <Skeleton className="h-10 w-32 rounded" /> {/* Lượt xem */}
           </div>

           <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <Skeleton className="h-6 w-48" /> {/* Rating title */}
              <Skeleton className="h-8 w-64" /> {/* Stars */}
              <div className="flex gap-2">
                 <Skeleton className="h-6 w-20 rounded-full" />
                 <Skeleton className="h-6 w-20 rounded-full" />
              </div>
           </div>

           <Skeleton className="h-32 w-full rounded" /> {/* Mô tả */}

           <Skeleton className="h-8 w-48 mt-8 mb-4" /> {/* Title Chapter */}
           <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                 <Skeleton key={i} className="h-12 w-full rounded" />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
  
  // --- 4. Render ---
  if (loading) return <DetailSkeleton />;
  if (!comic) return <div className="text-red-500 text-center p-10">Không tìm thấy truyện.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* CỘT TRÁI: ẢNH BÌA */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="rounded-lg overflow-hidden shadow-lg relative aspect-[2/3]">
             {/* SỬ DỤNG COMIC IMAGE */}
             <ComicImage 
               src={comic.thumbnailUrl || ''} 
               alt={comic.title} 
               fill
               className="object-cover"
               unoptimized
             />
          </div>
        </div>
        
        {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{comic.title}</h1>
          <p className="text-gray-600 mb-4">Tác giả: <span className="font-semibold text-gray-800">{comic.authorName || 'Đang cập nhật'}</span></p>
          
          {/* Nút hành động */}
          <div className="flex flex-col gap-4 mb-6">
             <div className="flex gap-3">
                <button 
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-2 px-4 py-2 rounded border transition font-medium
                    ${isFavorite ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}
                    `}
                >
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                    {isFavorite ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
                <span className="bg-green-100 text-green-800 text-sm px-3 py-2 rounded flex items-center font-medium">
                👁️ {comic.viewCount?.toLocaleString() || 0} Lượt xem
                </span>
             </div>

             <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-lg">
                {/* 1. Hiển thị Rating */}
                <div>
                    <h3 className="text-sm font-semibold mb-1 text-gray-700">Đánh giá của bạn:</h3>
                    <StarRating comicId={comic.id} initialRating={myRating} />
                </div>

                {/* 2. Hiển thị Thể loại */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {comic.categoryNames && comic.categoryNames.length > 0 ? (
                        comic.categoryNames.map((cat, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full cursor-pointer hover:bg-blue-200">
                            {cat}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 italic text-sm">Chưa cập nhật thể loại</span>
                    )}
                </div>

                {/* 3. Hiển thị Ngày xuất bản */}
                <div className="text-sm text-gray-500 mt-1">
                    <span className="font-bold">Ngày đăng:</span> {new Date(comic.createdAt).toLocaleDateString('vi-VN')}
                </div>
             </div>
          </div>

          <p className="text-gray-700 mb-8 whitespace-pre-line leading-relaxed">{comic.description}</p>

          {/* DANH SÁCH CHƯƠNG */}
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Danh sách chương</h2>
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto mb-10 border rounded-lg p-2 bg-gray-50">
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <Link 
                  href={`/comics/${comicId}/chapter/${chapter.id}`} 
                  key={chapter.id}
                  className="flex justify-between items-center p-3 bg-white hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded transition group"
                >
                  <span className="font-medium group-hover:text-blue-700">Chương {chapter.chapterNumber}: {chapter.title}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(chapter.publishDate).toLocaleDateString('vi-VN')}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">Chưa có chương nào được cập nhật.</p>
            )}
          </div>
          
          {/* BÌNH LUẬN */}
          <CommentSection comicId={comicId} />
        </div>
      </div>
    </div>
  );
}