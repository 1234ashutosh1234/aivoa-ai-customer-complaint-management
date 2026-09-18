import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-sky-50 text-sky-700 border-sky-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-sm font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const CriticalityBadge = ({ criticality }) => {
  const norm = (criticality || '').toLowerCase();
  if (norm === 'critical') {
    return (
      <Badge variant="danger" size="sm">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
        Critical (Class I)
      </Badge>
    );
  }
  if (norm === 'major') {
    return (
      <Badge variant="warning" size="sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Major (Class II)
      </Badge>
    );
  }
  return (
    <Badge variant="success" size="sm">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Minor (Class III)
    </Badge>
  );
};

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase();
  if (norm === 'closed') {
    return <Badge variant="default">{status}</Badge>;
  }
  if (norm.includes('investigation')) {
    return <Badge variant="primary">{status}</Badge>;
  }
  if (norm.includes('capa')) {
    return <Badge variant="warning">{status}</Badge>;
  }
  if (norm.includes('reopened')) {
    return <Badge variant="danger">{status}</Badge>;
  }
  return <Badge variant="success">{status || 'Logged'}</Badge>;
};

export default Badge;
