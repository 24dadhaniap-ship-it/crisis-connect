import React from 'react';

interface Props {
  value: number | string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  trend?: string;
  pulseColor?: string;
}

export const LiveCounter: React.FC<Props> = ({
  value,
  label,
  sublabel,
  icon,
  trend,
  pulseColor = 'bg-red-500',
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${pulseColor} animate-ping`} />
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              {label}
            </span>
          </div>
          <div className="mt-2 text-3xl font-black text-white tracking-tight">
            {value}
          </div>
          {sublabel && (
            <p className="mt-1 text-xs text-slate-400 font-medium">{sublabel}</p>
          )}
          {trend && (
            <span className="mt-2 inline-block rounded bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              {trend}
            </span>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-slate-800/80 p-3 text-slate-300 border border-slate-700/50">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
