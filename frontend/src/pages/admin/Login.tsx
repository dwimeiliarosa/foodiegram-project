import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios"; 
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

try {
      const response = await api.post("/auth/login", { email, password });
      
      // PERUBAHAN DISINI: Pastikan mengambil dari response.data atau response.data.data
      // Coba gunakan log ini untuk memastikan struktur datanya di console
      console.log("Response Login:", response.data);

      // Jika backend kamu membungkus response dalam objek 'data'
      const loginData = response.data.data || response.data;
      const { accessToken, refreshToken, user } = loginData;

      if (accessToken) {
        localStorage.setItem("authToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken || "");
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect berdasarkan role
        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/"); 
        }
        
        // Tambahkan refresh kecil agar App.tsx mendeteksi token baru
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Email atau Password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white overflow-hidden">
        <div className="h-2 bg-[#F27F22]" /> 
        <CardHeader className="space-y-1 text-center pt-8">
          <CardTitle className="text-2xl font-bold text-slate-800">
            FoodieGram
          </CardTitle>
          <CardDescription>Masuk ke akun Anda</CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button className="w-full bg-[#F27F22] hover:bg-[#d96d1a] text-white py-6 text-lg font-semibold" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Masuk"}
            </Button>
          </form>
          <div className="text-center text-sm text-slate-500 mt-6">
            Belum punya akun? <Link to="/register" className="text-[#F27F22] font-semibold hover:underline">Daftar</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;