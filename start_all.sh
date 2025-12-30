#!/bin/bash

echo "Starting LLM-MC Services..."
echo

# Start Bot Service in background
echo "[1/2] Starting Bot Service..."
cd bot && npm start &
BOT_PID=$!

# Wait a moment
sleep 2

# Start Backend
echo "[2/2] Starting Python Backend..."
cd backend && ../.venv/bin/python -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

echo
echo "Both services are starting..."
echo "Bot Service: http://localhost:3001"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BOT_PID $BACKEND_PID 2>/dev/null; exit" INT
wait
