#!/bin/bash

# Start script for Shrimp Task Viewer

echo "🦐 Starting Shrimp Task Viewer..."

# Check if already running
RUNNING=$(ps aux | grep -E "node.*server\.js" | grep -v grep | grep -v "tsserver" | wc -l)

if [ "$RUNNING" -gt 0 ]; then
    echo "⚠️  Shrimp Task Viewer is already running!"
    echo "Running processes:"
    ps aux | grep -E "node.*server\.js" | grep -v grep | grep -v "tsserver"
    echo ""
    read -p "Do you want to restart it? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./stop.sh
        sleep 1
    else
        echo "Aborted."
        exit 1
    fi
fi

# Check if we're in development mode
if [ "$1" == "dev" ]; then
    echo "Starting in development mode with hot reload..."
    npm run dev
else
    echo "Starting in production mode..."
    
    # Build if dist doesn't exist or if requested
    if [ ! -d "dist" ] || [ "$1" == "build" ]; then
        echo "Building application..."
        npm run build
    fi
    
    # Start the server
    nohup node server.js > server.log 2>&1 &
    SERVER_PID=$!
    
    # Wait a moment to check if it started successfully
    sleep 2
    
    if ps -p $SERVER_PID > /dev/null; then
        echo "✅ Server started successfully! (PID: $SERVER_PID)"
        echo "Server is running at: http://localhost:9998"
        echo "Logs are being written to: server.log"
        echo ""
        echo "To stop the server, run: ./stop.sh"
    else
        echo "❌ Failed to start server"
        echo "Check server.log for errors"
        exit 1
    fi
fi