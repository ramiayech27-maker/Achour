
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_USER } from './constants';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';
import { User, MiningPackage, TransactionType, TransactionStatus, DeviceStatus, AppNotification, NotificationType, UserPackage, Transaction } from './types';

const isPlaceHolder = SUPABASE_URL.includes("your-project-id") || SUPABASE_ANON_KEY.includes("your-public-anon-key");
const supabase = (SUPABASE_URL.startsWith('http') && !isPlaceHolder) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

interface UserContextType {
  user: User;
  isAuthenticated: boolean;
  isSyncing: boolean;
  isProfileLoaded: boolean;
  isCloudConnected: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean, error?: string }>;
  register: (email: string, password?: string) => Promise<{ success: boolean, error?: string }>;
  logout: () => void;
  purchaseDevice: (pkg: MiningPackage) => Promise<boolean>;
  claimWelcomeGift: () => Promise<boolean>; 
  activateCycle: (instanceId: string, days: number, rate: number) => Promise<boolean>;
  depositFunds: (amount: number, method: 'crypto', txHash?: string) => Promise<void>;
  withdrawFunds: (amount: number, address: string) => Promise<boolean>;
  approveTransaction: (targetUserId: string, txId: string) => Promise<void>;
  rejectTransaction: (targetUserId: string, txId: string) => Promise<void>;
  addNotification: (title: string, message: string, type: NotificationType) => void;
  markChatAsRead: () => void;
  toggleRole: () => void;
  resetSystem: () => void;
  completeOnboarding: () => void;
  confirmRecoveryKeySaved: () => void;
  autoPilotMode: boolean;
  toggleAutoPilot: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  exportAccount: () => string;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
  checkEmailExists: (email: string) => Promise<{ exists: boolean }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean, error?: string }>;
  latestNotification: AppNotification | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
// مفتاح جلسة فريد لضمان عدم التضارب
const AUTH_KEY = 'minecloud_session_v8_final';

