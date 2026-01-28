
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Loader2, Sparkles, User, Minimize2, AlertCircle, ShieldAlert } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';
import { MINIMUM_WITHDRAWAL_AMOUNT, MINIMUM_DEPOSIT_AMOUNT, MINING_PACKAGES } from '../constants';

const AIChatBot = () => {
  const { user } = useUser();
  const { isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string, text: string, sender: 'user' | 'bot' }[]>([
    { 
      id: '1', 
      text: isRtl 
        ? 'أهلاً بك في MineCloud! أنا مساعدك الذكي. يمكنني مساعدتك في معرفة أرباحك، طريقة السحب، أو شرح باقات التعدين. كيف يمكنني خدمتك؟' 
        : 'Welcome to MineCloud! I am your AI assistant. I can help with earnings, withdrawals, or mining packages. How can I help?', 
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, sender: 'user' }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      
      if (!apiKey || apiKey === "undefined" || apiKey === "") {
        throw new Error("Missing Key");
      }

      const ai = new GoogleGenAI({ apiKey });
      const activeDevices = user.activePackages.map(p => `${p.name} (${p.status})`).join(', ');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        config: {
          systemInstruction: `
            أنت "MineCloud AI"، المساعد الرسمي لمنصة MineCloud.
            بيانات المستخدم:
            - الرصيد: $${user.balance.toFixed(2)}
            - الأرباح: $${user.totalEarnings.toFixed(2)}
            - الأجهزة: ${activeDevices || 'لا يوجد'}
            القواعد:
            1. الرد بالعربية بلهجة احترافية ومطمئنة.
            2. الحد الأدنى للسحب هو $${MINIMUM_WITHDRAWAL_AMOUNT}.
            3. الحد الأدنى للإيداع هو $${MINIMUM_DEPOSIT_AMOUNT}.
          `
        }
      });

      const botText = response.text || (isRtl ? 'عذراً، لم أستطع معالجة طلبك الآن.' : 'Sorry, I could not process your request.');
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botText, sender: 'bot' }]);
    } catch (error: any) {
      const errorMsg = error.message === "Missing Key" 
        ? (isRtl ? "تنبيه: لم يتم تفعيل الذكاء الاصطناعي بعد (مفتاح API مفقود في إعدادات Netlify)." : "AI Key not configured.")
        : (isRtl ? "عذراً، واجهت مشكلة في الاتصال بمحرك الذكاء الاصطناعي." : "AI error.");
      
      setMessages(prev => [...prev, { id: Date.now().toString(), text: errorMsg, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-[150] font-cairo`}>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-90 group relative"
        >
          <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-ping opacity-20"></div>
          <Bot size={30} />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-950"></div>
        </button>
      )}

      {isOpen && (
        <div className="glass w-[350px] md:w-[400px] h-[550px] rounded-[2.5rem] border border-blue-500/20 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="p-6 bg-blue-600 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Bot size={20} />
              <h3 className="font-black text-sm">MineCloud AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)}><Minimize2 size={20} /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/20 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.sender === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none border border-white/5' 
                  : 'bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-tl-none'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end p-2">
                <Loader2 className="animate-spin text-blue-500" size={20} />
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-5 bg-slate-950/50 border-t border-white/5 flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRtl ? "اسألني أي شيء..." : "Ask me anything..."}
              className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500 text-sm"
              dir={isRtl ? 'rtl' : 'ltr'}
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center">
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatBot;
