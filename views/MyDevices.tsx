
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, Zap, ArrowRight, ArrowLeft,
  Loader2, TrendingUp, Clock
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
          setTimeLeft(`${hours}h ${mins}m`);
          setProgress(((total - remaining) / total) * 100);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [pkg, isRtl]);

  const handleStart = async (days: number, rate: number) => {
    setActivating(true);
    await activateCycle(pkg.instanceId, days, rate);
    setActivating(false);
    setShowActivateModal(false);
  };

  return (
    <div 
      onClick={() => pkg.status === DeviceStatus.IDLE && setShowActivateModal(true)}
      className={`group cursor-pointer flex flex-col bg-slate-900 rounded-3xl overflow-hidden transition-all active:scale-95 border border-white/5 hover:border-blue-500/30 shadow-xl ${pkg.status === DeviceStatus.RUNNING ? 'ring-1 ring-blue-500/40' : ''}`}
    >
      {/* Image Container - Compact height */}
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
        <img 
          src={pkg.icon} 
          alt={pkg.name} 
          className={`w-full h-full object-cover transition-opacity duration-700 ${pkg.status === DeviceStatus.RUNNING ? 'opacity-100' : 'opacity-40'}`} 
        />
        
        {pkg.status === DeviceStatus.RUNNING && (
          <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10">
           <p className="text-[8px] text-white font-black uppercase">{isGift ? (isRtl ? 'هدية' : 'Gift') : (isRtl ? 'أصلي' : 'Pro')}</p>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="text-center">
          <h3 className="text-white font-black text-[10px] truncate leading-tight">{pkg.name.split(' - ')[0]}</h3>
          <p className={`font-black text-[7px] uppercase tracking-widest mt-0.5 ${pkg.status === DeviceStatus.RUNNING ? 'text-emerald-400' : 'text-slate-500'}`}>
            {pkg.status === DeviceStatus.RUNNING ? (isRtl ? 'نشط الآن' : 'Running') : (isRtl ? 'بانتظار البدء' : 'Idle')}
          </p>
        </div>

        {pkg.status === DeviceStatus.RUNNING && (
          <div className="space-y-1.5">
            <div className="bg-black/40 p-1.5 rounded-xl border border-white/5 text-center">
               <span className="text-[7px] text-slate-500 font-black uppercase block">{isRtl ? 'الإنتاج اللحظي' : 'Earnings'}</span>
               <span className="text-emerald-400 font-black text-[11px] tabular-nums tracking-tighter">
                 +${currentEarnings.toFixed(4)}
               </span>
               <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
               </div>
               <div className="flex justify-center mt-1 text-[7px] font-bold text-slate-500 gap-1">
                  <Clock size={8} /> <span>{timeLeft}</span>
               </div>
            </div>
          </div>
        )}

        {pkg.status === DeviceStatus.IDLE && (
          <div className="pt-1">
             <div className="w-full py-1.5 bg-blue-600 text-white rounded-xl text-center font-black text-[9px] uppercase shadow-lg shadow-blue-600/20">
               {isRtl ? 'تشغيل' : 'Start'}
             </div>
          </div>
        )}
      </div>

      {showActivateModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="glass w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center">
             <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} />
             </div>
             <h4 className="text-xl font-black text-white">{isRtl ? 'تفعيل الجهاز' : 'Activate Device'}</h4>
             <p className="text-xs text-slate-400 font-bold mb-6">{isRtl ? 'اختر دورة التعدين المناسبة لك' : 'Choose your mining cycle'}</p>

             <div className="grid gap-3">
                <button onClick={() => handleStart(3, 2.0)} className="w-full p-4 rounded-2xl bg-slate-900 border border-white/5 hover:border-blue-500 flex justify-between items-center transition-all">
                  <div className="text-right">
                    <p className="font-black text-sm text-white">{isRtl ? 'دورة 3 أيام' : '3 Days Cycle'}</p>
                    <p className="text-[10px] text-emerald-400 font-bold">{isRtl ? 'ربح 2.0% يومياً' : '2.0% Daily'}</p>
                  </div>
                  <Zap size={18} className="text-blue-500" />
                </button>
                
                <button onClick={() => handleStart(7, 2.5)} className="w-full p-4 rounded-2xl bg-slate-900 border border-white/5 hover:border-blue-500 flex justify-between items-center transition-all">
                  <div className="text-right">
                    <p className="font-black text-sm text-white">{isRtl ? 'دورة 7 أيام' : '7 Days Cycle'}</p>
                    <p className="text-[10px] text-emerald-400 font-bold">{isRtl ? 'ربح 2.5% يومياً' : '2.5% Daily'}</p>
                  </div>
                  <Zap size={18} className="text-blue-500" />
                </button>

                <button onClick={() => setShowActivateModal(false)} className="mt-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
             </div>
             {activating && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center z-20">
                   <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                   <p className="text-white text-[10px] font-black uppercase tracking-widest">Connecting to Node...</p>
                </div>
             )}
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-cairo pb-20">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 glass rounded-xl text-slate-400 hover:text-white transition-all active:scale-90 border border-white/5">
            {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">{isRtl ? 'أسطولي' : 'My Fleet'}</h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{isRtl ? 'إدارة وحدات التعدين' : 'Mining Units'}</p>
          </div>
        </div>
        <div className="bg-blue-600/10 border border-blue-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
           <Cpu size={14} className="text-blue-500" />
           <span className="text-[10px] font-black text-white">{user.activePackages.length} {isRtl ? 'وحدة' : 'Units'}</span>
        </div>
      </header>

      {user.activePackages.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {user.activePackages.map((pkg) => <DeviceCard key={pkg.instanceId} pkg={pkg} />)}
        </div>
      ) : (
        <div className="glass p-12 rounded-[3rem] text-center border-dashed border-2 border-slate-800 flex flex-col items-center max-w-2xl mx-auto mt-12">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700 mb-6 border border-white/5">
             <Cpu size={32} />
          </div>
          <h3 className="text-lg font-black text-white mb-2">{isRtl ? 'لا توجد أجهزة نشطة' : 'No Active Devices'}</h3>
          <p className="text-slate-500 font-bold mb-8 text-[10px] max-w-xs">{isRtl ? 'لم تقم بامتلاك أي قوة تعدين بعد. ابدأ بامتلاك جهازك الأول اليوم.' : 'No mining power owned yet.'}</p>
          <button onClick={() => navigate('/market')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
             {isRtl ? 'الذهاب للمتجر' : 'Visit Market'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyDevices;
