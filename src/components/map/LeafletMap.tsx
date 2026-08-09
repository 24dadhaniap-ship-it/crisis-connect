import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EmergencyCase, NearbyFacility, User } from '../../types';

interface Props {
  cases?: EmergencyCase[];
  facilities?: NearbyFacility[];
  responders?: User[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  onMarkerClick?: (caseId: string) => void;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  showHeatmap?: boolean;
  interactiveSelect?: boolean;
  selectedCaseId?: string;
  assignedResponderLoc?: { lat: number; lng: number; name?: string };
  height?: string;
}

export const LeafletMap: React.FC<Props> = ({
  cases = [],
  facilities = [],
  responders = [],
  center = [19.0760, 72.8777], // Mumbai, India default
  zoom = 13,
  onMarkerClick,
  onLocationSelect,
  showHeatmap = false,
  interactiveSelect = false,
  selectedCaseId,
  assignedResponderLoc,
  height = '500px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      const map = L.map(mapRef.current, {
        center: center as L.LatLngTuple,
        zoom,
        zoomControl: true,
      });

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayer.current = L.layerGroup().addTo(map);
      leafletInstance.current = map;

      if (interactiveSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
        });
      }
    }

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, []);

  // Update map view if center changes
  useEffect(() => {
    if (leafletInstance.current && center) {
      leafletInstance.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Render Markers
  useEffect(() => {
    if (!leafletInstance.current || !markersLayer.current) return;

    markersLayer.current.clearLayers();

    // 1. Render Emergency Case Markers
    cases.forEach((c) => {
      const [lng, lat] = c.location.coordinates;
      const isSelected = selectedCaseId === c.caseId;

      let colorClass = 'bg-amber-500';
      if (c.severity === 'critical') colorClass = 'bg-red-600 animate-ping';
      else if (c.severity === 'high') colorClass = 'bg-orange-500';
      else if (c.severity === 'low') colorClass = 'bg-emerald-500';

      const customIcon = L.divIcon({
        className: 'custom-emergency-marker',
        html: `
          <div class="relative flex items-center justify-center">
            ${c.severity === 'critical' ? `<span class="absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-75 animate-ping"></span>` : ''}
            <div class="relative w-7 h-7 rounded-full ${colorClass} border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              🚨
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersLayer.current!);

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; color: #0f172a; padding: 4px;">
          <div style="font-weight: 800; font-size: 13px; color: #dc2626;">
            ${c.caseId} - ${c.type.replace('_', ' ').toUpperCase()}
          </div>
          <div style="font-size: 11px; margin-top: 2px; color: #334155;">
            <strong>Severity:</strong> <span style="text-transform: uppercase; font-weight: 700; color: ${c.severity === 'critical' ? '#dc2626' : '#ea580c'}">${c.severity}</span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">
            ${c.description.slice(0, 80)}...
          </div>
          <div style="margin-top: 8px;">
            <button id="btn-track-${c.caseId}" style="background-color: #0284c7; color: white; border: none; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Track Case →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-track-${c.caseId}`);
        if (btn && onMarkerClick) {
          btn.addEventListener('click', () => onMarkerClick(c.caseId));
        }
      });
    });

    // 2. Render Facilities Markers
    facilities.forEach((fac) => {
      const [lng, lat] = fac.coordinates;
      let symbol = '🏥';
      let bg = 'bg-emerald-600';

      if (fac.type === 'fire_station') {
        symbol = '🚒';
        bg = 'bg-orange-600';
      } else if (fac.type === 'police') {
        symbol = '👮';
        bg = 'bg-blue-600';
      }

      const facIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: `<div class="w-6 h-6 rounded-full ${bg} border border-white flex items-center justify-center text-xs shadow-md">${symbol}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const fMarker = L.marker([lat, lng], { icon: facIcon }).addTo(markersLayer.current!);
      fMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; font-size: 12px;">
          <strong>${fac.name}</strong><br/>
          <span style="color: #64748b;">${fac.address}</span><br/>
          <a href="tel:${fac.phone}" style="color: #0284c7; font-weight: 700;">📞 ${fac.phone}</a>
        </div>
      `);
    });

    // 3. Render Responders Markers
    responders.forEach((resp) => {
      if (resp.responderProfile?.currentLocation) {
        const [lng, lat] = resp.responderProfile.currentLocation.coordinates;
        const respIcon = L.divIcon({
          className: 'custom-responder-marker',
          html: `<div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-xs text-white shadow-lg font-bold">🚑</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const rMarker = L.marker([lat, lng], { icon: respIcon }).addTo(markersLayer.current!);
        rMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px;">
            <strong>Responder: ${resp.name}</strong><br/>
            <span>Status: ${resp.responderProfile.isAvailable ? 'Available' : 'Busy'}</span>
          </div>
        `);
      }
    });

    // 4. Render Live Assigned Responder Location
    if (assignedResponderLoc) {
      const liveRespIcon = L.divIcon({
        className: 'live-responder-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
            <div class="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
              🚑
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const liveMarker = L.marker([assignedResponderLoc.lat, assignedResponderLoc.lng], {
        icon: liveRespIcon,
      }).addTo(markersLayer.current!);

      liveMarker.bindPopup(`
        <div style="font-size: 12px;">
          <strong>Assigned Unit En Route: ${assignedResponderLoc.name || 'Responder'}</strong>
        </div>
      `);
    }

    // 5. Render Heatmap Density Circles if toggled
    if (showHeatmap && cases.length > 0) {
      cases.forEach((c) => {
        const [lng, lat] = c.location.coordinates;
        L.circle([lat, lng], {
          color: c.severity === 'critical' ? '#dc2626' : '#f97316',
          fillColor: c.severity === 'critical' ? '#ef4444' : '#fb923c',
          fillOpacity: 0.35,
          radius: 600,
        }).addTo(markersLayer.current!);
      });
    }
  }, [cases, facilities, responders, showHeatmap, selectedCaseId, assignedResponderLoc]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden border border-slate-800 shadow-xl z-0"
    />
  );
};
