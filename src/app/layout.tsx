import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@/context/auth.context';
import Header from '@/components/Header'; 
import Footer from '@/components/Footer'; 
import AIChatWidget from '@/components/ai/AIChatWidget';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Comax - Đọc truyện tranh',
  description: 'Website đọc truyện tranh online hàng đầu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* AuthProvider bọc toàn bộ để Header/Footer cũng dùng được user data */}
        <AuthProvider>
          
          <div className="flex flex-col min-h-screen">
            {/* Hiển thị Header */}
            <Header />

            {/* Nội dung chính của trang */}
            <main className="flex-grow">
              {children}
            </main>

            {/* Hiển thị Footer */}
            <Footer />
          </div>

          <ToastContainer position="bottom-right" />
        </AuthProvider>
        <AIChatWidget />
      </body>
    </html>
  );
}