import React from 'react';
import { Bot, CheckSquare, ShieldAlert, Sparkles, Clock, Cpu } from 'lucide-react';
import { AIAnalysis } from '../types';
import { SeverityBadge } from './SeverityBadge';

interface Props {
  analysis?: AIAnalysis;
}

export const AIAnalysisCard: React.FC<Props> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="rounded-xl bg-slate-900/90 border border-purple-900/40 p-6 text-center animate-pulse">
        <div className="flex items-center justify-center gap-2 text-purple-400 font-semibold mb-2">
          <Bot className="w-5 h-5 animate-spin" />
          <span>Gemini AI Analyzing Emergency...</span>
        </div>
        <p className="text-xs text-slate-400">
          Scoring severity level, identifying required units, and compiling survival steps.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-purple-900/60 p-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/60">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Gemini AI Incident Assessment
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                {analysis.model || 'gemini-3.6-flash'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Automated Severity Scoring & Action Plan ({Math.round(analysis.confidence * 100)}% confidence)
            </p>
          </div>
        </div>

        <SeverityBadge severity={analysis.severity} size="md" />
      </div>

      {/* Summary */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Structured Incident Summary
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-800">
          {analysis.summary}
        </p>
      </div>

      {/* Immediate Actions Checklist */}
      {analysis.immediateActions && analysis.immediateActions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4" /> Immediate Survival & Safety Actions
          </h4>
          <ul className="space-y-2">
            {analysis.immediateActions.map((action, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-300 bg-emerald-950/20 border border-emerald-900/40 p-2.5 rounded-lg"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-900/60 text-emerald-300 font-bold text-[11px] flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="leading-snug">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dispatched Resources */}
      {analysis.resourcesNeeded && analysis.resourcesNeeded.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Dispatched Emergency Units
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.resourcesNeeded.map((res, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-amber-300 border border-slate-700 capitalize"
              >
                🚨 {res.replace('_', ' ')}
              </span>
            ))}
            {analysis.estimatedResponseTime && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Est. ETA: ~{analysis.estimatedResponseTime} mins
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
