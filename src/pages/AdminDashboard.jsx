import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUserShield, faUsers, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Gọi API lấy danh sách người dùng TỪ NODE.JS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Gõ cửa nhà anh bồi bàn (Backend) ở cổng 5000
        const response = await fetch('http://localhost:5000/api/users');
        if (!response.ok) {
          throw new Error('Lỗi mạng');
        }
        const data = await response.json();
        setUsers(data); // Đổ dữ liệu vào State
      } catch (error) {
        console.error("Lỗi fetch API:", error);
        toast.error("Không thể tải danh sách người dùng từ Server!");
      } finally {
        setLoading(false); // Tắt hiệu ứng tải
      }
    };

    fetchUsers();
  }, []); // [] nghĩa là chỉ chạy 1 lần khi mở trang

  // 2. Hàm Xóa (Tạm thời chỉ xóa trên giao diện để test)
  // 2. Hàm Xóa Người Dùng (Đã kết nối API)
  const handleDeleteUser = async (id) => {
    // Thêm một hộp thoại xác nhận cho chắc ăn, tránh lỡ tay bấm nhầm
    const isConfirm = window.confirm("⚠️ Bạn có chắc chắn muốn xóa thành viên này không? Hành động này không thể hoàn tác!");
    
    if (!isConfirm) {
      return; // Nếu bấm Cancel thì dừng lại luôn, không làm gì cả
    }

    try {
      // Gõ cửa nhà bếp bằng phương thức DELETE, trỏ đích danh vào ID cần xóa
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Đã xóa người dùng khỏi hệ thống!");
        
        // CẬP NHẬT LẠI GIAO DIỆN CỰC NHANH:
        // Lọc danh sách users hiện tại, giữ lại những người KHÁC với id vừa xóa
        setUsers(users.filter(user => user.UserID !== id));
      } else {
        const data = await response.json();
        toast.error("❌ Lỗi: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi kết nối khi xóa:", error);
      toast.error("Không thể kết nối đến Server!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-14">
      <div className="container mx-auto px-4 lg:px-10">
        
        {/* Header Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-600 to-orange-500 px-10 py-12 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <FontAwesomeIcon icon={faUserShield} /> Quản Trị Hệ Thống
              </h1>
              <p className="text-red-100 mt-2 font-medium opacity-90">Hệ thống quản lý nội dung và người dùng KND Food</p>
            </div>
            <Link to="/" className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-bold backdrop-blur-md transition-all flex items-center gap-2">
              <FontAwesomeIcon icon={faArrowLeft} /> Về trang chủ
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
            <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 group hover:scale-105 transition-transform">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-orange-600 uppercase tracking-wider">Người dùng</h3>
                  {loading ? (
                    <p className="text-xl font-bold mt-2">Đang tải...</p>
                  ) : (
                    <p className="text-4xl font-black text-gray-800 mt-2">{users.length}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-orange-200">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Danh sách thành viên</h2>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-gray-400 font-medium animate-pulse">
                Đang tải dữ liệu từ Database...
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">ID</th>
                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">Thành viên</th>
                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">Email</th>
                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">Vai trò</th>
                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="py-5 px-4 text-gray-500 font-bold">#{u.UserID}</td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black">
                            {u.FullName ? u.FullName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="font-bold text-gray-800">{u.FullName}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-gray-600 font-medium">{u.Email}</td>
                      <td className="py-5 px-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          (u.Role && u.Role.toLowerCase() === 'admin') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {u.Role || 'user'}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-center">
                        <button 
                          onClick={() => handleDeleteUser(u.UserID)}
                          className="w-9 h-9 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {!loading && users.length === 0 && (
              <div className="py-20 text-center text-gray-400 font-medium">
                Chưa có dữ liệu nào trong bảng Users.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}