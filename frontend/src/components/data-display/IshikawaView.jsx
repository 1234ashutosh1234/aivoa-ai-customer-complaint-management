import React from 'react';
import { User, Cpu, FileText, Box, Gauge, Wind, CheckCircle } from 'lucide-react';

export const IshikawaView = ({ rootCauseData, factors }) => {
  const categories = [
    { key: 'Machine', label: 'Machine (Equipment)', icon: Cpu, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { key: 'Material', label: 'Material (Raw/Pack)', icon: Box, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { key: 'Method', label: 'Method (SOP/Process)', icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { key: 'Manpower', label: 'Manpower (Personnel)', icon: User, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { key: 'Measurement', label: 'Measurement (QC/Analytical)', icon: Gauge, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { key: 'Milieu', label: 'Milieu (Cleanroom/Environment)', icon: Wind, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  ];

  const primaryCategory = rootCauseData?.primary_category || '';
  const probableCauses = rootCauseData?.probable_root_causes || [];
  const fiveWhys = rootCauseData?.five_whys_framework || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            6M Ishikawa (Fishbone) Diagram Framework
          </h4>
          <p className="text-xs text-slate-500">
            ICH Q9 Quality Risk Management structured root cause investigation
          </p>
        </div>
        <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded border border-indigo-200">
          Root Cause Analysis Active
        </span>
      </div>

      {/* 6M Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(({ key, label, icon: Icon, color }) => {
          const categoryFactors = factors?.[key] || 
                                  factors?.[key.replace('power', '')] || 
                                  factors?.[key === 'Milieu' ? 'Environment' : ''] || [];
          
          const isPrimary = primaryCategory.toLowerCase().includes(key.toLowerCase()) || 
                            categoryFactors.length > 0;

          return (
            <div
              key={key}
              className={`p-4 rounded-xl border transition-all ${
                isPrimary
                  ? 'bg-white border-pharma-300 ring-1 ring-pharma-500/20 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`p-1.5 rounded-lg border ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-800">{label}</h5>
              </div>

              {categoryFactors.length > 0 ? (
                <ul className="text-xs text-slate-600 space-y-1.5 mt-2 list-disc list-inside">
                  {categoryFactors.map((cause, idx) => (
                    <li key={idx} className="leading-relaxed text-[11px] text-slate-700 font-medium">
                      {cause}
                    </li>
                  ))}
                </ul>
              ) : isPrimary && probableCauses.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-100 text-sky-800">
                    Primary Branch
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1 mt-1.5 list-disc list-inside">
                    {probableCauses.map((cause, idx) => (
                      <li key={idx} className="leading-relaxed text-[11px]">{cause}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic mt-2">
                  No abnormal deviations flagged in this manufacturing domain.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 5-Whys Causal Tree */}
      {fiveWhys && fiveWhys.length > 0 && (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
            <span>5-Whys Root Cause Chain</span>
            <span className="text-[10px] font-normal text-slate-400">(Automated Investigation Guidance)</span>
          </h4>
          <div className="space-y-3">
            {fiveWhys.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  W{item.step || idx + 1}
                </div>
                <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="font-semibold text-slate-800">{item.question}</span>
                  <p className="text-slate-600 mt-1 pl-2 border-l-2 border-sky-400">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IshikawaView;
