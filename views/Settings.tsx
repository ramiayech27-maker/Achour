
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, Copy, CheckCircle2, 
  Bell, Globe, Shield, AlertTriangle, Key, Terminal, 
  Cloud, Sparkles, Monitor, Database, ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { user, exportAccount, resetSystem, toggleRole, requestNotificationPermission, confirmRecoveryKeySaved, addNotification } = useUser();
  
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [devClicks, setDevClicks] = useState(0);
  const [showDevMode, setShowDevMode] = useState(false);
  const [copiedSync, setCopiedSync] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [syncCode, setSyncCode] = useState('');
  const [errorOccurred, setErrorOccurred] = useState(false);
  
  const [notifStatus, setNotifStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  });

  const MASTER_ADMIN_KEY = "MINECLOUD2025";

  useEffect(() => {
    try {
      const code = exportAccount();
      setSyncCode(code);
      setErrorOccurred(false);
    } catch (e) {
      console.error("Settings Error:", e);
      setErrorOccurred(true);
    }
  }, [user, exportAccount]);

  const handleTitleClick = () => {
    const newClicks = devClicks + 1;
    setDevClicks(newClicks);
    
    if (newClicks > 3 && newClicks < 7) {
      addNotification(
        isRtl ? "تنبيه النظام" : "System Alert",
        isRtl ? `بقي ${7 - newClicks} ضغطات لتفعيل وضع المطور.` : `${7 - newClicks} clicks left to enable Dev Mode.`,
        "INFO" as any
      );
    }

    if (newClicks >= 7) {
      setShowDevMode(true);
      setDevClicks(0);
      addNotification(
        isRtl ? "وضع المطور نشط" : "Dev Mode Active",
        isRtl ? "تم إظهار خيارات الإدارة السرية." : "Secret Admin options enabled.",
        "SUCCESS" as any
      );
    }
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) return;
    const granted = await requestNotificationPermission();
    setNotifStatus(Notification.permission);
    if (granted) {
      addNotification(isRtl ? "تم التفعيل" : "Enabled", isRtl ? "ستصلك التنبيهات الآن." : "Alerts enabled.", "SUCCESS" as any);
    }
  };

  const handleCopySyncCode = () => {
    if (!syncCode) return;
    navigator.clipboard.writeText(syncCode).then(() => {
      setCopiedSync(true);
      confirmRecoveryKeySaved(); 
      setTimeout(() => setCopiedSync(false), 2000);
    });
  };

  const handleActivateAdmin = () => {
    setAdminError(null);
    if (adminKeyInput.trim().toUpperCase() === MASTER_ADMIN_KEY) {
      toggleRole();
      const currentRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
      setAdminKeyInput('');
      addNotification(isRtl ? "تم!" : "Done!", isRtl ? "تغيرت الرتبة." : "Role changed.", "SUCCESS" as any);
      if (currentRole === 'ADMIN') setTimeout(() => navigate('/admin'), 1000);
    } else {
      setAdminError(isRtl ? "الكود غير صحيح" : "Invalid Key");
    }
  };

  if (errorOccurred) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center border border-rose-500/20">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-black text-white">{isRtl ? "حدث خطأ في عرض الإعدادات" : "Error Loading Settings"}</h2>
        <p className="text-slate-400 max-w-sm font-bold">{isRtl ? "تعذر إنشاء كود المزامنة بسبب بيانات غير متوافقة. يرجى التواصل مع الدعم." : "Failed to generate sync code due to incompatible data. Contact support."}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black">إعادة تحميل الصفحة</button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 font-cairo text-right" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Header */}
      <header className="flex items-center gap-5">
        <button onClick={() => navigate(-1)} className="p-3 glass rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 active:scale-90">
          {isRtl ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
        </button>
        <div onClick={handleTitleClick} className="cursor-default select-none group">
          <h1 className="text-4xl font-black text-white mb-1 group-active:scale-95 transition-transform tracking-tight">{t('settings.title')}</h1>
          <p className="text-slate-400 font-bold">{t('settings.subtitle')}</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Cloud Sync Section */}
          <section className="glass rounded-[2.5rem] border border-blue-500/20 bg-blue-500/5 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl shadow-inner">
                  <Cloud size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-white">{t('settings.sync')}</h3>
                  <p className="text-xs text-slate-500 font-bold">{t('settings.syncDesc')}</p>
                </div>
              </div>
              {user.hasSavedRecoveryKey && (
                <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20">
                  <CheckCircle2 size={12} /> {isRtl ? 'محفوظ' : 'Saved'}
                </div>
              )}
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-3xl relative group">
                <textarea 
                  readOnly 
                  value={syncCode || (isRtl ? "جاري التوليد..." : "Generating...")}
                  className="w-full bg-transparent text-blue-400 font-mono text-[10px] h-24 resize-none outline-none custom-scrollbar pr-2 leading-relaxed text-left"
                  dir="ltr"
                />
              </div>
              <button 
                onClick={handleCopySyncCode} 
                disabled={!syncCode}
                className={`w-full h-16 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${
                  copiedSync ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {copiedSync ? <CheckCircle2 size={24} /> : <Copy size={24} />} 
                {copiedSync ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ كود المزامنة' : 'Copy Sync Code')}
              </button>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="glass rounded-[2.5rem] border border-white/5 bg-slate-900/40 overflow-hidden">
            <div className="p-8 flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl shadow-inner">
                <Bell size={24} />
              </div>
              <div>
                <h3 className="font-black text-xl text-white">{t('settings.notifications')}</h3>
                <p className="text-xs text-slate-500 font-bold">{t('settings.notifDesc')}</p>
              </div>
            </div>
            <div className="px-8 pb-8">
              {notifStatus === 'granted' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-4 text-emerald-400 font-black">
                  <CheckCircle2 size={24} />
                  <span>{isRtl ? 'الإشعارات نشطة وتعمل' : 'Notifications are active'}</span>
                </div>
              ) : (
                <button 
                  onClick={handleEnableNotifications}
                  className="w-full h-16 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] border border-white/5"
                >
                  <Sparkles size={20} className="text-amber-500" />
                  {t('settings.notifEnable')}
                </button>
              )}
            </div>
          </section>

          {/* Admin/Dev Section */}
          {(showDevMode || user.role === 'ADMIN') && (
            <section className="glass rounded-[2.5rem] border-2 border-emerald-500/40 bg-emerald-500/5 overflow-hidden animate-in slide-in-from-top-4 duration-500 shadow-2xl">
              <div className="p-8 border-b border-emerald-500/10 bg-emerald-500/10 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                  <Shield size={24} />
                </div>
                <h3 className="font-black text-xl text-white">{t('settings.adminTitle')}</h3>
              </div>
              <div className="p-8 space-y-5">
                <p className="text-xs text-slate-400 font-bold">{t('settings.adminDesc')}</p>
                <div className="flex gap-4">
                  {user.role !== 'ADMIN' && (
                    <input 
                      type="text" 
                      value={adminKeyInput}
                      onChange={(e) => setAdminKeyInput(e.target.value)}
                      placeholder="KEY-XXXX-XXXX" 
                      className="flex-1 bg-slate-950 border border-slate-800 p-5 rounded-2xl text-white outline-none focus:border-emerald-500 text-center font-black tracking-widest text-lg"
                      onKeyDown={(e) => e.key === 'Enter' && handleActivateAdmin()}
                    />
                  )}
                  <button 
                    onClick={handleActivateAdmin}
                    className={`flex-1 h-16 rounded-2xl font-black transition-all active:scale-95 shadow-xl ${user.role === 'ADMIN' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
                  >
                    {user.role === 'ADMIN' ? t('settings.adminBack') : (isRtl ? 'تفعيل الصلاحيات' : 'Activate')}
                  </button>
                </div>
                {adminError && <div className="p-4 bg-rose-500/10 text-rose-500 text-xs font-bold rounded-2xl border border-rose-500/20 animate-shake">{adminError}</div>}
              </div>
            </section>
          )}

          {/* Danger Zone */}
          <section className="glass rounded-[2.5rem] border border-rose-500/20 bg-rose-500/5 overflow-hidden">
            <div className="p-8 border-b border-rose-500/10 bg-rose-500/10 flex items-center gap-4">
              <div className="p-3 bg-rose-500/20 text-rose-500 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-black text-xl text-rose-500">{t('settings.dangerZone')}</h3>
            </div>
            <div className="p-8">
              <button onClick={() => { if(confirm(isRtl ? 'حذف كافة البيانات؟' : 'Delete all data?')) resetSystem(); }} className="w-full h-14 border border-rose-500/30 text-rose-500 rounded-2xl font-black hover:bg-rose-600 hover:text-white transition-all active:scale-95">
                {t('settings.resetSystem')}
              </button>
            </div>
          </section>

        </div>

        {/* Sidebar Info */}
        <aside className="space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border-r-4 border-r-emerald-500 bg-slate-900/40 space-y-4">
             <div className="flex items-center gap-3 text-emerald-400">
                <ShieldCheck size={24} />
                <h3 className="font-black">{isRtl ? 'أمان فائق' : 'Security'}</h3>
             </div>
             <p className="text-xs text-slate-500 font-bold leading-relaxed">
               {isRtl ? "بياناتك مشفرة محلياً (End-to-End). كود المزامنة هو مفتاحك الوحيد لاستعادة الرصيد." : "Data encrypted locally. Sync code is your only key."}
             </p>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border-r-4 border-r-blue-500 bg-slate-900/40 space-y-4">
             <div className="flex items-center gap-3 text-blue-400">
                <Monitor size={24} />
                <h3 className="font-black">{isRtl ? 'الإصدار' : 'Version'}</h3>
             </div>
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Core</span>
                <span className="text-white">v1.2.9 (Stable)</span>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
