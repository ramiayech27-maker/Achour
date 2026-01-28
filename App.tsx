
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard';
import Market from './views/Market';
import MyDevices from './views/MyDevices';
import ChatRoom from './views/ChatRoom'; 
import Wallet from './views/Wallet';
import Admin from './views/Admin';
import Transactions from './views/Transactions';
import Referrals from './views/Referrals';
import Support from './views/Support';
import Settings from './views/Settings';
import Notifications from './views/Notifications';
import About from './views/About';
import Privacy from './views/Privacy';
import AIChatBot from './components/AIChatBot';
import { UserProvider, useUser } from './UserContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { Loader2, AlertCircle, Eye, EyeOff, ArrowRight, Zap, TrendingUp, FileText, UserCircle, ShieldCheck, Lock, Mail, KeyRound, CheckCircle2, RefreshCcw, Gift, Star, Sparkles, UserPlus, Rocket, Info, Cpu } from 'lucide-react';

const LOGO_URL = "https://c.top4top.io/p_3676pdlj43.jpg";

const SplashScreen = () => (
  <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center p-8 font-cairo">
    <div className="relative mb-8">
      <div className="w-24 h-24 bg-blue-600 rounded-[2rem] overflow-hidden shadow-2xl animate-pulse">
        <img src={LOGO_URL} className="w-full h-full object-cover" alt="Loading" />
      </div>
      <div className="absolute -inset-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
    <h2 className="text-2xl font-black text-white mb-2">MineCloud</h2>
    <div className="flex items-center gap-2 text-slate-500 font-bold">
      <Loader2 size={18} className="animate-spin" />
      <span>جاري تأمين الاتصال بالسحابة...</span>
    </div>
  </div>
);

const GuestWelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const hasSeen = localStorage.getItem('minecloud_guest_welcome_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 1500); 
      return () => clearTimeout(timer);
    }
  }, []);
  const handleClose = () => {
    localStorage.setItem('minecloud_guest_welcome_seen', 'true');
    setIsOpen(false);
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500 font-cairo text-right" dir="rtl">
      <div className="relative w-full max-w-lg overflow-hidden glass rounded-[3.5rem] p-1 border-blue-500/30 shadow-[0_0_80px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500">
        <div className="bg-slate-950/80 rounded-[3.4rem] p-10 md:p-14 text-center relative">
          <div className="w-24 h-24 bg-blue-600/20 rounded-[2.5rem] flex items-center justify-center mx-auto border border-blue-500/30 relative shadow-2xl shadow-blue-600/20 overflow-hidden mb-8">
            <img src={LOGO_URL} alt="MineCloud" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">أهلاً بك في MineCloud</h2>
          <p className="text-slate-400 font-bold leading-relaxed mb-10 text-lg">أول منصة عربية احترافية لـ <span className="text-blue-500">شراء</span> أجهزة التعدين السحابي الحقيقي.</p>
          <button onClick={handleClose} className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-600/40 transition-all active:scale-95 flex items-center justify-center gap-3">ابدأ رحلة الشراء الآن <ArrowRight className="rotate-180" /></button>
        </div>
      </div>
    </div>
  );
};

