import axios from 'axios';

// Resolve API base URL: defaults to http://127.0.0.1:8000/api
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const normalizedBaseUrl = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, '')}/api`;

// Base Axios instance
const api = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-User-ID': 'QA-OPERATOR-042',
  },
});

// Response interceptor to unwrap standardized envelope
api.interceptors.response.use(
  (response) => {
    // If backend returns standardized APIResponse envelope, return the inner data
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return { success: true, data: response.data };
  },
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      'An unexpected network or server error occurred.';
    return Promise.reject(new Error(errorMsg));
  }
);

export const complaintApi = {
  // System Health
  getHealth: () => api.get('/health'),

  // Dashboard Metrics
  getMetrics: () => api.get('/complaints/metrics'),

  // Complaint Queries & CRUD
  getComplaints: (params = {}) => api.get('/complaints', { params }),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  getComplaint: (id) => api.get(`/complaints/${id}`),
  createComplaint: (payload) => api.post('/complaints', payload),
  updateComplaint: (id, payload) => api.put(`/complaints/${id}`, payload),
  deleteComplaint: (id, reason) => api.delete(`/complaints/${id}`, { data: { reason } }),
  updateStatus: (id, new_status, change_reason, operator_id = 'QA-OPERATOR-042') =>
    api.post(`/complaints/${id}/status`, { new_status, change_reason, user_id: operator_id }),
  transitionStatus: (id, new_status, change_reason, operator_id = 'QA-OPERATOR-042') =>
    api.post(`/complaints/${id}/status`, { new_status, change_reason, user_id: operator_id }),
  getAuditTrail: (id) => api.get(`/complaints/${id}/audit-trail`),

  // CAPA & Investigation
  addCapa: (id, capaData) => api.post(`/complaints/${id}/capa`, capaData),
  updateInvestigation: (id, invData) => api.put(`/complaints/${id}`, { investigation: invData }),

  // File Upload
  uploadDocument: (formData) =>
    api.post('/uploads/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source_type', 'document');
    return api.post('/uploads/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // AI Pipeline Execution
  analyzeText: (raw_text, source_type = 'text') =>
    api.post('/ai/analyze-text', { raw_text, source_type }),
  analyzeDocument: (formData) =>
    api.post('/ai/analyze-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeAI: (raw_text, document_context = null, complaint_id = null) =>
    api.post('/ai/analyze', { raw_text, document_context, complaint_id }),
};

// Also attach helper methods to api instance for maximum compatibility
Object.assign(api, complaintApi);

export default complaintApi;
