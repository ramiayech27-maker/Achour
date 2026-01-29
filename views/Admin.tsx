
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldCheck, RefreshCw, MessageSquare, Send, Users, DollarSign, MessageCircle, Loader2, Edit3, UserCircle, TrendingUp, Wallet, ExternalLink, Clock, BellRing, AlertTriangle, CheckCircle2
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adminInputText, setAdminInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadAllUsers = async () => {
    if (!supabase) return;
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.from('profiles').select('data');
      if (error) throw error;
      if (data) {
        const users = data.map(d => d.data);
        setRegisteredUsers(users);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMessages = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('global_chat').select('*').order('created_at', { ascending: true }).limit(100);
    if (data) setChatMessages(data);
  };

  useEffect(() => {
    loadAllUsers();
    loadMessages();
    if (supabase) {
       const channel = supabase.channel('admin_sync_all')
         .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
            loadAllUsers();
         })
         .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_chat' }, (p) => {
            setChatMessages(prev => [...prev, p.new as ChatMessage]);
         }).subscribe();
       return () => { supabase.removeChannel(channel); };
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'support' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const allPendingTransactions = useMemo(() => {
    const pendings: any[] = [];
    registeredUsers.forEach(u => {
      if (u.transactions) {
        u.transactions.forEach(t => {
          if (t.status === TransactionStatus.PENDING) {
            pendings.push({ ...t, userId: u.id, userEmail: u.email });
          }
        });
      }
    });
    return pendings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [registeredUsers]);

  const handleAdjustBalance = async (userEmail: string) => {
    const amount = prompt("أدخل المبلغ لإضافته أو خصمه (مثال: 100 للإضافة، -50 للخصم):");
    if (amount === null || isNaN(parseFloat(amount)) || !supabase) return;
    
    const val = parseFloat(amount);
    const { data: targetProfile } = await supabase.from('profiles').select('data').eq('email', userEmail.toLowerCase()).maybeSingle();
    
    if (targetProfile) {
      const tData = targetProfile.data;
      tData.balance += val;
      await supabase.from('profiles').update({ data: tData }).eq('email', userEmail.toLowerCase());
      alert(`تم تحديث رصيد ${userEmail} بنجاح. الرصيد الجديد: $${tData.balance.toFixed(2)}`);
      loadAllUsers();
    }
  };

  const handleAction = async (uid: string, txid: string, action: 'approve' | 'reject') => {
    setIsRefreshing(true);
    if (action === 'approve') {
      await approveTransaction(uid, txid);
    } else {
      await rejectTransaction(uid, txid);
    }
    await loadAllUsers();
    setIsRefreshing(false);
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = adminInputText.trim();
    if (!text || !supabase) return;
    try {
      const { error } = await supabase.from('global_chat').insert({
        sender_email: currentUser.email,
        sender_role: 'ADMIN',
        message_text: text
      });
      if (error) throw error;
      setAdminInputText('');
    } catch (err) { console.error("Failed to send admin message:", err); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-cairo pb-20 text-right" dir="rtl">
      
      {/* Pending Alert Banner - High Visibility */}
      {allPendingTransactions.length > 0 && (
        <div className="bg-rose-600/20 border-2 border-rose-500/40 p-6 rounded-[2.5rem] flex items-center justify-between animate-pulse shadow-2xl shadow-rose-900/20">
           <div className="flex items-center gap-5 text-rose-400">
              <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <BellRing className="animate-bounce" />
              </div>
              <div>
                <h4 className="font-black text-xl leading-none">إجراء مطلوب!</h4>
                <p className="text-sm font-bold mt-1 opacity-90">لديك {allPendingTransactions.length} طلبات مالية جديدة بانتظار قرارك الآن.</p>
              </div>
           </div>
           <button onClick={() => setActiveTab('transactions')} className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all">مراجعة الآن</button>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-600/40">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight">إدارة MineCloud</h1>
            <p className="text-slate-500 font-bold">التحكم الكامل في الخادم والعمليات المالية.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={loadAllUsers} className="p-4 bg-slate-900 text-white rounded-2xl border border-white/5 hover:bg-slate-800 transition-all group">
            <RefreshCw size={24} className={isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
          </button>
          <button onClick={() => { toggleRole(); navigate('/dashboard'); }} className="bg-rose-600/10 text-rose-500 border border-rose-500/20 px-8 py-4 rounded-2xl font-black hover:bg-rose-600 hover:text-white transition-all">
            خروج من الإدارة
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2rem] border-r-4 border-r-blue-600 bg-blue-600/5">
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">إجمالي ودائع المستخدمين</p>
           <h3 className="text-3xl font-black text-white font-mono">${registeredUsers.reduce((a, b) => a + (b.balance || 0), 0).toFixed(2)}</h3>
        </div>
        <div className="glass p-8 rounded-[2rem] border-r-4 border-r-emerald-500 bg-emerald-500/5">
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">المستخدمين المسجلين</p>
           <h3 className="text-3xl font-black text-white font-mono">{registeredUsers.length} <span className="text-xs text-slate-500">حساب</span></h3>
        </div>
        <div className="glass p-8 rounded-[2rem] border-r-4 border-r-purple-500 bg-purple-600/5">
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">الطلبات المعلقة</p>
           <h3 className="text-3xl font-black text-white font-mono">{allPendingTransactions.length}</h3>
        </div>
      </div>

      <div className="flex glass p-2 rounded-[1.5rem] border border-white/5 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
        <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-4 rounded-xl font-black transition-all relative z-10 ${activeTab === 'transactions' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>
           الطلبات المالية
           {allPendingTransactions.length > 0 && (
            <span className="absolute -top-1 -left-1 w-6 h-6 bg-rose-600 text-white text-[11px] rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-slate-950">
              {allPendingTransactions.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 rounded-xl font-black transition-all relative z-10 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>المستخدمين</button>
        <button onClick={() => setActiveTab('support')} className={`flex-1 py-4 rounded-xl font-black transition-all relative z-10 ${activeTab === 'support' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>الدعم الفني</button>
      </div>

      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
           <div className="grid gap-6">
             {allPendingTransactions.map(tx => (
               <div key={tx.id} className="glass p-8 rounded-[3rem] border-r-[12px] border-r-blue-600 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-blue-500/30 transition-all bg-gradient-to-br from-slate-900/60 to-slate-950/60 shadow-2xl">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
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
                        <div className="flex flex-col">
                           <span className="text-[9px] text-slate-500 uppercase font-black mb-1">رقم العملية (Hash)</span>
                           <span className="text-xs text-blue-400 font-mono truncate max-w-[250px] ltr">{tx.txHash}</span>
                        </div>
                        <a href={`https://tronscan.org/#/transaction/${tx.txHash}`} target="_blank" className="bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white p-3 rounded-xl transition-all"><ExternalLink size={20} /></a>
                      </div>
                    )}
                  </div>

                  <div className="text-center md:text-right min-w-[150px]">
                     <p className="text-xs text-slate-500 font-black uppercase mb-1">المبلغ المطلوب</p>
                     <p className="text-4xl font-black text-white tabular-nums">${tx.amount.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex gap-4 w-full md:w-auto">
                     <button onClick={() => handleAction(tx.userId, tx.id, 'approve')} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-2xl text-sm font-black shadow-xl shadow-emerald-900/40 transition-all active:scale-95">موافقة</button>
                     <button onClick={() => handleAction(tx.userId, tx.id, 'reject')} className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white px-12 py-5 rounded-2xl text-sm font-black shadow-xl shadow-rose-900/40 transition-all active:scale-95">رفض</button>
                  </div>
               </div>
             ))}
             {allPendingTransactions.length === 0 && (
               <div className="py-40 flex flex-col items-center glass rounded-[4rem] border-dashed border-2 border-slate-800 opacity-40">
                  <CheckCircle2 size={72} className="text-slate-700 mb-8" />
                  <p className="text-2xl font-black text-white">لا توجد طلبات معلقة</p>
                  <p className="text-sm text-slate-500 font-bold mt-2">لقد قمت بمعالجة كافة الطلبات المالية بنجاح.</p>
               </div>
             )}
           </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
             <input 
              type="text" 
              placeholder="ابحث عن بريد إلكتروني..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="flex-1 bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white outline-none focus:border-blue-500 text-right font-bold" 
             />
          </div>
          <div className="glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-950/80 border-b border-slate-800">
                  <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-10 py-8">اسم المستخدم</th>
                    <th className="px-10 py-8">الرصيد المتاح</th>
                    <th className="px-10 py-8">الأجهزة الممتلكة</th>
                    <th className="px-10 py-8 text-center">التحكم بالرصيد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {registeredUsers.filter(u=>u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center font-black border border-blue-500/20">
                              {u.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-base font-black text-white">{u.email}</span>
                         </div>
                      </td>
                      <td className="px-10 py-8 font-mono text-emerald-400 font-black text-lg">${u.balance.toFixed(2)}</td>
                      <td className="px-10 py-8">
                         <span className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-xl text-xs font-black border border-blue-600/20">{u.activePackages?.length || 0} جهاز</span>
                      </td>
                      <td className="px-10 py-8 text-center">
                         <button onClick={() => handleAdjustBalance(u.email)} className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-600/10 text-emerald-500 rounded-2xl text-xs font-black border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all">
                           <Edit3 size={18} /> تعديل الرصيد
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="glass rounded-[3rem] h-[650px] flex flex-col overflow-hidden border border-white/5 shadow-2xl animate-in slide-in-from-bottom-6 duration-500">
           <div className="p-6 bg-slate-950/80 border-b border-white/5 flex items-center gap-4">
              <MessageCircle className="text-blue-500" />
              <h3 className="font-black text-white">دردشة الدعم الفني الموحدة</h3>
           </div>
           <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-slate-950/20 custom-scrollbar">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender_role === 'ADMIN' ? 'items-end' : 'items-start'} animate-in fade-in`}>
                  <div className="flex items-center gap-2 mb-1 px-2">
                    <span className="text-[10px] text-slate-500 font-black">{msg.sender_email}</span>
                    {msg.sender_role === 'ADMIN' && <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Manager</span>}
                  </div>
                  <div className={`p-5 rounded-[1.5rem] max-w-[75%] text-sm font-bold shadow-lg ${msg.sender_role === 'ADMIN' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                    {msg.message_text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
           </div>
           <form onSubmit={handleSendAdminMessage} className="p-6 bg-slate-950/60 border-t border-white/5 flex gap-4">
              <input type="text" value={adminInputText} onChange={(e) => setAdminInputText(e.target.value)} placeholder="اكتب ردك كمدير للمنصة..." className="flex-1 bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white outline-none focus:border-blue-500 text-right font-bold transition-all" />
              <button type="submit" className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-blue-500 active:scale-95 transition-all"><Send size={28} /></button>
           </form>
        </div>
      )}
    </div>
  );
};

export default Admin;
