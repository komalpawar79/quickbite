import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import { createServer } from 'http';
import websocketService from './services/websocketService.js';

import authRoutes from './routes/auth.js';
import canteenRoutes from './routes/canteen.js';
import canteenMenuRoutes from './routes/canteenMenu.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import adminDashboardRoutes from './routes/adminDashboard.js';
import userRoutes from './routes/user.js';
import walletRoutes from './routes/wallet.js';
import canteenDashboardMenuRoutes from './routes/canteenMenuRoutes.js';
import canteenDashboardOrderRoutes from './routes/canteenOrderRoutes.js';
import canteenDashboardAnalyticsRoutes from './routes/canteenAnalyticsRoutes.js';
import canteenDashboardSettingsRoutes from './routes/canteenSettingsRoutes.js';
import notificationRoutes from './routes/notifications.js';
import messagesRoutes from './routes/messages.js';
import NotificationService from './services/notificationService.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });
console.log('✅ Environment loaded - JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow all localhost origins in development
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else if (origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(null, true); // Allow in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(mongoSanitize());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');
    console.log('Setting up routes...');
    
    // Initialize WebSocket
    const io = websocketService.initialize(httpServer);
    console.log('WebSocket initialized');
    
    // Initialize Notification Service with Socket.IO instance
    const notificationService = new NotificationService(io);
    global.notificationService = notificationService; // Make it globally available
    console.log('📬 Notification Service initialized');
    
    try {
      app.use('/api/auth', authRoutes);
      app.use('/api/canteens', canteenRoutes);
      app.use('/api/canteen', canteenMenuRoutes);
      app.use('/api/menu', menuRoutes);
      app.use('/api/orders', orderRoutes);
      app.use('/api/payments', paymentRoutes);
      // IMPORTANT: Register more specific routes BEFORE general routes to avoid collision
      app.use('/api/admin/dashboard', adminDashboardRoutes);
      app.use('/api/admin', adminRoutes);
      app.use('/api/users', userRoutes);
      app.use('/api/wallet', walletRoutes);
      app.use('/api/notifications', notificationRoutes);
      app.use('/api/messages', messagesRoutes);
      app.use('/api/canteen-dashboard', canteenDashboardMenuRoutes);
      app.use('/api/canteen-dashboard', canteenDashboardOrderRoutes);
      app.use('/api/canteen-dashboard/analytics', canteenDashboardAnalyticsRoutes);
      app.use('/api/canteen-dashboard', canteenDashboardSettingsRoutes);

      // Health check
      app.get('/api/health', (req, res) => {
        res.json({ status: 'Server is running' });
      });

      // Error handling middleware
      app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ 
          error: 'Something went wrong!',
          message: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      });

      console.log('Routes setup complete. Starting server...');
      const PORT = process.env.PORT || 5000;
      httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('WebSocket server ready');
        console.log('Server listening on all interfaces');
      });
      httpServer.on('error', (err) => {
        console.error('Server error:', err);
      });
    } catch (routeError) {
      console.error('Error setting up routes:', routeError);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
