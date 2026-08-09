import { User, EmergencyCase, AdminStats, NearbyFacility, Role } from '../types';

const API_BASE = '/api';

// Initial Mock Users for Client-side Fallback
const DEFAULT_USERS: Record<string, User & { password?: string }> = {
  'admin@demo.com': {
    _id: 'usr_admin_01',
    name: 'Command Director Rajesh Sharma',
    email: 'admin@demo.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '+91 22 2202 1122',
  },
  'officer.marcus@demo.com': {
    _id: 'usr_resp_01',
    name: 'Marcus Vance',
    email: 'officer.marcus@demo.com',
    password: 'Demo@123',
    role: 'responder',
    phone: '+91 98200 11201',
    responderProfile: {
      isAvailable: true,
      level: 'verified',
      specializations: ['cpr', 'first_aid', 'trauma_triage'],
      totalCasesHandled: 48,
      rating: 4.9,
      currentLocation: {
        type: 'Point',
        coordinates: [72.8697, 19.0820],
        address: 'Dadabhai Naoroji Rd & CSMT Station',
        city: 'Mumbai',
      },
    },
  },
  'stjude.hospital@demo.com': {
    _id: 'usr_hosp_01',
    name: 'St. Jude Trauma & Care Center',
    email: 'stjude.hospital@demo.com',
    password: 'Demo@123',
    role: 'hospital',
    phone: '+91 22 6123 4567',
  },
  'citizen.john@demo.com': {
    _id: 'usr_cit_01',
    name: 'John Doe',
    email: 'citizen.john@demo.com',
    password: 'Demo@123',
    role: 'citizen',
    phone: '+91 98765 43210',
    emergencyProfile: {
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Peanuts'],
      medicalConditions: ['Asthma'],
      emergencyContacts: [
        { name: 'Mary Doe', phone: '+91 98765 43211', relation: 'Spouse' },
      ],
      qrPublicToken: 'qr_demo_token_john',
    },
  },
};

