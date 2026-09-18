import React from 'react';
import { Sparkles } from 'lucide-react';

export const ConfidenceBadge = ({ score = 1.0, model = 'openai/gpt-oss-120b' }) => {
  const percentage = Math.round(score * 100);

  let variant = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (percentage < 60) {
    variant = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (percentage < 85) {
    variant = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${variant}`}>
      <Sparkles className="w-3.5 h-3.5 shrink-0" />
      <span>{percentage}% AI Confidence</span>
      <span className="text-[10px] text-slate-400 font-normal">({model})</span>
    </div>
  );
};

export default ConfidenceBadge;
