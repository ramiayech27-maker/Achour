
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MINING_PACKAGES } from '../constants';
import { 
  Zap, ShoppingBag, Loader2, CheckCircle2, AlertCircle, RefreshCcw, ArrowRight, ArrowLeft, PlusCircle, Calculator, TrendingUp, Info, Star
} from 'lucide-react';
import { MiningPackage } from '../types';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';

const Market = () => {
  const navigate = useNavigate();
  const { user, purchaseDevice, isSyncing } = useUser();
  const { t, isRtl } = useLanguage();
  
  const [selectedPkg, setSelectedPkg] = useState<MiningPackage | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleAction = (pkg: MiningPackage) => {
    setSelectedPkg(pkg);
    setError(null);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedPkg) return;
    setError(null);
    const success = await purchaseDevice(selectedPkg);
    if (success) {
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } else {
      setError("عذراً، رصيدك الحالي غير كافٍ لإتمام عملية الشراء.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-cairo text-right" dir="rtl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-3 glass rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5">
            <ArrowRight size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">متجر الأجهزة</h1>
            <p className="text-slate-500 font-bold">امتلك قوة تعدين حقيقية بعوائد يومية ثابتة.</p>
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
          <Star className="text-emerald-500" fill="currentColor" size={18} />
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">أجهزة أصلية ومضمونة 100%</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20 max-w-6xl mx-auto">
        {MINING_PACKAGES.map((pkg) => {
          const ownedCount = user.activePackages.filter(p => p.packageId === pkg.id).length;
          const isBestSeller = pkg.price >= 80 && pkg.price <= 300;

          return (
            <div 
              key={pkg.id} 
              className={`group flex flex-col bg-slate-900/40 rounded-[2.5rem] overflow-hidden border transition-all duration-500 hover:border-blue-500/40 shadow-2xl relative ${isBestSeller ? 'ring-1 ring-blue-500/30' : 'border-white/5'}`}
            >
              {isBestSeller && (
                <div className="absolute top-6 left-6 z-20 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/30">
                   الأكثر طلباً 🔥
                </div>
              )}

              {/* Image Area */}
              <div className="relative w-full aspect-[16/9] bg-black flex items-center justify-center overflow-hidden">
                <img 
                  src={pkg.icon} 
                  alt={pkg.name} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-6 right-8">
                   <p className="text-white font-black text-2xl">{pkg.name}</p>
                   <div className="flex items-center gap-2 mt-1">
                      <Zap size={14} className="text-blue-500" fill="currentColor" />
                      <p className="text-blue-400 text-sm font-black font-mono tracking-tighter uppercase">{pkg.hashrate}</p>
                   </div>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 font-black mb-1 uppercase">العائد المتوقع (2%)</p>
                    <p className="text-emerald-400 font-black text-lg">${((pkg.price * 2) / 100).toFixed(2)}/يومي</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 font-black mb-1 uppercase">العائد الأقصى (2.5%)</p>
                    <p className="text-emerald-400 font-black text-lg">${((pkg.price * 2.5) / 100).toFixed(2)}/يومي</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">سعر الامتلاك</span>
                    <div className="flex items-baseline gap-1">
                       <span className="text-blue-500 font-black text-lg">$</span>
                       <span className="text-4xl font-black text-white font-mono tabular-nums">{pkg.price}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAction(pkg)}
                    className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-3"
                  >
                    شراء الآن <ShoppingBag size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Modal */}
      {showConfirmModal && selectedPkg && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in">
          <div className="glass w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
             <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                   <ShoppingBag size={40} />
                </div>
                <h3 className="text-2xl font-black text-white">تأكيد الشراء</h3>
                <p className="text-slate-500 font-bold mt-2">هل أنت متأكد من رغبتك في امتلاك {selectedPkg.name}؟</p>
             </div>

             <div className="p-5 bg-slate-900/50 rounded-2xl border border-white/5 space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                   <span className="text-slate-500 font-bold">قيمة الجهاز:</span>
                   <span className="text-white font-black">${selectedPkg.price}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                   <span className="text-slate-500 font-bold">رصيدك الحالي:</span>
                   <span className="text-blue-400 font-black">${user.balance.toFixed(2)}</span>
                </div>
             </div>

             {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-xl mb-6 animate-shake">{error}</div>}
             
             <div className="flex gap-4">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold">إلغاء</button>
                <button disabled={isSyncing} onClick={confirmAction} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">
                   {isSyncing ? <Loader2 className="animate-spin" /> : 'تأكيد ودفع'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-2xl animate-in fade-in">
          <div className="glass w-full max-w-xs rounded-[3.5rem] p-12 text-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
              <CheckCircle2 size={56} className="animate-bounce" />
            </div>
            <h3 className="text-3xl font-black text-white mb-3">مبروك!</h3>
            <p className="text-slate-400 mb-10 font-bold leading-relaxed">تمت إضافة الجهاز بنجاح إلى أسطولك التعديني. يمكنك الآن تشغيله من صفحة "أجهزتي".</p>
            <button onClick={() => navigate('/my-devices')} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">تفعيل الجهاز الآن</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
