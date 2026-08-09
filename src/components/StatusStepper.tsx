import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Truck, MapPin, CheckCheck, Bot } from 'lucide-react';
import { CaseStatus, StatusHistoryItem } from '../types';

interface Props {
  currentStatus: CaseStatus | string;
  statusHistory?: StatusHistoryItem[];
}

const STEPS = [
  { key: 'reported', label: 'Reported', icon: Clock },
  { key: 'ai_processing', label: 'AI Analyzed', icon: Bot },
  { key: 'active', label: 'Active Dispatch', icon: ShieldCheck },
  { key: 'assigned', label: 'Assigned', icon: ShieldCheck },
  { key: 'responding', label: 'En Route', icon: Truck },
  { key: 'arrived', label: 'On Scene', icon: MapPin },
  { key: 'resolved', label: 'Resolved', icon: CheckCheck },
];

export const StatusStepper: React.FC<Props> = ({ currentStatus, statusHistory = [] }) => {
  const normCurrent = String(currentStatus).toLowerCase();

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'reported': return 0;
      case 'ai_processing': return 1;
      case 'active': return 2;
      case 'assigned': return 3;
      case 'responding': return 4;
      case 'arrived': return 5;
      case 'resolved': return 6;
      default: return 0;
    }
  };

  const currentIdx = getStepIndex(normCurrent);

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center justify-between min-w-[650px] px-2">
        {STEPS.map((step, idx) => {
          const isPassed = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const StepIcon = step.icon;

          const historyMatch = statusHistory.find((h) => h.status === step.key);

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center group relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCurrent
                      ? 'bg-red-600 text-white ring-4 ring-red-900/50 scale-110 shadow-lg shadow-red-900/80 animate-pulse'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>

                <span
                  className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                    isCurrent
                      ? 'text-red-400 font-bold'
                      : isPassed
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>

                {historyMatch?.changedAt && (
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(historyMatch.changedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-colors duration-300 ${
                    idx < currentIdx ? 'bg-emerald-600' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
