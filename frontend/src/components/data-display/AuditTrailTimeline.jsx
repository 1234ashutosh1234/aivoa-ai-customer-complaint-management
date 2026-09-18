import React from 'react';
import { 
  ShieldCheck, 
  History, 
  User, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';
import Badge from '../common/Badge';

export default function AuditTrailTimeline({ auditEvents = [] }) {
  if (!auditEvents || auditEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
        <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="font-medium text-slate-700">No Audit Events Recorded</p>
        <p className="text-xs text-slate-400 mt-1">Audit log will record all lifecycle modifications compliant with 21 CFR Part 11.</p>
      </div>
    );
  }

  const getEventIcon = (eventType) => {
    switch (eventType?.toUpperCase()) {
      case 'CREATED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'AI_ASSESSMENT':
      case 'AI_TRIAGE':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'MANUAL_OVERRIDE':
      case 'STATUS_CHANGE':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'FIELD_UPDATE':
        return <History className="w-4 h-4 text-blue-600" />;
      case 'INVESTIGATION':
      case 'CAPA_ASSIGNED':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadgeVariant = (eventType) => {
    switch (eventType?.toUpperCase()) {
      case 'CREATED':
        return 'success';
      case 'AI_ASSESSMENT':
      case 'AI_TRIAGE':
        return 'primary';
      case 'MANUAL_OVERRIDE':
      case 'STATUS_CHANGE':
        return 'warning';
      case 'FIELD_UPDATE':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            21 CFR Part 11 Electronic Audit Trail
          </h3>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
          Immutable Append-Only Log ({auditEvents.length} records)
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {auditEvents.map((event, idx) => (
          <div key={event.id || idx} className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center group-hover:border-pharma-600 transition-colors shadow-xs">
              <span className="scale-75">{getEventIcon(event.event_type)}</span>
            </div>

            {/* Event content box */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(event.event_type)}>
                    {event.event_type}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-800">
                    {event.action_type || event.action || 'System Record'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Operator details */}
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">Operator:</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">
                  {event.operator_id || 'SYSTEM_DAEMON'}
                </span>
                {event.operator_role && (
                  <span className="text-slate-400">({event.operator_role})</span>
                )}
              </div>

              {/* Description / Details */}
              {event.details && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 mb-2 whitespace-pre-wrap">
                  {typeof event.details === 'object' ? JSON.stringify(event.details, null, 2) : event.details}
                </p>
              )}

              {/* Reason for change (Regulatory requirement) */}
              {event.reason_for_change && (
                <div className="text-xs text-slate-600 mb-2">
                  <span className="font-semibold text-slate-700">Reason for Change:</span>{' '}
                  <span className="italic">{event.reason_for_change}</span>
                </div>
              )}

              {/* Value changes / Diffs if available */}
              {(event.old_value !== undefined && event.new_value !== undefined && (event.old_value !== null || event.new_value !== null)) && (
                <div className="mt-2 text-xs grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="border-r border-slate-200 pr-2">
                    <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Previous Value</div>
                    <div className="font-mono text-rose-700 line-through bg-rose-50 px-1.5 py-0.5 rounded break-all">
                      {String(event.old_value || 'None')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Updated Value</div>
                    <div className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded break-all">
                      {String(event.new_value || 'None')}
                    </div>
                  </div>
                </div>
              )}

              {/* Cryptographic Hash or Sign off (Part 11 verification) */}
              {event.record_hash && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>SHA-256 Digest:</span>
                  <span className="truncate max-w-[280px]" title={event.record_hash}>
                    {event.record_hash}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
