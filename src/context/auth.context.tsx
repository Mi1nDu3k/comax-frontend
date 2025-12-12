'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Nếu bạn chưa có thư viện jwt-decode, hãy cài: npm install jwt-decode
// Hoặc logic lấy user đơn giản từ localStorage

interface User {
  id: number;
  username: string;
  avatar?: string;
  // thêm các trường khác nếu cần
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Logic khôi phục user từ localStorage khi F5 trang
    const storedUser = localStorage.getItem('user');
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
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
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