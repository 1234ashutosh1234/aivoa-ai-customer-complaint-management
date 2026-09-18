import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ToastContainer from './components/common/ToastContainer';

import DashboardPage from './pages/DashboardPage';
import IntakePage from './pages/IntakePage';
import ComplaintFormPage from './pages/ComplaintFormPage';
import ComplaintHistoryPage from './pages/ComplaintHistoryPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      {/* Global Top Navbar */}
      <Navbar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-row">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/intake" element={<IntakePage />} />
            <Route path="/form" element={<ComplaintFormPage />} />
            <Route path="/complaints" element={<ComplaintHistoryPage />} />
            <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Notification Toasts */}
      <ToastContainer />
    </div>
  );
}
