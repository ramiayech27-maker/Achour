
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Wallet as WalletIcon, Copy, CheckCircle2, Bitcoin, ArrowRight, ArrowLeft,
  Loader2, AlertTriangle, Info, Clock, ShieldCheck, Lock,
  Shield, AlertCircle, Zap, Calculator
} from 'lucide-react';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';
import { TransactionStatus, TransactionType } from '../types';
import { ADMIN_WALLET_ADDRESS, MINIMUM_WITHDRAWAL_AMOUNT, WITHDRAWAL_FEE_PERCENT, MINIMUM_DEPOSIT_AMOUNT } from '../constants';

const Wallet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, withdrawFunds, depositFunds, isSyncing, autoPilotMode } = useUser();
  const { t, isRtl } = useLanguage();
  
  const initialTab = (location.state as any)?.tab || 'deposit';
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(initialTab);
  
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [address, setAddress] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // حاسبة الرسوم
  const withdrawalCalculation = useMemo(() => {
    const val = parseFloat(amount) || 0;
    const fee = (val * WITHDRAWAL_FEE_PERCENT) / 100;
    return {
      fee: fee.toFixed(2),
      net: (val - fee).toFixed(2)
    };
  }, [amount]);

  const handleCopy = () => {
    navigator.clipboard.writeText(ADMIN_WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositConfirm = async () => {
    const dAmount = parseFloat(depositAmount);
    if (isNaN(dAmount) || dAmount < MINIMUM_DEPOSIT_AMOUNT) {
      setError(isRtl ? `الحد الأدنى للإيداع هو $${MINIMUM_DEPOSIT_AMOUNT}` : `Minimum deposit is $${MINIMUM_DEPOSIT_AMOUNT}`);
      return;
    }
    if (!txHash) {
      setError(isRtl ? "يرجى إدخال رقم العملية (TxHash)" : "Please enter TxHash");
      return;
    }
    setError(null);
    await depositFunds(dAmount, 'crypto', txHash);
    setShowDepositModal(true);
    setDepositAmount('');
    setTxHash('');
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError(isRtl ? "يرجى إدخال مبلغ صحيح" : "Invalid amount");
      return;
    }
    if (withdrawAmount < MINIMUM_WITHDRAWAL_AMOUNT) {
      setError(isRtl ? `الحد الأدنى للسحب هو $${MINIMUM_WITHDRAWAL_AMOUNT}` : `Min withdrawal is $${MINIMUM_WITHDRAWAL_AMOUNT}`);
      return;
    }
    if (withdrawAmount > user.balance) {
      setError(isRtl ? "رصيدك غير كافٍ" : "Insufficient balance");
      return;
    }
    
    const success = await withdrawFunds(withdrawAmount, address);
    if (success) {
      setShowSuccessModal(true);
      setAmount('');
      setAddress('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-cairo pb-20 text-right" dir="rtl">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-3xl font-black text-white tracking-tight">المحفظة</h1>
        </div>
      </header>

      <div className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden bg-gradient-to-br from-slate-900/40 to-slate-950/40">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500"><WalletIcon size={20} /></div>
             <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">الرصيد الكلي المتاح</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-blue-500 text-4xl font-black">$</span>
            <h2 className="text-7xl font-black text-white font-mono">{user.balance.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[3rem] overflow-hidden border border-white/5">
          <div className="flex bg-slate-950/50 p-2 m-6 rounded-2xl border border-white/5">
            <button onClick={() => setActiveTab('deposit')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'deposit' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400'}`}>إيداع</button>
            <button onClick={() => setActiveTab('withdraw')} className={`flex-1 py-4 rounded-xl font-black transition-all ${activeTab === 'withdraw' ? 'bg-rose-600 text-white shadow-xl' : 'text-slate-400'}`}>سحب</button>
          </div>
          
          <div className="p-10 pt-0">
            {activeTab === 'deposit' ? (
              <div className="space-y-6 animate-in slide-in-from-top-4">
                <div className="p-6 bg-blue-600/10 border border-blue-600/20 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4"><Bitcoin size={32} className="text-blue-400" /><span className="font-black text-white">USDT (TRC20)</span></div>
                  <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">آمن ومؤكد</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mr-2">
                      <label className="text-xs font-black text-slate-500 uppercase">المبلغ ($)</label>
                      <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                        <AlertCircle size={12} />
                        <span className="text-[10px] font-black tracking-tight">الحد الأدنى: ${MINIMUM_DEPOSIT_AMOUNT}</span>
                      </div>
                    </div>
                    <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-6 rounded-2xl text-white font-black text-2xl focus:border-blue-500 outline-none text-right" placeholder="0.00" />
                  </div>
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <p className="text-[10px] text-slate-500 font-black">عنوان محفظة الاستقبال</p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-slate-900 p-3 rounded-xl text-blue-400 font-mono text-xs truncate">{ADMIN_WALLET_ADDRESS}</div>
                      <button onClick={handleCopy} className="p-3 bg-blue-600 text-white rounded-xl">{copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase mr-2">رقم العملية (Hash)</label>
                    <input type="text" value={txHash} onChange={(e) => setTxHash(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white font-mono text-xs outline-none text-right" placeholder="الصق الـ Hash هنا" />
                  </div>
                  {error && <div className="p-4 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold border border-rose-500/20">{error}</div>}
                  <button onClick={handleDepositConfirm} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95">تأكيد الإيداع</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-6 animate-in slide-in-from-top-4">
                <div className="p-6 bg-rose-600/5 border border-rose-600/10 rounded-[2.5rem] space-y-4">
                   <div className="flex items-center gap-2 text-rose-500"><AlertTriangle size={20} /><h4 className="font-black text-sm">شروط السحب</h4></div>
                   <p className="text-xs text-slate-400 font-bold">الحد الأدنى للسحب هو 10$. رسوم الشبكة والمحفظة هي {WITHDRAWAL_FEE_PERCENT}%.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase mr-2">المبلغ المراد سحبه ($)</label>
                    <input required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-6 rounded-2xl text-white font-black text-2xl focus:border-rose-500 outline-none text-right" />
                  </div>
                  {parseFloat(amount) > 0 && (
                    <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-in fade-in">
                       <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                          <span>رسوم الخدمة ({WITHDRAWAL_FEE_PERCENT}%):</span>
                          <span className="text-rose-500">-${withdrawalCalculation.fee}</span>
                       </div>
                       <div className="flex justify-between items-center text-lg font-black text-white border-t border-white/5 pt-3">
                          <div className="flex items-center gap-2"><Calculator size={16} className="text-blue-500"/> صافي الاستلام:</div>
                          <span className="text-emerald-400">${withdrawalCalculation.net}</span>
                       </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase mr-2">عنوان محفظتك (USDT TRC20)</label>
                    <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-xl text-white font-mono text-xs text-right" placeholder="أدخل عنوان محفظة Binance الخاص بك" />
                  </div>
                </div>
                {error && <div className="p-4 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold border border-rose-500/20">{error}</div>}
                <button className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95">طلب سحب الأرباح</button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
              <h3 className="font-black text-white text-lg">نصيحة أمنية</h3>
              <p className="text-xs text-slate-400 leading-relaxed">تأكد دائماً من اختيار شبكة <b>TRC20</b> عند النسخ من Binance لتجنب ضياع الأموال.</p>
              <div className="p-4 bg-blue-600/10 rounded-2xl flex items-center gap-3">
                 <ShieldCheck className="text-blue-500" />
                 <span className="text-[10px] text-white font-black uppercase tracking-widest">مؤمن بالكامل</span>
              </div>
           </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in">
          <div className="glass w-full max-w-sm rounded-[3rem] p-12 text-center">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">تم استلام طلبك</h3>
            <p className="text-slate-400 mb-8 text-sm">سيتم مراجعة طلب السحب وإرسال الصافي <b>(${withdrawalCalculation.net})</b> إلى محفظتك خلال 30 دقيقة.</p>
            <button onClick={() => { setShowSuccessModal(false); navigate('/transactions'); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">حسناً</button>
          </div>
        </div>
      )}

      {showDepositModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in">
          <div className="glass w-full max-w-sm rounded-[3rem] p-12 text-center">
            <div className="w-24 h-24 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
              <Clock size={48} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">قيد التحقق</h3>
            <p className="text-slate-400 mb-8 text-sm">نحن نتحقق الآن من صحة الـ Hash عبر الشبكة. سيتم تحديث رصيدك تلقائياً فور التأكيد.</p>
            <button onClick={() => setShowDepositModal(false)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black shadow-lg">فهمت ذلك</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
