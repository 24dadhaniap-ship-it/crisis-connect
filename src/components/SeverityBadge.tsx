import React from 'react';
import { Severity } from '../types';

interface Props {
  severity: Severity | string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<Props> = ({ severity, size = 'md' }) => {
  const norm = String(severity).toLowerCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold',
    lg: 'px-3 py-1.5 text-sm font-extrabold tracking-wide',
  }[size];

  switch (norm) {
    case 'critical':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-red-600 text-white shadow-sm shadow-red-900/50 uppercase ${sizeClasses}`}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          CRITICAL
        </span>
      );
    case 'high':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-orange-600 text-white shadow-sm shadow-orange-900/40 uppercase ${sizeClasses}`}
        >
          HIGH
        </span>
      );
    case 'medium':
      return (
        <span
          className={`inline-flex items-center rounded-full border border-amber-500/80 bg-amber-500/10 text-amber-400 font-semibold uppercase ${sizeClasses}`}
        >
          MEDIUM
        </span>
      );
    case 'low':
      return (
        <span
          className={`inline-flex items-center rounded-full border border-emerald-500/80 bg-emerald-500/10 text-emerald-400 font-semibold uppercase ${sizeClasses}`}
        >
          LOW
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-700 text-slate-300 uppercase ${sizeClasses}`}>
          {severity}
        </span>
      );
  }
};
