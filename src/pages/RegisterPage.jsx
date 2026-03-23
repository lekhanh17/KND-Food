import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify"; // Sử dụng toast thay cho Swal

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    // Lấy dữ liệu từ form
    const fullName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const confirmPassword = e.target[3].value;

    // 1. Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      toast.error("Mật khẩu không khớp!");
      return;
    }

    // 2. Lưu vào "Database giả"
    if (fullName && email && password) {
      const newUser = { fullName, email, password };
      localStorage.setItem('registeredUser', JSON.stringify(newUser));

      // 3. Thông báo thành công
      toast.success("Đăng ký thành công! Đang chuyển hướng tới trang Đăng nhập...", {
        position: "top-right",
        autoClose: 1500,
      });

      // 4. Chuyển sang trang Login sau 2 giây
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
        
        {/* Tiêu đề đồng bộ với Login */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-orange-500 mb-2">
            Đăng ký
          </h2>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">
              Họ và tên
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
              placeholder="Nhập email của bạn"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">
              Nhập lại mật khẩu
            </label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all" 
              placeholder="••••••••" 
            />
          </div>

          {/* Hiển thị lỗi văn bản nếu có */}
          {error && <p className="text-red-500 text-xs font-bold mt-1">{error}</p>}

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 mt-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 active:scale-[0.98]"
          >
            Tạo tài khoản
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-orange-500 font-bold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-4"
          >
            Bỏ qua, vào trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}