'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user'; // 1. Import User type chuẩn từ file types

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Khôi phục user từ localStorage khi F5
    const storedUser = localStorage.getItem('user');
    // const storedToken = localStorage.getItem('accessToken'); // Có thể check thêm token nếu cần

    if (storedUser) {
        try {
            // eslint-disable-next-line
            setUser(JSON.parse(storedUser));
        } catch {
            localStorage.removeItem('user');
        }
    }
  }, []);

  const login = (token: string, userData: User) => {
    // 2. Sửa key 'token' -> 'accessToken' để khớp với toàn bộ app
    localStorage.setItem('accessToken', token); 
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData); // Cập nhật state -> Header sẽ tự render lại
  };

  const logout = () => {
    localStorage.removeItem('accessToken'); // Sửa key
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};