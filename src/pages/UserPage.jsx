import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RecipeCard from "../components/RecipeCard";

// ==============================================
// CẤU HÌNH TOAST ĐỒNG BỘ (TRẮNG, CĂN GIỮA)
// ==============================================
const whiteToastConfig = {
  position: "top-center",
  autoClose: 2000,
  hideProgressBar: true,
  theme: "light",
  closeButton: true,
  className:
    "!bg-white !text-gray-800 !rounded-[16px] !shadow-xl !border !border-gray-100 !px-4 !py-3 !w-max !min-w-[300px] !mx-auto !mt-4 !flex !justify-between !items-center",
  bodyClassName: "!text-sm !font-bold !p-0 !m-0 !flex !items-center !gap-2",
};

export default function UserPage() {
  const { username, id } = useParams();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [profileUser, setProfileUser] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const isOwnProfile = (() => {
    if (!user) return false;
    if (profileUser) return user.UserID === profileUser.UserID;
    if (id) return user.UserID.toString() === id.toString();
    if (username) return user.Username === username;
    return true;
  })();

  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);
  const settingsMenuRef = useRef(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("Bài đăng của tôi");
  const tabs = ["Bài đăng của tôi", "Yêu thích"];

  const [formFullName, setFormFullName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formBio, setFormBio] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [myRecipes, setMyRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [isFetchingFav, setIsFetchingFav] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState("");
  const [followList, setFollowList] = useState([]);
  const [isLoadingFollowList, setIsLoadingFollowList] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target)
      ) {
        setIsSettingsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsProfileLoading(true);

      if (id) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/profile/${id}`,
          );
          const data = await res.json();
          if (res.ok) setProfileUser(data);
          else setProfileUser(null);
        } catch {
          setProfileUser(null);
        }
      } else if (username) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/profile/${username}`,
          );
          const data = await res.json();
          if (res.ok) setProfileUser(data);
          else setProfileUser(null);
        } catch {
          setProfileUser(null);
        }
      } else if (user) {
        try {
          const realId = user.Username || user.UserID;
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/profile/${realId}`,
          );
          const data = await res.json();
          if (res.ok) setProfileUser(data);
          else setProfileUser(user);
        } catch {
          setProfileUser(user);
        }
      } else {
        setProfileUser(null);
      }

      setIsProfileLoading(false);
    };

    fetchProfile();
  }, [username, id, user]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      const currentFollowerId = user?.UserID || user?.id;
      const currentFolloweeId = profileUser?.UserID || profileUser?.id;

      if (currentFollowerId && currentFolloweeId && !isOwnProfile) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/check-follow?followerId=${currentFollowerId}&followeeId=${currentFolloweeId}`,
          );
          if (res.ok) {
            const data = await res.json();
            setIsFollowing(data.isFollowing);
          } else {
            console.error("Lỗi từ Backend khi check follow:", await res.text());
          }
        } catch (error) {
          console.error("Lỗi kiểm tra trạng thái theo dõi:", error);
        }
      }
    };
    checkFollowStatus();
  }, [user, profileUser, isOwnProfile]);

  useEffect(() => {
    if (profileUser && isOwnProfile) {
      setFormFullName(profileUser.FullName || "");
      setFormUsername(profileUser.Username || "");
      setFormBio(profileUser.Bio || "");
    }
  }, [profileUser, isOwnProfile]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoadingRecipes(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/recipes/user/${profileUser.UserID}`,
        );
        const data = await res.json();
        if (Array.isArray(data)) setMyRecipes(data);
        else setMyRecipes([]);
      } catch {
        setMyRecipes([]);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    if (profileUser?.UserID) fetchRecipes();
  }, [profileUser]);

  useEffect(() => {
    if (activeTab === "Yêu thích" && isOwnProfile) {
      const fetchMyFavorites = async () => {
        setIsFetchingFav(true);
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/favorites/my-favorites`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (response.ok) {
            const data = await response.json();
            setFavoriteRecipes(data);
          } else {
            setFavoriteRecipes([]);
          }
        } catch (error) {
          console.error("Lỗi lấy danh sách yêu thích:", error);
          setFavoriteRecipes([]);
        } finally {
          setIsFetchingFav(false);
        }
      };
      fetchMyFavorites();
    }
  }, [activeTab, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để theo dõi!", whiteToastConfig);
      return;
    }
    setIsTogglingFollow(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/follow`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            FollowerID: user?.UserID || user?.id,
            TargetUserID: profileUser?.UserID || profileUser?.id,
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing);

        setProfileUser((prev) => {
          const currentCount = prev.FollowerCount || 0;
          return {
            ...prev,
            FollowerCount: data.isFollowing
              ? currentCount + 1
              : Math.max(0, currentCount - 1),
          };
        });
      }
    } catch (error) {
      console.error("Lỗi xử lý follow", error);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handleOpenFollowList = async (type) => {
    setFollowModalType(type);
    setIsFollowModalOpen(true);
    setIsLoadingFollowList(true);
    setFollowList([]);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${profileUser.UserID}/${type}`,
      );
      if (res.ok) {
        const data = await res.json();
        // ĐÃ THÊM: Gắn cờ isFollowing = true cho tất cả người trong danh sách "Đang theo dõi" của mình
        if (type === "following" && isOwnProfile) {
          const enhancedData = data.map((item) => ({
            ...item,
            isFollowing: true,
          }));
          setFollowList(enhancedData);
        } else {
          setFollowList(data);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể lấy danh sách!", whiteToastConfig);
    } finally {
      setIsLoadingFollowList(false);
    }
  };

  // ĐÃ THÊM: Hàm xử lý Unfollow nhanh trong Modal (Kiểu TikTok)
  const handleUnfollowFromList = async (targetUserId) => {
    if (!user) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/follow`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            FollowerID: user?.UserID || user?.id,
            TargetUserID: targetUserId,
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        // Cập nhật lại UI trong danh sách
        setFollowList((prevList) =>
          prevList.map((item) =>
            item.UserID === targetUserId
              ? { ...item, isFollowing: data.isFollowing }
              : item,
          ),
        );
        // Cập nhật lại số đếm ở ngoài Profile
        if (followModalType === "following" && isOwnProfile) {
          setProfileUser((prev) => ({
            ...prev,
            FollowingCount: data.isFollowing
              ? prev.FollowingCount + 1
              : Math.max(0, prev.FollowingCount - 1),
          }));
        }
      }
    } catch (error) {
      console.error("Lỗi Unfollow từ list:", error);
      toast.error("Có lỗi xảy ra, thử lại sau!", whiteToastConfig);
    }
  };

  const getDifficultyUI = (level) => {
    switch (Number(level)) {
      case 1:
        return {
          label: "Rất dễ",
          color: "text-green-700 bg-green-50 border-green-200",
        };
      case 2:
        return {
          label: "Dễ",
          color: "text-teal-700 bg-teal-50 border-teal-200",
        };
      case 3:
        return {
          label: "Trung bình",
          color: "text-yellow-700 bg-yellow-50 border-yellow-200",
        };
      case 4:
        return {
          label: "Khó",
          color: "text-orange-700 bg-orange-50 border-orange-200",
        };
      case 5:
        return {
          label: "Rất khó",
          color: "text-red-700 bg-red-50 border-red-200",
        };
      default:
        return {
          label: "Cơ bản",
          color: "text-gray-700 bg-gray-50 border-gray-200",
        };
    }
  };

  const handleAvatarChange = async (e) => {
    if (!isOwnProfile) return;

    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh!", whiteToastConfig);
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("UserID", user.UserID);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/upload-avatar`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();
      if (response.ok) {
        const updatedUser = { ...user, Avatar: data.avatarUrl };
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setProfileUser((prev) => ({ ...prev, Avatar: data.avatarUrl }));
        window.dispatchEvent(new Event("user-changed"));
        toast.success("Cập nhật ảnh hồ sơ thành công!", whiteToastConfig);
      } else {
        toast.error(data.message, whiteToastConfig);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối Server!", whiteToastConfig);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const trimmedName = formFullName.trim();
    const trimmedUsername = formUsername.trim();
    const trimmedBio = formBio.trim();

    if (!trimmedName) {
      toast.warning("Vui lòng điền họ tên.", whiteToastConfig);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            UserID: user.UserID,
            FullName: trimmedName,
            Email: user.Email,
            Username: trimmedUsername,
            Bio: trimmedBio,
          }),
        },
      );

      if (response.ok) {
        const updatedUser = {
          ...user,
          FullName: trimmedName,
          Username: trimmedUsername,
          Bio: trimmedBio,
        };
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setProfileUser((prev) => ({
          ...prev,
          FullName: trimmedName,
          Username: trimmedUsername,
          Bio: trimmedBio,
        }));
        window.dispatchEvent(new Event("user-changed"));

        setIsEditingProfile(false);
        toast.success("Cập nhật hồ sơ thành công!", whiteToastConfig);
      } else {
        const data = await response.json();
        toast.error(data.message, whiteToastConfig);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối Server!", whiteToastConfig);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu mới không khớp!", whiteToastConfig);
      return;
    }
    if (newPassword.length < 6) {
      toast.warning("Mật khẩu ít nhất 6 ký tự!", whiteToastConfig);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/change-password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            UserID: user.UserID,
            CurrentPassword: currentPassword,
            NewPassword: newPassword,
          }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message, whiteToastConfig);
        setIsChangePasswordOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast.error(data.message, whiteToastConfig);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối Server!", whiteToastConfig);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-20">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 pt-20">
        <h2 className="text-2xl font-bold mb-2">
          Không tìm thấy người dùng này
        </h2>
        <p className="text-gray-500 mb-6">
          Liên kết có thể bị hỏng hoặc trang đã bị xóa.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition"
        >
          Về Trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-14 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-8 pt-8">
          <div
            className={`relative shrink-0 ${isOwnProfile ? "cursor-pointer group" : ""}`}
            onClick={() => isOwnProfile && fileInputRef.current.click()}
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shadow-sm">
              {profileUser.Avatar ? (
                <img
                  src={profileUser.Avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-black text-orange-500 uppercase">
                  {profileUser.FullName?.charAt(0)}
                </span>
              )}
            </div>

            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="flex flex-col items-center sm:items-start w-full">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {profileUser.FullName}
            </h1>
            {profileUser.Username && (
              <p className="text-gray-500 font-medium text-sm mt-0.5">
                @{profileUser.Username}
              </p>
            )}

            {isOwnProfile ? (
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-6 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.152-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                  </svg>
                  Chỉnh sửa hồ sơ
                </button>

                <div className="relative" ref={settingsMenuRef}>
                  <button
                    onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-all active:scale-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                      />
                    </svg>
                  </button>

                  {isSettingsMenuOpen && (
                    <div className="absolute right-0 sm:left-0 mt-2 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-10 animate-in fade-in zoom-in-95 duration-200">
                      <button
                        onClick={() => {
                          setIsChangePasswordOpen(true);
                          setIsSettingsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-sm font-bold transition-colors flex items-center gap-3"
                      >
                        Đổi mật khẩu
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleFollowToggle}
                  disabled={isTogglingFollow}
                  className={`px-8 py-2 text-sm font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2 ${
                    isFollowing
                      ? "bg-gray-100 hover:bg-red-50 text-gray-800 hover:text-red-500 border border-gray-200 hover:border-red-200"
                      : "bg-[#f97316] hover:bg-[#ea580c] text-white"
                  }`}
                >
                  {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
              </div>
            )}

            <div className="flex gap-6 mt-5 text-sm">
              <div
                className="flex gap-1.5 cursor-pointer hover:underline text-gray-500 group"
                onClick={() => handleOpenFollowList("following")}
              >
                <span className="font-bold text-gray-900 group-hover:text-orange-500">
                  {profileUser.FollowingCount || 0}
                </span>{" "}
                Đang follow
              </div>
              <div
                className="flex gap-1.5 cursor-pointer hover:underline text-gray-500 group"
                onClick={() => handleOpenFollowList("followers")}
              >
                <span className="font-bold text-gray-900 group-hover:text-orange-500">
                  {profileUser.FollowerCount || 0}
                </span>{" "}
                Follower
              </div>
              <div className="flex gap-1.5 text-gray-500 cursor-default">
                <span className="font-bold text-gray-900">
                  {profileUser.TotalLikes || 0}
                </span>{" "}
                Thích
              </div>
            </div>

            <div className="mt-4 text-gray-900 font-medium text-sm whitespace-pre-wrap">
              <p>{profileUser.Bio ? profileUser.Bio : "Chưa có tiểu sử."}</p>
            </div>
          </div>
        </div>

        {/* MENU NGANG */}
        <div className="flex border-b border-gray-200 mt-4 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3.5 font-bold text-sm whitespace-nowrap transition-colors relative ${
                activeTab === tab
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {isOwnProfile ? tab : tab.replace(" của tôi", "")}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></div>
              )}
            </button>
          ))}
        </div>

        {/* --- KHU VỰC NỘI DUNG TABS --- */}
        <div className="py-8">
          {activeTab === "Bài đăng của tôi" ? (
            isLoadingRecipes ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              </div>
            ) : myRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {myRecipes.map((recipe) => {
                  const difficultyUI = getDifficultyUI(recipe.Difficulty);

                  return (
                    <Link
                      to={`/recipe/${recipe.RecipeID}`}
                      key={recipe.RecipeID}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer block"
                    >
                      <div className="aspect-[4/3] overflow-hidden relative bg-gray-100">
                        {recipe.Status === "Pending" && (
                          <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-yellow-500/90 backdrop-blur-md text-white text-[10px] font-black tracking-widest rounded-xl shadow-lg border border-yellow-400">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                              Đang chờ duyệt
                            </span>
                          </div>
                        )}

                        {(recipe.Status === "Approved" ||
                          recipe.Status === "Published") && (
                          <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-green-500/90 backdrop-blur-md text-white text-[10px] font-black tracking-widest rounded-xl shadow-lg">
                            Đã duyệt
                          </div>
                        )}

                        {recipe.ImageURL ? (
                          <img
                            src={recipe.ImageURL}
                            alt={recipe.Title}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                              recipe.Status === "Pending"
                                ? "grayscale-[0.5] opacity-80"
                                : ""
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            No Image
                          </div>
                        )}

                        <div
                          className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg border text-xs font-black shadow-sm z-10 ${difficultyUI.color}`}
                        >
                          {difficultyUI.label}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-2 group-hover:text-orange-500 transition-colors">
                          {recipe.Title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 font-medium gap-4">
                          <span className="flex items-center gap-1.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {recipe.PrepTime + recipe.CookTime} phút
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-in fade-in">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="w-20 h-20 mb-4 opacity-50"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
                <h3 className="text-lg font-bold text-gray-800">
                  Chưa có bài đăng nào.
                </h3>
              </div>
            )
          ) : activeTab === "Yêu thích" ? (
            !isOwnProfile ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-in fade-in">
                <h3 className="text-lg font-bold text-gray-800">
                  Đây là mục riêng tư
                </h3>
                <p className="text-sm mt-1">
                  Chỉ chủ tài khoản mới có thể xem!
                </p>
              </div>
            ) : isFetchingFav ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              </div>
            ) : favoriteRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {favoriteRecipes.map((recipe) => (
                  <RecipeCard key={recipe.RecipeID} item={recipe} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-in fade-in">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="w-20 h-20 mb-4 opacity-50 text-red-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                <h3 className="text-lg font-bold text-gray-800">
                  Bạn chưa lưu món ăn nào
                </h3>
                <Link
                  to="/"
                  className="mt-3 px-6 py-2 bg-red-50 text-red-500 font-bold rounded-lg hover:bg-red-100 transition"
                >
                  Khám phá ngay
                </Link>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-in fade-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-20 h-20 mb-4 opacity-50"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">
                Chưa có {activeTab.toLowerCase()} nào
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Model danh sách Đang theo dõi / Người theo dõi */}
      {isFollowModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden max-h-[80vh]">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 shrink-0">
              <h3 className="text-xl font-black text-gray-900">
                {followModalType === "followers"
                  ? "Người theo dõi"
                  : "Đang theo dõi"}
              </h3>
              <button
                onClick={() => setIsFollowModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-0 overflow-y-auto">
              {isLoadingFollowList ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : followList.length > 0 ? (
                followList.map((item) => (
                  <div
                    key={item.UserID}
                    className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <Link
                      to={`/profile/${item.Username || item.UserID}`}
                      onClick={() => setIsFollowModalOpen(false)}
                      className="flex items-center gap-4 flex-1 overflow-hidden"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center border border-gray-200">
                        {item.Avatar ? (
                          <img
                            src={item.Avatar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-orange-500 uppercase">
                            {item.FullName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden pr-4">
                        <div className="font-bold text-gray-900 truncate">
                          {item.FullName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          @{item.Username}
                        </div>
                      </div>
                    </Link>

                    {/* Nút Follow/Unfollow siêu nhanh trong Modal */}
                    {isOwnProfile && followModalType === "following" && (
                      <button
                        onClick={() => handleUnfollowFromList(item.UserID)}
                        className={`shrink-0 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                          item.isFollowing === false
                            ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                        }`}
                      >
                        {item.isFollowing === false
                          ? "Theo dõi"
                          : "Đang theo dõi"}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 font-bold">
                    Danh sách trống.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isOwnProfile && isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-2xl font-black text-gray-900">Sửa hồ sơ</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form
                id="editProfileForm"
                onSubmit={handleUpdateProfile}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 pb-6">
                  <div className="w-full sm:w-1/4 text-sm font-bold text-gray-800 pt-2">
                    Ảnh hồ sơ
                  </div>
                  <div className="w-full sm:w-3/4 flex justify-center sm:justify-start">
                    <div
                      className="relative cursor-pointer group"
                      onClick={() => modalFileInputRef.current.click()}
                    >
                      <div className="w-24 h-24 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shadow-sm">
                        {user.Avatar ? (
                          <img
                            src={user.Avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-black text-orange-500 uppercase">
                            {user.FullName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-white border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center shadow-md group-hover:bg-gray-50 transition">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4 text-gray-700"
                        >
                          <path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.152-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                        </svg>
                      </div>
                      <input
                        type="file"
                        ref={modalFileInputRef}
                        onChange={handleAvatarChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 pb-6">
                  <div className="w-full sm:w-1/4 text-sm font-bold text-gray-800 pt-3">
                    Id người dùng
                  </div>
                  <div className="w-full sm:w-3/4">
                    <input
                      type="text"
                      placeholder="Username"
                      value={formUsername}
                      maxLength={16}
                      onChange={(e) => {
                        const val = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_.]/g, "");
                        setFormUsername(val);
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-gray-300 focus:bg-white transition-all font-medium text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 pb-6">
                  <div className="w-full sm:w-1/4 text-sm font-bold text-gray-800 pt-3">
                    Tên
                  </div>
                  <div className="w-full sm:w-3/4">
                    <input
                      type="text"
                      required
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-gray-300 focus:bg-white transition-all font-medium text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pb-2">
                  <div className="w-full sm:w-1/4 text-sm font-bold text-gray-800 pt-3">
                    Tiểu sử
                  </div>
                  <div className="w-full sm:w-3/4">
                    <textarea
                      rows="4"
                      placeholder="Tiểu sử"
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      maxLength={80}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-gray-300 focus:bg-white transition-all font-medium text-gray-900 resize-none"
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-[24px] shrink-0">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="editProfileForm"
                disabled={!formFullName.trim()}
                className={`px-6 py-2.5 text-white rounded-lg font-bold transition ${formFullName.trim() ? "bg-orange-500 hover:bg-orange-600" : "bg-orange-300 cursor-not-allowed"}`}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {isOwnProfile && isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6">
              Đổi mật khẩu
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white transition-colors"
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white transition-colors"
              />
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white transition-colors"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#f97316] text-white rounded-xl font-bold hover:bg-[#ea580c] transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
