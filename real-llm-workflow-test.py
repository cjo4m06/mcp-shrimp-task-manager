#!/usr/bin/env python3
"""
Real LLM Workflow Test with MCP Tools

This script demonstrates actual GPT-4 using our MCP task management tools
in a realistic workflow scenario.

Usage:
    python real-llm-workflow-test.py
"""

import asyncio
import json
import os
import subprocess
import sys
import time
from typing import Dict, Any, List
import openai

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

class RealLLMWorkflowTester:
    """Test real LLM workflows using MCP tools"""
    
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.client = openai.OpenAI(api_key=self.openai_api_key) if self.openai_api_key else None
        self.server_process = None
        self.tool_functions = []
        
    def start_mcp_server(self):
        """Start the MCP server and discover tools"""
        print("🚀 Starting MCP server for LLM integration...")
        
        self.server_process = subprocess.Popen([
            "node", "dist/index.js"
        ], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Initialize MCP connection
        init_msg = {
            "jsonrpc": "2.0",
            "method": "initialize", 
            "id": 1,
            "params": {
                "capabilities": {},
                "clientInfo": {"name": "gpt4-client", "version": "1.0"}
            }
        }
        
        self.server_process.stdin.write(json.dumps(init_msg) + "\n")
        self.server_process.stdin.flush()
        response = self.server_process.stdout.readline()
        
        # Get available tools
        list_tools_msg = {
            "jsonrpc": "2.0",
            "method": "tools/list",
            "id": 2
        }
        
        self.server_process.stdin.write(json.dumps(list_tools_msg) + "\n")
        self.server_process.stdin.flush()
        tools_response = self.server_process.stdout.readline()
        
        if tools_response:
            tools_data = json.loads(tools_response.strip())
            tools = tools_data.get("result", {}).get("tools", [])
            
            # Convert MCP tools to OpenAI function format
            self.tool_functions = []
            for tool in tools:
                function_def = {
                    "type": "function",
                    "function": {
                        "name": tool["name"],
                        "description": tool["description"],
                        "parameters": tool.get("inputSchema", {})
                    }
                }
                self.tool_functions.append(function_def)
            
            print(f"✅ Discovered {len(self.tool_functions)} MCP tools for LLM")
            return True
        
        return False
    
    def call_mcp_tool(self, tool_name: str, arguments: dict) -> str:
        """Call an MCP tool and return the result"""
        try:
            call_msg = {
                "jsonrpc": "2.0",
                "method": "tools/call",
                "id": int(time.time()),
                "params": {
                    "name": tool_name,
                    "arguments": arguments
                }
            }
            
            self.server_process.stdin.write(json.dumps(call_msg) + "\n")
            self.server_process.stdin.flush()
            
            response = self.server_process.stdout.readline()
            if response:
                result = json.loads(response.strip())
                return json.dumps(result.get("result", {}))
            
            return "Error: No response from MCP tool"
            
        except Exception as e:
            return f"Error calling MCP tool: {e}"
    
    def test_real_llm_task_workflow(self) -> Dict[str, Any]:
        """Test a real LLM performing task management workflow"""
        print("\n🧠 Real LLM Task Management Workflow")
        print("=" * 50)
        
        if not self.client:
            print("❌ OpenAI API key required for real LLM testing")
            return {"status": "skipped", "reason": "No OpenAI API key"}
        
        if not self.start_mcp_server():
            print("❌ Failed to start MCP server")
            return {"status": "failed", "error": "MCP server startup failed"}
        
        try:
            # Scenario: LLM manages a software development project
            scenario_prompt = """
You are a project manager AI with access to task management tools. 

SCENARIO: You need to plan and manage the development of a "User Authentication System" for a web application.

Your tasks:
1. Create a planning task for this project
2. Analyze the requirements and technical approach
3. Break it down into manageable subtasks
4. List all the created tasks to verify

Use the available MCP tools to accomplish this workflow. Be thorough but concise in your responses.
            """
            
            print("🎯 Sending scenario to GPT-4...")
            print(f"Available tools: {len(self.tool_functions)} MCP task management tools")
            
            # Start conversation with GPT-4
            messages = [
                {"role": "system", "content": "You are a helpful project management assistant with access to task management tools."},
                {"role": "user", "content": scenario_prompt}
            ]
            
            workflow_steps = []
            conversation_rounds = 0
            max_rounds = 5
            
            while conversation_rounds < max_rounds:
                print(f"\n🔄 Conversation Round {conversation_rounds + 1}")
                
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    tools=self.tool_functions,
                    tool_choice="auto",
                    max_tokens=1000
                )
                
                message = response.choices[0].message
                messages.append(message)
                
                # Check if LLM wants to use tools
                if message.tool_calls:
                    print(f"🔧 LLM requesting {len(message.tool_calls)} tool calls:")
                    
                    for tool_call in message.tool_calls:
                        tool_name = tool_call.function.name
                        tool_args = json.loads(tool_call.function.arguments)
                        
                        print(f"   • {tool_name}({list(tool_args.keys())})")
                        
                        # Execute the MCP tool call
                        tool_result = self.call_mcp_tool(tool_name, tool_args)
                        
                        # Add tool result to conversation
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": tool_result
                        })
                        
                        workflow_steps.append({
                            "step": f"Round {conversation_rounds + 1}",
                            "action": tool_name,
                            "arguments": tool_args,
                            "result_length": len(tool_result)
                        })
                
                # Check if conversation is complete
                if not message.tool_calls:
                    print("✅ LLM completed the workflow")
                    print(f"💬 Final response: {message.content[:200]}...")
                    break
                
                conversation_rounds += 1
            
            print(f"\n📊 Workflow Summary:")
            print(f"   Conversation rounds: {conversation_rounds}")
            print(f"   Tool calls executed: {len(workflow_steps)}")
            print(f"   Workflow steps:")
            for i, step in enumerate(workflow_steps, 1):
                print(f"      {i}. {step['action']} - {step['result_length']} chars")
            
            # Final verification - list all tasks
            print("\n🔍 Final verification - listing all tasks...")
            final_tasks = self.call_mcp_tool("list_tasks", {"status": "all"})
            tasks_data = json.loads(final_tasks)
            
            success_metrics = {
                "workflow_completed": conversation_rounds > 0,
                "tools_used": len(workflow_steps) > 0,
                "tasks_created": "tasks" in final_tasks.lower(),
                "llm_responded": len(messages) > 2
            }
            
            success_rate = sum(success_metrics.values()) / len(success_metrics) * 100
            
            print(f"\n🎉 Workflow Success Rate: {success_rate:.1f}%")
            
            return {
                "status": "success" if success_rate >= 75 else "partial",
                "success_rate": success_rate,
                "conversation_rounds": conversation_rounds,
                "tool_calls": len(workflow_steps),
                "workflow_steps": workflow_steps,
                "success_metrics": success_metrics
            }
            
        except Exception as e:
            print(f"❌ Real LLM workflow test failed: {e}")
            return {"status": "error", "error": str(e)}
        
        finally:
            if self.server_process:
                self.server_process.terminate()
    
    def test_llm_tool_discovery(self) -> Dict[str, Any]:
        """Test LLM's ability to discover and understand available tools"""
        print("\n🔍 LLM Tool Discovery Test")
        print("=" * 40)
        
        if not self.client:
            return {"status": "skipped", "reason": "No OpenAI API key"}
        
        try:
            # Ask LLM to analyze available tools
            tool_names = [tool["function"]["name"] for tool in self.tool_functions]
            
            analysis_prompt = f"""
Analyze these task management tools and explain what kind of workflow they enable:

Available tools: {', '.join(tool_names)}

Provide a brief analysis of:
1. What type of project management workflow these tools support
2. What would be a good use case scenario
3. How they work together as a system

Be concise but insightful.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": analysis_prompt}],
                max_tokens=300
            )
            
            analysis = response.choices[0].message.content
            print(f"🧠 LLM Analysis:\n{analysis}")
            
            # Check if analysis mentions key concepts
            analysis_quality = {
                "mentions_workflow": "workflow" in analysis.lower(),
                "mentions_tasks": "task" in analysis.lower(), 
                "mentions_planning": "plan" in analysis.lower(),
                "mentions_management": "manage" in analysis.lower()
            }
            
            quality_score = sum(analysis_quality.values()) / len(analysis_quality) * 100
            
            return {
                "status": "success" if quality_score >= 75 else "partial",
                "quality_score": quality_score,
                "analysis_length": len(analysis),
                "analysis_quality": analysis_quality
            }
            
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    async def run_real_workflow_tests(self) -> Dict[str, Any]:
        """Run comprehensive real LLM workflow tests"""
        print("🎯 Real LLM Workflow Testing")
        print("=" * 50)
        print("Testing actual GPT-4 using MCP task management tools")
        print("")
        
        if not self.openai_api_key:
            print("❌ OPENAI_API_KEY required for real LLM workflow testing")
            return {"status": "skipped", "reason": "No API key"}
        
        results = {
            "tool_discovery": self.test_llm_tool_discovery(),
            "task_workflow": self.test_real_llm_task_workflow()
        }
        
        # Calculate overall success
        successes = sum(1 for result in results.values() 
                       if isinstance(result, dict) and result.get("status") == "success")
        total_tests = len(results)
        success_rate = (successes / total_tests) * 100
        
        print(f"\n📊 Real LLM Workflow Results")
        print("=" * 40)
        print(f"Success Rate: {successes}/{total_tests} ({success_rate:.1f}%)")
        
        if success_rate >= 80:
            print("🎉 OUTSTANDING: Real LLM workflows fully functional!")
            print("✅ GPT-4 successfully using MCP tools for real tasks")
        elif success_rate >= 60:
            print("⚠️  GOOD: Real LLM workflows mostly working")
            print("🔧 Minor optimization opportunities")
        else:
            print("❌ CRITICAL: Real LLM workflow issues")
            print("🚨 Significant problems with LLM-MCP integration")
        
        return {
            "overall_success_rate": success_rate,
            "successful_tests": successes,
            "total_tests": total_tests,
            "details": results
        }

async def main():
    """Main testing function"""
    tester = RealLLMWorkflowTester()
    results = await tester.run_real_workflow_tests()
    
    # Return appropriate exit code
    if results["overall_success_rate"] >= 60:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 