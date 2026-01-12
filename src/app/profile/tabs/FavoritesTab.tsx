import Link from 'next/link';
import Image from 'next/image';
import { FaTrash, FaBook } from 'react-icons/fa';

// Định nghĩa lại Comic interface (hoặc import từ types chung)
interface Comic {
    id: number;
    title: string;
    thumbnailUrl: string;
    slug: string;
}

interface FavoritesTabProps {
    favorites: Comic[];
    onRemove: (id: number) => void;
}

export const FavoritesTab = ({ favorites, onRemove }: FavoritesTabProps) => {
    if (favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FaBook size={48} className="mb-4 opacity-20" />
                <p>Tủ truyện trống.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {favorites.map((comic) => (
                <div key={comic.id} className="group relative">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition mb-3 bg-gray-100">
                        <Link href={`/comics/${comic.slug || comic.id}`}>
                            <Image
                                src={comic.thumbnailUrl || '/images/placeholder.png'}
                                alt={comic.title}
                                fill
                                className="object-cover group-hover:scale-105 transition duration-300"
                                unoptimized
                            />
                        </Link>
                        <button
                            onClick={() => onRemove(comic.id)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition z-20"
                            title="Bỏ theo dõi"
                            aria-label="Remove favorite"
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-blue-600 transition">
                        <Link href={`/comics/${comic.slug || comic.id}`}>{comic.title}</Link>
                    </h3>
                </div>
            ))}
        </div>
    );
};