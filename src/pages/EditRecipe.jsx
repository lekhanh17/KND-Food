import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Lấy user hiện tại
  const [loggedInUser] = useState(() => {
    const saved = localStorage.getItem('loggedInUser');
    return saved ? JSON.parse(saved) : null;
  });

  // State lưu trữ toàn bộ dữ liệu Form
  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    PrepTime: '',
    CookTime: '',
    Servings: '',
    Difficulty: '1',
    CategoryID: '1',
    ingredients: [],
    steps: []
  });

  // GỌI API LẤY DỮ LIỆU CŨ ĐIỀN VÀO FORM
  useEffect(() => {
    if (!loggedInUser) {
      toast.error("Vui lòng đăng nhập!");
      navigate('/login');
      return;
    }

    fetch(`http://localhost:5000/api/recipes/detail/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          toast.error("Không tìm thấy món ăn!");
          navigate('/profile');
        } else if (data.UserID !== loggedInUser.UserID) {
          toast.error("Bạn không có quyền sửa món này!");
          navigate('/profile');
        } else {
          // Điền dữ liệu vào form
          setFormData({
            Title: data.Title || '',
            Description: data.Description || '',
            PrepTime: data.PrepTime || '',
            CookTime: data.CookTime || '',
            Servings: data.Servings || '',
            Difficulty: data.Difficulty || '1',
            CategoryID: data.CategoryID || '1',
            ingredients: data.ingredients || [],
            steps: data.steps || []
          });
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Lỗi tải dữ liệu!");
        setIsLoading(false);
      });
  }, [id, loggedInUser, navigate]);

  // HÀM XỬ LÝ THAY ĐỔI TEXT CHUNG
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- QUẢN LÝ NGUYÊN LIỆU ---
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { IngredientName: '', Quantity: '', Unit: '' }]
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  // --- QUẢN LÝ CÁC BƯỚC THỰC HIỆN ---
  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index].Instruction = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { Instruction: '' }]
    });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  // SUBMIT FORM LÊN SERVER
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Title.trim()) return toast.warning("Vui lòng nhập tên món ăn!");

    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          UserID: loggedInUser.UserID // Gửi kèm UserID để Backend xác thực
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Cập nhật thành công! 🎉");
        navigate(`/recipe/${id}`); // Chuyển về trang chi tiết xem thành quả
      } else {
        toast.error("Lỗi: " + data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối Server!");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Chỉnh sửa món ăn</h1>
            <p className="text-gray-500 mt-1">Cập nhật lại công thức của bạn cho hoàn hảo hơn.</p>
          </div>
          <Link to={`/recipe/${id}`} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition">Hủy bỏ</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* THÔNG TIN CHUNG */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Thông tin cơ bản</h2>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tên món ăn <span className="text-red-500">*</span></label>
              <input type="text" name="Title" value={formData.Title} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-xl transition outline-none font-medium" placeholder="VD: Sườn xào chua ngọt" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả ngắn</label>
              <textarea name="Description" value={formData.Description} onChange={handleChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-xl transition outline-none resize-none" placeholder="Chia sẻ một chút về món ăn này..."></textarea>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Chuẩn bị (Phút)</label>
                <input type="number" name="PrepTime" value={formData.PrepTime} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nấu (Phút)</label>
                <input type="number" name="CookTime" value={formData.CookTime} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Khẩu phần (Người)</label>
                <input type="number" name="Servings" value={formData.Servings} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Độ khó (1-5)</label>
                <select name="Difficulty" value={formData.Difficulty} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-xl outline-none">
                  <option value="1">1 - Rất dễ</option>
                  <option value="2">2 - Dễ</option>
                  <option value="3">3 - Trung bình</option>
                  <option value="4">4 - Khó</option>
                  <option value="5">5 - Thử thách</option>
                </select>
              </div>
            </div>
          </div>

          {/* DANH SÁCH NGUYÊN LIỆU */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Nguyên liệu</h2>
              <button type="button" onClick={addIngredient} className="px-4 py-2 bg-green-50 text-green-600 font-bold rounded-lg hover:bg-green-100 transition text-sm">+ Thêm nguyên liệu</button>
            </div>
            
            <div className="space-y-4">
              {formData.ingredients.map((ing, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-center">
                  <input type="text" placeholder="Tên nguyên liệu (VD: Thịt heo)" value={ing.IngredientName} onChange={(e) => handleIngredientChange(index, 'IngredientName', e.target.value)} className="flex-1 w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-green-500 rounded-xl outline-none" />
                  <input type="text" placeholder="Số lượng (VD: 200)" value={ing.Quantity} onChange={(e) => handleIngredientChange(index, 'Quantity', e.target.value)} className="w-full sm:w-32 px-4 py-3 bg-gray-50 border border-transparent focus:border-green-500 rounded-xl outline-none" />
                  <input type="text" placeholder="Đơn vị (VD: gram)" value={ing.Unit} onChange={(e) => handleIngredientChange(index, 'Unit', e.target.value)} className="w-full sm:w-32 px-4 py-3 bg-gray-50 border border-transparent focus:border-green-500 rounded-xl outline-none" />
                  
                  {/* SỬA Ở ĐÂY: Dùng SVG thay cho thẻ i */}
                  <button type="button" onClick={() => removeIngredient(index)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition" title="Xóa">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5">
                      <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                    </svg>
                  </button>
                </div>
              ))}
              {formData.ingredients.length === 0 && <p className="text-gray-400 italic text-center py-4">Chưa có nguyên liệu nào.</p>}
            </div>
          </div>

          {/* CÁC BƯỚC LÀM */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Các bước thực hiện</h2>
              <button type="button" onClick={addStep} className="px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-100 transition text-sm">+ Thêm bước</button>
            </div>
            
            <div className="space-y-4">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-2xl">
                  <div className="w-8 h-8 shrink-0 bg-orange-200 text-orange-700 font-black rounded-full flex items-center justify-center mt-1">{index + 1}</div>
                  <div className="flex-1">
                    <textarea rows="3" placeholder={`Mô tả bước ${index + 1}...`} value={step.Instruction} onChange={(e) => handleStepChange(index, e.target.value)} className="w-full px-4 py-3 border border-transparent focus:border-orange-500 rounded-xl outline-none resize-none bg-white"></textarea>
                  </div>
                  
                  {/* SỬA Ở ĐÂY: Dùng SVG thay cho thẻ i */}
                  <button type="button" onClick={() => removeStep(index)} className="p-2 text-red-400 hover:bg-red-100 rounded-xl transition mt-1" title="Xóa bước">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5">
                      <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                    </svg>
                  </button>
                </div>
              ))}
              {formData.steps.length === 0 && <p className="text-gray-400 italic text-center py-4">Chưa có bước thực hiện nào.</p>}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSaving} className={`px-10 py-4 rounded-xl font-black text-white text-lg shadow-lg transition-all ${isSaving ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 hover:-translate-y-1'}`}>
              {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}