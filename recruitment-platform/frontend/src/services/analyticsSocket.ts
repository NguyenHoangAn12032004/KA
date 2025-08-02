import { io, Socket } from 'socket.io-client';

class AnalyticsSocketService {
  private socket: Socket | null = null;
  private analyticsUrl = 'http://localhost:3001';
  private eventHandlers: Map<string, ((data: any) => void)[]> = new Map();

  connect() {
    if (this.socket?.connected) {
      console.log('📡 Analytics socket already connected');
      return;
    }

    console.log('📡 Connecting to analytics socket server...');
    this.socket = io(this.analyticsUrl, {
      transports: ['websocket', 'polling'],
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('📡 Analytics socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('📡 Analytics socket disconnected');
    });

    this.socket.on('analytics-update', (data: any) => {
      console.log('📊 Analytics update received:', data);
      // Notify all subscribers
      this.notifyHandlers('analytics-update', data);
    });

    return this.socket;
  }

  private notifyHandlers(event: string, data: any) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(callback);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  get connected() {
    return this.socket?.connected || false;
  }
}

export const analyticsSocketService = new AnalyticsSocketService();
