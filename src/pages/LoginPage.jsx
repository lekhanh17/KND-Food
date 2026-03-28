import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      // Gọi API kiểm tra đăng nhập
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email, Password: password })
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Lưu thông tin user vào thẻ nhớ trình duyệt (LocalStorage)
        // Lưu ý: data.user là thông tin từ SQL Server (không chứa password)
        localStorage.setItem('loggedInUser', JSON.stringify(data.user));

        // 2. Báo xanh lá
        toast.success("🎉 " + data.message, {
          position: "top-right",
          autoClose: 1500,
        });

        // 3. Phân luồng đẳng cấp: Admin thì vào trang Quản trị, User về Trang chủ
        setTimeout(() => {
          if (data.user.Role === 'Admin') {
            navigate('/admin'); 
          } else {
            navigate('/');
          }
        }, 1500);

      } else {
        // Sai pass hoặc sai email
        setError(data.message);
        toast.error("❌ " + data.message);
      }
    } catch (err) {
      console.error("Lỗi API:", err);
      setError("Không thể kết nối đến Server!");
      toast.error("❌ Lỗi mạng!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-orange-500 mb-2">Đăng nhập</h2>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
              placeholder="Nhập email của bạn"
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

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 mt-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 active:scale-[0.98]"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-orange-500 font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-4">
            Bỏ qua, vào trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}