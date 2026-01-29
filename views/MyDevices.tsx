
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Zap, ArrowRight, Loader2, TrendingUp, Play, CheckCircle2, Clock } from 'lucide-react';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';
import { UserPackage, DeviceStatus } from '../types';

const DeviceCard: React.FC<{ pkg: UserPackage }> = ({ pkg }) => {
  const { activateCycle } = useUser();
  const { isRtl } = useLanguage();
  const [now, setNow] = useState(Date.now());
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { progress, timeLeft, earned } = useMemo(() => {
    if (pkg.status !== DeviceStatus.RUNNING || !pkg.lastActivationDate || !pkg.expiryDate) {
      return { progress: 0, timeLeft: "--:--", earned: 0 };
    }
    const total = pkg.expiryDate - pkg.lastActivationDate;
    const elapsed = now - pkg.lastActivationDate;
    const remaining = pkg.expiryDate - now;
    
    const pps = ((pkg.priceAtPurchase * (pkg.currentDailyRate || 2.5) / 100) / 86400000);
    const earnedVal = Math.max(0, elapsed * pps);
    
    if (remaining <= 0) return { progress: 100, timeLeft: isRtl ? "مكتمل" : "Ended", earned: earnedVal };
    
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    return { progress: Math.min(100, (elapsed / total) * 100), timeLeft: `${h}h ${m}m`, earned: earnedVal };
  }, [pkg, now, isRtl]);

  const handleActivate = async () => {
    setIsActivating(true);
    // تفعيل تلقائي لأفضل دورة (3 أيام بربح 2.5%) لتبسيط التجربة
    await activateCycle(pkg.instanceId, 3, 2.5);
    setIsActivating(false);
  };

  return (
    <div className={`glass relative overflow-hidden rounded-[2rem] border transition-all duration-500 ${pkg.status === DeviceStatus.RUNNING ? 'border-blue-500/40 bg-blue-500/5 shadow-lg shadow-blue-500/10' : 'border-white/5 hover:border-slate-700'}`}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${pkg.status === DeviceStatus.RUNNING ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{pkg.name}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isRtl ? 'جهاز تعدين سحابي' : 'Cloud Miner'}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${pkg.status === DeviceStatus.RUNNING ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
            {pkg.status === DeviceStatus.RUNNING ? (isRtl ? 'يعمل الآن' : 'Running') : (isRtl ? 'جاهز' : 'Standby')}
          </div>
        </div>

        {pkg.status === DeviceStatus.RUNNING ? (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-500 font-black mb-0.5 uppercase">{isRtl ? 'الأرباح المجمعة' : 'Accumulated'}</p>
                <p className="text-xl font-black text-emerald-400 font-mono tracking-tighter animate-pulse">${earned.toFixed(4)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-500 font-bold uppercase">{isRtl ? 'الوقت المتبقي' : 'Time Left'}</p>
                <p className="text-xs font-black text-white font-mono">{timeLeft}</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-blue-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <button 
              onClick={handleActivate}
              disabled={isActivating}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
            >
              {isActivating ? <Loader2 className="animate-spin" size={18} /> : <><Play size={18} fill="currentColor" /> {isRtl ? 'بدء جلسة التعدين' : 'Start Mining'}</>}
            </button>
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
    return { running, idle };
  }, [user.activePackages]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-cairo pb-24 text-right" dir="rtl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 glass rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5">
            <ArrowRight size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white">{isRtl ? 'مركز أجهزتي' : 'My Mining Center'}</h1>
            <p className="text-slate-500 font-bold text-sm">أنت تمتلك {user.activePackages.length} أجهزة تعدين نشطة.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="glass px-4 py-2 rounded-xl border-emerald-500/20 bg-emerald-500/5">
             <span className="text-[10px] text-emerald-500 font-black block leading-none">نشط</span>
             <span className="text-lg font-black text-white font-mono leading-none">{stats.running}</span>
          </div>
          <div className="glass px-4 py-2 rounded-xl border-slate-700 bg-slate-800/20">
             <span className="text-[10px] text-slate-500 font-black block leading-none">جاهز</span>
             <span className="text-lg font-black text-white font-mono leading-none">{stats.idle}</span>
          </div>
        </div>
      </header>

      {user.activePackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.activePackages.map((pkg) => <DeviceCard key={pkg.instanceId} pkg={pkg} />)}
        </div>
      ) : (
        <div className="glass p-20 rounded-[3.5rem] text-center border-dashed border-2 border-slate-800 flex flex-col items-center justify-center max-w-2xl mx-auto mt-12 bg-slate-900/20">
          <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-8 text-slate-700">
            <Cpu size={48} />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">{isRtl ? 'لا توجد أجهزة ممتلكة' : 'No Devices Owned'}</h3>
          <p className="text-slate-500 font-bold max-w-sm mb-10 leading-relaxed">ابدأ الآن بامتلاك أول جهاز تعدين لك من المتجر وابدأ في جني الأرباح كل ثانية.</p>
          <button onClick={() => navigate('/market')} className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-600/30 active:scale-95 transition-all">الذهاب للمتجر الآن</button>
        </div>
      )}
    </div>
  );
};

export default MyDevices;
