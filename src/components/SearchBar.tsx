'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { Comic } from '@/types/comic';
import { comicService } from '@/services/comic.service';
import useDebounce from '@/hooks/useDebounce';
import { getMinioUrl } from '@/utils/image-helper';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  // Dùng hook debounce với delay 500ms
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const wrapperRef = useRef<HTMLDivElement>(null);
    const handleSearchNavigation = () => {
    if (!searchTerm.trim()) return;
    setShowDropdown(false);
    // Chuyển hướng sang trang search
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchNavigation();
    }
  };
  // Effect chạy khi từ khóa đã được debounce thay đổi
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearchTerm.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await comicService.search(debouncedSearchTerm);
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Lỗi tìm kiếm", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm]);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto z-50">
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm truyện, tác giả..."
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
             if (results.length > 0) setShowDropdown(true);
          }}
        />
        <button 
          onClick={handleSearchNavigation}
          className="absolute left-3 top-2.5 text-gray-400 hover:text-blue-600 transition"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
        </button>
      </div>

      {/* Dropdown Kết quả */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-96 overflow-y-auto animate-fade-in-down">
          <ul>
            {results.map((comic) => (
              <li key={comic.id} className="border-b last:border-0 border-gray-50">
                <Link 
                  href={`/comics/${comic.id}`} 
                  className="flex gap-3 p-3 hover:bg-blue-50 transition-colors group"
                  onClick={() => setShowDropdown(false)}
                >
                  {/* Ảnh nhỏ */}
                  <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden shadow-sm">
                    <Image 
                      src={getMinioUrl(comic.thumbnailUrl)} 
                      alt={comic.title} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Thông tin */}
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-sm text-gray-800 group-hover:text-blue-600 line-clamp-1">
                      {comic.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {comic.latestChapterNumber 
                        ? `Chap ${comic.latestChapterNumber}` 
                        : 'Chưa có chap'}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div 
             onClick={handleSearchNavigation}
             className="bg-gray-50 p-3 text-center text-sm text-blue-600 font-bold cursor-pointer hover:bg-blue-50 hover:underline border-t transition"
           >
             Xem toàn bộ kết quả cho "{searchTerm}"
          </div>
        </div>
      )}
      
      {showDropdown && !loading && searchTerm && results.length === 0 && (
         <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg p-4 text-center text-sm text-gray-500">
            Không tìm thấy kết quả nào.
         </div>
      )}
    </div>
  );
}