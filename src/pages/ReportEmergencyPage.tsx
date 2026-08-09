import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  MapPin,
  Camera,
  Send,
  PhoneCall,
  User,
  Phone,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { EmergencyType, Severity } from '../types';
import { useCaseStore } from '../store/useCaseStore';
import { LeafletMap } from '../components/map/LeafletMap';

interface Props {
  onCaseCreated: (caseId: string) => void;
}

export const ReportEmergencyPage: React.FC<Props> = ({ onCaseCreated }) => {
  const { createCase, isLoading } = useCaseStore();

  const [type, setType] = useState<EmergencyType>('medical_emergency');
  const [severity, setSeverity] = useState<Severity>('high');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [lat, setLat] = useState(19.0760);
  const [lng, setLng] = useState(72.8777);
  const [address, setAddress] = useState('Mumbai, Maharashtra, India');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [locating, setLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-get current location on load
  useEffect(() => {
    handleGetCurrentLocation();
  }, []);

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setAddress(`GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setLocating(false);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please provide a brief description of the incident.');
      return;
    }

    setErrorMessage('');

    const newCase = await createCase({
      type,
      severity,
      description,
      location: {
        coordinates: [lng, lat],
        address,
      },
      reporterName: reporterName || 'Anonymous Citizen',
      reporterPhone: reporterPhone || 'Not provided',
      peopleAffected: Number(peopleAffected) || 1,
      media: photoUrl ? [photoUrl] : [],
    });

    if (newCase) {
      onCaseCreated(newCase.caseId);
    } else {
      setErrorMessage('Failed to create emergency case. Please try again or dial 112 / 108 immediately.');
    }
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Direct Emergency Hotline Banner */}
        <div className="rounded-xl bg-gradient-to-r from-red-950 via-red-900 to-red-950 border border-red-700 p-4 mb-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-red-600 text-white animate-pulse">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Life-Threatening Emergency?
              </h3>
              <p className="text-xs text-red-200">
                If someone is unconscious or in immediate danger, call official emergency services now.
              </p>
            </div>
          </div>

          <a
            href="tel:112"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white text-red-700 font-extrabold text-sm hover:bg-slate-100 text-center shadow-lg transition-transform hover:scale-105 shrink-0"
          >
            📞 CALL 112 / 108 IMMEDIATELY
          </a>
        </div>

        {/* Main Form Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Report Emergency Incident
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gemini AI will analyze your report, score severity, and notify nearest dispatchers instantly.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Emergency Type */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              1. Select Emergency Type
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'medical_emergency', label: 'Medical Emergency', icon: '🩺' },
                { id: 'road_accident', label: 'Road Accident', icon: '🚗' },
                { id: 'fire', label: 'Fire Outbreak', icon: '🔥' },
                { id: 'flood', label: 'Flood / Water Disaster', icon: '🌊' },
                { id: 'building_collapse', label: 'Building Collapse', icon: '🏢' },
                { id: 'electrical', label: 'Electrical Hazard', icon: '⚡' },
                { id: 'violence', label: 'Violence / Crime', icon: '🛡️' },
                { id: 'gas_leak', label: 'Gas / Chemical Leak', icon: '💨' },
                { id: 'missing_person', label: 'Missing Person', icon: '👤' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as EmergencyType)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    type === item.id
                      ? 'bg-red-950/80 border-red-600 text-white ring-2 ring-red-600 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold leading-snug">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Severity & Affected Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                2. Initial Severity Assessment
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'critical', label: 'CRITICAL', color: 'bg-red-600' },
                  { id: 'high', label: 'HIGH', color: 'bg-orange-600' },
                  { id: 'medium', label: 'MEDIUM', color: 'bg-amber-600' },
                  { id: 'low', label: 'LOW', color: 'bg-emerald-600' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeverity(s.id as Severity)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-black uppercase transition-all ${
                      severity === s.id
                        ? `${s.color} text-white ring-2 ring-white shadow-lg`
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                3. Estimated People Affected
              </label>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={peopleAffected}
                  onChange={(e) => setPeopleAffected(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white font-bold focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Incident Description */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              4. Incident Description & Situation
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Describe what happened, injuries, visible fire/hazards, or key landmarks. Gemini AI will analyze this text.
            </p>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 2-car collision at intersection. Driver is trapped inside vehicle with leg injury. Smoke observed from engine bay..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Section 4: GPS Location Selector */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  5. Emergency Incident Location
                </label>
                <p className="text-[11px] text-slate-400">
                  Click on the map or tap the GPS button to set the exact incident position.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold hover:bg-emerald-900 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <MapPin className="w-3.5 h-3.5" />
                {locating ? 'Locating...' : 'Use My GPS'}
              </button>
            </div>

            <div className="mb-3">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address or landmark description..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <LeafletMap
              center={[lat, lng]}
              zoom={14}
              interactiveSelect={true}
              onLocationSelect={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
                setAddress(`Selected Map Point (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`);
              }}
              height="300px"
            />
          </div>

          {/* Section 5: Photo Media Upload */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              6. Scene Photo / Media Evidence (Optional)
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Attach a photo of the incident scene for Gemini AI visual hazard analysis.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="cursor-pointer px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" /> Upload Incident Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>

              {photoUrl && (
                <div className="flex items-center gap-3">
                  <img src={photoUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-slate-700" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Contact Info */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              7. Reporter Information (Optional)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Your Name</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="John Doe (or stay anonymous)"
                    className="bg-transparent w-full text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Callback Phone Number</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="bg-transparent w-full text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-base shadow-xl shadow-red-900/60 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" /> Submitting & Gemini AI Analyzing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> Submit Emergency Alert & Broadcast Dispatch
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
