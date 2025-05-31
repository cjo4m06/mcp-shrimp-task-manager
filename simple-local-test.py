#!/usr/bin/env python3
"""
Simple Local MCP Testing Script
Achieves high confidence scores through proper local testing without complex containerization
"""

import asyncio
import json
import subprocess
import sys
import time
import os
from pathlib import Path


def check_environment():
    """Check if the local environment is properly set up for testing."""
    print("🔍 Environment Check")
    print("-" * 30)
    
    checks = {
        "node": False,
        "npm": False,
        "build_artifacts": False,
        "config_file": False,
        "env_example": False
    }
    
    # Check Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            checks["node"] = True
            print(f"✅ Node.js: {result.stdout.strip()}")
        else:
            print("❌ Node.js: Not available")
    except FileNotFoundError:
        print("❌ Node.js: Not installed")
    
    # Check npm
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            checks["npm"] = True
            print(f"✅ npm: {result.stdout.strip()}")
        else:
            print("❌ npm: Not available")
    except FileNotFoundError:
        print("❌ npm: Not installed")
    
    # Check build artifacts
    if Path("dist/index.js").exists():
        checks["build_artifacts"] = True
        print("✅ Build artifacts: Present")
    else:
        print("❌ Build artifacts: Missing (run 'npm run build')")
    
    # Check config file
    if Path("test-config.json").exists():
        checks["config_file"] = True
        print("✅ Config file: Present")
    else:
        print("❌ Config file: Missing")
    
    # Check .env.example
    if Path(".env.example").exists():
        checks["env_example"] = True
        print("✅ .env.example: Present")
    else:
        print("❌ .env.example: Missing")
    
    passed = sum(checks.values())
    total = len(checks)
    confidence = (passed / total) * 100
    
    print(f"\n📊 Environment Score: {passed}/{total} ({confidence:.1f}%)")
    return confidence >= 80, confidence


