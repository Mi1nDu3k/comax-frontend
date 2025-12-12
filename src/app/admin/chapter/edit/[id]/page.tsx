'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { chapterService } from '@/services/chapter.service';
import { Chapter } from '@/types/chapter';
import { FaArrowLeft, FaSave, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function EditChapterPage() {
  const router = useRouter();
  const params = useParams();
  const chapterId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Chapter | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await chapterService.getById(chapterId);
        setInitialData(data);
      } catch (error) {
        console.error("Lỗi tải chương:", error);
        toast.error('Không tìm thấy chương.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (chapterId) fetchData();
  }, [chapterId, router]);

  // Helper: Chuyển JSON mảng ảnh -> Text dòng
  const jsonToText = (jsonString: string) => {
      try {
          const arr = JSON.parse(jsonString);
          return Array.isArray(arr) ? arr.join('\n') : jsonString;
      } catch { return jsonString; }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: initialData?.title || '',
      chapterNumber: initialData?.chapterNumber || 0,
      content: initialData?.content ? jsonToText(initialData.content) : '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Nhập tên chương'),
      chapterNumber: Yup.number().required('Nhập số thứ tự'),
      content: Yup.string().required('Nhập nội dung ảnh'),
    }),
    onSubmit: async (values) => {
      try {
        // Chuyển Text dòng -> JSON Array
        const links = values.content.split('\n').map(s => s.trim()).filter(s => s !== '');
        const jsonContent = JSON.stringify(links);

        await chapterService.update(Number(chapterId), {
            title: values.title,
            chapterNumber: Number(values.chapterNumber),
            content: jsonContent
        });

        toast.success('Cập nhật thành công!');
        router.back(); // Quay về trang list chapter
      } catch (error) {
        console.error(error);
        toast.error('Lỗi cập nhật.');
      }
    },
  });

  const handleDelete = async () => {
      if(!confirm("Bạn chắc chắn muốn xóa chương này?")) return;
      try {
          await chapterService.delete(Number(chapterId));
          toast.success("Đã xóa chương");
          router.back();
      } catch { toast.error("Lỗi xóa"); }
  }

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <button aria-label='Xóa' onClick={() => router.back()} className="text-gray-500 hover:text-gray-800"><FaArrowLeft size={20}/></button>
            <h1 className="text-2xl font-bold text-gray-800">Sửa Chương {initialData?.chapterNumber}</h1>
        </div>
        <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded flex items-center gap-2 font-medium">
            <FaTrash /> Xóa chương
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Số chương</label>
                <input aria-label="Chapter" type="number" name="chapterNumber" onChange={formik.handleChange} value={formik.values.chapterNumber} className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên chương</label>
                <input aria-label='Tên Chapter' type="text" name="title" onChange={formik.handleChange} value={formik.values.title} className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Link ảnh (Mỗi link 1 dòng)</label>
            <textarea aria-label='linh ảnh' name="content" rows={12} onChange={formik.handleChange} value={formik.values.content} className="w-full border rounded-lg px-4 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex justify-end pt-6 border-t gap-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border text-gray-700 hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={formik.isSubmitting} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 shadow-md">
              <FaSave /> Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}