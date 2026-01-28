
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
import { Loader2, AlertCircle, Eye, EyeOff, ArrowRight, Zap, TrendingUp, FileText, UserCircle, ShieldCheck, Lock, Mail, KeyRound, CheckCircle2, RefreshCcw, Gift, Star, Sparkles, UserPlus, Rocket, Info, Cpu, Wifi, WifiOff, HelpCircle } from 'lucide-react';

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

const AuthView = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showKeyInfo, setShowKeyInfo] = useState(false);
  const { login, register, isCloudConnected } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(null); 
    
    if (!isCloudConnected) {
      setError("السحابة غير متصلة! يرجى إضافة SUPABASE_URL و SUPABASE_ANON_KEY في إعدادات Netlify.");
      return;
    }

    if (authMode === 'register') {
      if (password !== confirmPassword) {
        setError("كلمتا المرور غير متطابقتين! يرجى التأكد.");
        return;
      }
      if (password.length < 6) {
        setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل.");
        return;
      }
    }

    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const result = authMode === 'register' ? await register(normalizedEmail, password) : await login(normalizedEmail, password);
      if (result.success) { 
        navigate('/dashboard', { replace: true }); 
      } else { 
        setError(result.error || 'خطأ غير متوقع في البيانات'); 
      }
    } catch (err: any) {
      setError("خطأ تقني: تأكد من تفعيل الجداول في Supabase عبر SQL Editor.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 font-cairo text-right">
      <div className="glass w-full max-w-md p-8 md:p-10 rounded-[2.5rem] space-y-8 relative z-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-500">
        
        {/* مؤشر حالة الاتصال العلوي */}
        <div className="absolute top-6 left-8 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isCloudConnected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse'}`}></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {isCloudConnected ? 'Cloud Active' : 'Cloud Offline'}
          </span>
        </div>

        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] mx-auto flex items-center justify-center overflow-hidden shadow-2xl mb-6">
            <img src={LOGO_URL} alt="MineCloud" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">
            {authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <p className="text-slate-500 text-xs font-bold">منصة التعدين السحابي الاحترافية</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-xs font-bold animate-shake flex items-start gap-3">
             <AlertCircle size={18} className="shrink-0" /> 
             <div className="flex flex-col gap-1">
                <span>{error}</span>
                {!isCloudConnected && (
                  <button onClick={() => setShowKeyInfo(true)} className="text-[10px] text-blue-400 underline mt-1 flex items-center gap-1">
                    <HelpCircle size={10} /> كيف أقوم بربط السحابة؟
                  </button>
                )}
             </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full bg-slate-900/50 border border-slate-800 p-4 pr-12 rounded-2xl text-white outline-none focus:border-blue-500 text-right transition-all" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-900/50 border border-slate-800 p-4 pr-12 rounded-2xl text-white outline-none focus:border-blue-500 text-right transition-all" />
            </div>
          </div>

          {authMode === 'register' && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">تأكيد كلمة المرور</label>
              <div className="relative">
                <ShieldCheck className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${confirmPassword && password === confirmPassword ? 'text-emerald-500' : 'text-slate-600'}`} size={18} />
                <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="أعد كتابة الكلمة" className={`w-full bg-slate-900/50 border p-4 pr-12 rounded-2xl text-white outline-none text-right transition-all ${confirmPassword && password !== confirmPassword ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-blue-500'}`} />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[9px] text-rose-500 font-bold mr-2 mt-1">الكلمتان غير متطابقتين</p>
              )}
            </div>
          )}
          
          <button disabled={isLoading} className={`w-full py-5 rounded-[1.25rem] font-black text-lg shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-800' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'}`}>
            {isLoading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'دخول آمن' : 'إنشاء الحساب الآن')}
          </button>
        </form>

        <div className="text-center">
          <button onClick={toggleMode} className="text-slate-400 text-sm font-bold hover:text-blue-400 transition-colors">
            {authMode === 'login' ? 'ليس لديك حساب؟ افتح حساباً مجانياً' : 'لديك حساب بالفعل؟ سجل دخولك'}
          </button>
        </div>

        {/* مودال شرح الربط */}
        {showKeyInfo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in">
            <div className="glass max-w-sm w-full p-8 rounded-[2.5rem] border border-blue-500/30 text-center">
              <Info className="text-blue-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-black text-white mb-4">خطوات ربط السحابة</h3>
              <div className="text-right space-y-4 mb-8">
                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                  1. اذهب لـ <span className="text-white">Netlify Dashboard</span>.<br/>
                  2. ادخل لـ <span className="text-white">Site Configuration</span> ثم <span className="text-white">Environment variables</span>.<br/>
                  3. أضف <span className="text-blue-400">SUPABASE_URL</span> و <span className="text-blue-400">SUPABASE_ANON_KEY</span>.<br/>
                  4. اذهب لـ <span className="text-white">Deploys</span> واضغط <span className="text-white">Clear cache and deploy site</span>.
                </p>
              </div>
              <button onClick={() => setShowKeyInfo(false)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black">فهمت ذلك</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, user, isProfileLoaded } = useUser();
  if (!isProfileLoaded) return <SplashScreen />;
  return (
    <>
      {isAuthenticated && user.hasSeenOnboarding === false && <div className="fixed inset-0 z-[200] bg-slate-950/98 flex items-center justify-center p-4"><div className="glass p-10 rounded-[3rem] text-center max-w-sm"><h3 className="text-2xl font-black text-white mb-4">قواعد التعدين</h3><p className="text-slate-400 text-sm mb-8 font-bold leading-relaxed">أهلاً بك! في MineCloud أنت تشتري أجهزة حقيقية. الأرباح تضاف لحظياً. هل أنت جاهز؟</p><button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">موافق</button></div></div>}
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