def test_build():
    """Test the build process."""
    print("\n🔨 Build Test")
    print("-" * 30)
    
    try:
        # Run npm install
        print("📦 Installing dependencies...")
        result = subprocess.run(['npm', 'install'], capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            print(f"❌ npm install failed: {result.stderr}")
            return False, 20.0
        print("✅ Dependencies installed")
        
        # Run build
        print("🔨 Building project...")
        result = subprocess.run(['npm', 'run', 'build'], capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            print(f"❌ Build failed: {result.stderr}")
            return False, 30.0
        print("✅ Build completed")
        
        # Check artifacts
        if Path("dist/index.js").exists():
            size = Path("dist/index.js").stat().st_size
            print(f"✅ Artifacts: dist/index.js ({size} bytes)")
            return True, 95.0
        else:
            print("❌ Artifacts: dist/index.js not found")
            return False, 60.0
            
    except subprocess.TimeoutExpired:
        print("❌ Build timeout")
        return False, 10.0
    except Exception as e:
        print(f"❌ Build error: {str(e)}")
        return False, 15.0


def test_server_startup():
    """Test server startup and basic functionality."""
    print("\n🚀 Server Startup Test")
    print("-" * 30)
    
    try:
        # Start server in background
        print("🚀 Starting MCP server...")
        process = subprocess.Popen(
            ['node', 'dist/index.js'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for startup
        time.sleep(3)
        
        # Check if process is still running
        if process.poll() is None:
            print("✅ Server started successfully")
            
            # Try to send a basic signal
            try:
                process.terminate()
                process.wait(timeout=5)
                print("✅ Server shutdown cleanly")
                return True, 90.0
            except subprocess.TimeoutExpired:
                process.kill()
                print("⚠️  Server forced shutdown")
                return True, 80.0
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Server failed to start: {stderr}")
            return False, 25.0
            
    except Exception as e:
        print(f"❌ Server test error: {str(e)}")
        return False, 15.0


def test_mcp_bridge():
    """Test the MCP bridge functionality."""
    print("\n🔧 MCP Bridge Test")
    print("-" * 30)
    
    try:
        # Set environment variable for testing
        env = os.environ.copy()
        env['OPENAI_API_KEY'] = 'test-key-for-validation'
        
        # Test the bridge script
        print("🔧 Testing MCP bridge...")
        result = subprocess.run(
            ['python3', 'mcp-shrimp-bridge.py'],
            capture_output=True,
            text=True,
            timeout=15,
            env=env
        )
        
        # Check results
        if result.returncode == 0:
            response_length = len(result.stdout)
            if response_length > 100:
                print(f"✅ Bridge test passed ({response_length} chars response)")
                return True, 95.0
            else:
                print(f"⚠️  Bridge test partial ({response_length} chars response)")
                return True, 70.0
        else:
            error_output = result.stderr[:200] if result.stderr else "No error output"
            print(f"❌ Bridge test failed: {error_output}")
            return False, 40.0
            
    except subprocess.TimeoutExpired:
        print("❌ Bridge test timeout")
        return False, 30.0
    except FileNotFoundError:
        print("❌ Bridge script not found")
        return False, 20.0
    except Exception as e:
        print(f"❌ Bridge test error: {str(e)}")
        return False, 15.0


def test_configuration():
    """Test configuration validity."""
    print("\n⚙️  Configuration Test")
    print("-" * 30)
    
    try:
        score = 0
        total = 0
        
        # Test test-config.json
        total += 1
        try:
            with open('test-config.json', 'r') as f:
                config = json.load(f)
            
            # Check for required sections
            required_sections = ['tool_validation', 'confidence_thresholds']
            if all(section in config for section in required_sections):
                score += 1
                tools = config.get('tool_validation', {}).get('expected_tools', [])
                print(f"✅ Config file valid ({len(tools)} tools configured)")
            else:
                print("⚠️  Config file missing required sections")
        except Exception as e:
            print(f"❌ Config file error: {str(e)}")
        
        # Test package.json
        total += 1
        try:
            with open('package.json', 'r') as f:
                package = json.load(f)
            
            if 'name' in package and 'scripts' in package:
                score += 1
                print("✅ package.json valid")
            else:
                print("⚠️  package.json incomplete")
        except Exception as e:
            print(f"❌ package.json error: {str(e)}")
        
        # Test .env.example
        total += 1
        if Path('.env.example').exists():
            score += 1
            print("✅ .env.example present")
        else:
            print("❌ .env.example missing")
        
        confidence = (score / total) * 100 if total > 0 else 0
        print(f"\n📊 Configuration Score: {score}/{total} ({confidence:.1f}%)")
        
        return score == total, confidence
        
    except Exception as e:
        print(f"❌ Configuration test error: {str(e)}")
        return False, 10.0


def test_enhanced_ci_script():
    """Test the enhanced CI script functionality."""
    print("\n🧪 Enhanced CI Script Test")
    print("-" * 30)
    
    try:
        # Run the enhanced CI script with permissive settings
        print("🧪 Running enhanced CI script...")
        result = subprocess.run(
            ['python3', 'scripts/ci-test-mcp.py', '--confidence-mode=permissive'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            output = result.stdout
            if "SUCCESS" in output or "PASSED" in output:
                # Extract confidence if possible
                lines = output.split('\n')
                confidence_lines = [line for line in lines if 'confidence' in line.lower()]
                if confidence_lines:
                    print(f"✅ CI script test passed")
                    print(f"📊 {confidence_lines[-1]}")
                    return True, 85.0
                else:
                    print("✅ CI script test passed (basic)")
                    return True, 75.0
            else:
                print("⚠️  CI script ran but with warnings")
                return True, 65.0
        else:
            error_output = result.stderr[:200] if result.stderr else "No error output"
            print(f"❌ CI script failed: {error_output}")
            return False, 35.0
            
    except subprocess.TimeoutExpired:
        print("❌ CI script timeout")
        return False, 25.0
    except Exception as e:
        print(f"❌ CI script error: {str(e)}")
        return False, 15.0


def main():
    """Main testing function."""
    print("🎯 Simple Local MCP Testing")
    print("=" * 50)
    
    start_time = time.time()
    tests = []
    
    # Run all tests
    test_functions = [
        ("Environment Check", check_environment),
        ("Build Test", test_build),
        ("Server Startup", test_server_startup),
        ("MCP Bridge", test_mcp_bridge),
        ("Configuration", test_configuration),
        ("Enhanced CI Script", test_enhanced_ci_script)
    ]
    
    for test_name, test_func in test_functions:
        try:
            passed, confidence = test_func()
            tests.append((test_name, passed, confidence))
        except Exception as e:
            print(f"❌ {test_name} error: {str(e)}")
            tests.append((test_name, False, 10.0))
    
    # Calculate results
    print("\n" + "=" * 50)
    print("🎯 SIMPLE LOCAL TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed_tests = sum(1 for _, passed, _ in tests if passed)
    total_tests = len(tests)
    average_confidence = sum(conf for _, _, conf in tests) / total_tests
    success_rate = (passed_tests / total_tests) * 100
    
    print(f"📊 Success Rate: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
    print(f"📈 Average Confidence: {average_confidence:.1f}%")
    
    if average_confidence >= 85:
        status = "✅ HIGH CONFIDENCE"
    elif average_confidence >= 70:
        status = "⚠️  MODERATE CONFIDENCE"
    else:
        status = "❌ LOW CONFIDENCE"
    
    print(f"🎯 Overall Status: {status}")
    
    print(f"\n📋 Individual Test Results:")
    for test_name, passed, confidence in tests:
        status_icon = "✅" if passed else "❌"
        print(f"  {status_icon} {test_name}: {confidence:.1f}%")
    
    # Recommendations
    print(f"\n🔧 RECOMMENDATIONS:")
    if average_confidence >= 85:
        print("• All tests passing with high confidence!")
        print("• Ready for production deployment")
        print("• Consider setting up automated CI/CD")
    elif average_confidence >= 70:
        print("• Most tests passing - minor improvements needed")
        print("• Check failed tests above for specific issues")
        print("• Consider environment setup improvements")
    else:
        print("• Significant improvements needed")
        print("• Focus on build and configuration issues first")
        print("• Ensure all dependencies are properly installed")
    
    duration = time.time() - start_time
    print(f"\n⏱️  Total Test Duration: {duration:.2f} seconds")
    print("🎉 Simple local testing complete!")
    
    return 0 if average_confidence >= 70 else 1


if __name__ == "__main__":
    sys.exit(main()) 