import Link from 'next/link';
import Image from 'next/image';
import { FaUserCircle, FaCrown, FaEnvelope, FaEdit, FaSignOutAlt } from 'react-icons/fa';

// 1. Định nghĩa Type cho User để tránh lỗi 'any'
interface UserType {
    username?: string;
    email?: string;
    avatar?: string;
    isvip?: boolean;
}

interface ProfileHeaderProps {
    user: UserType | null;
    onEdit: () => void;
    onLogout: () => void;
}

export const ProfileHeader = ({ user, onEdit, onLogout }: ProfileHeaderProps) => {
    const getAvatarUrl = (url: string | undefined | null) => {
        if (!url) return null;
        if (url.startsWith('blob:')) return url;
        const finalUrl = url.replace('http://minio:9000', 'http://localhost:9000');
        return `${finalUrl}?v=${new Date().getTime()}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative group flex-shrink-0">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${user?.isvip ? 'border-yellow-400' : 'border-white'} shadow-lg bg-gray-100 flex items-center justify-center relative`}>
                    {user?.avatar ? (
                        <Image
                            src={getAvatarUrl(user.avatar)!}
                            alt="Avatar"
                            fill
                            className="object-cover"
                            unoptimized
                            key={user.avatar}
                        />
                    ) : (
                        <FaUserCircle size={80} className="text-gray-300" />
                    )}
                </div>
                {user?.isvip && (
                    <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                        <FaCrown /> VIP
                    </div>
                )}
            </div>

            <div className="flex-1 text-center md:text-left z-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.username || 'Khách'}</h1>
                <p className="text-gray-500 mb-4 flex items-center justify-center md:justify-start gap-2">
                    <FaEnvelope /> {user?.email}
                </p>
                <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                    {!user?.isvip && (
                        <Link href="/recharge" className="px-5 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 flex items-center gap-2 transition shadow-md animate-pulse">
                            <FaCrown /> Kích hoạt VIP ngay
                        </Link>
                    )}
                    <button onClick={onEdit} className="px-5 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 transition shadow-sm">
                        <FaEdit /> Chỉnh sửa hồ sơ
                    </button>
                    <button onClick={onLogout} className="px-5 py-2 rounded-full text-sm font-medium bg-white text-red-600 border border-red-200 hover:bg-red-50 flex items-center gap-2 transition">
                        <FaSignOutAlt /> Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};