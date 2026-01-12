import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaTimes, FaCamera, FaUserCircle } from 'react-icons/fa';
import { userService } from '@/services/user.service';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/auth.context';

// 1. Định nghĩa kiểu dữ liệu User cụ thể thay vì dùng 'any'
interface UserType {
    username?: string;
    email?: string;
    avatar?: string;
}

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserType | null;
}

export const EditProfileModal = ({ isOpen, onClose, user }: EditProfileModalProps) => {
    const { refreshUser } = useAuth();
    const [name, setName] = useState(user?.username || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(user?.avatar || null);
    const [isUpdating, setIsUpdating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && user) {
            setName(user.username || '');
            setPreview(user.avatar || null);
            setAvatarFile(null);
        }
    }, [isOpen, user]);

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return toast.warning("Tên không được trống");
        // Kiểm tra email tồn tại trước khi gửi
        if (!user?.email) return toast.error("Không tìm thấy email user");

        setIsUpdating(true);
        try {
            const res = await userService.updateProfile(name, user.email, avatarFile || undefined);
            if (res.success) {
                toast.success("Cập nhật thành công!");
                if (refreshUser) await refreshUser();
                onClose();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi cập nhật hồ sơ");
        } finally {
            setIsUpdating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Cập nhật thông tin</h3>
                    <button 
                        onClick={onClose} 
                        title="Đóng modal" 
                        aria-label="Close modal"
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                        <div 
                            className="relative w-28 h-28 mb-3 group cursor-pointer" 
                            onClick={() => fileInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            aria-label="Change avatar"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                            }}
                        >
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-50 relative">
                                {preview ? (
                                    <Image 
                                        src={preview} 
                                        alt="Avatar Preview" 
                                        fill 
                                        className="object-cover" 
                                        unoptimized 
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-300">
                                        <FaUserCircle size={60} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">
                                <FaCamera className="text-white text-2xl" />
                            </div>
                        </div>

                        {/* 2. FIX LỖI ACCESSIBILITY TẠI ĐÂY:
                           Thêm title="Chọn ảnh đại diện" để fix lỗi 'Form elements must have labels'
                        */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*" 
                            title="Chọn ảnh đại diện" 
                            aria-label="Upload avatar"
                        />
                        
                        <p className="text-xs text-gray-500">Chạm để đổi ảnh đại diện</p>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
                        <input 
                            id="displayName"
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" 
                            placeholder="Nhập tên hiển thị"
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button 
                            onClick={onClose} 
                            disabled={isUpdating} 
                            className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={isUpdating} 
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                        >
                            {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};