
import React from 'react';
import { Link } from 'react-router-dom';
import { MINING_PACKAGES } from '../constants';
import { Cpu, Zap, ShieldCheck, TrendingUp, ArrowLeft, ArrowRight, Users, Globe, Lock } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useUser } from '../UserContext';

const Landing = () => {
  const { t, isRtl } = useLanguage();
  const { isAuthenticated } = useUser();
  const LOGO_URL = "https://c.top4top.io/p_3676pdlj43.jpg";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600/30 font-cairo overflow-x-hidden">
      {/* Navbar */}
      <nav className="p-6 md:px-12 flex justify-between items-center glass sticky top-0 z-[100] border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden shadow-xl shadow-blue-600/20">
            <img src={LOGO_URL} alt="MineCloud" className="w-full h-full object-cover" />
          </div>
          <span className="font-black text-2xl tracking-tighter">MineCloud</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-slate-400 hover:text-blue-400 font-bold transition-colors">{t('landing.features')}</a>
          <a href="#packages" className="text-slate-400 hover:text-blue-400 font-bold transition-colors">{t('landing.packages')}</a>
          <a href="#stats" className="text-slate-400 hover:text-blue-400 font-bold transition-colors">{t('landing.stats_title')}</a>
        </div>
        <div className="flex gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard" className="px-8 py-3 bg-blue-600 text-white rounded-[1.25rem] font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2">
              <Globe size={18} /> {t('common.dashboard')}
            </Link>
          ) : (
            <>
              <Link to="/auth" className="hidden sm:flex px-6 py-3 rounded-xl font-bold hover:text-blue-400 transition-colors">
                {t('auth.login')}
              </Link>
              <Link to="/auth" className="px-8 py-3 bg-blue-600 text-white rounded-[1.25rem] font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30">
                {t('landing.startNow')}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        
        <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-400 px-6 py-2 rounded-full text-xs font-black border border-blue-600/20 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <Zap size={16} fill="currentColor" />
          <span>{isRtl ? 'منصة التعدين السحابي الأكثر استقراراً في 2024' : 'The Most Stable Cloud Mining Platform in 2024'}</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
          {t('landing.title').split(' ').map((word, i) => (
            word.includes('تعدين') || word.includes('Mining') 
            ? <span key={i} className="gradient-text"> {word} </span> 
            : <React.Fragment key={i}> {word} </React.Fragment>
          ))}
        </h1>
        
        <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto mb-14 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700">
          {t('landing.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <Link to="/auth" className="px-12 py-5 bg-blue-600 rounded-[1.5rem] text-xl font-black hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 group">
            {t('landing.getEquipment')} {isRtl ? <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform" /> : <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />}
          </Link>
          <a href="#packages" className="px-12 py-5 glass rounded-[1.5rem] text-xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
            {t('landing.browseEquipment')}
          </a>
        </div>

        <div id="stats" className="mt-28 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            { label: t('landing.stats.active'), val: '+50k', icon: Users, color: 'text-blue-400' },
            { label: t('landing.stats.paid'), val: '$12M', icon: TrendingUp, color: 'text-emerald-400' },
            { label: t('landing.stats.hash'), val: '2.5 EH/s', icon: Zap, color: 'text-yellow-400' },
            { label: t('landing.stats.withdraw'), val: '24/7', icon: ShieldCheck, color: 'text-purple-400' }
          ].map((stat, i) => (
            <div key={i} className="glass p-8 rounded-[2rem] group hover:border-blue-500/40 transition-all border border-white/5 bg-slate-900/40">
              <div className={`p-3 w-fit rounded-xl bg-slate-950 border border-white/5 mb-4 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-1 text-white tabular-nums">{stat.val}</h3>
              <p className="text-slate-500 text-sm font-black uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6">{t('landing.whyUs')}</h2>
          <p className="text-slate-400 text-lg font-medium">{t('landing.infra')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="glass p-10 rounded-[2.5rem] border border-white/5">
            <div className="p-4 bg-blue-600/10 text-blue-400 rounded-2xl w-fit mb-6">
              <Cpu size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">{t('landing.hardwareTitle')}</h3>
            <p className="text-slate-400 leading-relaxed font-medium">{t('landing.hardwareDesc')}</p>
          </div>
          <div className="glass p-10 rounded-[2.5rem] border border-white/5">
            <div className="p-4 bg-emerald-600/10 text-emerald-400 rounded-2xl w-fit mb-6">
              <Lock size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">{t('landing.securityTitle')}</h3>
            <p className="text-slate-400 leading-relaxed font-medium">{t('landing.securityDesc')}</p>
          </div>
          <div className="glass p-10 rounded-[2.5rem] border border-white/5">
            <div className="p-4 bg-purple-600/10 text-purple-400 rounded-2xl w-fit mb-6">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">{t('landing.profitTitle')}</h3>
            <p className="text-slate-400 leading-relaxed font-medium">{t('landing.profitDesc')}</p>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-24 px-6 md:px-12 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6">{t('landing.viewPackages')}</h2>
            <p className="text-slate-400 text-lg font-medium">{t('market.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {MINING_PACKAGES.slice(0, 3).map((pkg) => (
              <div key={pkg.id} className="group relative glass rounded-[3rem] p-8 flex flex-col border transition-all duration-500 hover:-translate-y-4 border-slate-800 hover:border-blue-500/50 overflow-hidden shadow-2xl bg-slate-950/40">
                <div className="aspect-square mb-8 rounded-[2rem] overflow-hidden relative border border-white/5 shadow-inner">
                  <img src={pkg.icon} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80"></div>
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">{t('market.hashrate')}</p>
                      <p className="text-xl font-black text-white font-mono">{pkg.hashrate}</p>
                    </div>
                    <div className="bg-blue-600 text-white p-3 rounded-xl shadow-xl">
                      <Cpu size={24} />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black mb-4 text-white line-clamp-1">{pkg.name}</h3>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-blue-400 text-2xl font-black">$</span>
                  <span className="text-5xl font-black text-white font-mono tracking-tighter tabular-nums font-mono">{pkg.price}</span>
                </div>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-slate-400 font-bold">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400"><ShieldCheck size={16} /></div>
                    <span>{t('market.duration')}: {pkg.durationDays} {t('market.days')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-bold">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400"><TrendingUp size={16} /></div>
                    <span>{isRtl ? 'العائد' : 'Profit'}: {pkg.dailyProfitPercent}% {isRtl ? 'يومياً' : 'Daily'}</span>
                  </div>
                </div>

                <Link to="/auth" className="w-full py-5 bg-slate-900 rounded-2xl font-black text-lg group-hover:bg-blue-600 transition-all text-center text-slate-300 group-hover:text-white shadow-lg border border-white/5">
                  {t('market.rentNow')}
                </Link>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
             <Link to="/auth" className="text-blue-400 font-black text-lg hover:text-blue-300 flex items-center justify-center gap-2 group">
                {isRtl ? 'شاهد كافة الباقات والمعدات المتاحة' : 'View all packages and hardware'} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
             </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6 md:px-12 bg-slate-950">
        <div className="max-w-7xl mx-auto grid md:col-span-2 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={LOGO_URL} alt="MineCloud" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-2xl">MineCloud</span>
            </div>
            <p className="text-slate-500 max-w-md font-medium leading-relaxed">
              {isRtl ? 'المنصة الرائدة في تقديم خدمات التعدين السحابي الاحترافي. نهدف إلى جعل عالم العملات الرقمية متاحاً للجميع عبر توفير أقوى التقنيات بأبسط الطرق.' : 'The leading platform in providing professional cloud mining services. We aim to make the world of digital currencies accessible to everyone.'}
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-black text-white uppercase tracking-widest text-sm">{isRtl ? 'روابط سريعة' : 'Quick Links'}</h4>
            <div className="flex flex-col gap-4 text-slate-500 font-bold">
              <a href="#" className="hover:text-blue-400 transition-colors">{isRtl ? 'عن المنصة' : 'About Platform'}</a>
              <a href="#" className="hover:text-blue-400 transition-colors">{isRtl ? 'الأسئلة الشائعة' : 'FAQ'}</a>
              <a href="#" className="hover:text-blue-400 transition-colors">{isRtl ? 'دليل التعدين' : 'Mining Guide'}</a>
              <a href="#" className="hover:text-blue-400 transition-colors">{isRtl ? 'اتصل بنا' : 'Contact Us'}</a>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="font-black text-white uppercase tracking-widest text-sm">{isRtl ? 'قانوني' : 'Legal'}</h4>
            <div className="flex flex-col gap-4 text-slate-500 font-bold">
              <a href="#" className="hover:text-blue-400 transition-colors">{isRtl ? 'شروط الخدمة' : 'Terms of Service'}</a>
              <a href="#" className="hover:text-blue-400 transition-colors">{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600 text-sm font-bold">
          <p>© 2024 MineCloud Platform. {isRtl ? 'جميع الحقوق محفوظة.' : 'All Rights Reserved.'}</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
