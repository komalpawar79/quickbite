import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId) {
    if (this.socket?.connected) return;

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      if (userId) {
        this.socket.emit('authenticate', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('order-update', (data) => {
      toast.success(data.message);
      this.emit('order-update', data);
    });

    this.socket.on('status-changed', (data) => {
      toast.success(data.message);
      this.emit('status-changed', data);
    });

    this.socket.on('wallet-update', (data) => {
      this.emit('wallet-update', data);
    });

    this.socket.on('new-order', (data) => {
      this.emit('new-order', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinCanteen(canteenId) {
    if (this.socket?.connected) {
      this.socket.emit('join-canteen', canteenId);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

export default new WebSocketClient();
