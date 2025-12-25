"use client";
import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi qua service thay vì gọi api.post trực tiếp
      await authService.forgotPassword(email); 
      setMessage("Vui lòng kiểm tra email của bạn để lấy lại mật khẩu.");
    } catch (error) {
      setMessage("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-yellow-500">Quên Mật Khẩu</h2>
        
        {message ? (
          <div className="p-4 bg-green-800 text-green-100 rounded mb-4 text-center">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
              aria-label="Input mail"
                type="email"
                required
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-yellow-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </form>
        )}
        
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-gray-400 hover:text-white">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}