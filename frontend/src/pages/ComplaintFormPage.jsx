import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  createComplaint, 
  resetForm, 
  updateFormField 
} from '../store/slices/complaintsSlice';
import { addToast } from '../store/slices/uiSlice';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import OriginBadge from '../components/feedback/OriginBadge';
import CompletenessGauge from '../components/feedback/CompletenessGauge';
import AlertBanner from '../components/feedback/AlertBanner';
import Badge from '../components/common/Badge';
import { 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  User, 
  AlertOctagon, 
  Package, 
  FlaskConical, 
  Calendar 
} from 'lucide-react';

const MANUFACTURING_TYPES = [
  { value: 'Sterile Injectable', label: 'Sterile Injectable' },
  { value: 'Oral Solid Dosage', label: 'Oral Solid Dosage (Tablets/Capsules)' },
  { value: 'Lyophilized Vial', label: 'Lyophilized Vial' },
  { value: 'Biologic / Cold-Chain', label: 'Biologic / Cold-Chain' },
  { value: 'Topical / Ointment', label: 'Topical / Ointment' },
  { value: 'Oral Liquid / Suspension', label: 'Oral Liquid / Suspension' }
];

const SEVERITY_LEVELS = [
  { value: 'LOW', label: 'Low (Negligible quality impact)' },
  { value: 'MEDIUM', label: 'Medium (Minor defect, no safety risk)' },
  { value: 'HIGH', label: 'High (Significant quality/potency deviation)' },
  { value: 'CRITICAL', label: 'Critical (Adverse event or safety hazard)' }
];

const CRITICALITY_LEVELS = [
  { value: 'MINOR', label: 'Minor (Class III - Cosmetic / Minor Labeling)' },
  { value: 'MAJOR', label: 'Major (Class II - Temporary/Reversible defect)' },
  { value: 'CRITICAL', label: 'Critical (Class I - Life-threatening / Serious)' }
];

const COMPLAINT_TYPES = [
  { value: 'Particulate Contamination', label: 'Particulate Contamination' },
  { value: 'Physical Tablet Defect', label: 'Physical Tablet Defect (Cracking/Chipping)' },
  { value: 'Packaging / Seal Integrity', label: 'Packaging / Seal Integrity Failure' },
  { value: 'Labeling & Artwork Error', label: 'Labeling & Artwork Error' },
  { value: 'Suspected Contamination', label: 'Suspected Microbial/Chemical Contamination' },
  { value: 'Adverse Drug Reaction', label: 'Adverse Drug Reaction (Pharmacovigilance)' },
  { value: 'Temperature Excursion', label: 'Cold-Chain Temperature Excursion' },
  { value: 'Efficacy / Potency Failure', label: 'Lack of Efficacy / Potency Failure' }
];

