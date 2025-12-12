

export interface TopComic {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  rating: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalComics: number;
  totalChapters: number;
  totalComments: number;
  topViewedComics: TopComic[];
  labels?: string[];           
  userGrowthData?: number[];   
  
  categoryLabels?: string[];       
  comicByCategoryData?: number[]; 
}