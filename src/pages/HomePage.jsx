import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import RecipeCard from "../components/RecipeCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import defaultRecipeImg from "../assets/hero.png";

export default function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Gọi cả 2 API cùng một lúc cho lẹ: Lấy Món ăn và Lấy Danh mục
    const fetchData = async () => {
      try {
        const [recipesRes, categoriesRes] = await Promise.all([
          fetch("http://localhost:5000/api/recipes"),
          fetch("http://localhost:5000/api/categories")
        ]);

        const recipesData = await recipesRes.json();
        const categoriesData = await categoriesRes.json();

        // Tự động tạo "Bản dịch danh mục" từ SQL
        // Biến [ {CategoryID: 1, CategoryName: 'Món ăn'} ] thành { 1: 'Món ăn' }
        const dynamicCategoryMap = {};
        if (Array.isArray(categoriesData)) {
            categoriesData.forEach(cat => {
                dynamicCategoryMap[cat.CategoryID] = cat.CategoryName;
            });
        }

        // Chuyển đổi dữ liệu từ API
        const formattedRecipes = recipesData.map(recipe => ({
          id: recipe.RecipeID,
          title: recipe.Title,
          // Lấy tên danh mục từ cái bản dịch vừa tạo tự động
          category: dynamicCategoryMap[recipe.CategoryID] || `Khác`, 
          time: `${(recipe.PrepTime || 0) + (recipe.CookTime || 0)}p`,
          difficulty: recipe.Difficulty || 1,
          
          rating: recipe.AverageRating || 0, 
          reviews: recipe.ReviewCount || 0,  
          
          image: recipe.ImageURL || defaultRecipeImg
        }));

        setRecipes(formattedRecipes);
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
      <Hero />

      {/* Trending Section */}
      <section className="container mx-auto px-6 py-20 border-t border-gray-50">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900">
              Món ăn nổi bật
            </h2>
            <p className="text-gray-400 mt-2">
              Những công thức được yêu thích nhất tuần này
            </p>
          </div>
          <button className="text-orange-500 font-bold hover:underline underline-offset-8 flex items-center group">
            Xem tất cả
            <FontAwesomeIcon
              icon={faArrowRightLong}
              className="ml-2 group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* Xử lý trạng thái Loading và Hiển thị thẻ */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {recipes.map((item) => (
              <RecipeCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 font-medium col-span-full">
            Chưa có công thức nào được đăng tải.
          </div>
        )}
      </section>
    </div>
  );
}