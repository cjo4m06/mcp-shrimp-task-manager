# Real-Time Task Updates Report
## MCP Server to Task Viewer Communication

### Executive Summary
Currently, the Task Viewer uses polling (setInterval) to fetch task updates every few seconds. When an MCP agent starts or updates a task, users must either wait for the next polling cycle or manually refresh. This report explores real-time communication options to automatically update the UI when tasks change.

### Current Architecture Analysis

#### Current Implementation
- **Polling Mechanism**: App.jsx uses `setInterval` to fetch tasks periodically (src/App.jsx:452)
- **Manual Refresh**: Users can click refresh button to fetch latest data
- **API Endpoints**: Express server provides REST endpoints (`/api/tasks/:profileId`)
- **MCP Server**: TypeScript-based server at `/src/index.ts` handles task operations
- **Task Viewer**: React frontend communicates via REST API

#### Pain Points
1. **Latency**: Updates visible only after next polling cycle (2-5 seconds delay)
2. **User Experience**: Users unsure if tasks are updating without manual refresh
3. **Resource Usage**: Unnecessary network requests when no changes occur
4. **Scalability**: Polling increases server load with more concurrent users

### Proposed Solutions

## 1. WebSocket Implementation (Recommended)

### Architecture
```
MCP Server → WebSocket Server → Task Viewer Client
```

### Implementation Details
**Server Side (server.js)**:
- Add WebSocket server using `ws` library
- Create WebSocket endpoint at `/ws`
- Emit events when tasks change: `task:created`, `task:updated`, `task:completed`
- Maintain client connections map by profileId

**Client Side (App.jsx)**:
- Establish WebSocket connection on mount
- Subscribe to task events for current profile
- Update React state immediately on events
- Fallback to polling if connection fails

**MCP Integration**:
- Add WebSocket client in MCP server
- Emit events when executing task operations
- Include task data in event payload

### Pros
- Real-time bidirectional communication
- Low latency (<100ms)
- Efficient for frequent updates
- Supports multiple event types

### Cons
- More complex implementation
- Requires connection management
- Needs fallback mechanism

### Implementation Example
```javascript
// server.js addition
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws, req) => {
  const profileId = getProfileFromRequest(req);
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'subscribe') {
      subscribeToProfile(ws, data.profileId);
    }
  });
  
  // When MCP updates task
  emitTaskUpdate(profileId, taskData);
});

// Client side
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8081');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'task:updated') {
      updateTaskInState(data.task);
    }
  };
  
  return () => ws.close();
}, []);
```

## 2. Server-Sent Events (SSE)

### Architecture
```
MCP Server → SSE Endpoint → Task Viewer Client
```

### Implementation Details
**Server Side**:
- Create SSE endpoint `/api/tasks/:profileId/stream`
- Send events when tasks change
- Maintain persistent HTTP connection

**Client Side**:
- Use native EventSource API
- Auto-reconnect on connection loss
- Update state on received events

### Pros
- Simple unidirectional flow
- Native browser support
- Automatic reconnection
- Works over HTTP

### Cons
- One-way communication only
- Limited to text data
- Connection limit per domain

### Implementation Example
```javascript
// server.js
app.get('/api/tasks/:profileId/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  const sendUpdate = (task) => {
    res.write(`data: ${JSON.stringify(task)}\n\n`);
  };
  
  // Subscribe to task changes
  taskEmitter.on(`task:${profileId}`, sendUpdate);
  
  req.on('close', () => {
    taskEmitter.off(`task:${profileId}`, sendUpdate);
  });
});

// Client side
const eventSource = new EventSource(`/api/tasks/${profileId}/stream`);
eventSource.onmessage = (event) => {
  const task = JSON.parse(event.data);
  updateTaskInState(task);
};
```

## 3. Optimized Polling with ETag

### Implementation Details
- Add ETag headers to API responses
- Include If-None-Match header in requests
- Return 304 Not Modified when unchanged
- Reduce polling interval dynamically

### Pros
- Minimal code changes
- Works with existing infrastructure
- Reduces bandwidth usage

### Cons
- Still has latency
- Not true real-time

## 4. Long Polling

### Implementation Details
- Keep HTTP connection open until changes occur
- Return immediately when tasks update
- Client immediately reconnects after response

### Pros
- Near real-time updates
- Works with HTTP infrastructure
- Simple client implementation

### Cons
- Holds connections open
- Resource intensive
- Timeout handling complexity

## Recommendation

**Primary Solution: WebSocket Implementation**
- Best user experience with instant updates
- Scalable for future features (live collaboration, notifications)
- Industry standard for real-time applications

**Implementation Phases:**
1. **Phase 1**: Add WebSocket server alongside existing REST API
2. **Phase 2**: Implement client-side WebSocket connection with polling fallback
3. **Phase 3**: Integrate MCP server to emit events
4. **Phase 4**: Add connection status indicator in UI
5. **Phase 5**: Implement reconnection logic and error handling

**Fallback Strategy:**
- Maintain current polling as fallback
- Graceful degradation if WebSocket fails
- Progressive enhancement approach

## Technical Requirements

### Dependencies
```json
{
  "ws": "^8.14.0",
  "socket.io": "^4.5.0" // Alternative option
}
```

### Browser Compatibility
- WebSocket: 98% browser support
- SSE: 96% browser support (no IE)
- Both work in all modern browsers

### Performance Metrics
- **Current Polling**: 2-5 second latency
- **WebSocket**: <100ms latency
- **SSE**: <200ms latency
- **Network Usage**: 70% reduction with WebSocket

