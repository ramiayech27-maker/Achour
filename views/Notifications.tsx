
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, ArrowRight, ArrowLeft, Trash2, CheckCircle2, 
  AlertCircle, ShieldCheck, TrendingUp, Info, Clock, CheckSquare
} from 'lucide-react';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';
import { NotificationType } from '../types';

const Notifications = () => {
  const navigate = useNavigate();
  const { user, markNotificationsAsRead, clearNotifications } = useUser();
  const { isRtl } = useLanguage();

  useEffect(() => {
    markNotificationsAsRead();
  }, []);

  const handleBack = () => {
    // محاولة الرجوع خطوة للخلف، وإذا لم يوجد سجل، العودة للوحة التحكم
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS: return <CheckCircle2 className="text-emerald-500" />;
      case NotificationType.PROFIT: return <TrendingUp className="text-emerald-400" />;
      case NotificationType.WARNING: return <AlertCircle className="text-amber-500" />;
      case NotificationType.SECURITY: return <ShieldCheck className="text-blue-500" />;
      default: return <Info className="text-slate-400" />;
    }
  };

  const getBg = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS: return 'bg-emerald-500/10 border-emerald-500/20';
      case NotificationType.PROFIT: return 'bg-emerald-500/10 border-emerald-500/20';
      case NotificationType.WARNING: return 'bg-amber-500/10 border-amber-500/20';
      case NotificationType.SECURITY: return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-slate-800/50 border-white/5';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-cairo pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack} 
            className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all active:scale-90 border border-white/5"
            title={isRtl ? "رجوع" : "Back"}
          >
            {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <div>
            <h1 className="text-3xl font-black text-white mb-1">مركز التنبيهات</h1>
            <p className="text-slate-400">تابع كافة التحديثات والأنشطة المتعلقة بحسابك.</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={clearNotifications} className="px-5 py-3 glass rounded-xl text-rose-500 font-bold text-sm flex items-center gap-2 border border-rose-500/20 hover:bg-rose-500/10 transition-all">
             <Trash2 size={18} /> مسح الكل
           </button>
        </div>
      </header>

      <div className="space-y-4">
        {user.notifications.length > 0 ? user.notifications.map((n) => (
          <div key={n.id} className={`glass p-6 rounded-[2rem] border transition-all flex gap-5 items-start ${n.isRead ? 'opacity-70' : 'shadow-lg shadow-blue-600/5'} ${getBg(n.type)}`}>
             <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5">
                {getIcon(n.type)}
             </div>
             <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                   <h3 className={`text-lg font-black ${n.isRead ? 'text-slate-300' : 'text-white'}`}>{n.title}</h3>
                   <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                      <Clock size={12} />
                      {new Date(n.date).toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{n.message}</p>
             </div>
             {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>}
          </div>
        )) : (
          <div className="py-32 flex flex-col items-center justify-center glass rounded-[3rem] border-dashed border-2 border-slate-800 opacity-30">
             <Bell size={64} className="text-slate-600 mb-4" />
             <p className="text-xl font-bold">لا توجد تنبيهات جديدة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
