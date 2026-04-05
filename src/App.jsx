import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from './pages/ForgotPassword';
import RegisterPage from "./pages/RegisterPage";
import UserPage from "./pages/UserPage";
import CreateRecipe from './pages/CreateRecipe';

// --- IMPORT ADMIN ---
import AdminRoute from "./components/AdminRoute"; 
import AdminDashboard from "./pages/AdminDashboard"; 

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import RecipeDetail from './pages/RecipeDetail';
import EditRecipe from './pages/EditRecipe';

function NotificationBanner() {
  const [notifications, setNotifications] = useState(() => {
    const sharedRecipes = localStorage.getItem("sharedRecipes");
    if (sharedRecipes) {
      const recipes = JSON.parse(sharedRecipes);
      return recipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        message: `Đã nhận được ${recipe.likes || 0} lượt thích!`,
        time: "Vừa xong",
      }));
    }
    return [];
  });

  const [showInBody, setShowInBody] = useState(() => {
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      return settings.showNotificationsInBody;
    }
    return false;
  });

  useEffect(() => {
    const handleStorage = () => {
      const userSettings = localStorage.getItem("userSettings");
      if (userSettings) {
        const settings = JSON.parse(userSettings);
        setShowInBody(settings.showNotificationsInBody);
      }

      const sharedRecipes = localStorage.getItem("sharedRecipes");
      if (sharedRecipes) {
        const recipes = JSON.parse(sharedRecipes);
        const notifs = recipes.map((recipe) => ({
          id: recipe.id,
          title: recipe.title,
          message: `Đã nhận được ${recipe.likes || 0} lượt thích!`,
          time: "Vừa xong",
        }));
        setNotifications(notifs);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!showInBody || notifications.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-40 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-orange-500 text-white p-4 rounded-lg shadow-lg"
        >
          <h4 className="font-semibold">{notification.title}</h4>
          <p className="text-sm mt-1">{notification.message}</p>
          <span className="text-xs opacity-75 mt-1 block">
            {notification.time}
          </span>
        </div>
      ))}
    </div>
  );
}

// --- COMPONENT XỬ LÝ LOGIC ẨN NAVBAR & FOOTER ---
function AppContent() {
  const location = useLocation();

  // Các trang ko hiện Navbar và Footer
  const hideLayoutPaths = ["/login", "/register", "/admin", "/forgot-password"];
  const shouldHideLayout = hideLayoutPaths.includes(location.pathname);

  return (
    // Thêm flex flex-col min-h-screen để ép Footer xuống đáy màn hình
    <div className="min-h-screen bg-white flex flex-col">
      
      {!shouldHideLayout && <Navbar />}
      {!shouldHideLayout && <NotificationBanner />}

      {/* Thêm flex-grow để nội dung chính tự đẩy Footer xuống */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<UserPage />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/edit-recipe/:id" element={<EditRecipe />} />
          
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Hiển thị Footer nếu không nằm trong danh sách cấm */}
      {!shouldHideLayout && <Footer />}

    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={false}
        theme="dark"
        toastClassName={() => 
          "relative flex items-center justify-center p-4 mb-4 min-h-12 rounded-full justify-between overflow-hidden cursor-pointer bg-gray-900 text-white shadow-2xl font-bold text-sm text-center"
        }
      />
    </Router>
  );
}

export default App;