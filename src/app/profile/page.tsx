'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { favoriteService } from '@/services/favorite.service';
import { Comic } from '@/types/comic';
// import { jwtDecode } from 'jwt-decode'; // Cần cài npm install jwt-decode nếu muốn lấy ID từ token

export default function ProfilePage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; id: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Giả lập lấy thông tin user từ localStorage (hoặc bạn dùng thư viện jwt-decode để decode token)
    // Ví dụ đơn giản:
    setUser({ name: 'Thành viên', id: 'current-user-id' }); 

    fetchFavorites();
  }, [router]);

  const fetchFavorites = async () => {
    try {
      const data = await favoriteService.getMyFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Lỗi tải tủ sách', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (comicId: string) => {
    if (!confirm('Bạn muốn bỏ theo dõi truyện này?')) return;
    try {
      await favoriteService.remove(comicId);
      // Reload lại list local
      setFavorites(favorites.filter(c => c.id !== comicId));
    } catch (error) {
        console.error('Lỗi xóa favorite:', error);
      alert('Có lỗi xảy ra.');
    }
  };

  const handleUpgradeVip = async () => {
    if (!user) return;
    try {
        // Lưu ý: Cần logic lấy UserID chuẩn từ Token để gọi API này
        // await userService.upgradeVip(user.id);
        alert('Tính năng đang phát triển: Vui lòng liên hệ Admin để nạp VIP!');
    } catch (error) {
        console.error('Lỗi nâng cấp VIP:', error);
        alert('Lỗi nâng cấp');
    }
  }

  if (loading) return <div className="p-10 text-center">Đang tải hồ sơ...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Info Card */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Xin chào, {user?.name}!</h1>
           <p className="text-gray-500">Thành viên Comax</p>
        </div>
        <button 
            onClick={handleUpgradeVip}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition"
        >
            Nâng cấp VIP 👑
        </button>
      </div>

      {/* Tủ sách Favorites */}
      <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-600 pl-3">Tủ truyện yêu thích</h2>
      
      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {favorites.map((comic) => (
            <div key={comic.id} className="group relative bg-white rounded-lg shadow overflow-hidden">
               <Link href={`/comics/${comic.id}`}>
                <div className="aspect-[2/3] relative bg-gray-200">
                  <Image 
                    src={comic.thumbnailUrl || '/placeholder.jpg'} 
                    alt={comic.title}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    unoptimized
                  />
                </div>
              </Link>
              
              <div className="p-3">
                 <Link href={`/comics/${comic.id}`}>
                    <h3 className="font-semibold text-sm truncate hover:text-blue-600">{comic.title}</h3>
                 </Link>
                 <button 
                    onClick={() => handleRemoveFavorite(comic.id)}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 w-full text-left"
                 >
                    Bỏ theo dõi
                 </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
           <p className="text-gray-500 mb-4">Bạn chưa theo dõi truyện nào.</p>
           <Link href="/" className="text-blue-600 hover:underline">Khám phá ngay</Link>
        </div>
      )}
    </div>
  );
}