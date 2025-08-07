import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, SOCKET_CONFIG } from '../config';

let adminSocket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

export const useAdminSocket = (token: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Chỉ kết nối nếu có token và socket chưa được kết nối
    if (token) {
      if (!adminSocket) {
        console.log('🔌 [AdminSocket] Creating new connection');
        createSocket(token);
      } else if (!adminSocket.connected) {
        console.log('🔌 [AdminSocket] Socket exists but not connected, reconnecting');
        reconnect(token);
      }
    }

    // Cleanup khi unmount
    return () => {
      // Không ngắt kết nối tại đây để giữ socket cho các component khác
      if (adminSocket) {
        console.log('🔌 [AdminSocket] Component unmounting, removing listeners');
        removeEventListeners();
      }
    };
  }, [token]);
  
  // Hàm tạo socket mới
  const createSocket = (authToken: string) => {
    try {
      console.log('🔌 [AdminSocket] Initializing socket with URL:', `${API_BASE_URL}/admin`);
      
      // Tạo socket mới
      adminSocket = io(`${API_BASE_URL}/admin`, {
        auth: { token: authToken },
        transports: ['websocket', 'polling'],
        reconnection: SOCKET_CONFIG.reconnection,
        reconnectionDelay: SOCKET_CONFIG.reconnectionDelay,
        reconnectionDelayMax: SOCKET_CONFIG.reconnectionDelayMax,
        reconnectionAttempts: SOCKET_CONFIG.reconnectionAttempts,
        timeout: 10000 // 10 seconds timeout
      });

      setupEventListeners();
    } catch (error) {
      console.error('🔌 [AdminSocket] Error creating socket:', error);
      scheduleReconnect(authToken);
    }
  };
  
  // Thiết lập các event listener
  const setupEventListeners = () => {
    if (!adminSocket) return;
    
    adminSocket.on('connect', () => {
      console.log('🔌 [AdminSocket] Connected:', adminSocket?.id);
      setIsConnected(true);
      reconnectAttempts = 0;
      
      // Đăng ký nhận cập nhật realtime
      if (adminSocket) {
        console.log('🔌 [AdminSocket] Subscribing to analytics');
        adminSocket.emit('subscribe-analytics');
        adminSocket.emit('admin-subscribe-companies');
      }
    });

    adminSocket.on('disconnect', (reason) => {
      console.log('🔌 [AdminSocket] Disconnected, reason:', reason);
      setIsConnected(false);
      
      // Nếu server ngắt kết nối thì thử kết nối lại
      if (reason === 'io server disconnect' || reason === 'transport close') {
        scheduleReconnect();
      }
    });

    adminSocket.on('connect_error', (error) => {
      console.error('🔌 [AdminSocket] Connection error:', error);
      setIsConnected(false);
      scheduleReconnect();
    });
    
    adminSocket.on('reconnect_attempt', (attempt) => {
      console.log(`🔌 [AdminSocket] Reconnect attempt ${attempt}`);
    });
    
    adminSocket.on('reconnect', (attempt) => {
      console.log(`🔌 [AdminSocket] Reconnected after ${attempt} attempts`);
      setIsConnected(true);
    });
    
    adminSocket.on('reconnect_error', (error) => {
      console.error('🔌 [AdminSocket] Reconnection error:', error);
    });
    
    adminSocket.on('reconnect_failed', () => {
      console.error('🔌 [AdminSocket] Failed to reconnect after all attempts');
      scheduleReconnect();
    });
  };
  
  // Xóa event listeners
  const removeEventListeners = () => {
    if (!adminSocket) return;
    adminSocket.off('connect');
    adminSocket.off('disconnect');
    adminSocket.off('connect_error');
    adminSocket.off('reconnect_attempt');
    adminSocket.off('reconnect');
    adminSocket.off('reconnect_error');
    adminSocket.off('reconnect_failed');
  };
  
  // Thử kết nối lại
  const reconnect = (authToken?: string) => {
    if (adminSocket) {
      // Xóa socket cũ
      removeEventListeners();
      adminSocket.disconnect();
      adminSocket = null;
    }
    
    if (authToken) {
      createSocket(authToken);
    } else if (token) {
      createSocket(token);
    }
  };
  
  // Lên lịch kết nối lại sau một khoảng thời gian
  const scheduleReconnect = (authToken?: string) => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('🔌 [AdminSocket] Max reconnection attempts reached');
      return;
    }
    
    reconnectAttempts++;
    const delay = RECONNECT_DELAY * reconnectAttempts;
    
    console.log(`🔌 [AdminSocket] Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    
    setTimeout(() => {
      console.log('🔌 [AdminSocket] Attempting reconnection');
      reconnect(authToken);
    }, delay);
  };

  return { socket: adminSocket, connected: isConnected };
};

// Helper để lấy instance socket từ bất kỳ đâu
export const getAdminSocket = () => adminSocket;

// Helper để thêm event listeners
export const onAdminEvent = (event: string, callback: (...args: any[]) => void) => {
  if (adminSocket) {
    console.log(`🔌 [AdminSocket] Adding listener for event: ${event}`);
    adminSocket.on(event, callback);
    return true;
  }
  console.warn(`🔌 [AdminSocket] Cannot add listener for ${event}, socket not initialized`);
  return false;
};

// Helper để xóa event listeners
export const offAdminEvent = (event: string, callback?: (...args: any[]) => void) => {
  if (adminSocket) {
    console.log(`🔌 [AdminSocket] Removing listener for event: ${event}`);
    adminSocket.off(event, callback);
    return true;
  }
  return false;
};

// Helper để emit events
export const emitAdminEvent = (event: string, ...args: any[]) => {
  if (adminSocket && adminSocket.connected) {
    console.log(`🔌 [AdminSocket] Emitting event: ${event}`, args);
    adminSocket.emit(event, ...args);
    return true;
  }
  console.warn(`🔌 [AdminSocket] Cannot emit ${event}, socket not connected`);
  return false;
};

// Helper để đăng ký lắng nghe sự kiện khi socket được kết nối
export const onAdminConnected = (callback: () => void) => {
  if (adminSocket) {
    // Nếu socket đã kết nối, thực hiện callback ngay lập tức
    if (adminSocket.connected) {
      callback();
      return true;
    }
    
    // Nếu không, đăng ký callback khi socket kết nối
    adminSocket.once('connect', callback);
    return true;
  }
  return false;
};

// Helper để ngắt kết nối
export const disconnectAdminSocket = () => {
  if (adminSocket) {
    console.log('🔌 [AdminSocket] Disconnecting socket');
    adminSocket.disconnect();
    adminSocket = null;
    reconnectAttempts = 0;
  }
};
