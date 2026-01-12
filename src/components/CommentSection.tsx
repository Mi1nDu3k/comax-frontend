'use client';
import { useEffect, useState } from 'react';
import { commentService } from '@/services/comment.service';
import { Comment } from '@/types/comment';
import { useAuth } from '@/context/auth.context'; 
import Image from 'next/image';
import { FaPaperPlane, FaReply, FaChevronUp } from 'react-icons/fa'; // Import thêm FaChevronUp
import { toast } from 'react-toastify'; 
import { getMinioUrl } from '@/utils/image-helper';

// --- COMPONENT CON: ITEM ---
const CommentItem = ({ comment, comicId }: { comment: Comment; comicId: number }) => {
  const { user } = useAuth();

  // Fix Case Sensitive
  const initialReplies = comment.replies || (comment as any).Replies || [];

  const [replies, setReplies] = useState<Comment[]>(initialReplies);
  const [replyPage, setReplyPage] = useState(initialReplies.length > 0 ? 2 : 1);
  const [totalReplyCount, setTotalReplyCount] = useState(comment.replyCount);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  // 1. Logic tải thêm reply
  const handleLoadReplies = async () => {
    try {
      setIsLoadingReplies(true);
      const newReplies = await commentService.getReplies(comment.id, replyPage);
      
      if (newReplies.length > 0) {
        setReplies((prev) => {
            const existingIds = new Set(prev.map(r => r.id));
            const uniqueNew = newReplies.filter(r => !existingIds.has(r.id));
            return [...prev, ...uniqueNew];
        });
        setReplyPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải câu trả lời");
    } finally {
      setIsLoadingReplies(false);
    }
  };

  // 2. Logic Thu gọn (MỚI)
  const handleCollapse = () => {
    // Reset về trạng thái ban đầu (chỉ hiện những cái backend gửi kèm comment cha)
    setReplies(initialReplies);
    setReplyPage(initialReplies.length > 0 ? 2 : 1);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Bạn cần đăng nhập!");
    if (!replyContent.trim()) return;

    try {
      const apiResult = await commentService.create({
        comicId,
        content: replyContent,
        parentId: comment.id,
        userId: user.id
      });
      
      const newReply: Comment = {
          ...apiResult,
          userName: user.username || "Tôi", 
          userAvatar: user.avatar || "", 
          replies: []
      };
      
      setReplies((prev) => [...prev, newReply]);
      setTotalReplyCount((prev) => prev + 1);
      setReplyContent('');
      setIsReplying(false);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi gửi bình luận");
    }
  };

  return (
    <div className="mb-6 flex gap-3 animate-fade-in">
      <div className="flex-shrink-0">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
           <Image 
             src={getMinioUrl(comment.userAvatar)} 
             alt={comment.userName || 'User'} 
             fill 
             className="object-cover" 
             unoptimized
           />
        </div>
      </div>

      <div className="flex-grow min-w-0">
        <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none inline-block pr-6">
          <p className="font-bold text-sm text-gray-900">{comment.userName}</p>
          <p className="text-gray-800 text-sm mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
        </div>
        
        <div className="flex gap-4 mt-1 text-xs text-gray-500 ml-1 font-semibold">
          <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}</span>
          <button onClick={() => setIsReplying(!isReplying)} className="hover:text-blue-600 transition-colors">Trả lời</button>
        </div>

        {isReplying && (
          <form onSubmit={handleSubmitReply} className="mt-3 flex gap-2 animate-fade-in-down">
            <input 
              type="text" 
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Trả lời ${comment.userName}...`}
              className="flex-grow border rounded-full px-4 py-2 text-sm focus:outline-blue-500 bg-gray-50"
              autoFocus
            />
            <button 
                type="submit" 
                className="text-white bg-blue-600 px-3 rounded-full hover:bg-blue-700 transition"
                disabled={!replyContent.trim()}
                aria-label="Gửi trả lời"
                title="Gửi trả lời"
            >
                <FaPaperPlane className="text-xs" />
            </button>
          </form>
        )}

        {/* List Replies */}
        {replies.length > 0 && (
            <div className="mt-2 ml-2 border-l-2 border-gray-200 pl-3 space-y-3">
            {replies.map((rep) => (
                <div key={rep.id} className="flex gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1 bg-gray-100 border">
                        <Image 
                            src={getMinioUrl(rep.userAvatar)} 
                            alt={rep.userName || 'User'} 
                            fill 
                            className="object-cover" 
                            unoptimized 
                        />
                    </div>
                    <div>
                        <div className="bg-gray-50 p-2 rounded-xl">
                            <span className="font-bold text-xs text-gray-900 mr-2 block">{rep.userName}</span>
                            <span className="text-gray-800 text-sm break-words">{rep.content}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 ml-1">
                            {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}

        {/* 3. KHU VỰC NÚT ĐIỀU KHIỂN REPLY */}
        <div className="flex items-center gap-4 mt-2 ml-6">
            {/* Nút Xem thêm */}
            {totalReplyCount > replies.length && (
              <button 
                onClick={handleLoadReplies}
                disabled={isLoadingReplies}
                className="text-xs text-gray-500 font-bold hover:text-blue-600 flex items-center gap-2 transition-colors"
              >
                <FaReply className="transform rotate-180" />
                {isLoadingReplies 
                    ? "Đang tải..." 
                    : `Xem thêm ${totalReplyCount - replies.length} câu trả lời`
                }
              </button>
            )}

            {/* Nút Thu gọn (MỚI) - Chỉ hiện khi số lượng reply đang hiển thị > số lượng ban đầu */}
            {replies.length > initialReplies.length && (
               <button 
                 onClick={handleCollapse}
                 className="text-xs text-gray-400 font-bold hover:text-red-500 flex items-center gap-1 transition-colors"
               >
                 <FaChevronUp /> Thu gọn
               </button>
            )}
        </div>

      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH (Giữ nguyên như cũ) ---
export default function CommentSection({ comicId }: { comicId: number }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [content, setContent] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!comicId || isNaN(comicId) || comicId <= 0) {
        console.log("Waiting for valid Comic ID...");
        return;
    }

    const fetchInitialComments = async () => {
      try {
        setLoading(true);
        const data = await commentService.getParents(comicId, 1);
        setComments(data);
        if (data.length < 10) setHasMore(false);
      } catch (error) {
        console.error(" Error loading comments:", error);
      } finally {
        setLoading(false);
      }
    };

    setComments([]);
    setPage(1);
    setHasMore(true);
    fetchInitialComments();

  }, [comicId]);

  const handleLoadMore = async () => {
    if (loading) return;
    const nextPage = page + 1;
    try {
        setLoading(true);
        const data = await commentService.getParents(comicId, nextPage);
        if (data.length < 10) setHasMore(false);
        setComments(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const uniqueData = data.filter(c => !existingIds.has(c.id));
            return [...prev, ...uniqueData];
        });
        setPage(nextPage);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Vui lòng đăng nhập để bình luận");
    if (!content.trim()) return;

    try {
      const apiResult = await commentService.create({
        comicId,
        content,
        userId: user.id
      });
      const newComment: Comment = {
        ...apiResult,
        userName: user.username || "Tôi", 
        userAvatar: user.avatar || "",    
        replies: [],
        replyCount: 0
      };
      setComments(prev => [newComment, ...prev]);
      setContent('');
      toast.success("Bình luận thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Gửi bình luận thất bại");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 bg-white rounded-xl shadow-sm mt-6 border border-gray-100">
      <h3 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">Bình luận <span className="text-gray-400 text-sm font-normal">({comments.length})</span></h3>
      
      <div className="mb-10 flex gap-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border">
           {user?.avatar ? (
             <Image src={getMinioUrl(user.avatar)} alt="User" fill className="object-cover" unoptimized />
           ) : (
             <Image src="/default-user.png" alt="Guest" fill className="object-cover" unoptimized />
           )}
        </div>
        <form onSubmit={handleSubmit} className="flex-grow relative group">
           <textarea
             value={content}
             onChange={(e) => setContent(e.target.value)}
             placeholder="Viết bình luận của bạn..."
             className="w-full border border-gray-300 rounded-2xl p-4 pr-14 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none h-24 transition-all"
           />
           <button type="submit" disabled={!content.trim()} className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md" aria-label="Gửi bình luận">
             <FaPaperPlane size={14} />
           </button>
        </form>
      </div>

      <div className="space-y-2">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} comicId={comicId} />
        ))}
        {comments.length === 0 && !loading && (
            <p className="text-center text-gray-400 py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        )}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button onClick={handleLoadMore} disabled={loading} className="px-6 py-2 bg-gray-50 text-gray-600 rounded-full text-sm font-bold hover:bg-gray-100 hover:text-blue-600 transition border border-gray-200">
            {loading ? "Đang tải..." : "Tải thêm bình luận"}
          </button>
        </div>
      )}
    </div>
  );
}