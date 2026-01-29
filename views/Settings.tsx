
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, Copy, CheckCircle2, 
  Bell, Globe, Shield, AlertTriangle, Key, Terminal, 
  Cloud, Sparkles, Monitor, Database, ShieldAlert, Lock
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { user, exportAccount, resetSystem, toggleRole, requestNotificationPermission, confirmRecoveryKeySaved, addNotification } = useUser();
  
  const [adminKeyInput, setAdminKeyInput] = useState('');
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
      setAdminKeyInput('');
      addNotification(
        isRtl ? "تمت العملية" : "Success", 
        isRtl ? "تغيرت صلاحيات الحساب بنجاح." : "Account permissions updated.", 
        "SUCCESS" as any
      );
    } else {
      setAdminError(isRtl ? "مفتاح الوصول غير صحيح" : "Invalid Access Key");
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
      
      <header className="flex items-center gap-5">
        <button onClick={() => navigate(-1)} className="p-3 glass rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 active:scale-90">
          {isRtl ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
        </button>
        <div>
          <h1 className="text-4xl font-black text-white mb-1 tracking-tight">{t('settings.title')}</h1>
          <p className="text-slate-400 font-bold">{t('settings.subtitle')}</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <section className="glass rounded-[2.5rem] border border-blue-500/20 bg-blue-500/5 overflow-hidden shadow-2xl relative">
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
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-3xl relative group">
                <textarea 
                  readOnly 
                  value={syncCode || "..."}
                  className="w-full bg-transparent text-blue-400 font-mono text-[10px] h-24 resize-none outline-none custom-scrollbar pr-2 leading-relaxed text-left"
                  dir="ltr"
                />
              </div>
              <button onClick={handleCopySyncCode} className={`w-full h-16 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${copiedSync ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500'} text-white shadow-xl`}>
                {copiedSync ? <CheckCircle2 size={24} /> : <Copy size={24} />} 
                {copiedSync ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ كود المزامنة' : 'Copy Sync Code')}
              </button>
            </div>
          </section>

          {/* Admin Activation Section - Explicit */}
          <section className="glass rounded-[2.5rem] border border-amber-500/20 bg-amber-500/5 overflow-hidden shadow-xl">
            <div className="p-8 border-b border-white/5 flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl shadow-inner">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="font-black text-xl text-white">{isRtl ? "صلاحيات الوصول المتقدمة" : "Advanced Access"}</h3>
                <p className="text-xs text-slate-500 font-bold">{isRtl ? "أدخل مفتاح الإدارة لتفعيل لوحة التحكم." : "Enter admin key to enable dashboard."}</p>
              </div>
            </div>
            <div className="p-8 space-y-5">
              <div className="flex gap-3">
                <input 
                  type="password" 
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  placeholder="MASTER-KEY" 
                  className="flex-1 bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-amber-500 text-center font-black tracking-widest"
                />
                <button 
                  onClick={handleActivateAdmin}
                  className={`px-8 py-4 rounded-2xl font-black transition-all shadow-xl ${user.role === 'ADMIN' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-slate-950 hover:bg-amber-500'}`}
                >
                  {user.role === 'ADMIN' ? (isRtl ? 'إلغاء الإدارة' : 'Revoke') : (isRtl ? 'تفعيل' : 'Activate')}
                </button>
              </div>
              {adminError && <div className="text-center text-rose-500 text-xs font-black">{adminError}</div>}
              {user.role === 'ADMIN' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-2 text-emerald-400 text-xs font-black">
                  <ShieldCheck size={16} /> {isRtl ? "أنت مسجل كمسؤول الآن" : "You are currently an admin"}
                </div>
              )}
            </div>
          </section>

          <section className="glass rounded-[2.5rem] border border-rose-500/20 bg-rose-500/5 overflow-hidden">
            <div className="p-8 border-b border-rose-500/10 bg-rose-500/10 flex items-center gap-4">
              <div className="p-3 bg-rose-500/20 text-rose-500 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-black text-xl text-rose-500">{t('settings.dangerZone')}</h3>
            </div>
            <div className="p-8">
              <button onClick={() => { if(confirm(isRtl ? 'حذف كافة البيانات؟' : 'Delete all data?')) resetSystem(); }} className="w-full h-14 border border-rose-500/30 text-rose-500 rounded-2xl font-black hover:bg-rose-600 hover:text-white transition-all">
                {t('settings.resetSystem')}
              </button>
            </div>
          </section>

        </div>

        <aside className="space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border-r-4 border-r-emerald-500 bg-slate-900/40 space-y-4">
             <div className="flex items-center gap-3 text-emerald-400">
                <ShieldCheck size={24} />
                <h3 className="font-black">{isRtl ? 'أمان فائق' : 'Security'}</h3>
             </div>
             <p className="text-xs text-slate-500 font-bold leading-relaxed">
               {isRtl ? "بياناتك مشفرة ومخزنة في السحابة بناءً على رتبة حسابك الحقيقية." : "Data is encrypted and stored in the cloud based on your real role."}
             </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
