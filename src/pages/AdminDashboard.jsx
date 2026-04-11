import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUserShield, faUsers, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Gọi API lấy danh sách người dùng
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Vui lòng đăng nhập lại!");
        navigate('/login');
        return;
      }

      // THÊM HEADER VÀO ĐÂY
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
         if(response.status === 401 || response.status === 403) {
            toast.error("Phiên đăng nhập hết hạn hoặc bạn không có quyền!");
            navigate('/login');
            return;
         }
         throw new Error('Lỗi mạng');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi fetch API:", error);
      toast.error("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  // 2. Hàm CẬP NHẬT VAI TRÒ
  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      // THÊM HEADER VÀO ĐÂY
      const response = await fetch(`http://localhost:5000/api/admin/update-role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, newRole }),
      });

      if (response.ok) {
        toast.success(`Đã chuyển vai trò thành ${newRole}!`);
        setUsers(users.map(u => u.UserID === userId ? { ...u, Role: newRole } : u));
      } else {
        const data = await response.json();
        toast.error("Lỗi: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi cập nhật vai trò:", error);
      toast.error("Không thể kết nối đến Server!");
    }
  };

  // 3. Hàm Xóa Người Dùng
  const handleDeleteUser = async (id) => {
    const isConfirm = window.confirm("⚠️ Xóa thành viên này? Hành động này không thể hoàn tác!");
    if (!isConfirm) return;

    try {
      const token = localStorage.getItem('token');
      // THÊM HEADER VÀO ĐÂY
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Đã xóa người dùng!");
        setUsers(users.filter(user => user.UserID !== id));
      } else {
        const data = await response.json();
        toast.error(data.message || "Xóa thất bại!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối Server!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-14 text-gray-900">
      <div className="container mx-auto px-4 lg:px-10">
        
        {/* Header Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-600 to-orange-500 px-10 py-12 flex justify-between items-center text-white">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <FontAwesomeIcon icon={faUserShield} /> Quản Trị Hệ Thống
              </h1>
              <p className="text-red-100 mt-2 font-medium opacity-90">Hệ thống quản lý nội dung và người dùng KND Food</p>
            </div>
            <Link to="/" className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-bold backdrop-blur-md transition-all flex items-center gap-2">
              <FontAwesomeIcon icon={faArrowLeft} /> Về trang chủ
            </Link>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
            <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-orange-600 uppercase tracking-wider">Thành viên</h3>
                  <p className="text-4xl font-black text-gray-800 mt-2">{loading ? "..." : users.length}</p>
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
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter mb-8 px-2">Danh sách thành viên</h2>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-gray-400 font-medium">Đang tải dữ liệu...</div>
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
                  {users.map((u) => (
                    <tr key={u.UserID} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="py-5 px-4 text-gray-500 font-bold">#{u.UserID}</td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black overflow-hidden">
                            {u.Avatar ? <img src={u.Avatar} className="w-full h-full object-cover" /> : u.FullName?.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-800">{u.FullName}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-gray-600 font-medium">{u.Email}</td>
                      <td className="py-5 px-4">
                        {/* --- CHỖ THAY ĐỔI: TỪ BADGE SANG SELECT --- */}
                        <select
                          value={u.Role || 'User'}
                          onChange={(e) => handleRoleChange(u.UserID, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-none cursor-pointer outline-none transition-all
                            ${u.Role === 'Admin' ? 'bg-red-100 text-red-600' : 
                              u.Role === 'Staff' ? 'bg-blue-100 text-blue-600' : 
                              'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          <option value="User">User</option>
                          <option value="Staff">Staff</option>
                          <option value="Admin">Admin</option>
                        </select>
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
          </div>
        </div>
      </div>
    </div>
  );
}