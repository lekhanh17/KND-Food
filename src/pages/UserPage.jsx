import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function UserPage() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null); 
  const settingsMenuRef = useRef(null); 

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false); 

  const [activeTab, setActiveTab] = useState('Bài đăng của tôi'); 
  const tabs = ['Bài đăng của tôi', 'Đăng lại', 'Đã lưu', 'Yêu thích'];

  const [formFullName, setFormFullName] = useState(() => user?.FullName || '');
  const [formUsername, setFormUsername] = useState(() => user?.Username || '');
  const [formBio, setFormBio] = useState(() => user?.Bio || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setIsSettingsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng chọn file hình ảnh!");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('UserID', user.UserID);

    try {
      const response = await fetch('http://localhost:5000/api/users/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        const updatedUser = { ...user, Avatar: data.avatarUrl };
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event('user-changed'));
      } else {
        toast.error('❌ ' + data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối Server khi tải ảnh!");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const trimmedName = formFullName.trim();
    const trimmedUsername = formUsername.trim();
    const trimmedBio = formBio.trim();

    if (!trimmedName) {
      toast.warning('Vui lòng điền họ tên.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: user.UserID,
          FullName: trimmedName,
          Email: user.Email, 
          Username: trimmedUsername, 
          Bio: trimmedBio            
        })
      });

      if (response.ok) {
        const updatedUser = { 
          ...user, 
          FullName: trimmedName, 
          Username: trimmedUsername, 
          Bio: trimmedBio 
        };
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event('user-changed'));
        
        setIsEditingProfile(false); 
      } else {
        const data = await response.json();
        toast.error('❌ Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('❌ Không thể kết nối đến Server!');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) return toast.error('⚠️ Mật khẩu mới không khớp!');
    if (newPassword.length < 6) return toast.warning('⚠️ Mật khẩu ít nhất 6 ký tự!');

    try {
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: user.UserID,
          CurrentPassword: currentPassword,
          NewPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 ' + data.message);
        setIsChangePasswordOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        toast.error('❌ ' + data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('❌ Không thể kết nối đến Server!');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
        <Link to="/login" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition">Đăng nhập</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-14 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-8 pt-8">
          
          <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current.click()}>
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {user.Avatar ? (
                <img src={user.Avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-black text-orange-500 uppercase">{user.FullName?.charAt(0)}</span>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
          </div>

          <div className="flex flex-col items-center sm:items-start w-full">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.FullName}</h1>
            {user.Username && (
              <p className="text-gray-500 font-medium text-sm mt-0.5">@{user.Username}</p>
            )}
            
            <div className="flex items-center gap-2 mt-4">
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="px-6 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.152-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
                Chỉnh sửa hồ sơ
              </button>
              
              <div className="relative" ref={settingsMenuRef}>
                <button 
                  onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-all active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {isSettingsMenuOpen && (
                  <div className="absolute right-0 sm:left-0 mt-2 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-10 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() => {
                        setIsChangePasswordOpen(true);
                        setIsSettingsMenuOpen(false); 
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-sm font-bold transition-colors flex items-center gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M8 7a5 5 0 113.61 4.804l-1.903 1.903A1 1 0 019 14H8v1a1 1 0 01-1 1H6v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-2a1 1 0 01.293-.707L8.196 8.39A5.002 5.002 0 018 7zm5-3a.5.5 0 000 1h.5a.5.5 0 01.5.5v.5a.5.5 0 001 0v-.5A1.5 1.5 0 0013.5 4H13z" clipRule="evenodd" />
                      </svg>
                      Đổi mật khẩu
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-6 mt-5 text-sm">
              <div className="flex gap-1.5 cursor-pointer hover:underline"><span className="font-bold text-gray-900">0</span> <span className="text-gray-500">Đang follow</span></div>
              <div className="flex gap-1.5 cursor-pointer hover:underline"><span className="font-bold text-gray-900">0</span> <span className="text-gray-500">Follower</span></div>
              <div className="flex gap-1.5 cursor-pointer hover:underline"><span className="font-bold text-gray-900">0</span> <span className="text-gray-500">Thích</span></div>
            </div>

            <div className="mt-4 text-gray-900 font-medium text-sm whitespace-pre-wrap">
              <p>{user.Bio ? user.Bio : 'Chưa có tiểu sử.'}</p>
            </div>
          </div>
        </div>

        {/* MENU NGANG */}
        <div className="flex border-b border-gray-200 mt-4 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3.5 font-bold text-sm whitespace-nowrap transition-colors relative ${
                activeTab === tab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></div>
              )}
            </button>
          ))}
        </div>

        {/* NỘI DUNG TABS */}
        <div className="py-8">
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-in fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mb-4 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-800">Chưa có {activeTab.toLowerCase()} nào</h3>
            {activeTab === 'Bài đăng của tôi' && <p className="text-sm mt-1">Các món ăn bạn chia sẻ sẽ xuất hiện tại đây.</p>}
          </div>
        </div>
      </div>

      {/* MODAL EDIT PROFILE */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-2xl font-black text-gray-900">Sửa hồ sơ</h3>
              <button onClick={() => setIsEditingProfile(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition font-bold">✕</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="editProfileForm" onSubmit={handleUpdateProfile} className="space-y-6">
                
                <div className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 pb-6">
                  <div className="w-full sm:w-1/4 text-sm font-bold text-gray-800 pt-2">Ảnh hồ sơ</div>
                  <div className="w-full sm:w-3/4 flex justify-center sm:justify-start">
                    <div className="relative cursor-pointer group" onClick={() => modalFileInputRef.current.click()}>
                      <div className="w-24 h-24 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shadow-sm">
                        {user.Avatar ? (
                          <img src={user.Avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-black text-orange-500 uppercase">{user.FullName?.charAt(0)}</span>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-white border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center shadow-md group-hover:bg-gray-50 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-700">
                          <path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.152-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                        </svg>
                      </div>
                      <input type="file" ref={modalFileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    </div>
                  </div>
                </div>

                {/* --- KHU VỰC USERNAME ÁP DỤNG LUẬT MỚI --- */}
                <div className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 pb-6">
                  <div className="w-full sm:w-1/4 text-sm font-bold text-gray-800 pt-3">Tên người dùng</div>
                  <div className="w-full sm:w-3/4">
                    <input
                      type="text"
                      placeholder="Username"
                      value={formUsername}
                      maxLength={16} // Giới hạn tối đa 16 ký tự
                      onChange={(e) => {
                        // 1. Chuyển tất cả thành chữ thường
                        // 2. Loại bỏ các ký tự không hợp lệ bằng Regex (chỉ giữ lại a-z, 0-9, dấu chấm, dấu gạch dưới)
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
                        setFormUsername(val);
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-gray-300 focus:bg-white transition-all font-medium text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      Tên người dùng chỉ có thể chứa chữ cái thường, số, dấu gạch dưới và dấu chấm. Tối đa 16 ký tự. Thay đổi tên người dùng của bạn cũng sẽ thay đổi liên kết hồ sơ của bạn.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 pb-6">
                  <div className="w-full sm:w-1/4 text-sm font-bold text-gray-800 pt-3">Tên</div>
                  <div className="w-full sm:w-3/4">
                    <input
                      type="text"
                      required
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-gray-300 focus:bg-white transition-all font-medium text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Bạn chỉ có thể thay đổi biệt danh 7 ngày một lần.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pb-2">
                  <div className="w-full sm:w-1/4 text-sm font-bold text-gray-800 pt-3">Tiểu sử</div>
                  <div className="w-full sm:w-3/4">
                    <textarea
                      rows="4"
                      placeholder="Tiểu sử"
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      maxLength={80}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-gray-300 focus:bg-white transition-all font-medium text-gray-900 resize-none"
                    ></textarea>
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {formBio.length}/80
                    </p>
                  </div>
                </div>

              </form>
            </div>

            <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-[24px] shrink-0">
              <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition">
                Hủy
              </button>
              <button type="submit" form="editProfileForm" disabled={!formFullName.trim()} className={`px-6 py-2.5 text-white rounded-lg font-bold transition ${formFullName.trim() ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-300 cursor-not-allowed'}`}>
                Lưu
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL ĐỔI MẬT KHẨU */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Đổi mật khẩu</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input type="password" placeholder="Mật khẩu hiện tại" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white transition-colors"/>
              <input type="password" placeholder="Mật khẩu mới" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white transition-colors"/>
              <input type="password" placeholder="Nhập lại mật khẩu mới" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white transition-colors"/>
              
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsChangePasswordOpen(false)} className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-[#f97316] text-white rounded-xl font-bold hover:bg-[#ea580c] transition-colors">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}