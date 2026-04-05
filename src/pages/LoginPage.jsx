import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  // 1. Thêm biến trạng thái Loading
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
      className: "rounded-2xl shadow-xl border border-gray-100 text-sm font-bold text-gray-800 mt-4",
    };

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email, Password: password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('loggedInUser', JSON.stringify(data.user));

        // CHỈ GIỮ LẠI THÔNG BÁO THÀNH CÔNG NÀY
        toast.success(data.message || "Đăng nhập thành công!", toastConfig);

        setTimeout(() => {
          if (data.user.Role === 'Admin') {
            navigate('/admin'); 
          } else {
            navigate('/');
          }
        }, 2000);

      } else {
        setIsLoading(false);
        // Cập nhật lỗi để hiển thị dòng chữ đỏ dưới ô mật khẩu
        setError(data.message || "Email hoặc Mật khẩu không chính xác!");
        
        // ĐÃ XÓA dòng toast.error ở đây!
      }
    } catch (err) {
      console.error("Lỗi API:", err);
      setIsLoading(false);
      // Cập nhật lỗi mạng để hiển thị dòng chữ đỏ
      setError("Không thể kết nối đến Server!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 min-h-[450px] flex flex-col justify-center">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-orange-500 mb-2">Đăng nhập</h2>
        </div>

        {/* 2. Điều kiện hiển thị: Nếu đang loading thì hiện Vòng xoay, nếu không thì hiện Form */}
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
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Vui lòng chờ trong giây lát...
              </p>
            </div>
          </div>
        ) : (
          <>
            <form className="space-y-4 animate-fade-in" onSubmit={handleLogin}>
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
                  placeholder="Nhập email của bạn..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">Mật khẩu</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-red-500 text-xs font-bold mt-1">{error}</p>}

              {/* QUÊN MẬT KHẨU */}
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
                <Link to="/register" className="text-orange-500 font-bold hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center animate-fade-in">
              <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-4">
                Bỏ qua, vào trang chủ
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}