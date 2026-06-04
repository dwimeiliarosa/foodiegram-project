import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'sonner';

// --- IMPORT ADMIN ---
import Login from "./pages/admin/Login";
import Register from "./pages/admin/Register";
import Dashboard from "./pages/admin/dashboard"; 
import ManageRecipes from "./pages/admin/ManageRecipes";
import ManageCategories from "./pages/admin/ManageCategories";
import ProfileAdmin from "./pages/admin/ProfileAdmin";
import UserManagement from "./pages/admin/UserManagement";

// --- IMPORT USER ---
import Home from './pages/user/Home'; 
import Profile from './pages/user/Profile';
import RecipeDetail from './pages/user/DetailRecipe'; // Pastikan path ini benar sesuai strukturmu
import UploadRecipe from './pages/user/UploadRecipe';
import SettingsPage from './pages/user/SettingsPage';
import Navbar from './components/user/Navbar';
import EditProfile from './pages/user/EditProfile';
import Search from "./pages/user/Search";
import NotificationPage from "./pages/user/NotificationPage";
import UserProfile from "./pages/user/UserProfile";

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
  const isAuthenticated = !!localStorage.getItem("authToken");

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

          {/* BAGIAN USER */}
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
              <Navbar />
            </ProtectedRoute>
          } />

          <Route path="/recipe/:id" element={
            <ProtectedRoute allowedRole="user">
              <main className="flex-1 container mx-auto px-4 py-8 pb-24"><RecipeDetail /></main>
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

          <Route path="/notifications" element={
            <ProtectedRoute allowedRole="user">
              <main className="flex-1 container mx-auto px-4 py-8 pb-24"><NotificationPage /></main>
              <Navbar />
            </ProtectedRoute>
          } />

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

          {/* BAGIAN ADMIN */}
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

          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRole="admin">
              <ProfileAdmin />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRole="admin">
              <UserManagement />
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