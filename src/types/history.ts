export interface HistoryCreateDTO {
    comicId: number;
    chapterId: number;
}

export interface ReadingHistoryItem {
    id: number;
    comicId: number;
    comicTitle: string;
    comicSlug: string;
    comicImage: string; // Đã map từ backend
    chapterId: number;
    chapterNumber: number;
    chapterTitle?: string;
    lastReadTime: string; // Chuẩn hóa là lastReadTime cho khớp backend
}