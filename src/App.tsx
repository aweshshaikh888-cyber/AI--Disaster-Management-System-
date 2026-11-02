import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { DroneMonitoringPage } from './pages/DroneMonitoringPage';
import { DisasterMapPage } from './pages/DisasterMapPage';
import { PriorityEnginePage } from './pages/PriorityEnginePage';
import { RescueTeamsPage } from './pages/RescueTeamsPage';
import { AlertsPage } from './pages/AlertsPage';
import { WeatherPage } from './pages/WeatherPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { IncidentReportingPage } from './pages/IncidentReportingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

// Operational Dashboard Layout
const OperationalLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-red-200">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Portal Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Operational Command Center Routes */}
          <Route element={<OperationalLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/map" element={<DisasterMapPage />} />
            <Route path="/incidents" element={<IncidentReportingPage />} />
            <Route path="/report-incident" element={<IncidentReportingPage />} />
            <Route path="/ai-analysis" element={<AIAnalysisPage />} />
            <Route path="/model-performance" element={<ModelPerformancePage />} />
            <Route path="/drone-monitoring" element={<DroneMonitoringPage />} />
            <Route path="/priority-engine" element={<PriorityEnginePage />} />
            <Route path="/rescue-teams" element={<RescueTeamsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/copilot" element={<AIAssistantPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/activity-logs" element={<ActivityLogsPage />} />
            <Route path="/admin-settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
