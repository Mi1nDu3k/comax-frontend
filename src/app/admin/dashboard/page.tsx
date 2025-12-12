'use client';
import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { reportService } from '@/services/report.service'; // Import thêm service này
import { DashboardStats } from '@/types/dashboard';
import { Comic } from '@/types/comic'; // Import type Comic
import { FaUsers, FaBookOpen, FaLayerGroup, FaComments } from 'react-icons/fa';
import Image from 'next/image';
import UserGrowthChart from '@/components/charts/UserGrowthChart';
import CategoryDistChart from '@/components/charts/CategoryDistChart';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topComics, setTopComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi song song cả 2 API để tối ưu tốc độ
        const [statsData, topComicsData] = await Promise.all([
          dashboardService.getStats(),
          reportService.getTopComics('view', 5)
        ]);

        setStats(statsData);
        setTopComics(topComicsData);
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu thống kê...</div>;
  
  // Kiểm tra stats null để tránh lỗi crash
  if (!stats) return <div className="p-8 text-center text-red-500">Không thể tải dữ liệu.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Tổng quan hệ thống</h1>

      {/* 1. Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card User */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Tổng Thành viên</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalUsers?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <FaUsers size={24} />
          </div>
        </div>

        {/* Card Comics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Tổng Truyện</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalComics?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <FaBookOpen size={24} />
          </div>
        </div>

        {/* Card Chapters (Thay cho Views) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Tổng Số Chương</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalChapters?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <FaLayerGroup size={24} />
          </div>
        </div>

        {/* Card Comments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Tổng Bình luận</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalComments?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <FaComments size={24} />
          </div>
        </div>
      </div>

      {/* 2. Charts Section (MỚI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Biểu đồ User Growth (Chiếm 2 phần) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          {stats.labels && stats.userGrowthData ? (
             <UserGrowthChart labels={stats.labels} data={stats.userGrowthData} />
          ) : (
             <p className="text-center text-gray-400 py-10">Chưa có dữ liệu người dùng</p>
          )}
        </div>

        {/* Biểu đồ Category (Chiếm 1 phần) */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-gray-700 mb-4 self-start">Phân bố Thể loại</h3>
          <div className="w-full max-w-[300px]">
            {stats.categoryLabels && stats.comicByCategoryData ? (
               <CategoryDistChart labels={stats.categoryLabels} data={stats.comicByCategoryData} />
            ) : (
               <p className="text-center text-gray-400 py-10">Chưa có dữ liệu thể loại</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Comics Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Top 5 Truyện xem nhiều nhất</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Truyện</th>
                <th className="px-6 py-3 text-center">Lượt xem</th>
                <th className="px-6 py-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topComics.length > 0 ? (
                topComics.map((comic, index) => (
                  <tr key={comic.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-14 rounded overflow-hidden bg-gray-200 shrink-0">
                          <Image 
                            src={comic.thumbnailUrl || '/placeholder.jpg'} 
                            alt={comic.title} 
                            fill 
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <span className="font-medium text-gray-800 line-clamp-1">{comic.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-100 text-blue-700 py-1 px-2 rounded-full text-xs font-bold">
                        {comic.viewCount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {/* Giả sử status 1 là đang tiến hành, 2 là hoàn thành */}
                       <span className={`px-2 py-1 rounded text-xs ${comic.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {comic.status === 1 ? 'Đang ra' : 'Hoàn thành'}
                       </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chưa có dữ liệu truyện nổi bật</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}