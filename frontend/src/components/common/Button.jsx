import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm border border-sky-700 focus:ring-sky-500',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-rose-700 focus:ring-rose-500',
    ghost: 'hover:bg-slate-100 text-slate-600 border border-transparent focus:ring-slate-300',
    outline: 'border border-sky-600 text-sky-600 hover:bg-sky-50 focus:ring-sky-500',
  };

  const sizeStyles = {
    xs: 'px-2 py-1 text-xs rounded',
    sm: 'px-2.5 py-1.5 text-xs font-medium rounded-md',
    md: 'px-4 py-2 text-sm font-medium rounded-lg',
    lg: 'px-5 py-2.5 text-base font-medium rounded-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
