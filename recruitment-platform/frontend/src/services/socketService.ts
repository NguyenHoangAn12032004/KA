import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.socket = null;
  }

  connect(token: string): void {
    if (this.socket) return;

    this.socket = io(API_BASE_URL, {
      auth: {
        token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinUserRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('join-user-room', userId);
    }
  }

  joinCompanyRoom(companyId: string): void {
    if (this.socket) {
      this.socket.emit('join-company-room', companyId);
    }
  }

  joinJobRoom(jobId: string): void {
    if (this.socket) {
      this.socket.emit('join-job-room', jobId);
    }
  }

  on(event: string, callback: Function): void {
    if (!this.socket) return;

    // Add to listeners map for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    // Register with socket
    this.socket.on(event, (data: any) => {
      callback(data);
    });
  }

  off(event: string): void {
    if (!this.socket) return;

    // Remove from socket
    this.socket.off(event);

    // Remove from listeners map
    this.listeners.delete(event);
  }

  emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Clean up all listeners
  removeAllListeners(): void {
    if (!this.socket) return;

    this.listeners.forEach((_, event) => {
      this.socket?.off(event);
    });
    this.listeners.clear();
  }
}

// Export as singleton
const socketService = new SocketService();
export default socketService; 