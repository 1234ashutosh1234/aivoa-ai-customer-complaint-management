import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, color, variant = 'primary', delta }) => {
  const chosen = color || variant || 'primary';
  const colorMap = {
    primary: 'bg-sky-50 text-sky-600 border-sky-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    danger: 'bg-rose-50 text-rose-600 border-rose-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-start justify-between">
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="text-2xl font-bold text-slate-900 mt-1.5">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {delta && <div className="text-[11px] font-medium text-slate-500 mt-1">{delta}</div>}
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl border ${colorMap[chosen] || colorMap.primary}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default MetricCard;
