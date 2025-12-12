import api from '@/lib/axios';

export const storageService = {
  // Upload 1 file và trả về URL
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file); // Tên field 'file' phải khớp với Backend
    
    // Giả sử Backend có API: POST /api/upload
    const response = await api.post<{ url: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
  },

  // Upload nhiều file
  uploadMultiple: async (files: File[]) => {
    // Dùng Promise.all để upload song song cho nhanh
    const uploadPromises = files.map(file => storageService.upload(file));
    return await Promise.all(uploadPromises);
  }
};