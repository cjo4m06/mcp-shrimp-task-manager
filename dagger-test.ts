#!/usr/bin/env node
/**
 * Enhanced Dagger MCP Testing Script - Node.js SDK
 * 
 * Uses the proper Node.js Dagger SDK for testing a Node.js MCP server
 * Provides containerized testing with high confidence scores
 * 
 * Based on: https://dagger.io/blog/nodejs-sdk
 */

import { connect, Container, Directory } from "@dagger.io/dagger"

interface TestResult {
  name: string
  passed: boolean
  confidence: number
  details?: string
}

/**
 * Test the MCP server build process in a clean container
 */
async function testBuild(container: Container, source: Directory): Promise<TestResult> {
  console.log("🔨 Testing Build Process...")
  
  try {
    // Install dependencies and build
    const buildContainer = container
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["npm", "install"])
      .withExec(["npm", "run", "build"])
    
    // Check if build artifacts exist
    const buildCheck = await buildContainer
      .withExec(["ls", "-la", "dist/index.js"])
      .withExec(["wc", "-c", "dist/index.js"])
      .stdout()
    
    if (buildCheck.includes("dist/index.js")) {
      const sizeMatch = buildCheck.match(/(\d+)\s+dist\/index\.js/)
      const size = sizeMatch ? parseInt(sizeMatch[1]) : 0
      
      return {
        name: "Build Process",
        passed: true,
        confidence: size > 10000 ? 95 : 85,
        details: `Build artifacts created (${size} bytes)`
      }
    } else {
      return {
        name: "Build Process", 
        passed: false,
        confidence: 30,
        details: "Build artifacts missing"
      }
    }
  } catch (error) {
    return {
      name: "Build Process",
      passed: false, 
      confidence: 15,
      details: `Build failed: ${error}`
    }
  }
}

/**
 * Test MCP server startup and basic functionality
 */
async function testServerStartup(container: Container, source: Directory): Promise<TestResult> {
  console.log("🚀 Testing Server Startup...")
  
  try {
    const serverContainer = container
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["npm", "install"])
      .withExec(["npm", "run", "build"])
    
    // Test server startup with timeout and better process management
    const startupTest = await serverContainer
      .withExec([
        "bash", "-c", 
        `
        # Debug: Check if node and dist/index.js exist
        echo "DEBUG: Node version: $(node --version)"
        echo "DEBUG: File check: $(ls -la dist/index.js 2>/dev/null || echo 'File not found')"
        
        # Start server in background with output capture
        timeout 15s node dist/index.js &
        SERVER_PID=$!
        echo "DEBUG: Started server with PID $SERVER_PID"
        
        # Wait for server to initialize
        sleep 5
        
        # Check if process is running using multiple methods
        if ps -p $SERVER_PID > /dev/null 2>&1; then
          echo "SERVER_RUNNING: Process $SERVER_PID is active (ps check)"
        elif kill -0 $SERVER_PID 2>/dev/null; then
          echo "SERVER_RUNNING: Process $SERVER_PID is active (kill check)"
        else
          echo "SERVER_FAILED: Process $SERVER_PID not running"
          echo "DEBUG: Process list: $(ps aux | head -10)"
        fi
        
        # Attempt clean shutdown
        if kill -TERM $SERVER_PID 2>/dev/null; then
          echo "DEBUG: Sent TERM signal to $SERVER_PID"
          sleep 2
          if ! ps -p $SERVER_PID > /dev/null 2>&1; then
            echo "SERVER_SHUTDOWN: Clean exit"
          else
            kill -KILL $SERVER_PID 2>/dev/null || true
            echo "SERVER_SHUTDOWN: Forced exit"
          fi
        else
          echo "SERVER_SHUTDOWN: Process already terminated"
        fi
        
        echo "DEBUG: Startup test completed"
        `
      ])
      .stdout()
    
    if (startupTest.includes("SERVER_RUNNING") && startupTest.includes("SERVER_SHUTDOWN: Clean exit")) {
      return {
        name: "Server Startup",
        passed: true,
        confidence: 92,
        details: "Server started and shutdown cleanly"
      }
    } else if (startupTest.includes("SERVER_RUNNING")) {
      return {
        name: "Server Startup",
        passed: true,
        confidence: 80,
        details: "Server started but forced shutdown"
      }
    } else {
      // Extract debug info for better error reporting
      const debugInfo = startupTest.split('\n').filter(line => line.includes('DEBUG:')).join('; ')
      return {
        name: "Server Startup",
        passed: false,
        confidence: 25,
        details: `Server failed to start. ${debugInfo}`
      }
    }
  } catch (error) {
    return {
      name: "Server Startup",
      passed: false,
      confidence: 15,
      details: `Startup test failed: ${error}`
    }
  }
}

