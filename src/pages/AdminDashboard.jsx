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
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [pendingRecipes, setPendingRecipes] = useState([]); // Chứa danh sách bài chờ duyệt
  const [loading, setLoading] = useState(true);

  // THÊM: Biến quản lý Tab đang mở ('users' hoặc 'recipes')
  const [activeTab, setActiveTab] = useState("users");

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

  useEffect(() => {
    fetchUsers();
    fetchPendingRecipes(); // Gọi thêm hàm lấy bài chờ duyệt
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
      toast.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // --- API LẤY BÀI CHỜ DUYỆT (MỚI) ---
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

  // --- API DUYỆT BÀI (MỚI) ---
  const handleApproveRecipe = async (id) => {
    // 1. Khai báo cấu hình giao diện cho Toast (Màu trắng, bo góc đẹp)
    const toastConfig = {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
      theme: "light",
      className:
        "rounded-2xl shadow-xl border border-gray-100 text-sm font-bold text-gray-800 mt-4",
    };

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
        // 2. Ép cái config vào hàm toast
        toast.success("Đã duyệt món ăn!", toastConfig);
        setPendingRecipes(pendingRecipes.filter((r) => r.RecipeID !== id));
      } else {
        toast.error("Lỗi duyệt bài!", toastConfig);
      }
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      toast.error("Có lỗi xảy ra!");
    }
  };

  // --- API TỪ CHỐI BÀI (MỚI) ---
  const handleRejectRecipe = async (id) => {
    // 1. Cấu hình Toast giao diện chuẩn KND Food
    const toastConfig = {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
      theme: "light",
      className:
        "rounded-2xl shadow-xl border border-gray-100 text-sm font-bold text-gray-800 mt-4",
    };

    // 2. Dùng SweetAlert2 để hỏi xác nhận thay cho window.confirm
    Swal.fire({
      title: "Xác nhận từ chối?",
      text: "Bài đăng này sẽ bị xóa vĩnh viễn và tác giả sẽ nhận được thông báo. Bạn chắc chắn chứ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Màu đỏ cho nút Xóa
      cancelButtonColor: "#9ca3af", // Màu xám cho nút Hủy
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      borderRadius: "20px",
      customClass: {
        popup: "rounded-3xl shadow-2xl border border-gray-100",
      },
    }).then(async (result) => {
      // Nếu người dùng bấm xác nhận
      if (result.isConfirmed) {
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
            // Cập nhật giao diện: Xóa bài đó khỏi danh sách chờ duyệt
            setPendingRecipes(pendingRecipes.filter((r) => r.RecipeID !== id));

            // Thông báo thành công với giao diện mới
            toast.success("Đã từ chối bài đăng!", toastConfig);
          } else {
            toast.error("❌ Có lỗi xảy ra khi thực hiện!", toastConfig);
          }
        } catch (error) {
          console.error(error);
          toast.error("❌ Lỗi kết nối đến máy chủ!", toastConfig);
        }
      }
    });
  };

  // --- CÁC HÀM CŨ GIỮ NGUYÊN ---
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
        toast.success(`Đã chuyển vai trò thành ${newRole}!`);
        setUsers(
          users.map((u) => (u.UserID === userId ? { ...u, Role: newRole } : u)),
        );
      } else {
        toast.error("Lỗi cập nhật!");
      }
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleDeleteUser = async (id) => {
    const isConfirm = window.confirm(
      "⚠️ Xóa thành viên này? Hành động này không thể hoàn tác!",
    );
    if (!isConfirm) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Đã xóa người dùng!");
        setUsers(users.filter((user) => user.UserID !== id));
      } else {
        const data = await response.json();
        toast.error(data.message || "Xóa thất bại!");
      }
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      toast.error("Có lỗi xảy ra!");
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
                            <select
                              value={u.Role || "User"}
                              onChange={(e) =>
                                handleRoleChange(u.UserID, e.target.value)
                              }
                              disabled={currentUser?.Role !== "Admin"} // KHÓA LẠI NẾU LÀ STAFF
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${currentUser?.Role !== "Admin" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <option value="User">User</option>
                              <option value="Staff">Staff</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-5 px-4 text-center">
                            {currentUser?.Role === "Admin" && ( // CHỈ ADMIN THẤY NÚT XÓA
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
