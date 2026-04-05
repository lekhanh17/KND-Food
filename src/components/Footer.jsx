import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-12 mt-auto font-sans">
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
              <p className="text-[#f97316] font-black text-2xl tracking-wide">
                1900.6408
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-bold text-gray-700 text-sm block mb-1">
                  Email:
                </span>
                <span className="text-sm text-gray-500 block">
                  lekhanhlux29gmail.com
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-700 text-sm block mb-1">
                  Địa chỉ:
                </span>
                <span className="text-sm text-gray-500 leading-relaxed block max-w-xs">
                  Tầng 12, Tòa nhà KND, 285 Cách Mạng Tháng Tám, Phường 12, Quận
                  10, TP. Hồ Chí Minh
                </span>
              </div>
            </div>
          </div>

          {/* CỘT 2: Link Dành cho Người dùng */}
          <div className="space-y-8">
            <div>
              <h4 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-wider">
                Dành cho Khách hàng
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                  >
                    Điều khoản sử dụng cho khách hàng
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
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
                    to="/"
                    className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                  >
                    Quy định chia sẻ công thức
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
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
              Về KND Food
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                >
                  Giới thiệu về nền tảng
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                >
                  Chính sách bảo mật thông tin
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                >
                  Cơ chế giải quyết khiếu nại
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-500 hover:text-[#f97316] transition-colors font-medium"
                >
                  Tiêu chuẩn kiểm duyệt nội dung
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-200 my-10" />

        {/* NỬA DƯỚI: APP & MẠNG XÃ HỘI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* CỘT 1: Ứng dụng KND Food */}
          <div>
            <h4 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-wider">
              Tải ứng dụng KND Food
            </h4>
            <div className="flex flex-col gap-3">
              {/* Nút Google Play */}
              <a
                href="#"
                className="group flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-44 hover:border-[#f97316] hover:shadow-md transition-all"
              >
                <svg
                  viewBox="0 0 512 512"
                  fill="currentColor"
                  className="w-6 h-6 text-gray-700 group-hover:text-[#f97316] transition-colors"
                >
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 leading-none mb-1">
                    Tải nội dung trên
                  </span>
                  <span className="text-sm text-gray-900 font-bold leading-none">
                    Google Play
                  </span>
                </div>
              </a>
              {/* Nút App Store */}
              <a
                href="#"
                className="group flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-44 hover:border-[#f97316] hover:shadow-md transition-all"
              >
                <svg
                  viewBox="0 0 384 512"
                  fill="currentColor"
                  className="w-7 h-7 text-gray-700 group-hover:text-[#f97316] transition-colors"
                >
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 leading-none mb-1">
                    Tải về trên
                  </span>
                  <span className="text-sm text-gray-900 font-bold leading-none">
                    App Store
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* CỘT 2: Ứng dụng Quản lý */}
          <div>
            <h4 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-wider">
              Ứng dụng dành cho Tác giả
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="group flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-44 hover:border-[#f97316] hover:shadow-md transition-all"
              >
                <svg
                  viewBox="0 0 512 512"
                  fill="currentColor"
                  className="w-6 h-6 text-gray-700 group-hover:text-[#f97316] transition-colors"
                >
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 leading-none mb-1">
                    Tải nội dung trên
                  </span>
                  <span className="text-sm text-gray-900 font-bold leading-none">
                    Google Play
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* CỘT 3: Mạng xã hội & Ngôn ngữ & Bản quyền */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-wider">
                Kết nối với chúng tôi
              </h4>
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

            <div className="mt-8">
              <p className="text-gray-400 text-sm font-medium">
                © {new Date().getFullYear()} KND Food. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
