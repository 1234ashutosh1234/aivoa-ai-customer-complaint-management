import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const AlertBanner = ({ type, variant = 'warning', title, message, action, className = '' }) => {
  const actualType = type || variant;
  const isCritical = actualType === 'critical' || actualType === 'danger' || actualType === 'error';
  const isWarning = actualType === 'warning';
  const isSuccess = actualType === 'success';

  const styles = {
    critical: 'bg-rose-50 border-rose-200 text-rose-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    info: 'bg-sky-50 border-sky-200 text-sky-900',
  };

  const currentStyle = isCritical
    ? styles.critical
    : isWarning
    ? styles.warning
    : isSuccess
    ? styles.success
    : styles.info;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${currentStyle} ${className}`}>
      {isCritical && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
      {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
      {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
      {!isCritical && !isWarning && !isSuccess && <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />}

      <div className="flex-1">
        {title && <h4 className="text-xs font-bold uppercase tracking-wider mb-1">{title}</h4>}
        <div className="text-xs leading-relaxed opacity-90">{message}</div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default AlertBanner;
