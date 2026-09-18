import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchMetrics, 
  fetchComplaints 
} from '../store/slices/complaintsSlice';
import PageContainer from '../components/layout/PageContainer';
import MetricCard from '../components/data-display/MetricCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  RefreshCw, 
  ArrowUpRight, 
  ShieldAlert, 
  Activity,
  Zap,
  TrendingUp,
  Building
} from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { metrics, complaints, loading } = useSelector((state) => state.complaints);

  useEffect(() => {
    dispatch(fetchMetrics());
    dispatch(fetchComplaints({ page: 1, limit: 5 }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchMetrics());
    dispatch(fetchComplaints({ page: 1, limit: 5 }));
  };

  const criticalCount = metrics?.by_criticality?.CRITICAL || 0;
  const majorCount = metrics?.by_criticality?.MAJOR || 0;
  const minorCount = metrics?.by_criticality?.MINOR || 0;
  const totalCount = metrics?.total_complaints || 0;

  return (
    <PageContainer
      title="QMS Complaint Quality Dashboard"
      subtitle="Executive oversight of pharmaceutical product quality complaints, risk distribution, and CAPA lifecycle."
      badge={
        <span className="text-xs font-mono bg-pharma-50 text-pharma-700 px-2 py-0.5 rounded border border-pharma-200">
          ICH Q9 / Q10 Metrics
        </span>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            icon={RefreshCw}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => navigate('/intake')}
            icon={PlusCircle}
          >
            New Complaint Intake
          </Button>
        </div>
      }
    >
      {/* Top Level Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard
          title="Total Registered Complaints"
          value={metrics?.total_complaints || 0}
          icon={FileText}
          variant="primary"
          subtitle="All active and historical records"
        />
        <MetricCard
          title="Critical / High Risk"
          value={criticalCount}
          icon={AlertTriangle}
          variant="danger"
          subtitle="Immediate QA & Health Authority escalation"
        />
        <MetricCard
          title="Active Investigations"
          value={metrics?.by_status?.UNDER_INVESTIGATION || 0}
          icon={Clock}
          variant="warning"
          subtitle="6M Root Cause & Lab assays underway"
        />
        <MetricCard
          title="CAPA Execution Rate"
          value={`${metrics?.closed_complaints ? Math.round((metrics.closed_complaints / (metrics.total_complaints || 1)) * 100) : 0}%`}
          icon={CheckCircle2}
          variant="success"
          subtitle={`${metrics?.closed_complaints || 0} resolved / closed records`}
        />
      </div>

      {/* Grid: Risk & Categorical Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Risk Breakdown Card */}
        <Card
          title="Criticality Distribution (ICH Q9)"
          subtitle="Proportionate patient risk classification"
          headerAction={
            <span className="text-xs text-slate-400 font-mono">
              Total: {totalCount}
            </span>
          }
        >
          <div className="space-y-4">
            {/* Critical */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Critical (Class I / Life Threatening)
                </span>
                <span className="font-mono text-slate-700 font-bold">
                  {criticalCount} ({totalCount ? Math.round((criticalCount / totalCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCount ? (criticalCount / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Major */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-amber-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Major (Quality / Efficacy Defect)
                </span>
                <span className="font-mono text-slate-700 font-bold">
                  {majorCount} ({totalCount ? Math.round((majorCount / totalCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCount ? (majorCount / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Minor */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Minor (Cosmetic / Packaging)
                </span>
                <span className="font-mono text-slate-700 font-bold">
                  {minorCount} ({totalCount ? Math.round((minorCount / totalCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-slate-400 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCount ? (minorCount / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
              * Critical incidents mandate FDA 21 CFR 211.198 notification within 24-72 hours.
            </div>
          </div>
        </Card>

        {/* Lifecycle Status Distribution */}
        <Card
          title="Investigation Lifecycle"
          subtitle="Current status across the complaint workflow"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <div className="text-[11px] font-medium text-blue-700 uppercase">Received / Open</div>
              <div className="text-xl font-bold text-blue-900 mt-0.5">
                {(metrics?.by_status?.RECEIVED || 0) + (metrics?.by_status?.OPEN || 0)}
              </div>
              <div className="text-[10px] text-blue-600 mt-1">Pending QA triage</div>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
              <div className="text-[11px] font-medium text-amber-700 uppercase">Investigating</div>
              <div className="text-xl font-bold text-amber-900 mt-0.5">
                {metrics?.by_status?.UNDER_INVESTIGATION || 0}
              </div>
              <div className="text-[10px] text-amber-600 mt-1">Lab / Ishikawa analysis</div>
            </div>
            <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100">
              <div className="text-[11px] font-medium text-purple-700 uppercase">CAPA Assigned</div>
              <div className="text-xl font-bold text-purple-900 mt-0.5">
                {metrics?.by_status?.CAPA_PENDING || 0}
              </div>
              <div className="text-[10px] text-purple-600 mt-1">Corrective action active</div>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
              <div className="text-[11px] font-medium text-emerald-700 uppercase">Closed & Verified</div>
              <div className="text-xl font-bold text-emerald-900 mt-0.5">
                {metrics?.by_status?.CLOSED || 0}
              </div>
              <div className="text-[10px] text-emerald-600 mt-1">QA sign-off completed</div>
            </div>
          </div>
        </Card>

        {/* AI Copilot & Automation Telemetry */}
        <Card
          title="AI Copilot Performance"
          subtitle="LangGraph multi-agent triage efficacy"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>Runtime Groq Model</span>
              </div>
              <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                openai/gpt-oss-120b
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Assignment Spec</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                gemma2-9b-it (decommissioned)
              </span>
            </div>

            <div className="text-[10px] text-slate-400 leading-snug px-1">
              Assignment requested model: gemma2-9b-it (decommissioned by Groq). Runtime model: openai/gpt-oss-120b.
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Average Triage Time</span>
              </div>
              <span className="font-semibold text-xs text-slate-800">
                ~1.8 seconds
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-800">
              Human-in-the-loop: All AI extractions require QA operator confirmation before permanent database commit.
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Complaints Section */}
      <Card
        title="Recent Customer Complaints"
        subtitle="Latest pharma product quality issues registered in the QMS"
        headerAction={
          <Link
            to="/complaints"
            className="text-xs font-semibold text-pharma-600 hover:text-pharma-700 flex items-center gap-1"
          >
            <span>View All Complaints</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        <div className="overflow-x-auto -mx-6 -my-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Product / Dosage</th>
                <th className="py-3 px-4">Batch #</th>
                <th className="py-3 px-4">Severity / Criticality</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.slice(0, 5).map((cmp) => (
                <tr key={cmp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-pharma-700">
                    <Link to={`/complaints/${cmp.id}`} className="hover:underline">
                      {cmp.complaint_id}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{cmp.product_name}</div>
                    <div className="text-[11px] text-slate-500">{cmp.manufacturing_type || 'General Formulation'}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {cmp.batch_number || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={
                        cmp.criticality === 'CRITICAL' ? 'danger' :
                        cmp.criticality === 'MAJOR' ? 'warning' : 'default'
                      }>
                        {cmp.criticality || 'PENDING'}
                      </Badge>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {cmp.severity}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      cmp.status === 'CLOSED' ? 'success' :
                      cmp.status === 'UNDER_INVESTIGATION' ? 'warning' :
                      cmp.status === 'CAPA_PENDING' ? 'primary' : 'info'
                    }>
                      {cmp.status?.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {cmp.created_at ? new Date(cmp.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/complaints/${cmp.id}`}
                      className="inline-flex items-center justify-center text-xs font-semibold text-pharma-600 hover:text-pharma-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No complaints registered. Click "New Complaint Intake" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
