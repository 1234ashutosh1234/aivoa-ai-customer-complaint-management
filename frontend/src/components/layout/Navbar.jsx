import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Activity, 
  UserCheck, 
  PlusCircle, 
  Cpu, 
  Bell, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import apiService from '../../services/api';

export default function Navbar() {
  const location = useLocation();
  const [healthStatus, setHealthStatus] = useState({ backend: 'checking', groq: 'checking' });

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const res = await apiService.getHealth();
        setHealthStatus({
          backend: res.status === 'HEALTHY' || res.status === 'OK' ? 'healthy' : 'warning',
          groq: res.groq_configured ? 'healthy' : 'mock'
        });
      } catch (err) {
        setHealthStatus({ backend: 'offline', groq: 'offline' });
      }
    };
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
      {/* Brand & Context */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-pharma-600 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base tracking-tight">PharmaGuard</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-pharma-50 text-pharma-700 border border-pharma-200">
                QMS v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              ICH Q10 & 21 CFR Part 211 Compliant
            </p>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            GMP/QMS Workflow Prototype
          </span>
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-3">
        {/* System Health Status Pills */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-medium">FastAPI:</span>
            <span className={`w-2 h-2 rounded-full ${healthStatus.backend === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-medium">Groq AI:</span>
            <span className={`text-[10px] font-mono px-1 rounded ${healthStatus.groq === 'healthy' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-slate-200 text-slate-600'}`}>
              {healthStatus.groq === 'healthy' ? 'openai/gpt-oss-120b' : 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Quick New Intake CTA */}
        {location.pathname !== '/intake' && (
          <Link
            to="/intake"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-pharma-600 text-white hover:bg-pharma-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Complaint</span>
          </Link>
        )}

        {/* Operator Badge (21 CFR Part 11 Attribution) */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
            MV
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">M. Vance</div>
            <div className="text-[10px] text-slate-500 font-mono">QA Mgr #QA-042</div>
          </div>
        </div>
      </div>
    </header>
  );
}
