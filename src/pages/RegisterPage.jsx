import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
// ĐÃ THÊM: Import icon con mắt từ FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  // ĐÃ THÊM: State quản lý ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Cấu hình giao diện Toast (Chỉ dùng cho lúc đăng ký thành công)
    const toastConfig = {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
      theme: "light",
      className:
        "rounded-2xl shadow-xl border border-gray-100 text-sm font-bold text-gray-800 mt-4",
    };

    // ĐÃ SỬA: Lấy dữ liệu theo thuộc tính "name" thay vì index
    // Lý do: Thêm nút bấm (con mắt) vào form sẽ làm lệch index e.target[x]
    const fullName = e.target.fullName.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    // 🛑 CHẶN MẬT KHẨU NGẮN
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    // 1. Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    // 2. Kiểm tra Username không được để trống
    if (!username.trim()) {
      setError("Vui lòng nhập ID người dùng!");
      return;
    }

    // 3. Gọi API để lưu vào Database thật (SQL Server)
    try {
      const userData = {
        FullName: fullName,
        Username: username,
        Email: email,
        Password: password,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // 4. Thành công -> Vẫn giữ lại toast xanh để báo hiệu chuyển trang
        toast.success("Đăng ký thành công! Đang chuyển hướng...", toastConfig);

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Lỗi từ backend (VD: Email hoặc Username đã tồn tại) -> Chỉ hiện chữ đỏ
        setError(data.message);
      }
    } catch (err) {
      console.error("Lỗi API:", err);
      setError("Không thể kết nối đến Server!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-orange-500 mb-2">Đăng ký</h2>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">
              Tên người dùng
            </label>
            <input
              type="text"
              name="fullName" // Thêm name để lấy dữ liệu chuẩn xác
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">
              ID người dùng (Username) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              placeholder="Nhập ID người dùng"
              required
              maxLength={16} // <-- Muốn giới hạn bao nhiêu ký tự thì sửa số này
              value={username}
              onChange={(e) => {
                // Chuyển thành chữ thường và CHỈ giữ lại a-z, 0-9
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
                setUsername(val);
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all font-medium"
            />
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
              ID viết liền, không dấu, chỉ gồm chữ thường và số (tối đa 16 ký tự).
            </p>
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
              placeholder="Nhập email của bạn"
            />
          </div>

          {/* Ô MẬT KHẨU CÓ CON MẮT */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Đổi type dựa theo state
                name="password"
                required
                minLength={8}
                // Thêm pr-12 (padding-right) để chữ gõ ra không bị đè lên icon con mắt
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
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
              Mật khẩu phải có ít nhất 8 ký tự.
            </p>
          </div>

          {/* Ô NHẬP LẠI MẬT KHẨU CÓ CON MẮT */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 focus:outline-none transition-colors"
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
              </button>
            </div>
          </div>

          {/* Hiển thị lỗi văn bản đỏ ngay trên nút bấm */}
          {error && (
            <p className="text-red-500 text-xs font-bold mt-1">{error}</p>
          )}

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
            <Link
              to="/login"
              className="text-orange-500 font-bold hover:underline"
            >
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