const OnboardingModal = () => {
  const { completeOnboarding } = useUser();
  const [step, setStep] = useState(1);
  const steps = [
    { title: "قانون الملكية المباشرة", desc: "في منصتنا، أنت لا تستأجر الأجهزة، بل تشتريها وتصبح ملكك.", icon: <FileText className="text-blue-400" size={48} /> },
    { title: "استراتيجية جني الأرباح", desc: "يعمل جهازك بنظام الدورات الحرة. الأرباح تضاف لرصيدك لحظياً.", icon: <Zap className="text-yellow-400" size={48} /> }
  ];
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-xl animate-in fade-in">
      <div className="glass w-full max-w-md rounded-[3rem] p-10 text-center relative overflow-hidden shadow-2xl border border-blue-500/20 font-cairo">
        <div className="mb-8 flex justify-center scale-110">{steps[step-1].icon}</div>
        <h3 className="text-2xl font-black text-white mb-4 tracking-tight leading-tight">{steps[step-1].title}</h3>
        <p className="text-slate-400 mb-10 leading-relaxed text-sm font-semibold">{steps[step-1].desc}</p>
        <button onClick={() => step < 2 ? setStep(step + 1) : completeOnboarding()} className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all">
          {step < 2 ? 'موافقة ومتابعة' : 'أوافق وأبدأ'} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

const WelcomeGiftModal = () => {
  const { user, claimWelcomeGift, isSyncing, isProfileLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  
  // نظام حماية: لا تظهر الهدية أبداً إذا كانت قد استلمت (Check Cloud Data)
  useEffect(() => {
    if (isProfileLoaded && user.hasSeenOnboarding && user.hasClaimedWelcomeGift === false) { 
      setIsOpen(true); 
    } else {
      setIsOpen(false);
    }
  }, [isProfileLoaded, user.hasSeenOnboarding, user.hasClaimedWelcomeGift]);

  if (!isOpen) return null;

  const handleClaim = async () => { 
    const success = await claimWelcomeGift(); 
    if (success) setIsOpen(false); 
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-lg overflow-hidden glass rounded-[3.5rem] p-1 border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.15)] animate-in zoom-in-95 duration-500">
        <div className="bg-slate-950/80 rounded-[3.4rem] p-8 md:p-12 text-center relative">
          <Gift size={64} className="text-amber-500 animate-bounce mx-auto mb-8" />
          <h2 className="text-3xl font-black text-white mb-4">هدية انضمام فورية بقيمة 5.00$!</h2>
          <p className="text-slate-400 font-bold leading-relaxed mb-10">نمنحك <span className="text-amber-500 text-xl">5 دولارات مجانية</span> يتم تعدينها خلال الـ 24 ساعة القادمة.</p>
          <button disabled={isSyncing} onClick={handleClaim} className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
            {isSyncing ? <Loader2 className="animate-spin" /> : <>فعل جهاز الـ 5$ الآن <Sparkles size={20} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

const AuthView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login, register, checkEmailExists, resetPassword } = useUser();
  const { isRtl } = useLanguage();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('minecloud_pending_ref', refCode);
      setAuthMode('register');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null); setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    if (authMode === 'forgot-password') {
      const { exists } = await checkEmailExists(normalizedEmail);
      if (exists) { setAuthMode('reset-password'); setSuccess(isRtl ? 'تم العثور على الحساب.' : 'Account identified.'); }
      else { setError(isRtl ? 'البريد غير مسجل.' : 'Email not found.'); }
      setIsLoading(false); return;
    }

    if (authMode === 'reset-password') {
      if (password !== confirmPassword) { setError(isRtl ? 'غير متطابقة.' : 'No match.'); setIsLoading(false); return; }
      const res = await resetPassword(normalizedEmail, password);
      if (res.success) { setAuthMode('login'); setSuccess(isRtl ? 'تم التحديث.' : 'Updated.'); }
      setIsLoading(false); return;
    }

    const result = authMode === 'register' ? await register(normalizedEmail, password) : await login(normalizedEmail, password);
    if (result.success) { navigate('/dashboard', { replace: true }); } 
    else { setError(result.error || 'خطأ في البيانات'); }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 font-cairo text-right">
      <div className="glass w-full max-w-md p-8 md:p-10 rounded-[2.5rem] space-y-8 relative z-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] mx-auto flex items-center justify-center overflow-hidden shadow-2xl mb-6"><img src={LOGO_URL} alt="MineCloud" className="w-full h-full object-cover" /></div>
          <h2 className="text-3xl font-black text-white mb-2">{authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}</h2>
        </div>
        {error && <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-xs font-bold animate-shake">{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-xs font-bold">{success}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 text-right" />
          <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 text-right" />
          <button disabled={isLoading} className="w-full py-5 rounded-[1.25rem] font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xl transition-all active:scale-95">{isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'دخول'}</button>
        </form>
        <div className="text-center flex flex-col gap-3">
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-slate-400 text-sm font-bold">{authMode === 'login' ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخول'}</button>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, user, isProfileLoaded } = useUser();
  
  if (!isProfileLoaded) return <SplashScreen />;

  return (
    <>
      {!isAuthenticated && <GuestWelcomeModal />}
      {isAuthenticated && user.hasSeenOnboarding === false && <OnboardingModal />}
      {isAuthenticated && user.hasSeenOnboarding === true && user.hasClaimedWelcomeGift === false && <WelcomeGiftModal />}
      {isAuthenticated && <AIChatBot />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/auth" element={!isAuthenticated ? <AuthView /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={isAuthenticated ? <Layout userRole={user.role}><Dashboard /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/market" element={isAuthenticated ? <Layout userRole={user.role}><Market /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/my-devices" element={isAuthenticated ? <Layout userRole={user.role}><MyDevices /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/chat" element={isAuthenticated ? <Layout userRole={user.role}><ChatRoom /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/wallet" element={isAuthenticated ? <Layout userRole={user.role}><Wallet /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/transactions" element={isAuthenticated ? <Layout userRole={user.role}><Transactions /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/referrals" element={isAuthenticated ? <Layout userRole={user.role}><Referrals /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/support" element={isAuthenticated ? <Layout userRole={user.role}><Support /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/settings" element={isAuthenticated ? <Layout userRole={user.role}><Settings /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/notifications" element={isAuthenticated ? <Layout userRole={user.role}><Notifications /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/about" element={isAuthenticated ? <Layout userRole={user.role}><About /></Layout> : <Navigate to="/auth" replace />} />
        <Route path="/privacy" element={isAuthenticated ? <Layout userRole={user.role}><Privacy /></Layout> : <Navigate to="/auth" replace />} />
        {isAuthenticated && user.role === 'ADMIN' && <Route path="/admin" element={<Layout userRole={user.role}><Admin /></Layout>} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => (<LanguageProvider><UserProvider><AppRoutes /></UserProvider></LanguageProvider>);
export default App;
