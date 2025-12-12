'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/jwt';
import AdminSidebar from '@/components/AdminSidebar'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const role = getUserRole(token);
    if (role !== 'Admin') {
      alert('Bạn không có quyền truy cập trang này!');
      router.push('/');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) return <div className="p-10 text-center">Đang kiểm tra quyền...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar nằm bên trái */}
      <AdminSidebar />

      {/* Nội dung chính bên phải */}
      {/* Thêm h-screen và overflow-y-auto để nội dung cuộn độc lập với sidebar */}
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}