
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldCheck, RefreshCw, Users, DollarSign, Clock, AlertTriangle, CheckCircle2, 
  Activity, Server, UserCheck, MessageSquare, Trash2, ShieldAlert, ChevronRight, UserMinus, UserPlus, Search
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

  const loadAllData = async () => {
    if (!supabase) return;
    setIsRefreshing(true);
    try {
      // 1. Fetch Profiles
      const { data: profileData } = await supabase.from('profiles').select('*');
      if (profileData) {
        const users = profileData.map(row => {
          let userData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          if (row.is_admin || row.role === 'admin' || row.role === 'ADMIN') userData.role = 'ADMIN';
          else userData.role = 'USER';
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
      alert("غير مصرح لك بدخول لوحة الإدارة.");
      navigate('/dashboard');
      return;
    }
    loadAllData();
  }, [currentAdmin.role, navigate]);

  const filteredUsers = useMemo(() => {
    return registeredUsers.filter(u => 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [registeredUsers, searchQuery]);

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
    if (!confirm(`هل تريد تغيير رتبة المستخدم إلى ${newRole}؟`)) return;
    await updateUserRole(uid, newRole as any);
    loadAllData();
  };

  const handleDeleteMsg = async (mid: string) => {
    if (!confirm("حذف هذه الرسالة؟")) return;
    await deleteChatMessage(mid);
    loadAllData();
  };

  if (currentAdmin.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-cairo pb-20 text-right" dir="rtl">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <ShieldCheck size={28} className="text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-white">لوحة تحكم المسؤول</h1>
              <p className="text-slate-500 font-bold">إدارة المستخدمين، المعاملات المالية، والدردشة العامة.</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadAllData} className={`p-3 glass rounded-xl text-slate-400 hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={22} />
          </button>
          <button onClick={() => navigate('/dashboard')} className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-700 transition-all">
             العودة للوحة المستخدم
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex glass p-1.5 rounded-[1.5rem] border border-white/5 max-w-2xl mx-auto overflow-hidden shadow-2xl">
         <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
            <Users size={18} /> المستخدمين ({registeredUsers.length})
         </button>
         <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
            <DollarSign size={18} /> العمليات ({pendingTransactions.length})
         </button>
         <button onClick={() => setActiveTab('chat')} className={`flex-1 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
            <MessageSquare size={18} /> الدردشة
         </button>
      </div>

      {/* Content - Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
           <div className="relative group max-w-md mx-auto">
             <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
             <input 
               type="text" 
               placeholder="بحث بالبريد الإلكتروني أو المعرف..." 
               className="w-full bg-slate-900/50 border border-white/5 p-4 pr-12 rounded-2xl text-white outline-none focus:border-blue-500"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
           </div>
           <div className="grid gap-4">
              {filteredUsers.map(u => (
                <div key={u.id} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between hover:border-blue-500/30 transition-all bg-slate-900/20">
                   <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-500'}`}>
                        {u.role === 'ADMIN' ? <ShieldCheck size={24} /> : <UserCheck size={24} />}
                      </div>
                      <div>
                         <p className="text-white font-black text-sm">{u.email}</p>
                         <div className="flex items-center gap-3 mt-1">
                           <span className="text-[10px] text-slate-500 font-bold">الرصيد: ${u.balance.toFixed(2)}</span>
                           <span className="text-[10px] text-slate-500 font-bold">العمليات: {u.transactions?.length || 0}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className={`text-[8px] font-black px-2 py-1 rounded-md ${u.role === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}>
                        {u.role}
                      </span>
                      <button 
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className={`p-2.5 rounded-xl transition-all ${u.role === 'ADMIN' ? 'text-rose-500 hover:bg-rose-500/10' : 'text-blue-500 hover:bg-blue-500/10'}`}
                        title={u.role === 'ADMIN' ? "سحب صلاحيات الأدمن" : "منح صلاحيات الأدمن"}
                      >
                        {u.role === 'ADMIN' ? <UserMinus size={20} /> : <UserPlus size={20} />}
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Content - Transactions Tab */}
      {activeTab === 'transactions' && (
        <section className="space-y-6">
          {pendingTransactions.length > 0 ? pendingTransactions.map(tx => (
            <div key={tx.id} className="glass p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-900/40 border-r-[12px] border-r-blue-600 animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    <DollarSign size={32} />
                 </div>
                 <div className="flex-1">
                    <p className="text-white text-lg font-black">{tx.userEmail}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase mt-1">{tx.type} • {new Date(tx.date).toLocaleString('ar-EG')}</p>
                    {tx.txHash && <p className="text-[8px] text-blue-500 font-mono mt-1 truncate max-w-[200px]">{tx.txHash}</p>}
                    {tx.address && <p className="text-[8px] text-rose-500 font-mono mt-1 truncate max-w-[200px]">{tx.address}</p>}
                 </div>
               </div>
               <div className="text-center md:text-right">
                  <p className="text-4xl font-black text-white tabular-nums">${tx.amount.toFixed(2)}</p>
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => { if(confirm("موافقة؟")) approveTransaction(tx.userId, tx.id).then(loadAllData) }} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-2xl text-xs font-black shadow-xl">موافقة</button>
                  <button onClick={() => { if(confirm("رفض؟")) rejectTransaction(tx.userId, tx.id).then(loadAllData) }} className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white px-10 py-5 rounded-2xl text-xs font-black shadow-xl">رفض</button>
               </div>
            </div>
          )) : (
            <div className="py-40 flex flex-col items-center glass rounded-[4rem] border-dashed border-2 border-slate-800 opacity-40">
               <CheckCircle2 size={72} className="text-slate-700 mb-8" />
               <p className="text-2xl font-black text-white">لا توجد طلبات معلقة</p>
            </div>
          )}
        </section>
      )}

      {/* Content - Chat Tab */}
      {activeTab === 'chat' && (
        <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden">
           <div className="p-6 bg-slate-950/50 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-black text-white">الدردشة العامة (إشراف)</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">آخر 100 رسالة</p>
           </div>
           <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {messages.map(m => (
                <div key={m.id} className="p-6 hover:bg-white/[0.02] flex items-start justify-between group">
                   <div className="flex gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                         {m.sender_email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-white">{m.sender_email}</span>
                            <span className="text-[9px] text-slate-500">{new Date(m.created_at).toLocaleTimeString('ar-EG')}</span>
                         </div>
                         <p className="text-sm text-slate-300 leading-relaxed">{m.message_text}</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleDeleteMsg(m.id)}
                     className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>
              ))}
              {messages.length === 0 && <div className="p-20 text-center text-slate-600 font-bold">لا توجد رسائل للعرض</div>}
           </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
