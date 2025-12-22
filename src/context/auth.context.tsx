'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { userService } from '@/services/user.service';
import { User } from '@/types/user';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>; // <--- 1. THÊM DÒNG NÀY
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Hàm load user từ token
    const loadUserFromToken = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (token) {
                const userData = await userService.getProfile();
                setUser(userData);
            }
        } catch (error) {
            console.error("Lỗi load user", error);
            // localStorage.removeItem("accessToken"); // Tùy chọn: Xóa token nếu lỗi
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserFromToken();
    }, []);

    // 2. VIẾT HÀM REFRESH USER (Copy logic của loadUserFromToken)
    const refreshUser = async () => {
        await loadUserFromToken();
    };

    const login = async (token: string) => {
        localStorage.setItem('accessToken', token);
        await loadUserFromToken();
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
        router.push('/login');
    };

    // 3. EXPORT refreshUser
    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};