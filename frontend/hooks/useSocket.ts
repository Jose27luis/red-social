import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UseSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { namespace = '/messages', autoConnect = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!autoConnect) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('No access token found. Cannot connect to socket.');
      return;
    }

    // Crear conexión de socket
    const socket = io(`${SOCKET_URL}${namespace}`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Escuchar lista de usuarios online
    socket.on('online:users', (users: string[]) => {
      console.log('Online users:', users);
      setOnlineUsers(users);
    });

    // Escuchar cuando un usuario se conecta
    socket.on('user:online', (data: { userId: string }) => {
      console.log('User online:', data.userId);
      setOnlineUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    });

    // Escuchar cuando un usuario se desconecta
    socket.on('user:offline', (data: { userId: string }) => {
      console.log('User offline:', data.userId);
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    // Cleanup al desmontar
    return () => {
      socket.disconnect();
    };
  }, [namespace, autoConnect]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emit = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const on = (event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const off = (event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  };

  const connect = () => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  };

  return {
    isConnected,
    onlineUsers,
    emit,
    on,
    off,
    disconnect,
    connect,
  };
};

export default useSocket;
