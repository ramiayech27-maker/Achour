
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldCheck, RefreshCw, Users, DollarSign, ExternalLink, Clock, AlertTriangle, CheckCircle2, Search, Wifi, WifiOff, Database, Eye, EyeOff, Activity, Globe, Server, UserCheck, ShieldAlert, BarChart3, ListFilter
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
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        setConnectionError(`خطأ في جلب البيانات: ${error.message}`);
        throw error;
      }
      if (data) {
        // نضمن أننا نستخرج كائن 'data' ونقوم بتنظيفه
        const users = data.map(row => {
          const u = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          return u;
        }).filter(u => u !== null && u.id);
        setRegisteredUsers(users);
      }
    } catch (e: any) {
      console.error("Admin Load Error:", e);
      setConnectionError("فشل في معالجة البيانات المستلمة.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 15000); 
    return () => clearInterval(interval);
  }, []);

  // حساب كافة العمليات (وليس المعلقة فقط) للتشخيص
  const stats = useMemo(() => {
    let pending = 0;
    let total = 0;
    let completed = 0;
    let rejected = 0;
    let usersWithTx = 0;

    registeredUsers.forEach(u => {
      const txs = u.transactions || [];
      if (txs.length > 0) usersWithTx++;
      txs.forEach((t: any) => {
        total++;
        if (t.status === TransactionStatus.PENDING) pending++;
        if (t.status === TransactionStatus.COMPLETED) completed++;
        if (t.status === TransactionStatus.REJECTED) rejected++;
      });
    });

    return { pending, total, completed, rejected, usersWithTx };
  }, [registeredUsers]);

  const allPending = useMemo(() => {
    const list: any[] = [];
    registeredUsers.forEach(u => {
      const txs = u.transactions || [];
      txs.forEach((t: any) => {
        if (t.status === TransactionStatus.PENDING) {
          list.push({ ...t, userId: u.id, userEmail: u.email });
        }
      });
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
     if(confirm("سيتم إرسال طلب إيداع تجريبي بـ $50 لاختبار ظهور العمليات. هل تستمر؟")) {
        await depositFunds(50, 'crypto', 'AUTO-TEST-' + Math.random().toString(36).substring(7));
        alert("تم إرسال العملية! انتظر ثانيتين ثم اضغط على زر التحديث الدائري.");
        setTimeout(loadAllData, 2000);
     }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-cairo pb-20 text-right" dir="rtl">
      
      {/* Quick Info Bar */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${connectionError ? 'bg-rose-600/10 border-rose-500/30 text-rose-500' : 'bg-blue-600/10 border-blue-500/30 text-blue-400'}`}>
         <div className="flex items-center gap-3">
            <Activity size={18} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {connectionError ? connectionError : `الحالة: متصل | المستخدمين: ${registeredUsers.length} | إجمالي العمليات: ${stats.total}`}
            </span>
         </div>
         <div className="flex gap-2">
            <button onClick={createTestTransaction} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black hover:bg-blue-500 transition-all">إرسال تجربة 🧪</button>
            <button onClick={() => setShowRawData(!showRawData)} className="bg-white/5 px-3 py-1 rounded-lg text-[10px] font-black hover:bg-white/10 transition-all">Debug</button>
         </div>
      </div>

      {showRawData && (
        <div className="glass p-6 rounded-[2rem] border border-blue-500/30 bg-black/90 animate-in slide-in-from-top-2 overflow-hidden">
           <h3 className="text-xs font-black text-blue-500 mb-2">بيانات المستخدمين الخام:</h3>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="glass p-5 rounded-3xl border border-white/5 bg-blue-600/5">
            <p className="text-[9px] text-slate-500 font-black mb-1">العمليات المعلقة</p>
            <p className="text-2xl font-black text-white">{stats.pending}</p>
         </div>
         <div className="glass p-5 rounded-3xl border border-white/5">
            <p className="text-[9px] text-slate-500 font-black mb-1">مستخدمون نشطون</p>
            <p className="text-2xl font-black text-white">{stats.usersWithTx}</p>
         </div>
         <div className="glass p-5 rounded-3xl border border-white/5 bg-emerald-600/5">
            <p className="text-[9px] text-slate-500 font-black mb-1">عمليات مكتملة</p>
            <p className="text-2xl font-black text-emerald-500">{stats.completed}</p>
         </div>
         <div className="glass p-5 rounded-3xl border border-white/5 bg-rose-600/5">
            <p className="text-[9px] text-slate-500 font-black mb-1">عمليات مرفوضة</p>
            <p className="text-2xl font-black text-rose-500">{stats.rejected}</p>
         </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex glass p-1.5 rounded-[1.5rem] border border-white/5 max-w-lg mx-auto overflow-hidden shadow-2xl">
         <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'transactions' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>
            المعلقة ({allPending.length})
         </button>
         <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>
            المستخدمين ({registeredUsers.length})
         </button>
         <button onClick={() => setActiveTab('diagnostic')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'diagnostic' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>الربط</button>
      </div>

      {activeTab === 'transactions' && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {allPending.map(tx => (
            <div key={tx.id} className="glass p-8 rounded-[3rem] border-r-[12px] border-r-blue-600 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-gradient-to-br from-slate-900/60 to-slate-950/60 shadow-2xl">
               <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    <DollarSign size={32} />
                 </div>
                 <div className="flex-1">
                    <p className="text-white text-lg font-black">{tx.userEmail}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase mt-1">{tx.type} • {new Date(tx.date).toLocaleString('ar-EG')}</p>
                    {tx.txHash && (
                      <div className="mt-2 text-[9px] text-blue-400 font-mono bg-blue-400/5 px-2 py-1 rounded border border-blue-400/10 truncate max-w-[200px] ltr">
                        {tx.txHash}
                      </div>
                    )}
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
               <p className="text-sm text-slate-500 font-bold mt-2 text-center max-w-xs">إذا قمت بإرسال تجربة، اضغط على زر التحديث في أعلى اليسار.</p>
            </div>
          )}
        </section>
      )}

      {activeTab === 'users' && (
        <div className="grid gap-4 animate-in fade-in">
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
                 <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                       <span className={`text-[9px] font-black px-2 py-1 rounded-md ${u.role === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                          {u.role}
                       </span>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      )}

      {activeTab === 'diagnostic' && (
        <section className="glass rounded-[3rem] p-10 border border-white/5 space-y-8 bg-slate-900/40 animate-in fade-in">
           <h2 className="text-2xl font-black text-white flex items-center gap-3"><Server className="text-blue-500"/> تشخيص الربط بالسحابة</h2>
           
           <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-950 rounded-2xl border border-white/5">
                 <p className="text-xs text-slate-500 font-black mb-2 uppercase tracking-widest">SUPABASE_URL المستخدم حالياً:</p>
                 <p className="text-blue-400 font-mono text-[10px] ltr break-all">{SUPABASE_URL}</p>
              </div>
              <div className="p-6 bg-slate-950 rounded-2xl border border-white/5">
                 <p className="text-xs text-slate-500 font-black mb-2 uppercase tracking-widest">إحصائيات قاعدة البيانات:</p>
                 <p className="text-emerald-400 font-black text-sm">المستخدمين المكتشفين: {registeredUsers.length}</p>
                 <p className="text-blue-400 font-black text-sm mt-1">العمليات المخزنة: {stats.total}</p>
              </div>
           </div>

           <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-3xl space-y-4">
              <h3 className="font-black text-white flex items-center gap-2"><ShieldAlert size={18}/> تنبيه تقني نهائي</h3>
              <p className="text-sm text-slate-400 font-bold leading-relaxed">
                 إذا كان عدد المستخدمين هو 9 ولكن العمليات "0"، فهذا يعني أن ملفات المستخدمين في قاعدة البيانات لا تحتوي على مصفوفة <b>transactions</b>. 
                 <br/><br/>
                 <b>الحل:</b> قم بتسجيل الخروج والدخول بحسابك، اذهب للمحفظة، أرسل طلب إيداع، واضغط "تأكيد". ستظهر فوراً هنا.
              </p>
           </div>
        </section>
      )}
    </div>
  );
};

export default Admin;
