import React from "react";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6 bg-white">
      <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Cột bên trái: Nội dung chữ */}
        <div>
          <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest">
            Hệ thống chia sẻ công thức nấu ăn
          </span>
          <h1 className="text-6xl lg:text-8xl font-black text-gray-900 mt-6 leading-[1.1]">
            Khám phá <br />
            <span className="text-orange-500 italic">vị ngon</span> <br />
            mỗi ngày
          </h1>
          <p className="text-xl text-gray-500 mt-8 mb-10 max-w-lg leading-relaxed">
            Tìm kiếm hướng dẫn chế biến chi tiết từng bước, giúp bạn tự tin vào
            bếp mỗi ngày.
          </p>
        </div>

        {/* Hình ảnh có hiệu ứng xoay */}
        <div className="relative">
          <div className="absolute -inset-4 bg-orange-100 rounded-[3rem] -rotate-3"></div>
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000"
            className="relative w-full h-[600px] object-cover rounded-[3rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700"
            alt="Delicious Food"
          />
        </div>
      </div>
    </section>
  );
}
