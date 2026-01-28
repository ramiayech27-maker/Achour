
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
import { Loader2, AlertCircle, Eye, EyeOff, ArrowRight, Zap, TrendingUp, FileText, UserCircle, ShieldCheck, Lock, Mail, KeyRound, CheckCircle2, RefreshCcw, Gift, Star, Sparkles, UserPlus, Rocket, Info, Cpu, Wifi, WifiOff, HelpCircle, Database, ChevronLeft, Copy, Terminal, PartyPopper } from 'lucide-react';

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
  const [showSqlFix, setShowSqlFix] = useState(false);
  const [copied, setCopied] = useState(false);
  const { login, register, isCloudConnected } = useUser();

  const SQL_CODE = `ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE global_chat DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE global_chat TO anon, authenticated, service_role;`;

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
        const errMsg = result.error || 'خطأ غير متوقع';
        setError(errMsg);
        if (errMsg.toLowerCase().includes('row-level security') || errMsg.toLowerCase().includes('violates') || errMsg.toLowerCase().includes('permission')) {
          setShowSqlFix(true);
        }
      }
    } catch (err: any) {
      setError("خطأ في الاتصال بقاعدة البيانات.");
    } finally {
      setIsLoading(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setError(null);
    setShowSqlFix(false);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 font-cairo text-right">
      <div className="glass w-full max-w-md p-8 md:p-10 rounded-[2.5rem] space-y-8 relative z-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-500">
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
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-xs font-bold animate-shake flex flex-col gap-3">
             <div className="flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0" /> 
                <div className="flex flex-col gap-1">
                  <span>{error}</span>
                </div>
             </div>
             {(showSqlFix || error.includes('violates')) && (
               <button onClick={() => setShowSqlFix(true)} className="bg-white/10 p-3 rounded-xl text-[10px] text-white flex items-center justify-between border border-white/10 hover:bg-white/20 transition-all">
                  <span>اضغط هنا لمعرفة كيفية الإصلاح 🛠️</span>
                  <Database size={12} />
               </button>
             )}
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

        {showSqlFix && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in">
            <div className="glass max-w-md w-full p-8 rounded-[2.5rem] border border-blue-500/30 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl"><Database size={24} /></div>
                <h3 className="text-xl font-black text-white">خطوات تفعيل الصلاحيات</h3>
              </div>
              <div className="space-y-6 text-right mb-8">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-white font-black mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px]">1</span>
                    ابحث عن أيقونة SQL Editor
                  </p>
                  <p className="text-[10px] text-slate-400 mr-7 font-bold">موجودة في القائمة اليسرى السوداء في Supabase، شكلها يشبه <Terminal size={12} className="inline mx-1 text-blue-400" /> واسمها "SQL Editor".</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-white font-black mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px]">2</span>
                    أنشئ استعلام جديد (New Query)
                  </p>
                  <p className="text-[10px] text-slate-400 mr-7 font-bold">في الصفحة التي فتحت، اضغط على البطاقة الكبيرة التي تحمل علامة <span className="text-white">+</span> أو كلمة **"New query"** في الأعلى.</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-white font-black mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px]">3</span>
                    انسخ الكود بالأسفل واضغط Run
                  </p>
                  <div className="relative mt-3">
                    <pre className="bg-black/50 p-4 rounded-xl font-mono text-[9px] text-blue-400 border border-white/5 break-all whitespace-pre-wrap text-left">
                      {SQL_CODE}
                    </pre>
                    <button onClick={copySql} className={`absolute top-2 right-2 p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white'}`}>
                      {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowSqlFix(false)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20">فهمت، سأقوم بالتنفيذ الآن</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isProfileLoaded, completeOnboarding } = useUser();
  const [showGiftSuccess, setShowGiftSuccess] = useState(false);

  const handleFinishOnboarding = async () => {
    await completeOnboarding();
    setShowGiftSuccess(true);
  };

  if (!isProfileLoaded) return <SplashScreen />;

  return (
    <>
      {/* 1. Onboarding Rules Modal */}
      {isAuthenticated && user.hasSeenOnboarding === false && !showGiftSuccess && (
        <div className="fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="glass p-10 rounded-[3rem] text-center max-w-sm border border-blue-500/20 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">قواعد التعدين</h3>
            <p className="text-slate-400 text-sm mb-8 font-bold leading-relaxed">
              أهلاً بك في MineCloud! أنت هنا تمتلك قوة معالجة حقيقية. 
              تتم إضافة الأرباح لحظياً إلى رصيدك. 
              يرجى التأكد من الحفاظ على كود المزامنة الخاص بك. هل أنت جاهز للبدء؟
            </p>
            <button 
              onClick={handleFinishOnboarding} 
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              جاهز، دعنا نبدأ!
            </button>
          </div>
        </div>
      )}

      {/* 2. Gift Success Modal - THE NEW MODAL YOU ASKED FOR */}
      {showGiftSuccess && (
        <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-700">
          <div className="relative glass p-1 rounded-[3.5rem] border-2 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] max-w-sm w-full animate-in zoom-in-90 duration-500">
            <div className="bg-slate-950 rounded-[3.4rem] p-10 text-center overflow-hidden relative">
              {/* Decorative Sparkles */}
              <Sparkles className="absolute top-6 right-6 text-amber-400 animate-pulse" size={24} />
              <PartyPopper className="absolute bottom-6 left-6 text-blue-400 animate-bounce" size={24} />
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-500/20">
                  <Gift size={48} />
                </div>
                
                <h2 className="text-3xl font-black text-white mb-2">هدية الترحيب!</h2>
                <p className="text-emerald-400 text-sm font-black uppercase tracking-widest mb-8">تم تفعيل جهازك المجاني</p>
                
                {/* Device Card in Modal */}
                <div className="bg-slate-900 rounded-3xl p-4 border border-white/5 mb-8 group">
                   <div className="aspect-video rounded-2xl overflow-hidden mb-4 border border-white/10">
                      <img src={GIFT_IMAGE} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Turbo S9" />
                   </div>
                   <h4 className="text-white font-black">Turbo S9 - Welcome Gift</h4>
                   <div className="flex items-center justify-center gap-2 mt-2">
                      <TrendingUp size={14} className="text-emerald-400" />
                      <span className="text-[10px] font-black text-slate-400">يربح 5$ خلال 24 ساعة</span>
                   </div>
                </div>

                <button 
                  onClick={() => { setShowGiftSuccess(false); navigate('/my-devices'); }} 
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  بدء التعدين الآن <Rocket size={20} />
                </button>
              </div>
            </div>
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

const App = () => (<LanguageProvider><UserProvider><AppRoutes /></UserProvider></LanguageProvider>);
export default App;
