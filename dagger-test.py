#!/usr/bin/env python3
"""
Dagger CLI script for local MCP Shrimp Task Manager testing.

This script mirrors the GitHub Actions workflow (.github/workflows/mcp-testing.yml)
to enable local testing and validation before pushing to CI/CD.

Usage:
    python dagger-test.py [--node-version 20] [--test-type all|functional|security|performance|integration]
"""

import asyncio
import argparse
import json
import sys
from pathlib import Path
from typing import List, Optional

import dagger


async def main():
    parser = argparse.ArgumentParser(description="Local MCP Shrimp Task Manager testing with Dagger")
    parser.add_argument(
        "--node-version", 
        default="20", 
        choices=["18", "20", "22"],
        help="Node.js version to test with (default: 20)"
    )
    parser.add_argument(
        "--test-type",
        default="all",
        choices=["all", "functional", "security", "performance", "integration"],
        help="Type of tests to run (default: all)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose output"
    )
    parser.add_argument(
        "--source-path",
        default="/tmp/mcp-shrimp-task-manager",
        help="Path to the source code (default: /tmp/mcp-shrimp-task-manager)"
    )
    
    args = parser.parse_args()
    
    # Validate source path exists
    source_path = Path(args.source_path)
    if not source_path.exists():
        print(f"❌ Source path does not exist: {source_path}")
        sys.exit(1)
    
    print(f"🧪 Starting MCP Shrimp Task Manager local testing")
    print(f"📁 Source: {source_path}")
    print(f"🟢 Node.js version: {args.node_version}")
    print(f"🔍 Test type: {args.test_type}")
    print("=" * 60)
    
    async with dagger.Connection(dagger.Config(log_output=sys.stderr)) as client:
        # Create base container with Node.js
        container = await setup_nodejs_environment(client, args.node_version, args.verbose)
        
        # Mount source code
        source_dir = client.host().directory(str(source_path))
        container = container.with_directory("/workspace", source_dir).with_workdir("/workspace")
        
        # Install Node.js dependencies and build
        container = await install_and_build_nodejs(container, args.verbose)
        
        # Setup Python and MCP Testing Framework
        container = await setup_python_environment(container, args.verbose)
        
        # Run tests based on type
        if args.test_type == "all":
            await run_all_tests(container, args.verbose)
        else:
            await run_specific_test(container, args.test_type, args.verbose)
        
        print("🎉 Local testing completed successfully!")


async def setup_nodejs_environment(client: dagger.Client, node_version: str, verbose: bool) -> dagger.Container:
    """Setup Node.js environment mirroring GitHub Actions setup-node."""
    if verbose:
        print(f"🟢 Setting up Node.js {node_version} environment...")
    
    container = (
        client.container()
        .from_(f"node:{node_version}-slim")
        .with_exec(["apt-get", "update"])
        .with_exec(["apt-get", "install", "-y", "curl", "python3", "python3-pip", "python3-venv", "build-essential"])
    )
    
    return container


async def install_and_build_nodejs(container: dagger.Container, verbose: bool) -> dagger.Container:
    """Install dependencies and build the project."""
    if verbose:
        print("📦 Installing Node.js dependencies...")
    
    # Install dependencies (equivalent to npm ci)
    container = container.with_exec(["npm", "ci"])
    
    if verbose:
        print("🔨 Building server...")
    
    # Build server (equivalent to npm run build)
    container = container.with_exec(["npm", "run", "build"])
    
    return container


async def setup_python_environment(container: dagger.Container, verbose: bool) -> dagger.Container:
    """Setup Python environment and install MCP Testing Framework."""
    if verbose:
        print("🐍 Setting up Python environment...")
    
    # Create virtual environment and install MCP Testing Framework
    container = (
        container
        .with_exec(["python3", "-m", "venv", "/opt/venv"])
        .with_env_variable("PATH", "/opt/venv/bin:$PATH", expand=True)
        .with_exec(["/opt/venv/bin/pip", "install", "--upgrade", "pip"])
        .with_exec(["/opt/venv/bin/pip", "install", "mcp-testing-framework"])
    )
    
    return container


