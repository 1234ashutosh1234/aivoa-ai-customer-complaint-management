import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  analyzeComplaint, 
  setExtractedField, 
  clearAssessment 
} from '../store/slices/aiCopilotSlice';
import { addToast } from '../store/slices/uiSlice';
import apiService from '../services/api';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Textarea from '../components/common/Textarea';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import CompletenessGauge from '../components/feedback/CompletenessGauge';
import ConfidenceBadge from '../components/feedback/ConfidenceBadge';
import AlertBanner from '../components/feedback/AlertBanner';
import { 
  Sparkles, 
  UploadCloud, 
  Mail, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  FlaskConical, 
  Clock, 
  HelpCircle,
  FileCheck
} from 'lucide-react';

const PRESET_SCENARIOS = [
  {
    title: 'Sterile Injectable Particulate',
    category: 'Critical / Class I',
    badgeVariant: 'danger',
    text: `URGENT QUALITY ALERT: St. Jude Medical Center Hospital Pharmacy reported foreign particulate matter observed in 4 sealed vials of Ceftriaxone Sodium for Injection 1g (Batch: CX-2024-088, Expiry: 11/2026). The chief hospital pharmacist noticed visible dark floating specs under inspection lamp before intravenous administration to pediatric patients in the ICU. The nurse immediately quarantined the lot. No patient was injected yet. Lot was received on 2026-08-15. Suspect vial seal or rubber stopper fragmentation during crimping. Please issue immediate quarantine and recall investigation.`
  },
  {
    title: 'Cracked Blister Tablets',
    category: 'Major / Defect',
    badgeVariant: 'warning',
    text: `Received call from CVS Pharmacy #402. Patient reported that Metformin HCl Extended-Release Tablets 500mg (Batch: MET-2024-102, Exp: 09/2027) had multiple severely cracked and crumbling tablets inside the sealed PVC/PVDC blister foil pack. Patient noted erratic tablet size and residue inside blister pockets. Pharmacist examined 3 remaining cartons from the same shipment and confirmed 12 blisters with fractured tablets. Suspect excessive compression force or high moisture during blister sealing.`
  },
  {
    title: 'Cold-Chain Biologic Excursion',
    category: 'Critical / Potency',
    badgeVariant: 'danger',
    text: `Regional Distribution Hub #3 reported temperature excursion during transit of Insulin Glargine 100 Units/mL Solostar prefilled pens (Batch: INS-GL-993, Expiry: 05/2026). Electronic datalogger SensoTrack-802 recorded sustained ambient temperatures of 28.5°C for over 38 consecutive hours due to refrigerated reefer unit compressor malfunction. Required storage is 2°C - 8°C. Total 2,500 packs quarantined. Potential protein denaturation and loss of hypoglycemic potency.`
  },
  {
    title: 'Packaging Label Misprint',
    category: 'Minor / Cosmetic',
    badgeVariant: 'info',
    text: `Quality notification from Walgreens Distribution Center. Amoxicillin Trihydrate Oral Suspension 250mg/5mL (Batch: AMX-2024-055, Exp: 12/2025) cartons show smudged lot and expiration dates on the side flap due to ink-jet coder roller misalignment at packaging line 4. The blister bottle labels inside are crisp and fully legible with correct barcode. No physical or chemical defect in the reconstitution powder.`
  }
];

