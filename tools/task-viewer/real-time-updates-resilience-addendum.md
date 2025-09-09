# Real-Time Updates: Resilience & Edge Cases Addendum

## Critical Architectural Challenges

### 1. MCP Server Without Task Viewer

**Current Behavior:**
- MCP server runs independently via stdio transport
- Task viewer is optional (controlled by `ENABLE_GUI` env variable)
- Tasks are stored in JSON files regardless of viewer presence

**Problems When No Viewer Running:**
1. **WebSocket Connection Attempts**: If MCP tries to notify a non-existent viewer
2. **Resource Waste**: Maintaining connection pools for absent clients
3. **Error Accumulation**: Failed connection attempts may queue up

**Solution: Graceful Degradation**
```javascript
// MCP Server side
class TaskNotifier {
  constructor() {
    this.viewerConnected = false;
    this.pendingUpdates = [];
    this.maxRetries = 3;
  }
  
  async notifyTaskUpdate(task) {
    if (!this.viewerConnected) {
      // Just write to file, don't attempt WebSocket
      await this.writeToFile(task);
      return;
    }
    
    try {
      await this.sendWebSocketUpdate(task);
    } catch (error) {
      this.viewerConnected = false;
      // Fallback to file-only mode
      await this.writeToFile(task);
    }
  }
  
  async checkViewerHealth() {
    try {
      const response = await fetch('http://localhost:9998/health');
      this.viewerConnected = response.ok;
    } catch {
      this.viewerConnected = false;
    }
  }
}
```

### 2. Server Lifecycle Management Issues

**Scenarios:**
- Task viewer starts → stops → restarts
- Task viewer crashes without cleanup
- User manually kills process
- System shutdown/restart

**Current Problems:**
```bash
# Example of zombie server
$ npm start
# Server running on :9998
# User hits Ctrl+C but port not released
$ npm start
# Error: EADDRINUSE :::9998
```

**Solution: Robust Lifecycle Management**
```javascript
// server.js improvements
class ResilientServer {
  constructor(port) {
    this.port = port;
    this.server = null;
    this.connections = new Set();
    this.shutdownInProgress = false;
  }
  
  async start() {
    // Check if port is already in use
    const portInUse = await this.checkPort(this.port);
    
    if (portInUse) {
      console.log(`Port ${this.port} in use, trying alternatives...`);
      this.port = await this.findAvailablePort(this.port);
    }
    
    this.server = http.createServer(this.handleRequest);
    
    // Track all connections for graceful shutdown
    this.server.on('connection', (conn) => {
      this.connections.add(conn);
      conn.on('close', () => this.connections.delete(conn));
    });
    
    // Graceful shutdown handlers
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('SIGINT', () => this.gracefulShutdown());
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception:', err);
      this.gracefulShutdown();
    });
    
    await this.server.listen(this.port);
    
    // Write PID file for external monitoring
    await fs.writeFile('.task-viewer.pid', process.pid.toString());
    
    // Announce availability via IPC or file
    await this.announceServer();
  }
  
  async gracefulShutdown() {
    if (this.shutdownInProgress) return;
    this.shutdownInProgress = true;
    
    console.log('Graceful shutdown initiated...');
    
    // Stop accepting new connections
    this.server.close();
    
    // Close existing connections
    for (const conn of this.connections) {
      conn.end();
    }
    
    // Clean up PID file
    await fs.unlink('.task-viewer.pid').catch(() => {});
    
    // Clean up port lock
    await this.releasePort();
    
    process.exit(0);
  }
  
  async findAvailablePort(startPort) {
    for (let port = startPort; port < startPort + 100; port++) {
      if (!(await this.checkPort(port))) {
        return port;
      }
    }
    throw new Error('No available ports found');
  }
}
```

### 3. Multiple Task Viewer Instances

**Problem Scenarios:**
1. User accidentally starts multiple viewers
2. Zombie process holds port, new instance starts on different port
3. Multiple users on same machine running viewers
4. Docker/container environments with port mapping

**Current Issues:**
- Port conflicts (EADDRINUSE)
- WebSocket clients connecting to wrong instance
- Data inconsistency between viewers
- Resource multiplication

