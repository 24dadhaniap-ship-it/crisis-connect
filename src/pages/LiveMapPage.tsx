import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Filter,
  Flame,
  Activity,
  Search,
  ShieldAlert,
  Layers,
  List,
  Radio,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { LeafletMap } from '../components/map/LeafletMap';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { EmergencyType, Severity, CaseStatus, NearbyFacility } from '../types';
import { apiRequest } from '../lib/api';

interface Props {
  onTrackCase: (caseId: string) => void;
}

export const LiveMapPage: React.FC<Props> = ({ onTrackCase }) => {
  const { cases, fetchCases, filters, setFilters, setupSocketListeners } = useCaseStore();
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchCases();
    setupSocketListeners();
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    const res = await apiRequest<NearbyFacility[]>('/facilities/nearby');
    if (res.success && res.data) {
      setFacilities(res.data);
    }
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen flex flex-col">
      {/* Top Filter & Toolbar */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-3 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-950 text-red-400 border border-red-800">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black text-white leading-tight">
              Interactive Geospatial Emergency Network
            </h1>
            <p className="text-[11px] text-slate-400">
              Live location tracking for active crisis reports, trauma hospitals, and fire dispatchers.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ status: e.target.value as CaseStatus })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Dispatch</option>
            <option value="responding">En Route</option>
            <option value="arrived">On Scene</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filters.severity || ''}
            onChange={(e) => setFilters({ severity: e.target.value as Severity })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1.5 ${
              showHeatmap
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {showHeatmap ? 'Heatmap Density On' : 'Toggle Density Heatmap'}
          </button>

          <button
            onClick={() => fetchCases()}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Refresh Map Feeds"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map + Sidebar Container */}
      <div className="flex-1 relative flex overflow-hidden min-h-[600px]">
        {/* Main Map Canvas */}
        <div className="flex-1 relative">
          <LeafletMap
            cases={cases}
            facilities={facilities}
            center={[19.0760, 72.8777]}
            zoom={13}
            showHeatmap={showHeatmap}
            selectedCaseId={selectedCaseId}
            onMarkerClick={(caseId) => onTrackCase(caseId)}
            height="100%"
          />
        </div>

        {/* Floating Incident Drawer */}
        <div
          className={`w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-10 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0 top-0 bottom-0'
          }`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Active Incidents ({cases.length})
            </h3>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-xs text-slate-400 hover:text-white"
            >
              {sidebarOpen ? 'Hide' : 'Show'} List
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {cases.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching active incidents found on current filter.
              </div>
            ) : (
              cases.map((c) => (
                <div
                  key={c.caseId}
                  onClick={() => {
                    setSelectedCaseId(c.caseId);
                    onTrackCase(c.caseId);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedCaseId === c.caseId
                      ? 'bg-red-950/80 border-red-600 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-red-400">#{c.caseId}</span>
                    <SeverityBadge severity={c.severity} size="sm" />
                  </div>

                  <h4 className="text-xs font-bold text-white capitalize mb-1">
                    {c.type.replace('_', ' ')}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {c.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                    <StatusBadge status={c.status} />
                    <span>Track Incident →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
