'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { chapterService } from '@/services/chapter.service';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

function CreateChapterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comicId = searchParams.get('comicId');

  useEffect(() => {
    if (!comicId) {
      toast.error('Không xác định được truyện!');
      router.push('/admin/comic');
    }
  }, [comicId, router]);

  const formik = useFormik({
    initialValues: {
      title: '',
      chapterNumber: '',
      content: '', // Nhập danh sách link ảnh (text)
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Vui lòng nhập tên chương'),
      chapterNumber: Yup.number().typeError('Phải là số').required('Nhập số thứ tự chương'),
      content: Yup.string().required('Vui lòng nhập nội dung ảnh'),
    }),
    onSubmit: async (values) => {
      if (!comicId) return;
      try {
        // Chuyển đổi text nhiều dòng thành mảng JSON
        // Ví dụ: "link1\nlink2" -> '["link1", "link2"]'
        const links = values.content
            .split('\n')
            .map(s => s.trim())
            .filter(s => s !== '');
        
        const jsonContent = JSON.stringify(links);

        await chapterService.create({
            comicId: Number(comicId),
            title: values.title,
            chapterNumber: Number(values.chapterNumber),
            content: jsonContent
        });

        toast.success('Thêm chương thành công!');
        router.push(`/admin/comic/edit/${comicId}`); // Quay lại trang sửa truyện
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi thêm chương.');
      }
    },
  });

  return (
    <div className="max-w-4xl mx-auto pb-20 p-6">
      <div className="flex items-center gap-4 mb-6">
        <button aria-label='ădw' onClick={() => router.back()} className="text-gray-500 hover:text-gray-800">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Thêm Chương Mới</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Số chương <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="chapterNumber"
                  onChange={formik.handleChange}
                  value={formik.values.chapterNumber}
                  placeholder="Ví dụ: 1"
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formik.touched.chapterNumber && formik.errors.chapterNumber && <p className="text-red-500 text-xs mt-1">{formik.errors.chapterNumber}</p>}
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên chương <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  onChange={formik.handleChange}
                  value={formik.values.title}
                  placeholder="Ví dụ: Mở đầu"
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formik.touched.title && formik.errors.title && <p className="text-red-500 text-xs mt-1">{formik.errors.title}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Link ảnh (Mỗi link 1 dòng) <span className="text-red-500">*</span></label>
            <textarea
              name="content"
              rows={10}
              onChange={formik.handleChange}
              value={formik.values.content}
              className="w-full border rounded-lg px-4 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={'https://img1.com/a.jpg\nhttps://img2.com/b.jpg'}
            />
            {formik.touched.content && formik.errors.content && <p className="text-red-500 text-xs mt-1">{formik.errors.content}</p>}
          </div>

          <div className="flex justify-end pt-6 border-t gap-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border text-gray-700 hover:bg-gray-50">Hủy bỏ</button>
            <button type="submit" disabled={formik.isSubmitting} className="flex items-center gap-2 bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 shadow-md">
              <FaSave /> Lưu chương
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateChapterPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <CreateChapterForm />
    </Suspense>
  );
}