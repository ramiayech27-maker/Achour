
import { MiningPackage, User, MiningPool } from './types';

export const PLATFORM_DOMAIN = "www.minecloud-pro.com"; 
export const PLATFORM_DNS = "minecloud-pro.com";
export const ADMIN_WALLET_ADDRESS = "TXLsHureixQs123XNcyzSWZ8edH6yTxS67";
export const MINIMUM_DEPOSIT_AMOUNT = 10;
export const MINIMUM_WITHDRAWAL_AMOUNT = 10;
export const WITHDRAWAL_FEE_PERCENT = 3;

export const MINING_PACKAGES: MiningPackage[] = [
  {
    id: 'pkg-1',
    name: 'Antminer S9 - الإصدار الكلاسيكي',
    price: 12,
    durationDays: 15,
    dailyProfitPercent: 2.5,
    hashrate: '14 TH/s',
    icon: 'https://j.top4top.io/p_3669iibh30.jpg'
  },
  {
    id: 'pkg-2',
    name: 'Whatsminer M30S - الفئة المتوسطة',
    price: 40,
    durationDays: 30,
    dailyProfitPercent: 2.5,
    hashrate: '88 TH/s',
    icon: 'https://g.top4top.io/p_3669m1wfm0.jpg'
  },
  {
    id: 'pkg-3',
    name: 'GPU Rig - مصفوفة RTX 3090',
    price: 80,
    durationDays: 45,
    dailyProfitPercent: 2.5,
    hashrate: '1.2 GH/s',
    icon: 'https://i.top4top.io/p_3669ok5s40.jpg'
  },
  {
    id: 'pkg-4',
    name: 'Antminer S19 Pro - التعدين الاحترافي',
    price: 180,
    durationDays: 60,
    dailyProfitPercent: 2.5,
    hashrate: '110 TH/s',
    icon: 'https://j.top4top.io/p_3669iibh30.jpg'
  },
  {
    id: 'pkg-5',
    name: 'Mining Farm - وحدة تعدين مجمعة',
    price: 300,
    durationDays: 90,
    dailyProfitPercent: 2.5,
    hashrate: '500 TH/s',
    icon: 'https://j.top4top.io/p_36694c6wc0.jpg'
  },
  {
    id: 'pkg-6',
    name: 'Enterprise DC - مركز بيانات مؤسسي',
    price: 500,
    durationDays: 120,
    dailyProfitPercent: 2.5,
    hashrate: '2.5 PH/s',
    icon: 'https://b.top4top.io/p_3669h1s150.jpeg'
  },
  {
    id: 'pkg-7',
    name: 'Bitmain Antminer L7 - العملاق المتقدم',
    price: 750,
    durationDays: 150,
    dailyProfitPercent: 2.5,
    hashrate: '9.5 GH/s',
    icon: 'https://g.top4top.io/p_3673zdc0y0.png'
  },
  {
    id: 'pkg-8',
    name: 'Immersion Mining Rack - القوة القصوى',
    price: 1000,
    durationDays: 180,
    dailyProfitPercent: 2.5,
    hashrate: '18 PH/s',
    icon: 'https://h.top4top.io/p_36734o1sf0.jpeg'
  }
];

export const MOCK_POOLS: MiningPool[] = [
  {
    id: 'pool-1',
    name: 'حوض التعدين السريع',
    description: 'حوض مخصص للأجهزة ذات الكفاءة العالية والربح السريع.',
    totalHashrate: '25.4 PH/s',
    membersCount: 1850,
    minEntryHashrate: 50,
    dailyPoolProfit: 1200,
    tags: ['سريع', 'نشط']
  }
];

export const INITIAL_USER: User = {
  id: 'u-001',
  email: 'user@example.com',
  balance: 0.00,
  totalDeposits: 0.00,
  totalEarnings: 0.00,
  referralCode: '',
  referralsList: [],
  referralCount: 0,
  referralEarnings: 0.00,
  role: 'USER',
  activePackages: [],
  transactions: [],
  notifications: [],
  lastProfitUpdate: Date.now(),
  hasSeenOnboarding: false,
  hasClaimedWelcomeGift: false,
  hasSavedRecoveryKey: false,
  lastSeenChatTime: 0
};
