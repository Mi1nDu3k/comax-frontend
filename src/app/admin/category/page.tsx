'use client';
import { useState, useEffect } from 'react';
import { categoryService } from '@/services/category.service';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { Category } from '@/types/comic';


export default function CategoryManagerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({ name: '', description: '' });

  // 1. Load danh sách
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error("Lỗi tải danh sách thể loại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 2. Xử lý mở Modal (Thêm hoặc Sửa)
  const openModal = (category?: Category) => {
    if (category) {
      setIsEditing(true);
      setCurrentId(category.id);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  // 3. Xử lý Lưu (Submit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.warn("Tên thể loại không được để trống");

    try {
      if (isEditing && currentId) {
        // Cập nhật
        await categoryService.update(currentId, formData.name, formData.description);
        toast.success("Cập nhật thành công!");
      } else {
        // Thêm mới
        await categoryService.create(formData.name, formData.description);
        toast.success("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      loadCategories(); // Reload lại list
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu dữ liệu");
    }
  };

  // 4. Xử lý Xóa
  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa thể loại này?")) {
      try {
        await categoryService.delete(id);
        toast.success("Đã xóa thể loại");
        loadCategories();
      } catch (error) {
        toast.error("Không thể xóa (Có thể đang có truyện thuộc thể loại này)");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Thể loại</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <FaPlus /> Thêm mới
        </button>
      </div>

      {/* Bảng Danh Sách */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Thể Loại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Đang tải...</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{cat.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => openModal(cat)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && categories.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">Chưa có thể loại nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{isEditing ? 'Cập nhật Thể loại' : 'Thêm Thể loại mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Thể Loại</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Ví dụ: Hành động, Tình cảm..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (Tùy chọn)</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Mô tả ngắn về thể loại này..."
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}