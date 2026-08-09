import { Router, Request, Response } from 'express';
import { db } from './db.js';
import {
  hashPassword,
  comparePassword,
  generateTokens,
  authMiddleware,
  roleGuard,
  AuthRequest,
} from './auth.js';
import { aiService } from './ai.ts';
import { emitNewCase, emitCaseUpdate, emitAIResult, emitUserNotification } from './socket.js';

export const router = Router();

const requireAuth = authMiddleware((id) => db.getUserById(id));

// ==========================================
// 1. AUTH ROUTES (/api/auth)
// ==========================================

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    const passwordHash = await hashPassword(password);
    const user = db.createUser({
      name,
      email,
      passwordHash,
      role: role || 'citizen',
      phone,
    });

    const tokens = generateTokens(user);

    return res.status(201).json({
      success: true,
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Account created successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Registration failed' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const userWithHash = db.findUserByEmail(email);
    if (!userWithHash) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, userWithHash.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = db.getUserById(userWithHash._id)!;
    const tokens = generateTokens(user);

    return res.json({
      success: true,
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: `Welcome back, ${user.name}`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
});

router.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  return res.json({ success: true, data: req.user });
});

router.patch('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { name, phone, emergencyProfile, fcmToken } = req.body;
  const updated = db.updateUser(req.user._id, {
    name: name || req.user.name,
    phone: phone !== undefined ? phone : req.user.phone,
    fcmToken: fcmToken !== undefined ? fcmToken : req.user.fcmToken,
    emergencyProfile: emergencyProfile
      ? { ...req.user.emergencyProfile, ...emergencyProfile }
      : req.user.emergencyProfile,
  });

  return res.json({ success: true, data: updated, message: 'Profile updated' });
});

