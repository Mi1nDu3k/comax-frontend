'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { chapterService } from '@/services/chapter.service';
import { FaArrowLeft, FaCloudUploadAlt, FaTimes, FaSpinner, FaFolderOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Image from 'next/image';

function CreateChapterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comicId = searchParams.get('comicId');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  // --- THÊM STATE TIẾN TRÌNH ---
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!comicId) {
      toast.error('Không xác định được truyện!');
      router.push('/admin/comic');
    }
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [comicId, router]);

  const sortFiles = (files: File[]) => {
    return files.sort((a, b) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const sortedFiles = sortFiles(filesArray);
      
      setSelectedFiles(sortedFiles);

      const newPreviews = sortedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => {
        prev.forEach(u => URL.revokeObjectURL(u));
        return newPreviews;
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previewUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      chapterNumber: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Vui lòng nhập tên chương'),
      chapterNumber: Yup.number().typeError('Phải là số').required('Nhập số thứ tự chương'),
    }),
    onSubmit: async (values) => {
      if (!comicId) return;
      if (selectedFiles.length === 0) {
        toast.error("Chưa chọn ảnh!");
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(0); // Reset tiến trình về 0

        const formData = new FormData();
        formData.append('ComicId', comicId);
        formData.append('Title', values.title);
        formData.append('ChapterNumber', values.chapterNumber);

        selectedFiles.forEach((file) => {
            formData.append('Images', file); 
        });

        // --- GỌI API VỚI CALLBACK TIẾN TRÌNH ---
        await chapterService.createWithImages(formData, (percent) => {
          setUploadProgress(percent);
        });

        toast.success('Thêm chương thành công!');
        router.push(`/admin/comic/edit/${comicId}`);
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi thêm chương. Vui lòng thử lại.');
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <div className="max-w-5xl mx-auto pb-20 p-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
            type="button"
            onClick={() => router.back()} 
            className="text-gray-500 hover:text-gray-800 transition"
            aria-label="Quay lại"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Thêm Chương Mới (Upload Ảnh)</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="chapterNumber" className="block text-sm font-bold text-gray-700 mb-1">
                    Số chương <span className="text-red-500">*</span>
                </label>
                <input
                  id="chapterNumber"
                  type="number"
                  name="chapterNumber"
                  onChange={formik.handleChange}
                  value={formik.values.chapterNumber}
                  placeholder="Ví dụ: 1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formik.touched.chapterNumber && formik.errors.chapterNumber && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.chapterNumber}</p>
                )}
            </div>
            <div>
                <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">
                    Tên chương <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  onChange={formik.handleChange}
                  value={formik.values.title}
                  placeholder="Ví dụ: Mở đầu"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formik.touched.title && formik.errors.title && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.title}</p>
                )}
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
                Danh sách ảnh truyện <span className="text-red-500">*</span>
            </label>
            
            <div className="flex items-center gap-4 mb-4">
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                />
                <label 
                    htmlFor="file-upload"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition border border-dashed border-gray-400
                        ${isUploading ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-500'}
                    `}
                >
                    <FaFolderOpen />
                    <span>Chọn nhiều ảnh (hoặc Ctrl+A trong folder)</span>
                </label>
                <span className="text-sm text-gray-500">
                    {selectedFiles.length > 0 ? `Đã chọn ${selectedFiles.length} ảnh` : 'Chưa chọn ảnh nào'}
                </span>
            </div>

            {previewUrls.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-3 italic">
                        * Hệ thống đã tự động sắp xếp theo tên file (1.jpg, 2.jpg...). Vui lòng kiểm tra lại thứ tự.
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative group aspect-[2/3] border rounded overflow-hidden bg-white shadow-sm">
                                <Image 
                                    src={url} 
                                    alt={`Page ${index + 1}`} 
                                    fill 
                                    className="object-cover" 
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white">
                                    <span className="font-bold text-lg">{index + 1}</span>
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="mt-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
                                        title="Xóa ảnh này"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate text-center">
                                    {selectedFiles[index]?.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* --- KHU VỰC PROGRESS BAR --- */}
          {isUploading && (
            <div className="mt-6 border-t pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-blue-700">
                  {uploadProgress < 100 ? 'Đang tải ảnh lên...' : 'Đang xử lý dữ liệu trên server...'}
                </span>
                <span className="text-sm font-bold text-blue-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out" 
                  style={{ minHeight: '600px'}}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t gap-4">
            <button 
                type="button" 
                onClick={() => router.back()} 
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                disabled={isUploading}
            >
                Hủy bỏ
            </button>
            <button 
                type="submit" 
                disabled={formik.isSubmitting || isUploading || selectedFiles.length === 0} 
                className="flex items-center gap-2 bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isUploading ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />}
              {isUploading ? 'Đang xử lý...' : 'Upload & Lưu Chương'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateChapterPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
      <CreateChapterForm />
    </Suspense>
  );
}