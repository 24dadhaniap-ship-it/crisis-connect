import React from 'react';
import { CaseStatus } from '../types';

interface Props {
  status: CaseStatus | string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const norm = String(status).toLowerCase();

  switch (norm) {
    case 'reported':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          Reported
        </span>
      );
    case 'ai_processing':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          AI Processing
        </span>
      );
    case 'active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/80">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          Active
        </span>
      );
    case 'assigned':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
          Responder Assigned
        </span>
      );
    case 'responding':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950/90 text-amber-300 border border-amber-700 animate-pulse">
          ⚡ En Route
        </span>
      );
    case 'arrived':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800">
          On Scene
        </span>
      );
    case 'resolved':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
          ✓ Resolved
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-950/50 text-rose-400 border border-rose-900/50">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
          {status}
        </span>
      );
  }
};
