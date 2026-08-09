import React, { useEffect, useState } from 'react';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Bot,
  MapPin,
  AlertTriangle,
  Play,
  Activity,
  Send,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCaseStore } from '../store/useCaseStore';
import { EmergencyCase, CaseStatus } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { LeafletMap } from '../components/map/LeafletMap';
import { AIAnalysisCard } from '../components/AIAnalysisCard';
import { apiRequest } from '../lib/api';

interface Props {
  onTrackCase: (caseId: string) => void;
}

export const ResponderDashboardPage: React.FC<Props> = ({ onTrackCase }) => {
  const { user, demoLogin } = useAuthStore();
  const { cases, fetchCases, acceptCase, updateCaseStatus, setupSocketListeners } = useCaseStore();
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCases();
    setupSocketListeners();
  }, []);

  const activeUnassigned = cases.filter((c) => c.status === 'active' || c.status === 'reported');
  const myAssignedCases = cases.filter(
    (c) => c.assignedResponderId === user?._id || c.assignedResponderName === user?.name
  );

  const handleAccept = async (caseId: string) => {
    const success = await acceptCase(caseId);
    if (success) {
      fetchCases();
    }
  };

  const handleUpdateStatus = async (status: CaseStatus) => {
    if (!selectedCase) return;
    setIsUpdating(true);
    const success = await updateCaseStatus(selectedCase.caseId, status, statusNote);
    setIsUpdating(false);
    if (success) {
      setStatusNote('');
      fetchCases();
    }
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Role Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                Emergency Responder Mobile Terminal
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-bold uppercase">
                  {user?.responderProfile?.unitType || 'Paramedic Unit 402'}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-white">{user?.name || 'Marcus Vance'}</strong> ({user?.role || 'responder'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => demoLogin('responder')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/50 flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" /> Demo Paramedic Login
            </button>
          </div>
        </div>

        {/* Dashboard Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (1 Col): Unassigned Calls & My Active Assignments */}
          <div className="space-y-6">
            {/* My Active Dispatch Cases */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" /> My Active Dispatches ({myAssignedCases.length})
              </h3>

              {myAssignedCases.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800/80">
                  You currently have no active assigned incidents. Accept a call below to begin response.
                </div>
              ) : (
                <div className="space-y-3">
                  {myAssignedCases.map((c) => (
                    <div
                      key={c.caseId}
                      onClick={() => setSelectedCase(c)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedCase?.caseId === c.caseId
                          ? 'bg-blue-950/80 border-blue-500 shadow-lg ring-1 ring-blue-500'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-blue-400">#{c.caseId}</span>
                        <StatusBadge status={c.status} />
                      </div>

                      <h4 className="text-sm font-bold text-white capitalize mb-1">
                        {c.type.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">{c.description}</p>

                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-900">
                        <span>📍 {c.location.address || 'Mumbai'}</span>
                        <SeverityBadge severity={c.severity} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unassigned Emergency Calls */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Open Unassigned Emergency Calls ({activeUnassigned.length})
              </h3>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {activeUnassigned.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No unassigned emergency calls on the network right now.
                  </div>
                ) : (
                  activeUnassigned.map((c) => (
                    <div
                      key={c.caseId}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-red-400">#{c.caseId}</span>
                        <SeverityBadge severity={c.severity} size="sm" />
                      </div>

                      <h4 className="text-xs font-bold text-white capitalize">{c.type.replace('_', ' ')}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setSelectedCase(c)}
                          className="text-xs text-slate-300 underline font-semibold"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() => handleAccept(c.caseId)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md"
                        >
                          ⚡ Accept Call & En Route
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column (2 Cols): Active Incident Terminal Controls */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCase ? (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
                {/* Status Command Controls Bar */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Selected Incident</span>
                    <h3 className="text-base font-black text-white capitalize flex items-center gap-2">
                      #{selectedCase.caseId} - {selectedCase.type.replace('_', ' ')}
                    </h3>
                  </div>

                  {/* Dispatch Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus('assigned')}
                      disabled={isUpdating}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        selectedCase.status === 'assigned'
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      🛡️ Assigned
                    </button>

                    <button
                      onClick={() => handleUpdateStatus('responding')}
                      disabled={isUpdating}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        selectedCase.status === 'responding'
                          ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ⚡ En Route
                    </button>

                    <button
                      onClick={() => handleUpdateStatus('arrived')}
                      disabled={isUpdating}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        selectedCase.status === 'arrived'
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      📍 On Scene
                    </button>

                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      disabled={isUpdating}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        selectedCase.status === 'resolved'
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ✓ Resolved
                    </button>
                  </div>
                </div>

                {/* Status Update Note Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add dispatch log note (e.g. Paramedic on scene, patient stabilized)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Gemini AI Tactical Triage */}
                <AIAnalysisCard analysis={selectedCase.aiAnalysis} />

                {/* Navigation Map */}
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <LeafletMap
                    cases={[selectedCase]}
                    center={[
                      selectedCase.location.coordinates[1],
                      selectedCase.location.coordinates[0],
                    ]}
                    zoom={14}
                    height="320px"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-500">
                <Truck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-base font-bold text-white mb-1">No Case Selected</h3>
                <p className="text-xs max-w-sm mx-auto">
                  Select an active incident call from the left menu to view AI tactical instructions, change status, and navigate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
