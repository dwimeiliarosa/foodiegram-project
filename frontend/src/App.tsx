import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/admin/Login";
import Register from "./pages/admin/Register";
import Dashboard from "./pages/admin/dashboard"; 
import ManageRecipes from "./pages/admin/ManageRecipes";
import ManageCategories from "./pages/admin/ManageCategories";
import { Toaster } from 'sonner';

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
      <Toaster position="top-right" richColors closeButton />
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<div>Halaman User (Coming Soon)</div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rute-rute di bawah ini diproteksi (Hanya Admin) */}
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

          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen">
              <h1 className="text-2xl font-bold">404 - Tidak Ditemukan</h1>
              <a href="/admin/login" className="text-orange-500 underline">Kembali ke Login</a>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App