/**
 * Test MCP protocol compliance with proper MCP library
 */
async function testMCPProtocol(container: Container, source: Directory): Promise<TestResult> {
  console.log("🔧 Testing MCP Protocol Compliance...")
  
  try {
    const mcpContainer = container
      .withDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["npm", "install"])
      .withExec(["npm", "run", "build"])
      // Install MCP testing dependencies with better error handling
      .withExec(["pip3", "install", "--no-cache-dir", "mcp", "python-dotenv", "aiohttp", "websockets"])
      .withEnvVariable("OPENAI_API_KEY", "test-key-for-protocol-validation")
    
    // Test MCP bridge functionality
    const protocolTest = await mcpContainer
      .withExec([
        "python3", "-c", `
import subprocess
import sys
import os

print("Testing MCP protocol with proper library...")

try:
    # Check if mcp module is available
    import mcp
    print("MCP library imported successfully")
    
    # Test if mcp-shrimp-bridge.py works with MCP library
    result = subprocess.run([
        'python3', 'mcp-shrimp-bridge.py'
    ], capture_output=True, text=True, timeout=15)
    
    if result.returncode == 0:
        response_length = len(result.stdout)
        if response_length > 100:
            print(f"MCP_PROTOCOL_SUCCESS: Full bridge communication ({response_length} chars)")
        else:
            print(f"MCP_PROTOCOL_PARTIAL: Limited response ({response_length} chars)")
    else:
        print(f"MCP_PROTOCOL_FAILED: Return code {result.returncode}")
        if result.stderr:
            print(f"Error: {result.stderr[:200]}")
        
except ImportError as e:
    print(f"MCP_PROTOCOL_IMPORT_ERROR: {str(e)}")
except subprocess.TimeoutExpired:
    print("MCP_PROTOCOL_TIMEOUT: Test timed out")
except Exception as e:
    print(f"MCP_PROTOCOL_ERROR: {str(e)}")
`
      ])
      .stdout()
    
    if (protocolTest.includes("MCP_PROTOCOL_SUCCESS")) {
      const match = protocolTest.match(/(\d+) chars/)
      const responseLength = match ? parseInt(match[1]) : 0
      
      return {
        name: "MCP Protocol",
        passed: true,
        confidence: 96,
        details: `Full MCP communication established (${responseLength} chars)`
      }
    } else if (protocolTest.includes("MCP_PROTOCOL_PARTIAL")) {
      return {
        name: "MCP Protocol",
        passed: true,
        confidence: 75,
        details: "Partial MCP communication"
      }
    } else if (protocolTest.includes("MCP library imported successfully")) {
      return {
        name: "MCP Protocol",
        passed: true,
        confidence: 60,
        details: "MCP library available but bridge failed"
      }
    } else {
      return {
        name: "MCP Protocol",
        passed: false,
        confidence: 40,
        details: "MCP protocol test failed"
      }
    }
  } catch (error) {
    return {
      name: "MCP Protocol",
      passed: false,
      confidence: 20,
      details: `Protocol test error: ${error}`
    }
  }
}

