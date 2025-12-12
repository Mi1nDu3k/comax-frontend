'use client';
import { useEffect, useState, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, useParams } from 'next/navigation';
import { comicService } from '@/services/comic.service';
import { categoryService } from '@/services/category.service';
import { authorService, Author } from '@/services/author.service';
// 1. Dùng Type Comic ở đây để định nghĩa cho dữ liệu API trả về
import { Category} from '@/types/comic'; 
import { FaArrowLeft, FaSave, FaImage, FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

// 2. Định nghĩa Interface cho InitialData để tránh dùng 'any'
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 3. Thay <any> bằng Interface vừa tạo
  const [initialData, setInitialData] = useState<ComicFormValues | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [comicData, catsData, authorsData] = await Promise.all([
          comicService.getById(comicId.toString()),
          categoryService.getAll(),
          authorService.getAll()
        ]);

        setCategories(catsData);
        setAuthors(authorsData);

        // comicData ở đây có kiểu là Comic (từ service)
        setInitialData({
          title: comicData.title,
          description: comicData.description,
          authorId: comicData.authorName || '',
          // 4. Sửa (c: any) thành (c: Category)
          categoryIds: comicData.categories ? comicData.categories.map((c: Category) => c.id.toString()) : [],
          status: typeof comicData.status === 'number' ? comicData.status : 1,
          thumbnailUrl: comicData.thumbnailUrl
        });

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        alert('Không tìm thấy truyện hoặc lỗi kết nối.');
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
        formData.append('CategoryID', JSON.stringify(values.categoryIds));

        if (values.coverImageFile) {
          formData.append('CoverImageFile', values.coverImageFile);
        }

        await comicService.update(comicId, formData);
        alert('Cập nhật truyện thành công!');
        router.push('/admin/comic');
      } catch (error) {
        console.error(error);
        alert('Lỗi khi cập nhật truyện.');
      }
    },
  });

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
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/comic" className="text-gray-500 hover:text-gray-800" aria-label="Quay lại">
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Cập nhật truyện: <span className="text-blue-600">{initialData?.title}</span></h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CỘT TRÁI: ẢNH BÌA */}
            <div className="lg:col-span-1">
              <label htmlFor="coverImageFile" className="block text-sm font-bold text-gray-700 mb-2">Ảnh bìa</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition relative aspect-[2/3] flex flex-col items-center justify-center bg-gray-50">
                <input
                  id="coverImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Thay đổi ảnh bìa"
                />
                
                {previewImage ? (
                  <Image src={previewImage} alt="Preview New" fill className="object-cover rounded-md" unoptimized />
                ) : initialData?.thumbnailUrl ? (
                  <Image src={initialData.thumbnailUrl} alt="Current Cover" fill className="object-cover rounded-md" unoptimized />
                ) : (
                  <div className="text-gray-400">
                    <FaImage size={48} className="mx-auto mb-2" />
                    <p className="text-sm">Chưa có ảnh</p>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 z-20 pointer-events-none">
                    Nhấn để đổi ảnh
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: THÔNG TIN */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Tên truyện */}
                <div className="col-span-2">
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">Tên truyện <span className="text-red-500">*</span></label>
                    <input
                    id="title"
                    type="text"
                    name="title"
                    onChange={formik.handleChange}
                    value={formik.values.title}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {/* 5. Ép kiểu lỗi thành string */}
                    {formik.touched.title && formik.errors.title && <p className="text-red-500 text-xs mt-1">{formik.errors.title as string}</p>}
                </div>

                {/* Tác giả */}
                <div>
                    <label htmlFor="authorId" className="block text-sm font-bold text-gray-700 mb-1">Tác giả <span className="text-red-500">*</span></label>
                    <select
                    id="authorId"
                    name="authorId"
                    onChange={formik.handleChange}
                    value={formik.values.authorId}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                    <option value="">-- Chọn tác giả --</option>
                    {authors.map((author) => (
                        <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                    </select>
                    {/* 6. Ép kiểu lỗi thành string */}
                    {formik.touched.authorId && formik.errors.authorId && <p className="text-red-500 text-xs mt-1">{formik.errors.authorId as string}</p>}
                </div>

                {/* Trạng thái */}
                <div>
                    <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-1">Trạng thái</label>
                    <select
                    id="status"
                    name="status"
                    onChange={formik.handleChange}
                    value={formik.values.status}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                    <option value={1}>Đang tiến hành</option>
                    <option value={2}>Đã hoàn thành</option>
                    <option value={0}>Tạm ngưng</option>
                    </select>
                </div>
              </div>

              {/* Thể loại */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Thể loại <span className="text-red-500">*</span></label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
                    <FaSearch className="text-gray-400 text-xs" />
                    <input 
                      type="text" 
                      placeholder="Tìm thể loại..." 
                      className="bg-transparent outline-none text-sm w-full"
                      value={catSearch}
                      onChange={(e) => setCatSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2 grid grid-cols-2 gap-2 bg-white">
                    {filteredCategories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded cursor-pointer transition select-none">
                        <input 
                          type="checkbox"
                          checked={formik.values.categoryIds.includes(cat.id.toString())}
                          onChange={() => handleCategoryCheck(cat.id.toString())}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* 7. Ép kiểu lỗi thành string */}
                {formik.touched.categoryIds && formik.errors.categoryIds && <p className="text-red-500 text-xs mt-1">{formik.errors.categoryIds as string}</p>}
              </div>

              {/* Mô tả */}
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  onChange={formik.handleChange}
                  value={formik.values.description}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t gap-4">
            <Link href="/admin/comics" className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium">
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-lg disabled:opacity-50"
            >
              <FaSave />
              {formik.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}