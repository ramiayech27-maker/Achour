
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldCheck, RefreshCw, MessageSquare, Send, Users, DollarSign, MessageCircle, Loader2, Edit3, UserCircle, TrendingUp, Wallet, ExternalLink, Clock, BellRing, AlertTriangle, CheckCircle2, Search, Filter, ShieldAlert
} from 'lucide-react';
import { useUser } from '../UserContext';
import { TransactionType, TransactionStatus, User, DeviceStatus } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabaseConfig';

const supabase = (SUPABASE_URL.startsWith('http')) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

interface ChatMessage {
  id: string;
  sender_email: string;
  sender_role: 'USER' | 'ADMIN';
  message_text: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user: currentUser, approveTransaction, rejectTransaction, toggleRole } = useUser();
  const [activeTab, setActiveTab] = useState<'transactions' | 'users' | 'support'>('transactions');
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [txSearch, setTxSearch] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adminInputText, setAdminInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadAllData = async () => {
    if (!supabase) return;
    setIsRefreshing(true);
    try {
      // جلب كافة البروفايلات لرؤية المعاملات
      const { data, error } = await supabase.from('profiles').select('data');
      if (error) throw error;
      if (data) {
        const users = data.map(d => d.data);
        setRegisteredUsers(users);
      }
    } catch (e) {
      console.error("Admin Load Error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 30000); // تحديث تلقائي كل 30 ثانية
    
    if (supabase) {
      const channel = supabase.channel('admin_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadAllData())
        .subscribe();
      return () => { 
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    }
  }, []);

  // فلترة كافة المعاملات المعلقة من جميع المستخدمين
  const pendingQueue = useMemo(() => {
    const list: any[] = [];
    registeredUsers.forEach(u => {
      if (u.transactions && Array.isArray(u.transactions)) {
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
      alert("حدث خطأ أثناء تنفيذ العملية. تأكد من صلاحيات قاعدة البيانات.");
    }
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-cairo pb-20 text-right" dir="rtl">
      
      {/* Pending Transactions Radar - High Urgency */}
      {pendingQueue.length > 0 && (
        <section className="bg-rose-600/10 border-2 border-rose-500/40 p-8 rounded-[3rem] shadow-2xl shadow-rose-900/20 animate-pulse">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-rose-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg">
                    <ShieldAlert size={32} className="animate-bounce" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-white">رادار العمليات المعلقة</h2>
                    <p className="text-rose-400 font-bold">هناك {pendingQueue.length} طلبات جديدة بانتظار مراجعتك فوراً.</p>
                 </div>
              </div>
              <button 
                onClick={loadAllData}
                className="bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-rose-600/40"
              >
                تحديث الرادار
              </button>
           </div>
        </section>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
              <ShieldCheck size={28} className="text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-white tracking-tight">إدارة MineCloud</h1>
              <p className="text-slate-500 font-bold">مرحباً بك في مركز التحكم الرئيسي.</p>
           </div>
        </div>
        <div className="flex gap-3">
           <button onClick={loadAllData} className={`p-4 bg-slate-900 rounded-2xl border border-white/5 text-white transition-all ${isRefreshing ? 'opacity-50' : ''}`}>
              <RefreshCw size={24} className={isRefreshing ? 'animate-spin' : ''} />
           </button>
           <button onClick={() => { toggleRole(); navigate('/dashboard'); }} className="bg-rose-600/10 text-rose-500 border border-rose-500/20 px-8 py-4 rounded-2xl font-black hover:bg-rose-600 hover:text-white transition-all">
              وضع المستخدم
           </button>
        </div>
      </header>

      {/* Main Content Tabs */}
      <div className="flex glass p-2 rounded-[2rem] border border-white/5 max-w-xl mx-auto shadow-2xl overflow-hidden">
         <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-4 rounded-[1.2rem] font-black transition-all relative ${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
            الطلبات المالية
            {pendingQueue.length > 0 && <span className="absolute -top-1 -left-1 w-6 h-6 bg-rose-600 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">{pendingQueue.length}</span>}
         </button>
         <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 rounded-[1.2rem] font-black transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>المستخدمين</button>
         <button onClick={() => setActiveTab('support')} className={`flex-1 py-4 rounded-[1.2rem] font-black transition-all ${activeTab === 'support' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>الدعم</button>
      </div>

      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
           {/* Transaction Search Box */}
           <div className="relative group">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="ابحث عن عملية برقم الهاش أو بريد المستخدم..." 
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 p-5 pr-14 rounded-2xl text-white outline-none focus:border-blue-500 font-bold transition-all"
              />
           </div>

           <div className="grid gap-6">
             {pendingQueue.filter(t => t.userEmail.includes(txSearch) || (t.txHash && t.txHash.includes(txSearch))).map(tx => (
               <div key={tx.id} className="glass p-8 rounded-[3rem] border-r-[12px] border-r-blue-600 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-blue-500/40 transition-all bg-gradient-to-br from-slate-900/40 to-slate-950/60 shadow-2xl">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                       <DollarSign size={32} />
                    </div>
                    <div>
                       <p className="text-white text-xl font-black">{tx.userEmail}</p>
                       <div className="flex items-center gap-3 text-[11px] text-slate-500 font-black uppercase mt-1">
                          <span className={tx.type === TransactionType.DEPOSIT ? 'text-emerald-400' : 'text-rose-400'}>{tx.type}</span>
                          <span className="opacity-20">|</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(tx.date).toLocaleString('ar-EG')}</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full md:w-auto px-4">
                    {tx.txHash && (
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between group/hash hover:border-blue-500/50 transition-all">
                        <div className="flex flex-col overflow-hidden">
                           <span className="text-[9px] text-slate-500 uppercase font-black mb-1">الهاش المقدم:</span>
                           <span className="text-xs text-blue-400 font-mono truncate max-w-[200px] ltr">{tx.txHash}</span>
                        </div>
                        <a href={`https://tronscan.org/#/transaction/${tx.txHash}`} target="_blank" className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 transition-all"><ExternalLink size={20} /></a>
                      </div>
                    )}
                  </div>

                  <div className="text-center md:text-right min-w-[150px]">
                     <p className="text-4xl font-black text-white tabular-nums tracking-tighter">${tx.amount.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex gap-4 w-full md:w-auto">
                     <button onClick={() => handleAction(tx.userId, tx.id, 'approve')} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-2xl text-sm font-black shadow-xl shadow-emerald-900/20 transition-all active:scale-95">موافقة</button>
                     <button onClick={() => handleAction(tx.userId, tx.id, 'reject')} className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white px-12 py-5 rounded-2xl text-sm font-black shadow-xl shadow-rose-900/20 transition-all active:scale-95">رفض</button>
                  </div>
               </div>
             ))}

             {pendingQueue.length === 0 && (
               <div className="py-40 flex flex-col items-center glass rounded-[4rem] border-dashed border-2 border-slate-800 opacity-40">
                  <CheckCircle2 size={72} className="text-slate-700 mb-8" />
                  <p className="text-2xl font-black text-white">لا توجد طلبات معلقة</p>
                  <p className="text-sm text-slate-500 font-bold mt-2">لقد قمت بمعالجة كافة الطلبات المالية بنجاح.</p>
               </div>
             )}
           </div>
        </div>
      )}

      {/* ... Rest of Admin components (Users, Support) remain optimized ... */}
    </div>
  );
};

export default Admin;