export default function ComplaintFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentAssessment } = useSelector((state) => state.aiCopilot);
  const { formSubmitting } = useSelector((state) => state.complaints);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    product_name: '',
    api_name: '',
    dosage_form: 'Vial for Injection',
    manufacturing_type: 'Sterile Injectable',
    batch_number: '',
    expiry_date: '',
    complainant_name: '',
    complainant_organization: '',
    complainant_role: 'Hospital Pharmacist',
    complainant_contact: '',
    complaint_type: 'Particulate Contamination',
    severity: 'HIGH',
    criticality: 'MAJOR',
    description: '',
    immediate_containment: '',
    operator_id: 'QA-OPERATOR-042',
    reason_for_intake: 'Initial QMS Registration from Customer Report'
  });

  // Track origins of each field: 'manual' | 'extracted' | 'ai' | 'edited'
  const [origins, setOrigins] = useState({});

  // Sync from AI Assessment if available
  useEffect(() => {
    if (currentAssessment && currentAssessment.extracted_fields) {
      const ext = currentAssessment.extracted_fields;
      setFormData((prev) => ({
        ...prev,
        title: ext.title || `Quality Complaint: ${ext.product_name || 'Product'} (${ext.batch_number || 'Batch'})`,
        product_name: ext.product_name || prev.product_name,
        batch_number: ext.batch_number || prev.batch_number,
        manufacturing_type: ext.manufacturing_type || prev.manufacturing_type,
        dosage_form: ext.dosage_form || prev.dosage_form,
        complaint_type: ext.complaint_type || prev.complaint_type,
        severity: ext.severity || prev.severity,
        criticality: ext.criticality || prev.criticality,
        description: ext.description || currentAssessment.raw_text || prev.description,
        immediate_containment: ext.immediate_containment || 'Immediate quarantine of retained batch samples requested.'
      }));

      // Mark field origins as 'ai' or 'extracted'
      const newOrigins = {};
      Object.keys(ext).forEach((k) => {
        newOrigins[k] = 'ai';
      });
      setOrigins(newOrigins);
    }
  }, [currentAssessment]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // If field was previously 'ai' or 'extracted', mark as 'edited'
    setOrigins((prev) => ({
      ...prev,
      [field]: prev[field] ? 'edited' : 'manual'
    }));
  };

  // Calculate live completeness score
  const requiredFields = ['title', 'product_name', 'batch_number', 'complaint_type', 'severity', 'criticality', 'description', 'complainant_name'];
  const filledCount = requiredFields.filter((f) => Boolean(formData[f]?.trim?.())).length;
  const completenessScore = filledCount / requiredFields.length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.product_name || !formData.batch_number || !formData.description) {
      dispatch(addToast({
        type: 'danger',
        message: 'Product Name, Batch Number, and Description are required per 21 CFR 211.198.'
      }));
      return;
    }

    try {
      const result = await dispatch(createComplaint({
        ...formData,
        metadata: {
          field_origins: origins,
          ai_assisted: Boolean(currentAssessment)
        }
      })).unwrap();

      dispatch(addToast({
        type: 'success',
        message: `Complaint ${result.complaint_id || 'registered'} created with 21 CFR Part 11 audit trail!`
      }));

      // Navigate to detail view
      if (result.id) {
        navigate(`/complaints/${result.id}`);
      } else {
        navigate('/complaints');
      }
    } catch (err) {
      dispatch(addToast({
        type: 'danger',
        message: `Failed to create complaint: ${err.message || 'Validation error'}`
      }));
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      product_name: '',
      api_name: '',
      dosage_form: 'Vial for Injection',
      manufacturing_type: 'Sterile Injectable',
      batch_number: '',
      expiry_date: '',
      complainant_name: '',
      complainant_organization: '',
      complainant_role: 'Hospital Pharmacist',
      complainant_contact: '',
      complaint_type: 'Particulate Contamination',
      severity: 'HIGH',
      criticality: 'MAJOR',
      description: '',
      immediate_containment: '',
      operator_id: 'QA-OPERATOR-042',
      reason_for_intake: 'Manual Registration'
    });
    setOrigins({});
    dispatch(addToast({
      type: 'info',
      message: 'Form cleared.'
    }));
  };

  return (
    <PageContainer
      title="Structured Quality Complaint Form"
      subtitle="Verify and calibrate extracted pharmaceutical parameters prior to binding QMS registration and 21 CFR Part 11 audit trail recording."
      badge={
        <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
          Human-in-the-Loop Review
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Summary / Completeness Bar */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-1/2">
            <CompletenessGauge score={completenessScore} label="Form Data Completeness" />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              icon={RotateCcw}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={formSubmitting}
              icon={Save}
            >
              Save & Register Complaint
            </Button>
          </div>
        </div>

        {/* Origin Legend Indicator */}
        <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-md border border-slate-200">
          <span className="font-semibold text-slate-700">Data Provenance:</span>
          <div className="flex items-center gap-1.5">
            <OriginBadge origin="ai" />
            <span>= Extracted by Groq/LangGraph</span>
          </div>
          <div className="flex items-center gap-1.5">
            <OriginBadge origin="edited" />
            <span>= Adjusted by QA Operator</span>
          </div>
          <div className="flex items-center gap-1.5">
            <OriginBadge origin="manual" />
            <span>= Manual Data Entry</span>
          </div>
        </div>

        {/* AI Copilot Intelligence Panel (Summary, Completeness, Risk, Risk Factors, Duplicate, Root Cause, CAPA) */}
        {currentAssessment && (
          <Card
            title="AI Copilot Regulatory Triage Intelligence"
            subtitle="Extracted entities and ICH Q9 quality risk evaluations generated by LangGraph multi-agent pipeline"
            headerAction={
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  {currentAssessment.model_used || 'openai/gpt-oss-120b'}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${currentAssessment.ai_provider === 'groq' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {currentAssessment.ai_provider === 'groq' ? 'GROQ LIVE' : 'FALLBACK'}
                </span>
              </div>
            }
          >
            <div className="space-y-4 text-xs">
              {/* 1. Summary */}
              {currentAssessment.summary && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 text-indigo-950">
                  <span className="font-bold block mb-1">Executive Assessment Summary:</span>
                  <p className="leading-relaxed">{currentAssessment.summary}</p>
                </div>
              )}

              {/* 2 & 3. Completeness & Risk Rating Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-medium block mb-1">Completeness Score:</span>
                  <span className="text-lg font-bold text-slate-800">
                    {Math.round((currentAssessment.completeness_score || 1.0) * 100)}%
                  </span>
                  <span className="text-[10px] text-emerald-600 block">21 CFR 211.198 Ready</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-medium block mb-1">ICH Q9 Risk Level:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-amber-700">
                      {currentAssessment.risk_assessment?.risk_level || currentAssessment.risk_level || 'High'}
                    </span>
                    <Badge variant={currentAssessment.criticality === 'CRITICAL' ? 'danger' : 'warning'}>
                      {currentAssessment.criticality || 'MAJOR'}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-slate-500 block">RPN Score: {currentAssessment.risk_assessment?.rpn || 24}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-medium block mb-1">Duplicate Batch Signal:</span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {currentAssessment.duplicate_detection?.is_duplicate ? 'Cluster Flagged' : 'Zero Duplicate Signals'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {currentAssessment.duplicate_detection?.clustering_signal_summary || 'Initial batch complaint.'}
                  </span>
                </div>
              </div>

              {/* 4. Risk Factors (6M Ishikawa) */}
              {currentAssessment.risk_factors && Object.keys(currentAssessment.risk_factors).length > 0 && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1.5">6M Ishikawa Risk Factors:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                    {Object.entries(currentAssessment.risk_factors).slice(0, 6).map(([dim, factors]) => (
                      <div key={dim} className="bg-white p-2 rounded border border-slate-200">
                        <strong className="text-indigo-700 block">{dim}:</strong>
                        <span className="text-slate-600">{Array.isArray(factors) ? factors[0] : factors}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5 & 6. Root Cause & CAPA Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
                  <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
                    <span>Root Cause Recommendations</span>
                  </div>
                  <p className="text-amber-900 text-[11px]">
                    {currentAssessment.root_cause_analysis?.probable_root_causes?.[0] ||
                     currentAssessment.root_cause_analysis?.primary_hypothesis ||
                     'Packaging tooling misalignment or compression force overload.'}
                  </p>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
                  <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>CAPA Recommendations</span>
                  </div>
                  <p className="text-emerald-900 text-[11px]">
                    {currentAssessment.capa_recommendations?.immediate_containment?.[0] ||
                     'Quarantine affected lots at distribution depots; inspect retained reference samples.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Section 1: Product & Batch Identification */}
        <Card
          title="1. Product & Manufacturing Line Identification"
          subtitle="Mandatory drug identity per 21 CFR 211.198(a)"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Complaint Record Title *</label>
                {origins.title && <OriginBadge origin={origins.title} />}
              </div>
              <Input
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g., Foreign Particulate Matter in Ceftriaxone 1g Vials"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Manufacturing Classification</label>
                {origins.manufacturing_type && <OriginBadge origin={origins.manufacturing_type} />}
              </div>
              <Select
                options={MANUFACTURING_TYPES}
                value={formData.manufacturing_type}
                onChange={(e) => handleFieldChange('manufacturing_type', e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Finished Product Name *</label>
                {origins.product_name && <OriginBadge origin={origins.product_name} />}
              </div>
              <Input
                value={formData.product_name}
                onChange={(e) => handleFieldChange('product_name', e.target.value)}
                placeholder="e.g., Ceftriaxone Sodium for Injection"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Batch / Lot Number *</label>
                {origins.batch_number && <OriginBadge origin={origins.batch_number} />}
              </div>
              <Input
                value={formData.batch_number}
                onChange={(e) => handleFieldChange('batch_number', e.target.value)}
                placeholder="e.g., CX-2024-088"
                className="font-mono font-bold"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Dosage Form / Packaging</label>
                {origins.dosage_form && <OriginBadge origin={origins.dosage_form} />}
              </div>
              <Input
                value={formData.dosage_form}
                onChange={(e) => handleFieldChange('dosage_form', e.target.value)}
                placeholder="e.g., 10 mL Glass Vial (USP Type I)"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Complainant Information */}
        <Card
          title="2. Complainant & Incident Source"
          subtitle="Hospital, pharmacy, distributor, or clinical reporting entity"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Complainant Contact Name *</label>
              <Input
                value={formData.complainant_name}
                onChange={(e) => handleFieldChange('complainant_name', e.target.value)}
                placeholder="e.g., Dr. Aris Thorne"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Organization / Facility</label>
              <Input
                value={formData.complainant_organization}
                onChange={(e) => handleFieldChange('complainant_organization', e.target.value)}
                placeholder="e.g., St. Jude Medical Center"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Professional Role</label>
              <Input
                value={formData.complainant_role}
                onChange={(e) => handleFieldChange('complainant_role', e.target.value)}
                placeholder="e.g., Chief Pharmacist"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone / Email Contact</label>
              <Input
                value={formData.complainant_contact}
                onChange={(e) => handleFieldChange('complainant_contact', e.target.value)}
                placeholder="e.g., pharmacy@stjudemed.org"
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Risk Classification & Defect Narrative */}
        <Card
          title="3. Quality Defect Details & ICH Q9 Risk Rating"
          subtitle="Severity categorization and initial risk matrix evaluation"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Complaint Classification</label>
                {origins.complaint_type && <OriginBadge origin={origins.complaint_type} />}
              </div>
              <Select
                options={COMPLAINT_TYPES}
                value={formData.complaint_type}
                onChange={(e) => handleFieldChange('complaint_type', e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Severity Rating</label>
                {origins.severity && <OriginBadge origin={origins.severity} />}
              </div>
              <Select
                options={SEVERITY_LEVELS}
                value={formData.severity}
                onChange={(e) => handleFieldChange('severity', e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Criticality (ICH Q9)</label>
                {origins.criticality && <OriginBadge origin={origins.criticality} />}
              </div>
              <Select
                options={CRITICALITY_LEVELS}
                value={formData.criticality}
                onChange={(e) => handleFieldChange('criticality', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Detailed Defect Description *</label>
                {origins.description && <OriginBadge origin={origins.description} />}
              </div>
              <Textarea
                rows={5}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Provide complete verbatim facts regarding the defect..."
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Immediate Containment Action</label>
              <Input
                value={formData.immediate_containment}
                onChange={(e) => handleFieldChange('immediate_containment', e.target.value)}
                placeholder="e.g., Quarantine lot CX-2024-088 at distribution center; halt further shipments."
              />
            </div>
          </div>
        </Card>

        {/* Section 4: 21 CFR Part 11 Electronic Signature & Operator Attribution */}
        <Card
          title="4. 21 CFR Part 11 Electronic Attribution"
          subtitle="Mandatory user credentials and rationale for audit trail"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Responsible Operator ID *</label>
              <Input
                value={formData.operator_id}
                onChange={(e) => handleFieldChange('operator_id', e.target.value)}
                className="font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Regulatory Reason for Entry *</label>
              <Input
                value={formData.reason_for_intake}
                onChange={(e) => handleFieldChange('reason_for_intake', e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        {/* Bottom Submission Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/intake')}
          >
            Cancel / Back to Intake
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={formSubmitting}
            icon={ShieldCheck}
            size="lg"
          >
            Submit & Record in QMS Register
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
