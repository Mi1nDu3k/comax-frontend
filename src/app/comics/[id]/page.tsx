'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { comicService } from '@/services/comic.service';
import { favoriteService } from '@/services/favorite.service';
import { Comic, ChapterItem } from '@/types/comic';
import CommentSection from '@/components/CommentSection';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '@/context/auth.context'; // Dùng Context để check login chuẩn hơn
import { toast } from 'react-toastify';

export default function ComicDetailPage() {
  const params = useParams();
  const id = params.id as string; // Lấy ID từ URL

  const { user } = useAuth(); // Lấy user từ Context
  const [comic, setComic] = useState<Comic | null>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // 1. Tải thông tin truyện & danh sách chương
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const comicData = await comicService.getById(id);
        setComic(comicData);
        
        // Logic: Nếu API getById chưa trả đủ chapters thì gọi thêm API getChapters
        if (comicData.chapters && comicData.chapters.length > 0) {
           setChapters(comicData.chapters);
        } else {
           const chapterRes = await comicService.getChapters(id);
           setChapters(chapterRes); 
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 2. Kiểm tra trạng thái yêu thích (Chỉ khi đã đăng nhập)
  useEffect(() => {
     if (user && id) {
        favoriteService.checkStatus(id)
            .then(res => setIsFavorite(res.isFavorite)) // Đảm bảo backend trả về { isFavorite: boolean }
            .catch(() => {});
     }
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
        toast.info('Vui lòng đăng nhập để theo dõi truyện!');
        return;
    }
    try {
        await favoriteService.toggle(id);
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Đã bỏ theo dõi' : 'Đã thêm vào yêu thích');
    } catch (error) {
        console.error(error);
        toast.error('Lỗi thao tác');
    }
  };

  if (loading) return <div className="text-center p-10 text-gray-500">Đang tải thông tin...</div>;
  if (!comic) return <div className="text-center p-10 text-red-500">Không tìm thấy truyện</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* CỘT TRÁI: ẢNH BÌA */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="rounded-lg overflow-hidden shadow-lg relative aspect-[2/3]">
             <Image 
              src={comic.thumbnailUrl || '/placeholder.jpg'} 
              alt={comic.title} 
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        </div>
        
        {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{comic.title}</h1>
          <p className="text-gray-600 mb-4">Tác giả: <span className="font-semibold text-gray-800">{comic.authorName}</span></p>
          
          {/* Nút hành động */}
          <div className="flex gap-3 mb-6">
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
              👁️ {comic.viewCount.toLocaleString()} Lượt xem
            </span>
          </div>

          <p className="text-gray-700 mb-8 whitespace-pre-line leading-relaxed">{comic.description}</p>

          {/* DANH SÁCH CHƯƠNG */}
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Danh sách chương</h2>
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto mb-10 border rounded-lg p-2 bg-gray-50">
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <Link 
                  // Sửa lại đường dẫn cho đúng chuẩn /chapter/[chapterId]
                  href={`/comics/${id}/chapter/${chapter.id}`} 
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
          
          {/* BÌNH LUẬN (Đã sửa lỗi Type string -> number) */}
          <CommentSection comicId={Number(id)} />
        </div>
      </div>
    </div>
  );
}