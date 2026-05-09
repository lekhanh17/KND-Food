import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import defaultRecipeImg from "../assets/hero.png";

export default function AllRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const categoryIdParam = searchParams.get("category");
  const sortParam = searchParams.get("sort"); // Bắt tham số sort từ URL

  // Nếu trên URL có sort=popular thì mặc định chọn 'top_rated' (Đánh giá cao)
  const [sortBy, setSortBy] = useState(
    sortParam === "popular" ? "top_rated" : "newest",
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Theo dõi nếu URL thay đổi (nhấn back/forward) thì tự cập nhật lại dropdown
  useEffect(() => {
    if (sortParam === "popular") {
      setSortBy("top_rated");
    } else if (!sortParam && !categoryIdParam) {
      setSortBy("newest"); // Trạng thái mặc định khi xem tất cả
    }
  }, [sortParam, categoryIdParam]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesRes, categoriesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/recipes`),
          fetch(`${import.meta.env.VITE_API_URL}/api/categories`),
        ]);

        const recipesData = await recipesRes.json();
        const categoriesData = await categoriesRes.json();

        const dynamicCategoryMap = {};
        if (Array.isArray(categoriesData)) {
          categoriesData.forEach((cat) => {
            dynamicCategoryMap[cat.CategoryID] = cat.CategoryName;
          });
        }
        setCategories(dynamicCategoryMap);

        const approvedRecipes = recipesData.filter(
          (r) =>
            !r.Status ||
            r.Status === "Approved" ||
            r.Status === 1 ||
            r.Status === "1",
        );

        const formattedRecipes = approvedRecipes.map((recipe) => ({
          id: recipe.RecipeID,
          title: recipe.Title,
          category: dynamicCategoryMap[recipe.CategoryID] || "Khác",
          categoryId: recipe.CategoryID,
          time: `${(recipe.PrepTime || 0) + (recipe.CookTime || 0)}p`,
          difficulty: recipe.Difficulty || 1,
          rating: recipe.AverageRating || 0,
          reviews: recipe.ReviewCount || 0,
          image: recipe.ImageURL || defaultRecipeImg,
          // Truyền ViewCount vào để thẻ RecipeCard lấy được dữ liệu lượt xem
          ViewCount: recipe.ViewCount || 0,
        }));

        setRecipes(formattedRecipes);
      } catch (error) {
        console.error("Lỗi lấy danh sách:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 1. Lọc theo Danh mục (Nếu trên URL có tham số ?category=...)
  const filteredByCategory = categoryIdParam
    ? recipes.filter(
        (recipe) => recipe.categoryId.toString() === categoryIdParam,
      )
    : recipes;

  // 2. Lọc và Sắp xếp dữ liệu
  const finalDisplayedRecipes = [...filteredByCategory]
    .filter((recipe) => {
      // Nếu đang vào từ link "Món nổi bật" thì chỉ hiện các món đó
      if (sortParam === "popular") {
        return recipe.rating > 0; // Hoặc dùng recipe.reviews > 0 đều được
      }
      return true; // Xem bình thường thì vẫn hiện đủ món
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.id - a.id;
      if (sortBy === "oldest") return a.id - b.id;

      // ĐÃ SỬA: Logic xếp hạng thông minh (Xét Rating trước, Bằng Rating thì xét Reviews)
      if (sortBy === "top_rated") {
        if (b.rating === a.rating) {
          return b.reviews - a.reviews;
        }
        return b.rating - a.rating;
      }

      return 0;
    });

  const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "top_rated", label: "Đánh giá cao" },
  ];

  // ==========================================
  // Đổi tiêu đề cực xịn theo ngữ cảnh
  // ==========================================
  let pageTitle = "Tất Cả Công Thức";
  let pageSubtitle = "Khám phá bộ sưu tập món ngon đa dạng từ cộng đồng.";

  if (categoryIdParam && categories[categoryIdParam]) {
    pageTitle = `Danh mục: ${categories[categoryIdParam]}`;
    pageSubtitle = `Tuyển tập các công thức ${categories[categoryIdParam]} hấp dẫn nhất.`;
  } else if (sortParam === "popular") {
    pageTitle = "Món Ăn Nổi Bật";
    pageSubtitle = "Những công thức được yêu thích và đánh giá cao nhất.";
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1c2b36] capitalize">
              {pageTitle}
            </h1>
            <p className="text-gray-500 mt-2 font-medium">{pageSubtitle}</p>
          </div>

          {/* GIAO DIỆN BỘ LỌC (CUSTOM DROPDOWN) */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border transition-all cursor-pointer shadow-sm select-none ${isDropdownOpen ? "border-orange-500 ring-2 ring-orange-500/20" : "border-gray-200 hover:border-gray-300"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-orange-500 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
              <span className="text-gray-500 font-bold text-sm hidden md:block">
                Sắp xếp:
              </span>

              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1c2b36]">
                  {sortOptions.find((opt) => opt.value === sortBy)?.label}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-orange-500" : ""}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 z-50 w-full min-w-[180px] mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <ul className="py-2">
                  {sortOptions.map((opt) => (
                    <li
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${sortBy === opt.value ? "bg-orange-50 text-orange-600 font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-orange-500 font-medium"}`}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : finalDisplayedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {finalDisplayedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} item={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
            <span className="text-5xl mb-4">🍽️</span>
            <p className="text-gray-500 font-medium">
              Chưa có công thức nào thuộc danh mục này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}