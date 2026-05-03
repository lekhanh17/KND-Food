import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Comments from "../components/Comments";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import RecipeCard from "../components/RecipeCard";

// ==========================================
// HÀM CHUYỂN ĐỔI SỐ SANG CHỮ CHO ĐỘ KHÓ
// ==========================================
const getDifficultyLabel = (level) => {
  const labels = {
    1: 'Rất dễ',
    2: 'Dễ',
    3: 'Trung bình',
    4: 'Khó',
    5: 'Rất khó'
  };
  return labels[level] || 'Không xác định';
};

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  
  const [showAllRecs, setShowAllRecs] = useState(false);

  const [currentServings, setCurrentServings] = useState(1);

  const [loggedInUser] = useState(() => {
    const saved = localStorage.getItem("loggedInUser");
    return saved ? JSON.parse(saved) : null;
  });

  const toastConfig = {
    position: "top-center",
    autoClose: 1500,
    hideProgressBar: true,
    theme: "light",
    className:
      "rounded-2xl shadow-xl border border-gray-100 text-sm font-bold text-gray-800 mt-4",
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        if (Array.isArray(data)) {
          data.forEach((cat) => {
            map[cat.CategoryID] = cat.CategoryName;
          });
        }
        setCategories(map);
      })
      .catch((err) => console.error("Lỗi lấy danh mục:", err));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:5000/api/recipes/detail/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setRecipe(null);
        } else {
          setRecipe(data);
          setCurrentServings(data.Servings || 1);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!loggedInUser || !id) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/favorites/check/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setIsSaved(data.isSaved);
        }
      } catch (error) {
        console.error("Lỗi check save:", error);
      }
    };
    checkSavedStatus();
  }, [id, loggedInUser]);

  useEffect(() => {
    if (!id) return;
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      try {
        const res = await fetch(`http://localhost:5000/api/recipes/recommend/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data);
        }
      } catch (error) {
        console.error("Lỗi lấy gợi ý từ AI:", error);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecommendations();
  }, [id]);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
    return url;
  };

  const handleToggleSave = async () => {
    if (!loggedInUser) {
      toast.info("Vui lòng đăng nhập để lưu công thức!", toastConfig);
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ RecipeID: id }),
      });

      if (!res.ok) throw new Error("Lỗi mạng");
      const data = await res.json();
      setIsSaved(data.isSaved);
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!", toastConfig);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    Swal.fire({
      title: "Xóa công thức?",
      text: "Hành động này không thể hoàn tác, bạn chắc chứ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#d33",
      confirmButtonText: "Tôi chắc chắn!",
      cancelButtonText: "Hủy",
      borderRadius: "20px",
      customClass: { popup: "rounded-3xl shadow-2xl border border-gray-100" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `http://localhost:5000/api/recipes/delete/${id}`,
            { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.ok) {
            toast.success("Đã xóa công thức thành công!", toastConfig);
            setTimeout(() => navigate("/"), 1500);
          } else {
            const data = await response.json();
            toast.error("Lỗi: " + data.message, toastConfig);
          }
        } catch (error) {
          console.error(error);
          toast.error("Lỗi kết nối đến máy chủ!", toastConfig);
        }
      }
    });
  };

  const calculateQuantity = (quantity, unit, originalServings) => {
    if (!originalServings || !quantity) return quantity;

    const qualitativeUnits = ["ít", "vừa đủ", "nhúm", "chút", "tùy thích", "tùy khẩu vị"];
    if (unit && qualitativeUnits.includes(unit.toLowerCase().trim())) {
      return quantity; 
    }

    let num = NaN;
    let cleanQuantity = quantity.toString().trim().replace(',', '.');
    
    cleanQuantity = cleanQuantity
      .replace('½', '.5').replace('⅓', '.333').replace('¼', '.25')
      .replace('¾', '.75').replace('⅔', '.666').replace('⅛', '.125')
      .replace(/\s+/g, ''); 

    if (cleanQuantity.includes('/')) {
      const parts = cleanQuantity.split('/');
      if (parts.length === 2) {
        num = Number(parts[0]) / Number(parts[1]);
      }
    } else {
      num = Number(cleanQuantity);
    }

    if (isNaN(num)) return quantity;

    const calculated = (num / originalServings) * currentServings;

    const smartFormatVietnamese = (dec) => {
      if (Number.isInteger(dec)) return dec;

      if (dec < 1) {
        if (dec < 0.2) return "1/8";
        if (dec < 0.3) return "1/4";
        if (dec < 0.45) return "1/3";
        if (dec < 0.6) return "1/2";
        if (dec < 0.75) return "2/3";
        if (dec < 0.9) return "3/4";
        return 1;
      }

      const rounded = Math.round(dec * 2) / 2;
      return rounded;
    };

    return smartFormatVietnamese(calculated);
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
        <p className="text-gray-500 mb-6 font-medium">Món ăn này không tồn tại hoặc đã bị xóa!</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="w-full h-[350px] md:h-[450px] mb-10 flex justify-center items-center">
          {recipe.VideoURL ? (
            recipe.VideoURL.includes("youtube.com") || recipe.VideoURL.includes("youtu.be") ? (
              <div className="w-full h-full rounded-3xl overflow-hidden shadow-lg">
                <iframe src={getEmbedUrl(recipe.VideoURL)} className="w-full h-full" allowFullScreen></iframe>
              </div>
            ) : (
              <video src={recipe.VideoURL} controls className="max-w-full max-h-full object-contain rounded-3xl shadow-lg bg-black"></video>
            )
          ) : (
            <img 
              src={recipe.ImageURL} 
              alt={recipe.Title} 
              className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] bg-white/50" 
            />
          )}
        </div>

        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold tracking-wide uppercase">{categories[recipe.CategoryID] || "Khác"}</span>
                {/* ĐÃ SỬA: Hiển thị chữ cho độ khó thay vì 2/5 */}
                <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-bold tracking-wide">
                Mức độ: {getDifficultyLabel(recipe.Difficulty)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-[#1c2b36] tracking-tight leading-tight mb-4">{recipe.Title}</h1>
              {recipe.Description && <p className="text-gray-500 text-base leading-relaxed">{recipe.Description}</p>}

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <button onClick={handleToggleSave} disabled={isSaving} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${isSaved ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-gray-50 text-gray-500 border border-gray-200 hover:text-red-500 hover:border-red-200"}`}>
                  <FontAwesomeIcon icon={faHeart} className={`text-base transition-transform ${isSaved ? "scale-110" : ""}`} />
                  {isSaved ? "Đã lưu" : "Lưu công thức"}
                </button>

                {loggedInUser && loggedInUser.UserID === recipe.UserID && (
                  <>
                    <Link to={`/edit-recipe/${recipe.RecipeID}`} className="px-5 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.152-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg> Sửa
                    </Link>
                    <button onClick={handleDelete} className="px-5 py-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg> Xóa
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* KHỐI TÁC GIẢ - ĐÃ CHUYỂN THÀNH LINK */}
            <Link 
              to={`/profile/${recipe.UserID}`} 
              className="shrink-0 flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-all cursor-pointer min-w-[160px] group shadow-sm hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center border-2 border-transparent group-hover:border-orange-400 transition-colors">
                {recipe.Avatar ? (
                  <img src={recipe.Avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-gray-500">{recipe.FullName?.charAt(0)}</span>
                )}
              </div>
              <div className="pr-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5 group-hover:text-orange-500 transition-colors">Tác giả</p>
                <p className="font-bold text-sm text-gray-900 group-hover:text-orange-600 transition-colors">{recipe.FullName}</p>
              </div>
            </Link>
          </div>

          <hr className="border-gray-100 mb-8" />

          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Chuẩn bị</p>
              <p className="text-lg font-black text-gray-900">{recipe.PrepTime} <span className="text-base font-bold text-gray-700">Phút</span></p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Thực hiện</p>
              <p className="text-lg font-black text-gray-900">{recipe.CookTime} <span className="text-base font-bold text-gray-700">Phút</span></p>
            </div>
            
            <div className="bg-orange-50/50 rounded-2xl p-3 flex flex-col justify-center items-center text-center border border-orange-100">
              <p className="text-orange-600 font-bold text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1">Khẩu phần (Người)</p>
              <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border border-orange-200/50">
                <button onClick={() => setCurrentServings(prev => Math.max(1, prev - 1))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                </button>
                <span className="text-xl font-black text-gray-900 w-6 text-center">{currentServings}</span>
                <button onClick={() => setCurrentServings(prev => prev + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-black mb-4 flex items-center gap-3 text-[#1c2b36]">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="w-4 h-4"><path d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32L83.9 463.5C90.5 506.3 127.3 536 170.7 536H405.3c43.4 0 80.2-29.7 86.8-72.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32H458.4L365.3 12.9C359.2 1.2 344.7-3.4 332.9 2.7s-16.3 20.6-10.2 32.4L404.3 192H171.7L253.3 35.1zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16s16 7.2 16 16zm96-16c8.8 0 16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16zm128 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16s16 7.2 16 16z" /></svg>
              </span>
              Nguyên liệu cần chuẩn bị
            </h2>
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {recipe.ingredients?.map((ing, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-green-200/50 pb-3 last:border-0 md:even:last:border-0 md:odd:last:border-0 gap-4">
                    <span className="font-bold text-[#1c2b36] text-sm">{ing.IngredientName}</span>
                    <span className="text-green-700 font-black text-sm whitespace-nowrap shrink-0 text-right bg-green-100/50 px-2 py-1 rounded-lg">
                      {calculateQuantity(ing.Quantity, ing.Unit, recipe.Servings)} {ing.Unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-[#1c2b36]">
              <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4"><path d="M32 64C32 28.7 60.7 0 96 0H352c35.3 0 64 28.7 64 64V256h-8.5c-20 0-38.6-11.4-47.5-29.2L348.6 204C333 172.9 301.2 152 266.3 152c-29.4 0-56.9 14.6-73.4 39.4L171 224H160c-17.7 0-32 14.3-32 32s14.3 32 32 32h21c17 0 32.5-9.2 40.5-24l21.9-40.4c4.6-8.5 13.1-13.6 22.8-13.6c11.6 0 22.2 6.9 27.4 17.4l11.4 22.8c15.1 30.1 46 49.8 79.6 49.8H416v96H32V64zm0 352a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zm320 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" /></svg>
              </span>
              Hướng dẫn thực hiện
            </h2>
            <div className="space-y-8">
              {recipe.steps?.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-[#d97706] font-black text-sm flex items-center justify-center">{step.StepNumber}</div>
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-3xl p-6">
                    <p className="text-sm text-[#1c2b36] leading-relaxed whitespace-pre-wrap mb-4">
                      <span className="font-bold block mb-1">Bước {step.StepNumber}</span>
                      {step.Instruction}
                    </p>
                    {step.ImageURL && (
                      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 flex justify-center">
                        <img src={step.ImageURL} alt={`Bước ${step.StepNumber}`} className="w-full object-contain max-h-[300px]" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ĐÃ SỬA: Biến khu vực AI Gợi ý thành một "Khối ma thuật" nổi bật */}
        {!loading && recipe && (
          <div className="mt-16 mb-10 relative overflow-hidden bg-gradient-to-br from-[#f8f5ff] via-white to-[#fff0f5] rounded-[2.5rem] p-6 md:p-10 border border-purple-100 shadow-[0_8px_30px_rgb(168,85,247,0.06)] group">
            
            {/* Hiệu ứng ánh sáng mờ (Glow) tàng hình phía sau */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[60px] opacity-70 group-hover:animate-pulse transition-all duration-700"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-[60px] opacity-70 group-hover:animate-pulse transition-all duration-700" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black mb-8 flex items-center gap-2 sm:gap-3 text-[#1c2b36]">
                Có thể bạn sẽ thích!
                
                {/* Badge AI Gợi ý phiên bản Pro */}
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-xl ml-1 sm:ml-2 shadow-lg shadow-purple-200/50">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin-slow">
                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">AI Gợi ý</span>
                </div>
              </h2>

              {loadingRecs ? (
                <div className="flex justify-center py-10">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : recommendations.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(showAllRecs ? recommendations : recommendations.slice(0, 3)).map((item) => {
                      const formattedItem = {
                        id: item.RecipeID,
                        title: item.Title,
                        category: categories[item.CategoryID] || "Khác",
                        time: `${(item.PrepTime || 0) + (item.CookTime || 0)}p`,
                        difficulty: item.Difficulty || 1,
                        rating: item.AverageRating || 0,
                        reviews: item.ReviewCount || 0,
                        image: item.ImageURL
                      };
                      return (
                        <div key={formattedItem.id} className="hover:-translate-y-2 transition-transform duration-300">
                          <RecipeCard item={formattedItem} />
                        </div>
                      );
                    })}
                  </div>
                  
                  {recommendations.length > 3 && (
                    <div className="mt-10 flex justify-center relative z-20">
                      <button 
                        onClick={() => setShowAllRecs(!showAllRecs)}
                        className="text-purple-600 font-bold hover:text-white transition-all text-sm bg-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 px-8 py-3.5 rounded-full border border-purple-200 hover:border-transparent shadow-sm hover:shadow-lg hover:shadow-purple-200 active:scale-95"
                      >
                        {showAllRecs ? "Rút gọn gợi ý" : "Khám phá thêm"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic text-center bg-white/60 backdrop-blur-sm border border-gray-100 py-10 rounded-3xl font-medium">
                  Hệ thống AI đang học hỏi thêm dữ liệu, hãy quay lại sau nhé! 🤖
                </p>
              )}
            </div>
          </div>
        )}

        {/* NƠI RÁP COMPONENT COMMENTS VÀO */}
        {!loading && recipe && <Comments recipeId={id} loggedInUser={loggedInUser} recipeAuthorId={recipe.UserID} />}
      </div>
    </div>
  );
}