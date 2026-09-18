import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  activeIntakeTab: 'text',
  toasts: [],
  confirmModal: {
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: false,
    actionType: null,
    payload: null,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setActiveIntakeTab: (state, action) => {
      state.activeIntakeTab = action.payload;
    },
    addToast: (state, action) => {
      const { type = 'info', message, duration = 4000 } = action.payload;
      const id = Date.now().toString();
      state.toasts.push({ id, type, message, duration });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    openConfirmModal: (state, action) => {
      state.confirmModal = {
        isOpen: true,
        title: action.payload.title || 'Confirm Action',
        message: action.payload.message || 'Are you sure you wish to proceed?',
        confirmText: action.payload.confirmText || 'Confirm',
        cancelText: action.payload.cancelText || 'Cancel',
        isDanger: action.payload.isDanger || false,
        actionType: action.payload.actionType || null,
        payload: action.payload.payload || null,
      };
    },
    closeConfirmModal: (state) => {
      state.confirmModal.isOpen = false;
      state.confirmModal.payload = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveIntakeTab,
  addToast,
  removeToast,
  openConfirmModal,
  closeConfirmModal,
} = uiSlice.actions;

export default uiSlice.reducer;
