import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function CreateRecipe() {
  const navigate = useNavigate();

  // --- STATE LƯU TRỮ DỮ LIỆU FORM ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState('Dễ');
  const [category, setCategory] = useState('1'); 
  
  // --- THAY ĐỔI: Chuyển từ Link Video sang Upload Video ---
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const videoInputRef = useRef(null);

  // Ảnh đại diện món ăn chính
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Danh sách Nguyên liệu
  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);

  // Danh sách Các bước thực hiện (Lưu cả chữ và ảnh)
  const [steps, setSteps] = useState([
    { description: '', imageFile: null, imagePreview: null }
  ]);

  // --- HÀM XỬ LÝ ẢNH CHÍNH ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh hợp lệ!');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- HÀM XỬ LÝ VIDEO ---
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Vui lòng chọn file video hợp lệ (MP4, WebM...)!');
        return;
      }
      // Giới hạn dung lượng video (Ví dụ: 50MB = 50 * 1024 * 1024 bytes)
      if (file.size > 50 * 1024 * 1024) {
        toast.warning('Video quá nặng! Vui lòng chọn video dưới 50MB.');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // --- HÀM XỬ LÝ NGUYÊN LIỆU ---
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (indexToRemove) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // --- HÀM XỬ LÝ CÁC BƯỚC NẤU ---
  const addStep = () => {
    setSteps([...steps, { description: '', imageFile: null, imagePreview: null }]);
  };

  const removeStep = (indexToRemove) => {
    if (steps.length === 1) return;
    setSteps(steps.filter((_, index) => index !== indexToRemove));
  };

  const updateStepDescription = (index, value) => {
    const newSteps = [...steps];
    newSteps[index].description = value;
    setSteps(newSteps);
  };

  const handleStepImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh hợp lệ!');
        return;
      }
      const newSteps = [...steps];
      newSteps[index].imageFile = file;
      newSteps[index].imagePreview = URL.createObjectURL(file);
      setSteps(newSteps);
    }
  };

  // --- HÀM SUBMIT FORM ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !imageFile) {
      toast.warning('Vui lòng nhập tên món và chọn ảnh đại diện!');
      return;
    }

    const validIngredients = ingredients.filter(i => i.name.trim() !== '');
    const validSteps = steps.filter(s => s.description.trim() !== '');

    if (validIngredients.length === 0) {
      toast.warning('Vui lòng thêm ít nhất 1 nguyên liệu!');
      return;
    }
    if (validSteps.length === 0) {
      toast.warning('Vui lòng thêm ít nhất 1 bước thực hiện!');
      return;
    }

    try {
      console.log("Đang gửi dữ liệu lên Server...");
      
      // Giả lập gửi thành công
      setTimeout(() => {
        toast.success('🎉 Đăng công thức thành công!');
        navigate('/profile'); 
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error('❌ Lỗi khi đăng công thức!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Tạo công thức mới</h1>
          <p className="text-gray-500 mt-2 font-medium">Chia sẻ hương vị tuyệt vời của bạn với cộng đồng KND Food.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* KHU VỰC 1: THÔNG TIN CƠ BẢN */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">1</span>
              Thông tin chung
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên món ăn <span className="text-red-500">*</span></label>
                <input 
                  type="text" required placeholder="VD: Phở bò xào lăn..." value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả ngắn</label>
                <textarea 
                  rows="3" placeholder="Chia sẻ một chút cảm nghĩ hoặc nguồn gốc của món ăn này..." value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none font-medium text-gray-700"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 font-medium appearance-none cursor-pointer">
                    <option value="1">Món chính</option>
                    <option value="2">Ăn vặt</option>
                    <option value="3">Tráng miệng</option>
                    <option value="4">Healthy / Eat Clean</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Độ khó</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 font-medium appearance-none cursor-pointer">
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Chuẩn bị (Phút)</label>
                  <input type="number" min="0" placeholder="VD: 15" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nấu (Phút)</label>
                  <input type="number" min="0" placeholder="VD: 30" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Khẩu phần (Người)</label>
                  <input type="number" min="1" placeholder="VD: 4" value={servings} onChange={(e) => setServings(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"/>
                </div>
              </div>
            </div>
          </div>

          {/* KHU VỰC 2: MEDIA (ẢNH & VIDEO) */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">2</span>
              Hình ảnh & Video
            </h2>

            <div className="space-y-6">
              {/* Ảnh chính */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Ảnh thành phẩm <span className="text-red-500">*</span></label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className={`w-full aspect-[21/9] md:aspect-[21/7] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${imagePreview ? 'border-transparent' : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'}`}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <span className="text-white font-bold px-4 py-2 bg-black/50 rounded-lg backdrop-blur-sm">Thay đổi ảnh</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-3 group-hover:text-orange-500 transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      <p className="text-gray-500 font-medium">Bấm vào đây để tải ảnh lên</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>

              {/* Tùy chọn tải Video từ máy */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Video hướng dẫn <span className="text-gray-400 font-normal ml-1">(Tùy chọn - Tối đa 50MB)</span>
                </label>
                <div 
                  onClick={() => videoInputRef.current.click()}
                  className={`w-full aspect-video md:aspect-[21/7] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${videoPreview ? 'border-transparent bg-black' : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50 bg-gray-50'}`}
                >
                  {videoPreview ? (
                    <>
                      {/* Trình phát video xem trước */}
                      <video src={videoPreview} controls className="w-full h-full object-contain" onClick={(e) => e.stopPropagation()} />
                      {/* Nút xóa video */}
                      <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation(); // Ngăn click nhầm vào ô upload
                            setVideoFile(null);
                            setVideoPreview(null);
                            // Reset input value để có thể chọn lại đúng file vừa xóa
                            if (videoInputRef.current) videoInputRef.current.value = "";
                        }}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition shadow-lg z-10"
                        title="Xóa video"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-3 group-hover:text-orange-500 transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      <p className="text-gray-500 font-medium">Bấm vào đây để tải video lên</p>
                      <p className="text-xs text-gray-400 mt-1">Hỗ trợ định dạng MP4, WebM</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={videoInputRef} onChange={handleVideoChange} className="hidden" accept="video/mp4,video/webm" />
              </div>
            </div>
          </div>

          {/* KHU VỰC 3: NGUYÊN LIỆU */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">3</span>
              Nguyên liệu
            </h2>

            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex-1">
                    <input type="text" placeholder="Tên nguyên liệu (VD: Thịt ba chỉ)" value={ing.name} onChange={(e) => updateIngredient(index, 'name', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium" />
                  </div>
                  <div className="flex gap-3 sm:w-[40%]">
                    <div className="flex-1">
                      <input type="text" placeholder="SL (VD: 500)" value={ing.amount} onChange={(e) => updateIngredient(index, 'amount', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"/>
                    </div>
                    <div className="flex-1">
                      <input type="text" placeholder="Đơn vị (g, kg...)" value={ing.unit} onChange={(e) => updateIngredient(index, 'unit', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"/>
                    </div>
                    <button type="button" onClick={() => removeIngredient(index)} disabled={ingredients.length === 1} className={`w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors ${ingredients.length === 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 sm:opacity-0 group-hover:opacity-100'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addIngredient} className="mt-5 px-5 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
              Thêm nguyên liệu
            </button>
          </div>

          {/* KHU VỰC 4: CÁC BƯỚC THỰC HIỆN CÓ KÈM ẢNH */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">4</span>
              Các bước thực hiện
            </h2>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
                  
                  {/* Cột trái: Số thứ tự */}
                  <div className="pt-1">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-black flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Cột phải: Khung nhập text + Khung Upload Ảnh nhỏ */}
                  <div className="flex-1 flex flex-col sm:flex-row gap-4">
                    
                    {/* Ô nhập Text */}
                    <div className="flex-1">
                      <textarea 
                        rows="3"
                        placeholder={`Mô tả chi tiết bước ${index + 1}...`}
                        value={step.description}
                        onChange={(e) => updateStepDescription(index, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none font-medium text-gray-700"
                      ></textarea>
                    </div>

                    {/* Ô tải Ảnh cho bước này (Kích thước vuông 96x96px) */}
                    <div className="shrink-0 w-28 h-28">
                      <label className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 bg-gray-50 flex items-center justify-center cursor-pointer transition-all overflow-hidden relative group/img">
                        {step.imagePreview ? (
                          <>
                            <img src={step.imagePreview} alt={`Bước ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.152-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-400 flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Thêm ảnh</span>
                          </div>
                        )}
                        <input type="file" className="hidden" onChange={(e) => handleStepImageChange(index, e)} accept="image/*" />
                      </label>
                    </div>

                    {/* Nút xóa bước */}
                    <button 
                      type="button" 
                      onClick={() => removeStep(index)}
                      className={`absolute -right-2 -top-2 w-7 h-7 rounded-full bg-white border border-gray-200 text-red-500 hover:bg-red-50 transition-colors shadow-md flex items-center justify-center ${steps.length === 1 ? 'hidden' : 'opacity-100 sm:opacity-0 group-hover:opacity-100'}`}
                      title="Xóa bước này"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                    </button>

                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={addStep}
              className="mt-6 px-5 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
              Thêm bước mới
            </button>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/profile')} className="px-8 py-4 bg-white border border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition active:scale-95">
              Hủy bỏ
            </button>
            <button type="submit" className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition active:scale-95 uppercase tracking-wide">
              Đăng Công Thức
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}