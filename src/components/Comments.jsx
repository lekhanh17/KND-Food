import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faStar,
  faCamera,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const toastConfig = {
  position: "top-center",
  autoClose: 2000,
  hideProgressBar: true,
  theme: "light",
  className:
    "rounded-2xl shadow-xl border border-gray-100 text-sm font-bold text-gray-800 mt-4",
};

// 🛡️ KHIÊN BẢO VỆ ẢNH ĐƯỢC ĐƯA VÀO ĐÂY
const getImageUrl = (url) => {
  if (!url) return "/default-avatar.png"; // Ảnh mặc định

  if (url.startsWith("http")) {
    return url.replace("http://localhost:5000", import.meta.env.VITE_API_URL);
  }

  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${import.meta.env.VITE_API_URL}${cleanUrl}`;
};

function formatCommentTime(createdAt) {
  let dateString = createdAt;
  if (typeof dateString === "string" && dateString.endsWith("Z")) {
    dateString = dateString.slice(0, -1);
  }

  const commentDate = new Date(dateString);
  if (Number.isNaN(commentDate.getTime())) return "Vừa xong";

  const diffMs = Date.now() - commentDate.getTime();

  if (diffMs < 0) return "Vừa xong";

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
  if (trimmedText.startsWith("{") || trimmedText.startsWith("["))
    return JSON.parse(trimmedText);
  throw new Error("API chưa sẵn sàng hoặc không trả về JSON.");
}

function normalizeComment(comment) {
  let imagesArray = [];
  const rawImageURL = comment.ImageURL || comment.image || null;
  if (rawImageURL) {
    imagesArray = rawImageURL.split(",").filter((img) => img.trim() !== "");
  }

  return {
    id:
      comment.CommentID ||
      comment.commentId ||
      comment.id ||
      `${comment.UserID}-${comment.CreatedAt}`,
    recipeId: comment.RecipeID || comment.recipeId,
    userId: comment.UserID || comment.userId,
    authorName:
      comment.FullName ||
      comment.authorName ||
      comment.UserName ||
      "Người dùng",
    authorUsername: comment.Username || comment.authorUsername || "",
    authorAvatar: comment.Avatar || comment.authorAvatar || "",
    content: comment.Content || comment.content || "",
    rating: comment.Rating || comment.rating || 5,
    images: imagesArray,
    createdAt:
      comment.CreatedAt || comment.createdAt || new Date().toISOString(),
  };
}

export default function Comments({ recipeId, loggedInUser, recipeAuthorId }) {
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const [viewingImage, setViewingImage] = useState(null);

  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsError, setCommentsError] = useState("");

  const fetchComments = async () => {
    setIsLoadingComments(true);
    setCommentsError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/comments/recipe/${recipeId}`,
      );
      const data = await parseApiResponse(response);
      if (!response.ok)
        throw new Error(data.message || "Không thể tải bình luận.");
      const normalizedComments = Array.isArray(data)
        ? data.map(normalizeComment)
        : [];
      normalizedComments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
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
    if (comments.length === 0) return "Chưa có đánh giá nào";
    return `${comments.length} đánh giá`;
  }, [comments.length]);

  const hasReviewed = useMemo(() => {
    if (!loggedInUser) return false;
    return comments.some((cmt) => cmt.userId === loggedInUser.UserID);
  }, [comments, loggedInUser]);

  const getRatingText = (star) => {
    switch (star) {
      case 5:
        return "Tuyệt vời";
      case 4:
        return "Rất tốt";
      case 3:
        return "Bình thường";
      case 2:
        return "Kém";
      case 1:
        return "Tệ";
      default:
        return "Vui lòng chọn sao";
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + selectedImages.length > 3) {
      toast.warning("Chỉ được chọn tối đa 3 ảnh!", toastConfig);
      return;
    }

    const newSelectedImages = [...selectedImages, ...files].slice(0, 3);
    setSelectedImages(newSelectedImages);

    const newPreviews = newSelectedImages.map((file) =>
      URL.createObjectURL(file),
    );
    setImagePreviews(newPreviews);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove) => {
    const newImages = selectedImages.filter(
      (_, index) => index !== indexToRemove,
    );
    const newPreviews = imagePreviews.filter(
      (_, index) => index !== indexToRemove,
    );
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    const trimmedComment = commentText.trim();
    if (!loggedInUser) {
      toast.info("Hãy đăng nhập để đánh giá.", toastConfig);
      return;
    }

    if (rating === 0) {
      toast.warning("Vui lòng chọn số sao đánh giá!", toastConfig);
      return;
    }
    if (!trimmedComment) {
      toast.warning("Vui lòng nhập nội dung đánh giá.", toastConfig);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("RecipeID", recipeId);
      formData.append("Content", trimmedComment);
      formData.append("Rating", rating);

      selectedImages.forEach((file) => {
        formData.append("Images", file);
      });

      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Lỗi gửi đánh giá.");

      setComments((prev) => [normalizeComment(data), ...prev]);
      setCommentText("");
      setRating(0);

      setSelectedImages([]);
      setImagePreviews([]);

      toast.success("Đã gửi đánh giá thành công.", toastConfig);
    } catch (error) {
      toast.error(error.message, toastConfig);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    Swal.fire({
      title: "Xóa?",
      text: "Bạn có chắc chắn muốn xóa đánh giá? Không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Xác nhận xóa",
      cancelButtonText: "Hủy",
      customClass: {
        popup: "rounded-[2rem] shadow-2xl border-none p-8",
        title: "font-black text-gray-800",
        htmlContainer: "font-medium text-gray-500",
        confirmButton: "rounded-2xl px-6 py-3 font-bold",
        cancelButton: "rounded-2xl px-6 py-3 font-bold",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${API_BASE_URL}/comments/${commentId}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (response.ok) {
            setComments((prev) => prev.filter((c) => c.id !== commentId));
          } else {
            const data = await response.json();
            toast.error(`❌ ${data.message}`, toastConfig);
          }
        } catch (error) {
          console.error("Lỗi xóa bình luận:", error);
          toast.error("Lỗi kết nối!", toastConfig);
        }
      }
    });
  };

  return (
    <section className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 mt-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <p className="text-base font-black tracking-[0.18em] text-orange-500 mb-2 uppercase">
            Đánh Giá
          </p>
        </div>
        <p className="text-sm font-semibold text-gray-500">
          {totalCommentsLabel}
        </p>
      </div>

      {!isLoadingComments && hasReviewed ? (
        <div className="mb-8 rounded-[28px] border border-orange-100 bg-orange-50/50 p-8 text-center shadow-sm">
          <p className="text-orange-500 font-black text-lg">
            Bạn đã đánh giá công thức này!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-orange-50/70 via-white to-white p-5 shadow-[0_10px_30px_rgba(249,115,22,0.08)]">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-orange-100/50">
              <span className="text-sm font-bold text-gray-700">
                Chất lượng công thức:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`text-2xl transition-colors duration-200 ${star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"} hover:scale-110 active:scale-95`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={!loggedInUser || isSubmitting}
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span className="text-sm font-bold text-yellow-500 ml-2 animate-in fade-in zoom-in duration-300">
                  {getRatingText(rating)}
                </span>
              )}
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white shrink-0 flex items-center justify-center font-black shadow-md shadow-orange-200">
                {loggedInUser?.Avatar ? (
                  <img
                    /* SỬA ẢNH AVATAR USER ĐĂNG BÌNH LUẬN */
                    src={getImageUrl(loggedInUser.Avatar)}
                    alt="Avt"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  loggedInUser?.FullName?.charAt(0) || "?"
                )}
              </div>
              <div className="flex-1">
                <textarea
                  rows="3"
                  maxLength={300}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    loggedInUser
                      ? "Chia sẻ cảm nhận của bạn về món ăn này..."
                      : "Đăng nhập để viết đánh giá..."
                  }
                  disabled={!loggedInUser || isSubmitting}
                  className="w-full resize-none rounded-3xl border border-white bg-white px-5 py-4 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50"
                />

                {imagePreviews.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative inline-block">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="h-24 w-24 object-cover rounded-2xl border border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-md"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      disabled={
                        !loggedInUser ||
                        isSubmitting ||
                        selectedImages.length >= 3
                      }
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={
                        !loggedInUser ||
                        isSubmitting ||
                        selectedImages.length >= 3
                      }
                      className="text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Đính kèm ảnh thành quả"
                    >
                      <FontAwesomeIcon icon={faCamera} className="text-xl" />
                    </button>
                    {/* BỘ ĐẾM KÝ TỰ REAL-TIME */}
                    <p className="text-xs text-gray-400 font-medium">
                      {selectedImages.length}/3 ảnh đính kèm{" "}
                      <span className="mx-1">•</span>
                      <span
                        className={`transition-colors duration-300 ${commentText.length >= 300 ? "text-red-500 font-bold" : ""}`}
                      >
                        {commentText.length}/300 ký tự
                      </span>
                    </p>
                  </div>

                  {loggedInUser ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 disabled:bg-orange-300 disabled:scale-100 transition-all"
                    >
                      {isSubmitting ? "Đang gửi..." : "Đăng đánh giá"}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
                    >
                      Đăng nhập để đánh giá
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {isLoadingComments ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          </div>
        ) : commentsError ? (
          <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/70 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-red-500">
              {commentsError}
            </p>
            <button
              onClick={fetchComments}
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-bold text-red-500 border border-red-200 transition hover:bg-red-50"
            >
              Thử tải lại
            </button>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-3xl border border-gray-100 bg-gray-50/80 p-5 transition hover:border-orange-100 hover:bg-orange-50/40"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-sm font-black text-orange-500">
                  {comment.authorAvatar ? (
                    <img
                      /* SỬA ẢNH AVATAR NGƯỜI BÌNH LUẬN KHÁC */
                      src={getImageUrl(comment.authorAvatar)}
                      alt="Avt"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    comment.authorName?.charAt(0) || "U"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-gray-900 truncate">
                        {comment.authorName}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesomeIcon
                            key={star}
                            icon={faStar}
                            className={`text-[10px] ${star <= comment.rating ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-400">
                        {formatCommentTime(comment.createdAt)}
                      </span>
                      {loggedInUser &&
                        (loggedInUser.UserID === comment.userId ||
                          loggedInUser.UserID === recipeAuthorId) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-xs"
                            />
                          </button>
                        )}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap break-all mt-2">
                    {comment.content}
                  </p>

                  {comment.images && comment.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {comment.images.map((imgUrl, idx) => {
                        /* SỬA ẢNH ĐÍNH KÈM BÌNH LUẬN Ở ĐÂY SẾP NHÉ */
                        const imgFullUrl = getImageUrl(imgUrl.replace(/\\/g, "/"));
                        return (
                          <img
                            key={idx}
                            src={imgFullUrl}
                            alt={`Thành quả ${idx + 1}`}
                            className="w-28 h-28 object-cover rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setViewingImage(imgFullUrl)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="p-10 text-center text-gray-400 text-sm font-semibold">
            Chưa có đánh giá nào.
          </div>
        )}
      </div>

      {viewingImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white text-2xl hover:bg-red-500 transition-colors"
            onClick={() => setViewingImage(null)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <img
            src={viewingImage}
            alt="Phóng to"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}