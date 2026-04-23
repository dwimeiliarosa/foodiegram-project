import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// --- IMPORT ADMIN (DARI REKANMU) ---
import Login from "./pages/admin/Login";
import Register from "./pages/admin/Register";
import Dashboard from "./pages/admin/dashboard"; 
import ManageRecipes from "./pages/admin/ManageRecipes";
import ManageCategories from "./pages/admin/ManageCategories";
import { Toaster } from 'sonner';

// --- IMPORT USER (MILIK WANDA) ---
import Home from './pages/user/Home'; 
import Profile from './pages/user/Profile';
import RecipeDetail from './pages/user/RecipeDetail';
import UploadRecipe from './pages/user/UploadRecipe';
import SettingsPage from './pages/user/SettingsPage';
import Navbar from './components/user/Navbar';

// Komponen Pembungkus agar hanya Admin yang bisa masuk
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      {/* Toaster dari admin diletakkan di paling atas agar notifikasi muncul global */}
      <Toaster position="top-right" richColors closeButton />
      
      <div className="min-h-screen bg-[#F5F5F5] text-foreground flex flex-col">
        <Routes>
          {/* ============================================================ */}
          {/* BAGIAN USER (WANDA) - Menggunakan Layout dengan Bottom Nav  */}
          {/* ============================================================ */}
          <Route path="/" element={
            <>
              <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                <Home />
              </main>
              <Navbar /> 
            </>
          } />
          
          <Route path="/recipe/:id" element={
            <>
              <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                <RecipeDetail />
              </main>
              <Navbar /> 
            </>
          } />

          <Route path="/profile" element={
            <>
              <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                <Profile />
              </main>
              <Navbar /> 
            </>
          } />

          <Route path="/upload" element={
            <>
              <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                <UploadRecipe />
              </main>
              <Navbar /> 
            </>
          } />

          <Route path="/settings" element={
            <>
              <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                <SettingsPage />
              </main>
              <Navbar /> 
            </>
          } />

          {/* ============================================================ */}
          {/* BAGIAN ADMIN (FINKAN) - Tanpa Navbar User                   */}
          {/* ============================================================ */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<Register />} />
          
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/resep" element={
            <ProtectedRoute>
              <ManageRecipes />
            </ProtectedRoute>
          } />

          <Route path="/admin/kategori" element={
            <ProtectedRoute>
              <ManageCategories />
            </ProtectedRoute>
          } />

          {/* ============================================================ */}
          {/* 404 - NOT FOUND                                              */}
          {/* ============================================================ */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen bg-white">
              <h1 className="text-2xl font-bold">404 - Tidak Ditemukan</h1>
              <p className="text-slate-500 mb-4">Halaman yang Anda cari tidak tersedia.</p>
              <button 
                onClick={() => window.location.href = "/"}
                className="text-orange-500 underline"
              >
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
