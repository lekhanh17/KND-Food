import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  // Lấy đường dẫn hiện tại
  const { pathname } = useLocation();

  useEffect(() => {
    // Mỗi khi đường dẫn thay đổi, bắt trình duyệt cuộn lên đầu trang
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" 
    });
  }, [pathname]);

  return null;
}