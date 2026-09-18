import React from 'react';
import { Sparkles, FileText, Edit3, UserCheck } from 'lucide-react';

export const OriginBadge = ({ origin }) => {
  if (!origin) return null;
  const o = String(origin).toUpperCase();

  if (o === 'EXTRACTED') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 font-mono">
        <FileText className="w-2.5 h-2.5 text-sky-600" />
        EXTRACTED
      </span>
    );
  }

  if (o === 'AI' || o === 'AI_GENERATED' || o === 'AI_COPILOT') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 font-mono">
        <Sparkles className="w-2.5 h-2.5 text-purple-600" />
        AI COPILOT
      </span>
    );
  }

  if (o === 'EDITED' || o === 'MANUALLY_EDITED') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
        <Edit3 className="w-2.5 h-2.5 text-amber-600" />
        EDITED
      </span>
    );
  }

  if (o === 'MANUAL') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300 font-mono">
        <UserCheck className="w-2.5 h-2.5 text-slate-500" />
        MANUAL
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
      {origin}
    </span>
  );
};

export default OriginBadge;
