#!/bin/bash

# Stop script for Shrimp Task Viewer

echo "🛑 Stopping Shrimp Task Viewer..."

# Find all node processes running server.js (excluding VSCode TypeScript servers)
PIDS=$(ps aux | grep -E "node.*server\.js" | grep -v grep | grep -v "tsserver" | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "✅ Shrimp Task Viewer is not running"
    exit 0
fi

# Kill each process
for PID in $PIDS; do
    echo "Stopping process $PID..."
    kill $PID 2>/dev/null
    
    # Wait a moment to see if it stops gracefully
    sleep 1
    
    # Check if still running and force kill if needed
    if ps -p $PID > /dev/null 2>&1; then
        echo "Force stopping process $PID..."
        kill -9 $PID 2>/dev/null
    fi
done

# Final check
sleep 1
REMAINING=$(ps aux | grep -E "node.*server\.js" | grep -v grep | grep -v "tsserver" | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "✅ Shrimp Task Viewer stopped successfully!"
else
    echo "⚠️  Warning: Some processes may still be running"
    ps aux | grep -E "node.*server\.js" | grep -v grep | grep -v "tsserver"
fi