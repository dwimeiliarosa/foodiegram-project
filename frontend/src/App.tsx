import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      {/* Container utama dengan background dari Shadcn/Tailwind */}
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* RUTE BAGIAN WANDA (USER) - Diakses di http://localhost:5173/ */}
          <Route path="/" element={
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
              <h1 className="text-5xl font-extrabold text-orange-500 tracking-tight">FoodieGram 🥘</h1>
              <p className="text-muted-foreground text-xl">Halaman Feed - Tugas Wanda</p>
              <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all font-medium shadow-lg">
                Jelajahi Resep
              </button>
            </div>
          } />

          {/* RUTE BAGIAN FINKAN (ADMIN) - Diakses di http://localhost:5173/admin */}
          <Route path="/admin" element={
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 space-y-4">
              <div className="p-8 bg-white shadow-xl rounded-2xl border border-slate-200 text-center">
                <h1 className="text-3xl font-bold text-slate-800">Dashboard Admin</h1>
                <p className="mt-2 text-slate-500">Kelola Konten - Tugas Finkan</p>
                <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Sistem Ready
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;