import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ReportEmergencyPage } from './pages/ReportEmergencyPage';
import { TrackCasePage } from './pages/TrackCasePage';
import { LiveMapPage } from './pages/LiveMapPage';
import { ResponderDashboardPage } from './pages/ResponderDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NearbyHelpPage } from './pages/NearbyHelpPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AuthPage } from './pages/AuthPage';
import { PublicQRPage } from './pages/PublicQRPage';
import { useAuthStore } from './store/useAuthStore';
import { useCaseStore } from './store/useCaseStore';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  const { fetchMe } = useAuthStore();
  const { setupSocketListeners, fetchActiveCases } = useCaseStore();

  useEffect(() => {
    fetchMe();
    fetchActiveCases();
    setupSocketListeners();
  }, []);

  const handleTrackCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('track');
  };

  const handleNavigateToQR = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('public-qr');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage setActiveTab={setActiveTab} onTrackCase={handleTrackCase} />
        )}

        {activeTab === 'report' && (
          <ReportEmergencyPage onCaseCreated={(newCaseId) => handleTrackCase(newCaseId)} />
        )}

        {activeTab === 'track' && (
          <TrackCasePage caseId={selectedCaseId} onNavigateToQR={handleNavigateToQR} />
        )}

        {activeTab === 'map' && <LiveMapPage onTrackCase={handleTrackCase} />}

        {activeTab === 'responder' && <ResponderDashboardPage onTrackCase={handleTrackCase} />}

        {activeTab === 'admin' && <AdminDashboardPage onTrackCase={handleTrackCase} />}

        {activeTab === 'nearby' && <NearbyHelpPage />}

        {activeTab === 'profile' && <UserProfilePage />}

        {activeTab === 'auth' && <AuthPage onSuccess={() => setActiveTab('landing')} />}

        {activeTab === 'public-qr' && <PublicQRPage caseId={selectedCaseId} />}
      </main>

      {/* Bottom Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
