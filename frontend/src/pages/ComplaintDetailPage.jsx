import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchComplaintById, 
  updateComplaintStatus, 
  addInvestigation, 
  addCapa 
} from '../store/slices/complaintsSlice';
import { addToast } from '../store/slices/uiSlice';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import ConfirmModal from '../components/common/ConfirmModal';
import IshikawaView from '../components/data-display/IshikawaView';
import AuditTrailTimeline from '../components/data-display/AuditTrailTimeline';
import AlertBanner from '../components/feedback/AlertBanner';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  FlaskConical, 
  CheckSquare, 
  History, 
  Plus, 
  User, 
  Calendar, 
  Cpu, 
  Building,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedComplaint: complaint, loading, error } = useSelector(
    (state) => state.complaints
  );

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ishikawa' | 'capa' | 'audit'

  // Status Change Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [operatorId, setOperatorId] = useState('QA-OPERATOR-042');
  const [statusReason, setStatusReason] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // New CAPA Modal State
  const [showCapaModal, setShowCapaModal] = useState(false);
  const [capaAction, setCapaAction] = useState('');
  const [capaType, setCapaType] = useState('CORRECTIVE');
  const [capaOwner, setCapaOwner] = useState('QA-OPERATOR-042');
  const [capaDueDate, setCapaDueDate] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchComplaintById(id));
    }
  }, [id, dispatch]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusReason.trim()) {
      dispatch(addToast({
        type: 'danger',
        message: 'Reason for change is mandatory per 21 CFR Part 11.'
      }));
      return;
    }

    setSubmittingStatus(true);
    try {
      await dispatch(updateComplaintStatus({
        id,
        status: newStatus,
        operator_id: operatorId,
        reason: statusReason
      })).unwrap();

      dispatch(addToast({
        type: 'success',
        message: `Status updated to ${newStatus} with electronic audit signature.`
      }));
      setShowStatusModal(false);
      setStatusReason('');
      dispatch(fetchComplaintById(id));
    } catch (err) {
      dispatch(addToast({
        type: 'danger',
        message: `Failed to update status: ${err.message || 'Validation error'}`
      }));
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleAddCapaSubmit = async (e) => {
    e.preventDefault();
    if (!capaAction.trim()) return;

    try {
      await dispatch(addCapa({
        complaint_id: id,
        capa_type: capaType,
        description: capaAction,
        owner: capaOwner,
        target_completion_date: capaDueDate || null
      })).unwrap();

      dispatch(addToast({
        type: 'success',
        message: 'CAPA action added and recorded in audit log.'
      }));
      setShowCapaModal(false);
      setCapaAction('');
      dispatch(fetchComplaintById(id));
    } catch (err) {
      dispatch(addToast({
        type: 'danger',
        message: `Failed to add CAPA: ${err.message}`
      }));
    }
  };

  if (loading && !complaint) {
    return (
      <PageContainer title="Loading Complaint Record...">
        <div className="py-20 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-pharma-200 border-t-pharma-600 animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Retrieving QMS and Audit Trail records...</p>
        </div>
      </PageContainer>
    );
  }

  if (!complaint && !loading) {
    return (
      <PageContainer title="Complaint Not Found">
        <div className="py-16 text-center text-slate-500">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Record Not Found</h2>
          <p className="text-xs text-slate-400 mt-1 mb-4">The requested complaint ID does not exist or has been archived.</p>
          <Button variant="primary" size="sm" onClick={() => navigate('/complaints')}>
            Return to Register
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={complaint.title || `Complaint ${complaint.complaint_id}`}
      subtitle={`QMS Record ID: ${complaint.complaint_id} • Registered ${new Date(complaint.created_at).toLocaleString()}`}
      badge={
        <div className="flex items-center gap-2">
          <Badge variant={
            complaint.status === 'CLOSED' ? 'success' :
            complaint.status === 'UNDER_INVESTIGATION' ? 'warning' :
            complaint.status === 'CAPA_PENDING' ? 'primary' : 'info'
          }>
            {complaint.status?.replace('_', ' ')}
          </Badge>
          <Badge variant={
            complaint.criticality === 'CRITICAL' ? 'danger' :
            complaint.criticality === 'MAJOR' ? 'warning' : 'default'
          }>
            {complaint.criticality}
          </Badge>
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/complaints')}
            icon={ArrowLeft}
          >
            Back to Register
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setNewStatus(complaint.status === 'RECEIVED' ? 'UNDER_INVESTIGATION' :
                           complaint.status === 'UNDER_INVESTIGATION' ? 'CAPA_PENDING' :
                           complaint.status === 'CAPA_PENDING' ? 'CLOSED' : 'UNDER_INVESTIGATION');
              setShowStatusModal(true);
            }}
            icon={ShieldCheck}
          >
            Advance Lifecycle Status
          </Button>
        </div>
      }
    >
      {/* Regulatory Health Authority Alert if Critical */}
      {complaint.criticality === 'CRITICAL' && (
        <div className="mb-6">
          <AlertBanner
            variant="danger"
            title="CRITICAL QUALITY DEFECT — 21 CFR 211.198 MANDATORY OVERSIGHT"
            message="This incident involves high patient safety risk or sterile integrity loss. Formal Health Authority notification (FDA Form 3331a / FAR) and Quality Assurance executive notification are mandated."
          />
        </div>
      )}

      {/* Detail Tabs */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-lg p-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'overview'
              ? 'bg-pharma-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Record Overview</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ishikawa')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'ishikawa'
              ? 'bg-pharma-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>6M Ishikawa & Root Cause</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('capa')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'capa'
              ? 'bg-pharma-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>CAPA Tracking ({complaint.capas?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'audit'
              ? 'bg-pharma-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>21 CFR Part 11 Audit Trail ({complaint.audit_events?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Detailed Drug Info & Defect Narrative */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Product & Batch Specifics">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Product Name</span>
                  <span className="font-bold text-slate-900 text-sm">{complaint.product_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Batch / Lot Number</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm bg-indigo-50 px-1.5 py-0.5 rounded inline-block">
                    {complaint.batch_number}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dosage Form</span>
                  <span className="text-slate-800">{complaint.dosage_form || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Manufacturing Classification</span>
                  <span className="text-slate-800">{complaint.manufacturing_type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Complaint Type</span>
                  <span className="text-slate-800">{complaint.complaint_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Severity Rating</span>
                  <span className="font-bold text-slate-800">{complaint.severity}</span>
                </div>
              </div>
            </Card>

            <Card title="Verbatim Customer Defect Narrative">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </div>

              {complaint.immediate_containment && (
                <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5">Immediate Containment Action Taken:</span>
                  <p className="text-amber-800">{complaint.immediate_containment}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right 1 Col: Complainant & Governance */}
          <div className="space-y-6">
            <Card title="Reporting Complainant">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact Name</span>
                  <span className="font-semibold text-slate-800">{complaint.complainant_name || 'Anonymous'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Organization / Facility</span>
                  <span className="text-slate-700">{complaint.complainant_organization || 'Hospital/Clinic'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Professional Role</span>
                  <span className="text-slate-700">{complaint.complainant_role || 'Healthcare Provider'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact Details</span>
                  <span className="text-slate-700 font-mono text-[11px]">{complaint.complainant_contact || 'N/A'}</span>
                </div>
              </div>
            </Card>

            <Card title="Compliance Checklist">
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>21 CFR 211.198 Written Record</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Filed
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Retained Sample Check</span>
                  <span className="text-indigo-600 font-semibold">Assigned</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Field Alert Report (FAR)</span>
                  <span className={complaint.criticality === 'CRITICAL' ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                    {complaint.criticality === 'CRITICAL' ? 'Mandatory (3d)' : 'Not Required'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: 6M Ishikawa & Root Cause */}
      {activeTab === 'ishikawa' && (
        <div className="space-y-6">
          <IshikawaView
            factors={
              complaint.investigation?.ishikawa_factors || {
                Material: ['Raw material certificate of analysis', 'Rubber stopper batch hardness variation', 'Glass vial thermal shock resistance'],
                Machine: ['Capping machine crimping head alignment', 'Inspection camera sensitivity calibration', 'Filling needle vibration'],
                Method: ['SOP-QC-204 Particulate Inspection protocol', 'Autoclave terminal sterilization parameters'],
                Measurement: ['High-intensity polarized light inspection', 'Turbidimetric particle sizing counter'],
                Manpower: ['Operator training log for packaging line', 'Fatigue/shift changeover signoff'],
                Milieu: ['Cleanroom ISO 5 laminar airflow velocity', 'HEPA filter integrity testing history']
              }
            }
          />
        </div>
      )}

      {/* Tab 3: CAPA Tracking */}
      {activeTab === 'capa' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Corrective & Preventive Action (CAPA) Records
            </h3>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowCapaModal(true)}
            >
              Assign New CAPA
            </Button>
          </div>

          <div className="space-y-3">
            {(!complaint.capas || complaint.capas.length === 0) ? (
              <Card>
                <div className="py-8 text-center text-slate-400 text-xs">
                  No CAPA actions assigned yet. Click "Assign New CAPA" to initiate corrective or preventive mitigation.
                </div>
              </Card>
            ) : (
              complaint.capas.map((capa, idx) => (
                <div key={capa.id || idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={capa.capa_type === 'CORRECTIVE' ? 'danger' : 'primary'}>
                        {capa.capa_type}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {capa.capa_number || `CAPA-${idx + 1}`}
                      </span>
                    </div>
                    <Badge variant={capa.status === 'COMPLETED' ? 'success' : 'warning'}>
                      {capa.status || 'PENDING'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700 mb-2">{capa.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                    <span>Owner: {capa.owner || 'QA Department'}</span>
                    {capa.target_completion_date && (
                      <span>Target: {new Date(capa.target_completion_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: 21 CFR Part 11 Audit Trail */}
      {activeTab === 'audit' && (
        <Card>
          <AuditTrailTimeline auditEvents={complaint.audit_events || []} />
        </Card>
      )}

      {/* Status Transition Modal */}
      <ConfirmModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Advance QMS Lifecycle Status"
        confirmText="Sign & Advance Status"
        onConfirm={handleStatusSubmit}
        loading={submittingStatus}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Target Status</label>
            <Select
              options={[
                { value: 'RECEIVED', label: 'RECEIVED' },
                { value: 'OPEN', label: 'OPEN' },
                { value: 'UNDER_INVESTIGATION', label: 'UNDER_INVESTIGATION' },
                { value: 'CAPA_PENDING', label: 'CAPA_PENDING' },
                { value: 'CLOSED', label: 'CLOSED & VERIFIED' }
              ]}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Operator ID (21 CFR Part 11) *</label>
            <Input
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="font-mono"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Mandatory Regulatory Reason for Change *</label>
            <Textarea
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="State the scientific, QA, or regulatory justification for this lifecycle transition..."
              required
            />
          </div>
        </div>
      </ConfirmModal>

      {/* New CAPA Modal */}
      <ConfirmModal
        isOpen={showCapaModal}
        onClose={() => setShowCapaModal(false)}
        title="Assign Corrective / Preventive Action"
        confirmText="Register CAPA"
        onConfirm={handleAddCapaSubmit}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">CAPA Type</label>
            <Select
              options={[
                { value: 'CORRECTIVE', label: 'Corrective Action (Eliminate Cause of Detected Nonconformity)' },
                { value: 'PREVENTIVE', label: 'Preventive Action (Eliminate Cause of Potential Nonconformity)' }
              ]}
              value={capaType}
              onChange={(e) => setCapaType(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Action Description *</label>
            <Textarea
              rows={3}
              value={capaAction}
              onChange={(e) => setCapaAction(e.target.value)}
              placeholder="Specific engineering, procedural, or training mitigation required..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Responsible Owner</label>
              <Input
                value={capaOwner}
                onChange={(e) => setCapaOwner(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Completion Date</label>
              <Input
                type="date"
                value={capaDueDate}
                onChange={(e) => setCapaDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </ConfirmModal>
    </PageContainer>
  );
}
