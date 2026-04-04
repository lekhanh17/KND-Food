import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); // Dùng để chuyển trang sau khi xóa
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Lấy thông tin user đang đăng nhập (Để kiểm tra quyền Sửa/Xóa)
  const [loggedInUser] = useState(() => {
    const saved = localStorage.getItem("loggedInUser");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // Gọi API lấy chi tiết món ăn
    fetch(`http://localhost:5000/api/recipes/detail/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setRecipe(null); // Có lỗi hoặc không tìm thấy
        } else {
          setRecipe(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Hàm hỗ trợ chuyển đổi link YouTube thường thành link Embed để phát được trên web
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch"))
      return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/"))
      return url.replace("youtu.be/", "youtube.com/embed/");
    return url; // Trả về nguyên gốc nếu là file tải lên (mp4)
  };

  // 2. Hàm Xử lý Xóa món ăn
  const handleDelete = async () => {
    // Hỏi lại cho chắc chắn
    if (window.confirm("⚠️ Bạn có chắc chắn muốn xóa công thức này không? Hành động này không thể khôi phục!")) {
      try {
        const response = await fetch(`http://localhost:5000/api/recipes/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert("Xóa công thức thành công!");
          navigate('/profile'); // Đá về trang cá nhân sau khi xóa xong
        } else {
          const data = await response.json();
          alert("Lỗi: " + data.message);
        }
      } catch (error) {
        console.error(error);
        alert("Lỗi kết nối đến máy chủ!");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-gray-500">Đang chuẩn bị món ăn...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
        <h1 className="text-4xl font-black text-gray-800 mb-4">404</h1>
        <p className="text-gray-500 mb-6 font-medium">
          Món ăn này không tồn tại hoặc đã bị xóa!
        </p>
        <Link
          to="/profile"
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition"
        >
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* NÚT QUAY LẠI */}
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 font-bold mb-6 transition-colors text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
          </svg>
          Quay lại
        </Link>

        {/* MEDIA (VIDEO HOẶC ẢNH BÌA) */}
        <div className="w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden bg-gray-200 shadow-sm mb-6 relative">
          {recipe.VideoURL ? (
            recipe.VideoURL.includes("youtube.com") ||
            recipe.VideoURL.includes("youtu.be") ? (
              <iframe src={getEmbedUrl(recipe.VideoURL)} className="w-full h-full" allowFullScreen></iframe>
            ) : (
              <video src={recipe.VideoURL} controls className="w-full h-full object-contain bg-black"></video>
            )
          ) : (
            <img src={recipe.ImageURL} alt={recipe.Title} className="w-full h-full object-cover" />
          )}
        </div>

        {/* KHỐI NỘI DUNG CHÍNH (NỀN TRẮNG) */}
        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100">
          
          {/* HEADER MÓN ĂN */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold tracking-wide">
                  Danh mục {recipe.CategoryID}
                </span>
                <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-bold tracking-wide">
                  ★ Độ khó: {recipe.Difficulty}/5
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-[#1c2b36] tracking-tight leading-tight mb-4">
                {recipe.Title}
              </h1>
              {recipe.Description && (
                <p className="text-gray-500 text-base leading-relaxed">
                  {recipe.Description}
                </p>
              )}

              {/* 3. HIỆN NÚT SỬA & XÓA NẾU LÀ TÁC GIẢ */}
              {loggedInUser && loggedInUser.UserID === recipe.UserID && (
                <div className="flex flex-wrap gap-3 mt-6">
                  {/* Dẫn sang trang EditRecipe */}
                  <Link
                    to={`/edit-recipe/${recipe.RecipeID}`}
                    className="px-5 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.152-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                    </svg>
                    Sửa công thức
                  </Link>
                  
                  {/* Nút Xóa gọi hàm handleDelete */}
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                    Xóa
                  </button>
                </div>
              )}
            </div>

            {/* THÔNG TIN TÁC GIẢ */}
            <div className="shrink-0 flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 min-w-[160px]">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                {recipe.Avatar ? (
                  <img src={recipe.Avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-gray-500">
                    {recipe.FullName?.charAt(0)}
                  </span>
                )}
              </div>
              <div className="pr-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                  Tác giả
                </p>
                <p className="font-bold text-sm text-gray-900">{recipe.FullName}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 mb-8" />

          {/* THANH THÔNG SỐ */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Chuẩn bị</p>
              <p className="text-lg font-black text-gray-900">
                {recipe.PrepTime} <span className="text-base font-bold text-gray-700">Phút</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Thực hiện</p>
              <p className="text-lg font-black text-gray-900">
                {recipe.CookTime} <span className="text-base font-bold text-gray-700">Phút</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Khẩu phần</p>
              <p className="text-lg font-black text-gray-900">
                {recipe.Servings} <span className="text-base font-bold text-gray-700">Người</span>
              </p>
            </div>
          </div>

          {/* NGUYÊN LIỆU */}
          <div className="mb-12">
            <h2 className="text-xl font-black mb-4 flex items-center gap-3 text-[#1c2b36]">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="w-4 h-4">
                  <path d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32L83.9 463.5C90.5 506.3 127.3 536 170.7 536H405.3c43.4 0 80.2-29.7 86.8-72.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32H458.4L365.3 12.9C359.2 1.2 344.7-3.4 332.9 2.7s-16.3 20.6-10.2 32.4L404.3 192H171.7L253.3 35.1zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16s16 7.2 16 16zm96-16c8.8 0 16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16zm128 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16s16 7.2 16 16z"/>
                </svg>
              </span>
              Nguyên liệu cần chuẩn bị
            </h2>
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {recipe.ingredients?.map((ing, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-green-200/50 pb-3 last:border-0 md:even:last:border-0 md:odd:last:border-0 gap-4">
                    <span className="font-bold text-[#1c2b36] text-sm">
                      {ing.IngredientName}
                    </span>
                    <span className="text-green-700 font-black text-sm whitespace-nowrap shrink-0 text-right">
                      {ing.Quantity} {ing.Unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CÁC BƯỚC THỰC HIỆN */}
          <div>
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-[#1c2b36]">
              <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4">
                  <path d="M32 64C32 28.7 60.7 0 96 0H352c35.3 0 64 28.7 64 64V256h-8.5c-20 0-38.6-11.4-47.5-29.2L348.6 204C333 172.9 301.2 152 266.3 152c-29.4 0-56.9 14.6-73.4 39.4L171 224H160c-17.7 0-32 14.3-32 32s14.3 32 32 32h21c17 0 32.5-9.2 40.5-24l21.9-40.4c4.6-8.5 13.1-13.6 22.8-13.6c11.6 0 22.2 6.9 27.4 17.4l11.4 22.8c15.1 30.1 46 49.8 79.6 49.8H416v96H32V64zm0 352a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zm320 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/>
                </svg>
              </span>
              Hướng dẫn thực hiện
            </h2>
            <div className="space-y-8">
              {recipe.steps?.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-[#d97706] font-black text-sm flex items-center justify-center">
                      {step.StepNumber}
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-3xl p-6">
                    <p className="text-sm text-[#1c2b36] leading-relaxed whitespace-pre-wrap mb-4">
                      <span className="font-bold block mb-1">Bước {step.StepNumber}</span>
                      {step.Instruction}
                    </p>
                    {step.ImageURL && (
                      <div className="rounded-2xl overflow-hidden border border-gray-200">
                        <img src={step.ImageURL} alt={`Bước ${step.StepNumber}`} className="w-full object-cover max-h-[300px]" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}