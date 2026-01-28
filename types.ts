
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  EARNING = 'EARNING',
  PURCHASE = 'PURCHASE',
  UPGRADE = 'UPGRADE',
  REFERRAL_BONUS = 'REFERRAL_BONUS'
}

export enum DeviceStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED'
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  SECURITY = 'SECURITY',
  PROFIT = 'PROFIT'
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  isRead: boolean;
}

export interface MiningPackage {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  dailyProfitPercent: number;
  hashrate: string;
  icon: string;
}

export interface MiningPool {
  id: string;
  name: string;
  description: string;
  totalHashrate: string;
  membersCount: number;
  minEntryHashrate: number;
  dailyPoolProfit: number;
  tags: string[];
}

export interface UserPackage {
  instanceId: string;
  packageId: string;
  name: string;
  priceAtPurchase: number; 
  status: DeviceStatus;
  purchaseDate: number; 
  lastActivationDate?: number;
  expiryDate?: number; 
  currentDurationDays?: number;
  currentDailyRate?: number;
  isClaimed: boolean; 
  icon: string;
  dailyProfit: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  currency: string;
  address?: string;
  txHash?: string;
}

export interface ReferralEntry {
  email: string;
  date: string;
  hasPurchased: boolean;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  balance: number;
  totalDeposits: number;
  totalEarnings: number;
  referralCode: string;
  referredBy?: string; // كود الشخص الذي دعاه
  referralsList: ReferralEntry[]; // قائمة الأشخاص الذين دعاهم
  referralCount: number;
  referralEarnings: number;
  role: 'USER' | 'ADMIN';
  activePackages: UserPackage[];
  transactions: Transaction[];
  notifications: AppNotification[];
  lastProfitUpdate: number;
  hasSeenOnboarding: boolean;
  hasClaimedWelcomeGift: boolean;
  hasSavedRecoveryKey: boolean;
  lastSeenChatTime?: number;
}
