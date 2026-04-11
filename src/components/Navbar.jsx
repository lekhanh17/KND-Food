import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBreadSlice, faChevronDown, faBell, faUser, faSignOutAlt, faUtensils, faUserShield, faCheckCircle, faTimesCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // 1. Khởi tạo user từ localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. State lưu danh sách thông báo thật từ API
  const [notifications, setNotifications] = useState([]);

  // 4. Tính toán số thông báo chưa đọc
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.IsRead).length;
  }, [notifications]);

  // 5. Hàm Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    window.location.reload(); 
  };

  // 6. Hàm Đánh dấu đã đọc hết (Gọi API)
  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        // Cập nhật lại UI ngay lập tức
        setNotifications(notifications.map(n => ({ ...n, IsRead: 1 })));
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đã đọc:", error);
    }
  };

  // ==========================================
  // HÀM MỚI: XÓA CÁC THÔNG BÁO ĐÃ ĐỌC
  // ==========================================
  const deleteReadNotifications = async () => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch("http://localhost:5000/api/notifications/delete-read", {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        // Chỉ cần cập nhật lại UI: Xóa những bài đã đọc khỏi danh sách hiện tại
        setNotifications(notifications.filter(n => !n.IsRead));
        // Không cần gọi toast ở đây nữa cho đỡ phiền người dùng
      }
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
    }
  };

  const categories = [
    { id: 1, name: "Món chính" },
    { id: 2, name: "Món canh" },
    { id: 3, name: "Tráng miệng" },
  ];

  // 7. Theo dõi sự thay đổi của User và định kỳ lấy thông báo
  useEffect(() => {
    // Đưa hàm fetch vào trong này luôn
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      try {
        const response = await fetch("http://localhost:5000/api/notifications", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
      }
    };

    const syncUser = () => {
      const savedUser = localStorage.getItem('loggedInUser');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener('user-changed', syncUser);
    window.addEventListener('storage', syncUser);

    // Gọi hàm fetch lần đầu
    if (user) {
      fetchNotifications();
    }

    // Định kỳ lấy thông báo (30s)
    const interval = setInterval(() => {
      if (user) fetchNotifications();
    }, 30000);

    return () => {
      window.removeEventListener('user-changed', syncUser);
      window.removeEventListener('storage', syncUser);
      clearInterval(interval);
    };
  }, [user]); // [user] ở đây là đúng rồi

  // Hàm chọn Icon dựa theo loại thông báo
  const getNotifyIcon = (type) => {
    switch (type) {
      case 'Approve': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'Reject': return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />;
      default: return <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />;
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-8">
        
        {/* 1. LOGO */}
        <Link to="/" className="flex items-center gap-3 -ml-2 shrink-0 group">
          <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-orange-200 group-hover:rotate-12 transition-transform duration-300">
            <FontAwesomeIcon icon={faBreadSlice} />
          </div>
          <span className="text-2xl font-black text-gray-800 tracking-tighter uppercase leading-none">
            KND <span className="text-orange-500">Food</span>
          </span>
        </Link>

        {/* 2. THANH TÌM KIẾM */}
        <div className="flex-1 max-w-2xl relative z-50 hidden md:block">
          <SearchBar />
        </div>

        {/* 3. ĐIỀU HƯỚNG & USER */}
        <div className="flex items-center gap-5 shrink-0">
          
          <div className="hidden xl:flex items-center gap-6 text-gray-600 font-bold text-sm">
            <Link to="/recipes" className="hover:text-orange-500 transition-colors">
              Công thức
            </Link>

            <div
              className="relative py-2 group cursor-pointer"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <span className="flex items-center gap-1 group-hover:text-orange-500 transition">
                Danh mục{" "}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-[10px] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </span>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-44 bg-white shadow-2xl rounded-2xl p-2 border border-gray-50 animate-in fade-in slide-in-from-top-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.id}`}
                      className="block px-4 py-2.5 text-xs hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all font-bold text-gray-700"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* NÚT QUẢN TRỊ */}
          {user && (user.Role === 'Admin' || user.Role === 'Staff') && (
            <Link 
              to="/admin" 
              className="hidden sm:flex items-center gap-2 text-red-600 bg-red-50 px-5 py-2.5 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-wider border border-red-100 shadow-sm active:scale-95"
            >
              <FontAwesomeIcon icon={faUserShield} className="text-xs" />
              Quản trị
            </Link>
          )}

          <Link
            to="/create-recipe"
            className="hidden sm:flex items-center gap-2 text-orange-600 bg-orange-50 px-5 py-2.5 rounded-2xl hover:bg-orange-600 hover:text-white transition-all duration-300 whitespace-nowrap font-black text-xs uppercase tracking-wider border border-orange-100 shadow-sm active:scale-95"
          >
            <FontAwesomeIcon icon={faUtensils} className="text-xs" />
            Chia sẻ
          </Link>

          {user ? (
            <div className="flex items-center gap-4 border-l border-gray-100 pl-4 ml-1">
              
              {/* --- CHUÔNG THÔNG BÁO --- */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${unreadCount > 0 ? "bg-orange-500 text-white shadow-lg shadow-orange-200 border-orange-400" : "bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-orange-500 border-gray-100"}`}
                >
                  <FontAwesomeIcon icon={faBell} className={unreadCount > 0 ? "animate-tada" : ""} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black border-2 border-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute top-full right-0 w-80 bg-white shadow-2xl rounded-3xl border border-gray-50 mt-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                      <h3 className="font-black text-gray-800 text-sm uppercase">Thông báo</h3>
                      
                      {/* GIAO DIỆN MỚI BỔ SUNG 2 NÚT TẠI ĐÂY */}
                      <div className="flex gap-3">
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] text-orange-500 font-bold uppercase hover:underline"
                        >
                          Đọc hết
                        </button>
                        <button
                          onClick={deleteReadNotifications}
                          className="text-[10px] text-red-400 font-bold uppercase hover:text-red-600 transition-colors"
                        >
                          Xóa đã đọc
                        </button>
                      </div>
                      
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <Link
                            to={n.Link || "#"}
                            key={n.NotificationID}
                            onClick={() => setIsNotificationOpen(false)}
                            className={`flex gap-3 p-4 border-b border-gray-50 hover:bg-orange-50/30 transition ${!n.IsRead ? "bg-orange-50/50" : ""}`}
                          >
                            <div className="mt-0.5">{getNotifyIcon(n.Type)}</div>
                            <div>
                              <p className={`text-xs leading-relaxed ${!n.IsRead ? "font-bold text-gray-900" : "text-gray-600"}`}>
                                {n.Message}
                              </p>
                              <span className="text-[9px] text-gray-400 font-bold uppercase mt-1 block">
                                {new Date(n.CreatedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="p-12 text-center text-gray-400 text-xs font-bold">Bạn không có thông báo mới</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div
                className="relative py-2"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <button className="flex items-center gap-3 p-1.5 pr-4 bg-gray-50 hover:bg-gray-100 rounded-full transition-all border border-gray-100 group">
                  <div className="w-9 h-9 bg-orange-500 text-white rounded-full flex items-center justify-center font-black shadow-md shadow-orange-200 uppercase overflow-hidden">
                    {user.Avatar ? (
                      <img src={user.Avatar} alt="nav-avt" className="w-full h-full object-cover" />
                    ) : (
                      user.FullName ? user.FullName.charAt(0) : "U"
                    )}
                  </div>

                  <span className="text-sm font-bold text-gray-700">
                    {user.FullName ? user.FullName.split(" ")[0] : "Bạn"}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 w-56 bg-white shadow-2xl rounded-3xl p-3 border border-gray-50 mt-0.2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-500 rounded-2xl transition font-bold group"
                    >
                      <FontAwesomeIcon icon={faUser} className="w-4 text-gray-400 group-hover:text-orange-500" />
                      Hồ sơ cá nhân
                    </Link>

                    <div className="my-1 border-t border-gray-100"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-2xl transition font-bold group"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="w-4 text-red-400 group-hover:text-red-500" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-700 font-bold px-4 py-2 text-sm hover:text-orange-500 transition">
                Đăng nhập
              </Link>
              <Link to="/register" className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}