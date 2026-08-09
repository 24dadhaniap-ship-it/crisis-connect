import React from 'react';
import {
  Car,
  Flame,
  HeartPulse,
  Droplets,
  Building2,
  Zap,
  ShieldAlert,
  UserX,
  Wind,
  AlertTriangle,
} from 'lucide-react';
import { EmergencyType } from '../types';

interface Props {
  type: EmergencyType | string;
  className?: string;
  size?: number;
}

export const EmergencyTypeIcon: React.FC<Props> = ({ type, className = 'w-5 h-5', size = 20 }) => {
  const norm = String(type).toLowerCase();

  switch (norm) {
    case 'road_accident':
      return <Car size={size} className={`text-red-400 ${className}`} />;
    case 'fire':
      return <Flame size={size} className={`text-orange-500 ${className}`} />;
    case 'medical_emergency':
      return <HeartPulse size={size} className={`text-rose-500 ${className}`} />;
    case 'flood':
      return <Droplets size={size} className={`text-blue-400 ${className}`} />;
    case 'building_collapse':
      return <Building2 size={size} className={`text-amber-500 ${className}`} />;
    case 'electrical':
      return <Zap size={size} className={`text-yellow-400 ${className}`} />;
    case 'violence':
      return <ShieldAlert size={size} className={`text-purple-400 ${className}`} />;
    case 'missing_person':
      return <UserX size={size} className={`text-teal-400 ${className}`} />;
    case 'gas_leak':
      return <Wind size={size} className={`text-emerald-400 ${className}`} />;
    default:
      return <AlertTriangle size={size} className={`text-slate-400 ${className}`} />;
  }
};
