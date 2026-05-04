import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // Dùng để click vào link chuyển trang

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState({ recipes: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Dùng ref để phát hiện click ra ngoài thì đóng dropdown
  const searchRef = useRef(null);

  // Xử lý click ra ngoài để đóng
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý DEBOUNCE và GỌI API
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setResults({ recipes: [], users: [] });
      setShowDropdown(false);
      return;
    }

    // Thiết lập đồng hồ đếm ngược 500ms (Debounce)
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/search?q=${searchTerm}`,
        );
        const data = await response.json();

        setResults(data);
        setShowDropdown(true); // Có data thì xổ dropdown ra
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Đợi nửa giây sau khi ngừng gõ

    // Dọn dẹp đồng hồ cũ nếu người dùng gõ tiếp
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      {/* 1. Ô INPUT TÌM KIẾM */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchTerm) setShowDropdown(true);
          }} // Click lại vào ô thì mở lại dropdown
          placeholder="Tìm kiếm công thức, người dùng..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        {/* Cái xoay xoay loading nhỏ xíu bên góc phải */}
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* 2. MENU DROPDOWN XỔ XUỐNG */}
      {showDropdown &&
        (results.recipes.length > 0 || results.users.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
            {/* Gợi ý Công thức */}
            {results.recipes.length > 0 && (
              <div className="p-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase px-3 pb-1">
                  Công thức
                </h3>
                {results.recipes.map((recipe) => (
                  <Link
                    key={recipe.RecipeID}
                    to={`/recipe/${recipe.RecipeID}`} // Link sang trang chi tiết món ăn
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <img
                      src={recipe.ImageURL || "link-anh-mac-dinh.jpg"}
                      alt=""
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {recipe.Title}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Đường kẻ chia cách */}
            {results.recipes.length > 0 && results.users.length > 0 && (
              <hr className="border-gray-100" />
            )}

            {/* Gợi ý Người dùng */}
            {results.users.length > 0 && (
              <div className="p-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase px-3 pb-1">
                  Người dùng
                </h3>
                {results.users.map((user) => (
                  <Link
                    key={user.UserID}
                    to={`/user/${user.Username}`} // Link sang trang Profile
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <img
                      src={user.Avatar || "link-avatar-mac-dinh.png"}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <span className="text-sm font-medium text-gray-700 truncate">
                      @{user.Username}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Báo lỗi không tìm thấy */}
      {showDropdown &&
        !isSearching &&
        results.recipes.length === 0 &&
        results.users.length === 0 &&
        searchTerm.trim() !== "" && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center z-50">
            <p className="text-sm text-gray-500">
              Không tìm thấy kết quả nào cho "{searchTerm}"
            </p>
          </div>
        )}
    </div>
  );
}
