
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldCheck, ArrowRight, RefreshCw, MessageSquare, Send, Users, DollarSign, MessageCircle, Loader2, Edit3, UserCircle, TrendingUp, Wallet
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
  const [activeTab, setActiveTab] = useState<'transactions' | 'users' | 'support'>('users');
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adminInputText, setAdminInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadAllUsers = async () => {
    if (!supabase) return;
    setIsRefreshing(true);
    const { data } = await supabase.from('profiles').select('data');
    if (data) setRegisteredUsers(data.map(d => d.data));
    setIsRefreshing(false);
  };

  const loadMessages = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('global_chat').select('*').order('created_at', { ascending: true }).limit(100);
    if (data) setChatMessages(data);
  };

  // إحصائيات عامة للمسؤول
  const platformStats = useMemo(() => {
    const totalBalance = registeredUsers.reduce((acc, u) => acc + (u.balance || 0), 0);
    const totalUsers = registeredUsers.length;
    const totalDevices = registeredUsers.reduce((acc, u) => acc + (u.activePackages?.length || 0), 0);
    return { totalBalance, totalUsers, totalDevices };
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
      alert(`تم تحديث رصيد ${userEmail} بنجاح. الرصيد الجديد: $${tData.balance}`);
      loadAllUsers();
    }
  };

  useEffect(() => {
    loadAllUsers();
    loadMessages();
    if (supabase) {
       const channel = supabase.channel('admin_sync')
         .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_chat' }, (p) => {
            setChatMessages(prev => [...prev, p.new as ChatMessage]);
         }).subscribe();
       return () => { supabase.removeChannel(channel); };
    }
  }, []);

  const allPendingTransactions = useMemo(() => {
    const pendings: any[] = [];
    registeredUsers.forEach(u => {
      u.transactions?.forEach(t => {
        if (t.status === TransactionStatus.PENDING) pendings.push({ ...t, userId: u.id, userEmail: u.email });
      });
    });
    return pendings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [registeredUsers]);

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInputText.trim() || !supabase) return;
    await supabase.from('global_chat').insert({
      sender_email: currentUser.email,
      sender_role: 'ADMIN',
      message_text: adminInputText.trim()
    });
    setAdminInputText('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-cairo pb-20 text-right" dir="rtl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
            <ShieldCheck className="text-blue-500" /> لوحة الإدارة السحابية
          </h1>
          <p className="text-slate-400 font-bold">إدارة جميع حسابات المستخدمين والعمليات المالية.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadAllUsers} className="p-3 bg-slate-800 text-white rounded-2xl border border-white/5"><RefreshCw className={isRefreshing ? 'animate-spin' : ''} /></button>
          <button onClick={() => { toggleRole(); navigate('/dashboard'); }} className="bg-rose-600/10 text-rose-500 border border-rose-500/20 px-6 py-3 rounded-2xl font-black">الخروج من الإدارة</button>
        </div>
      </header>

      {/* Platform Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border border-white/5 bg-blue-600/5">
          <p className="text-slate-500 text-xs font-black uppercase mb-1">إجمالي أرصدة المستخدمين</p>
          <div className="flex items-center gap-2">
            <Wallet className="text-blue-500" size={18} />
            <h3 className="text-2xl font-black text-white font-mono">${platformStats.totalBalance.toFixed(2)}</h3>
          </div>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/5 bg-emerald-600/5">
          <p className="text-slate-500 text-xs font-black uppercase mb-1">إجمالي الأجهزة المباعة</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={18} />
            <h3 className="text-2xl font-black text-white font-mono">{platformStats.totalDevices}</h3>
          </div>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/5 bg-purple-600/5">
          <p className="text-slate-500 text-xs font-black uppercase mb-1">عدد المسجلين كلياً</p>
          <div className="flex items-center gap-2">
            <Users className="text-purple-500" size={18} />
            <h3 className="text-2xl font-black text-white font-mono">{platformStats.totalUsers}</h3>
          </div>
        </div>
      </div>

      <div className="flex glass p-1.5 rounded-2xl border border-white/5 max-w-2xl mx-auto shadow-2xl">
        <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 rounded-xl font-black ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>المستخدمين</button>
        <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-4 rounded-xl font-black ${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>العمليات المعلقة</button>
        <button onClick={() => setActiveTab('support')} className={`flex-1 py-4 rounded-xl font-black ${activeTab === 'support' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>مركز الرسائل</button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <input type="text" placeholder="ابحث بالبريد الإلكتروني..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white outline-none text-right" />
             <div className="p-4 bg-slate-800 rounded-2xl border border-white/5 flex items-center gap-2">
                <Users className="text-blue-500" size={20} />
                <span className="text-sm font-black text-white">{registeredUsers.length}</span>
             </div>
          </div>
          <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-950/50 border-b border-slate-800">
                  <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-8 py-6">المستخدم</th>
                    <th className="px-8 py-6">الرصيد الحالي</th>
                    <th className="px-8 py-6">الأجهزة</th>
                    <th className="px-8 py-6 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {registeredUsers.filter(u=>u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600/20 text-blue-500 rounded-lg flex items-center justify-center font-black">{u.email.charAt(0).toUpperCase()}</div>
                            <span className="text-sm font-black text-white">{u.email}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-emerald-400 font-bold">${u.balance.toFixed(2)}</td>
                      <td className="px-8 py-6">
                         <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black">{u.activePackages?.length || 0} جهاز</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <button onClick={() => handleAdjustBalance(u.email)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 text-emerald-500 rounded-xl text-[10px] font-black border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all">
                           <Edit3 size={14} /> تعديل الرصيد
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

      {activeTab === 'transactions' && (
        <div className="space-y-6">
           <div className="grid gap-4">
             {allPendingTransactions.map(tx => (
               <div key={tx.id} className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                       <DollarSign size={24} />
                    </div>
                    <div>
                       <p className="text-white text-lg font-black">{tx.userEmail}</p>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{tx.type} • {tx.id}</p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                     <p className="text-3xl font-black text-white tabular-nums">${tx.amount}</p>
                     {tx.txHash && <p className="text-[9px] text-blue-400 font-mono mt-1 break-all max-w-[200px]">{tx.txHash}</p>}
                  </div>
                  <div className="flex gap-3">
                     <button onClick={() => approveTransaction(tx.userId, tx.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/20 transition-all">موافقة</button>
                     <button onClick={() => rejectTransaction(tx.userId, tx.id)} className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-rose-600/20 transition-all">رفض</button>
                  </div>
               </div>
             ))}
             {allPendingTransactions.length === 0 && (
               <div className="py-20 flex flex-col items-center glass rounded-[3rem] opacity-30 border-dashed border-2 border-slate-800">
                  <ShieldCheck size={48} className="text-slate-600 mb-4" />
                  <p className="text-lg font-black">لا توجد طلبات معلقة حالياً</p>
               </div>
             )}
           </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="glass rounded-[3rem] h-[600px] flex flex-col overflow-hidden border border-white/5 shadow-2xl">
           <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-slate-950/20 custom-scrollbar">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender_role === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] text-slate-500 mb-1 px-2">{msg.sender_email}</span>
                  <div className={`p-4 rounded-2xl max-w-[70%] text-sm font-bold ${msg.sender_role === 'ADMIN' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>{msg.message_text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
           </div>
           <form onSubmit={handleSendAdminMessage} className="p-6 bg-slate-950/50 border-t border-white/5 flex gap-3">
              <input type="text" value={adminInputText} onChange={(e) => setAdminInputText(e.target.value)} placeholder="اكتب ردك كمدير..." className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white outline-none text-right" />
              <button type="submit" className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"><Send size={24} /></button>
           </form>
        </div>
      )}
    </div>
  );
};

export default Admin;
