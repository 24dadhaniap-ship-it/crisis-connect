import React, { useEffect, useState } from 'react';
import {
  Building2,
  Phone,
  MapPin,
  Flame,
  ShieldCheck,
  Search,
  Activity,
  Bed,
  ExternalLink,
} from 'lucide-react';
import { NearbyFacility } from '../types';
import { apiRequest } from '../lib/api';
import { LeafletMap } from '../components/map/LeafletMap';

export const NearbyHelpPage: React.FC = () => {
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    const res = await apiRequest<NearbyFacility[]>('/facilities/nearby');
    if (res.success && res.data) {
      setFacilities(res.data);
    }
  };

  const filteredFacilities = facilities.filter((f) => {
    const matchesType = filterType === 'all' || f.type === filterType;
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">
                  Nearby Emergency Medical & Safety Facilities
                </h1>
                <p className="text-xs text-slate-400">
                  Live bed capacities, Level 1 Trauma accreditation, and direct emergency hotline contacts.
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Facilities' },
                { id: 'hospital', label: '🏥 Trauma Hospitals' },
                { id: 'fire_station', label: '🚒 Fire Stations' },
                { id: 'police', label: '👮 Police Command' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilterType(btn.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === btn.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
          <Search className="w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hospital name, address, or trauma specialty..."
            className="bg-transparent text-sm text-white focus:outline-none w-full"
          />
        </div>

        {/* Split View Map & Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Facilities Cards List */}
          <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1">
            {filteredFacilities.map((fac, idx) => (
              <div
                key={fac.id || fac._id || `fac_${fac.name}_${idx}`}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                        fac.type === 'hospital'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : fac.type === 'fire_station'
                          ? 'bg-orange-950 text-orange-400 border border-orange-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {fac.type === 'hospital' ? '🏥' : fac.type === 'fire_station' ? '🚒' : '👮'}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">{fac.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" /> {fac.address}
                      </p>
                    </div>
                  </div>

                  {fac.distanceKm && (
                    <span className="text-xs font-extrabold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800">
                      {fac.distanceKm} km away
                    </span>
                  )}
                </div>

                {/* Facility Specs (Beds, Trauma Level) */}
                {fac.capacity && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-950 text-emerald-300 border border-slate-800 flex items-center gap-1">
                      <Bed className="w-3 h-3" /> {fac.capacity.availableBeds} / {fac.capacity.totalBeds} ICU Beds Open
                    </span>

                    {fac.capacity.traumaLevel && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-purple-950 text-purple-300 border border-purple-800">
                        {fac.capacity.traumaLevel}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <a
                    href={`tel:${fac.phone}`}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Hotline ({fac.phone})
                  </a>

                  <a
                    href={`https://maps.google.com/?q=${fac.coordinates[1]},${fac.coordinates[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    Google Maps Directions <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Leaflet Facilities Map */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-2xl h-[650px]">
            <LeafletMap
              facilities={filteredFacilities}
              center={[19.0760, 72.8777]}
              zoom={12}
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
