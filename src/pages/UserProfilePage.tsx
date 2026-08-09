import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Shield, HeartPulse, AlertTriangle, Save, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const UserProfilePage: React.FC = () => {
  const { user, fetchMe, updateProfile, isLoading, demoLogin } = useAuthStore();

  const [name, setName] = useState(user?.name || 'John Doe');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [bloodType, setBloodType] = useState(user?.emergencyProfile?.bloodType || 'O+');
  const [allergies, setAllergies] = useState(user?.emergencyProfile?.allergies?.join(', ') || 'Penicillin');
  const [medicalConditions, setMedicalConditions] = useState(
    user?.emergencyProfile?.medicalConditions?.join(', ') || 'Asthma'
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    user?.emergencyProfile?.emergencyContacts?.[0]?.name || 'Jane Doe'
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    user?.emergencyProfile?.emergencyContacts?.[0]?.phone || '+91 98765 43211'
  );

  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) {
      fetchMe();
    }
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || 'John Doe');
      setPhone(user.phone || '+91 98765 43210');
      if (user.emergencyProfile) {
        setBloodType(user.emergencyProfile.bloodType || 'O+');
        setAllergies(user.emergencyProfile.allergies?.join(', ') || 'Penicillin');
        setMedicalConditions(user.emergencyProfile.medicalConditions?.join(', ') || 'Asthma');
        if (user.emergencyProfile.emergencyContacts?.[0]) {
          setEmergencyContactName(user.emergencyProfile.emergencyContacts[0].name || 'Jane Doe');
          setEmergencyContactPhone(user.emergencyProfile.emergencyContacts[0].phone || '+91 98765 43211');
        }
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({
      name,
      phone,
      emergencyProfile: {
        bloodType,
        allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
        medicalConditions: medicalConditions.split(',').map((s) => s.trim()).filter(Boolean),
        emergencyContacts: [{ name: emergencyContactName, phone: emergencyContactPhone }],
      },
    });

    if (success) {
      setSuccessMsg('Emergency Medical Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  if (!user) {
    return (
      <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-8 text-center">
        <p className="text-slate-400">Please sign in to manage your Emergency Medical Profile.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-2xl flex items-center justify-center border border-red-500 shadow-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user.name}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <Mail className="w-3.5 h-3.5" /> {user.email} • Role:{' '}
              <span className="font-bold text-white uppercase">{user.role}</span>
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Medical Identity Settings */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" /> Emergency Medical Profile Specs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Blood Type</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Known Allergies (comma separated)</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Medical Conditions & Chronic Illnesses</label>
              <input
                type="text"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" /> Primary Emergency Contact Person
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-900/50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Emergency Medical Identifier Profile
          </button>
        </form>
      </div>
    </div>
  );
};
