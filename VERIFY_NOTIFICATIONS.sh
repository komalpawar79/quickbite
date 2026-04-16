#!/bin/bash

# QuickBite Notification System - Verification Script
# This script helps verify the notification system is properly configured

echo "🔍 QuickBite Notification System Verification"
echo "=============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Backend server status
echo "📡 Check 1: Backend Server Status"
echo "Command: lsof -i :5000 (or netstat -ano | findstr :5000 on Windows)"
echo "Expected: Node.js process listening on port 5000"
echo ""

# Check 2: MongoDB connection
echo "🔗 Check 2: MongoDB Connection"
echo "Look for logs: 'Database connected successfully'"
echo "Also check: '📬 Notification Service initialized'"
echo ""

# Check 3: Frontend socket connection
echo "💻 Check 3: Frontend Socket Connection"
echo "1. Open browser console (F12)"
echo "2. Go to admin dashboard"
echo "3. Look for: '✅ Socket connected'"
echo "4. Look for: 'join-admin event emitted'"
echo ""

# Check 4: Test notification creation
echo "📤 Check 4: Test Notification Creation"
echo "Use Postman or curl to create an order:"
echo ""
echo "  curl -X POST http://localhost:5000/api/orders \\"
echo "    -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{"
echo "      \"items\": [{\"menuItem\": \"menuItemId\", \"quantity\": 1}],"
echo "      \"totalAmount\": 100"
echo "    }'"
echo ""
echo "Expected backend log:"
echo "  ✅ Notification saved: order - New order received (#..."
echo "  📡 Emitted new_notification to admin-dashboard"
echo ""

# Check 5: Verify frontend updates
echo "🎯 Check 5: Verify Frontend Updates"
echo "After creating order:"
echo "  1. Bell icon badge should show '1 New'"
echo "  2. Click bell → dropdown shows notification"
echo "  3. Browser console shows: 📬 New notification: order - New order received"
echo "  4. Sound should play"
echo ""

# Check 6: API endpoints
echo "🔌 Check 6: Verify API Endpoints"
echo "Test each endpoint with your admin token:"
echo ""
echo "  # Get all notifications"
echo "  curl -H \"Authorization: Bearer TOKEN\" http://localhost:5000/api/notifications"
echo ""
echo "  # Get unread count"
echo "  curl -H \"Authorization: Bearer TOKEN\" http://localhost:5000/api/notifications/unread/count"
echo ""
echo "  # Mark as read"
echo "  curl -X PUT -H \"Authorization: Bearer TOKEN\" http://localhost:5000/api/notifications/NOTIFICATION_ID/read"
echo ""
echo "  # Mark all as read"
echo "  curl -X PUT -H \"Authorization: Bearer TOKEN\" http://localhost:5000/api/notifications/all/read"
echo ""

# Check 7: Database check
echo "💾 Check 7: Database Check"
echo "Connect to MongoDB and check:"
echo ""
echo "  use canteen_db  # (or your db name)"
echo "  db.notifications.find().pretty()"
echo ""
echo "Should show notification documents with:"
echo "  - type: 'order' | 'payment' | 'cancel' | 'alert'"
echo "  - message: notification text"
echo "  - isRead: true | false"
echo "  - relatedId: ObjectId reference"
echo ""

# Check 8: Frontend components
echo "📝 Check 8: Frontend Components"
echo "Verify these files exist:"
echo ""
echo "  ✓ frontend/src/components/admin/NotificationBell.js"
echo "  ✓ frontend/src/components/admin/NotificationsModule.js"
echo "  ✓ frontend/src/store/notificationStore.js"
echo ""
echo "Verify AdminDashboardNew.js has:"
echo "  ✓ import NotificationBell from '../components/admin/NotificationBell'"
echo "  ✓ import NotificationsModule from '../components/admin/NotificationsModule'"
echo "  ✓ const { initializeSocket, disconnectSocket } = useNotificationStore();"
echo ""

# Check 9: Socket.IO configuration
echo "⚙️  Check 9: Socket.IO Configuration"
echo "Backend (server.js):"
echo "  ✓ const io = websocketService.initialize(httpServer);"
echo "  ✓ const notificationService = new NotificationService(io);"
echo "  ✓ global.notificationService = notificationService;"
echo "  ✓ app.use('/api/notifications', notificationRoutes);"
echo ""
echo "Frontend (notificationStore.js):"
echo "  ✓ Socket connects to: http://localhost:5000"
echo "  ✓ Auth via: localStorage.getItem('token')"
echo "  ✓ Emits: 'join-admin' event"
echo ""

# Check 10: Environment variables
echo "🔐 Check 10: Environment Variables"
echo "Backend .env should have:"
echo "  ✓ JWT_SECRET=your_secret"
echo "  ✓ MONGODB_URI=your_mongodb_uri"
echo "  ✓ PORT=5000"
echo ""

echo ""
echo "=============================================="
echo "✅ Verification Complete!"
echo ""
echo "🚀 Quick Start:"
echo "1. Start backend:      cd backend && node server.js"
echo "2. Start frontend:     cd frontend && npm start"
echo "3. Login to admin dashboard"
echo "4. Create an order via Postman"
echo "5. Check notification bell for real-time update"
echo ""
echo "📚 Documentation:"
echo "- NOTIFICATION_SYSTEM.md - Full system documentation"
echo "- FRONTEND_NOTIFICATIONS_GUIDE.md - Frontend setup guide"
echo ""
