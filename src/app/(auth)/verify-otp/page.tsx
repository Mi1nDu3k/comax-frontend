"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { toast } from "react-toastify";
import { FaLock, FaKey, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  // State quản lý luồng: 'VERIFY' (nhập mã) hoặc 'RESET' (nhập pass)
  const [step, setStep] = useState<"VERIFY" | "RESET">("VERIFY");
  
  // Dữ liệu form
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý xác thực OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Thiếu thông tin email.");
    if (otp.length !== 6) return toast.warn("Mã xác thực phải có 6 số.");

    setLoading(true);
    try {
      await authService.verifyOtp(email, otp);
      toast.success("Mã chính xác! Vui lòng nhập mật khẩu mới.");
      setStep("RESET"); // Chuyển sang bước nhập mật khẩu
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Mã xác thực không đúng.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (password !== confirmPassword) return toast.warn("Mật khẩu nhập lại không khớp.");
    if (password.length < 6) return toast.warn("Mật khẩu quá ngắn.");

    setLoading(true);
    try {
      // Gửi cả OTP kèm theo để backend check lần cuối
      await authService.resetPassword(email, otp, password);
      toast.success("Đổi mật khẩu thành công! Đang chuyển hướng...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Link không hợp lệ (Thiếu email).</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === "VERIFY" ? "Xác thực OTP" : "Đặt lại mật khẩu"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === "VERIFY" 
              ? `Nhập mã 6 số chúng tôi đã gửi tới ${email}`
              : "Nhập mật khẩu mới cho tài khoản của bạn"
            }
          </p>
        </div>

        {/* --- FORM BƯỚC 1: NHẬP OTP --- */}
        {step === "VERIFY" && (
          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã xác thực (6 số)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="text-gray-400" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-[0.5em] font-bold text-gray-700"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
            >
              {loading ? "Đang kiểm tra..." : "Xác thực"}
            </button>
          </form>
        )}

        {/* --- FORM BƯỚC 2: NHẬP MẬT KHẨU MỚI --- */}
        {step === "RESET" && (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-all"
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}