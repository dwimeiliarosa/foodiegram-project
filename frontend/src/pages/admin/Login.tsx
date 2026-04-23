import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios"; // Pastikan path ini benar menuju file axios.ts kamu
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const navigate = useNavigate();
  
  // State untuk Input & UI
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Memanggil API login
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      /**
       * PERBAIKAN UTAMA:
       * Di backend (authController.js), variabelnya bernama 'accessToken'.
       * Jadi kita harus ambil 'accessToken', bukan 'token'.
       */
      const { accessToken, refreshToken, user } = response.data; 
      
      if (accessToken) {
        // Simpan token ke localStorage (Key "authToken" harus sama dengan yang di axios.ts kamu)
        localStorage.setItem("authToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken); 
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect berdasarkan role dari database
        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/"); 
        }
      }
    } catch (err: any) {
      // Mengambil pesan error dari backend (misal: "Email atau Password salah")
      setError(err.response?.data?.message || "Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white overflow-hidden">
        <div className="h-2 bg-[#F27F22]" /> 
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <img src="/logo-foodiegram.png" alt="Logo" className="h-12 w-12 object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
            FoodieGram <span className="text-[#F27F22]">Admin</span>
          </CardTitle>
          <CardDescription>
            Masuk untuk mengelola konten resep dan pengguna
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          <div className="grid gap-6">
            <Tabs defaultValue="admin" onValueChange={(value) => setRole(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100">
                <TabsTrigger value="admin" className="data-[state=active]:bg-[#F27F22] data-[state=active]:text-white">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Admin
                </TabsTrigger>
                <TabsTrigger value="user" className="data-[state=active]:bg-[#F27F22] data-[state=active]:text-white">
                  <User className="w-4 h-4 mr-2" /> User
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@foodiegram.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 focus-visible:ring-[#F27F22]"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 focus-visible:ring-[#F27F22]"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-[#F27F22]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                className="w-full mt-2 bg-[#F27F22] hover:bg-[#d96d1a] text-white py-6 text-lg font-semibold" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mohon Tunggu...</span>
                ) : (
                  `Masuk sebagai ${role.charAt(0).toUpperCase() + role.slice(1)}`
                )}
              </Button>
            </form>

              <div className="text-center text-sm text-slate-500 mt-6">
                Belum punya akun?{" "}
                <Link to="/register" className="text-[#F27F22] font-semibold hover:underline">
                  Daftar Akun Baru
                </Link>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;