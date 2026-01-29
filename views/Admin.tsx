
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldCheck, RefreshCw, Users, DollarSign, ExternalLink, Clock, AlertTriangle, CheckCircle2, Search, Wifi, WifiOff, Database, Eye, EyeOff, Activity, Globe, Server, UserCheck, ShieldAlert
} from 'lucide-react';
import { useUser } from '../UserContext';
import { TransactionType, TransactionStatus, User } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabaseConfig';

const supabase = (SUPABASE_URL.startsWith('http')) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const Admin = () => {
  const navigate = useNavigate();
  const { approveTransaction, rejectTransaction, toggleRole, depositFunds } = useUser();
  const [activeTab, setActiveTab] = useState<'transactions' | 'users' | 'diagnostic'>('transactions');
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  const loadAllData = async () => {
    if (!supabase) {
      setConnectionError("التطبيق غير متصل بالسحابة.");
      return;
    }
    setIsRefreshing(true);
    setConnectionError(null);
    try {
      // جلب كافة السجلات من جدول profiles
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        setConnectionError(`خطأ RLS أو اتصال: ${error.message}`);
        throw error;
      }
      if (data) {
        // تحويل البيانات من JSONB إلى كائنات User
        const users = data.map(row => row.data).filter(u => u !== null && u.id);
        setRegisteredUsers(users);
      }
    } catch (e: any) {
      console.error("Admin Load Error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 10000); 
    return () => clearInterval(interval);
  }, []);

  const allPending = useMemo(() => {
    const list: any[] = [];
    registeredUsers.forEach(u => {
      if (u && u.transactions && Array.isArray(u.transactions)) {
        u.transactions.forEach(t => {
          if (t.status === TransactionStatus.PENDING) {
            list.push({ ...t, userId: u.id, userEmail: u.email });
          }
        });
      }
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [registeredUsers]);

  const handleAction = async (uid: string, txid: string, action: 'approve' | 'reject') => {
    setIsRefreshing(true);
    try {
      if (action === 'approve') await approveTransaction(uid, txid);
      else await rejectTransaction(uid, txid);
      await loadAllData();
    } catch (err) {
      alert("فشل تنفيذ العملية.");
    }
    setIsRefreshing(false);
  };

  const createTestTransaction = async () => {
     if(confirm("سيتم إرسال طلب إيداع وهمي بـ $50 من حسابك الحالي لاختبار القائمة. هل تستمر؟")) {
        await depositFunds(50, 'crypto', 'TEST-HASH-' + Date.now());
        setTimeout(loadAllData, 2000);
     }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-cairo pb-20 text-right" dir="rtl">
      
      {/* Top Status Bar */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${connectionError ? 'bg-rose-600/10 border-rose-500/30 text-rose-500' : 'bg-emerald-600/10 border-emerald-500/30 text-emerald-500'}`}>
         <div className="flex items-center gap-3">
            <Wifi size={18} className={isRefreshing ? 'animate-pulse' : ''} />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {connectionError ? 'خطأ في جلب البيانات' : `قاعدة البيانات نشطة | تم العثور على ${registeredUsers.length} مستخدم`}
            </span>
         </div>
         <div className="flex gap-2">
            <button onClick={createTestTransaction} className="bg-amber-500 text-slate-950 px-3 py-1 rounded-lg text-[10px] font-black hover:bg-amber-400 transition-all">إرسال عملية تجريبية 🧪</button>
            <button onClick={() => setShowRawData(!showRawData)} className="bg-white/5 px-3 py-1 rounded-lg text-[10px] font-black hover:bg-white/10 transition-all">البيانات الخام</button>
         </div>
      </div>

      {showRawData && (
        <div className="glass p-6 rounded-[2rem] border border-blue-500/30 bg-black/90 animate-in slide-in-from-top-2 overflow-hidden">
           <pre className="text-[9px] font-mono text-left dir-ltr p-4 bg-slate-900 rounded-xl max-h-60 overflow-y-auto custom-scrollbar">
              {JSON.stringify(registeredUsers, null, 2)}
           </pre>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
              <ShieldCheck size={28} className="text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-white tracking-tight">إدارة MineCloud</h1>
              <p className="text-slate-500 font-bold">لوحة تحكم المسؤول عن العمليات.</p>
           </div>
        </div>
        <div className="flex gap-3">
           <button onClick={loadAllData} className="p-4 bg-slate-900 rounded-2xl border border-white/5 text-white hover:bg-slate-800 transition-all">
              <RefreshCw size={24} className={isRefreshing ? 'animate-spin' : ''} />
           </button>
           <button onClick={() => { toggleRole(); navigate('/dashboard'); }} className="bg-rose-600/10 text-rose-500 border border-rose-500/20 px-8 py-4 rounded-2xl font-black hover:bg-rose-600 hover:text-white transition-all">
              خروج من الإدارة
           </button>
        </div>
      </header>

      {/* Tabs Menu */}
      <div className="flex glass p-1.5 rounded-[1.5rem] border border-white/5 max-w-lg mx-auto overflow-hidden shadow-2xl">
         <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'transactions' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>
            العمليات المعلقة ({allPending.length})
         </button>
         <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>
            المستخدمين ({registeredUsers.length})
         </button>
         <button onClick={() => setActiveTab('diagnostic')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'diagnostic' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>الربط</button>
      </div>

      {activeTab === 'transactions' && (
        <section className="space-y-6">
          {allPending.map(tx => (
            <div key={tx.id} className="glass p-8 rounded-[3rem] border-r-[12px] border-r-blue-600 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-gradient-to-br from-slate-900/60 to-slate-950/60 shadow-2xl">
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
                  <p className="text-4xl font-black text-white tracking-tighter tabular-nums">${tx.amount.toFixed(2)}</p>
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => handleAction(tx.userId, tx.id, 'approve')} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-2xl text-xs font-black shadow-xl transition-all">موافقة</button>
                  <button onClick={() => handleAction(tx.userId, tx.id, 'reject')} className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white px-10 py-5 rounded-2xl text-xs font-black shadow-xl transition-all">رفض</button>
               </div>
            </div>
          ))}

          {allPending.length === 0 && (
            <div className="py-40 flex flex-col items-center glass rounded-[4rem] border-dashed border-2 border-slate-800 opacity-40">
               <CheckCircle2 size={72} className="text-slate-700 mb-8" />
               <p className="text-2xl font-black text-white">لا توجد طلبات معلقة</p>
               <p className="text-sm text-slate-500 font-bold mt-2">جرب الضغط على "إرسال عملية تجريبية" لاختبار الربط.</p>
            </div>
          )}
        </section>
      )}

      {activeTab === 'users' && (
        <div className="grid gap-4">
           {registeredUsers.map(u => (
              <div key={u.id} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-500">
                       <UserCheck size={24} />
                    </div>
                    <div>
                       <p className="text-white font-black text-sm">{u.email}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase">الرصيد: ${u.balance.toFixed(2)} | العمليات: {u.transactions?.length || 0}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    {u.role === 'ADMIN' && <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-md">ADMIN</span>}
                    <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                 </div>
              </div>
           ))}
        </div>
      )}

      {activeTab === 'diagnostic' && (
        <section className="glass rounded-[3rem] p-10 border border-white/5 space-y-8 bg-slate-900/40">
           <h2 className="text-2xl font-black text-white flex items-center gap-3"><Server className="text-blue-500"/> تشخيص النظام</h2>
           <div className="p-6 bg-slate-950 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-500 font-black mb-2 uppercase tracking-widest">معلومات الاتصال الحالية:</p>
              <p className="text-blue-400 font-mono text-xs ltr break-all">{SUPABASE_URL}</p>
           </div>
           <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-3xl space-y-4">
              <h3 className="font-black text-white flex items-center gap-2"><ShieldAlert size={18}/> تنبيه تقني هام</h3>
              <p className="text-sm text-slate-400 font-bold leading-relaxed">
                 بما أنك قمت بتعطيل <b>RLS</b> (الزر الأحمر في صورتك)، فإن أي عملية إيداع يقوم بها أي مستخدم يجب أن تظهر هنا فوراً. إذا لم تظهر، فهذا يعني أن المستخدمين لم يرسلوا أي طلبات بعد (يجب عليهم الضغط على "تأكيد الإيداع" في صفحة المحفظة).
              </p>
           </div>
        </section>
      )}
    </div>
  );
};

export default Admin;
