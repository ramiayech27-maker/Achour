
import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, AlertCircle, Info, ShieldCheck, TrendingUp, X
} from 'lucide-react';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';
import { NotificationType } from '../types';

const NotificationToast = () => {
  const { latestNotification } = useUser();
  const { isRtl } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (latestNotification) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [latestNotification]);

  if (!latestNotification || !isVisible) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS: return <CheckCircle2 className="text-emerald-500" />;
      case NotificationType.PROFIT: return <TrendingUp className="text-emerald-400" />;
      case NotificationType.WARNING: return <AlertCircle className="text-amber-500" />;
      case NotificationType.SECURITY: return <ShieldCheck className="text-blue-500" />;
      default: return <Info className="text-slate-400" />;
    }
  };

  const getAccentColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS: return 'border-emerald-500/50 bg-emerald-500/10 shadow-emerald-900/40';
      case NotificationType.PROFIT: return 'border-emerald-400/50 bg-emerald-400/10 shadow-emerald-900/40';
      case NotificationType.WARNING: return 'border-amber-500/50 bg-amber-500/10 shadow-amber-900/40';
      case NotificationType.SECURITY: return 'border-blue-500/50 bg-blue-500/10 shadow-blue-900/40';
      default: return 'border-white/10 bg-slate-900/90 shadow-black/50';
    }
  };

  const getProgressBarColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS: return 'bg-emerald-500';
      case NotificationType.PROFIT: return 'bg-emerald-400';
      case NotificationType.WARNING: return 'bg-amber-500';
      case NotificationType.SECURITY: return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:top-8 md:${isRtl ? 'left-8' : 'right-8'} z-[1000] w-[90%] md:w-[360px] animate-in slide-in-from-top-10 fade-in duration-500 pointer-events-none`}>
      <div className={`glass p-5 rounded-[2rem] border-2 ${getAccentColor(latestNotification.type)} shadow-2xl backdrop-blur-3xl pointer-events-auto relative overflow-hidden group font-cairo`}>
        {/* Progress Bar Animation */}
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-white/5 overflow-hidden">
          <div className={`h-full animate-progress-shrink ${getProgressBarColor(latestNotification.type)}`}></div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="shrink-0 p-3 bg-slate-950/50 rounded-2xl border border-white/5 h-fit shadow-inner">
            {getIcon(latestNotification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-base font-black text-white leading-tight truncate">{latestNotification.title}</h4>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-slate-500 hover:text-white transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-300 font-bold leading-relaxed line-clamp-2">
              {latestNotification.message}
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes progress-shrink {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        .animate-progress-shrink {
          animation: progress-shrink 5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
