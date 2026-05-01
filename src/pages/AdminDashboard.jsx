import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faUserShield,
  faUsers,
  faArrowLeft,
  faUtensils,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

// ==========================================
// CẤU HÌNH ÉP TOAST SANG MÀU TRẮNG (DÙNG ! ĐỂ ĐÈ APP.JSX)
// ==========================================
const whiteToastConfig = {
  position: "top-center",
  autoClose: 2000,
  hideProgressBar: true,
  theme: "light",
  closeButton: true,
  className: "!bg-white !text-gray-800 !rounded-[16px] !shadow-xl !border !border-gray-100 !px-4 !py-3 !w-max !min-w-[300px] !mx-auto !mt-4 !flex !justify-between !items-center",
  bodyClassName: "!text-sm !font-bold !p-0 !m-0 !flex !items-center !gap-2",
};

// ==========================================
// COMPONENT: DROPDOWN CHỌN VAI TRÒ SIÊU ĐẸP
// ==========================================
const CustomRoleDropdown = ({ currentRole, onRoleChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const roles = ["User", "Staff", "Admin"];

  // Bộ màu sắc riêng cho từng Role để nhìn phát biết ngay
  const roleColors = {
    Admin: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
    Staff: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
    User: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
  };

  return (
    <div className="relative inline-block text-left w-28">
      {/* Nút bấm hiển thị Role hiện tại */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all ${
          roleColors[currentRole || "User"]
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer shadow-sm hover:shadow"}`}
      >
        {currentRole || "User"}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Khung Dropdown xổ xuống */}
      {isOpen && !disabled && (
        <>
          {/* Lớp phủ tàng hình để click ra ngoài thì tự đóng menu */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {roles.map((role) => (
              <div
                key={role}
                onClick={() => {
                  onRoleChange(role);
                  setIsOpen(false);
                }}
                className={`px-3 py-2.5 text-[11px] font-black uppercase tracking-wider cursor-pointer transition-colors ${
                  currentRole === role
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {role}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

  useEffect(() => {
    fetchUsers();
    fetchPendingRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- API LẤY NGƯỜI DÙNG ---
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Lỗi mạng");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      toast.error("Có lỗi xảy ra!", whiteToastConfig);
    } finally {
      setLoading(false);
    }
  };

  // --- API LẤY BÀI CHỜ DUYỆT ---
  const fetchPendingRecipes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/admin/pending-recipes",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setPendingRecipes(data);
      }
    } catch (error) {
      console.error("Lỗi lấy bài chờ duyệt", error);
    }
  };

  // --- API DUYỆT BÀI ---
  const handleApproveRecipe = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/admin/approve-recipe/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        toast.success("Đã duyệt món ăn!", whiteToastConfig);
        setPendingRecipes(pendingRecipes.filter((r) => r.RecipeID !== id));
      } else {
        toast.error("Lỗi duyệt bài!", whiteToastConfig);
      }
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      toast.error("Có lỗi xảy ra!", whiteToastConfig);
    }
  };

  // --- API TỪ CHỐI BÀI ---
  const handleRejectRecipe = async (id) => {
    const isConfirm = window.confirm(
      "Xác nhận từ chối? Bài đăng này sẽ bị xóa vĩnh viễn!"
    );
    if (!isConfirm) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/admin/reject-recipe/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setPendingRecipes(pendingRecipes.filter((r) => r.RecipeID !== id));
        toast.success("Đã từ chối bài đăng!", whiteToastConfig);
      } else {
        toast.error("Có lỗi xảy ra khi thực hiện!", whiteToastConfig);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối đến máy chủ!", whiteToastConfig);
    }
  };

  // --- CHUYỂN VAI TRÒ ---
  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/admin/update-role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, newRole }),
        },
      );

      if (response.ok) {
        toast.success(`Đã chuyển vai trò thành ${newRole}!`, whiteToastConfig);
        setUsers(
          users.map((u) => (u.UserID === userId ? { ...u, Role: newRole } : u)),
        );
      } else {
        toast.error("Lỗi cập nhật!", whiteToastConfig);
      }
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      toast.error("Có lỗi xảy ra!", whiteToastConfig);
    }
  };

  // --- XÓA USER ---
  const handleDeleteUser = async (id) => {
    const isConfirm = window.confirm(
      "⚠️ Xóa thành viên này? Hành động này không thể hoàn tác!"
    );
    if (!isConfirm) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Đã xóa người dùng!", whiteToastConfig);
        setUsers(users.filter((user) => user.UserID !== id));
      } else {
        const data = await response.json();
        toast.error(data.message || "Xóa thất bại!", whiteToastConfig);
      }
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      toast.error("Có lỗi xảy ra!", whiteToastConfig);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-14 text-gray-900">
      <div className="container mx-auto px-4 lg:px-10">
        {/* Header Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-600 to-orange-500 px-10 py-12 flex justify-between items-center text-white">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <FontAwesomeIcon icon={faUserShield} />{" "}
                {currentUser?.Role === "Admin"
                  ? "Quản Trị Hệ Thống"
                  : "Khu Vực Nhân Viên"}
              </h1>
              <p className="text-red-100 mt-2 font-medium opacity-90">
                Xin chào, {currentUser?.FullName}
              </p>
            </div>
            <Link
              to="/"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-bold backdrop-blur-md transition-all flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Về trang chủ
            </Link>
          </div>

          {/* TAB CHUYỂN ĐỔI CHỨC NĂNG */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-5 text-sm font-black uppercase tracking-widest transition-all ${activeTab === "users" ? "text-orange-600 border-b-4 border-orange-500 bg-orange-50/50" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <FontAwesomeIcon icon={faUsers} className="mr-2" /> Quản lý thành
              viên ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("recipes")}
              className={`flex-1 py-5 text-sm font-black uppercase tracking-widest transition-all ${activeTab === "recipes" ? "text-orange-600 border-b-4 border-orange-500 bg-orange-50/50" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <FontAwesomeIcon icon={faUtensils} className="mr-2" /> Duyệt công
              thức ({pendingRecipes.length})
              {pendingRecipes.length > 0 && (
                <span className="ml-2 w-2 h-2 bg-red-500 inline-block rounded-full animate-ping"></span>
              )}
            </button>
          </div>
        </div>

        {/* Nội dung TAB */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 min-h-[400px]">
          {/* TAB 1: THÀNH VIÊN */}
          {activeTab === "users" && (
            <>
              <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter mb-8 px-2">
                Danh sách thành viên
              </h2>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="py-20 text-center">Đang tải...</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase">
                          Thành viên
                        </th>
                        <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase">
                          Email
                        </th>
                        <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase">
                          Vai trò
                        </th>
                        <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase text-center">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u.UserID}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="py-5 px-4 font-bold text-gray-800">
                            {u.FullName}
                          </td>
                          <td className="py-5 px-4 text-gray-600">{u.Email}</td>
                          <td className="py-5 px-4">
                            {/* DÙNG CUSTOM COMPONENT Ở ĐÂY ĐỂ ĐẸP HƠN */}
                            <CustomRoleDropdown
                              currentRole={u.Role || "User"}
                              onRoleChange={(newRole) => handleRoleChange(u.UserID, newRole)}
                              disabled={currentUser?.Role !== "Admin"}
                            />
                          </td>
                          <td className="py-5 px-4 text-center">
                            {currentUser?.Role === "Admin" && (
                              <button
                                onClick={() => handleDeleteUser(u.UserID)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* TAB 2: DUYỆT BÀI */}
          {activeTab === "recipes" && (
            <>
              <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter mb-8 px-2">
                Công thức chờ duyệt
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingRecipes.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-gray-500 font-bold">
                    Không có món ăn nào cần duyệt!
                  </div>
                ) : (
                  pendingRecipes.map((recipe) => (
                    <div
                      key={recipe.RecipeID}
                      className="border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-md transition bg-white"
                    >
                      <img
                        src={
                          recipe.ImageURL || "https://via.placeholder.com/300"
                        }
                        alt={recipe.Title}
                        className="w-full h-40 object-cover rounded-2xl mb-4"
                      />
                      <h3 className="font-black text-lg text-gray-800 line-clamp-1">
                        {recipe.Title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Tác giả:{" "}
                        <span className="font-bold">{recipe.FullName}</span>
                      </p>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleApproveRecipe(recipe.RecipeID)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-bold text-sm transition"
                        >
                          <FontAwesomeIcon icon={faCheck} className="mr-1" />{" "}
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleRejectRecipe(recipe.RecipeID)}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-xl font-bold text-sm transition"
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-1" /> Từ
                          chối
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}