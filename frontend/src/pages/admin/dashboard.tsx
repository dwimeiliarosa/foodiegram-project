import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import api from "../../lib/axios";
import { 
  Utensils, 
  Eye, 
  Heart, 
  TrendingUp, 
  Loader2 
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0
  });
  const [chartDataState, setChartDataState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const statsRes = await api.get("/recipes/stats");
        if (statsRes.data) {
          setStats({
            totalPosts: statsRes.data.total_posts || 0,
            totalViews: statsRes.data.total_views || 0,
            totalLikes: statsRes.data.total_likes || 0
          });
        }

        const trendingRes = await api.get("/recipes/trending");
        const trendingData = trendingRes.data.trending_recipes || trendingRes.data;

        if (Array.isArray(trendingData)) {
          setChartDataState({
            labels: trendingData.map((r: any) => r.title),
            datasets: [
              {
                label: 'Jumlah Views',
                data: trendingData.map((r: any) => r.views),
                backgroundColor: '#F27F22',
                hoverBackgroundColor: '#d96d1a',
                borderRadius: 10,
                barThickness: 40,
              },
            ],
          });
        }
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Halo, Admin Finkan! 👋</h1>
          <p className="text-slate-500">Berikut adalah ringkasan performa FoodieGram hari ini.</p>
        </header>

        {/* Statistik Ringkas dengan Icon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Total Resep */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                <Utensils size={24} />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Aktif</span>
            </div>
            <p className="text-sm font-medium text-slate-500">Total Resep</p>
            <p className="text-3xl font-bold text-slate-800">{stats.totalPosts}</p>
          </div>

          {/* Card Total Views */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Eye size={24} />
              </div>
              <TrendingUp className="text-blue-400" size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Total Views</p>
            <p className="text-3xl font-bold text-slate-800">{stats.totalViews.toLocaleString()}</p>
          </div>

          {/* Card Total Likes */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-xl text-red-600">
                <Heart size={24} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Total Likes</p>
            <p className="text-3xl font-bold text-slate-800">{stats.totalLikes.toLocaleString()}</p>
          </div>
        </div>

        {/* Area Grafik Trending */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6 text-slate-700">
            <TrendingUp size={20} className="text-[#F27F22]" />
            <h2 className="font-bold">Analitik Trending</h2>
          </div>
          
          <div className="h-[350px] relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Loader2 className="animate-spin text-[#F27F22]" size={32} />
                <p className="text-slate-400 text-sm">Menghitung statistik...</p>
              </div>
            ) : chartDataState ? (
              <Bar options={chartOptions} data={chartDataState} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400 italic text-sm">Data trending belum tersedia.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;