
export const getMinioUrl = (url: string | null | undefined): string => {
  if (!url) return '/images/default-placeholder.png'; 
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (typeof window === 'undefined' && url.includes('localhost:9000')) {
       return url.replace('http://localhost:9000', 'http://minio:9000');
    }
    return url;
  }
  const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  if (cleanPath.startsWith('comics-bucket/')) {
      return `${minioUrl}/${cleanPath}`;
  }

  // Nếu chưa có bucket thì nối vào
  return `${minioUrl}/comics-bucket/${cleanPath}`;
};