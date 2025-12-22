'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Comic } from '@/types/comic';

interface HeroSliderProps {
  comics: Comic[]; // Bạn có thể thay bằng Interface ComicDTO của mình
}

export default function HeroSlider({ comics }: HeroSliderProps) {
  return (
    <div className="w-full h-[300px] md:h-[450px] mb-8 rounded-xl overflow-hidden shadow-lg">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper h-full w-full"
      >
        {comics.map((comic) => (
          <SwiperSlide key={comic.id}>
            <Link href={`/comics/${comic.id}`} className="relative block w-full h-full group">
              {/* Ảnh nền mờ để tạo chiều sâu */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={comic.thumbnailUrl || '/placeholder.jpg'}
                  alt={comic.title}
                  fill
                  className="object-cover blur-sm brightness-50"
                  unoptimized
                />
              </div>
              
              {/* Nội dung Slider */}
              <div className="relative z-10 flex h-full items-center px-12 md:px-24 gap-8">
                <div className="hidden md:block relative w-1/4 aspect-[2/3] shadow-2xl rounded-lg overflow-hidden border-2 border-white/20">
                  <Image
                    src={comic.thumbnailUrl || '/placeholder.jpg'}
                    alt={comic.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                
                <div className="flex-1 text-white space-y-4">
                  <h2 className="text-3xl md:text-5xl font-extrabold line-clamp-2 drop-shadow-md">
                    {comic.title}
                  </h2>
                  <p className="text-sm md:text-lg text-gray-200 line-clamp-3 max-w-2xl italic">
                    {comic.description || 'Chưa có mô tả cho bộ truyện này...'}
                  </p>
                  <div className="flex gap-4 items-center">
                    <span className="bg-blue-600 px-4 py-2 rounded-full font-bold text-sm">
                       Đọc ngay
                    </span>
                    <span className="text-sm font-medium">
                      Tác giả: {comic.authorName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}