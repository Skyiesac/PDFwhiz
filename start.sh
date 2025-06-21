#!/bin/bash

echo "🚀 Starting PDF Chat Assistant..."

# Start Redis
echo "📦 Starting Redis..."
cd backend
./redis-setup.sh start
if [ $? -ne 0 ]; then
    echo "❌ Failed to start Redis"
    exit 1
fi
cd ..

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
sleep 5

# Start Backend
echo "🔧 Starting Backend..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔌 Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; cd backend; ./redis-setup.sh stop; echo '✅ All services stopped'; exit" INT

wait 