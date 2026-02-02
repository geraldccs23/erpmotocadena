
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ShoppingCart, Trash2, CreditCard, Banknote, UserPlus, 
  Loader2, Package, Tag, Bike, ChevronRight, Clock, Info, X, 
  ArrowRight, Landmark, QrCode, DollarSign, RefreshCw, User,
  CheckCircle2, AlertTriangle, Zap, Plus, Minus, LayoutGrid
} from 'lucide-react';
import { supabase } from '../supabase';
import { Product, Service, Customer, UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';

// Tipos locales para el flujo de POS
interface CartItem {
  id: string;
  type: 'PRODUCT' | 'SERVICE';
  name: string;
  price: number;
  quantity: number;
  originalData: any;
}

interface PaymentAbono {
  method: string;
  amountUSD: number;
  amountBS: number;
  reference: string;
}

const POS: React.FC = () => {
  const { profile } = useAuth();
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [exchangeLoading, setExchangeLoading] = useState(true);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart'>('catalog');
  
  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAbonos, setPaymentAbonos] = useState<PaymentAbono[]>([]);
  const [currentMethod, setCurrentMethod] = useState<string | null>(null);
  const [currentAmountInput, setCurrentAmountInput] = useState<string>('');
  const [currentRef, setCurrentRef] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchInitialData();
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    setExchangeLoading(true);
    try {
      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      const data = await res.json();
      setExchangeRate(data.promedio || 1);
    } catch (err) {
      console.error("Fallo al obtener tasa oficial:", err);
      setExchangeRate(55.0); // Backup rate
    } finally {
      setExchangeLoading(false);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, cRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('services').select('*').eq('is_active', true).order('name'),
        supabase.from('customers').select('*').order('first_name')
      ]);
      
      setProducts(pRes.data || []);
      setServices(sRes.data || []);
      setCustomers(cRes.data || []);
      fetchPendingInvoices();
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        work_order:work_orders(id, vehicle:vehicles(*))
      `)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });
    setPendingInvoices(data || []);
  };

  const subtotalUSD = useMemo(() => {
    if (selectedInvoice) return selectedInvoice.total_amount;
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [selectedInvoice, cart]);

  const totalAbonadoUSD = useMemo(() => {
    return paymentAbonos.reduce((acc, abono) => acc + abono.amountUSD, 0);
  }, [paymentAbonos]);

  const saldoRestanteUSD = Math.max(0, subtotalUSD - totalAbonadoUSD);

  const handleSelectInvoice = (inv: any) => {
    if (cart.length > 0) {
      if (!confirm("Se descartará el carrito actual para procesar esta factura de taller. ¿Continuar?")) return;
    }
    setSelectedInvoice(inv);
    setSelectedCustomer(inv.customer);
    setCart([]); 
    setActiveTab('cart'); // Salta directamente al carrito en mobile
  };

  const addToCart = (item: Product | Service, type: 'PRODUCT' | 'SERVICE') => {
    if (selectedInvoice) {
      if (!confirm("Estás liquidando una Orden de Trabajo. ¿Deseas cancelar y hacer una venta directa?")) return;
      setSelectedInvoice(null);
    }
    
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.type === type);
      if (existing) {
        return prev.map(i => i.id === item.id && i.type === type ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: item.id,
        type,
        name: item.name,
        price: item.price,
        quantity: 1,
        originalData: item
      }];
    });
  };

  const removeFromCart = (id: string, type: string) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.type === type)));
  };

  const addAbono = () => {
    if (!currentMethod || !currentAmountInput) return;
    const amount = parseFloat(currentAmountInput);
    if (isNaN(amount) || amount <= 0) return;

    let amountUSD = 0;
    let amountBS = 0;

    if (currentMethod === 'EFECTIVO_BS' || currentMethod === 'PAGO_MOVIL' || currentMethod === 'TRANSFERENCIA_BS') {
      amountBS = amount;
      amountUSD = amount / exchangeRate;
    } else {
      amountUSD = amount;
      amountBS = amount * exchangeRate;
    }

    if (amountUSD > (saldoRestanteUSD + 0.01)) {
      alert("El monto ingresado supera el saldo pendiente.");
      return;
    }

    setPaymentAbonos([...paymentAbonos, {
      method: currentMethod,
      amountUSD: amountUSD,
      amountBS: amountBS,
      reference: currentRef
    }]);

    setCurrentAmountInput('');
    setCurrentRef('');
    setCurrentMethod(null);
  };

  const removeAbono = (index: number) => {
    setPaymentAbonos(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcessPayment = async () => {
    if (saldoRestanteUSD > 0.05) {
      alert("Aún queda saldo pendiente por cubrir.");
      return;
    }
    
    setProcessingPayment(true);
    try {
      const { data: ws } = await supabase.from('workshops').select('id').limit(1).single();

      let finalSaleId: string | null = null;
      let finalOrderId: string | null = null;

      if (selectedInvoice) {
        finalOrderId = selectedInvoice.work_order_id;
        await supabase.from('invoices').update({ 
          status: 'PAID', 
          payment_method: 'MIXTO',
          updated_at: new Date().toISOString()
        }).eq('id', selectedInvoice.id);

        if (selectedInvoice.work_order_id) {
          await supabase.from('work_orders').update({ billing_status: 'PAID', status: 'READY' }).eq('id', selectedInvoice.work_order_id);
        }
      } else {
        if (!selectedCustomer) throw new Error("Debes asignar un piloto para la venta directa.");
        
        const { data: sale, error: sErr } = await supabase.from('pos_sales').insert([{
          workshop_id: ws?.id,
          customer_id: selectedCustomer.id,
          seller_id: profile?.id,
          total_amount: subtotalUSD,
          status: 'COMPLETED'
        }]).select().single();

        if (sErr) throw sErr;
        finalSaleId = sale.id;

        const itemsPayload = cart.map(item => ({
          sale_id: sale.id,
          product_id: item.type === 'PRODUCT' ? item.id : null,
          service_id: item.type === 'SERVICE' ? item.id : null,
          quantity: item.quantity,
          price: item.price
        }));
        await supabase.from('pos_sale_items').insert(itemsPayload);
      }

      const paymentsPayload = paymentAbonos.map(abono => ({
        sale_id: finalSaleId,
        work_order_id: finalOrderId,
        amount: abono.amountUSD,
        method: abono.method,
        reference_code: abono.reference
      }));

      const { error: pErr } = await supabase.from('payments').insert(paymentsPayload);
      if (pErr) throw pErr;

      alert("🏁 ¡CHECKERED FLAG! Transacción finalizada.");
      resetPOS();
      fetchPendingInvoices();
    } catch (err: any) {
      alert(`Fallo en el sistema: ${err.message}`);
    } finally {
      setProcessingPayment(false);
      setShowPaymentModal(false);
    }
  };

  const resetPOS = () => {
    setCart([]);
    setSelectedInvoice(null);
    setSelectedCustomer(null);
    setPaymentAbonos([]);
    setCurrentMethod(null);
    setCurrentAmountInput('');
    setCurrentRef('');
    setActiveTab('catalog');
  };

  const filteredCatalog = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const p = products.filter(x => x.name.toLowerCase().includes(term) || x.sku.toLowerCase().includes(term));
    const s = services.filter(x => x.name.toLowerCase().includes(term));
    return { products: p, services: s };
  }, [searchTerm, products, services]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* MOBILE TABS SWITCHER */}
      <div className="flex md:hidden bg-zinc-900 rounded-2xl p-1 shrink-0">
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${activeTab === 'catalog' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-500'}`}
        >
          <LayoutGrid size={18}/> Catálogo
        </button>
        <button 
          onClick={() => setActiveTab('cart')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all relative ${activeTab === 'cart' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-500'}`}
        >
          <ShoppingCart size={18}/> Carrito
          {cart.length > 0 && <span className="absolute top-2 right-4 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center border border-black animate-pulse">{cart.length}</span>}
        </button>
      </div>

      {/* CATALOG SECTION */}
      <div className={`flex-1 flex flex-col gap-4 md:gap-6 overflow-hidden ${activeTab === 'catalog' ? 'flex' : 'hidden md:flex'}`}>
        
        {/* TOP BAR: SEARCH & RATE */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500" size={20} />
            <input 
              type="text" 
              placeholder="Escanear o buscar..." 
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 md:py-5 pl-12 md:pl-16 pr-8 text-zinc-100 focus:border-amber-500/50 outline-none backdrop-blur-xl transition-all text-sm md:text-xl font-bold italic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="glass-panel px-4 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-amber-500/20 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
             <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest">
               <RefreshCw size={12} className={exchangeLoading ? 'animate-spin' : ''} /> Tasa BCV
             </div>
             <p className="heading-racing text-xl md:text-3xl text-zinc-100 leading-none mt-0 sm:mt-1">
               {exchangeRate.toFixed(2)} <span className="text-zinc-500 text-[10px] md:text-sm ml-1">Bs/$</span>
             </p>
          </div>
        </div>

        {/* PENDING LIST */}
        {pendingInvoices.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {pendingInvoices.map(inv => (
              <button 
                key={inv.id}
                onClick={() => handleSelectInvoice(inv)}
                className={`flex-shrink-0 w-48 md:w-64 glass-panel p-4 md:p-5 rounded-2xl md:rounded-[2rem] border transition-all text-left ${selectedInvoice?.id === inv.id ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <span className="text-[7px] md:text-[8px] font-black uppercase text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-900">OT</span>
                  <span className="text-amber-500 font-bold heading-racing text-lg md:text-2xl">${Number(inv.total_amount).toFixed(2)}</span>
                </div>
                <p className="text-zinc-100 font-black text-xs md:text-sm truncate leading-none mb-1">{inv.customer?.first_name} {inv.customer?.last_name}</p>
                <p className="text-[8px] md:text-[10px] text-zinc-500 font-black uppercase italic">{inv.work_order?.vehicle?.plate || 'S/P'}</p>
              </button>
            ))}
          </div>
        )}

        {/* CATALOG GRID */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredCatalog.services.map(s => (
              <button key={s.id} onClick={() => addToCart(s, 'SERVICE')} className="glass-panel p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-all text-left group flex flex-col justify-between min-h-[110px] md:min-h-[140px]">
                 <div className="flex items-center gap-2 mb-2 md:mb-3"><Zap size={12} className="text-amber-500" /><span className="text-[7px] md:text-[8px] font-black text-zinc-600 uppercase tracking-widest">Servicio</span></div>
                 <p className="text-zinc-100 font-bold text-xs md:text-sm leading-tight line-clamp-2">{s.name}</p>
                 <div className="mt-2 md:mt-4 border-t border-zinc-900/50 pt-2 flex justify-between items-end">
                    <span className="heading-racing text-xl md:text-2xl text-amber-500 italic">${Number(s.price).toFixed(2)}</span>
                    <Plus size={14} className="text-zinc-800 group-hover:text-amber-500 transition-all" />
                 </div>
              </button>
            ))}
            {filteredCatalog.products.map(p => (
              <button key={p.id} onClick={() => addToCart(p, 'PRODUCT')} className="glass-panel p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all text-left group flex flex-col justify-between min-h-[110px] md:min-h-[140px]">
                 <div className="flex items-center gap-2 mb-2 md:mb-3"><Package size={12} className="text-blue-500" /><span className="text-[7px] md:text-[8px] font-black text-zinc-600 uppercase tracking-widest">Repuesto</span></div>
                 <p className="text-zinc-100 font-bold text-xs md:text-sm leading-tight line-clamp-2">{p.name}</p>
                 <div className="mt-2 md:mt-4 border-t border-zinc-900/50 pt-2 flex justify-between items-end">
                    <span className="heading-racing text-xl md:text-2xl text-blue-500 italic">${Number(p.price).toFixed(2)}</span>
                    <Plus size={14} className="text-zinc-800 group-hover:text-blue-500 transition-all" />
                 </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CART & SUMMARY */}
      <div className={`w-full md:w-[380px] lg:w-[420px] glass-panel rounded-2xl md:rounded-[3rem] border border-zinc-800 flex flex-col overflow-hidden shadow-2xl ${activeTab === 'cart' ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-5 md:p-8 bg-zinc-900 border-b border-zinc-800 shrink-0">
           <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="heading-racing text-2xl md:text-4xl text-zinc-100 italic uppercase leading-none">Parrilla Venta</h3>
                <p className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest">{selectedInvoice ? 'Liquidación Taller' : 'Mostrador'}</p>
              </div>
              <button onClick={resetPOS} className="p-2 text-zinc-700 hover:text-red-500 transition-colors"><X size={20} /></button>
           </div>
           <select 
             className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 md:py-3 px-3 md:px-4 text-zinc-100 font-bold text-sm outline-none focus:border-amber-500/50 disabled:opacity-50"
             value={selectedCustomer?.id || ''}
             onChange={(e) => setSelectedCustomer(customers.find(x => x.id === e.target.value) || null)}
             disabled={!!selectedInvoice}
           >
             <option value="">Asignar Piloto...</option>
             {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
           </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 scrollbar-hide">
           {selectedInvoice ? (
             <div className="p-5 md:p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] text-center space-y-2">
                <Bike className="mx-auto text-amber-500 mb-2" size={24} />
                <p className="text-zinc-100 font-bold text-sm">OT #{selectedInvoice.work_order_id?.slice(0,8).toUpperCase()}</p>
                <p className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-widest">Items del Box incluidos</p>
             </div>
           ) : cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-10">
                <ShoppingCart size={48} />
                <p className="heading-racing text-xl uppercase mt-2">Vacío</p>
             </div>
           ) : (
             cart.map((item) => (
               <div key={`${item.id}-${item.type}`} className="flex items-center justify-between p-3 md:p-4 bg-zinc-900/30 rounded-xl md:rounded-2xl border border-zinc-900 group">
                  <div className="flex-1 overflow-hidden">
                     <p className="text-zinc-100 font-bold text-[10px] md:text-xs truncate">{item.name}</p>
                     <div className="flex items-center gap-3 mt-1">
                        <span className="text-amber-500 font-bold heading-racing text-lg md:text-xl italic">${item.price.toFixed(2)}</span>
                        <div className="flex items-center gap-2 bg-zinc-950 px-1.5 py-0.5 rounded-lg border border-zinc-800">
                           <button onClick={() => {
                             if (item.quantity > 1) {
                               setCart(cart.map(i => i.id === item.id ? {...i, quantity: i.quantity - 1} : i));
                             } else {
                               removeFromCart(item.id, item.type);
                             }
                           }} className="text-zinc-500 hover:text-white text-xs">-</button>
                           <span className="text-[9px] md:text-[10px] font-black text-zinc-100">{item.quantity}</span>
                           <button onClick={() => setCart(cart.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))} className="text-zinc-500 hover:text-white text-xs">+</button>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.type)} className="text-zinc-800 hover:text-red-500 ml-2"><Trash2 size={14}/></button>
               </div>
             ))
           )}
        </div>

        <div className="p-5 md:p-8 bg-zinc-950 border-t border-zinc-900 space-y-4 md:space-y-6 shrink-0">
           <div className="flex justify-between items-end">
              <span className="heading-racing text-xl md:text-3xl text-zinc-100 italic">TOTAL</span>
              <div className="text-right">
                 <p className="heading-racing text-4xl md:text-6xl text-amber-500 text-glow-amber leading-none italic">${subtotalUSD.toFixed(2)}</p>
                 <p className="text-[9px] md:text-[11px] font-black text-zinc-500 mt-1 md:mt-2 uppercase tracking-widest">≈ {(subtotalUSD * exchangeRate).toLocaleString('es-VE')} BS</p>
              </div>
           </div>
           <button 
             disabled={(!selectedInvoice && cart.length === 0) || loading}
             onClick={() => setShowPaymentModal(true)}
             className="w-full py-4 md:py-6 bg-amber-500 hover:bg-amber-400 text-black font-black heading-racing text-2xl md:text-4xl rounded-xl md:rounded-[2rem] shadow-xl transition-all disabled:opacity-20"
           >
             FINALIZAR <ArrowRight size={24} className="inline ml-1" />
           </button>
        </div>
      </div>

      {/* MULTI-PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-2 md:p-4">
           <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => !processingPayment && setShowPaymentModal(false)} />
           <div className="glass-panel w-full max-w-4xl max-h-[95vh] rounded-[2rem] md:rounded-[3.5rem] border border-white/10 relative z-10 animate-in zoom-in duration-300 shadow-2xl flex flex-col md:flex-row overflow-hidden">
              
              <div className="flex-1 p-6 md:p-10 space-y-6 md:space-y-8 border-r border-zinc-800 overflow-y-auto scrollbar-hide">
                 <div>
                    <h3 className="heading-racing text-3xl md:text-5xl text-zinc-100 italic uppercase">Pago Mixto</h3>
                    <p className="text-[8px] md:text-[10px] font-black text-amber-500 tracking-widest uppercase">Distribuye el pago en pista</p>
                 </div>

                 <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-zinc-950 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-zinc-900 text-center">
                       <p className="text-[7px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest">Saldo</p>
                       <p className="heading-racing text-2xl md:text-5xl text-amber-500 italic">${saldoRestanteUSD.toFixed(2)}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-zinc-800 text-center">
                       <p className="text-[7px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest">Pagado</p>
                       <p className="heading-racing text-2xl md:text-5xl text-emerald-500 italic">${totalAbonadoUSD.toFixed(2)}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'EFECTIVO_USD', label: 'Efectivo $', icon: <DollarSign size={16}/>, color: 'text-emerald-500' },
                      { id: 'EFECTIVO_BS', label: 'Efectivo BS', icon: <Banknote size={16}/>, color: 'text-zinc-500' },
                      { id: 'PAGO_MOVIL', label: 'Móvil', icon: <QrCode size={16}/>, color: 'text-amber-500' },
                      { id: 'TRANSFERENCIA_BS', label: 'Transf.', icon: <Landmark size={16}/>, color: 'text-blue-500' },
                      { id: 'CREDITO', label: 'Crédito', icon: <Clock size={16}/>, color: 'text-red-500' }
                    ].map(m => (
                      <button 
                        key={m.id}
                        onClick={() => {
                          setCurrentMethod(m.id);
                          if (m.id.includes('BS') || m.id === 'PAGO_MOVIL') {
                             setCurrentAmountInput((saldoRestanteUSD * exchangeRate).toFixed(2));
                          } else {
                             setCurrentAmountInput(saldoRestanteUSD.toFixed(2));
                          }
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${currentMethod === m.id ? 'bg-amber-500 border-amber-500 text-black' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'}`}
                      >
                         <div className={currentMethod === m.id ? 'text-black' : m.color}>{m.icon}</div>
                         <span className="text-[7px] font-black uppercase tracking-tighter">{m.label}</span>
                      </button>
                    ))}
                 </div>

                 {currentMethod && (
                   <div className="space-y-4 md:space-y-6 animate-in slide-in-from-top-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest">Monto ({currentMethod.includes('BS') ? 'BS' : 'USD'})</label>
                            <input 
                              type="number" 
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-bold heading-racing text-2xl outline-none focus:border-amber-500/50"
                              value={currentAmountInput}
                              onChange={(e) => setCurrentAmountInput(e.target.value)}
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest">Ref / Nota</label>
                            <input 
                              type="text" 
                              placeholder="#123456"
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-bold outline-none focus:border-amber-500/50"
                              value={currentRef}
                              onChange={(e) => setCurrentRef(e.target.value)}
                            />
                         </div>
                      </div>
                      <button onClick={addAbono} className="w-full py-4 bg-zinc-100 text-black rounded-xl font-black heading-racing text-xl hover:bg-white flex items-center justify-center gap-2">
                         <Plus size={18}/> AÑADIR PAGO
                      </button>
                   </div>
                 )}
              </div>

              <div className="w-full md:w-[320px] bg-zinc-950 p-6 md:p-10 flex flex-col shrink-0 overflow-y-auto">
                 <div className="flex-1 space-y-3">
                    <h4 className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Registro de Abonos</h4>
                    {paymentAbonos.map((abono, idx) => (
                      <div key={idx} className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-900 group relative">
                         <button onClick={() => removeAbono(idx)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><Minus size={12}/></button>
                         <p className="text-[7px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{abono.method.replace('_', ' ')}</p>
                         <div className="flex justify-between items-end">
                            <span className="heading-racing text-xl text-zinc-100 italic">${abono.amountUSD.toFixed(2)}</span>
                            <span className="text-[8px] font-bold text-zinc-700">{abono.reference || 'S/R'}</span>
                         </div>
                      </div>
                    ))}
                    {paymentAbonos.length === 0 && <p className="text-center text-zinc-800 text-[10px] italic py-8">No hay pagos registrados...</p>}
                 </div>

                 <div className="pt-6 space-y-4">
                    <div className="flex justify-between text-xl md:text-2xl heading-racing italic px-1">
                       <span className="text-zinc-500">Saldo Restante</span>
                       <span className={saldoRestanteUSD > 0.05 ? 'text-red-500' : 'text-emerald-500'}>${saldoRestanteUSD.toFixed(2)}</span>
                    </div>

                    <button 
                      disabled={saldoRestanteUSD > 0.05 || processingPayment}
                      onClick={handleProcessPayment}
                      className="w-full py-4 md:py-6 bg-amber-500 hover:bg-amber-400 text-black font-black heading-racing text-2xl md:text-4xl rounded-2xl shadow-2xl transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                    >
                      {processingPayment ? <Loader2 className="animate-spin" size={24}/> : <>CERRAR CAJA <CheckCircle2 size={24}/></>}
                    </button>
                    <button 
                      onClick={() => setShowPaymentModal(false)}
                      className="w-full text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white"
                    >
                      Volver
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default POS;
