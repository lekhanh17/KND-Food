import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  // Dữ liệu mặc định (Fallback) phòng trường hợp Database chưa có món nào hoặc đang tải
  const defaultBanners = [
    {
      id: "default",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
      subtitle: "HỆ THỐNG CHIA SẺ CÔNG THỨC NẤU ĂN",
      title: "Khám phá vị ngon mỗi ngày",
      desc: "Tìm kiếm hướng dẫn chế biến chi tiết từng bước, giúp bạn tự tin vào bếp mỗi ngày.",
      link: "/recipes",
    },
  ];

  const [banners, setBanners] = useState(defaultBanners);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Gọi API lấy Món ăn nổi bật từ Database
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const [recipesRes, categoriesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/recipes`),
          fetch(`${import.meta.env.VITE_API_URL}/api/categories`),
        ]);

        if (!recipesRes.ok) return;

        const recipesData = await recipesRes.json();
        const categoriesData = await categoriesRes.json();

        // Tạo từ điển danh mục
        const categoryMap = {};
        if (Array.isArray(categoriesData)) {
          categoriesData.forEach((cat) => {
            categoryMap[cat.CategoryID] = cat.CategoryName;
          });
        }

        // LỌC MÓN NỔI BẬT: Dựa vào Rating và Số lượt Đánh giá
        if (recipesData && recipesData.length > 0) {
          // Clone mảng ra để sort không làm hỏng mảng gốc
          const sortedRecipes = [...recipesData].sort((a, b) => {
            // Ưu tiên 1: Đánh giá cao xếp trước (5 sao > 4 sao)
            if (b.AverageRating !== a.AverageRating) {
              return b.AverageRating - a.AverageRating;
            }
            // Ưu tiên 2: Nếu bằng sao, món nào nhiều người bình luận hơn thì xếp trước
            return b.ReviewCount - a.ReviewCount;
          });

          // Cắt lấy 5 món đứng đầu bảng xếp hạng
          const topRecipes = sortedRecipes.slice(0, 5).map((recipe) => ({
            id: recipe.RecipeID,
            image:
              recipe.ImageURL ||
              "https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=2070&auto=format&fit=crop",
            subtitle: categoryMap[recipe.CategoryID]
              ? `NỔI BẬT: ${categoryMap[recipe.CategoryID]}`.toUpperCase()
              : "MÓN NGON NỔI BẬT",
            title: recipe.Title,
            desc:
              recipe.Description ||
              `Cùng khám phá cách làm món ${recipe.Title} cực kỳ thơm ngon và hấp dẫn ngay tại nhà!`,
            link: `/recipe/${recipe.RecipeID}`,
          }));

          setBanners(topRecipes);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu cho Banner:", error);
      }
    };

    fetchHeroData();
  }, []);

  // Tự động chuyển slide sau mỗi 5 giây
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1,
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      <div className="relative w-full h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl group bg-gray-900">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>

            <div className="relative h-full flex flex-col justify-center px-10 md:px-20 w-full md:w-2/3 lg:w-1/2">
              <div
                className={`transform transition-all duration-1000 delay-300 ${index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              >
                <span className="inline-block py-1.5 px-4 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs tracking-widest uppercase mb-4 backdrop-blur-sm border border-orange-500/30">
                  {banner.subtitle}
                </span>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5 drop-shadow-lg line-clamp-2">
                  {banner.title}
                </h2>

                <p className="text-gray-200 text-base md:text-lg mb-8 leading-relaxed drop-shadow-md line-clamp-3">
                  {banner.desc}
                </p>

                <button
                  onClick={() => navigate(banner.link)}
                  className="w-max px-8 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 active:scale-95 uppercase tracking-wide text-sm"
                >
                  Khám phá ngay
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Chấm điều hướng */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-orange-500"
                    : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        {/* Nút Trái/Phải */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === 0 ? banners.length - 1 : prev - 1,
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-orange-500 hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === banners.length - 1 ? 0 : prev + 1,
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-orange-500 hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
