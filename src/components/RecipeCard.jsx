import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export default function RecipeCard({ item }) {
  // Hàm đổi số (1-5) thành chữ + Màu sắc tương ứng
  const getDifficultyUI = (level) => {
    switch (Number(level)) {
      case 1: return { label: "Rất dễ", color: "text-green-700 bg-green-50 border-green-200" };
      case 2: return { label: "Dễ", color: "text-teal-700 bg-teal-50 border-teal-200" };
      case 3: return { label: "Trung bình", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
      case 4: return { label: "Khó", color: "text-orange-700 bg-orange-50 border-orange-200" };
      case 5: return { label: "Rất khó", color: "text-red-700 bg-red-50 border-red-200" };
      default: return { label: "Cơ bản", color: "text-gray-700 bg-gray-50 border-gray-200" };
    }
  };

  const difficultyUI = getDifficultyUI(item.difficulty || item.Difficulty);
  const reviewCount = item.ReviewCount !== undefined ? item.ReviewCount : (item.reviews ? item.reviews : 0);
  const averageRating = item.AverageRating !== undefined ? item.AverageRating : (item.rating ? item.rating : 0);

  return (
    <Link 
      to={`/recipe/${item.id || item.RecipeID}`}
      className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500 flex flex-col block cursor-pointer outline-none"
    >
      
      {/* KHU VỰC ẢNH */}
      <div className="relative h-56 overflow-hidden shrink-0">
        <img 
          src={item.image || item.ImageURL} 
          alt={item.title || item.Title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black text-orange-600 uppercase tracking-wider shadow-sm">
          {item.category || item.CategoryName || "Món ăn"}
        </div>
      </div>

      {/* KHU VỰC NỘI DUNG */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug">
            {item.title || item.Title}
          </h3>
        </div>
        
        <div>
          {/* Hàng 1: Thời gian & Nhãn Độ khó */}
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item.time || item.CookTime}
            </span>
            
            {/* BADGE ĐỘ KHÓ ĐỔI MÀU */}
            <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${difficultyUI.color}`}>
              {difficultyUI.label}
            </span>
          </div>

          <hr className="border-gray-100 mb-3" />

          {/* Hàng 2: Sao Đánh giá (Review) thực sự */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {reviewCount > 0 ? (
                <>
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
                  <span className="font-black text-gray-800 text-sm">
                    {Number(averageRating).toFixed(1)}
                  </span>
                  <span className="text-gray-400 text-xs font-medium ml-1">
                    ({reviewCount})
                  </span>
                </>
              ) : (
                <span className="text-xs font-semibold text-gray-400 italic">
                  Chưa có đánh giá
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}