import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminRoute({ children }) {
  // 1. Đọc đúng nơi thông tin đăng nhập
  const savedUser = localStorage.getItem('loggedInUser');
  const user = savedUser ? JSON.parse(savedUser) : null;

  // 2. Kiểm tra điều kiện: Nếu ko có User hoặc Role ko phải Admin/Staff
  if (!user || (user.Role !== 'Admin' && user.Role !== 'Staff')) {
    toast.error("Truy cập bị từ chối! Bạn không có quyền quản trị.", {
        toastId: 'admin-error' 
    });
    return <Navigate to="/" replace />;
  }
  // Nếu đc thì cho phép vào xem nội dung bên trong
  return children;
}