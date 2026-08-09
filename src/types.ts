export type Role = 'citizen' | 'responder' | 'admin' | 'hospital';

export type EmergencyType =
  | 'road_accident'
  | 'fire'
  | 'medical_emergency'
  | 'flood'
  | 'building_collapse'
  | 'electrical'
  | 'violence'
  | 'missing_person'
  | 'gas_leak'
  | 'other';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type CaseStatus =
  | 'reported'
  | 'ai_processing'
  | 'active'
  | 'assigned'
  | 'responding'
  | 'arrived'
  | 'resolved'
  | 'cancelled'
  | 'escalated';

export type ResponderLevel = 'basic' | 'verified' | 'trained' | 'professional';

export interface LocationPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  landmark?: string;
  city?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  role: Role;
  responderProfile?: {
    isAvailable: boolean;
    level: ResponderLevel;
    specializations: string[];
    totalCasesHandled: number;
    rating: number;
    unitType?: string;
    currentLocation?: LocationPoint;
    certifications?: Array<{
      name: string;
      issuedBy: string;
      verifiedAt?: string;
      documentUrl?: string;
    }>;
  };
  emergencyProfile?: {
    bloodGroup?: string;
    bloodType?: string;
    allergies?: string[];
    medicalConditions?: string[];
    emergencyContacts?: Array<{
      name: string;
      phone: string;
      relation?: string;
    }>;
    qrCode?: string;
    qrPublicToken?: string;
  };
  fcmToken?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AIAnalysis {
  severity: Severity;
  type: EmergencyType | string;
  confidence: number;
  summary: string;
  immediateActions: string[];
  resourcesNeeded: string[];
  estimatedResponseTime?: number;
  processedAt: string;
  model: string;
}

export interface MediaItem {
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  uploadedAt: string;
}

export interface StatusHistoryItem {
  status: CaseStatus;
  changedBy?: {
    _id: string;
    name: string;
    role: Role;
  };
  changedAt: string;
  note?: string;
}

export interface NearbyFacility {
  _id?: string;
  id?: string;
  name: string;
  type: 'hospital' | 'fire_station' | 'police' | 'shelter';
  distance?: number;
  distanceKm?: number;
  phone: string;
  address: string;
  coordinates: [number, number];
  availableBeds?: number;
  capacity?: {
    availableBeds: number;
    totalBeds: number;
    traumaLevel?: string;
  };
  isOpen24h?: boolean;
}

export interface EmergencyCase {
  _id: string;
  caseId: string; // e.g. "CC-10243"
  type: EmergencyType;
  severity: Severity;
  status: CaseStatus;
  reportedBy?: User | string;
  reporterName?: string;
  reporterPhone?: string;
  location: LocationPoint;
  description: string;
  peopleAffected: number;
  media: any[];
  aiAnalysis?: AIAnalysis;
  assignedResponders: User[];
  assignedResponderId?: string;
  assignedResponderName?: string;
  assignedResponderPhone?: string;
  statusHistory: StatusHistoryItem[];
  nearbyFacilities?: NearbyFacility[];
  resolvedAt?: string;
  responseTimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyMessage {
  _id: string;
  caseId: string;
  senderId?: string;
  senderName?: string;
  senderRole: Role | string;
  content: string;
  sentAt: string;
}

export type CaseMessage = EmergencyMessage;

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  caseId?: string;
  isRead: boolean;
  sentAt: string;
}

export interface AdminStats {
  totalCases?: number;
  activeCases: number;
  respondersOnline: number;
  resolvedToday: number;
  avgResponseTimeMinutes: number;
  criticalCases: number;
  totalUsers: number;
  casesByType: Record<string, number>;
  casesBySeverity: Record<string, number>;
}

export interface AnalyticsTrend {
  date: string;
  reported: number;
  resolved: number;
  avgResponseTime: number;
}

export interface HourlyDistribution {
  hour: string;
  count: number;
}