**Solution: Instance Coordination**
```javascript
// Multi-instance manager
class InstanceCoordinator {
  constructor() {
    this.instanceId = crypto.randomUUID();
    this.lockFile = path.join(os.tmpdir(), 'task-viewer.lock');
    this.registryFile = path.join(os.tmpdir(), 'task-viewer-instances.json');
  }
  
  async acquireLock() {
    try {
      // Check for existing instances
      const instances = await this.getRunningInstances();
      
      if (instances.length > 0) {
        console.log('Existing instances detected:');
        instances.forEach(inst => {
          console.log(`- Port ${inst.port} (PID: ${inst.pid})`);
        });
        
        // Offer options
        const choice = await this.promptUser([
          '1. Take over (kill existing)',
          '2. Run alongside (different port)',
          '3. Cancel'
        ]);
        
        switch(choice) {
          case 1:
            await this.killExistingInstances(instances);
            break;
          case 2:
            this.port = await this.findFreePort();
            break;
          case 3:
            process.exit(0);
        }
      }
      
      // Register this instance
      await this.registerInstance();
      
    } catch (error) {
      console.error('Lock acquisition failed:', error);
    }
  }
  
  async getRunningInstances() {
    try {
      const data = await fs.readFile(this.registryFile, 'utf8');
      const instances = JSON.parse(data);
      
      // Verify each instance is actually running
      return instances.filter(inst => this.isProcessRunning(inst.pid));
    } catch {
      return [];
    }
  }
  
  isProcessRunning(pid) {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }
  
  async registerInstance() {
    const instances = await this.getRunningInstances();
    instances.push({
      id: this.instanceId,
      pid: process.pid,
      port: this.port,
      dataPath: this.dataPath,
      startTime: Date.now()
    });
    
    await fs.writeFile(this.registryFile, JSON.stringify(instances, null, 2));
  }
}
```

### 4. Port Conflict Resolution

**Advanced Port Management:**
```javascript
// Smart port allocation
class PortManager {
  constructor(preferredPort = 9998) {
    this.preferredPort = preferredPort;
    this.portRange = { min: 9990, max: 10010 };
  }
  
  async getPort() {
    // 1. Try preferred port
    if (await this.isPortAvailable(this.preferredPort)) {
      return this.preferredPort;
    }
    
    // 2. Check if our process already owns it
    const owner = await this.getPortOwner(this.preferredPort);
    if (owner && owner.name === 'task-viewer') {
      const shouldTakeOver = await this.promptTakeover(owner);
      if (shouldTakeOver) {
        await this.killProcess(owner.pid);
        await this.waitForPort(this.preferredPort);
        return this.preferredPort;
      }
    }
    
    // 3. Find alternative in range
    for (let p = this.portRange.min; p <= this.portRange.max; p++) {
      if (await this.isPortAvailable(p)) {
        console.log(`Using alternative port: ${p}`);
        return p;
      }
    }
    
    // 4. Use random high port
    return 0; // Let OS assign
  }
  
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const tester = net.createServer()
        .once('error', () => resolve(false))
        .once('listening', () => {
          tester.close(() => resolve(true));
        })
        .listen(port);
    });
  }
  
  async getPortOwner(port) {
    try {
      const result = await exec(`lsof -i :${port} -t`);
      const pid = parseInt(result.stdout.trim());
      const processInfo = await exec(`ps -p ${pid} -o comm=`);
      return { pid, name: processInfo.stdout.trim() };
    } catch {
      return null;
    }
  }
}
```

### 5. WebSocket Resilience for Multi-Instance

