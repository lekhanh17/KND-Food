import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const loginId = e.target.loginId.value.trim().toLowerCase();
    const password = e.target.password.value;

    const toastConfig = {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
      theme: "light",
      className:
        "rounded-2xl shadow-xl border border-gray-100 text-sm font-bold text-gray-800 mt-4",
    };

    if (password.length < 8) {
      setIsLoading(false);
      setError("Mật khẩu phải từ 8 ký tự trở lên!");
      toast.error("Sai định dạng mật khẩu!", toastConfig);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identifier: loginId, Password: password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));

        toast.success(data.message || "Đăng nhập thành công!", toastConfig);

        setTimeout(() => {
          const userRole = data.user.Role.toUpperCase();

          if (userRole === "ADMIN" || userRole === "STAFF") {
            navigate("/"); 
          } else {
            navigate("/"); 
          }
        }, 2000);
      } else {
        setIsLoading(false);
        setError(data.message || "Thông tin đăng nhập không chính xác!");
      }
    } catch (err) {
      console.error("Lỗi API:", err);
      setIsLoading(false);
      setError("Không thể kết nối đến Server!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="relative bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 min-h-[450px] flex flex-col justify-center">
        
        <Link
          to="/"
          className="absolute top-6 left-6 w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-all hover:-translate-x-1"
          title="Về trang chủ"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor" 
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>

        <div className="text-center mb-8 mt-2">
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
            {/* ĐÃ SỬA: Thêm autoComplete="off" vào form để cấm tự động điền */}
            <form className="space-y-4 animate-fade-in" onSubmit={handleLogin} autoComplete="off">
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">
                  Email hoặc ID người dùng
                </label>
                <input
                  type="text"
                  name="loginId"
                  required
                  autoComplete="off" // Cấm gợi ý email cũ
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
                  placeholder="Nhập email hoặc ID..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={8}
                    autoComplete="new-password" // ĐÃ SỬA: Tuyệt chiêu lừa trình duyệt đây là mật khẩu mới để nó không thả tooltip gợi ý
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 focus:outline-none transition-colors"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </button>
                </div>
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