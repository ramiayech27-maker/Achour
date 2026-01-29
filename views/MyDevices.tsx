
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Zap, ArrowRight, Loader2, TrendingUp, Play, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';
import { UserPackage, DeviceStatus } from '../types';

const DeviceCard: React.FC<{ pkg: UserPackage }> = ({ pkg }) => {
  const { activateCycle } = useUser();
  const { isRtl } = useLanguage();
  const [now, setNow] = useState(Date.now());
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    let interval: any;
    if (pkg.status === DeviceStatus.RUNNING) {
      interval = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => clearInterval(interval);
  }, [pkg.status]);

  const { progress, timeLeft, earned } = useMemo(() => {
    if (pkg.status !== DeviceStatus.RUNNING || !pkg.lastActivationDate || !pkg.expiryDate) {
      return { progress: 0, timeLeft: "--:--", earned: 0 };
    }
    const total = pkg.expiryDate - pkg.lastActivationDate;
    const elapsed = now - pkg.lastActivationDate;
    const remaining = pkg.expiryDate - now;
    
    // حساب الربح بالثانية
    const dailyRate = pkg.currentDailyRate || 2.5;
    const profitPerDay = (pkg.priceAtPurchase * dailyRate) / 100;
    const profitPerMs = profitPerDay / 86400000;
    const earnedVal = Math.max(0, elapsed * profitPerMs);
    
    if (remaining <= 0) return { progress: 100, timeLeft: isRtl ? "مكتمل" : "Ended", earned: earnedVal };
    
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    
    return { 
      progress: Math.min(100, (elapsed / total) * 100), 
      timeLeft: `${h}h ${m}m ${s}s`, 
      earned: earnedVal 
    };
  }, [pkg, now, isRtl]);

  const handleActivate = async () => {
    setIsActivating(true);
    // تفعيل تلقائي (3 أيام بربح 2.5%) لتبسيط التجربة كما طُلب
    await activateCycle(pkg.instanceId, 3, 2.5);
    setIsActivating(false);
  };

  return (
    <div className={`glass relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl ${pkg.status === DeviceStatus.RUNNING ? 'border-blue-500/40 bg-blue-500/5 shadow-blue-500/10' : 'border-white/5 bg-slate-900/40'}`}>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${pkg.status === DeviceStatus.RUNNING ? 'bg-blue-600 text-white animate-pulse shadow-lg shadow-blue-600/40' : 'bg-slate-800 text-slate-500'}`}>
              <Cpu size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{pkg.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <Zap size={12} className={pkg.status === DeviceStatus.RUNNING ? 'text-blue-500' : 'text-slate-600'} fill="currentColor" />
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isRtl ? 'نظام تعدين سحابي نشط' : 'Active Cloud System'}</span>
              </div>
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${pkg.status === DeviceStatus.RUNNING ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
            {pkg.status === DeviceStatus.RUNNING ? (isRtl ? 'يعمل' : 'Running') : (isRtl ? 'جاهز' : 'Standby')}
          </div>
        </div>

        {pkg.status === DeviceStatus.RUNNING ? (
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-500 font-black mb-1 uppercase tracking-wider">{isRtl ? 'الأرباح الحالية' : 'Current Earnings'}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-emerald-500 font-black text-sm">$</span>
                  <p className="text-3xl font-black text-white font-mono tracking-tighter tabular-nums">
                    {earned.toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black mb-1 uppercase tracking-wider">{isRtl ? 'ينتهي خلال' : 'Ends In'}</p>
                <div className="flex items-center gap-2 justify-end text-white font-mono font-bold">
                   <Clock size={14} className="text-blue-500" />
                   <span className="text-sm">{timeLeft}</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="absolute -top-1 left-0 w-full flex justify-between px-1 pointer-events-none">
                <div className="w-1 h-4 bg-white/5"></div>
                <div className="w-1 h-4 bg-white/5"></div>
                <div className="w-1 h-4 bg-white/5"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <button 
              onClick={handleActivate}
              disabled={isActivating}
              className="group w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black text-base transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 overflow-hidden relative"
            >
              {isActivating ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Play size={22} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                  <span>{isRtl ? 'تشغيل الجهاز فوراً' : 'Start Mining Now'}</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-500 font-bold mt-4 uppercase tracking-widest opacity-50">
              {isRtl ? 'العائد المتوقع: 2.5% يومياً لمدة 3 أيام' : 'Expected ROI: 2.5% Daily for 3 Days'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const MyDevices = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isRtl } = useLanguage();

  const stats = useMemo(() => {
    const running = user.activePackages.filter(p => p.status === DeviceStatus.RUNNING).length;
    const idle = user.activePackages.length - running;
    const totalInvested = user.activePackages.reduce((acc, p) => acc + p.priceAtPurchase, 0);
    return { running, idle, totalInvested };
  }, [user.activePackages]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-cairo pb-24 text-right" dir="rtl">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate(-1)} className="p-3.5 glass rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 active:scale-90">
            <ArrowRight size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">{isRtl ? 'أسطول التعدين' : 'Mining Fleet'}</h1>
            <div className="flex items-center gap-2 mt-1">
               <ShieldCheck size={16} className="text-emerald-500" />
               <p className="text-slate-500 font-bold text-sm">إدارة أجهزتك ومراقبة الأرباح اللحظية.</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="glass px-6 py-4 rounded-[1.5rem] border border-blue-500/20 bg-blue-600/5">
             <span className="text-[10px] text-slate-500 font-black block mb-1 uppercase">{isRtl ? 'إجمالي الاستثمار' : 'Total Investment'}</span>
             <span className="text-xl font-black text-white font-mono">${stats.totalInvested.toFixed(2)}</span>
          </div>
          <div className="glass px-6 py-4 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/5">
             <span className="text-[10px] text-slate-500 font-black block mb-1 uppercase">{isRtl ? 'أجهزة نشطة' : 'Active Devices'}</span>
             <span className="text-xl font-black text-emerald-400 font-mono">{stats.running}</span>
          </div>
        </div>
      </header>

      {user.activePackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {user.activePackages.map((pkg) => <DeviceCard key={pkg.instanceId} pkg={pkg} />)}
        </div>
      ) : (
        <div className="glass p-20 rounded-[4rem] text-center border-dashed border-2 border-slate-800 flex flex-col items-center justify-center max-w-2xl mx-auto mt-12 bg-slate-900/10">
          <div className="w-28 h-28 bg-slate-800/30 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-700 shadow-inner">
            <Cpu size={56} />
          </div>
          <h3 className="text-3xl font-black text-white mb-3">{isRtl ? 'لا تمتلك أي أجهزة' : 'Fleet is Empty'}</h3>
          <p className="text-slate-500 font-bold max-w-sm mb-12 leading-relaxed">أنت لم تقم بشراء أي أجهزة تعدين حتى الآن. ابدأ ببناء أسطولك التعديني لتحصل على عوائد يومية.</p>
          <button onClick={() => navigate('/market')} className="bg-blue-600 text-white px-12 py-6 rounded-[2rem] font-black text-xl shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:bg-blue-500 active:scale-95 transition-all">اكتشف المتجر الآن</button>
        </div>
      )}
    </div>
  );
};

export default MyDevices;
