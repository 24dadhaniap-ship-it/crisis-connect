import React from 'react';
import { ShieldAlert, Phone, Heart, Globe, Radio } from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<Props> = ({ setActiveTab }) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Column 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-600 text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-white tracking-tight">
              CRISIS<span className="text-red-500">CONNECT</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Production-quality real-time emergency coordination platform with Gemini AI incident classification and live dispatch tracking.
          </p>
          <div className="text-[11px] font-mono text-red-400 font-bold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> "One emergency. One connected response."
          </div>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Emergency Hotlines
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2 text-red-400 font-bold">
              <Phone className="w-3.5 h-3.5" /> National Emergency Helpline (India): 112 / 108
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-blue-400" /> Police Helpline: 100 / 112
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-purple-400" /> Medical Ambulance & Trauma: 108 / 102
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Disaster Management Control Room: 1070 / 1078
            </li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Platform Modules
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setActiveTab('report')} className="hover:text-white transition-colors">
                Report Emergency Incident
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('map')} className="hover:text-white transition-colors">
                Interactive Live Emergency Map
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('nearby')} className="hover:text-white transition-colors">
                Find Nearby Hospitals & Stations
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('responder')} className="hover:text-white transition-colors">
                Community Responder Portal
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('admin')} className="hover:text-white transition-colors">
                Command Center & Analytics
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4 */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            System Capabilities
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Powered by Gemini 3.6 Flash AI classification, Socket.IO real-time pub/sub, Leaflet OpenStreetMap layer, and public emergency medical QR alerts.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Globe className="w-3.5 h-3.5" /> High Availability Network Active
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 CrisisConnect Platform. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Emergency Preparedness & Community Safety.
        </p>
      </div>
    </footer>
  );
};
