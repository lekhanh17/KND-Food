import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminRoute({ children }) {
  // 1. Đọc đúng tên két sắt chứa thông tin đăng nhập
  const savedUser = localStorage.getItem('loggedInUser');
  const user = savedUser ? JSON.parse(savedUser) : null;

  // 2. Kiểm tra xem có đúng là Admin không (Nhớ Role viết hoa chữ R)
  if (!user || user.Role !== 'Admin') {
    // Nếu không phải Admin thì báo lỗi và đá về trang chủ
    toast.error("Truy cập bị từ chối! Bạn không phải là Admin.", {
        toastId: 'admin-error' // Thêm cái này để tránh nó hiện 2-3 thông báo cùng lúc
    });
    return <Navigate to="/" replace />;
  }

  // Nếu qua ải thì cho phép vào xem nội dung bên trong (children)
  return children;
}