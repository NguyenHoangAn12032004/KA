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

    // Clean disconnect existing socket if any
    if (this.socket) {
      console.log('🔌 [SocketService] Cleaning up existing socket...');
      this.cleanupSocket();
    }

    console.log('🔌 [SocketService] Creating new socket connection to:', API_BASE_URL);
    this.currentToken = token; // Store the current token
    
    this.socket = io(API_BASE_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    console.log('🔌 [SocketService] Socket created, setting up event listeners...');
    this.setupEventListeners();

    // Re-register all existing listeners
    this.reregisterListeners();
  }

  private cleanupSocket(): void {
    if (this.socket) {
      // Remove all listeners before disconnecting
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 [SocketService] Socket cleanup completed');
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    console.log('🔌 [SocketService] Setting up event listeners...');

    this.socket.on('connect', () => {
      console.log('🔌 [SocketService] Socket connected:', this.socket?.id);
      console.log('🔌 [SocketService] Socket connected state:', this.socket?.connected);
      
      // Re-register all listeners after connection
      this.reregisterListeners();
      
      // Join pending company room if any
      if (this.pendingCompanyRoom) {
        this.joinCompanyRoom(this.pendingCompanyRoom);
        this.pendingCompanyRoom = null;
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 [SocketService] Socket disconnected, reason:', reason);
      if (reason === 'io server disconnect') {
        console.log('🔌 [SocketService] Server initiated disconnect, attempting reconnect...');
      } else {
        console.log('🔌 [SocketService] Manual disconnect, not attempting reconnect');
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 [SocketService] Connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔌 [SocketService] Reconnected after', attemptNumber, 'attempts');
      this.reregisterListeners();
    });

    console.log('🔌 [SocketService] Event listeners setup completed');
  }

  disconnect(): void {
    console.log('🔌 [SocketService] disconnect() called');
    this.cleanupSocket();
    this.currentToken = null;
  }

  joinUserRoom(userId: string): void {
    console.log('👤 [SocketService] joinUserRoom called with:', userId);
    
    if (!this.socket || !this.socket.connected) {
      console.log('❌ [SocketService] Cannot join user room - socket not connected');
      return;
    }

    console.log('👤 [SocketService] Joining user room immediately:', userId);
    this.socket.emit('join-user-room', userId);
    console.log('✅ [SocketService] Successfully joined user room for:', userId);
  }

  joinCompanyRoom(companyId: string): void {
    console.log('🏢 [SocketService] joinCompanyRoom called with:', companyId);
    
    if (!this.socket || !this.socket.connected) {
      console.log('⏳ [SocketService] Socket not connected, storing pending company room:', companyId);
      this.pendingCompanyRoom = companyId;
      return;
    }

    console.log('🏢 [SocketService] Joining company room immediately:', companyId);
    this.socket.emit('join-company-room', companyId);
    console.log('✅ [SocketService] Successfully joined company room for:', companyId);
  }

  joinJobRoom(roomId: string): void {
    console.log('💼 [SocketService] joinJobRoom called with:', roomId);
    
    if (!this.socket || !this.socket.connected) {
      console.log('❌ [SocketService] Cannot join job room - socket not connected');
      return;
    }

    console.log('💼 [SocketService] Joining job room immediately:', roomId);
    this.socket.emit('join-job-room', roomId);
    console.log('✅ [SocketService] Successfully joined job room for:', roomId);
  }

  emit(event: string, data: any): void {
    if (!this.socket || !this.socket.connected) {
      console.log('❌ [SocketService] Cannot emit - socket not connected');
      return;
    }

    console.log(`📤 [SocketService] Emitting event: ${event}`, data);
    this.socket.emit(event, data);
  }

  on(event: string, callback: Function): void {
    console.log(`👂 [SocketService] Registering listener for event: ${event}`);

    // Add to listeners map for cleanup and re-registration
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    // If socket is connected, register immediately
    if (this.socket && this.socket.connected) {
      console.log(`✅ [SocketService] Socket connected, registering listener for: ${event}`);
      this.socket.on(event, (data: any) => {
        console.log(`📨 [SocketService] Received event ${event}:`, data);
        callback(data);
      });
    } else {
      console.log(`⏳ [SocketService] Socket not connected, listener for ${event} will be registered on connect`);
    }
  }

  private reregisterListeners(): void {
    if (!this.socket || !this.socket.connected) {
      console.log('❌ [SocketService] Cannot reregister listeners - socket not connected');
      return;
    }

    console.log('🔄 [SocketService] Re-registering all listeners...');
    
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        console.log(`🔄 [SocketService] Re-registering listener for: ${event}`);
        this.socket!.on(event, (data: any) => {
          console.log(`📨 [SocketService] Received event ${event}:`, data);
          callback(data);
        });
      });
    });
    
    console.log('✅ [SocketService] All listeners re-registered');
  }

  off(event: string): void {
    if (!this.socket) return;
    
    this.socket.off(event);
    this.listeners.delete(event);
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

export default new SocketService();