
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShieldAlert, Lock, Eye, Database, Globe, Scale } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Privacy = () => {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();

  const sections = [
    {
      icon: <Database className="text-blue-400" />,
      title: "جمع المعلومات",
      content: "نقوم بجمع الحد الأدنى من البيانات اللازمة لتشغيل حسابك، مثل البريد الإلكتروني وسجل العمليات المالية داخل المنصة فقط. لا نقوم بجمع أي بيانات شخصية حساسة خارج نطاق الخدمة."
    },
    {
      icon: <Lock className="text-emerald-400" />,
      title: "أمن البيانات",
      content: "تستخدم MineCloud بروتوكولات تشفير متقدمة (SSL/TLS) لحماية بياناتك. يتم تخزين كود المزامنة الخاص بك بشكل مشفر تماماً ولا يمكن حتى لموظفينا الوصول إلى مفاتيحك الخاصة."
    },
    {
      icon: <Eye className="text-purple-400" />,
      title: "مشاركة المعلومات",
      content: "نحن نلتزم بسياسة عدم البيع أو المشاركة. لن يتم تسليم بياناتك لأي طرف ثالث لأغراض تسويقية أو تجارية تحت أي ظرف من الظروف."
    },
    {
      icon: <Scale className="text-amber-400" />,
      title: "المسؤولية القانونية",
      content: "المستخدم مسؤول بشكل كامل عن حماية كود المزامنة الخاص به. فقدان هذا الكود قد يؤدي إلى فقدان الوصول إلى الحساب، حيث أن النظام يعمل بطريقة لامركزية جزئية لضمان الخصوصية."
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-cairo pb-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all">
          {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <div>
          <h1 className="text-3xl font-black text-white mb-1">سياسة الخصوصية</h1>
          <p className="text-slate-400 font-bold">كيف نحمي بياناتك وأموالك في MineCloud.</p>
        </div>
      </header>

      <div className="glass p-10 rounded-[3rem] border border-rose-500/10 bg-rose-500/5 flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center shrink-0">
          <ShieldAlert size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white">التزامنا تجاهك</h3>
          <p className="text-slate-400 leading-relaxed font-medium">
            في MineCloud، نعتبر الخصوصية حقاً أساسياً وليس خياراً. لقد صممنا نظامنا ليعمل بأقل قدر من البيانات الشخصية، مع التركيز الكامل على أمان الأصول الرقمية.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {sections.map((s, i) => (
          <div key={i} className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row gap-6 hover:bg-slate-900/40 transition-all">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
              {s.icon}
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-black text-white">{s.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{s.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-8 rounded-[2.5rem] border border-blue-500/10 bg-blue-500/5 text-center">
        <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-2xl mx-auto">
          باستخدامك لمنصة MineCloud، فإنك توافق على جمع ومعالجة معلوماتك وفقاً لهذه السياسة. نحن نحتفظ بالحق في تحديث هذه البنود لمواكبة التطورات التقنية والقانونية، وسيتم إخطارك دائماً بأي تغييرات جوهرية.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
