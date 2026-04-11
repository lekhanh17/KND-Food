import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminRoute({ children }) {
  // 1. Đọc đúng tên két sắt chứa thông tin đăng nhập
  const savedUser = localStorage.getItem('loggedInUser');
  const user = savedUser ? JSON.parse(savedUser) : null;

  // 2. Kiểm tra điều kiện: Nếu ko có user HOẶC (Role không phải Admin & cũng không phải Staff)
  if (!user || (user.Role !== 'Admin' && user.Role !== 'Staff')) {
    // Đổi câu thông báo cho phù hợp với cả 2 role
    toast.error("Truy cập bị từ chối! Bạn không có quyền quản trị.", {
        toastId: 'admin-error' 
    });
    return <Navigate to="/" replace />;
  }

  // Nếu qua ải thì cho phép vào xem nội dung bên trong (children)
  return children;
}