import bcrypt from 'bcryptjs';
import { User, EmergencyCase, NotificationItem, NearbyFacility, Role, CaseStatus, Severity, EmergencyMessage } from '../src/types.js';

// Haversine distance in meters
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Seed Base Coordinates (Mumbai, India center default: 19.0760, 72.8777)
const BASE_LAT = 19.0760;
const BASE_LNG = 72.8777;

class Database {
  public users: Map<string, User & { passwordHash: string }> = new Map();
  public cases: Map<string, EmergencyCase> = new Map();
  public notifications: Map<string, NotificationItem> = new Map();
  public facilities: NearbyFacility[] = [];
  public caseMessages: Map<string, EmergencyMessage[]> = new Map();
  public initialized: boolean = false;

  constructor() {
    this.seedInitialData();
  }

  private async seedInitialData() {
    if (this.initialized) return;

    const commonPasswordHash = await bcrypt.hash('Demo@123', 10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

    // 1. Seed Users
    const adminUser: User & { passwordHash: string } = {
      _id: 'usr_admin_01',
      name: 'Command Director Rajesh Sharma',
      email: 'admin@demo.com',
      passwordHash: adminPasswordHash,
      phone: '+91 22 2202 1122',
      role: 'admin',
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };

    const responder1: User & { passwordHash: string } = {
      _id: 'usr_resp_01',
      name: 'Marcus Vance',
      email: 'officer.marcus@demo.com',
      passwordHash: commonPasswordHash,
      phone: '+91 98200 11201',
      role: 'responder',
      isEmailVerified: true,
      responderProfile: {
        isAvailable: true,
        level: 'verified',
        specializations: ['cpr', 'first_aid', 'trauma_triage'],
        totalCasesHandled: 48,
        rating: 4.9,
        currentLocation: {
          type: 'Point',
          coordinates: [BASE_LNG - 0.008, BASE_LAT + 0.006],
          address: 'Dadabhai Naoroji Rd & CSMT Station',
          city: 'Mumbai',
        },
        certifications: [
          { name: 'National EMT-Paramedic License', issuedBy: 'NREMT India', verifiedAt: '2025-01-15' },
          { name: 'Advanced Cardiac Life Support (ACLS)', issuedBy: 'AHA India', verifiedAt: '2025-03-10' },
        ],
      },
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    };

    const responder2: User & { passwordHash: string } = {
      _id: 'usr_resp_02',
      name: 'Capt. Sarah Chen',
      email: 'capt.sarah@demo.com',
      passwordHash: commonPasswordHash,
      phone: '+91 98200 11202',
      role: 'responder',
      isEmailVerified: true,
      responderProfile: {
        isAvailable: true,
        level: 'professional',
        specializations: ['fire_safety', 'hazmat', 'structural_rescue'],
        totalCasesHandled: 124,
        rating: 5.0,
        currentLocation: {
          type: 'Point',
          coordinates: [BASE_LNG + 0.012, BASE_LAT - 0.005],
          address: 'BKC Junction & Bandra Kurla Complex',
          city: 'Mumbai',
        },
      },
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    };

    const responder3: User & { passwordHash: string } = {
      _id: 'usr_resp_03',
      name: 'Dr. Elena Rostova',
      email: 'dr.elena@demo.com',
      passwordHash: commonPasswordHash,
      phone: '+91 98200 11203',
      role: 'responder',
      isEmailVerified: true,
      responderProfile: {
        isAvailable: true,
        level: 'trained',
        specializations: ['emergency_medicine', 'pediatric_care', 'defibrillation'],
        totalCasesHandled: 32,
        rating: 4.8,
        currentLocation: {
          type: 'Point',
          coordinates: [BASE_LNG - 0.003, BASE_LAT - 0.012],
          address: 'Parel Station & Hospital Road',
          city: 'Mumbai',
        },
      },
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    };

    const responder4: User & { passwordHash: string } = {
      _id: 'usr_resp_04',
      name: 'Officer David Miller',
      email: 'unit.david@demo.com',
      passwordHash: commonPasswordHash,
      phone: '+91 98200 11204',
      role: 'responder',
      isEmailVerified: true,
      responderProfile: {
        isAvailable: false,
        level: 'verified',
        specializations: ['traffic_control', 'crowd_management', 'deescalation'],
        totalCasesHandled: 67,
        rating: 4.7,
        currentLocation: {
          type: 'Point',
          coordinates: [BASE_LNG + 0.018, BASE_LAT + 0.014],
          address: 'Marine Drive Promenade',
          city: 'Mumbai',
        },
      },
      createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    };

    const citizen1: User & { passwordHash: string } = {
      _id: 'usr_citizen_01',
      name: 'Aarav Patel',
      email: 'citizen.john@demo.com',
      passwordHash: commonPasswordHash,
      phone: '+91 98765 43210',
      role: 'citizen',
      isEmailVerified: true,
      emergencyProfile: {
        bloodGroup: 'O+',
        allergies: ['Penicillin', 'Peanuts'],
        medicalConditions: ['Asthma (uses inhaler)'],
        emergencyContacts: [
          { name: 'Priya Patel', phone: '+91 98765 43211', relation: 'Spouse' },
          { name: 'Rohan Patel', phone: '+91 98765 43212', relation: 'Brother' },
        ],
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        qrPublicToken: 'qr_token_aarav_patel_88492',
      },
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    };

    const hospital1: User & { passwordHash: string } = {
      _id: 'usr_hospital_01',
      name: 'KEM Hospital & Level-1 Trauma Center',
      email: 'stjude.hospital@demo.com',
      passwordHash: commonPasswordHash,
      phone: '+91 22 2410 7000',
      role: 'hospital',
      isEmailVerified: true,
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    };

    [adminUser, responder1, responder2, responder3, responder4, citizen1, hospital1].forEach((u) => {
      this.users.set(u._id, u);
    });

    // 2. Seed Facilities
    this.facilities = [
      {
        id: 'fac_01',
        name: 'KEM Hospital & Level-1 Trauma Center',
        type: 'hospital',
        distance: 850,
        phone: '+91 22 2410 7000',
        address: 'Acharya Donde Marg, Parel, Mumbai',
        coordinates: [BASE_LNG - 0.005, BASE_LAT + 0.008],
        availableBeds: 18,
        isOpen24h: true,
      },
      {
        id: 'fac_02',
        name: 'Lilavati Hospital & Research Centre',
        type: 'hospital',
        distance: 1400,
        phone: '+91 22 2675 1000',
        address: 'A-791, Bandra Reclamation, Bandra West, Mumbai',
        coordinates: [BASE_LNG + 0.015, BASE_LAT - 0.012],
        availableBeds: 12,
        isOpen24h: true,
      },
      {
        id: 'fac_03',
        name: 'Fort Fire Station & Dispatch Battalion #1',
        type: 'fire_station',
        distance: 600,
        phone: '+91 22 2262 0112',
        address: 'Shahid Bhagat Singh Rd, Fort, Mumbai',
        coordinates: [BASE_LNG + 0.002, BASE_LAT - 0.002],
        isOpen24h: true,
      },
      {
        id: 'fac_04',
        name: 'Mumbai Police Commissionerate Headquarters',
        type: 'police',
        distance: 1100,
        phone: '+91 22 2262 0111',
        address: 'Crawford Market Area, Fort, Mumbai',
        coordinates: [BASE_LNG - 0.010, BASE_LAT + 0.012],
        isOpen24h: true,
      },
      {
        id: 'fac_05',
        name: 'Tata Memorial Trauma & Cancer Care Centre',
        type: 'hospital',
        distance: 2200,
        phone: '+91 22 2417 7000',
        address: 'Dr. E Borges Road, Parel, Mumbai',
        coordinates: [BASE_LNG - 0.025, BASE_LAT + 0.005],
        availableBeds: 25,
        isOpen24h: true,
      },
    ];

    // 3. Emergency Cases (starts clean - populated strictly by user input)
    const rawCases: Array<Partial<EmergencyCase>> = [];
    /*
      {
        _id: 'case_01',
        caseId: 'CC-10241',
        type: 'road_accident',
        severity: 'critical',
        status: 'responding',
        description: 'Multi-vehicle collision on Western Express Highway overpass near Bandra involving a BEST city bus and 2 cars. Fuel leakage detected.',
        peopleAffected: 6,
        location: {
          type: 'Point',
          coordinates: [BASE_LNG - 0.004, BASE_LAT + 0.003],
          address: 'Western Express Highway Overpass, Bandra East',
          landmark: 'Near BKC Flyover Junction',
          city: 'Mumbai',
        },
        aiAnalysis: {
          severity: 'critical',
          type: 'road_accident',
          confidence: 0.98,
          summary: 'High-velocity highway crash with roll-over and fluid leak. High risk of ignition and multiple trauma injuries.',
          immediateActions: [
            'Divert highway traffic away from fuel slick immediately.',
            'Do not ignite matches, lighters, or flares nearby.',
            'Keep conscious victims still and immobilize neck area.',
            'Deploy hydraulic extrication tools and foam responder unit.',
          ],
          resourcesNeeded: ['heavy_rescue', 'ambulance', 'fire_engine', 'police_traffic'],
          estimatedResponseTime: 4,
          processedAt: new Date(Date.now() - 15 * 60000).toISOString(),
          model: 'gemini-3.6-flash',
        },
        assignedResponders: [responder1, responder2],
        media: [
          {
            url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop',
            type: 'image',
            uploadedAt: new Date(Date.now() - 15 * 60000).toISOString(),
          },
        ],
        statusHistory: [
          { status: 'reported', changedAt: new Date(Date.now() - 18 * 60000).toISOString(), note: 'Incident logged via citizen mobile report' },
          { status: 'ai_processing', changedAt: new Date(Date.now() - 17 * 60000).toISOString(), note: 'Gemini 3.6 Flash classification completed' },
          { status: 'active', changedAt: new Date(Date.now() - 16 * 60000).toISOString(), note: 'Alert dispatched to nearby emergency responders' },
          { status: 'assigned', changedAt: new Date(Date.now() - 12 * 60000).toISOString(), note: 'Marcus Vance & Capt. Sarah Chen accepted' },
          { status: 'responding', changedAt: new Date(Date.now() - 10 * 60000).toISOString(), note: 'Units en route with sirens enabled' },
        ],
        createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      },
      {
        _id: 'case_02',
        caseId: 'CC-10242',
        type: 'fire',
        severity: 'high',
        status: 'active',
        description: 'Heavy black smoke rising from 3rd floor commercial kitchen near Crawford Market. Electrical short circuit suspected.',
        peopleAffected: 12,
        location: {
          type: 'Point',
          coordinates: [BASE_LNG + 0.008, BASE_LAT - 0.002],
          address: '580 Kalbadevi Road, Fort',
          landmark: 'Near Crawford Market Junction',
          city: 'Mumbai',
        },
        aiAnalysis: {
          severity: 'high',
          type: 'fire',
          confidence: 0.95,
          summary: 'Active commercial structure fire with probable electrical origin. Rapid toxic smoke expansion reported in dense market aisle.',
          immediateActions: [
            'Evacuate all occupants via emergency stairwells immediately.',
            'Shut down main electrical breaker if safe to reach.',
            'Do not use elevators.',
            'Establish 200-meter safety perimeter on street level.',
          ],
          resourcesNeeded: ['ladder_truck', 'fire_pumper', 'ambulance'],
          estimatedResponseTime: 6,
          processedAt: new Date(Date.now() - 8 * 60000).toISOString(),
          model: 'gemini-3.6-flash',
        },
        assignedResponders: [],
        media: [],
        statusHistory: [
          { status: 'reported', changedAt: new Date(Date.now() - 10 * 60000).toISOString() },
          { status: 'ai_processing', changedAt: new Date(Date.now() - 9 * 60000).toISOString() },
          { status: 'active', changedAt: new Date(Date.now() - 8 * 60000).toISOString() },
        ],
        createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
      },
      {
        _id: 'case_03',
        caseId: 'CC-10243',
        type: 'medical_emergency',
        severity: 'critical',
        status: 'assigned',
        description: '60-year-old male collapsed near railway ticket turnstiles. Unresponsive, shallow gasping breaths. CPR initiated by bystander.',
        peopleAffected: 1,
        location: {
          type: 'Point',
          coordinates: [BASE_LNG - 0.002, BASE_LAT - 0.008],
          address: 'Dadar Central Station Concourse Level',
          landmark: 'Near Ticket Counter Area',
          city: 'Mumbai',
        },
        aiAnalysis: {
          severity: 'critical',
          type: 'medical_emergency',
          confidence: 0.99,
          summary: 'Suspected acute cardiac arrest in major railway hub. Immediate AED shock and paramedic intervention vital.',
          immediateActions: [
            'Continue continuous chest compressions (100-120/min).',
            'Fetch wall-mounted public AED from station master booth immediately.',
            'Attach AED pads as instructed by automated voice prompts.',
            'Clear bystanders from patient during AED shock analysis.',
          ],
          resourcesNeeded: ['advanced_paramedic', 'aed_unit'],
          estimatedResponseTime: 3,
          processedAt: new Date(Date.now() - 5 * 60000).toISOString(),
          model: 'gemini-3.6-flash',
        },
        assignedResponders: [responder3],
        media: [],
        statusHistory: [
          { status: 'reported', changedAt: new Date(Date.now() - 7 * 60000).toISOString() },
          { status: 'active', changedAt: new Date(Date.now() - 6 * 60000).toISOString() },
          { status: 'assigned', changedAt: new Date(Date.now() - 4 * 60000).toISOString(), note: 'Dr. Elena Rostova assigned' },
        ],
        createdAt: new Date(Date.now() - 7 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60000).toISOString(),
      },
      {
        _id: 'case_04',
        caseId: 'CC-10244',
        type: 'gas_leak',
        severity: 'high',
        status: 'reported',
        description: 'Strong gas odor leaking from underground utility excavation pipeline near hospital premises.',
        peopleAffected: 25,
        location: {
          type: 'Point',
          coordinates: [BASE_LNG - 0.015, BASE_LAT + 0.010],
          address: '1420 SV Road, Andheri West',
          landmark: 'Outside Kokilaben Hospital Gate',
          city: 'Mumbai',
        },
        aiAnalysis: {
          severity: 'high',
          type: 'gas_leak',
          confidence: 0.93,
          summary: 'Pressurized gas line rupture near crowded street. High explosive potential requiring immediate isolation and evacuation.',
          immediateActions: [
            'Evacuate upwind immediately.',
            'Eliminate all open flames, electrical switches, and vehicle engines.',
            'Do not use mobile phones directly inside smell zone.',
            'Barricade perimeter 100 meters away.',
          ],
          resourcesNeeded: ['hazmat_squad', 'utility_crew', 'fire_unit'],
          estimatedResponseTime: 7,
          processedAt: new Date(Date.now() - 2 * 60000).toISOString(),
          model: 'gemini-3.6-flash',
        },
        assignedResponders: [],
        media: [],
        statusHistory: [{ status: 'reported', changedAt: new Date(Date.now() - 2 * 60000).toISOString() }],
        createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
      },
      {
        _id: 'case_05',
        caseId: 'CC-10245',
        type: 'medical_emergency',
        severity: 'high',
        status: 'resolved',
        description: 'Severe anaphylactic allergic reaction at outdoor cafe near Marine Drive. Patient administered EpiPen on scene.',
        peopleAffected: 1,
        location: {
          type: 'Point',
          coordinates: [BASE_LNG + 0.005, BASE_LAT + 0.012],
          address: '420 Colaba Causeway',
          landmark: 'Near Gateway of India',
          city: 'Mumbai',
        },
        aiAnalysis: {
          severity: 'high',
          type: 'medical_emergency',
          confidence: 0.96,
          summary: 'Severe acute anaphylaxis with airway swelling. Successfully stabilized following prompt epinephrine injection.',
          immediateActions: [
            'Monitor patient posture (keep legs elevated).',
            'Prepare secondary EpiPen dose if symptoms recur within 15 mins.',
            'Transport to hospital for observation.',
          ],
          resourcesNeeded: ['ambulance'],
          estimatedResponseTime: 5,
          processedAt: new Date(Date.now() - 120 * 60000).toISOString(),
          model: 'gemini-3.6-flash',
        },
        assignedResponders: [responder1],
        statusHistory: [
          { status: 'reported', changedAt: new Date(Date.now() - 130 * 60000).toISOString() },
          { status: 'assigned', changedAt: new Date(Date.now() - 125 * 60000).toISOString() },
          { status: 'arrived', changedAt: new Date(Date.now() - 120 * 60000).toISOString() },
          { status: 'resolved', changedAt: new Date(Date.now() - 90 * 60000).toISOString(), note: 'Patient stabilized and safely transferred to hospital' },
        ],
        resolvedAt: new Date(Date.now() - 90 * 60000).toISOString(),
        responseTimeMinutes: 5,
        createdAt: new Date(Date.now() - 130 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 90 * 60000).toISOString(),
      },
      {
        _id: 'case_06',
        caseId: 'CC-10246',
        type: 'building_collapse',
        severity: 'critical',
        status: 'responding',
        description: 'Scaffolding collapse at high-rise construction site trapping two workers under metal beams.',
        peopleAffected: 3,
        location: {
          type: 'Point',
          coordinates: [BASE_LNG + 0.010, BASE_LAT + 0.005],
          address: 'Senapati Bapat Marg, Lower Parel',
          landmark: 'Near Phoenix Mills Junction',
          city: 'Mumbai',
        },
        aiAnalysis: {
          severity: 'critical',
          type: 'building_collapse',
          confidence: 0.97,
          summary: 'Structural scaffolding failure with crushed debris. High risk of secondary fall and severe crush syndrome.',
          immediateActions: [
            'Clear ground area under remaining hanging scaffolding.',
            'Avoid moving heavy debris manually until NDRF / technical rescue arrives.',
            'Maintain verbal contact with trapped individuals.',
          ],
          resourcesNeeded: ['heavy_collapse_rescue', 'crane_unit', 'trauma_ambulance'],
          estimatedResponseTime: 5,
          processedAt: new Date(Date.now() - 25 * 60000).toISOString(),
          model: 'gemini-3.6-flash',
        },
        assignedResponders: [responder2, responder4],
        statusHistory: [
          { status: 'reported', changedAt: new Date(Date.now() - 30 * 60000).toISOString() },
          { status: 'active', changedAt: new Date(Date.now() - 28 * 60000).toISOString() },
          { status: 'responding', changedAt: new Date(Date.now() - 20 * 60000).toISOString() },
        ],
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 60000).toISOString(),
      },
      {
        _id: 'case_07',
        caseId: 'CC-10247',
        type: 'missing_person',
        severity: 'medium',
        status: 'active',
        description: '78-year-old woman with dementia missing from residence since 1 hour ago. Wearing red cardigan sweater.',
        peopleAffected: 1,
        location: {
          type: 'Point',
          coordinates: [BASE_LNG - 0.020, BASE_LAT - 0.005],
          address: 'Juhu Tara Road, Juhu',
          landmark: 'Near Juhu Beach Entrance',
          city: 'Mumbai',
        },
        aiAnalysis: {
          severity: 'medium',
          type: 'missing_person',
          confidence: 0.90,
          summary: 'At-risk missing senior with cognitive impairment. High risk of disorientation or wandering into heavy traffic.',
          immediateActions: [
            'Distribute photo and clothing description to neighborhood responders.',
            'Check nearby beach promenades, bus stops, and shops.',
            'Issue senior emergency alert notification.',
          ],
          resourcesNeeded: ['community_search_unit', 'police'],
          estimatedResponseTime: 10,
          processedAt: new Date(Date.now() - 40 * 60000).toISOString(),
          model: 'gemini-3.6-flash',
        },
        assignedResponders: [],
        statusHistory: [
          { status: 'reported', changedAt: new Date(Date.now() - 45 * 60000).toISOString() },
          { status: 'active', changedAt: new Date(Date.now() - 40 * 60000).toISOString() },
        ],
        createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 40 * 60000).toISOString(),
      },
      {
        _id: 'case_08',
        caseId: 'CC-10248',
        type: 'flood',
        severity: 'high',
        status: 'active',
        description: 'Monsoon waterlogging in subway underpass. Two vehicles stranded in 3-foot deep rising water.',
        peopleAffected: 4,
        location: {
          type: 'Point',
          coordinates: [BASE_LNG - 0.010, BASE_LAT - 0.018],
          address: 'Milan Subway Underpass, Santacruz',
          landmark: 'Santacruz West Junction',
          city: 'Mumbai',
        },
        aiAnalysis: {
          severity: 'high',
          type: 'flood',
          confidence: 0.94,
          summary: 'Rapid inundation of subterranean roadway. Occupants trapped in stalling vehicles with water rising fast.',
          immediateActions: [
            'Do not attempt to drive through submerged underpass.',
            'Advise stranded drivers to climb onto vehicle roof if interior fills with water.',
            'Deploy inflatable water rescue craft.',
          ],
          resourcesNeeded: ['water_rescue_team', 'tow_crane'],
          estimatedResponseTime: 6,
          processedAt: new Date(Date.now() - 15 * 60000).toISOString(),
          model: 'gemini-3.6-flash',
        },
        assignedResponders: [],
        statusHistory: [{ status: 'active', changedAt: new Date(Date.now() - 15 * 60000).toISOString() }],
        createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        _id: 'case_09',
        caseId: 'CC-10249',
        type: 'electrical',
        severity: 'high',
        status: 'resolved',
        description: 'Transformer explosion on utility pole causing live high-voltage power lines to fall across street.',
        peopleAffected: 8,
        location: {
          type: 'Point',
          coordinates: [BASE_LNG + 0.014, BASE_LAT + 0.018],
          address: 'Central Avenue, Hiranandani Powai',
          landmark: 'Powai Lake Circle',
          city: 'Mumbai',
        },
        aiAnalysis: {
          severity: 'high',
          type: 'electrical',
          confidence: 0.97,
          summary: 'Downed live electrical wire across roadway. Extreme electrocution risk to vehicles and pedestrians.',
          immediateActions: [
            'Stay at least 30 feet away from downed lines.',
            'If trapped inside car, remain inside unless fire erupts.',
            'Utility power cut mandatory.',
          ],
          resourcesNeeded: ['power_utility_crew', 'fire_unit', 'police'],
          estimatedResponseTime: 8,
          processedAt: new Date(Date.now() - 240 * 60000).toISOString(),
          model: 'gemini-3.6-flash',
        },
        assignedResponders: [responder2],
        statusHistory: [
          { status: 'reported', changedAt: new Date(Date.now() - 260 * 60000).toISOString() },
          { status: 'resolved', changedAt: new Date(Date.now() - 180 * 60000).toISOString() },
        ],
        resolvedAt: new Date(Date.now() - 180 * 60000).toISOString(),
        responseTimeMinutes: 7,
        createdAt: new Date(Date.now() - 260 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 180 * 60000).toISOString(),
      },
    ];
    */

    rawCases.forEach((c) => {
      this.cases.set(c.caseId!, c as EmergencyCase);
    });

    this.initialized = true;
  }

  // User Methods
  public findUserByEmail(email: string): (User & { passwordHash: string }) | undefined {
    const clean = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === clean) return user;
    }
    return undefined;
  }

  public getUserById(id: string): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const { passwordHash, ...safeUser } = user;
    return safeUser as User;
  }

  public createUser(userData: Partial<User> & { passwordHash: string }): User {
    const id = 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newUser: User & { passwordHash: string } = {
      _id: id,
      name: userData.name || 'Anonymous User',
      email: userData.email!.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      phone: userData.phone || '',
      role: userData.role || 'citizen',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responderProfile: userData.role === 'responder' ? {
        isAvailable: true,
        level: 'basic',
        specializations: ['first_aid'],
        totalCasesHandled: 0,
        rating: 5.0,
        currentLocation: {
          type: 'Point',
          coordinates: [BASE_LNG, BASE_LAT],
        },
      } : undefined,
      emergencyProfile: {
        bloodGroup: 'Unknown',
        allergies: [],
        medicalConditions: [],
        emergencyContacts: [],
        qrCode: '',
        qrPublicToken: 'qr_' + id,
      },
    };

    this.users.set(id, newUser);
    const { passwordHash, ...safeUser } = newUser;
    return safeUser as User;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updated);
    const { passwordHash, ...safeUser } = updated;
    return safeUser as User;
  }

  // Emergency Case Methods
  public getAllCases(): EmergencyCase[] {
    return Array.from(this.cases.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getCaseByCaseId(caseId: string): EmergencyCase | undefined {
    return this.cases.get(caseId);
  }

  public createCase(caseData: Partial<EmergencyCase>): EmergencyCase {
    const count = this.cases.size + 10240;
    const caseId = `CC-${count + 1}`;
    const id = `case_${Date.now()}`;

    const newCase: EmergencyCase = {
      _id: id,
      caseId,
      type: caseData.type || 'medical_emergency',
      severity: caseData.severity || 'high',
      status: caseData.status || 'reported',
      reportedBy: caseData.reportedBy,
      location: caseData.location || {
        type: 'Point',
        coordinates: [BASE_LNG, BASE_LAT],
        address: 'Marine Drive, Mumbai',
        city: 'Mumbai',
      },
      description: caseData.description || 'Emergency reported by citizen',
      peopleAffected: caseData.peopleAffected || 1,
      media: caseData.media || [],
      assignedResponders: [],
      statusHistory: [
        {
          status: 'reported',
          changedAt: new Date().toISOString(),
          note: 'Case reported by user',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.cases.set(caseId, newCase);
    return newCase;
  }

  public updateCase(caseId: string, updates: Partial<EmergencyCase> & { note?: string }): EmergencyCase | undefined {
    const existing = this.cases.get(caseId);
    if (!existing) return undefined;

    let updatedHistory = updates.statusHistory || existing.statusHistory || [];
    if (updates.status && updates.status !== existing.status && !updates.statusHistory) {
      updatedHistory = [
        ...updatedHistory,
        {
          status: updates.status,
          changedAt: new Date().toISOString(),
          note: updates.note || `Status updated to ${updates.status}`,
        },
      ];
    }

    let resolvedAt = updates.resolvedAt || existing.resolvedAt;
    let responseTimeMinutes = updates.responseTimeMinutes || existing.responseTimeMinutes;
    if (updates.status === 'resolved' && !resolvedAt) {
      resolvedAt = new Date().toISOString();
      const createdMs = new Date(existing.createdAt).getTime();
      const diffMs = Date.now() - createdMs;
      const elapsed = Math.round((diffMs / 60000) * 10) / 10;
      responseTimeMinutes = elapsed > 0.1 ? elapsed : 2.5;
    }

    const updated: EmergencyCase = {
      ...existing,
      ...updates,
      resolvedAt,
      responseTimeMinutes,
      statusHistory: updatedHistory,
      updatedAt: new Date().toISOString(),
    };

    this.cases.set(caseId, updated);
    return updated;
  }

  public getNearbyCases(lat: number, lng: number, radiusMeters: number = 5000): EmergencyCase[] {
    return this.getAllCases().filter((c) => {
      const [cLng, cLat] = c.location.coordinates;
      const dist = calculateDistance(lat, lng, cLat, cLng);
      return dist <= radiusMeters;
    });
  }

  public getActiveCases(): EmergencyCase[] {
    return this.getAllCases().filter(
      (c) => c.status !== 'resolved' && c.status !== 'cancelled'
    );
  }

  public getHeatmapData(): Array<{ lat: number; lng: number; intensity: number }> {
    return this.getAllCases().map((c) => {
      const [lng, lat] = c.location.coordinates;
      let intensity = 0.5;
      if (c.severity === 'critical') intensity = 1.0;
      else if (c.severity === 'high') intensity = 0.8;
      else if (c.severity === 'medium') intensity = 0.6;
      return { lat, lng, intensity };
    });
  }

  public getNearbyFacilities(lat: number, lng: number, radiusMeters: number = 5000): NearbyFacility[] {
    return this.facilities
      .map((fac) => {
        const dist = calculateDistance(lat, lng, fac.coordinates[1], fac.coordinates[0]);
        return { ...fac, distance: dist };
      })
      .filter((fac) => fac.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  }

  // Admin Stats
  public getAdminStats() {
    const all = this.getAllCases();
    const active = all.filter((c) => c.status !== 'resolved' && c.status !== 'cancelled');
    const critical = active.filter((c) => c.severity === 'critical');
    const resolvedToday = all.filter((c) => {
      if (c.status !== 'resolved') return false;
      if (!c.resolvedAt) return true;
      const resolvedDate = new Date(c.resolvedAt).toDateString();
      return resolvedDate === new Date().toDateString();
    });

    let totalResponseMinutes = 0;
    let responseCount = 0;
    all.forEach((c) => {
      if (c.responseTimeMinutes) {
        totalResponseMinutes += c.responseTimeMinutes;
        responseCount++;
      }
    });

    const avgResponseTimeMinutes = responseCount > 0 ? Math.round((totalResponseMinutes / responseCount) * 10) / 10 : 5.4;

    const respondersOnline = Array.from(this.users.values()).filter(
      (u) => u.role === 'responder' && u.responderProfile?.isAvailable
    ).length;

    const casesByType: Record<string, number> = {};
    const casesBySeverity: Record<string, number> = {};

    all.forEach((c) => {
      casesByType[c.type] = (casesByType[c.type] || 0) + 1;
      casesBySeverity[c.severity] = (casesBySeverity[c.severity] || 0) + 1;
    });

    return {
      activeCases: active.length,
      respondersOnline,
      resolvedToday: resolvedToday.length,
      avgResponseTimeMinutes,
      criticalCases: critical.length,
      totalUsers: this.users.size,
      casesByType,
      casesBySeverity,
    };
  }

  public getAnalyticsData() {
    // Generate 7-day trends for Recharts
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trends.push({
        date: dateStr,
        reported: Math.floor(12 + Math.random() * 10),
        resolved: Math.floor(10 + Math.random() * 8),
        avgResponseTime: Math.round((4.5 + Math.random() * 2) * 10) / 10,
      });
    }

    const hourly = [
      { hour: '00:00', count: 2 },
      { hour: '03:00', count: 1 },
      { hour: '06:00', count: 4 },
      { hour: '09:00', count: 9 },
      { hour: '12:00', count: 14 },
      { hour: '15:00', count: 11 },
      { hour: '18:00', count: 16 },
      { hour: '21:00', count: 7 },
    ];

    return { trends, hourly };
  }

  public getCaseMessages(caseId: string): EmergencyMessage[] {
    return this.caseMessages.get(caseId) || [];
  }

  public addCaseMessage(caseId: string, messageData: Partial<EmergencyMessage>): EmergencyMessage {
    const messages = this.getCaseMessages(caseId);
    const newMsg: EmergencyMessage = {
      _id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      caseId,
      senderId: messageData.senderId || 'user_anon',
      senderName: messageData.senderName || 'Dispatcher / Citizen',
      senderRole: messageData.senderRole || 'citizen',
      content: messageData.content || '',
      sentAt: new Date().toISOString(),
    };
    messages.push(newMsg);
    this.caseMessages.set(caseId, messages);
    return newMsg;
  }
}

export const db = new Database();
