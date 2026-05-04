import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBreadSlice,
  faChevronDown,
  faBell,
  faUser,
  faSignOutAlt,
  faUtensils,
  faUserShield,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faUserPlus,
  faHeart,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // ĐÃ SỬA: Đặt tab mặc định là 'interact' (Tương tác) thay vì 'all'
  const [activeNotifTab, setActiveNotifTab] = useState("interact");

  const [categories, setCategories] = useState([]);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [notifications, setNotifications] = useState([]);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.IsRead).length;
  }, [notifications]);

  // ĐÃ SỬA: Xóa logic của tab 'all'
  const filteredNotifications = useMemo(() => {
    if (activeNotifTab === "follow")
      return notifications.filter((n) => n.Type === "Follow");
    if (activeNotifTab === "interact")
      return notifications.filter((n) =>
        ["Favorite", "Comment"].includes(n.Type),
      );
    if (activeNotifTab === "admin")
      return notifications.filter((n) =>
        ["Approve", "Reject"].includes(n.Type),
      );
    return notifications;
  }, [notifications, activeNotifTab]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  const markSingleAsRead = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/read/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.NotificationID === id || n.id === id ? { ...n, IsRead: 1 } : n,
          ),
        );
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đã đọc:", error);
    }
  };

  const deleteReadNotifications = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:5000/api/notifications/delete-read",
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setNotifications(notifications.filter((n) => !n.IsRead));
      }
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const formattedCategories = data.map((item) => ({
          id: item.CategoryID,
          name: item.CategoryName,
        }));
        setCategories(formattedCategories);
      })
      .catch((err) => console.error("Lỗi lấy danh mục:", err));
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      try {
        const response = await fetch(
          "http://localhost:5000/api/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
      }
    };

    const syncUser = () => {
      const savedUser = localStorage.getItem("loggedInUser");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener("user-changed", syncUser);
    window.addEventListener("storage", syncUser);

    if (user) {
      fetchNotifications();
    }

    const interval = setInterval(() => {
      if (user) fetchNotifications();
    }, 30000);

    return () => {
      window.removeEventListener("user-changed", syncUser);
      window.removeEventListener("storage", syncUser);
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        notifMenuRef.current &&
        !notifMenuRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotifyIcon = (type) => {
    switch (type) {
      case "Approve":
        return (
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-green-500 text-lg"
          />
        );
      case "Reject":
        return (
          <FontAwesomeIcon
            icon={faTimesCircle}
            className="text-red-500 text-lg"
          />
        );
      case "Follow":
        return (
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faUserPlus} />
          </div>
        );
      case "Favorite":
        return (
          <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faHeart} />
          </div>
        );
      case "Comment":
        return (
          <div className="w-10 h-10 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faStar} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faInfoCircle} />
          </div>
        );
    }
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    let past = new Date(dateString);

    if (past > now) {
      past = new Date(past.getTime() - 7 * 60 * 60 * 1000);
    }

    const diffInSeconds = Math.floor((now - past) / 1000);
    const safeDiff = diffInSeconds < 0 ? 0 : diffInSeconds;

    if (safeDiff < 60) return "Vừa xong";

    const diffInMinutes = Math.floor(safeDiff / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} tháng trước`;

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} năm trước`;
  };

  // ĐÃ SỬA: Xóa tab "Tất cả"
  const notifTabs = [
    { id: "interact", label: "Tương tác" },
    { id: "follow", label: "Người theo dõi" },
  ];
  if (user && (user.Role === "Admin" || user.Role === "Staff")) {
    notifTabs.push({ id: "admin", label: "Duyệt bài" });
  }

  const renderNotifItem = (n) => (
    <Link
      to={n.Link || "#"}
      key={n.NotificationID || n.id}
      onClick={() => {
        setIsNotificationOpen(false);
        if (!n.IsRead) markSingleAsRead(n.NotificationID || n.id);
      }}
      className="relative flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="shrink-0">{getNotifyIcon(n.Type)}</div>
      <div className="flex-1 pr-6">
        <p
          className={`text-[13px] leading-snug ${!n.IsRead ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}
        >
          {n.Message}
        </p>
        <span className="text-[11px] text-gray-400 font-medium mt-1.5 block">
          {timeAgo(n.CreatedAt)}
        </span>
      </div>

      {!n.IsRead && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
      )}
    </Link>
  );

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-8">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl shadow-lg shadow-orange-200 group-hover:rotate-12 transition-transform duration-300">
            <FontAwesomeIcon icon={faBreadSlice} />
          </div>
          <span className="text-lg sm:text-2xl font-black text-gray-800 tracking-tighter uppercase leading-none">
            KND <span className="text-orange-500">Food</span>
          </span>
        </Link>

        {/* THANH TÌM KIẾM */}
        <div className="flex-1 max-w-2xl relative z-50 hidden md:block">
          <SearchBar />
        </div>

        {/* ĐIỀU HƯỚNG & USER */}
        <div className="flex items-center gap-2 sm:gap-5 shrink-0">
          <div className="hidden xl:flex items-center gap-6 text-gray-600 font-bold text-sm">
            <Link
              to="/recipes"
              className="hover:text-orange-500 transition-colors"
            >
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
                      to={`/recipes?category=${cat.id}`}
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
          {user && (user.Role === "Admin" || user.Role === "Staff") && (
            <Link
              to="/admin"
              className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-5 sm:py-2.5 text-red-600 bg-red-50 rounded-2xl hover:bg-red-600 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-wider border border-red-100 shadow-sm active:scale-95"
              title="Quản trị"
            >
              <FontAwesomeIcon
                icon={faUserShield}
                className="text-sm sm:text-xs"
              />
              <span className="hidden sm:inline ml-2">Quản trị</span>
            </Link>
          )}

          {/* NÚT CHIA SẺ */}
          <Link
            to="/create-recipe"
            className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-5 sm:py-2.5 text-orange-600 bg-orange-50 rounded-2xl hover:bg-orange-600 hover:text-white transition-all duration-300 whitespace-nowrap font-black text-xs uppercase tracking-wider border border-orange-100 shadow-sm active:scale-95"
            title="Chia sẻ"
          >
            <FontAwesomeIcon icon={faUtensils} className="text-sm sm:text-xs" />
            <span className="hidden sm:inline ml-2">Chia sẻ</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-4 border-l border-gray-100 pl-2 sm:pl-4">
              {/* CHUÔNG THÔNG BÁO */}
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all border ${unreadCount > 0 ? "bg-orange-500 text-white shadow-lg shadow-orange-200 border-orange-400" : "bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-orange-500 border-gray-100"}`}
                >
                  <FontAwesomeIcon
                    icon={faBell}
                    className={unreadCount > 0 ? "animate-tada" : ""}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black border-2 border-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="fixed left-4 right-4 sm:absolute sm:left-auto sm:right-0 sm:w-[420px] bg-white shadow-2xl rounded-3xl border border-gray-50 mt-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60] flex flex-col max-h-[calc(100vh-100px)]">
                    {/* Header Notification (ĐÃ SỬA: Bỏ nút đọc hết) */}
                    <div className="p-5 pb-3 flex items-center justify-between shrink-0">
                      <h3 className="font-black text-gray-900 text-lg">
                        Thông báo
                      </h3>
                      <div className="flex gap-4">
                        <button
                          onClick={deleteReadNotifications}
                          className="text-xs text-gray-500 font-bold hover:text-red-500 transition-colors"
                        >
                          Xóa thông báo đã đọc
                        </button>
                      </div>
                    </div>

                    {/* TIKTOK STYLE PILLS */}
                    <div className="px-4 pb-3 flex flex-wrap gap-2 border-b border-gray-100 shrink-0">
                      {notifTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveNotifTab(tab.id)}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-200 ${
                            activeNotifTab === tab.id
                              ? "bg-gray-800 text-white shadow-md shadow-gray-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Danh sách List thông báo */}
                    <div className="flex-1 overflow-y-auto">
                      {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(renderNotifItem)
                      ) : (
                        <div className="py-16 text-center text-gray-400 flex flex-col items-center">
                          <span className="text-sm font-bold text-gray-500">
                            Không có thông báo!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* USER DROPDOWN */}
              <div className="relative py-2" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 sm:pr-4 bg-gray-50 hover:bg-gray-100 rounded-full transition-all border border-gray-100 group"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-orange-500 text-white rounded-full flex items-center justify-center font-black shadow-md shadow-orange-200 uppercase overflow-hidden">
                    {user.Avatar ? (
                      <img
                        src={user.Avatar}
                        alt="avt"
                        className="w-full h-full object-cover"
                      />
                    ) : user.FullName ? (
                      user.FullName.charAt(0)
                    ) : (
                      "U"
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-bold text-gray-700">
                    {user.FullName ? user.FullName.split(" ")[0] : "Bạn"}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 w-48 sm:w-56 bg-white shadow-2xl rounded-3xl p-3 border border-gray-50 mt-0.2 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)} // Tự đóng khi bấm vào link
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-500 rounded-2xl transition font-bold group"
                    >
                      <FontAwesomeIcon
                        icon={faUser}
                        className="w-4 text-gray-400 group-hover:text-orange-500"
                      />
                      Hồ sơ cá nhân
                    </Link>
                    <div className="my-1 border-t border-gray-100"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-2xl transition font-bold group"
                    >
                      <FontAwesomeIcon
                        icon={faSignOutAlt}
                        className="w-4 text-red-400 group-hover:text-red-500"
                      />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-gray-700 font-bold px-3 py-2 text-xs sm:text-sm hover:text-orange-500 transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-orange-500 text-white px-4 py-2 sm:px-6 rounded-full font-bold text-xs sm:text-sm shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
