

export const getMinioUrl = (url: string | null | undefined): string => {
  if (!url) return ''; 


  const isServer = typeof window === 'undefined';


  if (isServer && url.includes('localhost:9000')) {
    return url.replace('http://localhost:9000', 'http://minio:9000');
  }

  // Nếu ở Client-side (Trình duyệt), giữ nguyên localhost:9000
  return url;
};