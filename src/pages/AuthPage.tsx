import React, { useState } from 'react';
import { ShieldAlert, Mail, Lock, User, Phone, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Role } from '../types';

interface Props {
  onSuccess: () => void;
}

export const AuthPage: React.FC<Props> = ({ onSuccess }) => {
  const { login, register, demoLogin, isLoading, error } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('citizen');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (mode === 'login') {
      success = await login(email, password);
    } else {
      success = await register(name, email, password, role, phone);
    }

    if (success) {
      onSuccess();
    }
  };

  const handleDemo = async (demoRole: Role) => {
    const success = await demoLogin(demoRole);
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Logo Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl shadow-red-900/50 mb-3">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            CRISIS<span className="text-red-500">CONNECT</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Emergency Network Authentication Terminal
          </p>
        </div>

        {/* Auth Box */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setMode('login')}
              className={`py-2 rounded-lg transition-colors ${
                mode === 'login' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`py-2 rounded-lg transition-colors ${
                mode === 'register' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center justify-between gap-2">
              <span>{error}</span>
              {mode === 'login' ? (
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="underline text-red-400 font-bold shrink-0 hover:text-red-300"
                >
                  Create Account →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="underline text-red-400 font-bold shrink-0 hover:text-red-300"
                >
                  Sign In →
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Full Name
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="bg-transparent w-full text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  required
                  className="bg-transparent w-full text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Password
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-transparent w-full text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-bold"
                >
                  <option value="citizen">Citizen Reporter</option>
                  <option value="responder">Paramedic / First Responder</option>
                  <option value="hospital">Hospital Trauma Staff</option>
                  <option value="admin">Command Center Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-900/50 transition-all flex items-center justify-center gap-2"
            >
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {mode === 'login' ? 'Sign In to Network' : 'Create Account'}
            </button>
          </form>

          {/* Preset Demo Accounts */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="block text-[10px] font-bold text-slate-500 uppercase text-center">
              One-Click Demo Account Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-purple-900/60 text-purple-300 text-[11px] font-bold"
              >
                🛡️ Admin
              </button>

              <button
                type="button"
                onClick={() => handleDemo('responder')}
                className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-blue-900/60 text-blue-300 text-[11px] font-bold"
              >
                🚑 Responder
              </button>

              <button
                type="button"
                onClick={() => handleDemo('hospital')}
                className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-emerald-900/60 text-emerald-300 text-[11px] font-bold"
              >
                🏥 Hospital
              </button>

              <button
                type="button"
                onClick={() => handleDemo('citizen')}
                className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-amber-900/60 text-amber-300 text-[11px] font-bold"
              >
                👤 Citizen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
