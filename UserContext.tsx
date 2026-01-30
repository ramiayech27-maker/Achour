
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseConfig';
import { INITIAL_USER } from './constants';
import { User, MiningPackage, TransactionType, TransactionStatus, DeviceStatus, AppNotification, NotificationType, UserPackage, Transaction } from './types';

interface UserContextType {
  user: User;
  isAuthenticated: boolean;
  isSyncing: boolean;
  isProfileLoaded: boolean;
  isCloudConnected: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean, isAdmin?: boolean, error?: string }>;
  register: (email: string, password?: string) => Promise<{ success: boolean, error?: string }>;
  logout: () => void;
  purchaseDevice: (pkg: MiningPackage) => Promise<boolean>;
  activateCycle: (instanceId: string, days: number, rate: number) => Promise<boolean>;
  depositFunds: (amount: number, method: 'crypto', txHash?: string) => Promise<void>;
  withdrawFunds: (amount: number, address: string) => Promise<boolean>;
  approveTransaction: (targetUserId: string, txId: string) => Promise<void>;
  rejectTransaction: (targetUserId: string, txId: string) => Promise<void>;
  updateUserRole: (targetUserId: string, newRole: 'USER' | 'ADMIN') => Promise<void>;
  deleteChatMessage: (messageId: string) => Promise<void>;
  addNotification: (title: string, message: string, type: NotificationType) => void;
  markChatAsRead: () => void;
  resetSystem: () => void;
  confirmRecoveryKeySaved: () => void;
  autoPilotMode: boolean;
  toggleAutoPilot: () => void;
  exportAccount: () => string;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
  latestNotification: AppNotification | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [autoPilotMode, setAutoPilotMode] = useState(false);
  const [latestNotification, setLatestNotification] = useState<AppNotification | null>(null);

  const syncProfileData = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, is_admin, data')
        .eq('id', authId)
        .maybeSingle();

      if (error) {
        console.error("[MineCloud] Sync Error:", error.message);
        return false;
      }

      if (data) {
        let userDataFromJSON = typeof data.data === 'string' ? JSON.parse(data.data) : (data.data || {});
        const isAdmin = data.is_admin === true || (data.role && data.role.toLowerCase() === 'admin');
        
        const freshUser: User = {
          ...INITIAL_USER,
          ...userDataFromJSON,
          id: authId,
          email: data.email || userDataFromJSON.email || '',
          role: isAdmin ? 'ADMIN' : 'USER',
          is_admin: !!isAdmin
        };

        setUser(freshUser);
        setIsAuthenticated(true);
        return isAdmin;
      }
    } catch (e) {
      console.error("[MineCloud] Sync Exception:", e);
    }
    return false;
  };

  const saveToCloud = async (updatedUser: User) => {
    setUser(updatedUser);
    if (updatedUser.id) {
      try {
        await supabase.from('profiles').update({ data: updatedUser }).eq('id', updatedUser.id);
      } catch (e) { console.error("[MineCloud] Update Error:", e); }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) await syncProfileData(authUser.id);
      setIsProfileLoaded(true);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) await syncProfileData(session.user.id);
      else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(INITIAL_USER);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{
      user, isAuthenticated, isSyncing, isProfileLoaded, isCloudConnected: true, latestNotification,
      login: async (email, password) => {
        setIsSyncing(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
        if (error) {
          setIsSyncing(false);
          let msg = error.message;
          if (msg.includes('rate limit')) msg = 'تم تجاوز حد الطلبات. حاول بعد قليل.';
          if (msg.includes('Email not confirmed')) msg = 'يرجى تأكيد حسابك من خلال الرابط المرسل لبريدك الإلكتروني.';
          return { success: false, error: msg };
        }
        if (data.user) {
          const isAdmin = await syncProfileData(data.user.id);
          setIsSyncing(false);
          return { success: true, isAdmin };
        }
        setIsSyncing(false);
        return { success: false, error: 'خطأ غير معروف.' };
      },
      register: async (email, password) => {
        setIsSyncing(true);
        const { data, error: authError } = await supabase.auth.signUp({ email, password: password || '' });
        
        if (authError) {
          setIsSyncing(false);
          let msg = authError.message;
          if (msg.includes('rate limit')) msg = 'تجاوزت حد إرسال الرسائل. يرجى الانتظار ساعة.';
          return { success: false, error: msg };
        }

        if (data.user) {
          const newUser: User = { 
            ...INITIAL_USER, 
            id: data.user.id, 
            email: email.toLowerCase(), 
            referralCode: 'MC-'+Math.floor(1000+Math.random()*9000),
            role: 'USER', is_admin: false
          };
          
          // محاولة حفظ في جدول البروفايل مع معالجة الأخطاء
          const { error: dbError } = await supabase.from('profiles').upsert({ 
            id: data.user.id, 
            email: email.toLowerCase(), 
            data: newUser, 
            role: 'user', 
            is_admin: false 
          });

          if (dbError) {
            console.error("[MineCloud] DB Error:", dbError);
            // محاولة ثانية ببيانات أقل في حال عدم وجود أعمدة مخصصة
            const { error: retryError } = await supabase.from('profiles').upsert({ 
              id: data.user.id, 
              email: email.toLowerCase(), 
              data: newUser
            });
            
            if (retryError) {
              setIsSyncing(false);
              return { success: false, error: "خطأ في قاعدة البيانات: يرجى التأكد من صلاحيات RLS في Supabase." };
            }
          }

          // إذا كان البريد يحتاج تأكيد، لن يتم تسجيل الدخول تلقائياً
          if (data.session) {
            setUser(newUser);
            setIsAuthenticated(true);
          } else {
            setIsSyncing(false);
            return { success: true, error: "تم الإنشاء! يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب." };
          }

          setIsSyncing(false);
          return { success: true };
        }

        setIsSyncing(false);
        return { success: false, error: 'فشل إنشاء الحساب.' };
      },
      logout: () => supabase.auth.signOut(),
      purchaseDevice: async (pkg) => {
        if (user.balance < pkg.price) return false;
        const newPkg: UserPackage = { 
          instanceId: `D-${Date.now()}`, packageId: pkg.id, name: pkg.name, priceAtPurchase: pkg.price, 
          status: DeviceStatus.IDLE, purchaseDate: Date.now(), icon: pkg.icon, dailyProfit: (pkg.price * pkg.dailyProfitPercent)/100 
        };
        await saveToCloud({ ...user, balance: user.balance - pkg.price, activePackages: [newPkg, ...(user.activePackages || [])] });
        return true;
      },
      activateCycle: async (id, days, rate) => {
        const updated = { 
          ...user, 
          activePackages: (user.activePackages || []).map(p => 
            p.instanceId === id ? { ...p, status: DeviceStatus.RUNNING, lastActivationDate: Date.now(), expiryDate: Date.now() + (days * 86400000), currentDurationDays: days, currentDailyRate: rate } : p
          ) 
        };
        await saveToCloud(updated);
        return true;
      },
      depositFunds: async (amount, method, hash) => {
        const tx: Transaction = { id: `DEP-${Date.now()}`, amount, type: TransactionType.DEPOSIT, status: TransactionStatus.PENDING, date: new Date().toISOString(), currency: 'USDT', txHash: hash };
        await saveToCloud({ ...user, transactions: [tx, ...(user.transactions || [])] });
      },
      withdrawFunds: async (amount, addr) => {
        if (user.balance < amount) return false;
        const tx: Transaction = { id: `WDR-${Date.now()}`, amount, type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING, date: new Date().toISOString(), currency: 'USDT', address: addr };
        await saveToCloud({ ...user, balance: user.balance - amount, transactions: [tx, ...(user.transactions || [])] });
        return true;
      },
      approveTransaction: async (uid, txid) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
        if (data) {
          const d = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
          d.transactions = (d.transactions || []).map((tx:any) => {
            if (tx.id === txid && tx.status === TransactionStatus.PENDING) {
              if (tx.type === TransactionType.DEPOSIT) d.balance += tx.amount;
              return { ...tx, status: TransactionStatus.COMPLETED };
            }
            return tx;
          });
          await supabase.from('profiles').update({ data: d }).eq('id', uid);
          if (user.id === uid) setUser(d);
        }
      },
      rejectTransaction: async (uid, txid) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
        if (data) {
          const d = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
          d.transactions = (d.transactions || []).map((tx:any) => {
            if (tx.id === txid && tx.status === TransactionStatus.PENDING) {
              if (tx.type === TransactionType.WITHDRAWAL) d.balance += tx.amount;
              return { ...tx, status: TransactionStatus.REJECTED };
            }
            return tx;
          });
          await supabase.from('profiles').update({ data: d }).eq('id', uid);
          if (user.id === uid) setUser(d);
        }
      },
      updateUserRole: async (uid, role) => {
        const isAdmin = role === 'ADMIN';
        await supabase.from('profiles').update({ role: role.toLowerCase(), is_admin: isAdmin }).eq('id', uid);
        if (user.id === uid) setUser(prev => ({ ...prev, role: isAdmin ? 'ADMIN' : 'USER', is_admin: isAdmin }));
      },
      deleteChatMessage: (id) => supabase.from('global_chat').delete().eq('id', id),
      addNotification: (title, message, type) => {
        const n = { id: `N-${Date.now()}`, title, message, type, date: new Date().toISOString(), isRead: false };
        setLatestNotification(n);
        setUser(p => ({ ...p, notifications: [n, ...(p.notifications || [])].slice(0, 20) }));
        setTimeout(() => setLatestNotification(null), 5000);
      },
      markChatAsRead: () => setUser(p => ({ ...p, lastSeenChatTime: Date.now() })),
      resetSystem: () => { supabase.auth.signOut(); window.location.reload(); },
      confirmRecoveryKeySaved: () => setUser(p => ({ ...p, hasSavedRecoveryKey: true })),
      autoPilotMode,
      toggleAutoPilot: () => setAutoPilotMode(!autoPilotMode),
      exportAccount: () => btoa(JSON.stringify(user)),
      markNotificationsAsRead: () => setUser(p => ({ ...p, notifications: (p.notifications || []).map(n => ({ ...n, isRead: true })) })),
      clearNotifications: () => setUser(p => ({ ...p, notifications: [] }))
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const c = useContext(UserContext);
  if (!c) throw new Error("UserContext missing");
  return c;
};
