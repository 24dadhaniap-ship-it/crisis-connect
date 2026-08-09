import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  MapPin,
  Bot,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  Radio,
  Play,
  Activity,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { LiveCounter } from '../components/LiveCounter';
import { apiRequest } from '../lib/api';
import { AdminStats } from '../types';

interface Props {
  setActiveTab: (tab: string) => void;
  onTrackCase: (caseId: string) => void;
}

export const LandingPage: React.FC<Props> = ({ setActiveTab, onTrackCase }) => {
  const { activeCases, fetchActiveCases, resetAllCases } = useCaseStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [demoTriggering, setDemoTriggering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchActiveCases();
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    const res = await apiRequest<AdminStats>('/admin/stats');
    if (res.success && res.data) {
      setStats(res.data);
    }
  };

  const handleRunLiveDemo = async () => {
    setDemoTriggering(true);
    const res = await apiRequest('/admin/demo-trigger', { method: 'POST' });
    setDemoTriggering(false);
    if (res.success && res.data) {
      onTrackCase(res.data.caseId);
    }
  };

  const handleResetSystemData = async () => {
    setIsResetting(true);
    await resetAllCases();
    await fetchActiveCases();
    await fetchStats();
    setIsResetting(false);
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Animated Radial Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/80 border border-red-800/80 text-xs font-bold text-red-400 mb-6 shadow-lg shadow-red-950">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <Radio className="w-4 h-4 text-red-500" />
            24/7 AI-DRIVEN EMERGENCY COORDINATION NETWORK
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            One Emergency. <br />
            <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              One Connected Response.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CrisisConnect links victims, paramedics, fire departments, and command centers in real-time. Automated Gemini AI instant classification, live geospatial dispatch, and transparent incident tracking.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('report')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-900/50 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <PlusCircle className="w-5 h-5" /> Report Emergency Now
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <MapPin className="w-5 h-5 text-emerald-400" /> Open Live Map
            </button>
          </div>

          {/* Interactive Demo Simulator & Reset Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRunLiveDemo}
              disabled={demoTriggering}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800 text-xs font-bold transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5 text-purple-400" />
              {demoTriggering ? 'Simulating Emergency Incident...' : 'Trigger Live Demo Scenario (30s Lifecycle)'}
            </button>

            <button
              onClick={handleResetSystemData}
              disabled={isResetting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-all shadow-md"
              title="Reset active cases and metrics to 0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              {isResetting ? 'Resetting...' : 'Reset All Values to 0'}
            </button>
          </div>
        </div>
      </section>

      {/* Live Counter Stats Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LiveCounter
            value={stats?.activeCases ?? activeCases.length}
            label="Active Emergencies"
            sublabel="Live incident feeds"
            icon={<ShieldAlert className="w-6 h-6 text-red-500" />}
            pulseColor="bg-red-500"
          />

          <LiveCounter
            value={stats?.respondersOnline ?? 0}
            label="Responders Online"
            sublabel="Paramedics & Units Active"
            icon={<Users className="w-6 h-6 text-emerald-400" />}
            pulseColor="bg-emerald-500"
          />

          <LiveCounter
            value={stats?.resolvedToday ?? 0}
            label="Cases Resolved Today"
            sublabel="Successfully dispatched"
            icon={<Activity className="w-6 h-6 text-blue-400" />}
            pulseColor="bg-blue-500"
          />

          <LiveCounter
            value={`${stats?.avgResponseTimeMinutes ?? 0}m`}
            label="Avg Response Time"
            sublabel="Time from report to arrival"
            icon={<Clock className="w-6 h-6 text-amber-400" />}
            pulseColor="bg-amber-500"
          />
        </div>
      </section>

      {/* 3-Step Lifecycle Workflow */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">
            Automated Emergency Pipeline
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            How CrisisConnect Accelerates Rescues
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-red-950 text-red-400 flex items-center justify-center font-black text-lg mb-6 border border-red-800/80">
              01
            </div>
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-red-500" /> Instant GPS & Media Report
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Citizens submit crisis reports with precise GPS coordinates, severity selectors, photo uploads, and affected count. No login required for immediate submission.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center font-black text-lg mb-6 border border-purple-800/80">
              02
            </div>
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" /> Gemini AI Triage & Scoring
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Gemini 3.6 Flash analyzes description text and scene photos to score severity (Critical, High, Medium, Low), recommend units, and issue victim first-aid instructions.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center font-black text-lg mb-6 border border-blue-800/80">
              03
            </div>
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" /> Real-time Dispatch & Tracking
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Responders receive Socket.IO alerts, accept cases, and broadcast live GPS coordinates to victims with ETA countdowns and nearby hospital routing.
            </p>
          </div>
        </div>
      </section>

      {/* Active Incidents Showcase */}
      <section className="py-12 bg-slate-900/50 border-t border-b border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" /> Live Incident Stream
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time active emergency cases currently being coordinated across the network.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('map')}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              View Full Live Map <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {activeCases.length === 0 ? (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 text-center">
              <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-300">No Active Emergency Incidents</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                The emergency dispatch stream is clear. User-submitted emergency reports will appear here in real-time.
              </p>
              <button
                onClick={() => setActiveTab('report')}
                className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-all inline-flex items-center gap-2"
              >
                Report Emergency Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCases.slice(0, 3).map((c) => (
                <div
                  key={c.caseId}
                  onClick={() => onTrackCase(c.caseId)}
                  className="rounded-xl bg-slate-900 border border-slate-800 p-5 hover:border-slate-700 cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-red-400">{c.caseId}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        c.severity === 'critical'
                          ? 'bg-red-600 text-white'
                          : c.severity === 'high'
                          ? 'bg-orange-600 text-white'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white capitalize mb-1 group-hover:text-red-400 transition-colors">
                    {c.type.replace('_', ' ')}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-800/80">
                    <span className="truncate max-w-[180px]">{c.location.address || 'Mumbai, India'}</span>
                    <span className="font-semibold text-slate-300">Track →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
