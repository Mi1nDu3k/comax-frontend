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
    refreshUser: () => Promise<void>; 
    accessToken: string | null; // Đã khai báo ở đây
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
   
    const [accessToken, setAccessToken] = useState<string | null>(null);
    
    const router = useRouter();

    const loadUserFromToken = async () => {
        try {
            // Lấy token từ localStorage
            const token = localStorage.getItem("accessToken");
            
            if (token) {
                // Cập nhật state token ngay lập tức
                setAccessToken(token); 
                
                // Gọi API lấy thông tin user
                const userData = await userService.getProfile();
                setUser(userData);
            } else {
                setAccessToken(null);
                setUser(null);
            }
        } catch (error) {
            console.error("Lỗi load user", error);
            // Nếu token lỗi/hết hạn -> Xóa sạch để tránh vòng lặp
            localStorage.removeItem("accessToken");
            setAccessToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserFromToken();
    }, []);

    const refreshUser = async () => {
        await loadUserFromToken();
    };

    const login = async (token: string) => {
        localStorage.setItem('accessToken', token);
        setAccessToken(token); // Cập nhật state
        await loadUserFromToken();
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setAccessToken(null); // Xóa state
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            logout, 
            refreshUser,
            accessToken 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};