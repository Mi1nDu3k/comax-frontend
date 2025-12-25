export interface Category {
  id: string;
  name: string;
}

export interface ChapterItem {
  id: string;
  title: string;
  chapterNumber: number;
  publishDate: string;
}

export interface Comic {
  id: number; 
  title: string;
  description: string;
  thumbnailUrl: string; 
  slug: string;
  authorId :string;
  authorName: string;   
  viewCount: number;    
  status: number;      
  categoryIds?: number[];
  categories: Category[];
  chapters?: ChapterItem[];
  latestChapterNumber?: number; // Thêm dòng này
  latestChapterDate?: string;
  rating: number;
  createdAt: string;
  categoryNames: string[];
}
export interface ComicDetail {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  authorName: string;
  viewCount: number;
  rating: number; // Điểm trung bình
  status: string;
  categoryNames: string[]; // Danh sách tên thể loại
  chapters: {
    id: number;
    chapterNumber: number;
    title: string;
    slug: string;
    publishDate: string;
  }[];
}