'use client';
import { useEffect, useState } from 'react'; // Xóa useCallback vì không dùng
import { useFormik } from 'formik';
// import * as Yup from 'yup'; // Xóa nếu không dùng validation phức tạp ở đây
import { useRouter, useParams } from 'next/navigation';
import { chapterService } from '@/services/chapter.service';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaImage, FaGripVertical } from 'react-icons/fa';
import Image from 'next/image';
import { toast } from 'react-toastify';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- ĐỊNH NGHĨA INTERFACE ---
interface ApiPageResponse {
  id: number;
  imageUrl: string;
  index: number;
}

interface PageItem {
  id: string; 
  dbId?: number; 
  imageUrl: string;
  index: number;
  isNew?: boolean;
  file?: File;
}

// --- COMPONENT CON: SortablePage ---
function SortablePage({ page, onRemove }: { page: PageItem; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });

  // ESLint ignore cho inline-style vì dnd-kit bắt buộc dùng transform inline

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-[2/3] border rounded-lg overflow-hidden bg-gray-100 ${
        page.isNew ? 'border-green-400' : 'border-gray-200'
      }`}
    >
      <Image src={page.imageUrl} alt="Page" fill className="object-cover" unoptimized />
      
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-2 bg-black/50 text-white rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition"
        title="Kéo để sắp xếp"
      >
        <FaGripVertical size={14} />
      </div>

      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">
        {page.isNew ? 'Mới' : `ID: ${page.dbId}`}
      </div>

      <button
        type="button"
        onClick={() => onRemove(page.id)}
        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
        title="Xóa trang"
        aria-label="Xóa trang"
      >
        <FaTrash size={12} />
      </button>
    </div>
  );
}

// --- COMPONENT CHÍNH ---
export default function EditChapterPage() {
  const router = useRouter();
  const params = useParams();
  const chapterId = params.id as string; 
  const [allPages, setAllPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { title: '', chapterNumber: 0 },
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('Title', values.title);
        formData.append('ChapterNumber', values.chapterNumber.toString());

        const updatedPages = allPages.map((p, idx) => ({ ...p, index: idx + 1 }));
        const existingOnes = updatedPages.filter(p => !p.isNew);
        formData.append('ExistingPagesJson', JSON.stringify(existingOnes));

        updatedPages.filter(p => p.isNew).forEach((p) => {
          if (p.file) formData.append('NewPages', p.file);
        });

        await chapterService.update(Number(chapterId), formData);
        toast.success('Cập nhật thành công!');
        router.back();
      } catch { // Bỏ biến error nếu không dùng
        toast.error('Lỗi khi lưu dữ liệu');
      }
    },
  });

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const data = await chapterService.getById(chapterId);
        // Fix lỗi 'any' bằng interface ApiPageResponse
        const pages = data.pages
          .sort((a: ApiPageResponse, b: ApiPageResponse) => a.index - b.index)
          .map((p: ApiPageResponse) => ({
            id: `old-${p.id}`,
            dbId: p.id,
            imageUrl: p.imageUrl,
            index: p.index
          }));
        setAllPages(pages);
        formik.setValues({ title: data.title || '', chapterNumber: data.chapterNumber });
      } catch {
        toast.error('Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    if (chapterId) fetchChapter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]); // formik không đưa vào đây để tránh re-render liên tục

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAllPages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newItems = filesArray.map((file) => ({
        id: `new-${Math.random()}`,
        imageUrl: URL.createObjectURL(file),
        index: allPages.length,
        isNew: true,
        file: file
      }));
      setAllPages((prev) => [...prev, ...newItems]);
    }
  };

  const removePage = (id: string) => {
    setAllPages((prev) => {
        const itemToRemove = prev.find(p => p.id === id);
        if (itemToRemove?.isNew) URL.revokeObjectURL(itemToRemove.imageUrl);
        return prev.filter(p => p.id !== id);
    });
  };

  if (loading) return <div className="p-10 text-center text-white">Đang tải...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 p-4 text-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200" 
            title="Quay lại"
            aria-label="Quay lại"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-white">Sắp xếp trang chương</h1>
        </div>
        <button 
            type="button"
            onClick={() => formik.handleSubmit()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-lg"
        >
          <FaSave /> Lưu thứ tự mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <label htmlFor="chapterNumber" className="block text-sm font-bold mb-2">Số chương</label>
            <input 
                id="chapterNumber"
                type="number" 
                {...formik.getFieldProps('chapterNumber')} 
                className="w-full border p-2 rounded mb-3 outline-none focus:ring-2 focus:ring-blue-500" 
            />
            
            <label htmlFor="title" className="block text-sm font-bold mb-2">Tên chương</label>
            <input 
                id="title"
                type="text" 
                {...formik.getFieldProps('title')} 
                className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <label className="cursor-pointer bg-blue-50 text-blue-600 border-2 border-dashed border-blue-200 w-full py-8 rounded-xl flex flex-col items-center justify-center hover:bg-blue-100 transition">
            <FaPlus size={24} />
            <span className="font-bold mt-2">Thêm trang mới</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        <div className="lg:col-span-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={allPages.map(p => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-gray-800 p-4 rounded-xl min-h-[500px]">
                {allPages.map((page) => (
                  <SortablePage key={page.id} page={page} onRemove={removePage} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}