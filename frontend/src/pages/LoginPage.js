import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const LOGIN_BG = "https://static.prod-images.emergentagent.com/jobs/c19a0984-e82e-494a-88ed-ca23a6e50af4/images/1c7ab59a45ac931c0be81a71c7958007437679b24a3e561dd67846ca22b32986.png";
const LOGO = "https://static.prod-images.emergentagent.com/jobs/c19a0984-e82e-494a-88ed-ca23a6e50af4/images/79d39cdf6f7a79fab98f970d607b22ce980c214e0ef3771881e5abae75ac250c.png";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Login realizado com sucesso');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${LOGIN_BG})` }}
      >
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <img src={LOGO} alt="FALINTIL-FDTL" className="w-40 h-40 mb-8" />
          <h1 className="text-3xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            FALINTIL-FDTL
          </h1>
          <p className="text-lg text-slate-300 text-center">
            Personal Management System
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src={LOGO} alt="FALINTIL-FDTL" className="w-24 h-24 mb-4" />
            <h1 className="text-2xl font-bold text-emerald-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              FALINTIL-FDTL
            </h1>
          </div>

          <Card className="border border-slate-200 rounded-sm shadow-none">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                FALINTIL-FDTL: Personal Management System (PMS)
              </CardTitle>
              <p className="text-sm text-center text-slate-500">
                Faça login para acessar o sistema
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-sm border-slate-300 focus:border-emerald-900 focus:ring-emerald-900"
                      data-testid="login-email-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha" className="text-slate-700">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="pl-10 pr-10 rounded-sm border-slate-300 focus:border-emerald-900 focus:ring-emerald-900"
                      data-testid="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-900 hover:bg-emerald-800 text-white rounded-sm"
                  data-testid="login-submit-button"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-xs text-slate-500">
            FALINTIL-FDTL: Divisão de Comunicação e Sistema de Informação @2026
          </p>
        </div>
      </div>
    </div>
  );
}
