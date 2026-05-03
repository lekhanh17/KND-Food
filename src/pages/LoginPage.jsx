import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const email = e.target[0].value;
    const password = e.target[1].value;

    const toastConfig = {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
      theme: "light",
      className:
        "rounded-2xl shadow-xl border border-gray-100 text-sm font-bold text-gray-800 mt-4",
    };

    // 🛑 CHẶN MẬT KHẨU NGẮN (LỚP KHIÊN REACT)
    if (password.length < 8) {
      setIsLoading(false); // Tắt loading đi để user còn nhập lại
      setError("Mật khẩu phải từ 8 ký tự trở lên!");
      toast.error("Sai định dạng mật khẩu!", toastConfig);
      return;
    }

    try {
      const response = await fetch(
        "[https://knd-food-be.onrender.com](https://knd-food-be.onrender.com)/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Email: email, Password: password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // === PHẦN QUAN TRỌNG NHẤT: LƯU TOKEN VÀ USER ===
        localStorage.setItem("token", data.token); // Lưu token để dùng cho các API sau này
        localStorage.setItem("loggedInUser", JSON.stringify(data.user)); // Lưu thông tin user

        toast.success(data.message || "Đăng nhập thành công!", toastConfig);

        setTimeout(() => {
          // CHỈNH SỬA LOGIC ĐIỀU HƯỚNG:
          // Ép kiểu về chữ hoa để so sánh cho chính xác (Admin hoặc Staff)
          const userRole = data.user.Role.toUpperCase();

          if (userRole === "ADMIN" || userRole === "STAFF") {
            navigate("/"); // Admin và Nhân viên đều vào trang chủ
          } else {
            navigate("/"); // User về trang chủ
          }
        }, 2000);
      } else {
        setIsLoading(false);
        setError(data.message || "Email hoặc Mật khẩu không chính xác!");
      }
    } catch (err) {
      console.error("Lỗi API:", err);
      setIsLoading(false);
      setError("Không thể kết nối đến Server!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 min-h-[450px] flex flex-col justify-center">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-orange-500 mb-2">Đăng nhập</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-10 animate-fade-in space-y-5">
            <div className="w-20 h-20 border-8 border-gray-100 border-t-[#f97316] rounded-full animate-spin mx-auto shadow-inner"></div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                Đang đăng nhập...
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Đang xác thực thông tin của bạn!
              </p>
            </div>
          </div>
        ) : (
          <>
            <form className="space-y-4 animate-fade-in" onSubmit={handleLogin}>
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
                  placeholder="Nhập email của bạn..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  minLength={8} // 🛑 LỚP KHIÊN HTML5
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold mt-1">{error}</p>
              )}

              <div className="flex justify-end mt-2 mb-6">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#f97316] hover:text-orange-600 hover:underline transition-all"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 mt-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 active:scale-[0.98]"
              >
                Đăng nhập
              </button>
            </form>

            <div className="mt-8 text-center animate-fade-in">
              <p className="text-sm text-gray-500">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-orange-500 font-bold hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
