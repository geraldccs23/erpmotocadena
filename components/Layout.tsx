
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Wrench, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronRight,
  Bike,
  ShieldCheck,
  Loader2,
  Layers
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SidebarItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active?: boolean }> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
        : 'text-zinc-400 hover:text-amber-500 hover:bg-zinc-800/50'
    }`}
  >
    <div className={`transition-colors ${active ? 'text-black' : 'group-hover:text-amber-500'}`}>
      {icon}
    </div>
    <span className="heading-racing text-lg font-medium tracking-tight">{label}</span>
    {active && <ChevronRight className="ml-auto w-4 h-4" />}
  </Link>
);

const BottomNavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active?: boolean }> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center justify-center flex-1 py-2 gap-1 transition-all ${
      active ? 'text-amber-500' : 'text-zinc-500'
    }`}
  >
    <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>
      {icon}
    </div>
    <span className="text-[8px] font-black uppercase tracking-widest leading-none">{label}</span>
  </Link>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { profile, loading, hasRole, logout } = useAuth();

  if (location.pathname === '/login') return <>{children}</>;
  if (!profile && !loading) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black overflow-hidden">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 glass-panel border-r border-zinc-800/50 flex-col z-20">
        <div className="p-6 flex flex-col items-center border-b border-zinc-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Bike className="w-8 h-8 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            <h1 className="heading-racing text-3xl font-bold text-zinc-100 tracking-tighter">
              MOTOCADENA
            </h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold heading-racing">Performance Workshop</p>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          <SidebarItem to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/agenda" icon={<Calendar size={20}/>} label="Agenda" active={location.pathname === '/agenda'} />
          <SidebarItem to="/ordenes" icon={<Wrench size={20}/>} label="Órdenes" active={location.pathname.startsWith('/ordenes')} />
          <SidebarItem to="/clientes" icon={<Users size={20}/>} label="Clientes" active={location.pathname.startsWith('/clientes')} />
          
          {(hasRole(['DIRECTOR', 'GERENTE_GENERAL', 'ADMINISTRADOR', 'VENDEDOR', 'CAJERO'])) && (
            <>
              <SidebarItem to="/inventario" icon={<Package size={20}/>} label="Inventario" active={location.pathname.startsWith('/inventario')} />
              <SidebarItem to="/servicios" icon={<Layers size={20}/>} label="Servicios" active={location.pathname.startsWith('/servicios')} />
              <SidebarItem to="/pos" icon={<ShoppingCart size={20}/>} label="POS Ventas" active={location.pathname === '/pos'} />
            </>
          )}

          <SidebarItem to="/membresias" icon={<CreditCard size={20}/>} label="Membresías" active={location.pathname === '/membresias'} />

          {hasRole(['DIRECTOR', 'GERENTE_GENERAL', 'ADMINISTRADOR']) && (
            <div className="pt-4 mt-4 border-t border-zinc-800/50">
              <p className="px-4 mb-2 text-[9px] font-bold uppercase text-zinc-600 tracking-[0.2em]">Administración</p>
              <SidebarItem to="/usuarios" icon={<ShieldCheck size={20}/>} label="Usuarios" active={location.pathname === '/usuarios'} />
              <SidebarItem to="/configuracion" icon={<Settings size={20}/>} label="Ajustes" active={location.pathname === '/configuracion'} />
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-zinc-800/50">
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-zinc-500 hover:text-red-500 transition-colors group">
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="heading-racing text-lg">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-zinc-800/50 flex items-center justify-around px-2 z-[100]">
        <BottomNavItem to="/" icon={<LayoutDashboard size={20}/>} label="Dash" active={location.pathname === '/'} />
        <BottomNavItem to="/ordenes" icon={<Wrench size={20}/>} label="Boxes" active={location.pathname.startsWith('/ordenes')} />
        <BottomNavItem to="/pos" icon={<ShoppingCart size={20}/>} label="POS" active={location.pathname === '/pos'} />
        <BottomNavItem to="/clientes" icon={<Users size={20}/>} label="Pilotos" active={location.pathname.startsWith('/clientes')} />
        <BottomNavItem to="/agenda" icon={<Calendar size={20}/>} label="Agenda" active={location.pathname === '/agenda'} />
      </nav>

      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.03),transparent_50%)] pb-20 md:pb-0">
        <header className="sticky top-0 z-10 h-16 glass-panel border-b border-zinc-800/50 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Bike className="w-6 h-6 text-amber-500" />
            <span className="heading-racing text-xl font-bold text-zinc-100">MOTOCADENA</span>
          </div>
          
          <h2 className="hidden md:block heading-racing text-2xl text-zinc-100 italic tracking-wide">
            {location.pathname === '/' ? 'Resumen de Pista' : 'Gestión Operativa'}
          </h2>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              {loading ? (
                <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse mb-1"></div>
              ) : (
                <>
                  <p className="text-sm font-bold text-zinc-100 leading-none">{profile?.full_name || 'Staff'}</p>
                  <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-1">
                    {profile?.role?.replace('_', ' ') || 'Rider'}
                  </p>
                </>
              )}
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-lg">
               {loading ? (
                 <Loader2 size={16} className="animate-spin text-zinc-700" />
               ) : (
                 <img src={`https://ui-avatars.com/api/?name=${profile?.full_name || 'MC'}&background=18181b&color=f59e0b&bold=true`} alt="avatar" />
               )}
            </div>
            <button onClick={logout} className="md:hidden text-zinc-600 p-1"><LogOut size={20} /></button>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
