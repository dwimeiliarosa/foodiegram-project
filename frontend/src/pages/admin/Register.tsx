import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import { Eye, EyeOff, Lock, Mail, User, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Role langsung dikunci ke "user" secara default
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
        role: "user", // Memastikan data yang dikirim selalu 'user'
      });

      toast.success("Registrasi Berhasil!", {
        description: "Silakan masuk dengan akun baru Anda.",
      });
      
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal melakukan registrasi.");
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
              <UserPlus className="h-8 w-8 text-[#F27F22]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
            Daftar <span className="text-[#F27F22]">FoodieGram</span>
          </CardTitle>
          <CardDescription>
            Buat akun baru untuk mulai berbagi resep lezat
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          <div className="grid gap-6">
            {/* TABS ADMIN/USER TELAH DIHAPUS AGAR LEBIH AMAN */}

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="username" 
                    placeholder="nama_pengguna"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 focus-visible:ring-[#F27F22]"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nama@example.com"
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
                  <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendaftarkan...</span>
                ) : (
                  "Daftar Sekarang"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-[#F27F22] font-semibold hover:underline">
                Masuk di sini
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;