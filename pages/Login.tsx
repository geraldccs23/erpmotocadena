import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';
import { Bike, Lock, Mail, AlertCircle, Zap, ChevronRight, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { user, loading: authLoading, loginDemo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg("Introduce el email de staff y la llave de acceso.");
      return;
    }

    setLocalLoading(true);
    
    try {
      // Ejecución de login con el cliente configurado con Service Key
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: cleanEmail, 
        password: password 
      });
      
      if (error) {
        setLocalLoading(false);
        console.error("Error Auth:", error);
        setErrorMsg(error.message === 'Invalid login credentials' 
          ? 'Credenciales de Staff incorrectas. Verifica mayúsculas y minúsculas.' 
          : error.message);
        return;
      }

      console.log("Acceso concedido a Pits:", data.user?.email);
      // El hook useAuth se encargará de la redirección al detectar el cambio de sesión
      
    } catch (err: any) {
      setLocalLoading(false);
      setErrorMsg("Error de comunicación con el servidor central de MOTOCADENA.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md z-10">
        <div className="glass-panel p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-12">
            <div className="p-5 bg-zinc-900 rounded-[2rem] border border-amber-500/30 mb-6 group hover:scale-110 hover:rotate-3 transition-all duration-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Bike className="w-16 h-16 text-amber-500" />
            </div>
            <h1 className="heading-racing text-7xl text-zinc-100 text-glow-amber italic tracking-tighter leading-none">MOTOCADENA</h1>
            <p className="text-[10px] uppercase tracking-[0.5em] text-amber-500 font-black mt-3">Advanced Workshop Control</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-start gap-3 text-xs animate-shake">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest ml-3">Email Staff</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-zinc-100 focus:border-amber-500/50 outline-none transition-all placeholder:text-zinc-800"
                  placeholder="admin@motocadena.com"
                  disabled={localLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest ml-3">Clave de Acceso</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-zinc-100 focus:border-amber-500/50 outline-none transition-all placeholder:text-zinc-800"
                  placeholder="••••••••"
                  disabled={localLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={localLoading}
              className="w-full py-6 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-900 disabled:text-zinc-700 text-black font-black heading-racing text-4xl rounded-2xl shadow-[0_15px_40px_rgba(245,158,11,0.25)] flex items-center justify-center gap-4 transition-all active:scale-[0.97] mt-4 overflow-hidden relative group"
            >
              {localLoading ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>SINCRONIZANDO</span>
                </>
              ) : (
                <>
                  INGRESAR <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-zinc-900 text-center">
            <button 
              onClick={(e) => { e.preventDefault(); loginDemo(); }}
              className="flex items-center justify-center gap-3 w-full py-4 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-600 hover:text-amber-500 border border-zinc-800/50 rounded-2xl transition-all font-bold group"
            >
              <Zap size={20} className="group-hover:fill-amber-500 transition-all" />
              <span className="heading-racing text-2xl">Modo Supervivencia / Demo</span>
            </button>
            <p className="mt-4 text-[9px] text-zinc-700 uppercase font-bold tracking-[0.2em]">System Version 2.0.1 - High Performance Access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;