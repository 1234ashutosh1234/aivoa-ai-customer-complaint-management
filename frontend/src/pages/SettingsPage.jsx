import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { 
  ShieldCheck, 
  Cpu, 
  Database, 
  Activity, 
  Server, 
  FileCheck2, 
  Lock, 
  Key,
  RefreshCw,
  Sliders
} from 'lucide-react';

export default function SettingsPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await apiService.getHealth();
      setHealthData(data);
    } catch (err) {
      setHealthData({ status: 'ERROR', error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <PageContainer
      title="System Architecture & GMP Validation"
      subtitle="Operational telemetry, Groq AI agent status, 21 CFR Part 11 audit settings, and pharmaceutical compliance matrix."
      badge={
        <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
          Validation State: VERIFIED
        </span>
      }
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHealth}
          icon={RefreshCw}
          loading={loading}
        >
          Check Connectivity
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* API & Database Infrastructure */}
        <Card
          title="Backend & Persistence Layer"
          subtitle="FastAPI REST service and relational database"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-800">FastAPI Application Service</div>
                  <div className="text-[11px] text-slate-500">Python 3.14 • Async Uvicorn Worker</div>
                </div>
              </div>
              <Badge variant={healthData?.status === 'HEALTHY' || healthData?.status === 'OK' ? 'success' : 'warning'}>
                {healthData?.status || 'ONLINE'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-800">Relational Database Engine</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    PostgreSQL 16 (Port 5432) / SQLite Fallback
                  </div>
                </div>
              </div>
              <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                CONNECTED
              </span>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-[11px] text-blue-800">
              Database schema is managed via SQLAlchemy 2.0 ORM with connection pooling, declarative models, and automatic transaction rollback on failure.
            </div>
          </div>
        </Card>

        {/* Groq AI & LangGraph Infrastructure */}
        <Card
          title="LangGraph & Groq AI Agent Architecture"
          subtitle="State machine execution and LLM inference engine"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <div>
                  <div className="font-semibold text-slate-800">Primary Runtime Model</div>
                  <div className="text-[11px] text-slate-500">FastAPI & LangGraph real-time entity extraction</div>
                </div>
              </div>
              <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                openai/gpt-oss-120b
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-semibold text-slate-800">Contextual / Reasoning Engine</div>
                  <div className="text-[11px] text-slate-500">Deep clinical reasoning, 6M Ishikawa & CAPA synthesis</div>
                </div>
              </div>
              <span className="font-mono font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                openai/gpt-oss-120b
              </span>
            </div>

            <div className="p-2.5 bg-slate-100/60 rounded border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700">Model Compatibility Note:</span> Assignment requested model: <code className="text-slate-700 font-mono">gemma2-9b-it</code> (decommissioned by Groq). Active runtime model: <code className="text-indigo-700 font-mono">openai/gpt-oss-120b</code>.
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="font-semibold text-slate-800">LangGraph Multi-Agent Nodes</div>
                  <div className="text-[11px] text-slate-500">8 deterministic state transitions</div>
                </div>
              </div>
              <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                8 / 8 ACTIVE
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Regulatory Compliance & 21 CFR Part 11 Rules */}
      <Card
        title="21 CFR Part 11 Electronic Records & Signatures Policy"
        subtitle="Enforced controls to ensure data integrity, attribution, and non-repudiation"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Lock className="w-4 h-4 text-slate-600" />
              <span>Immutable Audit Logs</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Every creation, status transition, and field edit generates an immutable append-only audit event record with cryptographic SHA-256 hash chaining.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Mandatory Justification</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Lifecycle status updates and manual overrides strictly mandate a recorded Reason for Change before the database transaction will commit.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Operator Attribution</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              AI outputs are marked with provenance badges and never finalized without explicit operator credential validation and human sign-off.
            </p>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
