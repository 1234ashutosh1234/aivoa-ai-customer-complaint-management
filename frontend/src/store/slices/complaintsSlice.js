import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintApi, default as apiService } from '../../services/api';

export const fetchMetrics = createAsyncThunk(
  'complaints/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const res = await (complaintApi?.getMetrics ? complaintApi.getMetrics() : apiService.getMetrics());
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await (complaintApi?.getComplaints ? complaintApi.getComplaints(params) : apiService.getComplaints(params));
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchComplaintById = createAsyncThunk(
  'complaints/fetchComplaintById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await (complaintApi?.getComplaintById ? complaintApi.getComplaintById(id) : apiService.getComplaint(id));
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createComplaint = createAsyncThunk(
  'complaints/createComplaint',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await (complaintApi?.createComplaint ? complaintApi.createComplaint(payload) : apiService.createComplaint(payload));
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateComplaint = createAsyncThunk(
  'complaints/updateComplaint',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await (complaintApi?.updateComplaint ? complaintApi.updateComplaint(id, payload) : apiService.updateComplaint(id, payload));
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteComplaint = createAsyncThunk(
  'complaints/deleteComplaint',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      await (complaintApi?.deleteComplaint ? complaintApi.deleteComplaint(id, reason) : apiService.deleteComplaint(id, reason));
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const transitionStatus = createAsyncThunk(
  'complaints/transitionStatus',
  async ({ id, status, new_status, reason, change_reason, operator_id }, { rejectWithValue }) => {
    try {
      const targetStatus = status || new_status;
      const targetReason = reason || change_reason || 'Lifecycle advancement';
      const res = await (complaintApi?.updateStatus ? complaintApi.updateStatus(id, targetStatus, targetReason) : apiService.transitionStatus(id, targetStatus, targetReason, operator_id));
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateComplaintStatus = transitionStatus;

export const addCapa = createAsyncThunk(
  'complaints/addCapa',
  async (capaData, { rejectWithValue }) => {
    try {
      const res = await apiService.addCapa(capaData.complaint_id, capaData);
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addInvestigation = createAsyncThunk(
  'complaints/addInvestigation',
  async (invData, { rejectWithValue }) => {
    try {
      const res = await apiService.updateInvestigation(invData.complaint_id, invData);
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  complaints: [],
  total: 0,
  totalComplaints: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  selectedComplaint: null,
  metrics: null,
  filters: {
    search: '',
    status: '',
    severity: '',
    criticality: '',
    manufacturing_type: '',
    complaint_category: '',
  },
  isLoading: false,
  loading: false,
  isSaving: false,
  formSubmitting: false,
  formData: {},
  error: null,
};

export const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearSelectedComplaint: (state) => {
      state.selectedComplaint = null;
    },
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    resetForm: (state) => {
      state.formData = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // Metrics
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })
      // List
      .addCase(fetchComplaints.pending, (state) => {
        state.isLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        const items = action.payload.items || action.payload || [];
        state.items = items;
        state.complaints = items;
        state.total = action.payload.total || items.length;
        state.totalComplaints = action.payload.total || items.length;
        state.page = action.payload.page || state.page;
        state.limit = action.payload.limit || state.limit;
        state.totalPages = action.payload.total_pages || Math.ceil(state.total / state.limit) || 1;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.error = action.payload;
      })
      // Detail
      .addCase(fetchComplaintById.pending, (state) => {
        state.isLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.selectedComplaint = action.payload;
      })
      .addCase(fetchComplaintById.rejected, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createComplaint.pending, (state) => {
        state.isSaving = true;
        state.formSubmitting = true;
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.isSaving = false;
        state.formSubmitting = false;
        state.items.unshift(action.payload);
        state.complaints = state.items;
        state.total += 1;
        state.totalComplaints += 1;
        state.selectedComplaint = action.payload;
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.isSaving = false;
        state.formSubmitting = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateComplaint.fulfilled, (state, action) => {
        state.selectedComplaint = action.payload;
        const idx = state.items.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
          state.complaints = state.items;
        }
      })
      // Delete
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.complaints = state.items;
        state.total = Math.max(0, state.total - 1);
        state.totalComplaints = state.total;
        if (state.selectedComplaint?.id === action.payload) {
          state.selectedComplaint = null;
        }
      })
      // Transition Status
      .addCase(transitionStatus.fulfilled, (state, action) => {
        state.selectedComplaint = action.payload;
        const idx = state.items.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
          state.complaints = state.items;
        }
      });
  },
});

export const { 
  setFilters, 
  setFilter, 
  resetFilters, 
  setPage, 
  clearSelectedComplaint,
  updateFormField,
  resetForm
} = complaintsSlice.actions;

export default complaintsSlice.reducer;
