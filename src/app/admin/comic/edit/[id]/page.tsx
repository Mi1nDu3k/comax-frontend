'use client';
import { useEffect, useState, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, useParams } from 'next/navigation';
import { comicService } from '@/services/comic.service';
import { categoryService } from '@/services/category.service';
import { authorService, Author } from '@/services/author.service';
import { chapterService } from '@/services/chapter.service'; // Service chương
import { Category } from '@/types/comic'; 
import { Chapter } from '@/types/chapter'; // Type chương
import { FaArrowLeft, FaSave, FaImage, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface ComicFormValues {
  title: string;
  description: string;
  authorId: string | number;
  status: number;
  categoryIds: string[];
  thumbnailUrl?: string;
}

export default function EditComicPage() {
  const router = useRouter();
  const params = useParams();
  const comicId = Number(params.id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]); // Danh sách chương
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [initialData, setInitialData] = useState<ComicFormValues | null>(null);

  // 1. Load dữ liệu Truyện + Danh sách Chapter
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [comicData, catsData, authorsData, chaptersData] = await Promise.all([
          comicService.getById(comicId.toString()),
          categoryService.getAll(),
          authorService.getAll(),
          chapterService.getByComicId(comicId.toString()) // Gọi API lấy chapter
        ]);

        setCategories(catsData);
        setAuthors(authorsData);
        setChapters(chaptersData || []);

        setInitialData({
          title: comicData.title,
          description: comicData.description,
          // Lấy ID tác giả (fallback về rỗng nếu lỗi)
          authorId: comicData.authorId || '',
          categoryIds: comicData.categoryIds 
    ? comicData.categoryIds.map((id: number) => id.toString()) 
    : (comicData.categories 
        ? comicData.categories.map((c: Category) => c.id.toString()) 
        : []),

  status: typeof comicData.status === 'number' ? comicData.status : 1,
  thumbnailUrl: comicData.thumbnailUrl
        });

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        toast.error('Không tìm thấy truyện hoặc lỗi kết nối.');
        router.push('/admin/comic');
      } finally {
        setLoading(false);
      }
    };

    if (comicId) fetchData();
  }, [comicId, router]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      authorId: initialData?.authorId || '',
      status: initialData?.status || 1,
      categoryIds: initialData?.categoryIds || [] as string[],
      coverImageFile: null as File | null,
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Vui lòng nhập tên truyện'),
      authorId: Yup.string().required('Vui lòng chọn tác giả'),
      categoryIds: Yup.array().min(1, 'Chọn ít nhất 1 thể loại'),
    }),
   onSubmit: async (values) => {
  try {
    const formData = new FormData();
    formData.append('Title', values.title);
    formData.append('Description', values.description);
    formData.append('AuthorId', values.authorId.toString());
    formData.append('Status', values.status.toString());
    if (values.categoryIds && values.categoryIds.length > 0) {
      values.categoryIds.forEach((id) => {
       
        formData.append('CategoryIds', id.toString()); 
      });
    }

    if (values.coverImageFile) {
      formData.append('CoverImageFile', values.coverImageFile);
    }

    await comicService.update(comicId, formData);
    toast.success('Cập nhật truyện thành công!');
  } catch (error) {
    console.error(error);
    toast.error('Lỗi khi cập nhật truyện.');
  }
},
  });

  // Xử lý xóa Chapter trực tiếp tại đây
  const handleDeleteChapter = async (chapterId: number) => {
      if(!confirm("Bạn có chắc chắn muốn xóa chương này?")) return;
      try {
          await chapterService.delete(chapterId);
          setChapters(prev => prev.filter(c => c.id !== chapterId));
          toast.success("Đã xóa chương");
      } catch {
          toast.error("Lỗi khi xóa chương");
      }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      formik.setFieldValue('coverImageFile', file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCategoryCheck = (catId: string) => {
    const currentIds = formik.values.categoryIds;
    if (currentIds.includes(catId)) {
      formik.setFieldValue('categoryIds', currentIds.filter((id: string) => id !== catId));
    } else {
      formik.setFieldValue('categoryIds', [...currentIds, catId]);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(catSearch.toLowerCase())
    );
  }, [categories, catSearch]);

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/comic" className="text-gray-500 hover:text-gray-800" aria-label="Quay lại">
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
            Cập nhật truyện: <span className="text-blue-600">{initialData?.title}</span>
        </h1>
      </div>

      {/* --- PHẦN 1: FORM SỬA THÔNG TIN TRUYỆN --- */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-bold mb-4 border-b pb-2 text-gray-700">Thông tin chung</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Ảnh bìa */}
            <div className="lg:col-span-1">
              <label htmlFor="coverImage" className="block text-sm font-bold text-gray-700 mb-2">Ảnh bìa</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition relative aspect-[2/3] flex flex-col items-center justify-center bg-gray-50">
                <input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Tải lên ảnh bìa"
                />
                {previewImage ? (
                  <Image src={previewImage} alt="Preview" fill className="object-cover rounded-md" unoptimized />
                ) : initialData?.thumbnailUrl ? (
                  <Image src={initialData.thumbnailUrl} alt="Cover" fill className="object-cover rounded-md" unoptimized />
                ) : (
                  <div className="text-gray-400"><FaImage size={48} /><p>Chưa có ảnh</p></div>
                )}
              </div>
            </div>

            {/* Các trường thông tin */}
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">Tên truyện <span className="text-red-500">*</span></label>
                        <input 
                            id="title"
                            type="text" 
                            name="title" 
                            onChange={formik.handleChange} 
                            value={formik.values.title} 
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        {formik.errors.title && <p className="text-red-500 text-xs">{formik.errors.title}</p>}
                    </div>
                    <div>
                        <label htmlFor="authorId" className="block text-sm font-bold text-gray-700 mb-1">Tác giả</label>
                        <select 
                            id="authorId"
                            name="authorId" 
                            onChange={formik.handleChange} 
                            value={formik.values.authorId} 
                            className="w-full border rounded-lg px-4 py-2 bg-white"
                        >
                            <option value="">-- Chọn tác giả --</option>
                            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-1">Trạng thái</label>
                        <select 
                            id="status"
                            name="status" 
                            onChange={formik.handleChange} 
                            value={formik.values.status} 
                            className="w-full border rounded-lg px-4 py-2 bg-white"
                        >
                            <option value={1}>Đang tiến hành</option>
                            <option value={2}>Hoàn thành</option>
                            <option value={0}>Tạm ngưng</option>
                        </select>
                    </div>
                </div>

                {/* Chọn thể loại */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Thể loại</label>
                    <div className="border rounded-lg overflow-hidden h-48 bg-white flex flex-col">
                        <div className="flex items-center px-3 border-b bg-gray-50">
                            <FaSearch className="text-gray-400 mr-2" />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm..." 
                                className="p-2 text-sm outline-none bg-transparent w-full" 
                                value={catSearch} 
                                onChange={e => setCatSearch(e.target.value)} 
                                aria-label="Tìm kiếm thể loại"
                            />
                        </div>
                        <div className="overflow-y-auto p-2 grid grid-cols-2 gap-2">
                            {filteredCategories.map(cat => (
                                <label key={cat.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={formik.values.categoryIds.includes(cat.id.toString())} 
                                        onChange={() => handleCategoryCheck(cat.id.toString())} 
                                        aria-label={`Chọn thể loại ${cat.name}`}
                                    />
                                    <span className="text-sm">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Mô tả</label>
                    <textarea 
                        id="description"
                        name="description" 
                        rows={4} 
                        onChange={formik.handleChange} 
                        value={formik.values.description} 
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button type="submit" disabled={formik.isSubmitting} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md">
              <FaSave /> {formik.isSubmitting ? 'Đang lưu...' : 'Lưu thông tin truyện'}
            </button>
          </div>
        </form>
      </div>

      {/* --- PHẦN 2: QUẢN LÝ CHAPTER --- */}
      <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-green-500">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Danh sách chương ({chapters.length})</h2>
            <Link 
                href={`/admin/chapter/create?comicId=${comicId}`} 
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm"
            >
                <FaPlus /> Thêm chương mới
            </Link>
        </div>

        <div className="overflow-hidden border rounded-lg">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600 font-semibold uppercase">
                    <tr>
                        <th className="p-3 w-20 text-center">Số</th>
                        <th className="p-3">Tên chương</th>
                        <th className="p-3 w-40">Ngày đăng</th>
                        <th className="p-3 w-32 text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {chapters.length > 0 ? (
                        // Sắp xếp chapter mới nhất lên đầu
                        [...chapters].sort((a,b) => b.chapterNumber - a.chapterNumber).map((chap) => (
                            <tr key={chap.id} className="hover:bg-gray-50 transition">
                                <td className="p-3 text-center font-bold text-gray-700">{chap.chapterNumber}</td>
                                <td className="p-3 font-medium text-gray-800">{chap.title}</td>
                                <td className="p-3 text-gray-500">
                                    {new Date(chap.publishDate).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <Link 
                                            href={`/admin/chapter/edit/${chap.id}`} 
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition" 
                                            title="Sửa chương"
                                        >
                                            <FaEdit />
                                        </Link>
                                        <button 
                                            onClick={() => handleDeleteChapter(chap.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                                            title="Xóa chương"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-400 bg-gray-50">
                                Truyện này chưa có chương nào. Hãy thêm ngay!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}