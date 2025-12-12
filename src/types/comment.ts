 export interface Comment {
id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  parentId?: number;
  createdAt: string;
  replyCount: number; 
  replies: Comment[];
}