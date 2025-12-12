'use client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { AxiosError } from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      userName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      userName: Yup.string().required('Vui lòng nhập tài khoản'),
      email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
      password: Yup.string().min(6, 'Mật khẩu ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Mật khẩu nhập lại không khớp')
        .required('Vui lòng nhập lại mật khẩu'),
    }),
    onSubmit: async (values) => {
      try {
        await authService.register({
            userName: values.userName,
            email: values.email,
            password: values.password
        });
alert('Đăng ký thành công! Vui lòng đăng nhập.');
        router.push('/login');
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        setError(error.response?.data?.message || 'Đăng ký thất bại.');
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng ký thành viên</h2>
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* UserName Field */}
          <div>
            <label htmlFor ="userName" className="block text-sm font-medium">Tài khoản</label>
            <input
            id = 'userName'
             type="text" 
             name="userName" 
             onChange={formik.handleChange} 
             value={formik.values.userName}
              className="mt-1 block w-full px-3 py-2 border rounded-md" />
            {formik.touched.userName && formik.errors.userName && <div className="text-red-500 text-xs">{formik.errors.userName}</div>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor='userName' className="block text-sm font-medium">Email</label>
            <input id = 'userName' type="email" name="email" onChange={formik.handleChange} value={formik.values.email}
              className="mt-1 block w-full px-3 py-2 border rounded-md" />
            {formik.touched.email && formik.errors.email && <div className="text-red-500 text-xs">{formik.errors.email}</div>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor='userName' className="block text-sm font-medium">Mật khẩu</label>
            <input id='userName' type="password" name="password" onChange={formik.handleChange} value={formik.values.password}
              className="mt-1 block w-full px-3 py-2 border rounded-md" />
            {formik.touched.password && formik.errors.password && <div className="text-red-500 text-xs">{formik.errors.password}</div>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor='userName' className="block text-sm font-medium">Nhập lại mật khẩu</label>
            <input id='userName' type="password" name="confirmPassword" onChange={formik.handleChange} value={formik.values.confirmPassword}
              className="mt-1 block w-full px-3 py-2 border rounded-md" />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && <div className="text-red-500 text-xs">{formik.errors.confirmPassword}</div>}
          </div>

          <button type="submit" disabled={formik.isSubmitting} className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md">
            Đăng ký
          </button>
        </form>
        <p className="mt-4 text-center text-sm">Đã có tài khoản? <Link href="/login" className="text-blue-600">Đăng nhập</Link></p>
      </div>
    </div>
  );
}