import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function UserPage() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- STATE ĐIỀU KHIỂN GIAO DIỆN ---
  const [isEditingProfile, setIsEditingProfile] = useState(false); // Trạng thái: Đang sửa trực tiếp
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false); // Trạng thái: Mở popup đổi pass

  // --- STATE CHO FORM SỬA THÔNG TIN ---
  const [formFullName, setFormFullName] = useState(() => user?.FullName || '');
  const [formEmail, setFormEmail] = useState(() => user?.Email || '');

  // --- STATE CHO POPUP ĐỔI MẬT KHẨU ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // 1. Hàm Xử lý Hủy Sửa (Nút CANCEL)
  const handleCancelEdit = () => {
    // Phục hồi lại tên/email cũ nếu họ gõ linh tinh rồi bấm Hủy
    setFormFullName(user.FullName);
    setFormEmail(user.Email);
    setIsEditingProfile(false); // Đóng chế độ sửa
  };

  // 2. Hàm xử lý Lưu Hồ sơ (Nút SAVE CHANGES)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const trimmedName = formFullName.trim();
    const trimmedEmail = formEmail.trim();

    if (!trimmedName || !trimmedEmail) {
      toast.warning('Vui lòng điền đủ họ tên và email.');
      return;
    }

    try {
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
        const updatedUser = { ...user, FullName: trimmedName, Email: trimmedEmail };
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event('user-changed'));
        
        toast.success('🎉 Cập nhật thông tin thành công!');
        setIsEditingProfile(false); // Trở về trạng thái Chỉ xem sau khi lưu xong
      } else {
        const data = await response.json();
        toast.error('❌ Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('❌ Không thể kết nối đến Server!');
    }
  };

  // Hàm dọn dẹp form đổi pass
  const closePasswordModal = () => {
    setIsChangePasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // 3. Hàm xử lý Đổi Mật Khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('⚠️ Mật khẩu mới nhập lại không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('⚠️ Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: user.UserID,
          CurrentPassword: currentPassword,
          NewPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 ' + data.message);
        closePasswordModal(); 
      } else {
        toast.error('❌ ' + data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('❌ Không thể kết nối đến Server!');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
          <p className="text-gray-500 mb-6">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
          <Link to="/login" className="px-5 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-14 text-gray-800">
      <div className="container mx-auto px-4 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* SIDEBAR */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-400 mb-4 px-2">Danh mục tài khoản</h2>
              <ul className="space-y-1">
                <li className="px-4 py-3 rounded-xl bg-orange-500 text-white font-bold shadow-md shadow-orange-100 cursor-pointer">
                  Thông tin tài khoản
                </li>
                {['Món ăn yêu thích', 'Đã follow', 'Video/ảnh đã đăng', 'Video đã lưu'].map((item) => (
                  <li key={item} className="px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-orange-50 hover:text-orange-500 cursor-pointer transition">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-8 py-10 relative">
                <h1 className="text-3xl font-black text-white tracking-tight">Hồ sơ cá nhân</h1>
                <p className="text-orange-100 mt-2 font-medium opacity-90">Quản lý thông tin và bảo mật tài khoản KND Food của bạn</p>
              </div>

              <div className="p-8">
                {/* Header Hành động */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Thông tin liên hệ</h2>
                  
                  {/* Nếu KHÔNG phải đang sửa thì mới hiện 2 nút này */}
                  {!isEditingProfile && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-orange-200 active:scale-95 uppercase tracking-wide"
                      >
                        ✎ Chỉnh sửa thông tin
                      </button>
                      <button 
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="px-5 py-2.5 bg-gray-800 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wide"
                      >
                        Đổi mật khẩu
                      </button>
                    </div>
                  )}
                </div>

                {/* --- KHU VỰC HIỂN THỊ DỮ LIỆU (THAY ĐỔI THEO TRẠNG THÁI) --- */}
                {isEditingProfile ? (
                  /* TRẠNG THÁI 1: ĐANG SỬA (Form nhập liệu viền cam) */
                  <form onSubmit={handleUpdateProfile} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 animate-in fade-in duration-300">
                    <div className="space-y-5 mb-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700">Họ Tên</label>
                        <input
                          value={formFullName}
                          onChange={(e) => setFormFullName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all font-medium text-gray-800"
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button type="submit" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition shadow-md shadow-orange-200 active:scale-95 uppercase text-sm">
                        Lưu Thay Đổi
                      </button>
                      <button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-white text-orange-500 border border-orange-500 rounded-xl font-bold hover:bg-orange-50 transition active:scale-95 uppercase text-sm">
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  /* TRẠNG THÁI 2: CHỈ XEM (Chữ tĩnh) */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">FullName</p>
                      <p className="text-lg font-black text-gray-800">{user.FullName}</p>
                    </div>
                    
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-lg font-black text-gray-800">{user.Email}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL ĐỔI MẬT KHẨU (Vẫn giữ dạng Popup cho bảo mật) */}
      {/* ========================================================= */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-800">Đổi mật khẩu</h3>
              <button 
                onClick={closePasswordModal}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-600">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="Nhập mật khẩu cũ"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-600">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="Ít nhất 6 ký tự"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-600">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50 focus:bg-white"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
              <button type="submit" className="w-full mt-4 px-8 py-3.5 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200 active:scale-[0.98] uppercase">
                Xác nhận đổi
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}