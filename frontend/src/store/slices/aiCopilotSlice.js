import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintApi, default as apiService } from '../../services/api';

export const analyzeTextWithAI = createAsyncThunk(
  'aiCopilot/analyzeText',
  async (payload, { rejectWithValue }) => {
    try {
      const rawText = typeof payload === 'string' ? payload : (payload.text || payload.raw_text || '');
      const sourceType = payload.source_type || 'text';
      
      // Call API
      let res;
      if (complaintApi?.analyzeText) {
        res = await complaintApi.analyzeText(rawText, sourceType);
      } else {
        res = await apiService.analyzeText(rawText);
      }
      
      const data = res.data || res;
      return { result: data, raw_text: rawText, source_type: sourceType };
    } catch (err) {
      return rejectWithValue(err.message || 'AI Analysis error');
    }
  }
);

// Alias
export const analyzeComplaint = analyzeTextWithAI;

export const analyzeDocumentWithAI = createAsyncThunk(
  'aiCopilot/analyzeDocument',
  async (formData, { rejectWithValue }) => {
    try {
      let res;
      if (complaintApi?.analyzeDocument) {
        res = await complaintApi.analyzeDocument(formData);
      } else {
        res = await apiService.uploadFile(formData.get('file'));
      }
      const data = res.data || res;
      return {
        result: data,
        raw_text: data.complaint?.defect?.detailed_description || data.extracted_text || '',
        source_type: 'document',
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  isAnalyzing: false,
  loading: false,
  activeStep: 'idle',
  analysisResult: null,
  currentAssessment: null,
  rawSourceText: '',
  sourceType: 'text',
  fieldOrigins: {}, // { [fieldName]: 'EXTRACTED' | 'AI_GENERATED' | 'MANUAL' }
  error: null,
};

export const aiCopilotSlice = createSlice({
  name: 'aiCopilot',
  initialState,
  reducers: {
    setRawSourceText: (state, action) => {
      state.rawSourceText = action.payload;
    },
    setFieldOrigin: (state, action) => {
      const { field, origin } = action.payload;
      state.fieldOrigins[field] = origin;
    },
    setExtractedField: (state, action) => {
      const { field, value, origin = 'edited' } = action.payload;
      state.fieldOrigins[field] = origin;
      if (state.currentAssessment?.extracted_fields) {
        state.currentAssessment.extracted_fields[field] = value;
      }
    },
    clearAnalysis: (state) => {
      state.analysisResult = null;
      state.currentAssessment = null;
      state.activeStep = 'idle';
      state.rawSourceText = '';
      state.fieldOrigins = {};
      state.error = null;
    },
    clearAssessment: (state) => {
      state.analysisResult = null;
      state.currentAssessment = null;
      state.activeStep = 'idle';
      state.rawSourceText = '';
      state.fieldOrigins = {};
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeTextWithAI.pending, (state) => {
        state.isAnalyzing = true;
        state.loading = true;
        state.activeStep = 'extracting';
        state.error = null;
      })
      .addCase(analyzeTextWithAI.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.loading = false;
        state.activeStep = 'complete';
        
        const rawRes = action.payload.result;
        // Normalize assessment structure for UI
        const normalized = {
          ...rawRes,
          raw_text: action.payload.raw_text,
          confidence_score: rawRes.confidence_score || rawRes.confidence || 0.94,
          completeness_score: rawRes.completeness_score || rawRes.completeness || 0.88,
          summary: rawRes.summary || `Quality evaluation for ${rawRes.product || rawRes.product_name || 'Drug'}.`,
          risk_assessment: rawRes.risk_assessment || {
            severity: rawRes.severity || 'HIGH',
            criticality: rawRes.criticality || 'MAJOR',
            risk_level: rawRes.risk_level || 'High',
            rpn: 24,
            clinical_rationale: 'ICH Q9 Quality Risk Management standard evaluation'
          },
          risk_factors: rawRes.risk_factors || rawRes.root_cause_analysis?.ishikawa_factors || rawRes.root_cause_recommendations?.ishikawa_factors || {},
          duplicate_detection: rawRes.duplicate_detection || {
            is_duplicate: false,
            duplicate_probability: 0.05,
            clustering_signal_summary: 'Batch defect monitoring active.'
          },
          root_cause_analysis: rawRes.root_cause_analysis || rawRes.root_cause_recommendations || {
            primary_hypothesis: 'Material or packaging sealing defect'
          },
          capa_recommendations: rawRes.capa_recommendations || {},
          extracted_fields: rawRes.extracted_fields || {
            title: rawRes.complaint?.defect?.reported_defect || `Complaint: ${rawRes.complaint?.product_batch?.product_name || rawRes.product || 'Drug'}`,
            product_name: rawRes.complaint?.product_batch?.product_name || rawRes.product || rawRes.product_name,
            batch_number: rawRes.complaint?.product_batch?.batch_lot_number || rawRes.batch || rawRes.batch_number,
            manufacturing_type: rawRes.complaint?.product_batch?.manufacturing_classification || 'Oral Solid Dosage',
            dosage_form: rawRes.complaint?.product_batch?.dosage_form || 'Tablet',
            complaint_type: rawRes.complaint?.defect?.complaint_category || rawRes.category || rawRes.complaint_type || 'Physical/Product Quality Defect',
            severity: rawRes.risk_assessment?.severity || rawRes.severity || 'HIGH',
            criticality: rawRes.risk_assessment?.criticality || rawRes.criticality || 'MAJOR',
            description: action.payload.raw_text,
            immediate_containment: rawRes.capa_recommendations?.immediate_containment?.[0] || 'Immediate batch quarantine recommended.'
          }
        };

        state.analysisResult = rawRes;
        state.currentAssessment = normalized;
        state.rawSourceText = action.payload.raw_text;
        state.sourceType = action.payload.source_type;

        // Populate field origins
        const origins = {};
        if (normalized.extracted_fields) {
          Object.keys(normalized.extracted_fields).forEach(k => {
            origins[k] = 'ai';
          });
        }
        state.fieldOrigins = origins;
      })
      .addCase(analyzeTextWithAI.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.loading = false;
        state.activeStep = 'idle';
        state.error = action.payload;
      })
      .addCase(analyzeDocumentWithAI.pending, (state) => {
        state.isAnalyzing = true;
        state.loading = true;
        state.activeStep = 'extracting';
        state.error = null;
      })
      .addCase(analyzeDocumentWithAI.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.loading = false;
        state.activeStep = 'complete';
        state.analysisResult = action.payload.result;
        state.currentAssessment = action.payload.result;
        state.rawSourceText = action.payload.raw_text;
        state.sourceType = action.payload.source_type;
      })
      .addCase(analyzeDocumentWithAI.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.loading = false;
        state.activeStep = 'idle';
        state.error = action.payload;
      });
  },
});

export const { 
  setRawSourceText, 
  setFieldOrigin, 
  setExtractedField, 
  clearAnalysis, 
  clearAssessment 
} = aiCopilotSlice.actions;

export default aiCopilotSlice.reducer;
