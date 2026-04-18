import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function CreateRecipe() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  
  const [difficulty, setDifficulty] = useState(1); 
  const [category, setCategory] = useState(''); 
  const [categories, setCategories] = useState([]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const difficultyLabels = {
    '1': '1 - Rất dễ',
    '2': '2 - Dễ',
    '3': '3 - Trung bình',
    '4': '4 - Khó',
    '5': '5 - Rất khó'
  };
  
  const [videoInputType, setVideoInputType] = useState('upload'); 
  const [videoUrl, setVideoUrl] = useState(''); 
  const [videoFile, setVideoFile] = useState(null); 
  const [videoPreview, setVideoPreview] = useState(null);
  const videoInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);
  const [steps, setSteps] = useState([{ description: '', imageFile: null, imagePreview: null }]);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
           setCategory(data[0].CategoryID.toString());
        }
      })
      .catch(err => console.error("Lỗi lấy danh mục:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showWarning = (text) => {
    Swal.fire({
      title: 'Khoan đã!',
      text: text,
      icon: 'warning',
      confirmButtonText: 'Đã hiểu',
      confirmButtonColor: '#f97316',
      customClass: { popup: 'rounded-3xl shadow-2xl border border-gray-100' }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return showWarning('Vui lòng chọn file hình ảnh hợp lệ!');
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        return showWarning('Vui lòng chọn file video hợp lệ (MP4, WebM...)!');
      }
      if (file.size > 50 * 1024 * 1024) {
        return showWarning('Video quá nặng! Vui lòng chọn video dưới 50MB.');
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  const removeIngredient = (indexToRemove) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };
  const updateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => setSteps([...steps, { description: '', imageFile: null, imagePreview: null }]);
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
        return showWarning('Vui lòng chọn file hình ảnh hợp lệ!');
      }
      const newSteps = [...steps];
      newSteps[index].imageFile = file;
      newSteps[index].imagePreview = URL.createObjectURL(file);
      setSteps(newSteps);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      Swal.fire({
        title: 'Chưa đăng nhập!',
        text: 'Bạn cần đăng nhập để chia sẻ công thức.',
        icon: 'info',
        confirmButtonText: 'Đăng nhập ngay',
        confirmButtonColor: '#f97316',
        customClass: { popup: 'rounded-3xl shadow-2xl border border-gray-100' }
      }).then(() => navigate('/login'));
      return;
    }

    if (!title.trim() || !imageFile) {
      return showWarning('Vui lòng nhập tên món và chọn ảnh đại diện!');
    }

    const validIngredients = ingredients.filter(i => i.name.trim() !== '');
    const validSteps = steps.filter(s => s.description.trim() !== '');

    if (validIngredients.length === 0) return showWarning('Vui lòng thêm ít nhất 1 nguyên liệu!');
    if (validSteps.length === 0) return showWarning('Vui lòng thêm ít nhất 1 bước thực hiện!');

    const formData = new FormData();
    formData.append('UserID', user.UserID);
    formData.append('Title', title);
    formData.append('Description', description);
    formData.append('CategoryID', category);
    formData.append('Difficulty', difficulty);
    formData.append('PrepTime', prepTime);
    formData.append('CookTime', cookTime);
    formData.append('Servings', servings);
    formData.append('mainImage', imageFile);

    // XỬ LÝ QUYỀN ADMIN Ở ĐÂY:
    // Kiểm tra xem user đang đăng nhập có phải Admin không (dựa vào Role hoặc RoleID)
    const isAdmin = user.Role === 'Admin' || user.RoleID === 1 || user.isAdmin === true;
    
    // Nếu là Admin thì Status = 1 (Hiện luôn), nếu không thì Status = 0 (Chờ duyệt)
    formData.append('Status', isAdmin ? 1 : 0);
    
    if (videoInputType === 'upload' && videoFile) {
        formData.append('mainVideo', videoFile);
    } else if (videoInputType === 'link' && videoUrl.trim() !== '') {
        formData.append('VideoUrl', videoUrl);
    }

    formData.append('ingredients', JSON.stringify(validIngredients));
    const stepsDescriptions = validSteps.map(s => s.description);
    formData.append('stepsDescriptions', JSON.stringify(stepsDescriptions));

    validSteps.forEach((step, index) => {
        if (step.imageFile) formData.append(`stepImage_${index}`, step.imageFile);
    });

    Swal.fire({
      title: 'Đang xử lý...',
      text: 'Vui lòng chờ một chút để hệ thống tải dữ liệu lên nhé!',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: { popup: 'rounded-3xl shadow-2xl border border-gray-100' }
    });

    try {
      const response = await fetch('http://localhost:5000/api/recipes/create', {
          method: 'POST',
          body: formData 
      });

      const data = await response.json();

      if (response.ok) {
          Swal.fire({
            title: 'Tuyệt vời!',
            text: data.message,
            icon: 'success',
            confirmButtonText: 'Xem hồ sơ',
            confirmButtonColor: '#10b981',
            customClass: { popup: 'rounded-3xl shadow-2xl border border-gray-100' }
          }).then(() => {
            navigate('/profile'); 
          });
      } else {
          Swal.fire({
            title: 'Thất bại!',
            text: data.message,
            icon: 'error',
            confirmButtonText: 'Đóng',
            confirmButtonColor: '#ef4444',
            customClass: { popup: 'rounded-3xl shadow-2xl border border-gray-100' }
          });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Lỗi kết nối!',
        text: 'Không thể kết nối tới Server, vui lòng thử lại sau.',
        icon: 'error',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#ef4444',
        customClass: { popup: 'rounded-3xl shadow-2xl border border-gray-100' }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Tạo Công Thức Mới</h1>
          <p className="text-gray-500 mt-2 font-medium">Chia sẻ công thức nấu ăn của bạn tới cộng đồng.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">1</span>
              Thông tin chung
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên món ăn <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="Nhập tên món ăn..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả</label>
                <textarea rows="3" placeholder="Chia sẻ cảm nghĩ của bạn..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none font-medium text-gray-700"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8" ref={dropdownRef}>
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục</label>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl flex justify-between items-center cursor-pointer transition-all ${isDropdownOpen ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <span className="font-medium text-gray-900">
                      {categories.find(c => c.CategoryID.toString() === category)?.CategoryName || 'Chọn danh mục...'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180 text-orange-500' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      <ul className="py-2">
                        {categories.map((cat) => (
                          <li 
                            key={cat.CategoryID}
                            onClick={() => {
                              setCategory(cat.CategoryID.toString());
                              setIsDropdownOpen(false);
                            }}
                            className={`px-4 py-2.5 cursor-pointer transition-colors ${category === cat.CategoryID.toString() ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-orange-500'}`}
                          >
                            {cat.CategoryName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-700">Độ khó</label>
                    <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg uppercase tracking-wider">
                      {difficultyLabels[difficulty]}
                    </span>
                  </div>
                  <div className="relative pt-2 pb-6">
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      step="1"
                      value={difficulty} 
                      onChange={(e) => setDifficulty(parseInt(e.target.value))} 
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600 transition-all relative z-10"
                    />
                    <div className="absolute top-7 left-0 w-full text-[10px] font-black text-gray-400">
                      <span className="absolute left-0">RẤT DỄ</span>
                      <span className="absolute left-1/4 -translate-x-1/2">DỄ</span>
                      <span className="absolute left-1/2 -translate-x-1/2">VỪA</span>
                      <span className="absolute left-3/4 -translate-x-1/2">KHÓ</span>
                      <span className="absolute right-0">RẤT KHÓ</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Chuẩn bị (Phút)</label>
                  <input type="number" min="0"  value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nấu (Phút)</label>
                  <input type="number" min="0"  value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Khẩu phần (Người)</label>
                  <input type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"/>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">2</span>
              Hình ảnh & Video
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Ảnh thành phẩm <span className="text-red-500">*</span></label>
                <div onClick={() => fileInputRef.current.click()} className={`w-full aspect-[21/9] md:aspect-[21/7] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${imagePreview ? 'border-transparent' : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'}`}>
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <span className="text-white font-bold px-4 py-2 bg-black/50 rounded-lg backdrop-blur-sm">Thay đổi ảnh</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-3 group-hover:text-orange-500 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                      <p className="text-gray-500 font-medium">Bấm vào đây để tải ảnh lên</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>

              <div>
                <div className="flex items-end justify-between mb-3">
                  <label className="block text-sm font-bold text-gray-700">Video hướng dẫn <span className="text-gray-400 font-normal ml-1">(Tùy chọn)</span></label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setVideoInputType('upload')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${videoInputType === 'upload' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tải lên</button>
                    <button type="button" onClick={() => setVideoInputType('link')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${videoInputType === 'link' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Link Video</button>
                  </div>
                </div>

                {videoInputType === 'upload' ? (
                  <div onClick={() => videoInputRef.current.click()} className={`w-full aspect-video md:aspect-[21/7] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${videoPreview ? 'border-transparent bg-black' : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50 bg-gray-50'}`}>
                    {videoPreview ? (
                      <>
                        <video src={videoPreview} controls className="w-full h-full object-contain" onClick={(e) => e.stopPropagation()} />
                        <button type="button" onClick={(e) => { e.stopPropagation(); setVideoFile(null); setVideoPreview(null); if (videoInputRef.current) videoInputRef.current.value = ""; }} className="absolute top-4 right-4 bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition shadow-lg z-10" title="Xóa video"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg></button>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-3 group-hover:text-orange-500 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
                        <p className="text-gray-500 font-medium">Bấm vào đây để tải video lên <br />(giới hạn 50MB)</p>
                      </div>
                    )}
                    <input type="file" ref={videoInputRef} onChange={handleVideoChange} className="hidden" accept="video/mp4,video/webm" />
                  </div>
                ) : (
                  <div className="relative border border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/50 transition-all bg-gray-50 flex items-center">
                    <div className="pl-4 pr-3 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                    </div>
                    <input type="url" placeholder="Hãy thêm đường dẫn..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full py-4 pr-4 bg-transparent outline-none font-medium placeholder-gray-400"/>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">3</span> Nguyên liệu
            </h2>
            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex-1">
                    <input type="text" placeholder="Nhập tên nguyên liệu..." value={ing.name} onChange={(e) => updateIngredient(index, 'name', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium" />
                  </div>
                  <div className="flex gap-3 sm:w-[40%]">
                    <div className="flex-1">
                      <input type="text" placeholder="Số lượng" value={ing.amount} onChange={(e) => updateIngredient(index, 'amount', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"/>
                    </div>
                    <div className="flex-1">
                      <input type="text" placeholder="Đơn vị" value={ing.unit} onChange={(e) => updateIngredient(index, 'unit', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"/>
                    </div>
                    <button type="button" onClick={() => removeIngredient(index)} disabled={ingredients.length === 1} className={`w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors ${ingredients.length === 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 sm:opacity-0 group-hover:opacity-100'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addIngredient} className="mt-5 px-5 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg> Thêm nguyên liệu
            </button>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">4</span> Các bước thực hiện
            </h2>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
                  <div className="pt-2"><div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-black flex items-center justify-center text-sm">{index + 1}</div></div>
                  <div className="flex-1 flex flex-col sm:flex-row gap-4 items-stretch">
                    <div className="flex-1 relative">
                      <textarea placeholder={`Mô tả chi tiết bước ${index + 1}...`} value={step.description} onChange={(e) => updateStepDescription(index, e.target.value)} className="w-full h-full min-h-[120px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none font-medium text-gray-700"></textarea>
                    </div>
                    <div className="shrink-0 w-full sm:w-[120px] h-[120px]">
                      <label className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 bg-gray-50 flex items-center justify-center cursor-pointer transition-all overflow-hidden relative group/img">
                        {step.imagePreview ? (
                          <>
                            <img src={step.imagePreview} alt={`Bước ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.152-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg></div>
                          </>
                        ) : (
                          <div className="text-gray-400 flex flex-col items-center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg><span className="text-[11px] font-bold uppercase tracking-wider">Thêm ảnh</span></div>
                        )}
                        <input type="file" className="hidden" onChange={(e) => handleStepImageChange(index, e)} accept="image/*" />
                      </label>
                    </div>
                    <button type="button" onClick={() => removeStep(index)} className={`absolute -right-3 -top-3 w-7 h-7 rounded-full bg-white border border-gray-200 text-red-500 hover:bg-red-50 transition-colors shadow-md flex items-center justify-center z-10 ${steps.length === 1 ? 'hidden' : 'opacity-100 sm:opacity-0 group-hover:opacity-100'}`} title="Xóa bước này"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addStep} className="mt-6 px-5 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg> Thêm bước mới
            </button>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/profile')} className="px-8 py-4 bg-white border border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition active:scale-95">Hủy bỏ</button>
            <button type="submit" className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition active:scale-95 tracking-wide">Đăng Công Thức</button>
          </div>
        </form>
      </div>
    </div>
  );
}