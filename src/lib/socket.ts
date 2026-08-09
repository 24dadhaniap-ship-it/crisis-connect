import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    const token = localStorage.getItem('crisis_access_token') || '';

    socketInstance = io(window.location.origin, {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to CrisisConnect Socket.IO Server');
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from CrisisConnect Socket.IO Server');
    });
  }

  return socketInstance;
}

export function reconnectSocketWithToken(token: string) {
  if (socketInstance) {
    socketInstance.disconnect();
  }
  socketInstance = io(window.location.origin, {
    auth: { token },
    autoConnect: true,
  });
}
