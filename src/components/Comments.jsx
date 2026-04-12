import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';

const API_BASE_URL = "http://localhost:5000/api";

const toastConfig = {
  position: "top-center",
  autoClose: 2000,
  hideProgressBar: true,
  theme: "light",
  className: "rounded-2xl shadow-xl border border-gray-100 text-sm font-bold text-gray-800 mt-4",
};

function formatCommentTime(createdAt) {
  const commentDate = new Date(createdAt);
  if (Number.isNaN(commentDate.getTime())) return "Vừa xong";
  const diffMs = Date.now() - commentDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return commentDate.toLocaleDateString("vi-VN");
}

async function parseApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  if (!rawText) return {};
  if (contentType.includes("application/json")) return JSON.parse(rawText);
  const trimmedText = rawText.trim();
  if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) return JSON.parse(trimmedText);
  throw new Error("API chưa sẵn sàng hoặc không trả về JSON.");
}

function normalizeComment(comment) {
  return {
    id: comment.CommentID || comment.commentId || comment.id || `${comment.UserID}-${comment.CreatedAt}`,
    recipeId: comment.RecipeID || comment.recipeId,
    userId: comment.UserID || comment.userId,
    authorName: comment.FullName || comment.authorName || comment.UserName || "Người dùng",
    authorUsername: comment.Username || comment.authorUsername || "",
    authorAvatar: comment.Avatar || comment.authorAvatar || "",
    content: comment.Content || comment.content || "",
    createdAt: comment.CreatedAt || comment.createdAt || new Date().toISOString(),
  };
}

export default function Comments({ recipeId, loggedInUser, recipeAuthorId }) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsError, setCommentsError] = useState("");

  const fetchComments = async () => {
    setIsLoadingComments(true);
    setCommentsError("");
    try {
      const response = await fetch(`${API_BASE_URL}/comments/recipe/${recipeId}`);
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Không thể tải bình luận.");
      const normalizedComments = Array.isArray(data) ? data.map(normalizeComment) : [];
      normalizedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setComments(normalizedComments);
    } catch (error) {
      console.error(error);
      setComments([]);
      setCommentsError("Không thể tải bình luận từ server.");
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (!recipeId) return;
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  const totalCommentsLabel = useMemo(() => {
    if (comments.length === 0) return "Chưa có bình luận nào";
    if (comments.length === 1) return "1 bình luận";
    return `${comments.length} bình luận`;
  }, [comments.length]);

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    const trimmedComment = commentText.trim();
    if (!loggedInUser) { toast.info("Hãy đăng nhập để bình luận.", toastConfig); return; }
    if (!trimmedComment) { toast.warning("Vui lòng nhập nội dung.", toastConfig); return; }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ RecipeID: recipeId, UserID: loggedInUser.UserID, Content: trimmedComment }),
      });
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Lỗi gửi cmt.");
      setComments((prev) => [normalizeComment(data), ...prev]);
      setCommentText("");
      toast.success("Đã thêm bình luận.", toastConfig);
    } catch (error) {
      toast.error(error.message, toastConfig);
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteComment = (commentId) => {
    Swal.fire({
      title: 'Xóa bình luận?',
      text: "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Xác nhận xóa',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'rounded-[2rem] shadow-2xl border-none p-8',
        title: 'font-black text-gray-800',
        htmlContainer: 'font-medium text-gray-500',
        confirmButton: 'rounded-2xl px-6 py-3 font-bold',
        cancelButton: 'rounded-2xl px-6 py-3 font-bold'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
          });

          if (response.ok) {
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            toast.success("Đã xóa bình luận!", toastConfig);
          } else {
            const data = await response.json();
            toast.error(`${data.message}`, toastConfig);
          }
        } catch (error) {
          console.error("Lỗi xóa bình luận:", error); // Đã sửa lỗi biến error chưa dùng
          toast.error("Lỗi kết nối!", toastConfig);
        }
      }
    });
  };

  return (
    <section className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 mt-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <p className="text-[16px] font-black tracking-[0.18em] text-orange-500 mb-2">Bình Luận</p>
        </div>
        <p className="text-base font-semibold text-gray-500">{totalCommentsLabel}</p>
      </div>

      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-orange-50/70 via-white to-white p-4 md:p-5 shadow-[0_10px_30px_rgba(249,115,22,0.08)]">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white shrink-0 flex items-center justify-center font-black shadow-md shadow-orange-200">
              {loggedInUser?.Avatar ? <img src={loggedInUser.Avatar} alt="Avt" className="w-full h-full object-cover rounded-2xl" /> : (loggedInUser?.FullName?.charAt(0) || "?")}
            </div>
            <div className="flex-1">
              <textarea
                rows="4" maxLength={300} value={commentText} onChange={(e) => setCommentText(e.target.value)}
                placeholder={loggedInUser ? "Chia sẻ cảm nhận của bạn..." : "Đăng nhập để viết bình luận..."}
                disabled={!loggedInUser || isSubmitting}
                className="w-full resize-none rounded-3xl border border-white bg-white px-5 py-4 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50"
              />
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-gray-400">Bình luận tối đa 300 ký tự.</p>
                {loggedInUser ? (
                  <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 disabled:bg-orange-300">
                    {isSubmitting ? "Đang gửi..." : "Đăng bình luận"}
                  </button>
                ) : (
                  <Link to="/login" className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600">Đăng nhập để bình luận</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {isLoadingComments ? (
          <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div></div>
        ) : commentsError ? (
          // Đã thêm lại phần hiển thị biến commentsError
          <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/70 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-red-500">{commentsError}</p>
            <button onClick={fetchComments} className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-bold text-red-500 border border-red-200 transition hover:bg-red-50">
              Thử tải lại
            </button>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-3xl border border-gray-100 bg-gray-50/80 p-5 transition hover:border-orange-100 hover:bg-orange-50/40">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-sm font-black text-orange-500">
                  {comment.authorAvatar ? <img src={comment.authorAvatar} alt="Avt" className="w-full h-full object-cover" /> : (comment.authorName?.charAt(0) || "U")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-gray-900 truncate">{comment.authorName}</h3>
                      {comment.authorUsername && <p className="text-xs text-gray-400 truncate">@{comment.authorUsername}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-400">{formatCommentTime(comment.createdAt)}</span>
                      {loggedInUser && (loggedInUser.UserID === comment.userId || loggedInUser.UserID === recipeAuthorId) && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="p-10 text-center text-gray-400 text-sm font-semibold">Chưa có bình luận nào.</div>
        )}
      </div>
    </section>
  );
}