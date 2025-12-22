export interface Page {
  id: number;
  imageUrl: string; // Backend trả về imageUrl (nhờ AutoMapper)
  index: number;
  fileName: string;
}

export interface Chapter {
  id: number;
  comicId: number;
  title: string;
  chapterNumber: number;
  content?: string; 
  publishDate: string;
  pages: Page[]; 
}