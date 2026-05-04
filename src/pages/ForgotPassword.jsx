import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra rỗng
    if (!email) {
      setErrorMessage("Vui lòng nhập email của bạn.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // GỌI API THẬT ĐẾN BACKEND NODE.JS
      // *Lưu ý: Nếu Node.js của bạn chạy cổng khác (ví dụ 3000), nhớ sửa lại số 5000 ở link dưới nhé
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Email: email }), // Gửi email lên cho Node.js
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Gọi API thành công -> Hiện bảng xanh lá
        setStatus("success");
      } else {
        // API báo lỗi (Sai email, lỗi server...) -> Hiện chữ đỏ
        setErrorMessage(data.message || "Có lỗi xảy ra từ máy chủ.");
        setStatus("error");
      }
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      setErrorMessage(
        "Không thể kết nối đến Backend. Vui lòng kiểm tra lại Server.",
      );
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        {/* Nút Quay lại */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#f97316] transition-colors mb-6 text-sm font-medium"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Quay lại Đăng nhập
        </Link>

        {/* Tiêu đề */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#f97316] mb-3">
            Quên mật khẩu?
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed px-4">
            Hãy nhập email bạn đã đăng ký, chúng tôi sẽ gửi liên kết để đặt lại
            mật khẩu!
          </p>
        </div>

        {/* Form gửi email */}
        {status === "success" ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 className="text-green-800 font-bold text-lg mb-2">
              Đã gửi liên kết!
            </h3>
            <p className="text-green-600 text-sm">
              Vui lòng kiểm tra hộp thư của email{" "}
              <span className="font-bold">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none ${
                  status === "error"
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-[#f97316] focus:ring-4 focus:ring-orange-500/20"
                }`}
                disabled={status === "loading"}
              />
              {status === "error" && (
                <p className="text-red-500 text-xs font-bold mt-2 ml-1">
                  {errorMessage}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 bg-[#f97316] hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Gửi liên kết"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
