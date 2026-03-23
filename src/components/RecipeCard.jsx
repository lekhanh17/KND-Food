export default function RecipeCard({ item }) {
  return (
    <div className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-orange-600 uppercase tracking-widest">
          {item.category}
        </div>
      </div>
      <div className="p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-orange-500 transition-colors line-clamp-1">
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>⏱ {item.time}</span>
            <span>🔥 {item.calories} kcal</span>
          </div>
          <span className="font-bold text-gray-800">⭐ {item.rating}</span>
        </div>
      </div>
    </div>
  );
}