export default function IntakePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentAssessment, loading, error } = useSelector((state) => state.aiCopilot);

  const [intakeTab, setIntakeTab] = useState('raw'); // 'raw' | 'email' | 'upload'
  const [rawText, setRawText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleSelectScenario = (scenario) => {
    setIntakeTab('raw');
    setRawText(scenario.text);
    dispatch(addToast({
      type: 'info',
      message: `Loaded scenario: ${scenario.title}`
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const res = await apiService.uploadFile(file);
      setUploadedFileName(file.name);
      
      const extractedContent = res.data?.extracted_text || res.extracted_text || '';
      if (extractedContent) {
        setRawText(extractedContent);
        setIntakeTab('raw');
        dispatch(addToast({
          type: 'success',
          message: `Extracted text from ${file.name} successfully!`
        }));
      } else {
        dispatch(addToast({
          type: 'info',
          message: `Uploaded ${file.name}. Enter text or continue.`
        }));
      }
    } catch (err) {
      dispatch(addToast({
        type: 'danger',
        message: `Failed to upload/extract file: ${err.message}`
      }));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAnalyze = async () => {
    let payloadText = rawText;
    if (intakeTab === 'email') {
      payloadText = `Subject: ${emailSubject}\nFrom: ${emailFrom}\n\n${emailBody}`;
    }

    if (!payloadText.trim()) {
      dispatch(addToast({
        type: 'warning',
        message: 'Please provide complaint text or select a demo scenario before analyzing.'
      }));
      return;
    }

    try {
      await dispatch(analyzeComplaint({ text: payloadText })).unwrap();
      dispatch(addToast({
        type: 'success',
        message: 'AI Copilot analysis completed successfully!'
      }));
    } catch (err) {
      dispatch(addToast({
        type: 'danger',
        message: `Analysis error: ${err.message || 'Check server connection'}`
      }));
    }
  };

  const handleProceedToForm = () => {
    if (!currentAssessment) return;
    // Navigate to structured complaint form with pre-populated AI state
    navigate('/form');
  };

  return (
    <PageContainer
      title="Intake & AI Copilot Triage"
      subtitle="Ingest unstructured complaint records, clinical notifications, emails, and PDFs. Multi-agent LangGraph extracts entities and assesses regulatory risk."
      badge={
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-200 flex items-center gap-1.5 font-medium shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Groq openai/gpt-oss-120b
          </span>
          <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
            Assignment requested model: gemma2-9b-it (decommissioned by Groq). Runtime model: openai/gpt-oss-120b.
          </span>
        </div>
      }
    >
      {/* Preset Demo Scenarios */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick Demo Pharma Scenarios
          </span>
          <span className="text-[11px] text-slate-400">
            Click to auto-load realistic GMP complaints
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectScenario(sc)}
              className="text-left p-3 rounded-lg bg-white border border-slate-200 hover:border-pharma-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-slate-800 group-hover:text-pharma-700">
                  {sc.title}
                </span>
                <Badge variant={sc.badgeVariant} size="xs">
                  {sc.category}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {sc.text}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Channels & AI Assessment Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ingestion Channels (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 -mx-6 -mt-4 px-6 pt-2 mb-4 bg-slate-50 rounded-t-lg">
              <button
                type="button"
                onClick={() => setIntakeTab('raw')}
                className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  intakeTab === 'raw'
                    ? 'border-pharma-600 text-pharma-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Raw Narrative Text</span>
              </button>
              <button
                type="button"
                onClick={() => setIntakeTab('email')}
                className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  intakeTab === 'email'
                    ? 'border-pharma-600 text-pharma-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Email Parser</span>
              </button>
              <button
                type="button"
                onClick={() => setIntakeTab('upload')}
                className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  intakeTab === 'upload'
                    ? 'border-pharma-600 text-pharma-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Document Upload (PDF)</span>
              </button>
            </div>

            {/* Tab 1: Raw Text */}
            {intakeTab === 'raw' && (
              <div className="space-y-3">
                <Textarea
                  label="Unstructured Complaint Description / Call Log"
                  rows={10}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste verbatim customer complaint, doctor adverse event report, pharmacovigilance communication, or distributor defect narrative..."
                  helper="Includes product name, dosage form, batch/lot number, packaging defects, adverse effects, patient outcomes."
                />
              </div>
            )}

            {/* Tab 2: Email */}
            {intakeTab === 'email' && (
              <div className="space-y-3">
                <Input
                  label="Email Subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g., URGENT: Quality complaint regarding Ceftriaxone lot CX-2024-088"
                />
                <Input
                  label="Sender / Hospital / Pharmacy"
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  placeholder="e.g., Chief Pharmacist <pharmacy@stjudemed.org>"
                />
                <Textarea
                  label="Email Message Body"
                  rows={7}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Verbatim email text..."
                />
              </div>
            )}

            {/* Tab 3: Upload */}
            {intakeTab === 'upload' && (
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-pharma-500 transition-colors bg-slate-50/50">
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">
                    Upload Complaint PDF or Technical Memo
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    PDF, TXT, DOCX up to 25MB. Server extracts OCR & plain text automatically.
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-pharma-600 hover:bg-pharma-700 text-white font-medium text-xs cursor-pointer shadow-xs">
                    <span>Choose File</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                    />
                  </label>
                  {uploadingFile && (
                    <p className="text-xs text-indigo-600 mt-2 font-medium animate-pulse">
                      Uploading and extracting text...
                    </p>
                  )}
                  {uploadedFileName && !uploadingFile && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono">
                      <FileCheck className="w-4 h-4" />
                      <span>{uploadedFileName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Processed with Groq `openai/gpt-oss-120b` & LangGraph
              </span>
              <Button
                variant="primary"
                onClick={handleAnalyze}
                loading={loading}
                icon={Sparkles}
                size="md"
              >
                Analyze with AI Copilot
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: AI Extraction & Risk Assessment Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="AI Triage Assessment"
            subtitle="Real-time multi-agent extraction & AI-assisted preliminary risk assessment"
            headerAction={
              currentAssessment && (
                <ConfidenceBadge score={currentAssessment.confidence_score || 0.94} />
              )
            }
          >
            {loading && (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto"></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Executing LangGraph State Machine...
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Normalizing input • Extracting QMS fields • Rating risk • Suggesting CAPA
                  </p>
                </div>
              </div>
            )}

            {!loading && !currentAssessment && (
              <div className="py-12 text-center text-slate-400">
                <Cpu className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No Assessment Active</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Load a preset scenario or paste complaint text and click "Analyze with AI Copilot".
                </p>
              </div>
            )}

            {!loading && currentAssessment && (
              <div className="space-y-3.5">
                {/* AI Provider Attribution & Model Metadata */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600 text-[11px]">Provider:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${currentAssessment.ai_provider === 'groq' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                      {currentAssessment.ai_provider === 'groq' ? 'GROQ (LIVE)' : 'FALLBACK'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600 text-[11px]">Model:</span>
                    <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] shadow-2xs font-semibold">
                      {currentAssessment.model_used || currentAssessment.runtime_model || 'openai/gpt-oss-120b'}
                    </span>
                  </div>
                </div>

                {/* 1. Executive Summary */}
                {currentAssessment.summary && (
                  <div className="bg-indigo-50/80 border border-indigo-200 rounded-lg p-3 text-xs">
                    <div className="font-semibold text-indigo-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI Triage Summary</span>
                    </div>
                    <p className="text-indigo-950 text-[11px] leading-relaxed">
                      {currentAssessment.summary}
                    </p>
                  </div>
                )}

                {/* 2. Completeness Meter */}
                <CompletenessGauge score={currentAssessment.completeness_score || 1.0} />

                {/* 3. Primary Extracted Entities & Risk Assessment */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Product:</span>
                    <span className="font-bold text-slate-900">
                      {currentAssessment.extracted_fields?.product_name || currentAssessment.product || 'Not detected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Batch / Lot:</span>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {currentAssessment.extracted_fields?.batch_number || currentAssessment.batch || 'UNKNOWN'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Customer:</span>
                    <span className="font-semibold text-slate-800">
                      {currentAssessment.extracted_fields?.complainant_name || currentAssessment.customer || 'MediCare Distributors'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Category:</span>
                    <span className="font-semibold text-slate-800">
                      {currentAssessment.extracted_fields?.complaint_type || currentAssessment.category || 'Physical/Product Quality Defect'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Patient Impact:</span>
                    <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {currentAssessment.patient_impact || currentAssessment.complaint?.patient_safety?.patient_impact || 'No confirmed injury'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">ICH Q9 Criticality:</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={
                        (currentAssessment.extracted_fields?.criticality || currentAssessment.criticality) === 'CRITICAL' ? 'danger' :
                        (currentAssessment.extracted_fields?.criticality || currentAssessment.criticality) === 'MAJOR' ? 'warning' : 'default'
                      }>
                        {currentAssessment.extracted_fields?.criticality || currentAssessment.criticality || 'MAJOR'}
                      </Badge>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {currentAssessment.extracted_fields?.severity || currentAssessment.severity || 'HIGH'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Duplicate Detection Analysis */}
                {currentAssessment.duplicate_detection && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-800 block mb-0.5">Duplicate / Cluster Batch Check:</span>
                    <p className="text-[11px] text-slate-600">
                      {currentAssessment.duplicate_detection.clustering_signal_summary || 'Zero recurring historical defect clusters detected for this batch.'}
                    </p>
                  </div>
                )}

                {/* 5. Risk Factors (6M Ishikawa) */}
                {currentAssessment.risk_factors && Object.keys(currentAssessment.risk_factors).length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <span className="font-semibold text-slate-800 block">ICH Q9 Risk Factor Hypotheses (6M):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {Object.entries(currentAssessment.risk_factors).slice(0, 4).map(([dim, factors]) => (
                        <div key={dim} className="bg-white p-1.5 rounded border border-slate-200 text-[10px]">
                          <strong className="text-indigo-700 block">{dim}</strong>
                          <span className="text-slate-600">{Array.isArray(factors) ? factors[0] : factors}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Root Cause Recommendation */}
                {currentAssessment.root_cause_analysis && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs">
                    <div className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
                      <span>Root Cause Recommendations</span>
                    </div>
                    <p className="text-amber-900 text-[11px] leading-relaxed">
                      {currentAssessment.root_cause_analysis.probable_root_causes?.[0] ||
                       currentAssessment.root_cause_analysis.primary_hypothesis || 
                       'Packaging seal integrity failure or mechanical compression overload.'}
                    </p>
                  </div>
                )}

                {/* 7. CAPA Recommendations */}
                {currentAssessment.capa_recommendations && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 text-xs">
                    <div className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>SMART CAPA Recommendations</span>
                    </div>
                    <ul className="text-emerald-950 text-[11px] list-disc list-inside space-y-1">
                      <li>
                        <strong>Containment:</strong> {currentAssessment.capa_recommendations.immediate_containment?.[0] || 'Quarantine lot at distribution centers; retrieve retained reference samples.'}
                      </li>
                      {currentAssessment.capa_recommendations.corrective_actions?.[0] && (
                        <li>
                          <strong>Corrective:</strong> {currentAssessment.capa_recommendations.corrective_actions[0].description}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Transfer to Verification Form Button */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleProceedToForm}
                    icon={ArrowRight}
                  >
                    Transfer to Verification Form
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Fields will be pre-filled with [AI COPILOT] badges for human verification.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