**Connection Discovery & Routing:**
```javascript
// Client-side discovery
class ServerDiscovery {
  constructor() {
    this.servers = [];
    this.primaryServer = null;
  }
  
  async discoverServers() {
    const candidates = [
      { host: 'localhost', port: 9998 },
      { host: '127.0.0.1', port: 9998 },
      // Check alternative ports
      ...Array.from({length: 10}, (_, i) => ({
        host: 'localhost',
        port: 9990 + i
      }))
    ];
    
    const checks = candidates.map(async (server) => {
      try {
        const response = await fetch(
          `http://${server.host}:${server.port}/health`,
          { timeout: 1000 }
        );
        
        if (response.ok) {
          const info = await response.json();
          return {
            ...server,
            ...info,
            latency: response.headers.get('X-Response-Time')
          };
        }
      } catch {
        return null;
      }
    });
    
    const results = await Promise.all(checks);
    this.servers = results.filter(Boolean);
    
    // Select best server (lowest latency, matching data path)
    this.primaryServer = this.selectBestServer();
    
    return this.primaryServer;
  }
  
  selectBestServer() {
    // Prioritize: same data path > lowest port > lowest latency
    return this.servers.sort((a, b) => {
      if (a.dataPath === this.targetDataPath && b.dataPath !== this.targetDataPath) return -1;
      if (b.dataPath === this.targetDataPath && a.dataPath !== this.targetDataPath) return 1;
      if (a.port !== b.port) return a.port - b.port;
      return a.latency - b.latency;
    })[0];
  }
}
```

### 6. Unified Solution Architecture

```
┌─────────────────────────────────────────────┐
│            Service Registry                  │
│  (Shared memory / File / Redis)             │
│  - Running instances                        │
│  - Port assignments                         │
│  - Data path mappings                       │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┼──────────┬───────────┐
    ▼          ▼          ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Viewer 1│ │Viewer 2│ │MCP Srv1│ │MCP Srv2│
│Port:9998│ │Port:9999│ │stdio   │ │stdio   │
└────────┘ └────────┘ └────────┘ └────────┘
    │          │          │           │
    └──────────┴──────────┴───────────┘
                   │
           ┌───────▼────────┐
           │  Coordinator   │
           │  - Port mgmt   │
           │  - Health check│
           │  - Routing     │
           └────────────────┘
```

## Recommended Implementation Strategy

### Phase 1: Resilient Server (Week 1)
- Implement graceful shutdown
- Add port conflict resolution
- Create PID file management
- Add health endpoints

### Phase 2: Instance Coordination (Week 2)
- Build instance registry
- Implement discovery mechanism
- Add multi-instance detection
- Create user prompts for conflicts

### Phase 3: Smart Client Connection (Week 3)
- Implement server discovery
- Add automatic reconnection
- Create fallback strategies
- Add connection quality monitoring

### Phase 4: WebSocket Hardening (Week 4)
- Add connection pooling
- Implement circuit breakers
- Add retry logic with backoff
- Create connection state management

### Phase 5: Testing & Monitoring (Week 5)
- Chaos testing (kill processes, network issues)
- Load testing multiple instances
- Monitor resource usage
- Document operational procedures

## Configuration Recommendations

```javascript
// .env configuration
SHRIMP_VIEWER_PORT=9998
SHRIMP_VIEWER_PORT_RANGE=9990-10010
SHRIMP_VIEWER_ALLOW_MULTIPLE=true
SHRIMP_VIEWER_AUTO_KILL_ZOMBIE=false
SHRIMP_VIEWER_HEALTH_CHECK_INTERVAL=5000
SHRIMP_VIEWER_MAX_INSTANCES=3
SHRIMP_VIEWER_WEBSOCKET_RETRY_MAX=5
SHRIMP_VIEWER_WEBSOCKET_RETRY_DELAY=1000
```

## Critical Success Factors

1. **Zero Data Loss**: All task updates must persist even if viewer is down
2. **Automatic Recovery**: System should self-heal from crashes
3. **Clear User Feedback**: Users should understand what's happening
4. **Resource Efficiency**: Don't create unnecessary connections/processes
5. **Backward Compatibility**: Must work with existing MCP setups

## Monitoring & Alerting

```javascript
// Health monitoring endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    instance: instanceId,
    port: currentPort,
    dataPath: currentDataPath,
    uptime: process.uptime(),
    connections: wss.clients.size,
    memory: process.memoryUsage(),
    pid: process.pid
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    websocket_connections: wss.clients.size,
    http_requests_total: httpRequestCount,
    task_updates_total: taskUpdateCount,
    errors_total: errorCount,
    port_conflicts_resolved: portConflictCount
  });
});
```

## Conclusion

The real-time update system must be resilient to:
- Missing task viewers (MCP runs alone)
- Server lifecycle issues (starts/stops/crashes)
- Multiple instance conflicts
- Port allocation problems
- Network disruptions

By implementing the proposed solutions, the system will:
- Gracefully degrade when components are missing
- Automatically resolve port conflicts
- Coordinate multiple instances
- Provide clear operational visibility
- Maintain data consistency across all scenarios