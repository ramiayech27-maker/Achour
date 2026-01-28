
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon: Icon, color }) => {
  return (
    <div className="glass p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
      <div>
        <p className="text-slate-400 text-sm mb-1 font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        {subValue && <p className="text-xs text-green-400 font-bold">{subValue}</p>}
      </div>
      <div className={`p-4 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
    </div>
  );
};

export default StatCard;
