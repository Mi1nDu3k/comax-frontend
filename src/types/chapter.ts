export interface Chapter {
  id: number;
  comicId: number;
  title: string;
  chapterNumber: number; // Backend trả về ChapterNumber (hoặc Order nếu chưa map)
  content: string;       // Chuỗi JSON chứa danh sách link ảnh
  publishDate: string;
}