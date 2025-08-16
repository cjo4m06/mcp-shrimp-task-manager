#!/bin/bash

# Restart script for Shrimp Task Viewer

echo "🔄 Restarting Shrimp Task Viewer..."

# Stop any running instances
./stop.sh

# Wait a moment for processes to fully stop
sleep 1

# Start the server
if [ "$1" == "dev" ]; then
    ./start.sh dev
else
    ./start.sh
fi