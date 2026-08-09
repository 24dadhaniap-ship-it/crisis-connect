import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from './auth.js';
import { db } from './db.js';

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        socket.data.user = decoded;
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`⚡ Socket connected: ${socket.id} (${user ? user.name : 'Guest'})`);

    // Join general admin room if admin
    if (user?.role === 'admin') {
      socket.join('admin');
    }

    // Join personal user room if authenticated
    if (user?._id) {
      socket.join(`user:${user._id}`);
      if (user.role === 'responder') {
        socket.join('responders:mumbai');
      }
    }

    // Case Tracking Rooms
    socket.on('case:join', (caseId: string) => {
      socket.join(`case:${caseId}`);
      console.log(`Socket ${socket.id} joined room case:${caseId}`);
    });

    socket.on('case:leave', (caseId: string) => {
      socket.leave(`case:${caseId}`);
    });

    // Responder updates location in real-time
    socket.on('responder:updateLocation', (data: { lat: number; lng: number; caseId?: string }) => {
      if (user?._id && user.role === 'responder') {
        db.updateUser(user._id, {
          responderProfile: {
            ...db.getUserById(user._id)?.responderProfile!,
            currentLocation: {
              type: 'Point',
              coordinates: [data.lng, data.lat],
            },
          },
        });

        // Broadcast updated location to live map & specific case tracking room
        io?.emit('responder:location', {
          responderId: user._id,
          name: user.name,
          lat: data.lat,
          lng: data.lng,
          caseId: data.caseId,
        });

        if (data.caseId) {
          io?.to(`case:${data.caseId}`).emit('responder:location', {
            responderId: user._id,
            name: user.name,
            lat: data.lat,
            lng: data.lng,
            caseId: data.caseId,
          });
        }
      }
    });

    // Responder toggles online status
    socket.on('responder:toggleAvailable', (data: { isAvailable: boolean }) => {
      if (user?._id && user.role === 'responder') {
        const u = db.getUserById(user._id);
        if (u && u.responderProfile) {
          db.updateUser(user._id, {
            responderProfile: {
              ...u.responderProfile,
              isAvailable: data.isAvailable,
            },
          });
        }

        io?.emit('admin:stats', db.getAdminStats());
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

// Event Broadcast Helpers
export function emitNewCase(caseData: any) {
  if (!io) return;
  io.emit('case:new', caseData);
  io.to('admin').emit('case:new', caseData);
  io.to('responders:mumbai').emit('responder:alert', {
    message: `🚨 Emergency Near You: ${caseData.type.replace('_', ' ').toUpperCase()} (${caseData.severity.toUpperCase()})`,
    caseData,
  });
  io.emit('admin:stats', db.getAdminStats());
}

export function emitCaseUpdate(caseId: string, caseData: any) {
  if (!io) return;
  io.emit('case:updated', caseData);
  io.to(`case:${caseId}`).emit('case:updated', caseData);
  io.to('admin').emit('case:updated', caseData);
  io.emit('admin:stats', db.getAdminStats());
}

export function emitAIResult(caseId: string, aiAnalysis: any) {
  if (!io) return;
  io.to(`case:${caseId}`).emit('case:ai_result', aiAnalysis);
  io.emit('case:updated', db.getCaseByCaseId(caseId));
}

export function emitUserNotification(userId: string, notification: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit('notification:new', notification);
}