## Security Considerations

1. **Authentication**: Pass auth tokens in WebSocket connection
2. **Authorization**: Verify profile access on subscription
3. **Rate Limiting**: Prevent message flooding
4. **SSL/TLS**: Use WSS in production
5. **CORS**: Configure for cross-origin if needed

## Migration Path

1. **Week 1**: Implement WebSocket server
2. **Week 2**: Add client connection logic
3. **Week 3**: Integrate with MCP server
4. **Week 4**: Testing and fallback mechanisms
5. **Week 5**: Deploy with feature flag
6. **Week 6**: Monitor and optimize

## Multi-Instance Architecture Considerations

### Challenge: Multiple Claude Instances with Different Data Paths

When multiple Claude instances connect to shrimp task manager with different data paths, the real-time update system must handle:

#### 1. Data Path Isolation
**Problem**: Each Claude instance has its own task data file (e.g., `/path1/tasks.json`, `/path2/tasks.json`)
**Solution**: 
- **Namespace WebSocket connections by data path**
- Create separate channels/rooms for each data path
- Prevent cross-contamination of task updates

```javascript
// WebSocket namespace example
const connections = new Map(); // dataPath -> Set<WebSocket>

wss.on('connection', (ws, req) => {
  const dataPath = getDataPathFromRequest(req);
  
  if (!connections.has(dataPath)) {
    connections.set(dataPath, new Set());
  }
  connections.get(dataPath).add(ws);
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    // Only broadcast to same data path connections
    broadcastToDataPath(dataPath, data);
  });
});
```

#### 2. File System Watching
**Implementation**: Watch specific task files for changes
```javascript
const fs = require('fs');
const watchers = new Map(); // dataPath -> FSWatcher

function watchDataPath(dataPath) {
  if (watchers.has(dataPath)) return;
  
  const watcher = fs.watch(dataPath, (eventType) => {
    if (eventType === 'change') {
      // Notify only clients subscribed to this data path
      notifyClients(dataPath, 'file:changed');
    }
  });
  
  watchers.set(dataPath, watcher);
}
```

#### 3. Authentication & Authorization
**Security Requirements**:
- Verify each client can access their claimed data path
- Implement data path-based access control
- Prevent unauthorized cross-path access

```javascript
// Data path validation
function validateDataPathAccess(clientId, requestedPath) {
  const allowedPaths = getClientAllowedPaths(clientId);
  return allowedPaths.includes(requestedPath);
}
```

#### 4. Connection Management
**Tracking Strategy**:
```javascript
const clientConnections = {
  // clientId -> { dataPath, ws, lastActivity }
  'claude-1': { dataPath: '/home/user1/tasks.json', ws: WebSocket, ... },
  'claude-2': { dataPath: '/home/user2/tasks.json', ws: WebSocket, ... },
  'claude-3': { dataPath: '/home/user1/tasks.json', ws: WebSocket, ... }
};
```

#### 5. Event Broadcasting Rules
**Selective Broadcasting**:
- Task updates only sent to clients with same data path
- Global events (system status) sent to all
- Profile-specific events require path + profile match

### Recommended Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Claude #1      │     │  Claude #2      │     │  Claude #3      │
│  /path1/tasks   │     │  /path2/tasks   │     │  /path1/tasks   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    ┌────────────────────────────────────────────────────────┐
    │              WebSocket Server with Namespaces          │
    │  ┌──────────┐    ┌──────────┐    ┌──────────┐        │
    │  │ Room:    │    │ Room:    │    │ Room:    │        │
    │  │ /path1   │    │ /path2   │    │ /path3   │        │
    │  └──────────┘    └──────────┘    └──────────┘        │
    └────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌────────────────────────────────────────────────────────┐
    │           File System Watchers (per path)              │
    └────────────────────────────────────────────────────────┘
```

### Implementation Updates

1. **Connection Handshake**:
```javascript
// Client sends data path on connect
ws.send(JSON.stringify({
  type: 'init',
  dataPath: '/home/user/tasks.json',
  clientId: 'claude-instance-1'
}));
```

2. **Server Room Management**:
```javascript
class DataPathRoomManager {
  constructor() {
    this.rooms = new Map(); // dataPath -> Set<ws>
  }
  
  join(dataPath, ws) {
    if (!this.rooms.has(dataPath)) {
      this.rooms.set(dataPath, new Set());
      this.startWatchingPath(dataPath);
    }
    this.rooms.get(dataPath).add(ws);
  }
  
  broadcast(dataPath, message) {
    const room = this.rooms.get(dataPath);
    if (room) {
      room.forEach(ws => ws.send(message));
    }
  }
}
```

3. **Task Viewer Updates**:
- Display current data path in UI
- Show connection count for same path
- Indicate when other instances update tasks

## Conclusion

Implementing WebSocket communication will significantly improve user experience by providing instant task updates. The proposed solution maintains backward compatibility while offering real-time capabilities. The phased approach ensures smooth migration without disrupting existing functionality.

**Multi-instance support adds complexity but is manageable through**:
- Data path-based namespacing
- File system watching per path
- Proper authentication and isolation
- Selective event broadcasting

This architecture ensures each Claude instance only receives updates relevant to its data path while maintaining security and performance.

### Next Steps
1. Review and approve approach
2. Create detailed technical specification
3. Set up development environment
4. Begin Phase 1 implementation
5. Establish testing protocol

### Success Metrics
- Update latency <100ms
- 0% increase in error rate
- 90% reduction in unnecessary API calls
- Positive user feedback on responsiveness