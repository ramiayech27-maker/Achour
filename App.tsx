
import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import { LanguageProvider } from './LanguageContext';
import { Loader2, Bug } from 'lucide-react';

const LOGO_URL = "https://c.top4top.io/p_3676pdlj43.jpg";

const SplashScreen = () => (
  <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center p-8 font-cairo text-right">
    <div className="relative mb-8">
      <div className="w-24 h-24 bg-blue-600 rounded-[2rem] overflow-hidden shadow-2xl animate-pulse">
        <img src={LOGO_URL} className="w-full h-full object-cover" alt="Loading" />
      </div>
      <div className="absolute -inset-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">MineCloud</h2>
    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm tracking-tight">
      <Loader2 size={16} className="animate-spin" />
      <span>Connecting to Secure Cloud...</span>
    </div>
  </div>
);

const DebugOverlay = () => {
  const { user, isAuthenticated } = useUser();
  if (!isAuthenticated) return null;
  return (
    <div className="fixed bottom-4 left-4 z-[9999] glass p-3 rounded-xl border border-blue-500/30 text-[10px] font-mono text-blue-400 flex items-center gap-2 pointer-events-none">
      <Bug size={14} />
      <span>Role: {user.role} | is_admin: {String(user.is_admin)}</span>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, isProfileLoaded, user } = useUser();
  if (!isProfileLoaded) return <SplashScreen />;

  // التحقق السلطوي من رتبة المسؤول
  const isAdmin = user.is_admin === true || user.role?.toLowerCase() === 'admin';

  return (
    <>
      {isAuthenticated && <AIChatBot />}
      <DebugOverlay />
      <Routes>
        <Route path="/" element={isAuthenticated ? (isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />) : <Landing />} />
        <Route path="/auth" element={!isAuthenticated ? <AuthView /> : (isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />)} />
        
        {/* User Routes */}
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
        
        {/* Strictly Protected Admin Route */}
        <Route path="/admin" element={isAuthenticated && isAdmin ? <Layout userRole={user.role}><Admin /></Layout> : <Navigate to="/dashboard" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const AuthView = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const { login, register } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(null); 
    if (authMode === 'register' && password !== confirmPassword) { setError("كلمات المرور غير متطابقة."); return; }
    setIsLoading(true);
    try {
      const result = authMode === 'register' ? await register(email, password) : await login(email, password);
      if (result.success) {
        if (result.isAdmin) navigate('/admin', { replace: true });
        else navigate('/dashboard', { replace: true }); 
      }
      else setError(result.error || 'فشل تسجيل الدخول');
    } catch (err: any) { 
      setError(err.message || "خطأ في الاتصال بالسحابة."); 
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 font-cairo text-right">
      <div className="glass w-full max-w-md p-10 rounded-[3rem] space-y-8 relative z-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] mx-auto flex items-center justify-center overflow-hidden shadow-2xl mb-6">
            <img src={LOGO_URL} alt="MineCloud" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">{authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
        </div>
        {error && <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-xs font-bold animate-shake text-center">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 text-right" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 text-right" />
          {authMode === 'register' && (
             <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="تأكيد كلمة المرور" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 text-right" />
          )}
          <button disabled={isLoading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center">
            {isLoading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'دخول آمن' : 'إنشاء الحساب الآن')}
          </button>
        </form>
        <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(null); }} className="w-full text-slate-400 text-sm font-bold hover:text-blue-400 transition-colors">
          {authMode === 'login' ? 'ليس لديك حساب؟ افتح حساباً مجانياً' : 'لديك حساب بالفعل؟ سجل دخولك'}
        </button>
      </div>
    </div>
  );
};

const App = () => (<UserProvider><LanguageProvider><AppRoutes /></LanguageProvider></UserProvider>);
export default App;
