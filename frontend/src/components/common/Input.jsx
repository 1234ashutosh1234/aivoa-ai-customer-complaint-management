import React from 'react';
import { OriginBadge } from '../feedback/OriginBadge';

export const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  helperText,
  required = false,
  disabled = false,
  origin, // 'EXTRACTED' | 'AI_GENERATED' | 'MANUAL'
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={name} className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {origin && <OriginBadge origin={origin} />}
        </div>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed ${
          error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
};

export default Input;
