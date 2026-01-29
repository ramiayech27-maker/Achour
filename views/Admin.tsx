
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldCheck, RefreshCw, Users, DollarSign, ExternalLink, Clock, AlertTriangle, CheckCircle2, Search, Wifi, WifiOff, Database, Eye, EyeOff, Activity, Globe, Server, UserCheck, ShieldAlert, BarChart3, ListFilter, UserX
} from 'lucide-react';
import { useUser } from '../UserContext';
import { TransactionType, TransactionStatus, User } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabaseConfig';

const supabase = (SUPABASE_URL.startsWith('http') && !SUPABASE_URL.includes("your-project-id")) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const Admin = () => {
  const navigate = useNavigate();
  const { user: currentAdmin, approveTransaction, rejectTransaction, depositFunds } = useUser();
  const [activeTab, setActiveTab] = useState<'transactions' | 'users' | 'diagnostic'>('transactions');
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const loadAllData = async () => {
    if (!supabase) return;
    setIsRefreshing(true);
    setConnectionError(null);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      if (data) {
        const users = data.map(row => {
          try {
            let userData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            // Align role in the data blob with the row state for the list view
            if (row.is_admin || row.role === 'admin') userData.role = 'ADMIN';
            else userData.role = 'USER';
            return userData;
          } catch (e) { return null; }
        }).filter(u => u && u.id);
        setRegisteredUsers(users);
      }
    } catch (e: any) {
      setConnectionError(e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // SECURITY CHECK: If user is not ADMIN, block access immediately
    if (currentAdmin.role !== 'ADMIN') {
      alert("غير مصرح لك بدخول لوحة الإدارة. سيتم تحويلك للرئيسية.");
      navigate('/dashboard');
      return;
    }
    loadAllData();
    const interval = setInterval(loadAllData, 20000); 
    return () => clearInterval(interval);
  }, [currentAdmin.role, navigate]);

  const allTransactions = useMemo(() => {
    const list: any[] = [];
    registeredUsers.forEach(u => {
      const txs = (u.transactions && Array.isArray(u.transactions)) ? u.transactions : [];
      txs.forEach((t: any) => {
        list.push({ ...t, userId: u.id, userEmail: u.email });
      });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [registeredUsers]);

  const pendingTransactions = useMemo(() => 
    allTransactions.filter(tx => tx.status === TransactionStatus.PENDING), 
  [allTransactions]);

  const stats = useMemo(() => {
    return {
      total: allTransactions.length,
      pending: pendingTransactions.length,
      users: registeredUsers.length,
      completed: allTransactions.filter(t => t.status === TransactionStatus.COMPLETED).length
    };
  }, [allTransactions, pendingTransactions, registeredUsers]);

  const handleAction = async (uid: string, txid: string, action: 'approve' | 'reject') => {
    setIsRefreshing(true);
    try {
      if (action === 'approve') await approveTransaction(uid, txid);
      else await rejectTransaction(uid, txid);
      await loadAllData();
    } catch (err) {
      alert("خطأ في تحديث الحالة.");
    }
    setIsRefreshing(false);
  };

  if (currentAdmin.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-cairo pb-20 text-right" dir="rtl">
      
      {/* Header Status Bar */}
      <div className="flex items-center justify-between gap-4 p-4 glass rounded-2xl border border-white/5">
         <div className="flex items-center gap-3">
            <Activity size={18} className={isRefreshing ? 'animate-spin text-blue-500' : 'text-emerald-500'} />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
               {connectionError ? `خطأ: ${connectionError}` : `النظام نشط | مستخدمين: ${stats.users} | إجمالي العمليات: ${stats.total}`}
            </span>
         </div>
         <div className="flex gap-2">
            <button onClick={loadAllData} className="p-1.5 bg-slate-800 rounded-lg text-white hover:bg-slate-700">
               <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
         </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <ShieldCheck size={28} className="text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-white">إدارة MineCloud</h1>
              <p className="text-slate-500 font-bold">مراقبة العمليات المالية والمستخدمين.</p>
           </div>
        </div>
        <button onClick={() => navigate('/dashboard')} className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-700 transition-all">
           العودة للوحة المستخدم
        </button>
      </header>

      {/* Tabs */}
      <div className="flex glass p-1.5 rounded-[1.5rem] border border-white/5 max-w-lg mx-auto overflow-hidden shadow-2xl">
         <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
            العمليات ({stats.pending})
         </button>
         <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
            المستخدمين ({stats.users})
         </button>
         <button onClick={() => setActiveTab('diagnostic')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'diagnostic' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>الربط</button>
      </div>

      {activeTab === 'transactions' && (
        <section className="space-y-6">
          {pendingTransactions.map(tx => (
            <div key={tx.id} className="glass p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-900/40 border-r-[12px] border-r-blue-600">
               <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    <DollarSign size={32} />
                 </div>
                 <div className="flex-1">
                    <p className="text-white text-lg font-black">{tx.userEmail}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase mt-1">{tx.type} • {new Date(tx.date).toLocaleString('ar-EG')}</p>
                 </div>
               </div>
               <div className="text-center md:text-right">
                  <p className="text-4xl font-black text-white tabular-nums">${tx.amount.toFixed(2)}</p>
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => handleAction(tx.userId, tx.id, 'approve')} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-2xl text-xs font-black shadow-xl">موافقة</button>
                  <button onClick={() => handleAction(tx.userId, tx.id, 'reject')} className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white px-10 py-5 rounded-2xl text-xs font-black shadow-xl">رفض</button>
               </div>
            </div>
          ))}

          {pendingTransactions.length === 0 && (
            <div className="py-40 flex flex-col items-center glass rounded-[4rem] border-dashed border-2 border-slate-800 opacity-40">
               <CheckCircle2 size={72} className="text-slate-700 mb-8" />
               <p className="text-2xl font-black text-white">لا توجد طلبات معلقة</p>
               <p className="text-sm text-slate-500 font-bold mt-2">إجمالي العمليات المسجلة في النظام: {stats.total}</p>
            </div>
          )}
        </section>
      )}

      {activeTab === 'users' && (
        <div className="grid gap-4">
           {registeredUsers.map(u => (
              <div key={u.id} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between hover:border-blue-500/30 transition-all">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-500">
                       <UserCheck size={24} />
                    </div>
                    <div>
                       <p className="text-white font-black text-sm">{u.email}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase">الرصيد: ${u.balance.toFixed(2)} | إجمالي العمليات: {u.transactions?.length || 0}</p>
                    </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className={`text-[8px] font-black px-2 py-1 rounded-md ${u.role === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                       {u.role}
                    </span>
                 </div>
              </div>
           ))}
        </div>
      )}

      {activeTab === 'diagnostic' && (
        <section className="glass rounded-[3rem] p-10 border border-white/5 space-y-8 bg-slate-900/40">
           <h2 className="text-2xl font-black text-white flex items-center gap-3"><Server className="text-blue-500"/> تشخيص الربط بالسحابة</h2>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-950 rounded-2xl border border-white/5">
                 <p className="text-xs text-slate-500 font-black mb-2 uppercase tracking-widest">إحصائيات قاعدة البيانات:</p>
                 <p className="text-emerald-400 font-black text-sm">المستخدمين المكتشفين: {stats.users}</p>
                 <p className="text-blue-400 font-black text-sm mt-1">العمليات المخزنة: {stats.total}</p>
              </div>
              <div className="p-6 bg-slate-950 rounded-2xl border border-white/5">
                 <p className="text-xs text-slate-500 font-black mb-2 uppercase tracking-widest">تحقق يدوي:</p>
                 <p className="text-slate-400 text-[10px] font-bold">الأدمن يمنح فقط عبر لوحة تحكم Supabase (is_admin = true).</p>
              </div>
           </div>
        </section>
      )}
    </div>
  );
};

export default Admin;
