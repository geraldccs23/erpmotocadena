
import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, Mail, Trash2, Edit, X, Loader2, Phone, 
  CheckCircle2, UserCheck, Shield, 
  RefreshCcw, AlertTriangle, ShieldAlert, Database,
  Terminal, Search, Activity
} from 'lucide-react';
import { Role, UserProfile } from '../types';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';

const ROLES_PERMITIDOS: Role[] = ['DIRECTOR', 'GERENTE_GENERAL', 'ADMINISTRADOR'];

const RoleBadge = ({ role }: { role: Role }) => {
  const colors: Record<string, string> = {
    DIRECTOR: 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
    GERENTE_GENERAL: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    ADMINISTRADOR: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    MECANICO: 'bg-zinc-100 text-black border-zinc-300 font-black',
    VENDEDOR: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
  };

  return (
    <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${colors[role] || 'bg-zinc-900 text-zinc-500'}`}>
      {role?.replace('_', ' ') || 'SIN ROL'}
    </span>
  );
};

const Users: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Iniciando escaneo de Staff MOTOCADENA...");
      
      // Consulta directa sin filtros para asegurar que vemos todo lo permitido por RLS
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*');

      if (fetchError) throw fetchError;

      if (data) {
        console.log(`✅ Sincronización exitosa: ${data.length} integrantes detectados.`);
        setUsers(data as UserProfile[]);
      }
    } catch (e: any) {
      console.error("Fallo en escaneo:", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Solo disparamos la carga si el perfil está listo y es autorizado
    if (!authLoading && profile && ROLES_PERMITIDOS.includes(profile.role)) {
      fetchUsers();
    }
  }, [profile, authLoading, fetchUsers]);

  // Pantalla de Carga de Seguridad
  if (authLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-amber-500" />
          <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500/20 w-8 h-8" />
        </div>
        <p className="heading-racing text-3xl text-zinc-500 tracking-[0.3em] uppercase animate-pulse">Autenticando Nivel de Acceso...</p>
      </div>
    );
  }
  
  // Bloqueo de Seguridad para Roles no autorizados
  if (!profile || !ROLES_PERMITIDOS.includes(profile.role)) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <ShieldAlert size={48} />
        </div>
        <h2 className="heading-racing text-6xl text-zinc-100 italic tracking-tighter">ACCESO RESTRINGIDO</h2>
        <p className="text-zinc-500 uppercase tracking-widest text-xs font-black text-center max-w-sm leading-loose">
          Tu rango actual (<span className="text-amber-500">{profile?.role || 'INVITADO'}</span>) no tiene los privilegios necesarios para consultar los expedientes del personal.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-black text-amber-500 tracking-widest uppercase">
              Control de Dirección
            </div>
            {loading && <Loader2 size={14} className="animate-spin text-zinc-600" />}
          </div>
          <h1 className="heading-racing text-7xl text-zinc-100 text-glow-amber italic tracking-tighter leading-none uppercase">Staff & Mecánicos</h1>
          <p className="text-zinc-500 text-sm italic mt-2">"El alma técnica y operativa de MOTOCADENA."</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={fetchUsers}
            className="p-5 bg-zinc-900 text-zinc-600 hover:text-amber-500 border border-zinc-800 rounded-2xl transition-all active:scale-90 group"
            title="Sincronización Profunda"
          >
            <RefreshCcw size={28} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button className="flex items-center gap-3 bg-amber-500 text-black px-10 py-5 rounded-2xl font-bold heading-racing text-4xl hover:bg-amber-400 shadow-[0_10px_40px_rgba(245,158,11,0.4)] transition-all active:scale-95 group">
            <UserPlus size={32} /> Nuevo Staff
          </button>
        </div>
      </div>

      {/* MÉTRICAS DE RENDIMIENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-8 rounded-[2rem] border border-white/5 flex items-center gap-6 shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Database size={80} /></div>
          <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center text-amber-500 border border-zinc-800 shadow-inner">
            <UserCheck size={36} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Total Staff</p>
            <p className="heading-racing text-6xl text-zinc-100">{loading ? '...' : users.length}</p>
          </div>
        </div>
        
        <div className="glass-panel p-8 rounded-[2rem] border border-white/5 flex items-center gap-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500"><Activity size={80} /></div>
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Operativos</p>
            <p className="heading-racing text-6xl text-emerald-500">{loading ? '...' : users.filter(u => u.is_active).length}</p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] border border-white/5 flex items-center gap-6 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500"><Terminal size={80} /></div>
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-inner">
            <Shield size={36} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Cuerpo Técnico</p>
            <p className="heading-racing text-6xl text-blue-500">{loading ? '...' : users.filter(u => u.role?.includes('MECANICO')).length}</p>
          </div>
        </div>
      </div>

      {/* BUSCADOR DE STAFF */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-amber-500 transition-colors" size={24} />
        <input 
          type="text" 
          placeholder="Filtrar por nombre, correo o cargo..."
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl py-6 pl-16 pr-6 text-zinc-100 focus:border-amber-500/50 outline-none backdrop-blur-xl transition-all text-lg font-bold shadow-2xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ERROR FEEDBACK */}
      {error && (
        <div className="glass-panel p-6 rounded-3xl border border-red-500/30 bg-red-500/5 flex items-center gap-4 animate-shake">
          <AlertTriangle className="text-red-500" size={32} />
          <div>
            <p className="text-red-500 font-bold heading-racing text-xl uppercase tracking-widest italic leading-none">Error de enlace con DB</p>
            <p className="text-red-400/70 text-[10px] font-black uppercase tracking-widest mt-1">{error}</p>
          </div>
          <button onClick={fetchUsers} className="ml-auto px-4 py-2 bg-red-500 text-black rounded-lg font-bold text-[10px] uppercase">Reintentar</button>
        </div>
      )}

      {/* TABLA MAESTRA DE PERSONAL */}
      <div className="glass-panel rounded-[3rem] border border-zinc-800 shadow-2xl overflow-hidden min-h-[450px] flex flex-col relative">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 sticky top-0 z-10">
              <tr>
                <th className="px-10 py-8 heading-racing text-zinc-600 text-xs tracking-[0.3em] uppercase italic">Integrante / Expediente</th>
                <th className="px-10 py-8 heading-racing text-zinc-600 text-xs tracking-[0.3em] uppercase italic">Comunicación</th>
                <th className="px-10 py-8 heading-racing text-zinc-600 text-xs tracking-[0.3em] uppercase italic text-center">Rango Corporativo</th>
                <th className="px-10 py-8 heading-racing text-zinc-600 text-xs tracking-[0.3em] uppercase italic text-center">Estado Operativo</th>
                <th className="px-10 py-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-32 text-center">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto text-amber-500 mb-6 opacity-40" />
                    <p className="heading-racing text-4xl text-zinc-700 tracking-[0.4em] uppercase animate-pulse italic">Escaneando Pista...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-40 text-center">
                    <div className="max-w-md mx-auto space-y-6">
                       <Database className="w-20 h-20 text-zinc-800 mx-auto mb-4 opacity-10" />
                       <h3 className="heading-racing text-5xl text-zinc-800 uppercase italic tracking-[0.4em] opacity-40 leading-none">Sin Personal Registrado.</h3>
                       <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest leading-loose">
                         No se detectaron perfiles vinculados a tu taller. Verifica la tabla <code className="bg-zinc-950 px-2 py-1 rounded text-amber-500/50">user_profiles</code> en tu consola de Supabase.
                       </p>
                       <div className="flex justify-center gap-4 mt-6">
                         <button onClick={fetchUsers} className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-amber-500 rounded-2xl font-black heading-racing text-2xl hover:bg-zinc-800 transition-all uppercase tracking-widest">Forzar Sincronización</button>
                       </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-500/[0.03] transition-colors group">
                    <td className="px-10 py-9">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-amber-500 heading-racing text-4xl shadow-2xl group-hover:scale-110 transition-transform duration-500 uppercase italic">
                          {u.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-zinc-100 font-black text-2xl tracking-tight leading-none mb-2 italic uppercase">{u.full_name || 'Sin Nombre'}</div>
                          <div className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] bg-zinc-950 px-2 py-1 rounded-md border border-zinc-900 inline-block">Socio ID: {u.id.slice(0,8).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-9">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-zinc-400 text-sm font-medium"><Mail size={14} className="text-zinc-700" /> {u.email || 'S/E'}</div>
                        <div className="flex items-center gap-3 text-zinc-600 text-[10px] font-black uppercase tracking-widest"><Phone size={14} className="text-zinc-700" /> {u.phone || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-10 py-9 text-center"><RoleBadge role={u.role} /></td>
                    <td className="px-10 py-9 text-center">
                      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black tracking-[0.2em] border ${u.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                        {u.is_active ? 'OPERATIVO' : 'SUSPENDIDO'}
                      </div>
                    </td>
                    <td className="px-10 py-9 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-amber-500 border border-zinc-800 transition-all shadow-xl hover:scale-110"><Edit size={20}/></button>
                        <button className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-red-500 border border-zinc-800 transition-all shadow-xl hover:scale-110"><Trash2 size={20}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER DE ESTADO */}
        <div className="p-6 bg-zinc-950/80 border-t border-zinc-900 flex justify-between items-center px-10">
           <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">
                {loading ? 'Escaneando Frecuencia de Staff...' : 'Enlace de Datos Establecido'}
              </span>
           </div>
           <div className="text-[9px] font-black text-zinc-800 uppercase tracking-widest italic">
              "Poder absoluto sobre los perfiles de Motocadena"
           </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
