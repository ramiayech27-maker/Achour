
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

  // وظيفة المزامنة الأساسية: تجلب البيانات من الجدول وتحدث الحالة
  const syncProfileData = async (authId: string) => {
    try {
      console.log(`[MineCloud] Syncing profile for ID: ${authId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, is_admin, data')
        .eq('id', authId)
        .maybeSingle();

      if (error) {
        console.error("[MineCloud] Error fetching profile from DB:", error.message);
        return false;
      }

      if (data) {
        let userDataFromJSON = typeof data.data === 'string' ? JSON.parse(data.data) : (data.data || {});
        
        // التحقق من الأعمدة مباشرة (Authoritative Check)
        const isAdmin = data.is_admin === true || (data.role && data.role.toLowerCase() === 'admin');
        
        const freshUser: User = {
          ...INITIAL_USER,
          ...userDataFromJSON,
          id: authId,
          email: data.email || userDataFromJSON.email,
          role: isAdmin ? 'ADMIN' : 'USER',
          is_admin: isAdmin
        };

        console.log("%c [MineCloud] Profile Synced ✅", "color: #10b981; font-weight: bold;", {
          email: freshUser.email,
          role: freshUser.role,
          is_admin: freshUser.is_admin
        });

        setUser(freshUser);
        setIsAuthenticated(true);
        return isAdmin;
      } else {
        console.warn("[MineCloud] No profile record found for this ID in 'profiles' table.");
      }
    } catch (e) {
      console.error("[MineCloud] Sync exception:", e);
    }
    return false;
  };

  const saveToCloud = async (updatedUser: User) => {
    setUser(updatedUser);
    if (updatedUser.id) {
      try {
        await supabase.from('profiles').update({
          data: updatedUser
        }).eq('id', updatedUser.id);
      } catch (e) { 
        console.error("[MineCloud] Cloud Update Error:", e); 
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // التحقق من الجلسة الحالية
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await syncProfileData(authUser.id);
      }
      setIsProfileLoaded(true);
    };

    initAuth();

    // مستمع لتغيرات حالة الدخول
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[MineCloud] Auth Event: ${event}`);
      if (session?.user) {
        await syncProfileData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(INITIAL_USER);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{
      user, isAuthenticated, isSyncing, isProfileLoaded, isCloudConnected: true,
      latestNotification,
      login: async (email, password) => {
        setIsSyncing(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
        
        if (error) {
          setIsSyncing(false);
          let msg = 'بيانات الدخول غير صحيحة';
          if (error.message.includes('rate limit')) msg = 'تجاوزت حد المحاولات المسموح به. يرجى الانتظار قليلاً.';
          return { success: false, error: msg };
        }

        if (data.user) {
          const isAdmin = await syncProfileData(data.user.id);
          setIsSyncing(false);
          return { success: true, isAdmin };
        }
        
        setIsSyncing(false);
        return { success: false, error: 'فشل غير متوقع' };
      },
      register: async (email, password) => {
        setIsSyncing(true);
        const { data, error } = await supabase.auth.signUp({ email, password: password || '' });
        
        if (error) {
          setIsSyncing(false);
          let msg = error.message;
          if (error.message.includes('rate limit')) msg = 'تجاوزت حد إرسال الإيميلات (Rate Limit). يرجى المحاولة بعد ساعة.';
          return { success: false, error: msg };
        }

        if (data.user) {
          const newUser: User = { 
            ...INITIAL_USER, 
            id: data.user.id, 
            email: email.toLowerCase(), 
            referralCode: 'MC-'+Math.floor(1000+Math.random()*9000),
            transactions: [], activePackages: [], notifications: []
          };
          
          await supabase.from('profiles').insert({ 
            id: data.user.id, 
            email: email.toLowerCase(), 
            data: newUser, 
            role: 'user', 
            is_admin: false 
          });

          setUser(newUser);
          setIsAuthenticated(true);
          setIsSyncing(false);
          return { success: true };
        }

        setIsSyncing(false);
        return { success: false, error: 'فشل إنشاء الحساب' };
      },
      logout: async () => { 
        await supabase.auth.signOut();
      },
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
        const currentTxs = Array.isArray(user.transactions) ? user.transactions : [];
        await saveToCloud({ ...user, transactions: [tx, ...currentTxs] });
      },
      withdrawFunds: async (amount, addr) => {
        if (user.balance < amount) return false;
        const tx: Transaction = { id: `WDR-${Date.now()}`, amount, type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING, date: new Date().toISOString(), currency: 'USDT', address: addr };
        const currentTxs = Array.isArray(user.transactions) ? user.transactions : [];
        await saveToCloud({ ...user, balance: user.balance - amount, transactions: [tx, ...currentTxs] });
        return true;
      },
      approveTransaction: async (uid, txid) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
        if (data) {
          const d = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
          let found = false;
          d.transactions = (d.transactions || []).map((tx:any) => {
            if (tx.id === txid && tx.status === TransactionStatus.PENDING) {
              if (tx.type === TransactionType.DEPOSIT) d.balance += tx.amount;
              found = true;
              return { ...tx, status: TransactionStatus.COMPLETED };
            }
            return tx;
          });
          if (found) {
            await supabase.from('profiles').update({ data: d }).eq('id', uid);
            if (user.id === uid) setUser(d);
          }
        }
      },
      rejectTransaction: async (uid, txid) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
        if (data) {
          const d = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
          let found = false;
          d.transactions = (d.transactions || []).map((tx:any) => {
            if (tx.id === txid && tx.status === TransactionStatus.PENDING) {
              if (tx.type === TransactionType.WITHDRAWAL) d.balance += tx.amount;
              found = true;
              return { ...tx, status: TransactionStatus.REJECTED };
            }
            return tx;
          });
          if (found) {
            await supabase.from('profiles').update({ data: d }).eq('id', uid);
            if (user.id === uid) setUser(d);
          }
        }
      },
      updateUserRole: async (uid, role) => {
        const isAdmin = role === 'ADMIN';
        await supabase.from('profiles').update({ role: role.toLowerCase(), is_admin: isAdmin }).eq('id', uid);
        if (user.id === uid) {
          setUser(prev => ({ ...prev, role: isAdmin ? 'ADMIN' : 'USER', is_admin: isAdmin }));
        }
      },
      deleteChatMessage: async (messageId) => {
        await supabase.from('global_chat').delete().eq('id', messageId);
      },
      addNotification: (title, message, type) => {
        const n = { id: `N-${Date.now()}`, title, message, type, date: new Date().toISOString(), isRead: false };
        setLatestNotification(n);
        setUser(p => ({ ...p, notifications: [n, ...(p.notifications || [])].slice(0, 20) }));
        setTimeout(() => setLatestNotification(null), 5000);
      },
      markChatAsRead: () => setUser(p => ({ ...p, lastSeenChatTime: Date.now() })),
      resetSystem: async () => { 
        await supabase.auth.signOut();
        window.location.reload(); 
      },
      confirmRecoveryKeySaved: () => setUser(p => ({ ...p, hasSavedRecoveryKey: true })),
      autoPilotMode,
      toggleAutoPilot: () => setAutoPilotMode(!autoPilotMode),
      exportAccount: () => { try { return btoa(JSON.stringify(user)); } catch (e) { return ""; } },
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
