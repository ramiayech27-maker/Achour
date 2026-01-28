
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
import { Loader2, AlertCircle, ShieldCheck, Gift, Sparkles, PartyPopper, Rocket, TrendingUp, Mail, Lock, Database, Copy, CheckCircle2, Terminal } from 'lucide-react';
import { INITIAL_USER } from './constants';

const LOGO_URL = "https://c.top4top.io/p_3676pdlj43.jpg";
const GIFT_IMAGE = "https://j.top4top.io/p_3669iibh30.jpg";

const SplashScreen = () => (
  <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center p-8 font-cairo">
    <div className="relative mb-8">
      <div className="w-24 h-24 bg-blue-600 rounded-[2rem] overflow-hidden shadow-2xl animate-pulse">
        <img src={LOGO_URL} className="w-full h-full object-cover" alt="Loading" />
      </div>
      <div className="absolute -inset-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
    <h2 className="text-2xl font-black text-white mb-2">MineCloud</h2>
    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm tracking-tight">
      <Loader2 size={16} className="animate-spin" />
      <span>جاري تأمين الجلسة السحابية...</span>
    </div>
  </div>
);

const AppRoutes = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isProfileLoaded, isSyncing, completeOnboarding } = useUser();
  const [showGiftSuccess, setShowGiftSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFinishOnboarding = async () => {
    setIsProcessing(true);
    await completeOnboarding();
    setIsProcessing(false);
    setShowGiftSuccess(true);
  };

  if (!isProfileLoaded) return <SplashScreen />;

  // منطق العرض الذهبي: 
  // 1. يجب أن يكون مسجلاً
  // 2. يجب ألا تكون هناك مزامنة جارية
  // 3. يجب أن يكون البريد حقيقياً وليس INITIAL_USER
  // 4. يجب أن تكون قيمة hasSeenOnboarding هي false حصراً
  const canShowOnboarding = isAuthenticated && 
                          !isSyncing && 
                          user.email !== INITIAL_USER.email && 
                          user.hasSeenOnboarding === false && 
                          !showGiftSuccess;

  return (
    <>
      {canShowOnboarding && (
        <div className="fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="glass p-10 rounded-[3rem] text-center max-w-sm border border-blue-500/20 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">قواعد التعدين</h3>
            <p className="text-slate-400 text-sm mb-8 font-bold leading-relaxed">
              أهلاً بك في MineCloud! أنت هنا تمتلك قوة معالجة حقيقية. 
              تتم إضافة الأرباح لحظياً إلى رصيدك. هل أنت جاهز للبدء؟
            </p>
            <button 
              disabled={isProcessing}
              onClick={handleFinishOnboarding} 
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : 'جاهز، دعنا نبدأ!'}
            </button>
          </div>
        </div>
      )}

      {showGiftSuccess && (
        <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-700">
          <div className="glass p-10 rounded-[3.5rem] border-2 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] max-w-sm w-full text-center relative">
            <Sparkles className="absolute top-6 right-6 text-amber-400 animate-pulse" size={24} />
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <Gift size={48} />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">هدية الترحيب!</h2>
            <p className="text-emerald-400 text-sm font-black uppercase tracking-widest mb-8">تم تفعيل جهازك المجاني</p>
            <div className="bg-slate-900 rounded-3xl p-4 border border-white/5 mb-8">
               <div className="aspect-video rounded-2xl overflow-hidden mb-4 border border-white/10">
                  <img src={GIFT_IMAGE} className="w-full h-full object-cover" alt="Turbo S9" />
               </div>
               <h4 className="text-white font-black text-sm">Turbo S9 - Welcome Gift</h4>
               <p className="text-[10px] text-slate-500 font-bold mt-1">يربح 5$ خلال 24 ساعة</p>
            </div>
            <button 
              onClick={() => { setShowGiftSuccess(false); navigate('/my-devices'); }} 
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              بدء التعدين الآن <Rocket size={20} />
            </button>
          </div>
        </div>
      )}

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

// مكون AuthView المحدث داخلياً لسهولة التنسيق
const AuthView = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, register, isCloudConnected } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(null); 
    if (!isCloudConnected) { setError("السحابة غير متصلة!"); return; }
    setIsLoading(true);
    try {
      const result = authMode === 'register' ? await register(email, password) : await login(email, password);
      if (result.success) navigate('/dashboard', { replace: true }); 
      else setError(result.error || 'خطأ غير متوقع');
    } catch (err: any) { setError("خطأ في الاتصال."); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 font-cairo text-right">
      <div className="glass w-full max-w-md p-10 rounded-[3rem] space-y-8 relative z-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] mx-auto flex items-center justify-center overflow-hidden shadow-2xl mb-6">
            <img src={LOGO_URL} alt="MineCloud" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">{authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
          <p className="text-slate-500 text-xs font-bold">منصة التعدين السحابي الاحترافية</p>
        </div>
        {error && <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-xs font-bold animate-shake text-center">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 text-right" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 text-right" />
          <button disabled={isLoading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center">
            {isLoading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'دخول آمن' : 'إنشاء الحساب الآن')}
          </button>
        </form>
        <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full text-slate-400 text-sm font-bold hover:text-blue-400 transition-colors">
          {authMode === 'login' ? 'ليس لديك حساب؟ افتح حساباً مجانياً' : 'لديك حساب بالفعل؟ سجل دخولك'}
        </button>
      </div>
    </div>
  );
};

const App = () => (<LanguageProvider><UserProvider><AppRoutes /></UserProvider></LanguageProvider>);
export default App;
