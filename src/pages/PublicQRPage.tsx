import React, { useEffect } from 'react';
import {
  ShieldAlert,
  HeartPulse,
  Phone,
  User,
  AlertTriangle,
  QrCode,
  Printer,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  caseId: string;
}

export const PublicQRPage: React.FC<Props> = ({ caseId }) => {
  const { currentCase, fetchCaseById } = useCaseStore();

  useEffect(() => {
    fetchCaseById(caseId);
  }, [caseId]);

  if (!currentCase) {
    return (
      <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-8 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Printable Card */}
        <div className="rounded-3xl bg-slate-900 border-2 border-red-600 p-8 shadow-2xl space-y-6 print:bg-white print:text-black">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-600 text-white">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  CRISIS<span className="text-red-500">CONNECT</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono font-bold">
                  PUBLIC EMERGENCY MEDICAL IDENTIFIER
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-red-400 block">
                #{currentCase.caseId}
              </span>
              <SeverityBadge severity={currentCase.severity} size="sm" />
            </div>
          </div>

          {/* Incident Overview */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white capitalize">
                Emergency Type: {currentCase.type.replace('_', ' ')}
              </span>
              <StatusBadge status={currentCase.status} />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{currentCase.description}</p>
          </div>

          {/* Victim Medical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Blood Type
              </span>
              <span className="text-lg font-black text-rose-400">O Positive (O+)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Known Allergies
              </span>
              <span className="text-xs font-bold text-amber-300">Penicillin, Latex</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Pre-existing Conditions
              </span>
              <span className="text-xs font-bold text-slate-200">Asthma</span>
            </div>
          </div>

          {/* Emergency Callback Contact */}
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-900/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-red-300 uppercase block">
                Primary Emergency Callback Contact
              </span>
              <h4 className="text-sm font-bold text-white">{currentCase.reporterName}</h4>
            </div>

            <a
              href={`tel:${currentCase.reporterPhone}`}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> {currentCase.reporterPhone || 'Call Contact'}
            </a>
          </div>

          {/* QR Visual Canvas */}
          <div className="p-6 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center text-center space-y-3">
            <QrCode className="w-32 h-32 text-slate-900" />
            <span className="text-xs font-mono font-bold text-slate-600">
              SCAN TO VERIFY LIVE INCIDENT STATUS ON CRISISCONNECT
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handlePrint}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700"
          >
            <Printer className="w-4 h-4 text-purple-400" /> Print Emergency Medical Card
          </button>
        </div>
      </div>
    </div>
  );
};
