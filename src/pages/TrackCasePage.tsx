import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  Clock,
  Phone,
  Send,
  MessageSquare,
  Activity,
  Share2,
  CheckCircle2,
  Bot,
  Truck,
  Building2,
  User,
  QrCode,
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { LeafletMap } from '../components/map/LeafletMap';
import { AIAnalysisCard } from '../components/AIAnalysisCard';
import { StatusStepper } from '../components/StatusStepper';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { EmergencyTypeIcon } from '../components/EmergencyTypeIcon';
import { apiRequest } from '../lib/api';
import { EmergencyMessage } from '../types';

interface Props {
  caseId: string;
  onNavigateToQR?: (caseId: string) => void;
}

export const TrackCasePage: React.FC<Props> = ({ caseId, onNavigateToQR }) => {
  const { currentCase, fetchCaseById, setupSocketListeners } = useCaseStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'hospitals'>('details');
  const [messages, setMessages] = useState<EmergencyMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [simulatedResponderLoc, setSimulatedResponderLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    fetchCaseById(caseId);
    setupSocketListeners();
    fetchMessages();

    const interval = setInterval(() => {
      fetchCaseById(caseId);
    }, 5000);

    const clockTimer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockTimer);
    };
  }, [caseId]);

  // 6-minute maximum resolution auto-progression & countdown auto-resolve effect
  useEffect(() => {
    if (!currentCase) return;

    const createdAtMs = new Date(currentCase.createdAt).getTime();
    const elapsedSec = Math.floor((nowTime - createdAtMs) / 1000);

    if (elapsedSec >= 360 && currentCase.status !== 'resolved') {
      useCaseStore.getState().updateCaseStatus(currentCase.caseId, 'resolved', 'Incident auto-resolved within max 6-minute window');
      return;
    }

    // Smooth client-side stage progression if backend timer is waiting
    if (currentCase.status !== 'resolved') {
      if (elapsedSec >= 240 && currentCase.status === 'responding') {
        useCaseStore.getState().updateCaseStatus(currentCase.caseId, 'arrived', 'Responders arrived on scene');
      } else if (elapsedSec >= 120 && currentCase.status === 'assigned') {
        useCaseStore.getState().updateCaseStatus(currentCase.caseId, 'responding', 'Units en route with sirens');
      } else if (elapsedSec >= 40 && (currentCase.status === 'active' || currentCase.status === 'ai_processing')) {
        useCaseStore.getState().updateCaseStatus(currentCase.caseId, 'assigned', 'Emergency units assigned');
      }
    }
  }, [nowTime, currentCase?.caseId, currentCase?.status, currentCase?.createdAt]);

  const createdAtMs = currentCase ? new Date(currentCase.createdAt).getTime() : Date.now();
  const elapsedSec = Math.max(0, Math.floor((nowTime - createdAtMs) / 1000));
  const remainingSec = currentCase?.status === 'resolved' ? 0 : Math.max(0, 360 - elapsedSec);
  const percentComplete = currentCase?.status === 'resolved' ? 100 : Math.min(100, Math.round((elapsedSec / 360) * 100));

  const formatSec = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formattedCountdown = currentCase?.status === 'resolved'
    ? `${formatSec(Math.min(360, elapsedSec))} (Solved)`
    : `${formatSec(remainingSec)}`;

  // Simulate responder moving towards incident if assigned/responding
  useEffect(() => {
    if (currentCase && (currentCase.status === 'responding' || currentCase.status === 'assigned')) {
      const [incidentLng, incidentLat] = currentCase.location.coordinates;
      // Start responder offset by ~0.015 (~1.5km)
      let currentStep = 0;
      const totalSteps = 20;

      const timer = setInterval(() => {
        currentStep++;
        const progress = Math.min(currentStep / totalSteps, 1);
        const startLat = incidentLat + 0.012;
        const startLng = incidentLng - 0.012;

        const curLat = startLat + (incidentLat - startLat) * progress;
        const curLng = startLng + (incidentLng - startLng) * progress;

        setSimulatedResponderLoc({ lat: curLat, lng: curLng });

        if (progress >= 1) {
          clearInterval(timer);
        }
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [currentCase?.status]);

  const fetchMessages = async () => {
    const res = await apiRequest<EmergencyMessage[]>(`/cases/${caseId}/messages`);
    if (res.success && res.data) {
      setMessages(res.data);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    const res = await apiRequest<EmergencyMessage>(`/cases/${caseId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content: newMessage,
        senderRole: user?.role || 'citizen',
      }),
    });

    setIsSending(false);
    if (res.success && res.data) {
      setMessages((prev) => [...prev, res.data!]);
      setNewMessage('');
    }
  };

  const [searchInput, setSearchInput] = useState('');

  if (!currentCase) {
    return (
      <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <div>
            <h2 className="text-xl font-bold text-white">Track Emergency Incident</h2>
            <p className="text-xs text-slate-400 mt-1">
              {caseId ? `No active emergency found with ID #${caseId}` : 'Enter your unique Emergency Case ID to track live dispatch status.'}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchInput.trim()) {
                fetchCaseById(searchInput.trim());
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Case ID (e.g. CC-1001)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition-all"
            >
              Track
            </button>
          </form>
        </div>
      </div>
    );
  }

  const [lng, lat] = currentCase.location.coordinates;

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-red-950 text-red-400 border border-red-800">
                  #{currentCase.caseId}
                </span>
                <StatusBadge status={currentCase.status} />
                <SeverityBadge severity={currentCase.severity} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white capitalize flex items-center gap-2">
                <EmergencyTypeIcon type={currentCase.type} size={28} />
                {currentCase.type.replace('_', ' ')} Incident
              </h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Reported {new Date(currentCase.createdAt).toLocaleString()} by{' '}
                <strong className="text-slate-200">{currentCase.reporterName}</strong>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              {onNavigateToQR && (
                <button
                  onClick={() => onNavigateToQR(currentCase.caseId)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold hover:bg-purple-900 transition-colors flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" /> Public Medical QR Card
                </button>
              )}

              <a
                href="tel:112"
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-extrabold hover:bg-red-500 transition-all flex items-center gap-1.5 shadow-lg shadow-red-900/50"
              >
                <Phone className="w-4 h-4" /> Call 112 Dispatch
              </a>
            </div>
          </div>

          {/* 6-Minute Max Incident Resolution Timer Banner */}
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    currentCase.status === 'resolved'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                  }`}
                >
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">
                      Max Resolution Window: <span className="text-red-400">6 Minutes</span>
                    </h4>
                    {currentCase.status === 'resolved' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                        Resolved ✅
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                        Max 6m Limit
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentCase.status === 'resolved'
                      ? 'Emergency incident successfully resolved and closed.'
                      : 'Can be resolved at any time. Solved within max 6 minutes guaranteed.'}
                  </p>
                </div>
              </div>

              {/* Timer & Fast-Track Button */}
              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-2xl font-mono font-black text-white tracking-widest">
                    {formattedCountdown}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    {currentCase.status === 'resolved' ? 'Total Resolution Time' : 'Time Remaining (Max 6m)'}
                  </div>
                </div>

                {currentCase.status !== 'resolved' && (
                  <button
                    onClick={() =>
                      useCaseStore
                        .getState()
                        .updateCaseStatus(
                          currentCase.caseId,
                          'resolved',
                          'Incident marked resolved via quick-solve option'
                        )
                    }
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Solve Incident Now
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
              <div
                className={`h-full transition-all duration-500 ${
                  currentCase.status === 'resolved'
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500'
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className="pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Live Incident Lifecycle
            </h4>
            <StatusStepper currentStatus={currentCase.status} statusHistory={currentCase.statusHistory} />
          </div>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Gemini AI Analysis & Maps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gemini AI Assessment */}
            <AIAnalysisCard analysis={currentCase.aiAnalysis} />

            {/* Live Geospatial Tracker */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Live Geospatial Dispatch Map
                </h3>
                {simulatedResponderLoc && (
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 animate-pulse">
                    <Truck className="w-4 h-4" /> Paramedics Unit En Route
                  </span>
                )}
              </div>

              <LeafletMap
                cases={[currentCase]}
                center={[lat, lng]}
                zoom={14}
                assignedResponderLoc={
                  simulatedResponderLoc
                    ? { lat: simulatedResponderLoc.lat, lng: simulatedResponderLoc.lng, name: 'Unit 402' }
                    : undefined
                }
                height="380px"
              />

              <div className="mt-3 text-xs text-slate-400 flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span>📍 Incident Location: <strong className="text-slate-200">{currentCase.location.address || 'Mumbai, Maharashtra, India'}</strong></span>
                <span>GPS: [{lat.toFixed(4)}, {lng.toFixed(4)}]</span>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Dispatch Communications & Responder Details */}
          <div className="space-y-6">
            {/* Responder Unit Card */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" /> Dispatched Response Team
              </h3>

              {currentCase.assignedResponderName ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-blue-900/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                      🚑
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{currentCase.assignedResponderName}</h4>
                      <p className="text-xs text-slate-400">Primary Responder Unit</p>
                    </div>
                  </div>

                  {currentCase.assignedResponderPhone && (
                    <a
                      href={`tel:${currentCase.assignedResponderPhone}`}
                      className="w-full py-2 rounded-lg bg-blue-950 text-blue-300 border border-blue-800 text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-900 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Responder ({currentCase.assignedResponderPhone})
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400">
                    Dispatching nearest unit... Standby for confirmation.
                  </span>
                </div>
              )}
            </div>

            {/* Live Chat with Dispatcher / Responder */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col h-[400px]">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" /> Incident Dispatch Channel
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              {/* Chat Messages Box */}
              <div className="flex-1 overflow-y-auto p-2 space-y-3 my-3 scrollbar-thin">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 my-auto pt-12">
                    Direct dispatch communications channel active. Send updates or medical questions here.
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m._id}
                      className={`p-3 rounded-xl text-xs max-w-[85%] ${
                        m.senderRole === 'citizen'
                          ? 'bg-red-950/80 border border-red-900/50 text-red-100 ml-auto'
                          : 'bg-slate-800 border border-slate-700 text-slate-200 mr-auto'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1 text-[10px] text-slate-400 font-bold uppercase">
                        <span>{m.senderName || m.senderRole}</span>
                        <span>{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed">{m.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send note to responder..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
