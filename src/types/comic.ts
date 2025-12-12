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
  authorName: string;   
  viewCount: number;    
  status: number;      
  categories: Category[];
  chapters?: ChapterItem[];
}