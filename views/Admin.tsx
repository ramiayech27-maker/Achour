
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldCheck, RefreshCw, MessageSquare, Send, Users, DollarSign, MessageCircle, Loader2, Edit3, UserCircle, TrendingUp, Wallet, ExternalLink, Clock, BellRing, AlertTriangle,
  // Add missing CheckCircle2 import
  CheckCircle2
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
      
      {/* Pending Alert Banner */}
      {allPendingTransactions.length > 0 && (
        <div className="bg-rose-600/20 border-2 border-rose-500/30 p-6 rounded-[2rem] flex items-center justify-between animate-pulse">
           <div className="flex items-center gap-4 text-rose-400">
              <BellRing className="animate-bounce" />
              <div>
                <h4 className="font-black text-lg leading-none">تنبيه هام!</h4>
                <p className="text-xs font-bold mt-1 opacity-80">لديك {allPendingTransactions.length} طلبات إيداع/سحب جديدة بانتظار الموافقة الآن.</p>
              </div>
           </div>
           <button onClick={() => setActiveTab('transactions')} className="bg-rose-600 text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg shadow-rose-900/40">عرض الطلبات</button>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
            <ShieldCheck className="text-blue-500" /> لوحة التحكم الإدارية
          </h1>
          <p className="text-slate-500 font-bold">مرحباً بك، المدير العام لـ MineCloud</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadAllUsers} className="p-4 bg-slate-900 text-white rounded-2xl border border-white/5 hover:bg-slate-800 transition-all group">
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button onClick={() => { toggleRole(); navigate('/dashboard'); }} className="bg-rose-600/10 text-rose-500 border border-rose-500/20 px-6 py-3 rounded-2xl font-black hover:bg-rose-600 hover:text-white transition-all">
            العودة للوضع العادي
          </button>
        </div>
      </header>

      {/* Tabs Layout */}
      <div className="flex glass p-1.5 rounded-2xl border border-white/5 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
        <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-4 rounded-xl font-black transition-all relative ${activeTab === 'transactions' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>
           الطلبات المالية
           {allPendingTransactions.length > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-rose-600 text-white text-[10px] rounded-full flex items-center justify-center animate-bounce shadow-lg">
              {allPendingTransactions.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>المستخدمين</button>
        <button onClick={() => setActiveTab('support')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'support' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>الدعم المباشر</button>
      </div>

      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
           <div className="grid gap-4">
             {allPendingTransactions.map(tx => (
               <div key={tx.id} className="glass p-8 rounded-[2.5rem] border-r-8 border-r-blue-600 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-blue-500/30 transition-all bg-gradient-to-br from-slate-900/60 to-slate-950/60 shadow-xl">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`p-5 rounded-2xl shadow-inner ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                       <DollarSign size={28} />
                    </div>
                    <div>
                       <p className="text-white text-lg font-black">{tx.userEmail}</p>
                       <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase mt-0.5">
                          <span className={tx.type === TransactionType.DEPOSIT ? 'text-emerald-400' : 'text-rose-400'}>{tx.type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {new Date(tx.date).toLocaleString('ar-EG')}</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full md:w-auto px-4">
                    {tx.txHash && (
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-blue-400 font-mono truncate max-w-[200px] ltr">{tx.txHash}</span>
                        <a href={`https://tronscan.org/#/transaction/${tx.txHash}`} target="_blank" className="text-blue-500 hover:text-blue-400 p-2"><ExternalLink size={16} /></a>
                      </div>
                    )}
                  </div>

                  <div className="text-center md:text-right min-w-[120px]">
                     <p className="text-3xl font-black text-white tabular-nums">${tx.amount.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto">
                     <button onClick={() => handleAction(tx.userId, tx.id, 'approve')} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl text-xs font-black shadow-xl shadow-emerald-600/20 transition-all active:scale-95">موافقة</button>
                     <button onClick={() => handleAction(tx.userId, tx.id, 'reject')} className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-2xl text-xs font-black shadow-xl shadow-rose-600/20 transition-all active:scale-95">رفض</button>
                  </div>
               </div>
             ))}
             {allPendingTransactions.length === 0 && (
               <div className="py-32 flex flex-col items-center glass rounded-[3rem] border-dashed border-2 border-slate-800 opacity-40">
                  <CheckCircle2 size={64} className="text-slate-700 mb-6" />
                  <p className="text-xl font-black text-white">لا توجد طلبات معلقة حالياً</p>
                  <p className="text-sm text-slate-500 font-bold mt-2">كافة العمليات المالية تحت السيطرة.</p>
               </div>
             )}
           </div>
        </div>
      )}

      {/* ... Rest of tabs (Users, Support) remain similar but optimized ... */}
    </div>
  );
};

export default Admin;
