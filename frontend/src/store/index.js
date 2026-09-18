import { configureStore } from '@reduxjs/toolkit';
import complaintsReducer from './slices/complaintsSlice';
import aiCopilotReducer from './slices/aiCopilotSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    complaints: complaintsReducer,
    aiCopilot: aiCopilotReducer,
    ui: uiReducer,
  },
});

export default store;
