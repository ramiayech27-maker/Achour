
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Globe, ShieldCheck, Cpu, Users, Target, Zap } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const About = () => {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();

  const features = [
    { icon: <Cpu size={32} />, title: "تقنية متطورة", desc: "نستخدم أحدث معالجات ASIC ومصفوفات الـ GPU لضمان أعلى كفاءة تعدين ممكنة." },
    { icon: <ShieldCheck size={32} />, title: "شفافية مطلقة", desc: "نؤمن بحق المستخدم في مراقبة أداء أجهزته لحظياً وبدون أي رسوم خفية." },
    { icon: <Globe size={32} />, title: "وصول عالمي", desc: "منصتنا تكسر الحواجز الجغرافية، مما يتيح للجميع التملك في أقوى مراكز البيانات." }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 font-cairo pb-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all">
          {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <div>
          <h1 className="text-3xl font-black text-white mb-1">من نحن</h1>
          <p className="text-slate-400 font-bold">تعرف على القوة الدافعة خلف MineCloud.</p>
        </div>
      </header>

      {/* Hero Section */}
      <div className="glass rounded-[3.5rem] p-12 relative overflow-hidden border border-blue-500/10 bg-gradient-to-br from-blue-600/5 to-transparent">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-400 px-4 py-2 rounded-full text-[10px] font-black border border-blue-500/20 uppercase tracking-widest">
            <Zap size={14} /> الريادة في التعدين الافتراضي
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            نحن هنا لنجعل عالم <span className="text-blue-500">الكريبتو</span> متاحاً للجميع.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            تأسست MineCloud برؤية طموحة تهدف إلى تبسيط عمليات التعدين المعقدة وتحويلها إلى تجربة ملكية رقمية سلسة. نحن لسنا مجرد وسيط، نحن شريكك التقني الذي يوفر لك الأجهزة، الصيانة، والطاقة، لتركز أنت فقط على نمو محفظتك.
          </p>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-6">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center">
            <Target size={32} />
          </div>
          <h3 className="text-2xl font-black text-white">رسالتنا</h3>
          <p className="text-slate-400 leading-relaxed font-medium">
            تمكين الأفراد من امتلاك أصول رقمية حقيقية (أجهزة تعدين) في السحابة، وتوفير بيئة استثمارية آمنة ومستقرة تحقق عوائد يومية مستدامة بعيداً عن تقلبات السوق المباشرة.
          </p>
        </div>
        <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
            <Users size={32} />
          </div>
          <h3 className="text-2xl font-black text-white">قيمنا</h3>
          <p className="text-slate-400 leading-relaxed font-medium">
            الابتكار، الأمان، والالتزام. نحن نضع حماية رصيد المستخدمين وسرعة تنفيذ العمليات المالية على رأس أولوياتنا، مع التطوير المستمر لبنيتنا التحتية لمواكبة صعوبة التعدين العالمية.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 pt-8">
        {features.map((f, i) => (
          <div key={i} className="glass p-8 rounded-[2.5rem] border border-white/5 text-center group hover:border-blue-500/30 transition-all">
            <div className="text-blue-500 mb-4 flex justify-center group-hover:scale-110 transition-transform">{f.icon}</div>
            <h4 className="text-lg font-black text-white mb-2">{f.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-bold">{f.desc}</p>
          </div>
        ))}
      </div>

      <footer className="text-center pt-10">
        <p className="text-slate-500 font-bold text-sm">© 2024 MineCloud International. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default About;