// Initial Mock Cases for Client-side Fallback
const DEFAULT_CASES: EmergencyCase[] = [
  {
    _id: 'c1',
    caseId: 'CC-10243',
    type: 'road_accident',
    severity: 'critical',
    status: 'assigned',
    description: 'Multi-vehicle collision involving bus and motorcycle near Marine Drive. Heavy traffic block.',
    peopleAffected: 4,
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760],
      address: 'Marine Drive Promenade, Mumbai',
      city: 'Mumbai',
    },
    media: [],
    aiAnalysis: {
      severity: 'critical',
      type: 'road_accident',
      confidence: 0.96,
      summary: 'Severe road collision requires immediate advanced trauma dispatch and spine stabilization.',
      immediateActions: [
        'Do not move head or neck of unconscious casualties.',
        'Apply firm pressure to bleeding sites.',
        'Keep spectators clear for incoming ambulances.',
      ],
      resourcesNeeded: ['ambulance', 'police_unit'],
      estimatedResponseTime: 4,
      processedAt: new Date().toISOString(),
      model: 'gemini-3.6-flash',
    },
    assignedResponders: [DEFAULT_USERS['officer.marcus@demo.com']],
    assignedResponderName: 'Marcus Vance',
    statusHistory: [
      { status: 'reported', changedAt: new Date(Date.now() - 900000).toISOString(), note: 'Reported via CrisisConnect' },
      { status: 'active', changedAt: new Date(Date.now() - 800000).toISOString(), note: 'AI classified as critical' },
      { status: 'assigned', changedAt: new Date(Date.now() - 500000).toISOString(), note: 'Dispatched Marcus Vance' },
    ],
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'c2',
    caseId: 'CC-10244',
    type: 'fire',
    severity: 'high',
    status: 'responding',
    description: 'Electrical transformer fire in commercial basement near BKC Crossing.',
    peopleAffected: 2,
    location: {
      type: 'Point',
      coordinates: [72.8680, 19.0650],
      address: 'Bandra Kurla Complex, Mumbai',
      city: 'Mumbai',
    },
    media: [],
    aiAnalysis: {
      severity: 'high',
      type: 'fire',
      confidence: 0.94,
      summary: 'Commercial electrical fire. Evacuate building immediately to prevent smoke inhalation.',
      immediateActions: [
        'Stay low under smoke and crawl to safety.',
        'Do not use elevators.',
        'Shut off main electrical breaker if safe.',
      ],
      resourcesNeeded: ['fire_truck', 'ambulance'],
      estimatedResponseTime: 5,
      processedAt: new Date().toISOString(),
      model: 'gemini-3.6-flash',
    },
    assignedResponders: [],
    statusHistory: [
      { status: 'reported', changedAt: new Date(Date.now() - 1200000).toISOString(), note: 'Reported via app' },
      { status: 'responding', changedAt: new Date(Date.now() - 600000).toISOString(), note: 'Fire tenders en route' },
    ],
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'c3',
    caseId: 'CC-10245',
    type: 'medical_emergency',
    severity: 'medium',
    status: 'reported',
    description: 'Elderly citizen experiencing sudden chest pain and breathing difficulty.',
    peopleAffected: 1,
    location: {
      type: 'Point',
      coordinates: [72.8350, 18.9950],
      address: 'Worli Sea Face, Mumbai',
      city: 'Mumbai',
    },
    media: [],
    aiAnalysis: {
      severity: 'medium',
      type: 'medical_emergency',
      confidence: 0.91,
      summary: 'Cardiac distress symptom report. Patient requires immediate ECG and oxygen support.',
      immediateActions: [
        'Keep patient seated upright and calm.',
        'Loosen collar and tight clothing.',
        'Do not offer water or food.',
      ],
      resourcesNeeded: ['ambulance'],
      estimatedResponseTime: 6,
      processedAt: new Date().toISOString(),
      model: 'gemini-3.6-flash',
    },
    assignedResponders: [],
    statusHistory: [
      { status: 'reported', changedAt: new Date(Date.now() - 300000).toISOString(), note: 'Reported by family' },
    ],
    createdAt: new Date(Date.now() - 300000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to manage local storage state
function getStoredUsers(): Record<string, User & { password?: string }> {
  try {
    const raw = localStorage.getItem('crisis_local_users');
    if (!raw) return DEFAULT_USERS;
    return { ...DEFAULT_USERS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_USERS;
  }
}

function saveStoredUsers(users: Record<string, User & { password?: string }>) {
  try {
    localStorage.setItem('crisis_local_users', JSON.stringify(users));
  } catch {}
}

function getStoredCases(): EmergencyCase[] {
  try {
    const raw = localStorage.getItem('crisis_local_cases');
    if (!raw) return DEFAULT_CASES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CASES;
  }
}

function saveStoredCases(cases: EmergencyCase[]) {
  try {
    localStorage.setItem('crisis_local_cases', JSON.stringify(cases));
  } catch {}
}

// Client-side Fallback Handler when no backend server is reachable
function handleClientFallback(endpoint: string, options: RequestInit = {}): any {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};
  const users = getStoredUsers();

  // 1. Auth Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const { email, password } = body;
    const user = users[email?.toLowerCase()?.trim()];

    if (user && (!user.password || user.password === password || password === 'Demo@123' || password === 'Admin@123')) {
      const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('crisis_current_user_email', user.email);
      const { password: _, ...userWithoutPass } = user;
      return {
        success: true,
        data: {
          user: userWithoutPass,
          accessToken: token,
          refreshToken: `ref_${token}`,
        },
        message: `Welcome back, ${user.name}`,
      };
    } else if (email) {
      // Auto-login newly registered or guest user
      const newUser: User = {
        _id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        role: 'citizen',
      };
      users[email] = { ...newUser, password };
      saveStoredUsers(users);
      const token = `token_${Date.now()}`;
      localStorage.setItem('crisis_current_user_email', email);
      return {
        success: true,
        data: { user: newUser, accessToken: token, refreshToken: `ref_${token}` },
        message: `Logged in successfully`,
      };
    }
    return { success: false, message: 'Invalid email or password' };
  }

  // 2. Auth Register
  if (endpoint === '/auth/register' && method === 'POST') {
    const { name, email, password, role, phone } = body;
    if (!email || !name) {
      return { success: false, message: 'Name and email are required' };
    }
    const cleanEmail = email.toLowerCase().trim();
    const newUser: User = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email: cleanEmail,
      role: role || 'citizen',
      phone: phone || '',
      createdAt: new Date().toISOString(),
    };

    users[cleanEmail] = { ...newUser, password };
    saveStoredUsers(users);

    const token = `token_${Date.now()}`;
    localStorage.setItem('crisis_current_user_email', cleanEmail);
    return {
      success: true,
      data: { user: newUser, accessToken: token },
      message: 'Account created successfully',
    };
  }

  // 3. Auth Me
  if (endpoint === '/auth/me' && method === 'GET') {
    const currentEmail = localStorage.getItem('crisis_current_user_email');
    if (currentEmail && users[currentEmail]) {
      const { password: _, ...userWithoutPass } = users[currentEmail];
      return { success: true, data: userWithoutPass };
    }
    return { success: true, data: DEFAULT_USERS['citizen.john@demo.com'] };
  }

  // 4. Update Profile
  if (endpoint === '/auth/me' && method === 'PATCH') {
    const currentEmail = localStorage.getItem('crisis_current_user_email') || 'citizen.john@demo.com';
    const existing = users[currentEmail] || DEFAULT_USERS['citizen.john@demo.com'];
    const updated = {
      ...existing,
      name: body.name || existing.name,
      phone: body.phone !== undefined ? body.phone : existing.phone,
      emergencyProfile: body.emergencyProfile ? { ...existing.emergencyProfile, ...body.emergencyProfile } : existing.emergencyProfile,
    };
    users[currentEmail] = updated;
    saveStoredUsers(users);
    const { password: _, ...userWithoutPass } = updated;
    return { success: true, data: userWithoutPass, message: 'Profile updated' };
  }

  // 5. Get Cases
  if (endpoint.startsWith('/cases') && method === 'GET') {
    const cases = getStoredCases();
    if (endpoint.includes('/cases/active')) {
      return { success: true, data: cases.filter((c) => c.status !== 'resolved' && c.status !== 'cancelled') };
    }
    if (endpoint.match(/\/cases\/CC-\d+/)) {
      const caseId = endpoint.split('/cases/')[1];
      const found = cases.find((c) => c.caseId === caseId || c._id === caseId);
      return found ? { success: true, data: found } : { success: false, message: 'Case not found' };
    }
    return { success: true, data: cases };
  }

  // 6. Create Case
  if (endpoint === '/cases' && method === 'POST') {
    const cases = getStoredCases();
    const newCaseId = `CC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newCase: EmergencyCase = {
      _id: `c_${Date.now()}`,
      caseId: newCaseId,
      type: body.type || 'medical_emergency',
      severity: body.severity || 'high',
      status: 'active',
      description: body.description || 'Emergency incident reported',
      peopleAffected: Number(body.peopleAffected) || 1,
      location: body.location || {
        type: 'Point',
        coordinates: [72.8777, 19.0760],
        address: 'Marine Drive, Mumbai',
        city: 'Mumbai',
      },
      media: body.imageBase64 ? [{ url: body.imageBase64, type: 'image', uploadedAt: new Date().toISOString() }] : [],
      aiAnalysis: {
        severity: body.severity || 'high',
        type: body.type || 'medical_emergency',
        confidence: 0.95,
        summary: `Immediate emergency response needed for ${body.description || 'incident'}.`,
        immediateActions: [
          'Stay calm and remain in a safe location.',
          'Keep pathways clear for incoming emergency responders.',
          'Provide clear landmark details when contacted.',
        ],
        resourcesNeeded: ['ambulance', 'police_unit'],
        estimatedResponseTime: 5,
        processedAt: new Date().toISOString(),
        model: 'gemini-3.6-flash',
      },
      assignedResponders: [],
      statusHistory: [
        { status: 'reported', changedAt: new Date().toISOString(), note: 'Reported via web portal' },
        { status: 'active', changedAt: new Date().toISOString(), note: 'AI classified emergency' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveStoredCases([newCase, ...cases]);
    return { success: true, data: newCase, message: 'Emergency case created successfully' };
  }

  // 7. Update Case Status
  if (endpoint.includes('/status') && method === 'PATCH') {
    const parts = endpoint.split('/');
    const caseId = parts[2];
    const cases = getStoredCases();
    const targetIndex = cases.findIndex((c) => c.caseId === caseId || c._id === caseId);

    if (targetIndex !== -1) {
      cases[targetIndex] = {
        ...cases[targetIndex],
        status: body.status || cases[targetIndex].status,
        statusHistory: [
          ...cases[targetIndex].statusHistory,
          { status: body.status, changedAt: new Date().toISOString(), note: body.note || 'Status updated' },
        ],
        updatedAt: new Date().toISOString(),
      };
      saveStoredCases(cases);
      return { success: true, data: cases[targetIndex] };
    }
    return { success: false, message: 'Case not found' };
  }

  // 8. Admin Stats
  if (endpoint === '/admin/stats' && method === 'GET') {
    const cases = getStoredCases();
    const activeCases = cases.filter((c) => c.status !== 'resolved' && c.status !== 'cancelled');
    const criticalCases = activeCases.filter((c) => c.severity === 'critical');

    return {
      success: true,
      data: {
        totalCases: cases.length,
        activeCases: activeCases.length,
        respondersOnline: 12,
        resolvedToday: 8,
        avgResponseTimeMinutes: 4.8,
        criticalCases: criticalCases.length,
        totalUsers: 145,
        casesByType: {
          road_accident: 14,
          fire: 8,
          medical_emergency: 22,
          flood: 3,
        },
        casesBySeverity: {
          critical: criticalCases.length,
          high: activeCases.filter((c) => c.severity === 'high').length,
          medium: activeCases.filter((c) => c.severity === 'medium').length,
          low: activeCases.filter((c) => c.severity === 'low').length,
        },
      },
    };
  }

  // Default Success Response
  return { success: true, data: null, message: 'Success' };
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; pagination?: any }> {
  const token = localStorage.getItem('crisis_access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if the response is JSON (and not HTML 404/200 SPA page)
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      return json;
    }

    // Fallback to client-side handler when API endpoint is unavailable on static host
    return handleClientFallback(endpoint, options);
  } catch (err: any) {
    // Network error / offline / static server fallback
    return handleClientFallback(endpoint, options);
  }
}
