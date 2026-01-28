
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Search, 
  Filter,
  Download,
  Calendar,
  Clock,
  ExternalLink,
  ChevronLeft,
  Wallet,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  Loader2,
  Share2
} from 'lucide-react';
import { useUser } from '../UserContext';
import { TransactionType, TransactionStatus } from '../types';

const Transactions = () => {
  const navigate = useNavigate();
  const { user, autoPilotMode } = useUser();
  const [filter, setFilter] = useState<'ALL' | TransactionType>('ALL');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredTransactions = user.transactions.filter(tx => 
    filter === 'ALL' ? true : tx.type === filter
  );

  const getTypeStyle = (type: TransactionType, status: TransactionStatus) => {
    if (status === TransactionStatus.PENDING) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    
    switch (type) {
      case TransactionType.DEPOSIT: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case TransactionType.WITHDRAWAL: return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case TransactionType.PURCHASE: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusBadge = (tx: any) => {
    if (tx.status === TransactionStatus.COMPLETED) {
      return (
        <div className="flex flex-col items-end gap-1">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <CheckCircle2 size={12} /> مكتملة بنجاح
          </span>
          {tx.type === TransactionType.WITHDRAWAL && (
            <span className="text-[9px] text-emerald-500 font-bold uppercase">Network Confirmed</span>
          )}
        </div>
      );
    }
    
    if (tx.status === TransactionStatus.PENDING) {
      const txTime = new Date(tx.date).getTime();
      const waitTime = tx.type === TransactionType.DEPOSIT ? 30 : 60;
      const elapsed = (now - txTime) / 1000;
      const remaining = Math.max(0, Math.round(waitTime - elapsed));
      
      // حساب وهمي لعدد التأكيدات
      const confs = tx.type === TransactionType.WITHDRAWAL 
        ? Math.min(3, Math.floor((elapsed / waitTime) * 3)) 
        : Math.min(1, Math.floor((elapsed / waitTime) * 1));

      return (
        <div className="flex flex-col items-end gap-1">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse shadow-lg shadow-amber-500/20">
            <Loader2 size={12} className="animate-spin" /> قيد المراجعة الآلية
          </span>
          {autoPilotMode && (
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-amber-500 font-bold">تأكيد الشبكة: {remaining}s</span>
              <span className="text-[8px] text-slate-500 font-black">Confirmations: {confs}/{tx.type === TransactionType.WITHDRAWAL ? 3 : 1}</span>
            </div>
          )}
        </div>
      );
    }

    if (tx.status === TransactionStatus.REJECTED) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-lg shadow-rose-500/20">
          <XCircle size={12} /> مرفوضة
        </span>
      );
    }
    
    return null;
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const openExplorer = (tx: any) => {
    if (tx.txHash) {
      window.open(`https://tronscan.org/#/transaction/${tx.txHash}`, '_blank');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-cairo">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">سجل المعاملات</h1>
            <p className="text-slate-400">تتبع طلبات الإيداع، السحب، وعمليات التعدين الآلية.</p>
          </div>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
          <button onClick={() => setFilter('ALL')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>الكل</button>
          <button onClick={() => setFilter(TransactionType.DEPOSIT)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filter === TransactionType.DEPOSIT ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>إيداعات</button>
          <button onClick={() => setFilter(TransactionType.WITHDRAWAL)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filter === TransactionType.WITHDRAWAL ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>سحوبات</button>
        </div>
      </header>

      {autoPilotMode && (
        <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-3">
          <Zap className="text-blue-500 animate-pulse" size={20} />
          <p className="text-xs text-blue-400 font-black">نظام المعالجة الفوري نشط: يتم تنفيذ السحوبات آلياً عبر شبكة TRC20 الافتراضية.</p>
        </div>
      )}

      <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-800/50">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="px-8 py-6 text-slate-400 font-bold text-sm">نوع العملية</th>
                <th className="px-8 py-6 text-slate-400 font-bold text-sm">التاريخ / الوقت</th>
                <th className="px-8 py-6 text-slate-400 font-bold text-sm">المبلغ</th>
                <th className="px-8 py-6 text-slate-400 font-bold text-sm">الحالة النهائية</th>
                <th className="px-8 py-6 text-slate-400 font-bold text-sm text-center">تتبع الشبكة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => {
                const { date, time } = formatDateTime(tx.date);
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${getTypeStyle(tx.type, tx.status)}`}>
                          {tx.type === TransactionType.DEPOSIT ? <ArrowDownLeft size={20} /> : 
                           tx.type === TransactionType.WITHDRAWAL ? <ArrowUpRight size={20} /> : <History size={20} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white">
                            {tx.type === TransactionType.DEPOSIT ? 'إيداع رصيد' : 
                             tx.type === TransactionType.WITHDRAWAL ? 'سحب أرباح (Auto)' : 'شراء جهاز'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {tx.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-300 flex items-center gap-1.5"><Calendar size={12}/> {date}</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1.5"><Clock size={12}/> {time}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-xl font-black tabular-nums ${tx.type === TransactionType.DEPOSIT ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === TransactionType.DEPOSIT ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(tx)}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex justify-center gap-2">
                        {tx.status === TransactionStatus.COMPLETED && tx.txHash && (
                          <button 
                            onClick={() => openExplorer(tx)}
                            className="p-2.5 text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black border border-blue-500/10"
                            title="Verify on TronScan"
                          >
                            <ExternalLink size={16} /> TronScan
                          </button>
                        )}
                        {tx.status === TransactionStatus.PENDING && (
                           <div className="p-2.5 text-slate-600 border border-dashed border-slate-800 rounded-xl text-[10px] font-bold">
                             Waiting...
                           </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <History size={64} className="mb-4 text-slate-700" />
                      <p className="text-xl font-bold">لا توجد عمليات مسجلة</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
