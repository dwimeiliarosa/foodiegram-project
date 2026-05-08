import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import api from "../../api/axios";
import { 
  Utensils, 
  Eye, 
  Heart, 
  TrendingUp
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface DashboardStats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalProtein: number;
  totalKarbo: number;
  totalLemak: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalProtein: 0, 
    totalKarbo: 0,   
    totalLemak: 0
  });
  const [chartDataState, setChartDataState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- FUNGSI UPDATE CHART ---
  const updateChart = (data: any) => {
    if (Array.isArray(data)) {
      setChartDataState({
        labels: data.map((r: any) => r.title),
        datasets: [{
          label: 'Jumlah Views',
          data: data.map((r: any) => r.views || 0),
          backgroundColor: '#F27F22',
          borderRadius: 10,
          barThickness: 40,
        }],
      });
    }
  };

  // --- FUNGSI AMBIL DATA ---
  const fetchDashboardData = async () => {
  setIsLoading(true);
  try {
    const statsRes = await api.get("/recipes/stats").catch(() => null);
    if (statsRes?.data) {
      // Pastikan semua field terisi agar tidak error
      setStats({
        totalPosts: statsRes.data.total_posts || 0,
        totalViews: statsRes.data.total_views || 0,
        totalLikes: statsRes.data.total_likes || 0,
        totalProtein: statsRes.data.total_protein || 0,
        totalKarbo: statsRes.data.total_karbo || 0,
        totalLemak: statsRes.data.total_lemak || 0
      });
    }

      // 2. Trending
      try {
        const trendingRes = await api.get("/recipes/trending");
        const trendingData = trendingRes.data.trending_recipes || trendingRes.data;
        if (Array.isArray(trendingData) && trendingData.length > 0) {
          updateChart(trendingData);
        } else {
          throw new Error();
        }
      } catch {
        // Data Dummy jika API Dwi belum ada isinya
        updateChart([
          { title: "Nasi Goreng", views: 450 },
          { title: "Sate Ayam", views: 380 },
          { title: "Soto Betawi", views: 310 }
        ]);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- TRIGGER SAAT HALAMAN DIBUKA ---
  useEffect(() => {
    fetchDashboardData();
  }, []); // Ini baru benar letaknya!


  // Fungsi helper untuk merapikan data ke Chart.js
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Kita sembunyikan legend karena sudah ada title
      title: { 
        display: true, 
        text: 'Performa Resep Terpopuler',
        font: { size: 16, weight: 'bold' as const },
        padding: { bottom: 20 }
      },
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { display: false } 
      },
      x: { 
        grid: { display: false } 
      }
    }
  };

  return (
  <div className="flex min-h-screen bg-[#F8FAFC]">
    <Sidebar />
    <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
      {/* HEADER SECTION - Lebih Personal */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Halo, Dwi! 👋
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Sistem mencatat <span className="text-[#F27F22]">{stats.totalViews.toLocaleString()}</span> interaksi hari ini.
          </p>
        </div>
        <div className="flex gap-3">
           <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-slate-600">Server Online</span>
           </div>
        </div>
      </header>

      {/* STATS CARDS SECTION - Lebih Estetik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Card Total Resep */}
        <div className="group bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:border-[#F27F22]/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
          <div className="relative z-10">
            <div className="bg-orange-100 w-14 h-14 rounded-2xl flex items-center justify-center text-[#F27F22] mb-6 group-hover:rotate-12 transition-transform">
              <Utensils size={28} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Resep</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-800">{stats.totalPosts}</p>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">Resep</span>
            </div>
          </div>
        </div>

        {/* Card Total Views */}
        <div className="group bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
          <div className="relative z-10">
            <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:rotate-12 transition-transform">
              <Eye size={28} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Tayangan</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-800">{stats.totalViews.toLocaleString()}</p>
              <TrendingUp size={20} className="text-blue-500 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Card Total Likes */}
        <div className="group bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
          <div className="relative z-10">
            <div className="bg-red-100 w-14 h-14 rounded-2xl flex items-center justify-center text-red-600 mb-6 group-hover:rotate-12 transition-transform">
              <Heart size={28} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Disukai</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-800">{stats.totalLikes.toLocaleString()}</p>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">Suka</span>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION - GRID SISTEM GIZI & PERFORMA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KIRI: GRAFIK GIZI (Doughnut) - Mengambil 5 dari 12 kolom grid */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
          {/* Efek hiasan background agar estetik */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />
          
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2.5 bg-green-100/50 rounded-2xl text-green-600">
              <Utensils size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Rataan Nutrisi</h2>
              <p className="text-sm text-slate-400">Komposisi gizi sistem</p>
            </div>
          </div>

          <div className="flex-1 relative min-h-[300px] flex items-center justify-center z-10">
            <Doughnut 
              data={{
                labels: ['Protein', 'Karbohidrat', 'Lemak'],
                datasets: [{
                  data: [stats.totalProtein || 30, stats.totalKarbo || 45, stats.totalLemak || 25],
                  backgroundColor: ['#F27F22', '#3B82F6', '#EF4444'],
                  borderWidth: 0,
                }]
              }}
              options={{
                cutout: '75%', // Letakkan cutout di sini
                maintainAspectRatio: false,
              }}
            />
            {/* Center Text Labels */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-black text-slate-800 tracking-tight">Gizi</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sistem</span>
            </div>
          </div>
        </div>

        {/* KANAN: ANALISIS PERFORMA (Bar Chart) - Mengambil 7 dari 12 kolom grid */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100/50 rounded-2xl text-[#F27F22]">
                <TrendingUp size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Analisis Performa</h2>
                <p className="text-sm text-slate-400">Berdasarkan kunjungan resep</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Real-time Data
              </span>
            </div>
          </div>
          
          <div className="h-[350px] w-full mt-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-10 h-10 border-4 border-orange-100 border-t-[#F27F22] rounded-full animate-spin" />
                <p className="text-slate-400 text-sm font-medium animate-pulse">Menyusun grafik...</p>
              </div>
            ) : chartDataState ? (
              <Bar 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: { display: false }
                  }
                }} 
                data={chartDataState} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-10 border-2 border-dashed border-slate-50 rounded-3xl">
                <p className="text-slate-400 italic text-sm">Belum ada data trending.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  </div>
);
};

export default Dashboard;