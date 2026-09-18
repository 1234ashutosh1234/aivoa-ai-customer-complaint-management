import React from 'react';

export const CompletenessGauge = ({ score = 0, size = 'md', label = 'Regulatory Completeness' }) => {
  const normalizedScore = score > 1 ? score : score * 100;
  const rounded = Math.min(100, Math.max(0, Math.round(normalizedScore)));

  // Color selection based on QMS threshold
  let strokeColor = '#10b981'; // emerald-500
  let textColor = 'text-emerald-700';
  let bgColor = 'bg-emerald-50';

  if (rounded < 50) {
    strokeColor = '#e11d48'; // rose-600
    textColor = 'text-rose-700';
    bgColor = 'bg-rose-50';
  } else if (rounded < 80) {
    strokeColor = '#d97706'; // amber-600
    textColor = 'text-amber-700';
    bgColor = 'bg-amber-50';
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-100"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            strokeDasharray={`${rounded}, 100`}
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke={strokeColor}
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className={`absolute text-xs font-bold ${textColor}`}>{rounded}%</span>
      </div>
      <div>
        <div className="text-xs font-semibold text-slate-800">{label}</div>
        <div className="text-[11px] text-slate-500">
          {rounded >= 80 ? 'Ready for regulatory filing' : 'Follow-up questions recommended'}
        </div>
      </div>
    </div>
  );
};

export default CompletenessGauge;
