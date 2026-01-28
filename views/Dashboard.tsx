
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, ArrowUpRight, Cpu, Store, MessageCircle, 
  Wallet, TrendingUp, LayoutGrid, Sparkles 
} from 'lucide-react';
import { useUser } from '../UserContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  const activePkgs = user?.activePackages || [];
  const dailyProfit = activePkgs.reduce((acc, p) => acc + (p.dailyProfit || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-cairo text-right" dir="rtl">
      
      {/* Welcome Message */}
      <header className="space-y-1 px-2">
        <h1 className="text-3xl font-black text-white">مرحباً بك، <span className="text-blue-500">{user.email.split('@')[0]}</span></h1>
        <p className="text-slate-500 font-bold text-sm">إليك حالة حسابك اليوم في MineCloud</p>
      </header>

      {/* Primary Action: Talk to Manager (TOP POSITION) */}
      <button 
        onClick={() => navigate('/chat')}
        className="w-full flex items-center justify-center gap-4 p-8 glass bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-rose-500/30 rounded-[2.5rem] hover:from-rose-600 hover:to-red-600 text-white transition-all active:scale-[0.98] group shadow-2xl shadow-rose-900/10"
      >
        <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" />
        <span className="font-black text-xl tracking-tighter">تكلم مع المدير</span>
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </div>
      </button>

      {/* Balance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-8 rounded-[2.5rem] border-r-4 border-r-blue-600 bg-blue-600/5">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">الرصيد المتاح</p>
          <div className="flex items-baseline gap-2">
            <span className="text-blue-500 text-xl font-black">$</span>
            <h2 className="text-4xl font-black text-white font-mono tabular-nums">{user.balance.toFixed(2)}</h2>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border-r-4 border-r-emerald-500 bg-emerald-500/5">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">أرباحك اليومية</p>
          <div className="flex items-baseline gap-2">
            <span className="text-emerald-500 text-xl font-black">$</span>
            <h2 className="text-4xl font-black text-white font-mono tabular-nums">{dailyProfit.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Deposit */}
          <button 
            onClick={() => navigate('/wallet', { state: { tab: 'deposit' } })}
            className="flex flex-col items-center justify-center gap-4 p-8 glass bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] hover:bg-blue-600 hover:text-white transition-all active:scale-95 group"
          >
            <div className="p-4 bg-blue-600/20 rounded-2xl group-hover:bg-white/20 transition-colors">
              <PlusCircle size={32} />
            </div>
            <span className="font-black text-lg">إيداع</span>
          </button>

          {/* Withdraw */}
          <button 
            onClick={() => navigate('/wallet', { state: { tab: 'withdraw' } })}
            className="flex flex-col items-center justify-center gap-4 p-8 glass bg-rose-600/10 border border-rose-500/20 rounded-[2.5rem] hover:bg-rose-600 hover:text-white transition-all active:scale-95 group"
          >
            <div className="p-4 bg-rose-600/20 rounded-2xl group-hover:bg-white/20 transition-colors">
              <ArrowUpRight size={32} />
            </div>
            <span className="font-black text-lg">سحب</span>
          </button>

          {/* My Devices */}
          <button 
            onClick={() => navigate('/my-devices')}
            className="flex flex-col items-center justify-center gap-4 p-8 glass bg-amber-600/10 border border-amber-500/20 rounded-[2.5rem] hover:bg-amber-600 hover:text-white transition-all active:scale-95 group"
          >
            <div className="p-4 bg-amber-600/20 rounded-2xl group-hover:bg-white/20 transition-colors">
              <Cpu size={32} />
            </div>
            <span className="font-black text-lg">أجهزتي</span>
          </button>

          {/* Market */}
          <button 
            onClick={() => navigate('/market')}
            className="flex flex-col items-center justify-center gap-4 p-8 glass bg-purple-600/10 border border-purple-500/20 rounded-[2.5rem] hover:bg-purple-600 hover:text-white transition-all active:scale-95 group"
          >
            <div className="p-4 bg-purple-600/20 rounded-2xl group-hover:bg-white/20 transition-colors">
              <Store size={32} />
            </div>
            <span className="font-black text-lg">المتجر</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
