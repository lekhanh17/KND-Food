import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [categories, setCategories] = useState([]);

  // MỚI THÊM: State và Ref để quản lý Custom Dropdown
  const [openDropdown, setOpenDropdown] = useState(null); // 'category', 'difficulty', or null
  const dropdownRef = useRef(null);

  const [loggedInUser] = useState(() => {
    const saved = localStorage.getItem("loggedInUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    PrepTime: "",
    CookTime: "",
    Servings: "",
    Difficulty: "1",
    CategoryID: "1",
    ingredients: [],
    steps: [],
  });

  // MỚI THÊM: Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showError = (text, callback) => {
    Swal.fire({
      title: "Lỗi! ❌",
      text: text,
      icon: "error",
      confirmButtonText: "Đóng",
      confirmButtonColor: "#ef4444",
      customClass: { popup: "rounded-3xl shadow-2xl border border-gray-100" },
    }).then(() => {
      if (callback) callback();
    });
  };

  const showWarning = (text) => {
    Swal.fire({
      title: "Khoan đã! ⚠️",
      text: text,
      icon: "warning",
      confirmButtonText: "Đã hiểu",
      confirmButtonColor: "#f97316",
      customClass: { popup: "rounded-3xl shadow-2xl border border-gray-100" },
    });
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Lỗi lấy danh mục:", err));
  }, []);

  useEffect(() => {
    if (!loggedInUser) {
      Swal.fire({
        title: "Chưa đăng nhập!",
        text: "Vui lòng đăng nhập để tiếp tục.",
        icon: "info",
        confirmButtonText: "Đăng nhập ngay",
        confirmButtonColor: "#f97316",
        customClass: { popup: "rounded-3xl shadow-2xl border border-gray-100" },
      }).then(() => navigate("/login"));
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/recipes/detail/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          showError("Không tìm thấy món ăn!", () => navigate("/profile"));
        } else if (data.UserID !== loggedInUser.UserID) {
          showError("Bạn không có quyền sửa món này!", () =>
            navigate("/profile"),
          );
        } else {
          setFormData({
            Title: data.Title || "",
            Description: data.Description || "",
            PrepTime: data.PrepTime || "",
            CookTime: data.CookTime || "",
            Servings: data.Servings || "",
            Difficulty: data.Difficulty || "1",
            CategoryID: data.CategoryID || "1",
            ingredients: data.ingredients || [],
            steps: data.steps || [],
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        showError("Lỗi tải dữ liệu!");
        setIsLoading(false);
      });
  }, [id, loggedInUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // MỚI THÊM: Hàm chọn item cho Custom Dropdown
  const handleCustomSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setOpenDropdown(null);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { IngredientName: "", Quantity: "", Unit: "" },
      ],
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index].Instruction = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { Instruction: "" }],
    });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Title.trim()) return showWarning("Vui lòng nhập tên món ăn!");

    setIsSaving(true);

    Swal.fire({
      title: "Đang lưu...",
      text: "Vui lòng chờ một chút để hệ thống cập nhật nhé!",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: { popup: "rounded-3xl shadow-2xl border border-gray-100" },
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/recipes/update/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            UserID: loggedInUser.UserID,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Chúc mừng!",
          text: "Cập nhật công thức thành công!",
          icon: "success",
          confirmButtonText: "Xem",
          confirmButtonColor: "#10b981",
          customClass: {
            popup: "rounded-3xl shadow-2xl border border-gray-100",
          },
        }).then(() => {
          navigate(`/recipe/${id}`);
        });
      } else {
        showError(data.message);
      }
    } catch (error) {
      console.error(error);
      showError("Không thể kết nối Server!");
    } finally {
      setIsSaving(false);
    }
  };

  const difficultyOptions = [
    { value: "1", label: "1 - Rất dễ" },
    { value: "2", label: "2 - Dễ" },
    { value: "3", label: "3 - Trung bình" },
    { value: "4", label: "4 - Khó" },
    { value: "5", label: "5 - Rất khó" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Chỉnh sửa món ăn
            </h1>
            <p className="text-gray-500 mt-1">
              Cập nhật lại công thức của bạn cho hoàn hảo hơn.
            </p>
          </div>
          <Link
            to={`/recipe/${id}`}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition"
          >
            Hủy bỏ
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">
              Thông tin cơ bản
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên món ăn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Title"
                value={formData.Title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-xl transition outline-none font-medium"
                placeholder="VD: Sườn xào chua ngọt"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mô tả ngắn
              </label>
              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-xl transition outline-none resize-none"
                placeholder="Chia sẻ một chút về món ăn này..."
              ></textarea>
            </div>

            {/* CUSTOM DROPDOWNS KHU VỰC NÀY */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              ref={dropdownRef}
            >
              {/* CUSTOM SELECT DANH MỤC */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Danh mục
                </label>
                <div
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "category" ? null : "category",
                    )
                  }
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl flex justify-between items-center cursor-pointer transition ${openDropdown === "category" ? "border-orange-500 bg-white" : "border-transparent hover:border-gray-200"}`}
                >
                  <span className="text-gray-900">
                    {categories.find(
                      (c) =>
                        c.CategoryID.toString() ===
                        formData.CategoryID.toString(),
                    )?.CategoryName || "Đang tải..."}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === "category" ? "rotate-180 text-orange-500" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>

                {openDropdown === "category" && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    <ul className="py-2">
                      {categories.map((cat) => (
                        <li
                          key={cat.CategoryID}
                          onClick={() =>
                            handleCustomSelect("CategoryID", cat.CategoryID)
                          }
                          className={`px-4 py-2.5 cursor-pointer transition-colors ${formData.CategoryID.toString() === cat.CategoryID.toString() ? "bg-orange-50 text-orange-600 font-bold" : "text-gray-700 hover:bg-gray-50 hover:text-orange-500"}`}
                        >
                          {cat.CategoryName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* CUSTOM SELECT ĐỘ KHÓ */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Độ khó (1-5)
                </label>
                <div
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "difficulty" ? null : "difficulty",
                    )
                  }
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl flex justify-between items-center cursor-pointer transition ${openDropdown === "difficulty" ? "border-orange-500 bg-white" : "border-transparent hover:border-gray-200"}`}
                >
                  <span className="text-gray-900">
                    {difficultyOptions.find(
                      (d) => d.value === formData.Difficulty.toString(),
                    )?.label || "Chọn độ khó"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === "difficulty" ? "rotate-180 text-orange-500" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>

                {openDropdown === "difficulty" && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                    <ul className="py-2">
                      {difficultyOptions.map((diff) => (
                        <li
                          key={diff.value}
                          onClick={() =>
                            handleCustomSelect("Difficulty", diff.value)
                          }
                          className={`px-4 py-2.5 cursor-pointer transition-colors ${formData.Difficulty.toString() === diff.value ? "bg-orange-50 text-orange-600 font-bold" : "text-gray-700 hover:bg-gray-50 hover:text-orange-500"}`}
                        >
                          {diff.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Chuẩn bị (Phút)
                </label>
                <input
                  type="number"
                  name="PrepTime"
                  value={formData.PrepTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nấu (Phút)
                </label>
                <input
                  type="number"
                  name="CookTime"
                  value={formData.CookTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Khẩu phần (Người)
                </label>
                <input
                  type="number"
                  name="Servings"
                  value={formData.Servings}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* DANH SÁCH NGUYÊN LIỆU */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Nguyên liệu</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 bg-green-50 text-green-600 font-bold rounded-lg hover:bg-green-100 transition text-sm"
              >
                + Thêm nguyên liệu
              </button>
            </div>

            <div className="space-y-4">
              {formData.ingredients.map((ing, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-3 items-center"
                >
                  <input
                    type="text"
                    placeholder="Tên nguyên liệu (VD: Thịt heo)"
                    value={ing.IngredientName}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "IngredientName",
                        e.target.value,
                      )
                    }
                    className="flex-1 w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-green-500 rounded-xl outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Số lượng (VD: 200)"
                    value={ing.Quantity}
                    onChange={(e) =>
                      handleIngredientChange(index, "Quantity", e.target.value)
                    }
                    className="w-full sm:w-32 px-4 py-3 bg-gray-50 border border-transparent focus:border-green-500 rounded-xl outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Đơn vị (VD: gram)"
                    value={ing.Unit}
                    onChange={(e) =>
                      handleIngredientChange(index, "Unit", e.target.value)
                    }
                    className="w-full sm:w-32 px-4 py-3 bg-gray-50 border border-transparent focus:border-green-500 rounded-xl outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition"
                    title="Xóa"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 384 512"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                    </svg>
                  </button>
                </div>
              ))}
              {formData.ingredients.length === 0 && (
                <p className="text-gray-400 italic text-center py-4">
                  Chưa có nguyên liệu nào.
                </p>
              )}
            </div>
          </div>

          {/* CÁC BƯỚC LÀM */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Các bước thực hiện
              </h2>
              <button
                type="button"
                onClick={addStep}
                className="px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-100 transition text-sm"
              >
                + Thêm bước
              </button>
            </div>

            <div className="space-y-4">
              {formData.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start bg-gray-50 p-4 rounded-2xl"
                >
                  <div className="w-8 h-8 shrink-0 bg-orange-200 text-orange-700 font-black rounded-full flex items-center justify-center mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      rows="3"
                      placeholder={`Mô tả bước ${index + 1}...`}
                      value={step.Instruction}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      className="w-full px-4 py-3 border border-transparent focus:border-orange-500 rounded-xl outline-none resize-none bg-white"
                    ></textarea>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-2 text-red-400 hover:bg-red-100 rounded-xl transition mt-1"
                    title="Xóa bước"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 384 512"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                    </svg>
                  </button>
                </div>
              ))}
              {formData.steps.length === 0 && (
                <p className="text-gray-400 italic text-center py-4">
                  Chưa có bước thực hiện nào.
                </p>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-10 py-4 rounded-xl font-black text-white text-lg shadow-lg transition-all ${isSaving ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 hover:-translate-y-1"}`}
            >
              {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
