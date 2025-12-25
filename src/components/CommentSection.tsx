'use client';
import { useEffect, useState, useCallback } from 'react';
import { commentService } from '@/services/comment.service';
import { Comment } from '@/types/comment';
import { useAuth } from '@/context/auth.context'; 
import Image from 'next/image';
import { FaPaperPlane, FaReply } from 'react-icons/fa';
import { toast } from 'react-toastify'; 
// 1. IMPORT HÀM XỬ LÝ ẢNH
import { getMinioUrl } from '@/utils/image-helper';

// --- COMPONENT CON (Một dòng bình luận) ---
const CommentItem = ({ comment, comicId }: { comment: Comment; comicId: number }) => {
  const { user } = useAuth();
  const [replies, setReplies] = useState<Comment[]>([]);
  const [replyPage, setReplyPage] = useState(1);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  const [areRepliesLoaded, setAreRepliesLoaded] = useState(false);
  const [totalReplyCount, setTotalReplyCount] = useState(comment.replyCount);

  const handleLoadReplies = async () => {
    try {
      const newReplies = await commentService.getReplies(comment.id, replyPage);
      if (newReplies.length > 0) {
        setReplies((prev) => [...prev, ...newReplies]);
        setReplyPage((prev) => prev + 1);
      }
      setAreRepliesLoaded(true);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải câu trả lời");
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Bạn cần đăng nhập!");
    if (!replyContent.trim()) return;

    try {
      const newReply = await commentService.create({
        comicId,
        content: replyContent,
        parentId: comment.id
      });
      
      setReplies((prev) => [...prev, newReply]);
      setTotalReplyCount((prev) => prev + 1);
      setReplyContent('');
      setIsReplying(false);
      setAreRepliesLoaded(true);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi gửi bình luận");
    }
  };

  return (
    <div className="mb-6 flex gap-3">
      {/* Avatar người bình luận gốc */}
      <div className="flex-shrink-0">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
           {/* SỬA LỖI ẢNH TẠI ĐÂY */}
           <Image 
             src={getMinioUrl(comment.userAvatar)} 
             alt={comment.userName} 
             fill 
             className="object-cover" 
             unoptimized // Quan trọng: Tránh lỗi Private IP
           />
        </div>
      </div>

      <div className="flex-grow">
        <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
          <p className="font-bold text-sm text-gray-800">{comment.userName}</p>
          <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
        </div>
        
        <div className="flex gap-4 mt-1 text-xs text-gray-500 ml-1">
          <span>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
          <button onClick={() => setIsReplying(!isReplying)} className="hover:text-blue-600 font-semibold">Trả lời</button>
        </div>

        {isReplying && (
          <form onSubmit={handleSubmitReply} className="mt-3 flex gap-2">
            <input 
              type="text" 
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Trả lời ${comment.userName}...`}
              className="flex-grow border rounded px-3 py-2 text-sm focus:outline-blue-500"
              autoFocus
            />
            <button 
                type="submit" 
                className="text-blue-600 p-2 hover:bg-blue-50 rounded"
                aria-label="Gửi trả lời"
            >
                <FaPaperPlane />
            </button>
          </form>
        )}

        <div className="mt-2 ml-2 border-l-2 border-gray-200 pl-4">
          {replies.map((rep) => (
             <div key={rep.id} className="mb-3 flex gap-2">
                {/* Avatar người trả lời */}
                <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-1">
                   {/* SỬA LỖI ẢNH TẠI ĐÂY */}
                   <Image 
                     src={getMinioUrl(rep.userAvatar)} 
                     alt={rep.userName} 
                     fill 
                     className="object-cover" 
                     unoptimized 
                   />
                </div>
                <div>
                   <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="font-bold text-xs text-gray-800 mr-2">{rep.userName}</span>
                      <span className="text-gray-700 text-sm">{rep.content}</span>
                   </div>
                </div>
             </div>
          ))}

          {totalReplyCount > replies.length && (
            <button 
              onClick={handleLoadReplies}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 mt-2"
            >
              <FaReply className="transform rotate-180" />
              {areRepliesLoaded ? "Xem thêm câu trả lời cũ hơn" : `Xem ${totalReplyCount} câu trả lời`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export default function CommentSection({ comicId }: { comicId: number }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [content, setContent] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadComments = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await commentService.getParents(comicId.toString(), pageNum);
      
      if (data.length < 5) setHasMore(false);

      if (pageNum === 1) setComments(data);
      else setComments(prev => [...prev, ...data]);
      
    } catch (error) {
      console.error("Lỗi tải bình luận", error);
    } finally {
      setLoading(false);
    }
  }, [comicId]);

  useEffect(() => {
    loadComments(1);
    setPage(1);
    setHasMore(true);
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Vui lòng đăng nhập để bình luận");
    if (!content.trim()) return;

    try {
      const newComment = await commentService.create({
        comicId,
        content
      });
      // Backend trả về comment mới, avatar có thể null hoặc đường dẫn tương đối
      // Frontend sẽ tự động render qua getMinioUrl ở CommentItem
      setComments(prev => [newComment, ...prev]);
      setContent('');
      toast.success("Bình luận thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Gửi bình luận thất bại");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 bg-white rounded shadow-sm mt-6">
      <h3 className="text-xl font-bold mb-6 border-b pb-2">Bình luận</h3>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
        {/* Avatar User hiện tại đang gõ bình luận */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
           {user?.avatar && (
             // SỬA LỖI ẢNH TẠI ĐÂY
             <Image 
               src={getMinioUrl(user.avatar)} 
               alt="User" 
               fill 
               className="object-cover" 
               unoptimized 
             />
           )}
        </div>
        <div className="flex-grow relative">
           <textarea
             value={content}
             onChange={(e) => setContent(e.target.value)}
             placeholder="Viết bình luận của bạn..."
             className="w-full border rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
           />
           <button 
             type="submit"
             disabled={!content.trim()}
             className="absolute bottom-3 right-3 text-blue-600 disabled:text-gray-400"
             aria-label="Gửi bình luận"
           >
             <FaPaperPlane size={20} />
           </button>
        </div>
      </form>

      <div className="space-y-2">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} comicId={comicId} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <button 
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              loadComments(nextPage);
            }}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition"
          >
            {loading ? "Đang tải..." : "Tải thêm bình luận"}
          </button>
        </div>
      )}
    </div>
  );
}