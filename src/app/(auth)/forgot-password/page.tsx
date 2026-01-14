// src/app/(auth)/forgot-password/page.tsx
"use client";
import { useState } from "react";
import { authService } from "@/services/auth.service";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Đừng quên import Link

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("Đã gửi mã xác thực! Vui lòng kiểm tra email.");
      
      // Chuyển hướng người dùng sang trang nhập mã OTP luôn cho tiện
      // Truyền email qua URL để bên kia đỡ phải nhập lại
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Quên mật khẩu?
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          Nhập email của bạn và chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="w-full rounded border border-gray-300 p-2 outline-none focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-indigo-600 py-2 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Đang gửi..." : "Gửi mã xác thực"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-indigo-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}