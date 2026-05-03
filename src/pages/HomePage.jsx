import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import RecipeCard from "../components/RecipeCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightLong,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import defaultRecipeImg from "../assets/hero.png";

export default function HomePage() {
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]); // Lưu toàn bộ công thức
  const [allCategories, setAllCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ĐÃ SỬA: Gọi thêm API featured để lấy top món ăn nổi bật (đã có đánh giá)
        const [recipesRes, categoriesRes, featuredRes] = await Promise.all([
          fetch(
            "[https://knd-food-be.onrender.com](https://knd-food-be.onrender.com)/api/recipes",
          ),
          fetch(
            "[https://knd-food-be.onrender.com](https://knd-food-be.onrender.com)/api/categories",
          ),
          fetch(
            "[https://knd-food-be.onrender.com](https://knd-food-be.onrender.com)/api/recipes/featured",
          ),
        ]);

        const recipesData = await recipesRes.json();
        const categoriesData = await categoriesRes.json();
        const featuredData = await featuredRes.json();

        const dynamicCategoryMap = {};
        if (Array.isArray(categoriesData)) {
          categoriesData.forEach((cat) => {
            dynamicCategoryMap[cat.CategoryID] = cat.CategoryName;
          });
          setAllCategories(categoriesData);
        }

        // Lọc các công thức đã duyệt
        const approvedRecipes = recipesData.filter(
          (r) =>
            !r.Status ||
            r.Status === "Approved" ||
            r.Status === 1 ||
            r.Status === "1",
        );

        // Format toàn bộ công thức (dùng để render theo từng danh mục ở dưới)
        const formattedAllRecipes = approvedRecipes.map((recipe) => ({
          id: recipe.RecipeID,
          title: recipe.Title,
          category: dynamicCategoryMap[recipe.CategoryID] || `Khác`,
          categoryId: recipe.CategoryID, // Cần ID để lát nữa phân loại
          time: `${(recipe.PrepTime || 0) + (recipe.CookTime || 0)}p`,
          difficulty: recipe.Difficulty || 1,
          rating: recipe.AverageRating || 0,
          reviews: recipe.ReviewCount || 0,
          image: recipe.ImageURL || defaultRecipeImg,
        }));

        setAllRecipes(formattedAllRecipes); // Lưu lại tất cả

        // ==============================================
        // ĐÃ SỬA: Lấy dữ liệu từ API Featured để gán cho Trending
        // ==============================================
        const formattedTrending = featuredData.map((recipe) => ({
          id: recipe.RecipeID,
          title: recipe.Title,
          category: dynamicCategoryMap[recipe.CategoryID] || `Khác`,
          categoryId: recipe.CategoryID,
          time: `${(recipe.PrepTime || 0) + (recipe.CookTime || 0)}p`,
          difficulty: recipe.Difficulty || 1,
          rating: recipe.AverageRating || 0,
          reviews: recipe.ReviewCount || 0,
          image: recipe.ImageURL || defaultRecipeImg,
        }));

        setTrendingRecipes(formattedTrending);
      } catch (error) {
        console.error("Lỗi tải dữ liệu HomePage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Vẫn giữ lại Banner Hero nhé, lỡ bạn làm mất code cũ thì nó nằm ở component này */}
      <Hero />

      {/* 1. KHÁM PHÁ DANH MỤC NHANH (Các nút bấm Pill) */}
      <section className="container mx-auto px-6 pt-16 pb-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <span className="w-10 h-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-lg shadow-sm">
              <FontAwesomeIcon icon={faUtensils} />
            </span>
            Khám phá nhanh
          </h2>
          <p className="text-gray-400 mt-2 pl-14">
            Lựa chọn theo khẩu vị của bạn
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pl-2">
          {isLoading ? (
            <div className="w-full flex py-4">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            allCategories.map((cat) => (
              <Link
                key={cat.CategoryID}
                to={`/recipes?category=${cat.CategoryID}`}
                className="px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-sm border border-gray-100 active:scale-95"
              >
                {cat.CategoryName}
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 2. MÓN ĂN NỔI BẬT (Trending) */}
      <section className="container mx-auto px-6 py-12 border-t border-gray-50 mt-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900">
              Món ăn nổi bật
            </h2>
            <p className="text-gray-400 mt-2">
              Những công thức được yêu thích nhất tuần này
            </p>
          </div>
          {/* Điều kiện lớn hơn 4 mới hiện nút Xem tất cả */}
          {trendingRecipes.length > 4 && (
            <Link
              to="/recipes?sort=popular"
              className="text-orange-500 font-bold hover:underline underline-offset-8 flex items-center group"
            >
              Xem tất cả
              <FontAwesomeIcon
                icon={faArrowRightLong}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : trendingRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* ĐÃ SỬA: Chèn .slice(0, 4) vào để cắt đúng 4 món lên Trang chủ */}
            {trendingRecipes.slice(0, 4).map((item) => (
              <RecipeCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 font-medium">
            Chưa có công thức nào nổi bật.
          </div>
        )}
      </section>

      {/* ========================================== */}
      {/* 3. DUYỆT TỪNG DANH MỤC VÀ HIỂN THỊ MÓN ĂN */}
      {/* ========================================== */}
      {!isLoading &&
        allCategories.map((cat) => {
          // Lọc ra các món ăn thuộc danh mục hiện tại
          const recipesInCategory = allRecipes.filter(
            (r) => r.categoryId === cat.CategoryID,
          );

          // Cú lừa UI/UX: Nếu danh mục này CHƯA có món nào, thì ĐỪNG in nguyên cái khung ra làm gì cho trống web
          if (recipesInCategory.length === 0) return null;

          // Chỉ lấy tối đa 4 món để hiện ở Trang chủ cho gọn
          const displayRecipes = recipesInCategory.slice(0, 4);

          return (
            <section
              key={cat.CategoryID}
              className="container mx-auto px-6 py-12 border-t border-gray-50"
            >
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 capitalize">
                    {cat.CategoryName}
                  </h2>
                </div>

                {/* Nút Xem tất cả dẫn tới trang lọc của đúng danh mục này */}
                {recipesInCategory.length > 4 && (
                  <Link
                    to={`/recipes?category=${cat.CategoryID}`}
                    className="text-orange-500 font-bold hover:underline underline-offset-8 flex items-center group text-sm"
                  >
                    Xem tất cả
                    <FontAwesomeIcon
                      icon={faArrowRightLong}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayRecipes.map((item) => (
                  <RecipeCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}