export const UserProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [autoPilotMode, setAutoPilotMode] = useState(false);
  const [latestNotification, setLatestNotification] = useState<AppNotification | null>(null);

  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // 1. استعادة الجلسة والبيانات فوراً
  useEffect(() => {
    const initSession = async () => {
      const savedEmail = localStorage.getItem(AUTH_KEY);
      if (savedEmail && supabase) {
        setIsSyncing(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('data')
            .eq('email', savedEmail.toLowerCase())
            .maybeSingle();
          
          if (data && !error) {
            setUser(data.data);
            setIsAuthenticated(true);
          } else {
            // إذا لم نجد البيانات في السحابة، نمسح الجلسة المحلية
            localStorage.removeItem(AUTH_KEY);
          }
        } catch (e) {
          console.error("Critical: Could not connect to Supabase");
        }
      }
      setIsProfileLoaded(true);
      setIsSyncing(false);
    };
    initSession();
  }, []);

  // 2. مزامنة البيانات تلقائياً عند أي تغيير (Auto-Save)
  const saveToCloud = async (updatedUser: User) => {
    setUser(updatedUser);
    if (supabase && updatedUser.email && updatedUser.email !== INITIAL_USER.email) {
      await supabase.from('profiles').upsert({ 
        email: updatedUser.email.toLowerCase(), 
        data: updatedUser 
      }, { onConflict: 'email' });
    }
  };

  // 3. محرك الأرباح اللحظي (Mining Engine)
  useEffect(() => {
    if (!isAuthenticated || !isProfileLoaded) return;
    const interval = setInterval(() => {
      setUser(current => {
        if (!current.activePackages || current.activePackages.length === 0) return current;
        const now = Date.now();
        let addedProfit = 0;
        let hasStateChange = false;
        
        const updatedPackages = current.activePackages.map(pkg => {
          if (pkg.status === DeviceStatus.RUNNING && pkg.expiryDate) {
            if (now >= pkg.expiryDate) {
              hasStateChange = true;
              return { ...pkg, status: DeviceStatus.COMPLETED };
            }
            const daily = (pkg.priceAtPurchase * (pkg.currentDailyRate || 0)) / 100;
            addedProfit += daily / 86400;
          }
          return pkg;
        });

        if (addedProfit > 0 || hasStateChange) {
          return { 
            ...current, 
            balance: current.balance + addedProfit, 
            totalEarnings: current.totalEarnings + addedProfit,
            activePackages: updatedPackages 
          };
        }
        return current;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isProfileLoaded]);

  return (
    <UserContext.Provider value={{
      user, isAuthenticated, isSyncing, isProfileLoaded, isCloudConnected: !!supabase,
      latestNotification,
      login: async (email, pass) => {
        if (!supabase) return { success: false, error: 'Offline' };
        setIsSyncing(true);
        const { data } = await supabase.from('profiles').select('data').eq('email', email.toLowerCase()).maybeSingle();
        if (data && data.data.password === pass) {
          localStorage.setItem(AUTH_KEY, email.toLowerCase());
          setUser(data.data);
          setIsAuthenticated(true);
          setIsSyncing(false);
          return { success: true };
        }
        setIsSyncing(false);
        return { success: false, error: 'خطأ في البريد أو كلمة المرور' };
      },
      register: async (email, pass) => {
        if (!supabase) return { success: false };
        setIsSyncing(true);
        const normalizedEmail = email.toLowerCase().trim();
        const { data: existing } = await supabase.from('profiles').select('email').eq('email', normalizedEmail).maybeSingle();
        if (existing) {
          setIsSyncing(false);
          return { success: false, error: 'البريد مسجل مسبقاً' };
        }
        const newUser = { ...INITIAL_USER, id: `U-${Date.now()}`, email: normalizedEmail, password: pass, referralCode: 'MC-'+Math.floor(1000+Math.random()*9000) };
        await supabase.from('profiles').insert({ email: normalizedEmail, data: newUser });
        localStorage.setItem(AUTH_KEY, normalizedEmail);
        setUser(newUser);
        setIsAuthenticated(true);
        setIsSyncing(false);
        return { success: true };
      },
      logout: () => { 
        localStorage.removeItem(AUTH_KEY); 
        setIsAuthenticated(false); 
        setUser(INITIAL_USER); 
      },
      purchaseDevice: async (pkg) => {
        if (user.balance < pkg.price) return false;
        const newPkg: UserPackage = { instanceId: `D-${Date.now()}`, packageId: pkg.id, name: pkg.name, priceAtPurchase: pkg.price, status: DeviceStatus.IDLE, purchaseDate: Date.now(), isClaimed: true, icon: pkg.icon, dailyProfit: (pkg.price * pkg.dailyProfitPercent)/100 };
        await saveToCloud({ ...user, balance: user.balance - pkg.price, activePackages: [newPkg, ...user.activePackages] });
        return true;
      },
      claimWelcomeGift: async () => {
        // حماية قصوى: منع إرسال الهدية إذا كانت قد تم استلامها مسبقاً
        if (user.hasClaimedWelcomeGift) return false;
        
        const gift: UserPackage = { 
          instanceId: `GIFT-${Date.now()}`, 
          packageId: 'gift', 
          name: 'Turbo S9 - Welcome Gift', 
          priceAtPurchase: 5, 
          status: DeviceStatus.RUNNING, 
          purchaseDate: Date.now(), 
          lastActivationDate: Date.now(), 
          expiryDate: Date.now() + 86400000, 
          currentDurationDays: 1, 
          currentDailyRate: 100, 
          isClaimed: true, 
          icon: 'https://j.top4top.io/p_3669iibh30.jpg', 
          dailyProfit: 5 
        };
        
        // التحديث في السحابة فوراً قبل أي شيء
        const updated = { ...user, hasClaimedWelcomeGift: true, activePackages: [gift, ...user.activePackages] };
        await saveToCloud(updated);
        return true;
      },
      activateCycle: async (id, days, rate) => {
        const updated = { ...user, activePackages: user.activePackages.map(p => p.instanceId === id ? { ...p, status: DeviceStatus.RUNNING, lastActivationDate: Date.now(), expiryDate: Date.now()+(days*86400000), currentDurationDays: days, currentDailyRate: rate } : p) };
        await saveToCloud(updated);
        return true;
      },
      depositFunds: async (amount, method, hash) => {
        const tx: Transaction = { id: `DEP-${Date.now()}`, amount, type: TransactionType.DEPOSIT, status: TransactionStatus.PENDING, date: new Date().toISOString(), currency: 'USDT', txHash: hash };
        await saveToCloud({ ...user, transactions: [tx, ...user.transactions] });
      },
      withdrawFunds: async (amount, addr) => {
        if (user.balance < amount) return false;
        const tx: Transaction = { id: `WDR-${Date.now()}`, amount, type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING, date: new Date().toISOString(), currency: 'USDT', address: addr };
        await saveToCloud({ ...user, balance: user.balance - amount, transactions: [tx, ...user.transactions] });
        return true;
      },
      approveTransaction: async (uid, txid) => {
        if (!supabase) return;
        const { data } = await supabase.from('profiles').select('data').eq('data->>id', uid).maybeSingle();
        if (data) {
          const d = data.data;
          d.transactions = d.transactions.map((tx:any) => {
            if (tx.id === txid && tx.status === 'PENDING') {
              if (tx.type === 'DEPOSIT') d.balance += tx.amount;
              return { ...tx, status: 'COMPLETED' };
            }
            return tx;
          });
          await supabase.from('profiles').update({ data: d }).eq('email', d.email);
          if (user.id === uid) setUser(d);
        }
      },
      rejectTransaction: async (uid, txid) => {
        if (!supabase) return;
        const { data } = await supabase.from('profiles').select('data').eq('data->>id', uid).maybeSingle();
        if (data) {
          const d = data.data;
          d.transactions = d.transactions.map((tx:any) => {
            if (tx.id === txid && tx.status === 'PENDING') {
              if (tx.type === 'WITHDRAWAL') d.balance += tx.amount;
              return { ...tx, status: 'REJECTED' };
            }
            return tx;
          });
          await supabase.from('profiles').update({ data: d }).eq('email', d.email);
          if (user.id === uid) setUser(d);
        }
      },
      addNotification: (title, message, type) => {
        const n = { id: `N-${Date.now()}`, title, message, type, date: new Date().toISOString(), isRead: false };
        setLatestNotification(n);
        setUser(p => ({ ...p, notifications: [n, ...p.notifications].slice(0, 20) }));
        setTimeout(() => setLatestNotification(null), 5000);
      },
      markChatAsRead: () => setUser(p => ({ ...p, lastSeenChatTime: Date.now() })),
      resetPassword: async (e, p) => {
        if (!supabase) return { success: false };
        const { data } = await supabase.from('profiles').select('data').eq('email', e.toLowerCase()).maybeSingle();
        if (data) {
          const d = { ...data.data, password: p };
          await supabase.from('profiles').update({ data: d }).eq('email', e.toLowerCase());
          return { success: true };
        }
        return { success: false };
      },
      checkEmailExists: async (e) => {
        if (!supabase) return { exists: false };
        const { data } = await supabase.from('profiles').select('email').eq('email', e.toLowerCase()).maybeSingle();
        return { exists: !!data };
      },
      toggleRole: () => setUser(p => ({ ...p, role: p.role === 'ADMIN' ? 'USER' : 'ADMIN' })),
      resetSystem: () => { localStorage.clear(); window.location.reload(); },
      completeOnboarding: () => saveToCloud({ ...user, hasSeenOnboarding: true }),
      confirmRecoveryKeySaved: () => setUser(p => ({ ...p, hasSavedRecoveryKey: true })),
      autoPilotMode,
      toggleAutoPilot: () => setAutoPilotMode(!autoPilotMode),
      requestNotificationPermission: async () => true,
      exportAccount: () => btoa(JSON.stringify(userRef.current)),
      markNotificationsAsRead: () => setUser(p => ({ ...p, notifications: p.notifications.map(n => ({ ...n, isRead: true })) })),
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
