
import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Wallet, Users, Settings as SettingsIcon, LogOut, Menu, X, 
  History, Headset, Cpu, Bell, ShieldCheck, MessageCircle, Store
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';
import NotificationToast from './NotificationToast';

interface LayoutProps {
  children?: React.ReactNode;
  userRole: 'USER' | 'ADMIN';
}

const Layout: React.FC<LayoutProps> = ({ children, userRole }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { t, isRtl } = useLanguage();
  const { user, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const mainContentRef = useRef<HTMLElement>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const CHAT_STORAGE_KEY = 'minecloud_community_chat_v1';

  useEffect(() => {
    const calculateUnread = () => {
      if (location.pathname === '/chat') {
        setUnreadChatCount(0);
        return;
      }
      try {
        const stored = localStorage.getItem(CHAT_STORAGE_KEY);
        const messages = stored ? JSON.parse(stored) : [];
        const lastSeen = user?.lastSeenChatTime || 0;
        const unread = messages.filter((m: any) => m.timestamp > lastSeen && m.senderEmail !== user?.email);
        setUnreadChatCount(unread.length);
      } catch (e) {
        setUnreadChatCount(0);
      }
    };

    calculateUnread();
    const interval = setInterval(calculateUnread, 1000);
    return () => clearInterval(interval);
  }, [user?.lastSeenChatTime, user?.email, location.pathname]);

  useLayoutEffect(() => {
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
  }, [location.pathname]);

  const menuSections = [
    { title: isRtl ? "عام" : "General", items: [
      { name: "لوحة التحكم", path: '/dashboard', icon: LayoutDashboard },
      { name: "أجهزة التعدين", path: '/market', icon: Store },
      { name: "تكلم مع المدير", path: '/chat', icon: MessageCircle, isSpecial: true, badge: unreadChatCount },
    ]},
    { title: isRtl ? "مركز التعدين" : "Mining Hub", items: [
      { name: "أجهزتي الخاصة", path: '/my-devices', icon: Cpu },
    ]},
    { title: isRtl ? "الحساب والمحفظة" : "Account", items: [
      { name: "المحفظة", path: '/wallet', icon: Wallet },
      { name: "سجل العمليات", path: '/transactions', icon: History },
      { name: "نظام الإحالات", path: '/referrals', icon: Users },
      { name: "التنبيهات", path: '/notifications', icon: Bell, badge: user.notifications.filter(n => !n.isRead).length },
    ]},
    { title: isRtl ? "الإدارة" : "Admin", isAdminOnly: true, items: [
      { name: "لوحة المسؤول", path: '/admin', icon: ShieldCheck },
    ]},
    { title: isRtl ? "أخرى" : "Others", items: [
      { name: "الدعم الفني", path: '/support', icon: Headset },
      { name: "الإعدادات", path: '/settings', icon: SettingsIcon },
    ]}
  ];

  return (
    <div className={`min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden font-cairo ${isRtl ? 'text-right' : 'text-left'}`}>
      <NotificationToast />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-5 glass border-b border-white/5 sticky top-0 z-[60]">
        <button onClick={() => setSidebarOpen(true)} className="p-3 bg-slate-900 rounded-2xl text-white active:scale-90 transition-all shadow-lg">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-3">
           <button onClick={() => navigate('/chat')} className="p-2.5 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-600/20 flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="text-[10px] font-black">الدعم</span>
           </button>
           <span className="font-black text-lg text-white">MineCloud</span>
        </div>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 z-[60] md:relative w-72 glass border-l border-white/5 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full') + ' md:translate-x-0'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2 group">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/30">
              <img src="https://c.top4top.io/p_3676pdlj43.jpg" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-white tracking-tight">MineCloud</span>
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Premium Mining</span>
            </div>
          </div>

          <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
            {menuSections.map((section, idx) => {
              if (section.isAdminOnly && userRole !== 'ADMIN') return null;
              return (
                <div key={idx} className="space-y-3">
                  <h5 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60">{section.title}</h5>
                  <div className="space-y-1.5">
                    {section.items.map((item: any) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link 
                          key={item.path} 
                          to={item.path} 
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all ${
                            isActive 
                            ? 'bg-blue-600 text-white font-black shadow-xl' 
                            : item.isSpecial 
                            ? 'bg-rose-600 text-white font-black shadow-xl animate-pulse' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white font-bold'
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-sm">{item.name}</span>
                          {item.badge > 0 && (
                            <span className="absolute left-4 px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-rose-600">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          <button onClick={() => { logout(); navigate('/auth'); }} className="mt-8 flex items-center gap-3 p-4 text-rose-500 font-black hover:bg-rose-500/10 rounded-2xl transition-all">
            <LogOut size={18} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen custom-scrollbar p-6 md:p-10 bg-slate-950" ref={mainContentRef}>
        <div className="max-w-5xl mx-auto pb-24">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
