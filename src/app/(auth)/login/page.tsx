'use client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { useAuth } from '@/context/auth.context'; // 1. Import Context

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); 
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
      password: Yup.string().required('Vui lòng nhập mật khẩu'),
    }),
    onSubmit: async (values) => {
      try {
        // 3. Gọi API đăng nhập
        const response = await authService.login(values);
        
        
        if (response && response.token) {
            
            const userData = {
                ...response.user,
                id: Number(response.user.id) 
            };

           login(response.token);
           localStorage.setItem('user', JSON.stringify(userData));
        }

        
        router.push('/'); 
        router.refresh(); 
        
      } catch (err) {
        const axiosError = err as AxiosError<{ 
            message?: string; 
            errors?: { Email?: string[] } 
        }>;

        console.error(axiosError);
        
        // Lấy thông báo lỗi chuẩn xác từ Backend
        const errorMsg = axiosError.response?.data?.errors?.Email?.[0] 
                      || axiosError.response?.data?.message 
                      || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
        setError(errorMsg);
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Đăng nhập Comax</h2>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200">{error}</div>}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="nhom5@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              id="password"
              type="password"
              name="password"
              onChange={formik.handleChange}
              value={formik.values.password}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition disabled:bg-gray-400"
          >
            {formik.isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Chưa có tài khoản? <Link href="/register" className="text-blue-600 hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}