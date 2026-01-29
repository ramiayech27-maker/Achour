
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
    name: 'Antminer S9 - Classic',
    price: 12,
    durationDays: 15,
    dailyProfitPercent: 2.5,
    hashrate: '14 TH/s',
    icon: 'https://j.top4top.io/p_3669iibh30.jpg'
  },
  {
    id: 'pkg-2',
    name: 'Whatsminer M30S',
    price: 40,
    durationDays: 30,
    dailyProfitPercent: 2.5,
    hashrate: '88 TH/s',
    icon: 'https://g.top4top.io/p_3669m1wfm0.jpg'
  },
  {
    id: 'pkg-3',
    name: 'GPU Rig RTX 3090',
    price: 80,
    durationDays: 45,
    dailyProfitPercent: 2.5,
    hashrate: '1.2 GH/s',
    icon: 'https://i.top4top.io/p_3669ok5s40.jpg'
  },
  {
    id: 'pkg-4',
    name: 'Antminer S19 Pro',
    price: 180,
    durationDays: 60,
    dailyProfitPercent: 2.5,
    hashrate: '110 TH/s',
    icon: 'https://j.top4top.io/p_3669iibh30.jpg'
  }
];

export const MOCK_POOLS: MiningPool[] = [
  {
    id: 'pool-1',
    name: 'Fast Mining Pool',
    description: 'High efficiency pool for pro miners.',
    totalHashrate: '25.4 PH/s',
    membersCount: 1850,
    minEntryHashrate: 50,
    dailyPoolProfit: 1200,
    tags: ['Fast', 'Stable']
  }
];

export const INITIAL_USER: User = {
  id: '',
  email: '',
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
  hasSavedRecoveryKey: false,
  lastSeenChatTime: 0
};
