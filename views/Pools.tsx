import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_POOLS } from '../constants';
import { UsersRound, Zap, TrendingUp, ShieldCheck, Plus, Search, X, Tag, FileText, Activity, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { MiningPool } from '../types';

const Pools = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [pools, setPools] = useState<MiningPool[]>(MOCK_POOLS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinedPool, setJoinedPool] = useState<string | null>(null);
  
  // New Pool Form State
  const [newPool, setNewPool] = useState({
    name: '',
    description: '',
    minEntryHashrate: '',
    tags: ''
  });

  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pool: MiningPool = {
      id: `pool-${Date.now()}`,
      name: newPool.name,
      description: newPool.description,
      totalHashrate: '0 TH/s',
      membersCount: 1,
      minEntryHashrate: Number(newPool.minEntryHashrate) || 0,
      dailyPoolProfit: 0,
      tags: newPool.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    setPools([pool, ...pools]);
    setIsModalOpen(false);
    setNewPool({ name: '', description: '', minEntryHashrate: '', tags: '' });
  };

  const handleJoinPool = async (poolName: string) => {
    setIsJoining(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsJoining(false);
    setJoinedPool(poolName);
    setTimeout(() => setJoinedPool(null), 3000);
  };

  const filteredPools = pools.filter(pool => 
    pool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative text-right" dir="rtl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 glass hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90"
            title="رجوع"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">أحواض التعدين</h1>
            <p className="text-slate-400">شارك قوتك التعدينية مع الآخرين لزيادة فرص الربح المستقر.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18} />
          إنشاء حوض جديد
        </button>
      </header>

      {/* Pools Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard 
          label="إجمالي أحواض النشطة" 
          value={pools.length} 
          icon={UsersRound} 
          color="bg-blue-500"
        />
        <StatCard 
          label="قوة الشبكة الإجمالية" 
          value="45.2 PH/s" 
          icon={Zap} 
          color="bg-amber-500"
        />
        <StatCard 
          label="المشتركين النشطين" 
          value="+5,400" 
          icon={TrendingUp} 
          color="bg-emerald-500"
        />
      </div>

      {/* Search & Filter */}
      <div className="relative group max-w-md">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="ابحث عن حوض تعدين..." 
          className="w-full bg-slate-900/50 border border-slate-800 p-4 pr-12 rounded-2xl text-slate-200 focus:outline-none focus:border-blue-500 transition-all text-right"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Success Notification */}
      {joinedPool && (
        <div className="fixed top-24 right-8 z-[120] animate-in slide-in-from-right duration-500">
          <div className="glass bg-emerald-500/20 border-emerald-500/50 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 shadow-2xl">
            <CheckCircle2 size={24} />
            <span className="font-bold">لقد تم انضمامك بنجاح إلى حوض: {joinedPool}</span>
          </div>
        </div>
      )}

      {/* Pools Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {filteredPools.map((pool) => (
          <div key={pool.id} className="glass rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="text-right">
                <h3 className="text-2xl font-bold text-white mb-2">{pool.name}</h3>
                <div className="flex gap-2 flex-wrap justify-end">
                  {pool.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-slate-800 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                <UsersRound size={28} />
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-8 leading-relaxed text-right">
              {pool.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-right">
                <p className="text-xs text-slate-500 mb-1">إجمالي الهاش</p>
                <p className="font-bold text-white">{pool.totalHashrate}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-right">
                <p className="text-xs text-slate-500 mb-1">المشتركين</p>
                <p className="font-bold text-white">{pool.membersCount}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-right">
                <p className="text-xs text-slate-500 mb-1">الربح اليومي للحوض</p>
                <p className="font-bold text-emerald-400">${pool.dailyPoolProfit}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-right">
                <p className="text-xs text-slate-500 mb-1">الحد الأدنى للدخول</p>
                <p className="font-bold text-blue-400">{pool.minEntryHashrate} TH/s</p>
              </div>
            </div>

            <button 
              disabled={isJoining}
              onClick={() => handleJoinPool(pool.name)}
              className="w-full py-4 bg-slate-800 rounded-2xl font-bold text-slate-300 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50"
            >
              {isJoining ? <Loader2 className="animate-spin" /> : <>انضمام للحوض <ShieldCheck size={18} className="group-hover/btn:scale-110 transition-transform" /></>}
            </button>
          </div>
        ))}

        {filteredPools.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-3xl">
            <Search className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-400">لم يتم العثور على أحواض تطابق بحثك</h3>
          </div>
        )}
      </div>

      {/* Create Pool Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="text-blue-500" size={24} />
                إنشاء حوض تعدين جديد
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePool} className="p-8 space-y-5 text-right">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 flex items-center gap-2 mr-1">
                  <Activity size={16} className="text-blue-400" />
                  اسم الحوض
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="مثال: حوض الشرق الأوسط التخصصي"
                  className="w-full bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 text-right"
                  value={newPool.name}
                  onChange={(e) => setNewPool({...newPool, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 flex items-center gap-2 mr-1">
                  <FileText size={16} className="text-blue-400" />
                  وصف الحوض
                </label>
                <textarea 
                  required
                  rows={3}
                  placeholder="اشرح أهداف الحوض وكيفية توزيع الأرباح..."
                  className="w-full bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 resize-none text-right"
                  value={newPool.description}
                  onChange={(e) => setNewPool({...newPool, description: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 flex items-center gap-2 mr-1">
                    <Zap size={16} className="text-blue-400" />
                    الحد الأدنى لقوة الهاش (TH/s)
                  </label>
                  <input 
                    required
                    type="number" 
                    placeholder="مثال: 50"
                    className="w-full bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 text-right"
                    value={newPool.minEntryHashrate}
                    onChange={(e) => setNewPool({...newPool, minEntryHashrate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 flex items-center gap-2 mr-1">
                    <Tag size={16} className="text-blue-400" />
                    الوسوم (مفصولة بفواصل)
                  </label>
                  <input 
                    type="text" 
                    placeholder="نخبة، عالي الربح، مستقر"
                    className="w-full bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 text-right"
                    value={newPool.tags}
                    onChange={(e) => setNewPool({...newPool, tags: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-all"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  إنشاء الحوض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pools;