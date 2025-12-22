'use client';
import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import api from '@/lib/axios';
import { toast } from 'react-toastify';

export default function StarRating({ comicId, initialRating }: { comicId: number, initialRating: number }) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState<number | null>(null);

  const handleRate = async (score: number) => {
    try {
      await api.post('/rating', { comicId, score });
      setRating(score);
      toast.success("Cảm ơn bạn đã đánh giá!");
    } catch (error) {
      toast.error("Bạn cần đăng nhập để đánh giá.");
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
          aria-label='Rate'
            key={index}
            onClick={() => handleRate(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(null)}
          >
            <FaStar
              size={24}
              className={`transition-colors ${
                starValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-bold text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}