router.post('/auth/logout', (req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// 2. EMERGENCY CASES (/api/cases)
// ==========================================

router.post('/cases', async (req: Request, res: Response) => {
  try {
    const { type, severity, description, peopleAffected, location, imageBase64, reportedByName } = req.body;

    if (!description) {
      return res.status(400).json({ success: false, message: 'Emergency description is required' });
    }

    // Create initial case entry
    const newCase = db.createCase({
      type: type || 'medical_emergency',
      severity: severity || 'high',
      status: 'reported',
      description,
      peopleAffected: Number(peopleAffected) || 1,
      location: location || {
        type: 'Point',
        coordinates: [72.8777, 19.0760],
        address: 'Marine Drive, Mumbai',
        city: 'Mumbai',
      },
      media: imageBase64
        ? [
            {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
              type: 'image',
              uploadedAt: new Date().toISOString(),
            },
          ]
        : [],
    });

    // Broadcast instant new case alert
    emitNewCase(newCase);

    // Asynchronous AI Classification with Gemini
    setTimeout(async () => {
      try {
        db.updateCase(newCase.caseId, { status: 'ai_processing' });
        emitCaseUpdate(newCase.caseId, db.getCaseByCaseId(newCase.caseId));

        const aiResult = await aiService.classifyEmergency({
          description,
          imageBase64,
          type,
          peopleAffected,
          address: location?.address,
        });

        const updated = db.updateCase(newCase.caseId, {
          status: 'active',
          severity: aiResult.severity,
          type: (aiResult.type as any) || newCase.type,
          aiAnalysis: {
            ...aiResult,
            processedAt: new Date().toISOString(),
            model: 'gemini-3.6-flash',
          },
        });

        emitAIResult(newCase.caseId, updated?.aiAnalysis);
        emitCaseUpdate(newCase.caseId, updated);

        // Auto-progress lifecycle through to resolved within max 6 minutes (360 seconds)
        // 1. Assigned (at 35s)
        setTimeout(() => {
          const c = db.getCaseByCaseId(newCase.caseId);
          if (c && (c.status === 'active' || c.status === 'ai_processing')) {
            const upd = db.updateCase(newCase.caseId, { status: 'assigned', note: 'Emergency dispatch units assigned' });
            emitCaseUpdate(newCase.caseId, upd);
          }
        }, 35000);

        // 2. En Route (at 100s)
        setTimeout(() => {
          const c = db.getCaseByCaseId(newCase.caseId);
          if (c && c.status === 'assigned') {
            const upd = db.updateCase(newCase.caseId, { status: 'responding', note: 'Units en route with sirens' });
            emitCaseUpdate(newCase.caseId, upd);
          }
        }, 100000);

        // 3. On Scene (at 210s = 3.5m)
        setTimeout(() => {
          const c = db.getCaseByCaseId(newCase.caseId);
          if (c && c.status === 'responding') {
            const upd = db.updateCase(newCase.caseId, { status: 'arrived', note: 'Responders arrived on scene' });
            emitCaseUpdate(newCase.caseId, upd);
          }
        }, 210000);

        // 4. Resolved (at max 360s = 6m)
        setTimeout(() => {
          const c = db.getCaseByCaseId(newCase.caseId);
          if (c && c.status !== 'resolved') {
            const upd = db.updateCase(newCase.caseId, { status: 'resolved', note: 'Incident successfully resolved within max 6 minute window' });
            emitCaseUpdate(newCase.caseId, upd);
          }
        }, 360000);
      } catch (e) {
        console.warn('AI Processing error on case:', e);
      }
    }, 1000);

    return res.status(201).json({
      success: true,
      data: newCase,
      message: 'Emergency reported successfully. Responders notified.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to report emergency' });
  }
});

router.get('/cases', (req: Request, res: Response) => {
  const { status, severity, type, search } = req.query;
  let cases = db.getAllCases();

  if (status) {
    cases = cases.filter((c) => c.status === status);
  }
  if (severity) {
    cases = cases.filter((c) => c.severity === severity);
  }
  if (type) {
    cases = cases.filter((c) => c.type === type);
  }
  if (search) {
    const term = String(search).toLowerCase();
    cases = cases.filter(
      (c) =>
        c.caseId.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        (c.location.address && c.location.address.toLowerCase().includes(term))
    );
  }

  return res.json({
    success: true,
    data: cases,
    pagination: {
      page: 1,
      limit: 50,
      total: cases.length,
      pages: 1,
    },
  });
});

router.get('/cases/active', (req: Request, res: Response) => {
  const cases = db.getActiveCases();
  return res.json({ success: true, data: cases });
});

router.get('/cases/heatmap', (req: Request, res: Response) => {
  const data = db.getHeatmapData();
  return res.json({ success: true, data });
});

router.get('/cases/nearby', (req: Request, res: Response) => {
  const { lat, lng, radius } = req.query;
  const latitude = Number(lat) || 19.0760;
  const longitude = Number(lng) || 72.8777;
  const rad = Number(radius) || 10000;

  const cases = db.getNearbyCases(latitude, longitude, rad);
  return res.json({ success: true, data: cases });
});

router.get('/cases/:caseId', (req: Request, res: Response) => {
  const { caseId } = req.params;
  const caseData = db.getCaseByCaseId(caseId);

  if (!caseData) {
    return res.status(404).json({ success: false, message: 'Emergency case not found' });
  }

  // Attach nearby facilities to case details
  const [lng, lat] = caseData.location.coordinates;
  const facilities = db.getNearbyFacilities(lat, lng, 10000);

  return res.json({
    success: true,
    data: {
      ...caseData,
      nearbyFacilities: facilities,
    },
  });
});

router.get('/cases/:caseId/messages', (req: Request, res: Response) => {
  const { caseId } = req.params;
  const messages = db.getCaseMessages(caseId);
  return res.json({ success: true, data: messages });
});

router.post('/cases/:caseId/messages', (req: Request, res: Response) => {
  const { caseId } = req.params;
  const { content, senderRole, senderName, senderId } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Message content is required' });
  }

  const msg = db.addCaseMessage(caseId, {
    content: content.trim(),
    senderRole: senderRole || 'citizen',
    senderName: senderName || 'Dispatcher',
    senderId: senderId || 'user_anon',
  });

  return res.json({ success: true, data: msg });
});

router.patch('/cases/:caseId/status', requireAuth, (req: AuthRequest, res: Response) => {
  const { caseId } = req.params;
  const { status, note } = req.body;

  const caseData = db.getCaseByCaseId(caseId);
  if (!caseData) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  const updatedHistory = [
    ...(caseData.statusHistory || []),
    {
      status,
      changedBy: req.user
        ? { _id: req.user._id, name: req.user.name, role: req.user.role }
        : undefined,
      changedAt: new Date().toISOString(),
      note: note || `Status updated to ${status}`,
    },
  ];

  const resolvedAt = status === 'resolved' ? new Date().toISOString() : caseData.resolvedAt;
  let responseTimeMinutes = caseData.responseTimeMinutes;
  if (status === 'resolved' && !responseTimeMinutes) {
    const start = new Date(caseData.createdAt).getTime();
    responseTimeMinutes = Math.max(2, Math.round((Date.now() - start) / 60000));
  }

  const updated = db.updateCase(caseId, {
    status,
    statusHistory: updatedHistory,
    resolvedAt,
    responseTimeMinutes,
  });

  emitCaseUpdate(caseId, updated);
  return res.json({ success: true, data: updated, message: `Status changed to ${status}` });
});

router.post('/cases/:caseId/accept', requireAuth, roleGuard(['responder', 'admin']), (req: AuthRequest, res: Response) => {
  const { caseId } = req.params;
  const caseData = db.getCaseByCaseId(caseId);

  if (!caseData) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  const user = req.user!;
  const existingAssigned = caseData.assignedResponders || [];
  if (existingAssigned.some((r) => r._id === user._id)) {
    return res.status(400).json({ success: false, message: 'You have already accepted this emergency case' });
  }

  const updatedAssigned = [...existingAssigned, user];
  const updated = db.updateCase(caseId, {
    status: 'assigned',
    assignedResponders: updatedAssigned,
    statusHistory: [
      ...(caseData.statusHistory || []),
      {
        status: 'assigned',
        changedBy: { _id: user._id, name: user.name, role: user.role },
        changedAt: new Date().toISOString(),
        note: `Responder ${user.name} accepted the emergency case`,
      },
    ],
  });

  emitCaseUpdate(caseId, updated);
  return res.json({ success: true, data: updated, message: 'Case accepted. Route directions initialized.' });
});

router.post('/cases/:caseId/media', (req: Request, res: Response) => {
  const { caseId } = req.params;
  const { url, type } = req.body;

  const caseData = db.getCaseByCaseId(caseId);
  if (!caseData) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }

  const mediaItem = {
    url,
    type: type || 'image',
    uploadedAt: new Date().toISOString(),
  };

  const updated = db.updateCase(caseId, {
    media: [...(caseData.media || []), mediaItem],
  });

  emitCaseUpdate(caseId, updated);
  return res.json({ success: true, data: updated });
});

