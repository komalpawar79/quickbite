#!/bin/bash
# Campus Canteen - Quick Start Script

echo "🍜 Campus Canteen - Quick Start Guide"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
echo "================================"

cd backend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration!"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "✅ Backend setup complete!"
echo ""

# Frontend setup
echo "📦 Setting up Frontend..."
echo "================================"

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "✅ Frontend setup complete!"
echo ""

# Summary
echo "🎉 Setup Complete!"
echo "================================"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Start MongoDB (if using local):"
echo "   Windows: mongod"
echo "   Mac: brew services start mongodb-community"
echo ""
echo "2. Start Backend Server:"
echo "   cd backend"
echo "   npm run dev"
echo "   Server will run on: http://localhost:5000"
echo ""
echo "3. Start Frontend Server (in new terminal):"
echo "   cd frontend"
echo "   npm start"
echo "   App will open on: http://localhost:3000"
echo ""
echo "4. Login with demo credentials:"
echo "   Email: demo@university.edu"
echo "   Password: password123"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - SETUP.md - Detailed setup guide"
echo "   - API_DOCUMENTATION.md - API endpoints"
echo "   - DEVELOPMENT.md - Development guidelines"
echo ""
echo "🔗 Useful Links:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5000/api/health"
echo "   - MongoDB: mongodb://localhost:27017/campus-canteen"
echo ""
echo "Happy coding! 🚀"