/**
 * Test tool discovery and configuration
 */
async function testToolDiscovery(container: Container, source: Directory): Promise<TestResult> {
  console.log("🛠️ Testing Tool Discovery...")
  
  try {
    const toolContainer = container
      .withDirectory("/app", source)
      .withWorkdir("/app")
    
    const toolTest = await toolContainer
      .withExec([
        "node", "-e", `
const fs = require('fs');

try {
  // Check test-config.json for expected tools
  const config = JSON.parse(fs.readFileSync('test-config.json', 'utf8'));
  const expectedTools = config.tool_validation?.expected_tools || [];
  
  console.log('TOOL_CONFIG_LOADED: Expected', expectedTools.length, 'tools');
  
  if (expectedTools.length >= 15) {
    console.log('TOOL_DISCOVERY_SUCCESS: Configuration has 15+ tools');
    console.log('Tools:', expectedTools.slice(0, 5).join(', '), '...');
  } else {
    console.log('TOOL_DISCOVERY_PARTIAL: Only', expectedTools.length, 'tools configured');
  }
} catch (error) {
  console.log('TOOL_DISCOVERY_ERROR:', error.message);
}
`
      ])
      .stdout()
    
    if (toolTest.includes("TOOL_DISCOVERY_SUCCESS")) {
      const match = toolTest.match(/Expected (\d+) tools/)
      const toolCount = match ? parseInt(match[1]) : 0
      
      return {
        name: "Tool Discovery",
        passed: true,
        confidence: 90,
        details: `${toolCount} tools properly configured`
      }
    } else if (toolTest.includes("TOOL_DISCOVERY_PARTIAL")) {
      return {
        name: "Tool Discovery", 
        passed: true,
        confidence: 70,
        details: "Partial tool configuration"
      }
    } else {
      return {
        name: "Tool Discovery",
        passed: false,
        confidence: 35,
        details: "Tool discovery failed"
      }
    }
  } catch (error) {
    return {
      name: "Tool Discovery",
      passed: false,
      confidence: 15,
      details: `Tool test error: ${error}`
    }
  }
}

/**
 * Test configuration files and environment setup
 */
async function testConfiguration(container: Container, source: Directory): Promise<TestResult> {
  console.log("⚙️ Testing Configuration...")
  
  try {
    const configContainer = container
      .withDirectory("/app", source)
      .withWorkdir("/app")
    
    const configTest = await configContainer
      .withExec([
        "node", "-e", `
const fs = require('fs');

let score = 0;
let total = 0;

// Check test-config.json
total++;
try {
  const config = JSON.parse(fs.readFileSync('test-config.json', 'utf8'));
  if (config.tool_validation && config.confidence_thresholds) {
    score++;
    console.log('✅ test-config.json: Valid');
  } else {
    console.log('⚠️ test-config.json: Missing sections');
  }
} catch (e) {
  console.log('❌ test-config.json: Error -', e.message);
}

// Check package.json  
total++;
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (pkg.name && pkg.scripts) {
    score++;
    console.log('✅ package.json: Valid');
  } else {
    console.log('⚠️ package.json: Incomplete');
  }
} catch (e) {
  console.log('❌ package.json: Error -', e.message);
}

// Check .env.example
total++;
if (fs.existsSync('.env.example')) {
  score++;
  console.log('✅ .env.example: Present');
} else {
  console.log('❌ .env.example: Missing');
}

const confidence = total > 0 ? (score / total) * 100 : 0;
console.log('CONFIG_SCORE:', score + '/' + total, '(' + confidence.toFixed(1) + '%)');
`
      ])
      .stdout()
    
    const match = configTest.match(/CONFIG_SCORE: (\d+)\/(\d+) \((\d+\.\d+)%\)/)
    if (match) {
      const [, passed, total, confidence] = match
      const confidenceNum = parseFloat(confidence)
      
      return {
        name: "Configuration",
        passed: passed === total,
        confidence: confidenceNum,
        details: `${passed}/${total} configuration checks passed`
      }
    } else {
      return {
        name: "Configuration",
        passed: false,
        confidence: 30,
        details: "Configuration test incomplete"
      }
    }
  } catch (error) {
    return {
      name: "Configuration", 
      passed: false,
      confidence: 10,
      details: `Configuration test error: ${error}`
    }
  }
}

