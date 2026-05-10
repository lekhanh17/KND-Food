export const getImageUrl = (url) => {
  if (!url) return "/default-food.png"; // Ảnh mặc định nếu trống

  // Nếu là link Cloudinary
  if (url.startsWith("http")) {
    return url.replace("http://localhost:5000", import.meta.env.VITE_API_URL);
  }

  // Nếu là link cũ
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${import.meta.env.VITE_API_URL}${cleanUrl}`;
};