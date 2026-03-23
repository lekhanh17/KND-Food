import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function LoginPage() {
  
  const handleLogin = (e) => {
    e.preventDefault();
    
    const emailInput = e.target[0].value;
    const passwordInput = e.target[1].value;

    const dbString = localStorage.getItem('registeredUser');
    
    if (dbString) {
      const registeredUser = JSON.parse(dbString);

      if (registeredUser.email === emailInput && registeredUser.password === passwordInput) {
        localStorage.setItem('user', JSON.stringify({ FullName: registeredUser.fullName }));
        
        toast.success(`Chào mừng ${registeredUser.fullName}!`);

        setTimeout(() => {
          window.location.href = "/"; 
        }, 1500);

      } else {
        toast.error("Email hoặc mật khẩu không chính xác!");
      }
    } else {
      toast.warning("Tài khoản này chưa được đăng ký!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
        
        {/* Tiêu đề */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-center text-orange-500 mb-2">
            Đăng nhập
          </h2>
        </div>

        {/* Form đăng nhập */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all"
              placeholder="Hãy nhập email của bạn"
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

          <div className="text-right">
            <a href="#" className="text-sm text-orange-500 hover:underline font-medium">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 mt-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
          >
            Đăng nhập
          </button>
        </form>

        {/* Chuyển sang Đăng ký - Style giống trang Register */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-orange-500 font-bold hover:underline">
              Đăng ký
            </Link>
          </p>
        </div>

        {/* Nút quay lại */}
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