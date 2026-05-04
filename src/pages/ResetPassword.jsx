import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  // Lấy token và email từ trên thanh URL xuống
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      setStatus("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      // GỌI API THẬT ĐỂ ĐỔI MẬT KHẨU
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Gửi 3 thông tin cần thiết lên Node.js
          body: JSON.stringify({
            email: email,
            token: token,
            newPassword: password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Đổi mật khẩu thành công! Đang chuyển hướng...");

        // Đợi 2 giây cho người dùng đọc chữ Thành công rồi mới đá về trang Login
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.message || "Có lỗi xảy ra, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      setStatus("error");
      setMessage("Không thể kết nối đến máy chủ!");
    }
  };

  // Nếu ai đó tự gõ link mà không có mã token thì chặn lại
  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h2 className="text-red-500 font-bold text-xl">
          Đường dẫn không hợp lệ hoặc đã hết hạn!
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#f97316] mb-3">
            Tạo mật khẩu mới
          </h1>
          <p className="text-gray-500 text-sm">
            Vui lòng nhập mật khẩu mới cho tài khoản <br />
            <span className="font-bold text-gray-700">{email}</span>
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center animate-fade-in">
            <h3 className="text-green-800 font-bold text-lg">{message}</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none border-gray-200 focus:border-[#f97316] focus:ring-4 focus:ring-orange-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu..."
                className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none border-gray-200 focus:border-[#f97316] focus:ring-4 focus:ring-orange-500/20"
                required
              />
              {status === "error" && (
                <p className="text-red-500 text-xs font-bold mt-2 ml-1">
                  {message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full mt-4 py-3.5 bg-[#f97316] hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {status === "loading" ? "Đang xử lý..." : "Lưu mật khẩu mới"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