// ==========================================
// 3. RESPONDERS (/api/responders)
// ==========================================

router.get('/responders', (req: Request, res: Response) => {
  const responders = Array.from(db.users.values())
    .filter((u) => u.role === 'responder')
    .map((u) => db.getUserById(u._id));
  return res.json({ success: true, data: responders });
});

router.patch('/responders/availability', requireAuth, roleGuard(['responder']), (req: AuthRequest, res: Response) => {
  const { isAvailable, location } = req.body;
  const user = req.user!;

  const updated = db.updateUser(user._id, {
    responderProfile: {
      ...user.responderProfile!,
      isAvailable: isAvailable !== undefined ? isAvailable : user.responderProfile?.isAvailable!,
      currentLocation: location || user.responderProfile?.currentLocation,
    },
  });

  return res.json({ success: true, data: updated });
});

router.get('/responders/dashboard', requireAuth, roleGuard(['responder']), (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const allCases = db.getAllCases();
  const assigned = allCases.filter((c) =>
    c.assignedResponders?.some((r) => r._id === user._id)
  );

  return res.json({
    success: true,
    data: {
      user,
      assignedCases: assigned,
      activeEmergencies: db.getActiveCases(),
      stats: {
        casesHandled: user.responderProfile?.totalCasesHandled || assigned.length,
        rating: user.responderProfile?.rating || 4.9,
        isAvailable: user.responderProfile?.isAvailable || false,
      },
    },
  });
});

// ==========================================
// 4. USERS & QR CODE (/api/users)
// ==========================================

router.get('/users', requireAuth, roleGuard(['admin']), (req: Request, res: Response) => {
  const users = Array.from(db.users.values()).map((u) => db.getUserById(u._id));
  return res.json({ success: true, data: users });
});

router.get('/users/qr/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  let foundUser = null;

  for (const user of db.users.values()) {
    if (user.emergencyProfile?.qrPublicToken === token) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    return res.status(404).json({ success: false, message: 'Public emergency medical card not found' });
  }

  return res.json({
    success: true,
    data: {
      name: foundUser.name,
      bloodGroup: foundUser.emergencyProfile?.bloodGroup || 'Not specified',
      allergies: foundUser.emergencyProfile?.allergies || [],
      medicalConditions: foundUser.emergencyProfile?.medicalConditions || [],
      emergencyContacts: foundUser.emergencyProfile?.emergencyContacts || [],
    },
  });
});

// ==========================================
// 5. ADMIN & DEMO SIMULATOR (/api/admin)
// ==========================================

