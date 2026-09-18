import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus2, 
  FileText, 
  ListFilter, 
  ShieldAlert, 
  Settings, 
  HelpCircle, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Sidebar() {
  const { metrics } = useSelector((state) => state.complaints);

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/intake',
      label: 'Intake & Triage',
      icon: FilePlus2,
      badge: 'AI Copilot'
    },
    {
      to: '/complaints',
      label: 'Complaint Register',
      icon: ListFilter,
      badge: metrics?.total_complaints || null
    },
    {
      to: '/form',
      label: 'Structured Form',
      icon: FileText,
      badge: null
    },
    {
      to: '/settings',
      label: 'System & Validation',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      {/* Primary Navigation */}
      <div className="p-4 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-3">
          Quality Management
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-pharma-700 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      item.badge === 'AI Copilot'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Regulatory Framework Highlights */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-3 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Compliance Scope</span>
          </div>
          <div className="space-y-2 px-3 text-xs text-slate-400">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span>FDA 21 CFR 211.198</span>
              <span className="text-emerald-400 font-mono text-[10px]">VERIFIED</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span>ICH Q10 QMS Guideline</span>
              <span className="text-emerald-400 font-mono text-[10px]">ALIGNED</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span>EU GMP Chapter 8</span>
              <span className="text-emerald-400 font-mono text-[10px]">ENFORCED</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>21 CFR Part 11 Audit</span>
              <span className="text-indigo-400 font-mono text-[10px]">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-slate-300">LangGraph Pipeline</span>
          <span className="text-emerald-400">Ready</span>
        </div>
        <div className="text-[10px] text-indigo-300 font-mono">
          Model: Groq / openai/gpt-oss-120b
        </div>
        <div className="text-[9px] text-slate-500 mt-1.5 leading-tight">
          Assignment requested model: gemma2-9b-it (decommissioned by Groq). Runtime model: openai/gpt-oss-120b.
        </div>
      </div>
    </aside>
  );
}
