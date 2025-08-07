import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
}

export const useSocket = (namespace?: string): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return;
    }

    const socketURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    // For admin namespace, connect to specific namespace
    const fullURL = namespace === 'admin' ? `${socketURL}/admin` : socketURL;
    
    const newSocket = io(fullURL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // For non-admin namespaces, emit join event
    if (namespace && namespace !== 'admin') {
      newSocket.emit('join-namespace', namespace);
    }

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('🚫 Socket connection error:', err);
      setError(err.message);
      setConnected(false);
    });

    newSocket.on('error', (err) => {
      console.error('🚫 Socket error:', err);
      setError(err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [namespace]);

  return { socket, connected, error };
};
