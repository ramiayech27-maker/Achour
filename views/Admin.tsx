
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldCheck, RefreshCw, Users, DollarSign, Clock, AlertTriangle, CheckCircle2, 
  Activity, Server, UserCheck, MessageSquare, Trash2, ShieldAlert, ChevronRight, UserMinus, UserPlus, Search, 
  Settings, Database, Filter
} from 'lucide-react';
import { useUser } from '../UserContext';
import { TransactionType, TransactionStatus, User as AppUser } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabaseConfig';

const supabase = (SUPABASE_URL.startsWith('http') && !SUPABASE_URL.includes("your-project-id")) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

interface ChatMessage {
  id: string;
  sender_email: string;
  sender_role: string;
  message_text: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user: currentAdmin, approveTransaction, rejectTransaction, updateUserRole, deleteChatMessage } = useUser();
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'chat'>('users');
  const [registeredUsers, setRegisteredUsers] = useState<AppUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');

  const loadAllData = async () => {
    if (!supabase) return;
    setIsRefreshing(true);
    try {
      // 1. Fetch Profiles
      const { data: profileData } = await supabase.from('profiles').select('*');
      if (profileData) {
        const users = profileData.map(row => {
          let userData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          // Set authoritative role based on row column
          const isAdmin = row.is_admin === true || row.role?.toLowerCase() === 'admin';
          userData.role = isAdmin ? 'ADMIN' : 'USER';
          userData.is_admin = isAdmin;
          return userData;
        }).filter(u => u && u.id);
        setRegisteredUsers(users);
      }

      // 2. Fetch Chat
      const { data: chatData } = await supabase.from('global_chat').select('*').order('created_at', { ascending: false }).limit(100);
      if (chatData) setMessages(chatData);

    } catch (e: any) {
      console.error("Admin Load Error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentAdmin.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    loadAllData();
  }, [currentAdmin.role, navigate]);

  const filteredUsers = useMemo(() => {
    return registeredUsers.filter(u => {
      const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = userFilter === 'ALL' || u.role === userFilter;
      return matchesSearch && matchesFilter;
    });
  }, [registeredUsers, searchQuery, userFilter]);

  const allTransactions = useMemo(() => {
    const list: any[] = [];
    registeredUsers.forEach(u => {
      const txs = Array.isArray(u.transactions) ? u.transactions : [];
      txs.forEach((t: any) => {
        list.push({ ...t, userId: u.id, userEmail: u.email });
      });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [registeredUsers]);

  const pendingTransactions = useMemo(() => 
    allTransactions.filter(tx => tx.status === TransactionStatus.PENDING), 
  [allTransactions]);

  const handleToggleRole = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`هل أنت متأكد من تغيير رتبة المستخدم إلى ${newRole}؟`)) return;
    setIsRefreshing(true);
    await updateUserRole(uid, newRole as any);
    await loadAllData();
    setIsRefreshing(false);
  };

  const handleDeleteMsg = async (mid: string) => {
    if (!confirm("هل تريد حذف هذه الرسالة نهائياً؟")) return;
    setIsRefreshing(true);
    await deleteChatMessage(mid);
    await loadAllData();
    setIsRefreshing(false);
  };

  if (currentAdmin.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-cairo pb-20 text-right" dir="rtl">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/30">
              <ShieldCheck size={32} className="text-white" />
           </div>
           <div>
              <h1 className="text-4xl font-black text-white">لوحة تحكم المسؤول</h1>
              <p className="text-slate-500 font-bold">إدارة البنية التحتية، المستخدمين، والعمليات المالية.</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={loadAllData} className={`p-4 glass rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={24} />
          </button>
          <button onClick={() => navigate('/dashboard')} className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-700 transition-all shadow-xl">
             لوحة المستخدم
          </button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-[2.5rem] border border-blue-500/10">
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">إجمالي المستخدمين</p>
           <h3 className="text-3xl font-black text-white">{registeredUsers.length}</h3>
        </div>
        <div className="glass p-6 rounded-[2.5rem] border border-amber-500/10">
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">طلبات معلقة</p>
           <h3 className="text-3xl font-black text-amber-500">{pendingTransactions.length}</h3>
        </div>
        <div className="glass p-6 rounded-[2.5rem] border border-emerald-500/10">
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">إجمالي الإيداعات</p>
           <h3 className="text-3xl font-black text-emerald-500">${allTransactions.filter(t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.COMPLETED).reduce((a,b) => a+b.amount,0).toFixed(0)}</h3>
        </div>
        <div className="glass p-6 rounded-[2.5rem] border border-rose-500/10">
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">إجمالي السحوبات</p>
           <h3 className="text-3xl font-black text-rose-500">${allTransactions.filter(t => t.type === TransactionType.WITHDRAWAL && t.status === TransactionStatus.COMPLETED).reduce((a,b) => a+b.amount,0).toFixed(0)}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex glass p-2 rounded-[2.5rem] border border-white/5 max-w-2xl mx-auto overflow-hidden shadow-2xl">
         <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 rounded-3xl font-black transition-all flex items-center justify-center gap-3 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>
            <Users size={20} /> المستخدمين
         </button>
         <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-4 rounded-3xl font-black transition-all flex items-center justify-center gap-3 ${activeTab === 'transactions' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>
            <DollarSign size={20} /> العمليات {pendingTransactions.length > 0 && <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full animate-pulse">{pendingTransactions.length}</span>}
         </button>
         <button onClick={() => setActiveTab('chat')} className={`flex-1 py-4 rounded-3xl font-black transition-all flex items-center justify-center gap-3 ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>
            <MessageSquare size={20} /> الدردشة
         </button>
      </div>

      {/* Content - Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
             <div className="relative group w-full md:max-w-md">
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
               <input 
                 type="text" 
                 placeholder="بحث بالبريد أو المعرف..." 
                 className="w-full bg-slate-900 border border-white/5 p-4 pr-12 rounded-2xl text-white outline-none focus:border-blue-500 shadow-inner"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
               />
             </div>
             <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5">
                <button onClick={() => setUserFilter('ALL')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${userFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>الكل</button>
                <button onClick={() => setUserFilter('ADMIN')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${userFilter === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'text-slate-500'}`}>مسؤولين</button>
                <button onClick={() => setUserFilter('USER')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${userFilter === 'USER' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>مستخدمين</button>
             </div>
           </div>

           <div className="grid gap-4">
              {filteredUsers.map(u => (
                <div key={u.id} className="glass p-6 rounded-[2rem] border border-white/5 flex items-center justify-between hover:border-blue-500/30 transition-all bg-slate-900/40 group shadow-lg">
                   <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-inner ${u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                        {u.role === 'ADMIN' ? <ShieldCheck size={28} /> : <UserCheck size={28} />}
                      </div>
                      <div>
                         <p className="text-white font-black text-lg">{u.email}</p>
                         <div className="flex items-center gap-4 mt-1">
                           <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase">الرصيد: ${u.balance.toFixed(2)}</span>
                           <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">العمليات: {u.transactions?.length || 0}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="text-left">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          {u.role}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className={`p-3.5 rounded-2xl transition-all shadow-xl ${u.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 border border-rose-500/20 hover:text-white' : 'bg-blue-600/10 text-blue-500 hover:bg-blue-600 border border-blue-500/20 hover:text-white'}`}
                        title={u.role === 'ADMIN' ? "سحب رتبة المسؤول" : "منح رتبة المسؤول"}
                      >
                        {u.role === 'ADMIN' ? <UserMinus size={22} /> : <UserPlus size={22} />}
                      </button>
                   </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="py-20 text-center opacity-40">
                   <Users size={64} className="mx-auto mb-4" />
                   <p className="font-black text-xl">لا يوجد مستخدمين يطابقون البحث</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Content - Transactions Tab */}
      {activeTab === 'transactions' && (
        <section className="space-y-6">
          {pendingTransactions.length > 0 ? pendingTransactions.map(tx => (
            <div key={tx.id} className="glass p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-900/60 border-r-[12px] border-r-blue-600 animate-in slide-in-from-right duration-300 shadow-2xl">
               <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                    <DollarSign size={32} />
                 </div>
                 <div className="flex-1">
                    <p className="text-white text-xl font-black">{tx.userEmail}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{tx.type}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(tx.date).toLocaleString('ar-EG')}</p>
                    </div>
                    {tx.txHash && <p className="text-[9px] text-blue-400 font-mono mt-2 truncate max-w-[250px] bg-blue-500/5 p-1 px-2 rounded-lg border border-blue-500/10">Hash: {tx.txHash}</p>}
                    {tx.address && <p className="text-[9px] text-rose-400 font-mono mt-2 truncate max-w-[250px] bg-rose-500/5 p-1 px-2 rounded-lg border border-rose-500/10">To: {tx.address}</p>}
                 </div>
               </div>
               <div className="text-center md:text-right">
                  <p className="text-5xl font-black text-white tabular-nums">${tx.amount.toFixed(2)}</p>
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => { if(confirm("موافقة على العملية؟")) approveTransaction(tx.userId, tx.id).then(loadAllData) }} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-[1.5rem] text-sm font-black shadow-2xl shadow-emerald-900/30 transition-all active:scale-95">موافقة</button>
                  <button onClick={() => { if(confirm("رفض العملية؟")) rejectTransaction(tx.userId, tx.id).then(loadAllData) }} className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white px-10 py-5 rounded-[1.5rem] text-sm font-black shadow-2xl shadow-rose-900/30 transition-all active:scale-95">رفض</button>
               </div>
            </div>
          )) : (
            <div className="py-40 flex flex-col items-center glass rounded-[4rem] border-dashed border-2 border-slate-800 opacity-40 shadow-inner">
               <CheckCircle2 size={80} className="text-emerald-500 mb-8" />
               <p className="text-2xl font-black text-white">كافة العمليات تمت معالجتها</p>
               <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-[0.2em]">All Systems Clear</p>
            </div>
          )}
        </section>
      )}

      {/* Content - Chat Tab */}
      {activeTab === 'chat' && (
        <div className="glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl bg-slate-900/20">
           <div className="p-8 bg-slate-950/50 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-2xl text-white">إشراف الدردشة العامة</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">تتبع الرسائل وحذف المخالف منها</p>
              </div>
              <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 border border-blue-500/20">
                <MessageSquare size={24} />
              </div>
           </div>
           <div className="divide-y divide-white/5 max-h-[650px] overflow-y-auto custom-scrollbar">
              {messages.map(m => (
                <div key={m.id} className="p-8 hover:bg-white/[0.02] flex items-start justify-between group transition-colors">
                   <div className="flex gap-5">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 font-black shadow-inner border border-white/5">
                         {m.sender_email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-black text-white">{m.sender_email}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${m.sender_role === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}>
                              {m.sender_role}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">{new Date(m.created_at).toLocaleTimeString('ar-EG')}</span>
                         </div>
                         <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                            <p className="text-sm text-slate-300 leading-relaxed font-bold">{m.message_text}</p>
                         </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleDeleteMsg(m.id)}
                     className="p-4 text-slate-600 hover:text-white hover:bg-rose-600 rounded-2xl transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                     title="حذف الرسالة"
                   >
                      <Trash2 size={22} />
                   </button>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="p-32 text-center text-slate-600 font-black text-xl uppercase tracking-widest opacity-30">
                  <MessageSquare size={80} className="mx-auto mb-6" />
                  لا توجد رسائل للعرض
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
