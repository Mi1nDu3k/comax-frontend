export const getMinioUrl = (url: string | null | undefined): string => {
  if (!url) return '/default-avatar.png'; // Ảnh fallback nếu không có URL


  const isServer = typeof window === 'undefined';

  if (isServer) {

    return url.replace('http://localhost:9000', process.env.MINIO_INTERNAL_URL || 'http://minio:9000');
  }


  return url;
};