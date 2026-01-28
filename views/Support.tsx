
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, Headset, Mail, MessageCircle, ChevronDown, 
  HelpCircle, Zap, Globe, Smartphone, Send
} from 'lucide-react';
import { MINIMUM_WITHDRAWAL_AMOUNT } from '../constants';
import { useLanguage } from '../LanguageContext';

const faqs = [
  {
    question: "كيف أبدأ التعدين في المنصة؟",
    answer: "عليك أولاً إيداع رصيد في محفظتك عبر USDT (TRC20)، ثم التوجه إلى أجهزة التعدين واختيار الجهاز الذي يناسبك وتفعيله بضغطة زر."
  },
  {
    question: "كم تستغرق عملية السحب؟",
    answer: "تتم معالجة طلبات السحب عادةً في غضون 10 إلى 30 دقيقة، وفي حالات نادرة قد تستغرق 24 ساعة كحد أقصى للتدقيق الأمني."
  },
  {
    question: "ما هو الحد الأدنى للإيداع والسحب؟",
    answer: `الحد الأدنى للإيداع هو 10 دولار، والحد الأدنى للسحب هو حالياً ${MINIMUM_WITHDRAWAL_AMOUNT} دولار لضمان استقرار التدفقات النقدية للجميع.`
  },
  {
    question: "هل يمكنني شراء أكثر من جهاز؟",
    answer: "نعم، يمكنك تملك وإدارة عدد غير محدود من أجهزة التعدين في نفس الوقت، وستتراكم الأرباح جميعها في رصيدك الموحد."
  }
];

const Support = () => {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-cairo pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 glass rounded-2xl text-slate-400 hover:text-white transition-all">
            {isRtl ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
          </button>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">مركز الدعم</h1>
            <p className="text-slate-400 font-bold">نحن هنا لمساعدتك في أي وقت على مدار الساعة.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-blue-600/10 border border-blue-500/20 px-6 py-3 rounded-2xl">
           <Zap className="text-blue-500" />
           <span className="text-xs font-black text-white uppercase tracking-widest">خدمة عملاء 24/7</span>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-6">
            <a href="https://wa.me/minecloud" target="_blank" className="glass p-10 rounded-[3rem] flex flex-col items-center text-center gap-6 group hover:border-emerald-500/50 transition-all bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl shadow-emerald-500/10">
                <MessageCircle size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-2">واتساب مباشر</h3>
                <p className="text-sm text-slate-400 font-bold leading-relaxed">تحدث مع موظف خدمة العملاء بشكل مباشر لحل المشاكل التقنية والمالية فوراً.</p>
              </div>
              <div className="w-full mt-4 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2">
                ابدأ الدردشة الآن <ArrowRight size={18} />
              </div>
            </a>

            <a href="mailto:support@minecloud.app" className="glass p-10 rounded-[3rem] flex flex-col items-center text-center gap-6 group hover:border-blue-500/50 transition-all bg-blue-500/5 border border-blue-500/10">
              <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl shadow-blue-500/10">
                <Mail size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-2">البريد الإلكتروني</h3>
                <p className="text-sm text-slate-400 font-bold leading-relaxed">للاستفسارات الرسمية، الاقتراحات، وطلبات التعاون المؤسسي.</p>
              </div>
              <div className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2">
                ارسل إيميل <ArrowRight size={18} />
              </div>
            </a>
          </div>

          {/* Contact Form Placeholder */}
          <div className="glass p-10 rounded-[3rem] border border-white/5 bg-slate-900/40">
             <h3 className="text-2xl font-black text-white mb-6">اترك رسالة لفريق الدعم</h3>
             <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" placeholder="الاسم الكامل" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" />
                  <input type="email" placeholder="البريد الإلكتروني" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" />
                </div>
                <textarea rows={4} placeholder="كيف يمكننا مساعدتك؟" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all resize-none"></textarea>
                <button className="w-full h-16 bg-slate-800 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-700 transition-all">
                  <Send size={20} /> إرسال الرسالة
                </button>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-10 rounded-[3rem] border-l-8 border-l-blue-600 bg-slate-900/40 shadow-xl">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-white">
              <HelpCircle className="text-blue-500" />
              الأسئلة الشائعة
            </h3>
            <div className="space-y-5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-slate-800 pb-5 last:border-0">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-right gap-4 group"
                  >
                    <span className={`text-sm font-black transition-colors ${openFaq === idx ? 'text-blue-400' : 'text-slate-200 group-hover:text-white'}`}>
                      {faq.question}
                    </span>
                    <ChevronDown size={18} className={`text-slate-500 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-400' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <p className="mt-4 text-xs text-slate-400 leading-relaxed font-bold animate-in slide-in-from-top-2 duration-300">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 space-y-4">
             <div className="flex items-center gap-4 text-white">
                <Globe className="text-blue-500" />
                <span className="font-bold">الموقع الرسمي</span>
             </div>
             <p className="text-xs text-slate-500 font-bold leading-relaxed">تابع قنواتنا الرسمية على تليجرام وتويتر للحصول على آخر التحديثات والعروض الحصرية.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
