import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  PlusCircle,
  Activity,
  Users,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCaseStore } from '../store/useCaseStore';
import { NotificationBell } from './NotificationBell';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated, logout, demoLogin } = useAuthStore();
  const { activeCases } = useCaseStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const criticalCount = activeCases.filter((c) => c.severity === 'critical').length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      {/* Live Emergency Ticker Strip */}
      <div className="w-full bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-900/40 px-4 py-1 flex items-center justify-between text-xs font-medium text-slate-300">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex items-center gap-1.5 font-bold text-red-400 uppercase tracking-wider shrink-0">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            Live Network Dispatch
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="truncate text-slate-300">
            <strong className="text-white">{activeCases.length}</strong> Active Emergencies (
            <strong className="text-red-400">{criticalCount} Critical</strong>)
          </span>
        </div>

        {/* Quick Demo Selector */}
        <div className="relative shrink-0">
          <button
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-[11px] font-semibold"
          >
            ⚡ Quick Demo Login <ChevronDown className="w-3 h-3" />
          </button>

          {demoMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-lg bg-slate-900 border border-slate-800 shadow-xl py-1 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase">Switch Demo Account</div>
              <button
                onClick={() => {
                  demoLogin('admin');
                  setDemoMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Command Admin
              </button>
              <button
                onClick={() => {
                  demoLogin('responder');
                  setDemoMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" /> Paramedic Responder
              </button>
              <button
                onClick={() => {
                  demoLogin('hospital');
                  setDemoMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Trauma Hospital
              </button>
              <button
                onClick={() => {
                  demoLogin('citizen');
                  setDemoMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-amber-400" /> Citizen (John Doe)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Primary Navigation Bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('landing')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg shadow-red-900/50 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              CRISIS<span className="text-red-500">CONNECT</span>
            </span>
            <span className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              Emergency Response Network
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => handleNav('landing')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'landing' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => handleNav('report')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-900/40 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" /> Report Emergency
          </button>

          <button
            onClick={() => handleNav('map')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'map' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-400" /> Live Map
          </button>

          <button
            onClick={() => handleNav('nearby')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'nearby' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" /> Nearby Help
          </button>

          <button
            onClick={() => handleNav('responder')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'responder' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" /> Responder Portal
          </button>

          <button
            onClick={() => handleNav('admin')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'admin' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" /> Command Admin
          </button>
        </nav>

        {/* Right Menu / User Profile */}
        <div className="hidden md:flex items-center gap-3">
          <NotificationBell />

          {isAuthenticated && user && (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
              <button
                onClick={() => handleNav('profile')}
                className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 hover:border-slate-700 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-slate-700">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-none">{user.name}</div>
                  <div className="text-[10px] font-semibold text-slate-400 capitalize mt-0.5">
                    {user.role}
                  </div>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <NotificationBell />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => handleNav('report')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-900/50"
          >
            <PlusCircle className="w-5 h-5" /> Report Emergency
          </button>

          <button
            onClick={() => handleNav('landing')}
            className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
          >
            Overview
          </button>
          <button
            onClick={() => handleNav('map')}
            className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-emerald-400" /> Live Emergency Map
          </button>
          <button
            onClick={() => handleNav('nearby')}
            className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-amber-400" /> Nearby Hospitals & Stations
          </button>
          <button
            onClick={() => handleNav('responder')}
            className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-blue-400" /> Responder Portal
          </button>
          <button
            onClick={() => handleNav('admin')}
            className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded-lg flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" /> Command Admin
          </button>

          {isAuthenticated && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleNav('profile')}
                className="text-sm font-bold text-white flex items-center gap-2"
              >
                <User className="w-4 h-4" /> {user?.name}
              </button>
              <button onClick={logout} className="text-xs text-red-400 font-semibold">
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
