
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Send, MessageSquare, ArrowRight, Clock, CheckCheck, Loader2, AlertCircle } from 'lucide-react';
import { useUser } from '../UserContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabaseConfig';

const supabase = (SUPABASE_URL.startsWith('http') && !SUPABASE_URL.includes("your-project-id")) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

interface ChatMessage {
  id: string;
  sender_email: string;
  sender_role: string;
  message_text: string;
  created_at: string;
}

const ChatRoom = () => {
  const navigate = useNavigate();
  const { user, markChatAsRead, isCloudConnected } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!supabase) return;
    try {
      const { data, error: fetchErr } = await supabase
        .from('global_chat')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (fetchErr) throw fetchErr;
      if (data) setMessages(data);
    } catch (e: any) {
      console.error("Chat load error:", e.message);
    }
  };

  useEffect(() => {
    fetchMessages();
    markChatAsRead();

    if (!supabase) return;

    // الاشتراك في التحديثات اللحظية
    const channel = supabase.channel('global_chat_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_chat' }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => {
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending || !supabase) return;

    if (user.email === 'user@example.com' || !user.id) {
      setError("يرجى تسجيل الدخول بحساب حقيقي لإرسال الرسائل.");
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      const { error: sendErr } = await supabase.from('global_chat').insert({
        sender_email: user.email,
        sender_role: user.role,
        message_text: text
      });

      if (sendErr) throw sendErr;
      setInputText('');
    } catch (e: any) {
      console.error("Send failed:", e);
      setError("فشل الإرسال: تأكد من تفعيل صلاحيات SQL في Supabase (RLS Disabled).");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 font-cairo text-right" dir="rtl">
      <header className="glass p-6 rounded-[2rem] flex items-center justify-between border border-white/5 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all">
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">مركز الدعم المباشر</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
              {isCloudConnected ? 'متصل بالسحابة' : 'بانتظار الربط...'}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 glass rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col bg-slate-900/20 relative shadow-2xl">
        {error && (
          <div className="absolute top-4 inset-x-4 z-20 animate-in fade-in">
             <div className="bg-rose-600/90 backdrop-blur-md p-3 rounded-2xl flex items-center gap-2 text-white text-[11px] font-black shadow-xl border border-rose-500/30">
                <AlertCircle size={16} /> {error}
             </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center opacity-30">
                <MessageSquare size={48} className="mb-4" />
                <p className="font-black text-sm text-slate-400">لا توجد رسائل سابقة</p>
             </div>
          )}
          
          {messages.map((m) => {
            const isMe = m.sender_email.toLowerCase() === user.email.toLowerCase();
            const isAdmin = m.sender_role === 'ADMIN';
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[9px] text-slate-500 font-black">{m.sender_email.split('@')[0]}</span>
                  {isAdmin && <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1 py-0.5 rounded-md">ADMIN</span>}
                </div>
                <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-bold shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                  {m.message_text}
                  <div className={`flex items-center gap-1 mt-1 opacity-40 text-[9px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <Clock size={10} />
                    {new Date(m.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} className="p-5 bg-slate-950/50 border-t border-white/5 flex gap-2">
           <textarea 
             rows={1}
             value={inputText} 
             onChange={e => setInputText(e.target.value)} 
             onKeyDown={(e) => {
               if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any); }
             }}
             placeholder="اكتب رسالتك هنا..." 
             className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all text-sm resize-none" 
           />
           <button 
             type="submit"
             disabled={!inputText.trim() || isSending} 
             className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all ${inputText.trim() && !isSending ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-600'}`}
           >
             {isSending ? <Loader2 className="animate-spin" /> : <Send size={24} />}
           </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
