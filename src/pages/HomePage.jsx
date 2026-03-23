import Hero from "../components/Hero";
import RecipeCard from "../components/RecipeCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightLong } from "@fortawesome/free-solid-svg-icons";

const MOCK_RECIPES = [
  {
    id: 1,
    title: "Bún chả Hà Nội chuẩn vị",
    category: "Món chính",
    time: "45p",
    calories: "450",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?q=80&w=800",
  },
  {
    id: 2,
    title: "Salad ức gà sốt mè",
    category: "Eat Clean",
    time: "15p",
    calories: "280",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
  },
  {
    id: 3,
    title: "Cá hồi áp chảo măng tây",
    category: "Món chính",
    time: "25p",
    calories: "350",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800",
  },
  {
    id: 4,
    title: "Bánh Pancake việt quất",
    category: "Tráng miệng",
    time: "20p",
    calories: "320",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=800",
  },
];

export default function HomePage() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOCK_RECIPES.map((item) => (
            <RecipeCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
