import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Activity,
  Users,
  Clock,
  Download,
  Play,
  Search,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  Building2,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuthStore } from '../store/useAuthStore';
import { useCaseStore } from '../store/useCaseStore';
import { AdminStats, EmergencyCase, User, CaseStatus } from '../types';
import { apiRequest } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';

interface Props {
  onTrackCase: (caseId: string) => void;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export const AdminDashboardPage: React.FC<Props> = ({ onTrackCase }) => {
  const { demoLogin } = useAuthStore();
  const { cases, fetchCases, updateCaseStatus, resetAllCases } = useCaseStore();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [responders, setResponders] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [demoRunning, setDemoRunning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchCases();
    fetchStats();
    fetchResponders();
  }, []);

  const fetchStats = async () => {
    const res = await apiRequest<AdminStats>('/admin/stats');
    if (res.success && res.data) {
      setStats(res.data);
    }
  };

  const fetchResponders = async () => {
    const res = await apiRequest<User[]>('/responders');
    if (res.success && res.data) {
      setResponders(res.data);
    }
  };

  const handleRunDemo = async () => {
    setDemoRunning(true);
    const res = await apiRequest('/admin/demo-trigger', { method: 'POST' });
    setDemoRunning(false);
    if (res.success && res.data) {
      fetchCases();
      onTrackCase(res.data.caseId);
    }
  };

  const handleResetSystemData = async () => {
    setIsResetting(true);
    await resetAllCases();
    await fetchCases();
    await fetchStats();
    setIsResetting(false);
  };

  const handleAssignResponder = async (caseId: string, responderId: string) => {
    const responderObj = responders.find((r) => r._id === responderId);
    if (!responderObj) return;

    await apiRequest(`/cases/${caseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'assigned',
        note: `Manual Command Admin assignment to ${responderObj.name}`,
      }),
    });
    fetchCases();
  };

  // Prepare chart data
  const chartDataByType = stats
    ? Object.entries(stats.casesByType).map(([type, count]) => ({
        name: type.replace('_', ' ').toUpperCase(),
        count,
      }))
    : [];

  const chartDataBySeverity = [
    { name: 'Critical', value: cases.filter((c) => c.severity === 'critical').length },
    { name: 'High', value: cases.filter((c) => c.severity === 'high').length },
    { name: 'Medium', value: cases.filter((c) => c.severity === 'medium').length },
    { name: 'Low', value: cases.filter((c) => c.severity === 'low').length },
  ];

  const filteredCases = cases.filter(
    (c) =>
      c.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Crisis Command & Control Analytics</h1>
              <p className="text-xs text-slate-400">
                Citywide emergency overview, Gemini AI severity metrics, and responder unit dispatch dispatching.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunDemo}
              disabled={demoRunning}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/50 flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4" />
              {demoRunning ? 'Running Demo...' : 'Trigger Live Demo Scenario'}
            </button>

            <button
              onClick={handleResetSystemData}
              disabled={isResetting}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/50 flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              {isResetting ? 'Resetting...' : 'Reset System Data to 0'}
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Incidents Logged</span>
            <div className="text-3xl font-black text-white mt-1">{stats?.totalCases ?? cases.length}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Dispatches</span>
            <div className="text-3xl font-black text-red-500 mt-1">{stats?.activeCases ?? 0}</div>
            <p className="text-[11px] text-red-400 mt-1">🚨 High Priority</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase">Responders Online</span>
            <div className="text-3xl font-black text-blue-400 mt-1">{stats?.respondersOnline ?? responders.length}</div>
            <p className="text-[11px] text-blue-400 mt-1">🚑 Active Units</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase">Avg Response Time</span>
            <div className="text-3xl font-black text-amber-400 mt-1">{stats?.avgResponseTimeMinutes ? `${stats.avgResponseTimeMinutes}m` : '0m'}</div>
            <p className="text-[11px] text-amber-400 mt-1">⏱️ Dispatch to Arrival</p>
          </div>
        </div>

        {/* Recharts Data Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Incidents by Type Bar Chart */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" /> Emergency Breakdown by Incident Category
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataByType}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Severity Distribution Pie Chart */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-red-400" /> Severity Level Breakdown
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataBySeverity}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {chartDataBySeverity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Master Emergency Incidents Management Table */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" /> All Network Incident Records
              </h3>
              <p className="text-xs text-slate-400">Search, filter, and manually reassign units.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search case ID or type..."
                  className="bg-transparent text-xs text-white focus:outline-none w-40"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Case ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3">Assigned Unit</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                {filteredCases.map((c) => (
                  <tr key={c.caseId} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-red-400">#{c.caseId}</td>
                    <td className="p-3 capitalize font-semibold text-white">{c.type.replace('_', ' ')}</td>
                    <td className="p-3">
                      <SeverityBadge severity={c.severity} size="sm" />
                    </td>
                    <td className="p-3">
                      <select
                        value={c.status}
                        onChange={(e) => updateCaseStatus(c.caseId, e.target.value as CaseStatus)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-white font-semibold focus:outline-none focus:border-red-500"
                      >
                        <option value="reported">Reported</option>
                        <option value="ai_processing">AI Analyzed</option>
                        <option value="active">Active Dispatch</option>
                        <option value="assigned">Assigned</option>
                        <option value="responding">En Route</option>
                        <option value="arrived">On Scene</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="p-3 text-slate-300">{c.reporterName}</td>
                    <td className="p-3">
                      {c.assignedResponderName ? (
                        <span className="font-bold text-blue-400">🚑 {c.assignedResponderName}</span>
                      ) : (
                        <select
                          onChange={(e) => handleAssignResponder(c.caseId, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-amber-400"
                        >
                          <option value="">+ Assign Unit</option>
                          {responders.map((r) => (
                            <option key={r._id} value={r._id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onTrackCase(c.caseId)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px]"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
