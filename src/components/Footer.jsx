import { Link } from "react-router-dom";
import Swal from "sweetalert2";

// ==============================================
// CẤU HÌNH SWEETALERT DẠNG TOAST (HIỆN Ở GÓC, TỰ TẮT)
// ==============================================
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export default function Footer() {
  // Hàm cuộn lên đầu trang mượt mà khi bấm chuyển trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hàm xử lý nút chuyển ngôn ngữ
  const handleLanguageChange = (lang) => {
    if (lang === 'EN') {
      Toast.fire({ 
        icon: "info", 
        title: "Tính năng Tiếng Anh đang được phát triển!" 
      });
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* NỬA TRÊN: THÔNG TIN LIÊN HỆ & CHÍNH SÁCH */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
          
          {/* CỘT 1: Logo & Thông tin liên hệ */}
          <div className="space-y-6">
            
            <div>
              <h4 className="text-gray-900 font-bold text-sm mb-2 uppercase tracking-wider">
                Tổng đài hỗ trợ
              </h4>
              <p className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                Thứ 2 - Chủ Nhật (8:00 - 23:00)
              </p>
              {/* ĐÃ SỬA: Thêm href="tel:..." để bấm gọi được */}
              <a 
                href="tel:19000019" 
                className="text-[#f97316] font-black text-2xl tracking-wide block hover:underline"
              >
                1900 0019
              </a>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-bold text-gray-700 text-sm block mb-1">
                  Email:
                </span>
                {/* Thêm href="mailto:..." để bấm gửi mail được */}
                <a 
                  href="mailto:lekhanhlux29@gmail.com" 
                  className="text-sm text-gray-500 block hover:text-[#f97316] transition-colors"
                >
                  lekhanhlux29@gmail.com
                </a>
              </div>
              <div>
                <span className="font-bold text-gray-700 text-sm block mb-1">
                  Địa chỉ:
                </span>
                {/* Thêm link Google Maps để bấm vào xem bản đồ */}
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Tầng+17,+Tòa+nhà+LandMark+81+Skyview,+720A+Điện+Biên+Phủ,+Phường+Thạnh+Mỹ+Tây,+Hồ+Chí+Minh" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 leading-relaxed block max-w-xs hover:text-[#f97316] transition-colors"
                >
                  Tầng 17, Tòa nhà LandMark 81 Skyview, 720A Điện Biên Phủ, Phường Thạnh Mỹ Tây, Hồ Chí Minh
                </a>
              </div>
            </div>
          </div>

          {/* CỘT 2: Link Dành cho Khách hàng & Tác giả */}
          <div className="space-y-8">
            <div>
              <h4 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-wider">
                Dành cho Khách hàng
              </h4>
              <ul className="space-y-3">
                {/* Thêm onClick={scrollToTop} vào tất cả các thẻ Link */}
                <li>
                  <Link
                    to="/terms"
                    onClick={scrollToTop}
                    className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                  >
                    Điều khoản áp dụng cho người dùng
                  </Link>
                </li>
                <li>
                  <Link
                    to="/guide"
                    onClick={scrollToTop}
                    className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                  >
                    Hướng dẫn tìm kiếm công thức
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-wider">
                Dành cho Tác giả
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/author-rules"
                    onClick={scrollToTop}
                    className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                  >
                    Quy định chia sẻ công thức
                  </Link>
                </li>
                <li>
                  <Link
                    to="/copyright"
                    onClick={scrollToTop}
                    className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                  >
                    Chính sách bản quyền hình ảnh
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* CỘT 3: Link Về công ty */}
          <div>
            <h4 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-wider">
              Về Chúng Tôi
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  onClick={scrollToTop}
                  className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  onClick={scrollToTop}
                  className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                >
                  Chính sách bảo mật thông tin
                </Link>
              </li>
              <li>
                <Link
                  to="/complaints"
                  onClick={scrollToTop}
                  className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                >
                  Cơ chế giải quyết khiếu nại
                </Link>
              </li>
              <li>
                <Link
                  to="/standards"
                  onClick={scrollToTop}
                  className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                >
                  Tiêu chuẩn kiểm duyệt nội dung
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-200 my-8" />

        {/* NỬA DƯỚI: BẢN QUYỀN, NGÔN NGỮ & MẠNG XÃ HỘI */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Bản quyền */}
          <p className="text-gray-400 text-sm font-medium order-3 md:order-1 text-center md:text-left">
            © {new Date().getFullYear()} KND Food. All rights reserved.
          </p>

          {/* Group: Ngôn ngữ + Mạng xã hội */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 order-1 md:order-2">
            
            {/* Phần Ngôn ngữ */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider hidden sm:block">
                Ngôn ngữ:
              </span>
              <div className="flex items-center gap-3">
                {/* Thêm sự kiện báo lỗi khi click */}
                <button 
                  onClick={() => handleLanguageChange('VN')}
                  className="text-sm font-black text-[#f97316] hover:scale-110 transition-transform"
                >
                  VN
                </button>
                <button 
                  onClick={() => handleLanguageChange('EN')}
                  className="text-sm font-bold text-gray-400 hover:text-[#f97316] hover:scale-110 transition-all"
                >
                  EN
                </button>
              </div>
            </div>

            {/* Dấu gạch chia cách (Chỉ hiện trên màn hình lớn) */}
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>

            {/* Phần Mạng xã hội */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider hidden sm:block">
                Theo dõi chúng tôi:
              </span>
              <div className="flex gap-3">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/yungluxx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/_lekhanh29/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#c71267] hover:text-white transition-all shadow-sm"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                {/* Tiktok */}
                <a
                  href="https://www.tiktok.com/@gokku_sann?_r=1&_d=secCgYIASAHKAESPgo8RsEVxAyggYzVUH6sdnoStb5vE0Ky8CQ%2Fysvsrc8GJcrE48LEJfvW8CuLx0A6uNcZE8E7Ua5bwScYbAC4GgA%3D&_svg=1&checksum=4331b10bf679eb33a52b42e26b6c782401d558614a52cfe85ebe3cd80451e071&item_author_type=1&reflow_sign_scene=7&rgssign=8.1.946AHKz9ytmtFobW-hOAPg&sec_uid=MS4wLjABAAAA2ibThCJoDyylBw5tCDiXiX51wq3t2nWRfpTHy_Aemhco0CpYHA0qSG9O8nF2WF6O&sec_user_id=MS4wLjABAAAA2ibThCJoDyylBw5tCDiXiX51wq3t2nWRfpTHy_Aemhco0CpYHA0qSG9O8nF2WF6O&share_app_id=1180&share_author_id=7232063634003182597&share_link_id=B826F27A-D93E-4861-8F19-7E259D76CCAD&share_region=VN&share_scene=1&sharer_language=vi&social_share_type=5&source=h5_t&timestamp=1775378892&tt_from=copy&u_code=e805gkfl5h3g1k&ug_btm=b8727%2Cb0&user_id=7232063634003182597&utm_campaign=client_share&utm_medium=ios&utm_source=copy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition-all shadow-sm"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 448 512"
                    className="w-4 h-4"
                  >
                    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
                  </svg>
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  );
}