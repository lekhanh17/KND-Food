import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function UserPage() {
  const navigate = useNavigate();

  // 1. Chỉ dùng duy nhất một nguồn sự thật là 'loggedInUser'
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Khởi tạo form dựa trực tiếp trên dữ liệu user hiện tại
  const [formFullName, setFormFullName] = useState(() => user?.FullName || '');
  const [formEmail, setFormEmail] = useState(() => user?.Email || '');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const trimmedName = formFullName.trim();
    const trimmedEmail = formEmail.trim();

    if (!trimmedName || !trimmedEmail) {
      toast.warning('Vui lòng điền đủ họ tên và email.');
      return;
    }

    try {
      // 3. Gửi dữ liệu cập nhật xuống SQL Server qua Node.js
      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: user.UserID,
          FullName: trimmedName,
          Email: trimmedEmail
        })
      });

      if (response.ok) {
        // 4. Cập nhật lại LocalStorage để đồng bộ toàn bộ hệ thống (Navbar, Dashboard...)
        const updatedUser = { ...user, FullName: trimmedName, Email: trimmedEmail };
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

        // 5. Cập nhật State để giao diện trang này thay đổi ngay
        setUser(updatedUser);
        
        // 6. Bắn tín hiệu cho Navbar biết để đổi tên hiển thị ngay lập tức
        window.dispatchEvent(new Event('user-changed'));

        toast.success('🎉 Cập nhật thông tin thành công!');
        
        // Về trang chủ sau 2s để người dùng thấy kết quả
        setTimeout(() => navigate('/'), 2000);
      } else {
        const data = await response.json();
        toast.error('❌ Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error('❌ Không thể kết nối đến Server!');
    }
  };

  // Nếu chưa đăng nhập thì hiện màn hình thông báo
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
          <p className="text-gray-500 mb-6">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="px-5 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition">Đăng nhập</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-14 text-gray-800">
      <div className="container mx-auto px-4 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-400 mb-4 px-2">Danh mục tài khoản</h2>
              <ul className="space-y-1">
                <li className="px-4 py-2 rounded-xl bg-orange-500 text-white font-medium">
                  Thông tin tài khoản
                </li>
                {['Món ăn yêu thích', 'Đã follow', 'Video/ảnh đã đăng', 'Video đã lưu'].map((item) => (
                  <li key={item} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-500 cursor-pointer transition">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-orange-500 px-8 py-6">
                <h1 className="text-2xl font-bold text-white">Thông tin tài khoản</h1>
                <p className="text-orange-100 mt-1">Chào mừng {user.FullName?.split(' ')[0]} quay trở lại!</p>
              </div>

              <div className="p-8">
                {/* Hiển thị thông tin hiện tại */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Họ tên hiện tại</h3>
                    <p className="text-gray-800 font-semibold">{user.FullName}</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email đăng ký</h3>
                    <p className="text-gray-800 font-semibold">{user.Email}</p>
                  </div>
                </div>

                {/* Form cập nhật */}
                <form onSubmit={handleUpdateProfile} className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600 px-1">Cập nhật họ tên mới</label>
                      <input
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        placeholder="Nhập họ tên"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600 px-1">Cập nhật email mới</label>
                      <input
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 active:scale-95"
                  >
                    Lưu tất cả thay đổi
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}