router.get('/admin/stats', (req: Request, res: Response) => {
  const stats = db.getAdminStats();
  return res.json({ success: true, data: stats });
});

router.get('/admin/analytics', (req: Request, res: Response) => {
  const data = db.getAnalyticsData();
  return res.json({ success: true, data });
});

router.post('/admin/assign', requireAuth, roleGuard(['admin']), (req: Request, res: Response) => {
  const { caseId, responderId } = req.body;
  const caseData = db.getCaseByCaseId(caseId);
  const responder = db.getUserById(responderId);

  if (!caseData || !responder) {
    return res.status(400).json({ success: false, message: 'Invalid case or responder' });
  }

  const updatedAssigned = [...(caseData.assignedResponders || []), responder];
  const updated = db.updateCase(caseId, {
    status: 'assigned',
    assignedResponders: updatedAssigned,
  });

  emitCaseUpdate(caseId, updated);
  return res.json({ success: true, data: updated, message: `Assigned ${responder.name} to case ${caseId}` });
});

// Live Interactive Demo Trigger Endpoint
router.post('/admin/demo-trigger', async (req: Request, res: Response) => {
  try {
    const demoCase = db.createCase({
      type: 'road_accident',
      severity: 'critical',
      status: 'reported',
      description: 'DEMO LIVE ACCIDENT: High-speed crash near Marine Drive & Nariman Point. Vehicle smoke detected, 2 persons trapped.',
      peopleAffected: 2,
      location: {
        type: 'Point',
        coordinates: [72.8232, 18.9220],
        address: 'Marine Drive & Nariman Point Junction',
        city: 'Mumbai',
      },
    });

    emitNewCase(demoCase);

    // Step 2: AI Result (3s)
    setTimeout(() => {
      const aiResult = {
        severity: 'critical' as const,
        type: 'road_accident',
        confidence: 0.98,
        summary: 'Critical multi-impact crash with passenger entanglements. High risk of spinal injury.',
        immediateActions: [
          'Keep victim head immobile.',
          'Secure battery disconnect to prevent fire.',
          'Deploy heavy hydraulic cutters.',
        ],
        resourcesNeeded: ['heavy_rescue', 'ambulance', 'fire_engine'],
        estimatedResponseTime: 3,
        processedAt: new Date().toISOString(),
        model: 'gemini-3.6-flash',
      };

      const updated = db.updateCase(demoCase.caseId, {
        status: 'active',
        aiAnalysis: aiResult,
      });

      emitAIResult(demoCase.caseId, aiResult);
    }, 3000);

    // Step 3: Responder Accept (6s)
    setTimeout(() => {
      const responder = db.getUserById('usr_resp_01');
      if (responder) {
        const updated = db.updateCase(demoCase.caseId, {
          status: 'assigned',
          assignedResponders: [responder],
        });
        emitCaseUpdate(demoCase.caseId, updated);
      }
    }, 6000);

    // Step 4: Responding (9s)
    setTimeout(() => {
      const updated = db.updateCase(demoCase.caseId, {
        status: 'responding',
      });
      emitCaseUpdate(demoCase.caseId, updated);
    }, 9000);

    return res.json({
      success: true,
      data: demoCase,
      message: 'Live demo emergency scenario initialized! Watch real-time updates on Map & Track pages.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Demo trigger failed' });
  }
});

router.post('/admin/reset', (req: Request, res: Response) => {
  try {
    db.clearAllCases();
    return res.json({
      success: true,
      message: 'All system metrics and cases reset to 0',
      data: {
        totalCases: 0,
        activeCases: 0,
        respondersOnline: 0,
        resolvedToday: 0,
        avgResponseTimeMinutes: 0,
        criticalCases: 0,
        totalUsers: 0,
        casesByType: {},
        casesBySeverity: {},
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Reset failed' });
  }
});

// ==========================================
// 6. FACILITIES (/api/facilities)
// ==========================================

router.get('/facilities/nearby', (req: Request, res: Response) => {
  const { lat, lng, radius } = req.query;
  const latitude = Number(lat) || 19.0760;
  const longitude = Number(lng) || 72.8777;
  const rad = Number(radius) || 10000;

  const facilities = db.getNearbyFacilities(latitude, longitude, rad);
  return res.json({ success: true, data: facilities });
});

// ==========================================
// 7. NOTIFICATIONS (/api/notifications)
// ==========================================

router.get('/notifications', requireAuth, (req: AuthRequest, res: Response) => {
  return res.json({ success: true, data: [] });
});