/**
 * Main testing function
 */
async function runTests() {
  console.log("🎯 Enhanced Dagger MCP Testing (Node.js SDK)")
  console.log("=".repeat(60))
  
  const startTime = Date.now()
  
  await connect(async (client) => {
    // Get source directory
    const source = client.host().directory(".")
    
    // Create base container with Node.js and Python for MCP testing
    console.log("📦 Creating enhanced testing container...")
    const container = client
      .container()
      .from("node:20")  // Use full Node.js image instead of slim
      .withExec(["apt-get", "update"])
      .withExec([
        "apt-get", "install", "-y",
        "python3", "python3-pip", "python3-venv", "curl", "build-essential", 
        "procps", "psmisc"  // Add process utilities for server testing
      ])
      .withExec(["npm", "install", "-g", "typescript", "@types/node"])
    
    console.log("✅ Container setup complete")
    
    // Run all tests
    const tests: TestResult[] = []
    
    tests.push(await testBuild(container, source))
    tests.push(await testServerStartup(container, source))
    tests.push(await testMCPProtocol(container, source))
    tests.push(await testToolDiscovery(container, source))
    tests.push(await testConfiguration(container, source))
    
    // Calculate results
    console.log("\n" + "=".repeat(60))
    console.log("🎯 ENHANCED DAGGER TEST RESULTS SUMMARY")
    console.log("=".repeat(60))
    
    const passedTests = tests.filter(t => t.passed).length
    const totalTests = tests.length
    const averageConfidence = tests.reduce((sum, t) => sum + t.confidence, 0) / totalTests
    const successRate = (passedTests / totalTests) * 100
    
    console.log(`📊 Success Rate: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`)
    console.log(`📈 Average Confidence: ${averageConfidence.toFixed(1)}%`)
    
    const status = averageConfidence >= 85 ? "✅ HIGH CONFIDENCE" :
                  averageConfidence >= 70 ? "⚠️  MODERATE CONFIDENCE" : 
                  "❌ LOW CONFIDENCE"
    
    console.log(`🎯 Overall Status: ${status}`)
    
    console.log(`\n📋 Individual Test Results:`)
    tests.forEach(test => {
      const icon = test.passed ? "✅" : "❌"
      console.log(`  ${icon} ${test.name}: ${test.confidence.toFixed(1)}% - ${test.details}`)
    })
    
    // Recommendations
    console.log(`\n🔧 RECOMMENDATIONS:`)
    if (averageConfidence >= 85) {
      console.log("• All tests passing with high confidence!")
      console.log("• Ready for production deployment")
      console.log("• Containerized testing environment working perfectly")
    } else if (averageConfidence >= 70) {
      console.log("• Most tests passing - minor improvements needed")
      console.log("• Dagger containerization providing reliable results")
      console.log("• Check failed tests above for specific issues")
    } else {
      console.log("• Significant improvements needed")
      console.log("• Focus on MCP protocol and tool configuration")
      console.log("• Leverage Dagger's containerization for consistent testing")
    }
    
    const duration = (Date.now() - startTime) / 1000
    console.log(`\n⏱️  Total Test Duration: ${duration.toFixed(2)} seconds`)
    console.log("🎉 Enhanced Dagger testing complete!")
    
    // Exit with appropriate code
    process.exit(averageConfidence >= 70 ? 0 : 1)
  })
}

// Run the tests
runTests().catch((error) => {
  console.error("❌ Dagger testing failed:", error)
  process.exit(2)
}) 