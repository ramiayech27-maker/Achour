
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Gift, 
  Copy, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  TrendingUp,
  Share2,
  DollarSign,
  Info,
  Award,
  Link as LinkIcon,
  Calendar
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';
import { PLATFORM_DOMAIN } from '../constants';

const Referrals = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isRtl } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralLink = useMemo(() => {
    // نستخدم HashRouter لذا الرابط يجب أن يكون بالتنسيق الصحيح
    const baseUrl = window.location.origin + window.location.pathname.split('#')[0];
    return `${baseUrl}#/auth?ref=${user.referralCode}`;
  }, [user.referralCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const referralSteps = [
    { icon: <Share2 className="text-blue-400" />, title: isRtl ? "شارك الرابط" : "Share Link", desc: isRtl ? "أرسل رابط الدعوة الخاص بك لأصدقائك أو شاركه على منصات التواصل." : "Send your referral link to friends or share it on social media." },
    { icon: <UserPlus className="text-emerald-400" />, title: isRtl ? "تسجيل الفريق" : "Team Signup", desc: isRtl ? "عندما يقوم الصديق بالتسجيل عبر رابطك ويقوم بأول عملية شراء جهاز." : "When a friend registers via your link and makes their first device purchase." },
    { icon: <Gift className="text-amber-400" />, title: isRtl ? "عمولات فورية" : "Instant Reward", desc: isRtl ? "ستحصل على عمولة بنسبة 5% كاش تضاف لرصيدك مباشرة عن كل عملية شراء." : "Get a 5% cash commission added to your balance for every purchase they make." }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-cairo">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all active:scale-90">
            {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <div>
            <h1 className="text-3xl font-black text-white mb-1">{isRtl ? 'نظام الإحالات الذكي' : 'Smart Referral System'}</h1>
            <p className="text-slate-400 font-medium">{isRtl ? 'حول شبكتك الاجتماعية إلى مصدر دخل سلبي مستمر.' : 'Turn your social network into a passive income stream.'}</p>
          </div>
        </div>
      </header>

      <div className="glass rounded-[2.5rem] p-1 border-blue-500/20 shadow-2xl overflow-hidden relative group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]"></div>
        <div className="bg-slate-950/60 rounded-[2.4rem] p-8 md:p-12 relative z-10">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-12">
            <div className="space-y-6 flex-1 text-center xl:text-right">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-xs font-black border border-blue-500/20 uppercase tracking-widest">
                <Award size={16} /><span>{isRtl ? 'برنامج شركاء المنصة' : 'Partner Program'}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                {isRtl ? <>ادعُ أصدقاءك <br/><span className="text-blue-500">واربح 5% كاش</span></> : <>Invite Friends <br/><span className="text-blue-500">& Earn 5% Cash</span></>}
              </h2>
              <p className="text-slate-400 max-w-lg leading-relaxed font-medium mx-auto xl:mx-0">
                {isRtl ? 'بمجرد تسجيل أي شخص من خلال رابطك، يصبح جزءاً من فريقك للأبد، وستربح من كل جهاز يشتريه.' : 'Once someone signs up through your link, they join your team forever, and you earn from every purchase.'}
              </p>
            </div>
            <div className="w-full xl:w-auto space-y-4">
              <div className="glass bg-slate-900/40 p-6 rounded-[2rem] border-white/5 space-y-4 min-w-[320px] md:min-w-[450px]">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2"><LinkIcon size={12} /> {isRtl ? 'رابط الدعوة المباشر' : 'Direct Referral Link'}</p>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group/link transition-all hover:border-blue-500/50">
                  <span className="text-[10px] font-mono text-blue-400 truncate ml-4 ltr">{referralLink}</span>
                  <button onClick={handleCopyLink} className={`p-3 rounded-xl transition-all shrink-0 ${copiedLink ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>{copiedLink ? <CheckCircle2 size={18} /> : <Copy size={18} />}</button>
                </div>
              </div>
              <div className="glass bg-slate-900/40 p-6 rounded-[2rem] border-white/5 flex items-center justify-between">
                <div><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{isRtl ? 'كود الدعوة' : 'Referral Code'}</p><span className="text-xl font-black text-white font-mono">{user.referralCode}</span></div>
                <button onClick={handleCopyCode} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${copiedCode ? 'text-emerald-500' : 'text-blue-400 hover:text-white'}`}>{copiedCode ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الكود' : 'Copy Code')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={isRtl ? "إجمالي الفريق" : "Total Team"} value={user.referralCount} icon={Users} color="bg-blue-500" subValue={isRtl ? "صديق منضم" : "Friends joined"} />
        <StatCard label={isRtl ? "أرباح العمولات" : "Commission Earnings"} value={`$${user.referralEarnings.toFixed(2)}`} icon={DollarSign} color="bg-emerald-500" subValue={isRtl ? "رصيد مكتسب" : "Earned balance"} />
        <StatCard label={isRtl ? "نسبة الربح" : "Profit Share"} value="5%" icon={TrendingUp} color="bg-amber-500" subValue={isRtl ? "على المشتريات" : "On purchases"} />
      </div>

      <div className="glass rounded-[2rem] overflow-hidden border border-slate-800/50">
        <div className="p-8 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
          <h3 className="font-bold text-xl flex items-center gap-3 text-white"><Users className="text-blue-500" size={24} />{isRtl ? 'أعضاء فريقك الحقيقيين' : 'Real Team Members'}</h3>
          <span className="text-[10px] font-black text-slate-500 bg-slate-800 px-4 py-1.5 rounded-full uppercase tracking-widest">Active Referrals</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right" dir={isRtl ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-slate-900/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                <th className="px-8 py-6">{isRtl ? 'المستخدم' : 'User'}</th>
                <th className="px-8 py-6">{isRtl ? 'تاريخ الانضمام' : 'Joined Date'}</th>
                <th className="px-8 py-6 text-center">{isRtl ? 'الحالة' : 'Status'}</th>
                <th className="px-8 py-6">{isRtl ? 'نشاط الشراء' : 'Purchase Activity'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {user.referralsList && user.referralsList.length > 0 ? (
                user.referralsList.map((ref, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-blue-500 border border-white/5">
                          {ref.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{ref.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-400 font-bold flex items-center gap-2 mt-3">
                       <Calendar size={14}/> {new Date(ref.date).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 size={12} /> {isRtl ? 'نشط' : 'Active'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {ref.hasPurchased ? (
                        <span className="text-emerald-400 font-black text-xs">{isRtl ? 'قام بالشراء ✓' : 'Purchased ✓'}</span>
                      ) : (
                        <span className="text-slate-500 font-black text-xs">{isRtl ? 'لم يشترِ بعد' : 'No Purchase Yet'}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <UserPlus size={64} className="mb-4 text-slate-700" />
                      <p className="text-xl font-bold">{isRtl ? 'فريقك لا يزال فارغاً' : 'No team members yet'}</p>
                      <p className="text-sm mt-1">{isRtl ? 'ابدأ بمشاركة الرابط الآن وابنِ مستقبلك.' : 'Start sharing your link and build your future.'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-3xl flex items-start gap-4">
        <Info className="text-blue-500 shrink-0 mt-1" size={24} />
        <div>
          <h4 className="font-bold text-blue-400 mb-1">{isRtl ? 'كيفية احتساب العمولات' : 'How commissions work'}</h4>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            {isRtl ? 'يتم دفع العمولة لحظة قيام الصديق بشراء أي جهاز من مركز الأجهزة. تضاف العمولات فوراً إلى رصيد الكاش المتاح للسحب.' : 'Commissions are paid the moment a friend purchases a device. Rewards are instantly added to your withdrawable cash balance.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
