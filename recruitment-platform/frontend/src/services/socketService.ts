import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private pendingCompanyRoom: string | null = null; // Store company room to join after connect
  private currentToken: string | null = null; // Store current token for comparison

  constructor() {
    this.socket = null;
  }

  connect(token: string): void {
    console.log('🔌 [SocketService] connect() called with token:', token ? `${token.substring(0, 20)}...` : 'NO_TOKEN');
    
    // Don't reconnect if already connected with same token
    if (this.socket?.connected && this.currentToken === token) {
      console.log('🔌 [SocketService] Socket already connected with same token');
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      console.log('🔌 [SocketService] Disconnecting existing socket before new connection');
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('🔌 [SocketService] Creating new socket connection to:', API_BASE_URL);
    this.currentToken = token; // Store the current token
    this.socket = io(API_BASE_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'], // Add polling as fallback
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true // Force new connection
    });

    console.log('🔌 [SocketService] Socket created, setting up event listeners...');
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) {
      console.error('🚨 [SocketService] Cannot setup listeners - socket is null');
      return;
    }

    console.log('🔌 [SocketService] Setting up event listeners...');

    this.socket.on('connect', () => {
      console.log('🔌 [SocketService] Socket connected:', this.socket?.id);
      console.log('🔌 [SocketService] Socket connected state:', this.socket?.connected);
      
      // Auto-join company room if pending
      if (this.pendingCompanyRoom) {
        console.log('🏢 [SocketService] Auto-joining pending company room:', this.pendingCompanyRoom);
        this.socket?.emit('join-company-room', this.pendingCompanyRoom);
        console.log('🏢 [SocketService] Emitted join-company-room event for:', this.pendingCompanyRoom);
        this.pendingCompanyRoom = null;
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 [SocketService] Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 [SocketService] Socket connection error:', error);
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 [SocketService] Socket reconnected');
    });

    console.log('🔌 [SocketService] Event listeners setup completed');
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null; // Clear the stored token
  }

  joinUserRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('join-user-room', userId);
    }
  }

  joinCompanyRoom(companyId: string): void {
    console.log('🏢 [SocketService] joinCompanyRoom called with:', companyId);
    console.log('🏢 [SocketService] Socket state - connected:', this.socket?.connected, 'exists:', !!this.socket);
    
    if (this.socket?.connected) {
      console.log('🏢 [SocketService] Joining company room immediately:', companyId);
      this.socket.emit('join-company-room', companyId);
      console.log('🏢 [SocketService] Emitted join-company-room event for:', companyId);
    } else {
      console.log('🏢 [SocketService] Socket not connected, storing company room for later:', companyId);
      this.pendingCompanyRoom = companyId;
      
      // If socket exists but not connected, try to connect
      if (this.socket) {
        console.log('🏢 [SocketService] Socket exists but not connected, attempting to connect...');
        this.socket.connect();
      } else {
        console.log('🚨 [SocketService] No socket instance exists! Cannot join room');
      }
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