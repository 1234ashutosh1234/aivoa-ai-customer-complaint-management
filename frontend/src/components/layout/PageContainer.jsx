import React from 'react';

export default function PageContainer({ 
  title, 
  subtitle, 
  badge, 
  actions, 
  children,
  maxWidth = 'max-w-7xl'
}) {
  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className={`mx-auto ${maxWidth} px-4 sm:px-6 lg:px-8 py-8`}>
        {/* Page Header */}
        {(title || actions) && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {title}
                </h1>
                {badge && <div>{badge}</div>}
              </div>
              {subtitle && (
                <p className="mt-1 text-sm text-slate-500 font-normal">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>
        )}

        {/* Page Body */}
        {children}
      </div>
    </div>
  );
}
