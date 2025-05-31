#!/usr/bin/env python3
"""
Simple Local MCP Testing Script

This script provides basic MCP protocol testing locally with LLM integration.
Avoids complex async task scope issues while validating core functionality.

Usage:
    python local-mcp-test.py
"""

import asyncio
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, Any

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

class SimpleMCPTester:
    """Simple MCP tester for local validation"""
    
    def __init__(self):
        self.server_process = None
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
    def check_environment(self) -> Dict[str, Any]:
        """Check local environment setup"""
        print("🔍 Environment Check")
        print("=" * 40)
        
        results = {
            "node_available": self._check_command("node --version"),
            "npm_available": self._check_command("npm --version"),
            "python_available": self._check_command("python --version"),
            "mcp_server_built": Path("dist/index.js").exists(),
            "openai_api_key": bool(self.openai_api_key),
            "config_file": Path("test-config.json").exists()
        }
        
        for check, status in results.items():
            status_icon = "✅" if status else "❌"
            print(f"{status_icon} {check.replace('_', ' ').title()}: {status}")
        
        return results
    
    def _check_command(self, command: str) -> bool:
        """Check if a command is available"""
        try:
            result = subprocess.run(command.split(), capture_output=True, text=True)
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    def test_mcp_server_startup(self) -> Dict[str, Any]:
        """Test MCP server can start and respond"""
        print("\n🚀 MCP Server Startup Test")
        print("=" * 40)
        
        try:
            # Test basic server startup
            result = subprocess.run([
                "node", "dist/index.js"
            ], input='{"jsonrpc": "2.0", "method": "initialize", "id": 1, "params": {"capabilities": {}, "clientInfo": {"name": "test", "version": "1.0"}}}\n', 
            text=True, capture_output=True, timeout=5)
            
            if result.returncode == 0 or "jsonrpc" in result.stdout:
                print("✅ MCP Server responds to JSON-RPC messages")
                return {"status": "success", "response_length": len(result.stdout)}
            else:
                print("❌ MCP Server failed to respond properly")
                print(f"   Error: {result.stderr[:200]}")
                return {"status": "failed", "error": result.stderr}
                
        except subprocess.TimeoutExpired:
            print("⚠️  MCP Server startup timeout (this is normal for stdio servers)")
            return {"status": "timeout", "note": "Expected for stdio transport"}
        except Exception as e:
            print(f"❌ MCP Server test failed: {e}")
            return {"status": "error", "error": str(e)}
    
    def test_config_validation(self) -> Dict[str, Any]:
        """Test configuration file validation"""
        print("\n📋 Configuration Validation")
        print("=" * 40)
        
        try:
            with open("test-config.json", "r") as f:
                config = json.load(f)
            
            expected_tools = config.get("tool_validation", {}).get("expected_tools", [])
            tool_count = len(expected_tools)
            
            print(f"✅ Configuration loaded successfully")
            print(f"✅ Expected tools: {tool_count}")
            print(f"   Sample tools: {', '.join(expected_tools[:3])}...")
            
            return {
                "status": "success", 
                "tool_count": tool_count,
                "expected_tools": expected_tools
            }
            
        except Exception as e:
            print(f"❌ Configuration validation failed: {e}")
            return {"status": "error", "error": str(e)}
    
    def test_openai_connectivity(self) -> Dict[str, Any]:
        """Test OpenAI API connectivity"""
        print("\n🧠 OpenAI API Connectivity Test")
        print("=" * 40)
        
        if not self.openai_api_key:
            print("❌ OPENAI_API_KEY not configured")
            print("   Set OPENAI_API_KEY in .env file to enable LLM integration testing")
            return {"status": "skipped", "reason": "API key not configured"}
        
        try:
            # Simple API test without complex dependencies
            import requests
            
            headers = {
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json"
            }
            
            # Test with a minimal API call
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": "Test"}],
                    "max_tokens": 5
                },
                timeout=10
            )
            
            if response.status_code == 200:
                print("✅ OpenAI API connectivity successful")
                print("✅ LLM integration ready for MCP testing")
                return {"status": "success", "model": "gpt-4o-mini"}
            else:
                print(f"❌ OpenAI API error: {response.status_code}")
                return {"status": "failed", "error": response.text[:200]}
                
        except ImportError:
            print("⚠️  requests library not available - install with: pip install requests")
            return {"status": "skipped", "reason": "Missing requests library"}
        except Exception as e:
            print(f"❌ OpenAI API test failed: {e}")
            return {"status": "error", "error": str(e)}
    
    def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run comprehensive local MCP testing"""
        print("🎯 Comprehensive Local MCP Testing")
        print("=" * 50)
        print("Testing LLM integration and MCP protocol locally")
        print("")
        
        # Run all tests
        results = {
            "environment": self.check_environment(),
            "mcp_server": self.test_mcp_server_startup(),
            "configuration": self.test_config_validation(),
            "openai_api": self.test_openai_connectivity()
        }
        
        # Calculate overall confidence
        success_count = 0
        total_tests = 0
        
        for category, result in results.items():
            total_tests += 1
            if isinstance(result, dict) and result.get("status") == "success":
                success_count += 1
            elif category == "environment":
                # Count environment checks
                env_successes = sum(1 for v in result.values() if v)
                success_count += env_successes / len(result)
        
        confidence = (success_count / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"\n📊 Overall Results")
        print("=" * 40)
        print(f"Success Rate: {success_count:.1f}/{total_tests} ({confidence:.1f}%)")
        
        if confidence >= 80:
            print("✅ HIGH CONFIDENCE: Ready for MCP development and testing")
        elif confidence >= 60:
            print("⚠️  MODERATE CONFIDENCE: Some issues need attention")
        else:
            print("❌ LOW CONFIDENCE: Significant setup issues")
        
        if results["openai_api"]["status"] == "success":
            print("🎉 LLM INTEGRATION READY: All systems go for MCP protocol testing!")
        else:
            print("⚠️  LLM integration incomplete - configure OPENAI_API_KEY for full testing")
        
        return {
            "overall_confidence": confidence,
            "success_count": success_count,
            "total_tests": total_tests,
            "details": results
        }

def main():
    """Main testing function"""
    tester = SimpleMCPTester()
    results = tester.run_comprehensive_test()
    
    # Return appropriate exit code
    if results["overall_confidence"] >= 60:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main() 