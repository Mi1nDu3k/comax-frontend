'use client';
import { useEffect, useState, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { comicService } from '@/services/comic.service';
import { categoryService } from '@/services/category.service';
import { authorService, Author } from '@/services/author.service';
import { Category } from '@/types/comic';
import { FaArrowLeft, FaSave, FaImage, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function CreateComicPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- STATE CHO CHỨC NĂNG MỚI ---
  const [catSearch, setCatSearch] = useState(''); // Tìm kiếm category
  const [showAuthorModal, setShowAuthorModal] = useState(false); // Modal thêm tác giả
  const [newAuthorName, setNewAuthorName] = useState(''); // Input tên tác giả mới
  const [creatingAuthor, setCreatingAuthor] = useState(false);

  // Load dữ liệu ban đầu
  useEffect(() => {
    fetchAuthors();
    categoryService.getAll().then(setCategories);
  }, []);

  const fetchAuthors = async () => {
    const data = await authorService.getAll();
    setAuthors(data);
  };

  // Formik Setup
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      authorId: '',
      categoryIds: [] as string[],
      coverImageFile: null as File | null,
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Vui lòng nhập tên truyện'),
      authorId: Yup.string().required('Vui lòng chọn tác giả'),
      coverImageFile: Yup.mixed().required('Vui lòng chọn ảnh bìa'),
      categoryIds: Yup.array().min(1, 'Chọn ít nhất 1 thể loại'),
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('Title', values.title);
        formData.append('Description', values.description);
        formData.append('AuthorId', values.authorId);
        formData.append('CategoryID', JSON.stringify(values.categoryIds)); // Backend parse JSON này

        if (values.coverImageFile) {
          formData.append('CoverImageFile', values.coverImageFile);
        }

        await comicService.create(formData);
        alert('Thêm truyện thành công!');
        router.push('/admin/comics');
      } catch (error) {
        console.error(error);
        alert('Lỗi khi thêm truyện. Vui lòng kiểm tra lại.');
      }
    },
  });

  // --- LOGIC XỬ LÝ ẢNH ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      formik.setFieldValue('coverImageFile', file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // --- LOGIC XỬ LÝ CATEGORY (CHECKBOX & SEARCH) ---
  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(catSearch.toLowerCase())
    );
  }, [categories, catSearch]);

  const handleCategoryCheck = (catId: string) => {
    const currentIds = formik.values.categoryIds;
    if (currentIds.includes(catId)) {
      // Nếu đã có -> Bỏ chọn
      formik.setFieldValue('categoryIds', currentIds.filter(id => id !== catId));
    } else {
      // Chưa có -> Thêm vào
      formik.setFieldValue('categoryIds', [...currentIds, catId]);
    }
  };

  // --- LOGIC XỬ LÝ THÊM TÁC GIẢ MỚI ---
  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim()) return;
    setCreatingAuthor(true);
    try {
      // 1. Gọi API tạo tác giả
      const newAuthor = await authorService.create({ name: newAuthorName });
      
      // 2. Refresh lại list tác giả
      await fetchAuthors();
      
      // 3. Tự động chọn tác giả vừa tạo
      // Lưu ý: Backend cần trả về object Author vừa tạo (có ID)
      if (newAuthor && newAuthor.id) {
          formik.setFieldValue('authorId', newAuthor.id);
      }
      
      // 4. Reset & Đóng modal
      setNewAuthorName('');
      setShowAuthorModal(false);
      alert('Đã thêm tác giả mới!');
    } catch (error) {
      console.error('Lỗi tạo tác giả. Có thể tên đã tồn tại.', error);
    } finally {
      setCreatingAuthor(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/comics" className="text-gray-500 hover:text-gray-800" aria-label="Quay lại">
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Thêm truyện mới</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CỘT TRÁI: ẢNH BÌA (Chiếm 1 phần) */}
            <div className="lg:col-span-1">
              <label htmlFor="coverImageFile" className="block text-sm font-bold text-gray-700 mb-2">Ảnh bìa</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center transition relative aspect-[2/3] flex flex-col items-center justify-center bg-gray-50
                  ${formik.errors.coverImageFile && formik.touched.coverImageFile ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-100'}
                `}
              >
                <input
                  id="coverImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Tải ảnh bìa"
                />
                
                {previewImage ? (
                  <Image src={previewImage} alt="Preview" fill className="object-cover rounded-md" unoptimized />
                ) : (
                  <div className="text-gray-400">
                    <FaImage size={48} className="mx-auto mb-2" />
                    <p className="text-sm font-medium">Nhấn để tải ảnh lên</p>
                    <p className="text-xs mt-1">Hỗ trợ JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
              {formik.touched.coverImageFile && formik.errors.coverImageFile && (
                <p className="text-red-500 text-xs mt-2 text-center">{formik.errors.coverImageFile as string}</p>
              )}
            </div>

            {/* CỘT PHẢI: THÔNG TIN CHI TIẾT (Chiếm 2 phần) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tên truyện */}
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">Tên truyện <span className="text-red-500">*</span></label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  onChange={formik.handleChange}
                  value={formik.values.title}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Nhập tên truyện..."
                />
                {formik.touched.title && formik.errors.title && <p className="text-red-500 text-xs mt-1">{formik.errors.title}</p>}
              </div>

              {/* Tác giả (Select + Button Add) */}
              <div>
                <label htmlFor="authorId" className="block text-sm font-bold text-gray-700 mb-1">Tác giả <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select
                    id="authorId"
                    name="authorId"
                    onChange={formik.handleChange}
                    value={formik.values.authorId}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                  >
                    <option value="">-- Chọn tác giả --</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => setShowAuthorModal(true)}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1 shadow-sm"
                    title="Thêm tác giả mới"
                  >
                    <FaPlus /> 
                  </button>
                </div>
                {formik.touched.authorId && formik.errors.authorId && <p className="text-red-500 text-xs mt-1">{formik.errors.authorId}</p>}
              </div>

              {/* Thể loại (Search + Checkbox List) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Thể loại <span className="text-red-500">*</span></label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* Search Bar */}
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
                  
                  {/* List Checkbox */}
                  <div className="max-h-48 overflow-y-auto p-2 grid grid-cols-2 gap-2 bg-white">
                    {filteredCategories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded cursor-pointer transition select-none">
                        <input 
                          type="checkbox"
                          checked={formik.values.categoryIds.includes(cat.id)}
                          onChange={() => handleCategoryCheck(cat.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{cat.name}</span>
                      </label>
                    ))}
                    {filteredCategories.length === 0 && (
                      <p className="col-span-2 text-center text-sm text-gray-400 py-4">Không tìm thấy thể loại nào.</p>
                    )}
                  </div>
                </div>
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Tóm tắt nội dung truyện..."
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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
              {formik.isSubmitting ? 'Đang lưu...' : 'Lưu truyện'}
            </button>
          </div>
        </form>
      </div>

      {/* --- MODAL TẠO TÁC GIẢ --- */}
      {showAuthorModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
              <h3 className="font-bold text-lg text-gray-800">Thêm Tác giả mới</h3>
              <button  onClick={() => setShowAuthorModal(false)} className="text-gray-500 hover:text-red-500" aria-label="Đóng modal">
                <FaTimes size={20} />
               
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên tác giả</label>
              <input 
                type="text" 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Ví dụ: Kim Dung"
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button 
                onClick={() => setShowAuthorModal(false)}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateAuthor}
                disabled={creatingAuthor || !newAuthorName.trim()}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 font-medium"
              >
                {creatingAuthor ? 'Đang tạo...' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}