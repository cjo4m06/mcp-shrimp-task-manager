#!/usr/bin/env python3
"""
Show Full MCP Tool Responses
Captures and displays complete responses from MCP tools for detailed examination
"""

import asyncio
import json
import subprocess
import sys
import os
from pathlib import Path


async def capture_tool_response(tool_name: str, test_payload: dict) -> str:
    """Capture the full response from a specific tool"""
    
    test_script = f'''
import asyncio
import json
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def test_tool():
    try:
        server_params = StdioServerParameters(
            command="node",
            args=["dist/index.js"],
            env={{"NODE_ENV": "test", "ENABLE_GUI": "false"}}
        )
        
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                
                result = await session.call_tool("{tool_name}", {json.dumps(test_payload)})
                
                response_text = result.content[0].text if result.content and result.content[0].type == "text" else str(result)
                print("RESPONSE_START")
                print(response_text)
                print("RESPONSE_END")
                
    except Exception as e:
        print("RESPONSE_START")
        print(f"ERROR: {{e}}")
        print("RESPONSE_END")

if __name__ == "__main__":
    asyncio.run(test_tool())
'''
    
    # Write and run test script
    test_file = Path(f"temp_show_{tool_name}.py")
    with open(test_file, 'w') as f:
        f.write(test_script)
    
    try:
        result = subprocess.run(
            [sys.executable, str(test_file)],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        # Extract response
        lines = result.stdout.split('\n')
        in_response = False
        response_lines = []
        
        for line in lines:
            if "RESPONSE_START" in line:
                in_response = True
                continue
            elif "RESPONSE_END" in line:
                break
            elif in_response:
                response_lines.append(line)
        
        return '\n'.join(response_lines)
        
    finally:
        if test_file.exists():
            test_file.unlink()


async def main():
    """Show responses from key MCP tools"""
    
    # Load environment variables
    env_file = Path(".env")
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()
    
    tools_to_show = {
        "plan_task": {
            "description": "Create a simple test plan for validating MCP tools functionality"
        },
        "analyze_task": {
            "summary": "Analyze MCP tool testing approach", 
            "initialConcept": "We will systematically test each MCP tool to ensure it returns proper responses and handles edge cases correctly"
        },
        "init_project_rules": {
            "random_string": "test"
        },
        "list_tasks": {
            "status": "all"
        }
    }
    
    print("🔍 MCP TOOL RESPONSE VIEWER")
    print("=" * 60)
    
    for tool_name, payload in tools_to_show.items():
        print(f"\n🔧 {tool_name.upper()} RESPONSE:")
        print("-" * 50)
        
        response = await capture_tool_response(tool_name, payload)
        print(response)
        
        print("\n" + "="*50)


if __name__ == "__main__":
    asyncio.run(main()) 