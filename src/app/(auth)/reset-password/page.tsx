"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { AxiosError } from "axios"; // <--- 1. Import AxiosError

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    if (!email || !token) {
        setError("Link không hợp lệ.");
        return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.resetPassword(email, token, password);
      alert("Đổi mật khẩu thành công! Chuyển về trang đăng nhập.");
      router.push("/login");
    } catch (err) { // <--- 2. Bỏ ": any" ở đây đi
      // 3. Ép kiểu an toàn ở đây
      const error = err as AxiosError<{ message: string }>;
      
      // Bây giờ bạn có thể truy cập .response?.data bình thường
      setError(error.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
      return <div className="text-red-500 text-center">Link không hợp lệ hoặc thiếu thông tin.</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-yellow-500">Đặt Lại Mật Khẩu</h2>
        
        {error && <div className="mb-4 p-2 bg-red-900/50 text-red-200 text-sm rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
            <input
                aria-label="Input new password"
            
              type="password"
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-yellow-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nhập lại mật khẩu</label>
            <input
                aria-label="Input confirm new password"
              type="password"
              required
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-yellow-500 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}