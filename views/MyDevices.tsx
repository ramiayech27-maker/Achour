
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, Zap, ArrowRight, ArrowLeft,
  CheckCircle2, Timer, AlertCircle, Loader2,
  PlayCircle, RefreshCcw, Gift, ToggleLeft as ToggleOff, ToggleRight as ToggleOn, TrendingUp, DollarSign
} from 'lucide-react';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';
import { UserPackage, DeviceStatus } from '../types';

const DeviceCard: React.FC<{ pkg: UserPackage }> = ({ pkg }) => {
  const navigate = useNavigate();
  const { activateCycle } = useUser();
  const { isRtl } = useLanguage();
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(0);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activating, setActivating] = useState(false);
  const [now, setNow] = useState(Date.now());
  
  const isGift = pkg.instanceId.startsWith('GIFT-');

  const currentEarnings = useMemo(() => {
    if (pkg.status !== DeviceStatus.RUNNING || !pkg.lastActivationDate) return 0;
    const pps = isGift 
      ? (5 / 86400) 
      : ((pkg.priceAtPurchase * (pkg.currentDailyRate || 0) / 100) / 86400);
    const elapsedSeconds = (now - pkg.lastActivationDate) / 1000;
    return elapsedSeconds * pps;
  }, [pkg, now, isGift]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (pkg.status === DeviceStatus.RUNNING && pkg.expiryDate && pkg.lastActivationDate) {
        const total = pkg.expiryDate - pkg.lastActivationDate;
        const remaining = pkg.expiryDate - currentTime;
        if (remaining <= 0) {
          setTimeLeft(isRtl ? "مكتمل" : "Completed");
          setProgress(100);
        } else {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((remaining % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${mins}m ${secs}s`);
          setProgress(((total - remaining) / total) * 100);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [pkg, isRtl]);

  const handleStart = async (days: number, rate: number) => {
    setActivating(true);
    await new Promise(r => setTimeout(r, 2000));
    activateCycle(pkg.instanceId, days, rate);
    setActivating(false);
    setShowActivateModal(false);
  };

  return (
    <div 
      onClick={() => pkg.status === DeviceStatus.IDLE && setShowActivateModal(true)}
      className={`group cursor-pointer flex flex-col bg-[#1e1e1e] rounded-[1.5rem] overflow-hidden transition-all active:scale-95 border border-white/[0.03] hover:border-blue-500/30 shadow-lg ${pkg.status === DeviceStatus.RUNNING ? 'ring-1 ring-blue-500/30' : ''}`}
    >
      <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
        <img 
          src={pkg.icon} 
          alt={pkg.name} 
          className={`w-full h-full object-cover transition-all duration-1000 ${pkg.status === DeviceStatus.RUNNING ? 'opacity-100 scale-105' : 'opacity-40'}`} 
        />
        
        {pkg.status === DeviceStatus.RUNNING && (
          <div className="absolute inset-0 bg-blue-600/10 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/5">
           <p className="text-[8px] text-slate-400 font-black uppercase">{isGift ? (isRtl ? 'تجريبي' : 'Trial') : (isRtl ? 'مملوك' : 'Owned')}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="text-center">
          <h3 className="text-white font-black text-sm truncate">{pkg.name.split('-')[0]}</h3>
          <p className="text-[#8b5cf6] font-black text-[8px] uppercase tracking-wider mt-0.5">
            {pkg.status === DeviceStatus.RUNNING ? (isRtl ? 'جاري التعدين' : 'Mining...') : (isRtl ? 'جاهز' : 'Ready')}
          </p>
        </div>

        {pkg.status === DeviceStatus.RUNNING && (
          <div className="space-y-3">
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
               <div className="flex flex-col items-center mb-1">
                  <span className="text-[8px] text-slate-500 font-black uppercase mb-0.5">{isRtl ? 'الإنتاج' : 'Prod'}</span>
                  <span className="text-emerald-400 font-black text-xs tabular-nums tracking-tighter">
                    +${currentEarnings.toFixed(4)}
                  </span>
               </div>
               <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 shadow-[0_0_8px_#3b82f6] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
               </div>
               <div className="flex justify-center mt-1.5 text-[7px] font-bold text-slate-500 gap-2">
                  <span>{timeLeft}</span>
                  <span className="opacity-50">|</span>
                  <span>{pkg.currentDailyRate}%</span>
               </div>
            </div>
          </div>
        )}

        {pkg.status === DeviceStatus.IDLE && (
          <div className="pt-1">
             <div className="w-full py-2 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-lg text-center font-black text-[9px] group-hover:bg-blue-600 group-hover:text-white transition-all uppercase tracking-widest">
               {isRtl ? 'تشغيل' : 'Start'}
             </div>
          </div>
        )}
      </div>

      {showActivateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-xl animate-in fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="glass w-full max-w-sm rounded-[2.5rem] p-1 shadow-2xl animate-in zoom-in-95">
            <div className="bg-slate-950/80 rounded-[2.4rem] p-8 relative">
               <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                     <TrendingUp size={32} />
                  </div>
                  <h4 className="text-xl font-black text-white">{isRtl ? 'بدء دورة الأرباح' : 'Start Profit Cycle'}</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">{isRtl ? 'اختر استراتيجية التعدين للجهاز' : 'Select mining strategy for device'}</p>
               </div>

               <div className="grid gap-3">
                  <button onClick={() => handleStart(3, 2.0)} className={`w-full p-5 rounded-2xl bg-slate-900 border border-white/5 hover:border-emerald-500 flex justify-between items-center group transition-all ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div>
                      <p className="font-black text-sm text-white">{isRtl ? 'دورة قصيرة (3 أيام)' : 'Short Cycle (3 Days)'}</p>
                      <p className="text-xs text-emerald-400 font-black">{isRtl ? 'ربح 2.0% يومياً' : 'Earn 2.0% Daily'}</p>
                    </div>
                    <Zap size={20} className="text-slate-700 group-hover:text-emerald-500" />
                  </button>
                  
                  <button onClick={() => handleStart(7, 2.5)} className={`w-full p-5 rounded-2xl bg-slate-900 border border-white/5 hover:border-emerald-500 flex justify-between items-center group transition-all ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div>
                      <p className="font-black text-sm text-white">{isRtl ? 'دورة متوسطة (7 أيام)' : 'Medium Cycle (7 Days)'}</p>
                      <p className="text-xs text-emerald-400 font-black">{isRtl ? 'ربح 2.5% يومياً' : 'Earn 2.5% Daily'}</p>
                    </div>
                    <Zap size={20} className="text-slate-700 group-hover:text-emerald-500" />
                  </button>

                  <button onClick={() => setShowActivateModal(false)} className="mt-6 text-xs text-slate-600 font-black uppercase tracking-widest hover:text-white transition-colors">
                    {isRtl ? 'إغلاق النافذة' : 'Close Window'}
                  </button>
               </div>
               {activating && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-[2.4rem] flex flex-col items-center justify-center z-20">
                     <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                     <p className="text-white text-sm font-black uppercase tracking-widest animate-pulse">Injected into Global Pool...</p>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MyDevices = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isRtl } = useLanguage();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-cairo pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all active:scale-90 border border-white/5">
            {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">{isRtl ? 'أجهزتي' : 'My Devices'}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isRtl ? 'إدارة معدات التعدين' : 'Mining Equipment Management'}</p>
          </div>
        </div>
        <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
           <Cpu size={16} className="text-blue-500" />
           <span className="text-xs font-black text-white">{user.activePackages.length} {isRtl ? 'جهاز' : 'Devices'}</span>
        </div>
      </header>

      {user.activePackages.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {user.activePackages.map((pkg) => <DeviceCard key={pkg.instanceId} pkg={pkg} />)}
        </div>
      ) : (
        <div className="glass p-12 rounded-[3rem] text-center border-dashed border-2 border-slate-800 flex flex-col items-center max-w-2xl mx-auto mt-12">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700 mb-6 border border-white/5">
             <Cpu size={40} />
          </div>
          <h3 className="text-xl font-black text-white mb-2">{isRtl ? 'لا توجد أجهزة' : 'No Devices'}</h3>
          <p className="text-slate-500 font-bold mb-8 text-xs max-w-xs leading-relaxed">{isRtl ? 'لم تقم بشراء أي أجهزة بعد. ابدأ الآن بزيارة المتجر.' : 'You have no devices. Start by visiting the market.'}</p>
          <button onClick={() => navigate('/market')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-sm shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
             {isRtl ? 'زيارة المتجر' : 'Go to Market'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyDevices;
