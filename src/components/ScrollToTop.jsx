import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  // Lấy đường dẫn hiện tại (ví dụ: /recipes, /profile,...)
  const { pathname } = useLocation();

  useEffect(() => {
    // Mỗi khi đường dẫn thay đổi, ép trình duyệt cuộn mượt mà lên tọa độ (0, 0)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // Nếu không thích trượt mượt mà muốn lên thẳng đứng thì xóa dòng này đi
    });
  }, [pathname]);

  return null; // Component này chạy ngầm, không hiển thị gì ra giao diện cả
}