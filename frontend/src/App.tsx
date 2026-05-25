import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// --- IMPORT ADMIN ---
import Login from "./pages/admin/Login";
import Register from "./pages/admin/Register";
import Dashboard from "./pages/admin/dashboard"; 
import ManageRecipes from "./pages/admin/ManageRecipes";
import ManageCategories from "./pages/admin/ManageCategories";
import { Toaster } from 'sonner';

// --- IMPORT USER ---
import Home from './pages/user/Home'; 
import Profile from './pages/user/Profile';
import DetailRecipe from './pages/user/DetailRecipe';
import UploadRecipe from './pages/user/UploadRecipe';
import SettingsPage from './pages/user/SettingsPage';
import Navbar from './components/user/Navbar';
import EditProfile from './pages/user/EditProfile'; // Tambahkan ini
import Search from "./pages/user/Search"; // Sesuaikan folder tempat kamu menyimpan Search.tsx
import NotificationPage from "./pages/user/NotificationPage"; // Import filenya
import UserProfile from "./pages/user/UserProfile";

// Di dalam <Routes>
<Route path="/notifications" element={<NotificationPage />} />

// --- KOMPONEN PROTECTED ROUTE ---
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: "admin" | "user" }) => {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  if (!token || role !== allowedRole) {
    return <Navigate to={allowedRole === "admin" ? "/admin/login" : "/login"} replace />;
  }
  return <>{children}</>;
};

function App() {
  // Cek apakah user sudah login untuk rute publik yang ingin kita proteksi
  const isAuthenticated = !!localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  return (
    <Router>
      <Toaster position="top-right" richColors closeButton />
      
      <div className="min-h-screen bg-[#F5F5F5] text-foreground flex flex-col">
        <Routes>
          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          
          {/* BAGIAN USER (WANDA) */}
          {/* Jika ingin Home hanya bisa dilihat setelah login, gunakan pengecekan di bawah */}
          <Route path="/" element={
            isAuthenticated ? (
              <><main className="flex-1 container mx-auto px-4 py-8 pb-24"><Home /></main><Navbar /></>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          <Route path="/search" element={
            <ProtectedRoute allowedRole="user">
               <main className="flex-1 container mx-auto px-4 py-8 pb-24"><Search /></main>
            </ProtectedRoute>
          } />
          <Route path="/recipe/:id" element={
            <ProtectedRoute allowedRole="user">
              <main className="flex-1 container mx-auto px-4 py-8 pb-24"><DetailRecipe /></main>
              <Navbar /> 
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute allowedRole="user">
              <main className="flex-1 container mx-auto px-4 py-8 pb-24"><Profile /></main>
              <Navbar /> 
            </ProtectedRoute>
          } />

          <Route path="/user/:id" element={
  <ProtectedRoute allowedRole="user">
    <main className="flex-1 container mx-auto px-4 py-8 pb-24"><UserProfile /></main>
    <Navbar /> 
  </ProtectedRoute>
} />

          <Route path="/upload" element={
            <ProtectedRoute allowedRole="user">
              <main className="flex-1 container mx-auto px-4 py-8 pb-24"><UploadRecipe /></main>
              <Navbar /> 
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={<NotificationPage />} />

          <Route path="/settings" element={
            <ProtectedRoute allowedRole="user">
              <main className="flex-1 container mx-auto px-4 py-8 pb-24"><SettingsPage /></main>
              <Navbar /> 
            </ProtectedRoute>
          } />

          <Route path="/edit-profile" element={
          <ProtectedRoute allowedRole="user">
            <main className="flex-1 container mx-auto px-4 py-8 pb-24"><EditProfile /></main>
            <Navbar /> 
          </ProtectedRoute>
         } />

          {/* BAGIAN ADMIN (FINKAN) */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRole="admin">
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/resep" element={
            <ProtectedRoute allowedRole="admin">
              <ManageRecipes />
            </ProtectedRoute>
          } />

          <Route path="/admin/kategori" element={
            <ProtectedRoute allowedRole="admin">
              <ManageCategories />
            </ProtectedRoute>
          } />

          {/* 404 - NOT FOUND */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen bg-white">
              <h1 className="text-2xl font-bold">404 - Tidak Ditemukan</h1>
              <p className="text-slate-500 mb-4">Halaman yang Anda cari tidak tersedia.</p>
              <button onClick={() => window.location.href = "/"} className="text-orange-500 underline">
                Kembali ke Beranda
              </button>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;