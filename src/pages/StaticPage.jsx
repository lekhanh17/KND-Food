import { Link } from "react-router-dom";

export default function StaticPage({ title, pdfUrl }) {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center">
      
      {/* Tiêu đề */}
      <div className="w-full max-w-6xl mb-4 flex justify-between items-end animate-in fade-in slide-in-from-top-4">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-wider">
          {title}
        </h1>
      </div>

      {/* Khung hiển thị nội dung */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col min-h-[75vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {pdfUrl ? (
          // ==========================================
          // HIỂN THỊ KHUNG ĐỌC PDF (GIỐNG TICKETBOX)
          // ==========================================
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            title={title}
            className="w-full h-full flex-grow border-none min-h-[75vh]"
          ></iframe>
        ) : (
          // ==========================================
          // HIỂN THỊ THÔNG BÁO BẢO TRÌ (NẾU CHƯA CÓ PDF)
          // ==========================================
          <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
            <div className="text-6xl mb-6 animate-bounce">🚧</div>
            <p className="font-bold text-2xl text-gray-800 mb-2">Trang này đang được cập nhật</p>
            <p className="text-gray-500 max-w-md">
              Nội dung chi tiết của chuyên mục <span className="font-bold text-orange-500">{title}</span> đang được biên soạn và sẽ sớm ra mắt. Xin lỗi bạn vì sự bất tiện này!
            </p>
            
            <div className="pt-8">
            </div>
          </div>
        )}

      </div>
    </div>
  );
}