async def start_server_and_run_test(
    container: dagger.Container, 
    test_command: List[str], 
    test_name: str,
    timeout: int = 60,
    verbose: bool = False
) -> dagger.Container:
    """Start MCP server and run a specific test command."""
    if verbose:
        print(f"🧪 Running {test_name}...")
    
    # Create a test script that starts server and runs tests
    test_script = f"""#!/bin/bash
set -e

echo "🚀 Starting MCP server for {test_name}..."
timeout {timeout}s node dist/index.js &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 5

echo "🧪 Running {test_name}..."
/opt/venv/bin/{' '.join(test_command)}

echo "🛑 Stopping server..."
kill $SERVER_PID || true
wait $SERVER_PID 2>/dev/null || true

echo "✅ {test_name} completed"
"""
    
    container = (
        container
        .with_new_file("/run-test.sh", test_script)
        .with_exec(["chmod", "+x", "/run-test.sh"])
        .with_exec(["/run-test.sh"])
    )
    
    return container


async def run_specific_test(container: dagger.Container, test_type: str, verbose: bool):
    """Run a specific test type."""
    test_configs = {
        "functional": {
            "command": ["mcp-test", "--run-test-suite", "functional", "--config", "test-config.json", "--output-format", "json"],
            "timeout": 60,
            "output": "functional-results.json"
        },
        "security": {
            "command": ["mcp-test", "--run-test-suite", "security", "--config", "test-config.json", "--output-format", "json"],
            "timeout": 60,
            "output": "security-results.json"
        },
        "performance": {
            "command": ["mcp-test", "--run-test-suite", "performance", "--config", "test-config.json", "--output-format", "json"],
            "timeout": 120,
            "output": "performance-results.json"
        },
        "integration": {
            "command": ["mcp-test", "--run-test-suite", "integration", "--config", "test-config.json", "--output-format", "json"],
            "timeout": 180,
            "output": "integration-results.json"
        }
    }
    
    if test_type not in test_configs:
        print(f"❌ Unknown test type: {test_type}")
        return
    
    config = test_configs[test_type]
    container = await start_server_and_run_test(
        container,
        config["command"],
        f"{test_type} tests",
        config["timeout"],
        verbose
    )
    
    # Extract results
    await extract_test_results(container, config["output"], verbose)


async def run_all_tests(container: dagger.Container, verbose: bool):
    """Run all test suites sequentially."""
    test_types = ["functional", "security", "performance", "integration"]
    
    for test_type in test_types:
        try:
            await run_specific_test(container, test_type, verbose)
            print(f"✅ {test_type} tests completed successfully")
        except Exception as e:
            print(f"❌ {test_type} tests failed: {e}")
            continue
    
    # Generate final report
    if verbose:
        print("📋 Generating comprehensive test report...")
    
    report_script = """#!/bin/bash
echo "📋 Generating test report..."
/opt/venv/bin/mcp-test --generate-test-report --config test-config.json --output-format html
echo "✅ Test report generated"
"""
    
    container = (
        container
        .with_new_file("/generate-report.sh", report_script)
        .with_exec(["chmod", "+x", "/generate-report.sh"])
        .with_exec(["/generate-report.sh"])
    )
    
    # Extract report
    await extract_test_results(container, "test-report.html", verbose)


async def extract_test_results(container: dagger.Container, filename: str, verbose: bool):
    """Extract test results from container to local filesystem."""
    try:
        if verbose:
            print(f"📄 Extracting {filename}...")
        
        # Check if file exists and export it
        file_content = await container.file(f"/workspace/{filename}").contents()
        
        # Write to local file
        local_path = Path(f"./local-test-results/{filename}")
        local_path.parent.mkdir(exist_ok=True)
        
        with open(local_path, "w") as f:
            f.write(file_content)
        
        print(f"📁 Results saved to: {local_path}")
        
        # If it's a JSON file, try to extract confidence score
        if filename.endswith(".json"):
            try:
                data = json.loads(file_content)
                confidence = data.get("confidence_score", "N/A")
                if confidence != "N/A":
                    print(f"📊 Confidence Score: {confidence}%")
            except json.JSONDecodeError:
                pass
                
    except Exception as e:
        if verbose:
            print(f"⚠️ Could not extract {filename}: {e}")


if __name__ == "__main__":
    asyncio.run(main())
