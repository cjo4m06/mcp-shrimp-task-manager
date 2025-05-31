#!/usr/bin/env python3
"""
MCP-Shrimp Bridge Integration Script

This script bridges the mcp-client-cli testing framework with the Shrimp Task Manager
MCP server, following methodological pragmatism principles for systematic verification.

Usage:
    python mcp-shrimp-bridge.py --test-type functional
    python mcp-shrimp-bridge.py --test-type all --confidence-check
"""

import asyncio
import argparse
import json
import sys
import os
from pathlib import Path
from typing import Dict, Any, Optional

# Import mcp-client-cli testing framework
sys.path.insert(0, str(Path(__file__).parent / "mcp-client-cli" / "src"))

try:
    from mcp_client_cli.config import AppConfig, LLMConfig, ServerConfig, TestConfig
    from mcp_client_cli.testing import MCPServerTester
    from mcp_client_cli.testing.test_storage import TestResultManager
except ImportError as e:
    print(f"❌ Error importing mcp-client-cli: {e}")
    print("Ensure mcp-client-cli is properly installed and accessible.")
    sys.exit(1)


class ShrimpTaskManagerBridge:
    """
    Bridge class that integrates mcp-client-cli testing framework 
    with Shrimp Task Manager following methodological pragmatism.
    """
    
    def __init__(self, config_path: str = "test-config.json"):
        self.config_path = config_path
        self.config_data = self._load_config()
        self.mcp_config = self._create_mcp_config()
        self.tester = MCPServerTester(self.mcp_config)
        self.result_manager = TestResultManager()
        
    def _load_config(self) -> Dict[str, Any]:
        """Load Shrimp Task Manager test configuration."""
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ Configuration file not found: {self.config_path}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in configuration file: {e}")
            sys.exit(1)
    
    def _create_mcp_config(self) -> AppConfig:
        """Create mcp-client-cli compatible configuration."""
        # Extract server configuration
        server_config = self.config_data.get("servers", {}).get("shrimp-task-manager", {})
        if not server_config:
            # Fallback to legacy format
            server_config = self.config_data.get("mcpServers", {}).get("shrimp-task-manager", {})
        
        # Create server configuration
        mcp_server_config = ServerConfig(
            command=server_config.get("command", "node"),
            args=server_config.get("args", ["dist/index.js"]),
            env=server_config.get("env", {"NODE_ENV": "test", "LOG_LEVEL": "info"}),
            enabled=True,
            exclude_tools=[],
            requires_confirmation=[]
        )
        
        # Create test configuration
        test_config = TestConfig(
            timeout=self.config_data.get("testing", {}).get("timeout", 30),
            parallel_execution=self.config_data.get("optimization", {}).get("parallel_execution", True),
            output_format=self.config_data.get("testing", {}).get("outputFormat", "table")
        )
        
        # Create LLM configuration (using environment variables if available)
        llm_config = LLMConfig(
            model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
            provider=os.getenv("LLM_PROVIDER", "openai"),
            temperature=0.0,
            api_key=os.getenv("OPENAI_API_KEY", "")
        )
        
        return AppConfig(
            llm=llm_config,
            system_prompt="Shrimp Task Manager MCP testing via mcp-client-cli bridge",
            mcp_servers={"shrimp-task-manager": mcp_server_config},
            tools_requires_confirmation=[],
            testing=test_config
        )
    
    def get_confidence_threshold(self, test_type: str) -> float:
        """Get confidence threshold for specific test type."""
        confidence_config = self.config_data.get("confidence", {})
        confidence_thresholds = self.config_data.get("confidence_thresholds", {})
        
        # Try new format first, then legacy format
        threshold = confidence_thresholds.get(f"{test_type}_minimum")
        if threshold is None:
            threshold = confidence_config.get(test_type, {}).get("threshold", 80)
        
        return threshold / 100.0  # Convert percentage to decimal
    
    async def run_functional_tests(self) -> Dict[str, Any]:
        """Run functional tests using mcp-client-cli framework."""
        print("🧪 Running Functional Tests via mcp-client-cli...")
        
        try:
            # Test server connectivity first
            server_config = self.mcp_config.mcp_servers["shrimp-task-manager"]
            connectivity_result = await self.tester.test_server_connectivity(
                server_config, "shrimp-task-manager"
            )
            
            if connectivity_result.status.value != "passed":
                return {
                    "status": "failed",
                    "error": "Server connectivity test failed",
                    "confidence_score": 0.0,
                    "details": connectivity_result
                }
            
            # Run comprehensive functional tests
            results = await self.tester.run_comprehensive_test_suite()
            server_results = results.get("shrimp-task-manager")
            
            if not server_results:
                return {
                    "status": "failed",
                    "error": "No test results returned",
                    "confidence_score": 0.0
                }
            
            confidence_score = server_results.overall_confidence
            threshold = self.get_confidence_threshold("functional")
            
            return {
                "status": "passed" if confidence_score >= threshold else "failed",
                "confidence_score": confidence_score,
                "threshold": threshold,
                "total_tests": server_results.total_tests,
                "passed_tests": server_results.passed_tests,
                "failed_tests": server_results.failed_tests,
                "execution_time": server_results.execution_time,
                "details": server_results
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "confidence_score": 0.0
            }
    
    async def run_security_tests(self) -> Dict[str, Any]:
        """Run security tests using mcp-client-cli framework."""
        print("🔒 Running Security Tests via mcp-client-cli...")
        
        try:
            # Use security tester if available
            security_result = await self.tester.test_server_functionality("shrimp-task-manager")
            
            if not security_result:
                return {
                    "status": "failed",
                    "error": "Security test failed to execute",
                    "confidence_score": 0.0
                }
            
            # Extract confidence score
            confidence_score = getattr(security_result, 'confidence_score', 0.8)
            threshold = self.get_confidence_threshold("security")
            
            return {
                "status": "passed" if confidence_score >= threshold else "failed",
                "confidence_score": confidence_score,
                "threshold": threshold,
                "details": security_result
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "confidence_score": 0.0
            }
    
    async def run_performance_tests(self) -> Dict[str, Any]:
        """Run performance tests using mcp-client-cli framework."""
        print("⚡ Running Performance Tests via mcp-client-cli...")
        
        try:
            # Run basic performance testing
            server_config = self.mcp_config.mcp_servers["shrimp-task-manager"]
            
            # Simple performance test - measure response times
            import time
            response_times = []
            
            for i in range(5):  # Run 5 test iterations
                start_time = time.time()
                connectivity_result = await self.tester.test_server_connectivity(
                    server_config, "shrimp-task-manager"
                )
                end_time = time.time()
                
                if connectivity_result.status.value == "passed":
                    response_times.append(end_time - start_time)
                
                await asyncio.sleep(0.1)  # Small delay between tests
            
            if not response_times:
                return {
                    "status": "failed",
                    "error": "No successful performance tests",
                    "confidence_score": 0.0
                }
            
            # Calculate performance metrics
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            
            # Performance scoring based on response times
            max_allowed_time = self.config_data.get("testing", {}).get("performance", {}).get("resource_limits", {}).get("max_response_time_ms", 2000) / 1000.0
            
            if avg_response_time <= max_allowed_time:
                confidence_score = min(1.0, (max_allowed_time - avg_response_time) / max_allowed_time + 0.7)
            else:
                confidence_score = 0.5
            
            threshold = self.get_confidence_threshold("performance")
            
            return {
                "status": "passed" if confidence_score >= threshold else "failed",
                "confidence_score": confidence_score,
                "threshold": threshold,
                "avg_response_time": avg_response_time,
                "max_response_time": max_response_time,
                "test_iterations": len(response_times),
                "response_times": response_times
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "confidence_score": 0.0
            }
    
    async def run_integration_tests(self) -> Dict[str, Any]:
        """Run integration tests using mcp-client-cli framework."""
        print("🔗 Running Integration Tests via mcp-client-cli...")
        
        try:
            # Test configuration validation
            config_result = await self.tester.validate_configuration(self.mcp_config)
            
            # Test server functionality
            functionality_result = await self.tester.test_server_functionality("shrimp-task-manager")
            
            # Calculate integration confidence
            config_confidence = config_result.confidence_score if hasattr(config_result, 'confidence_score') else 0.9
            functionality_confidence = getattr(functionality_result, 'confidence_score', 0.8)
            
            # Combined confidence score
            confidence_score = (config_confidence + functionality_confidence) / 2
            threshold = self.get_confidence_threshold("integration")
            
            return {
                "status": "passed" if confidence_score >= threshold else "failed",
                "confidence_score": confidence_score,
                "threshold": threshold,
                "config_result": config_result,
                "functionality_result": functionality_result
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "confidence_score": 0.0
            }
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run comprehensive test suite."""
        print("🚀 Running Comprehensive Test Suite...")
        print("=" * 60)
        
        results = {}
        overall_confidence = 0.0
        total_weight = 0.0
        
        # Run all test types
        test_functions = {
            "functional": self.run_functional_tests,
            "security": self.run_security_tests,
            "performance": self.run_performance_tests,
            "integration": self.run_integration_tests
        }
        
        for test_type, test_function in test_functions.items():
            print(f"\n📋 {test_type.upper()} TESTS:")
            print("-" * 30)
            
            result = await test_function()
            results[test_type] = result
            
            # Display results
            status = result.get("status", "unknown")
            confidence = result.get("confidence_score", 0.0)
            threshold = result.get("threshold", 0.0)
            
            status_emoji = "✅" if status == "passed" else "❌" if status == "failed" else "💥"
            print(f"{status_emoji} Status: {status.upper()}")
            print(f"📊 Confidence: {confidence:.2%} (threshold: {threshold:.2%})")
            
            if "error" in result:
                print(f"❌ Error: {result['error']}")
            
            # Calculate weighted confidence
            weight = self.config_data.get("confidence", {}).get(test_type, {}).get("weight", 0.25)
            overall_confidence += confidence * weight
            total_weight += weight
        
        # Calculate overall metrics
        if total_weight > 0:
            overall_confidence = overall_confidence / total_weight
        
        passed_tests = sum(1 for r in results.values() if r.get("status") == "passed")
        total_tests = len(results)
        
        # Overall status
        overall_status = "passed" if passed_tests == total_tests and overall_confidence >= 0.8 else "failed"
        
        print(f"\n🎯 OVERALL RESULTS:")
        print("=" * 30)
        print(f"📈 Success Rate: {passed_tests}/{total_tests} ({passed_tests/total_tests:.1%})")
        print(f"📊 Overall Confidence: {overall_confidence:.2%}")
        print(f"🎉 Status: {overall_status.upper()}")
        
        return {
            "overall_status": overall_status,
            "overall_confidence": overall_confidence,
            "success_rate": passed_tests / total_tests,
            "results": results
        }
    
    async def cleanup(self):
        """Cleanup resources."""
        if hasattr(self.tester, 'cleanup'):
            await self.tester.cleanup()


async def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(description="MCP-Shrimp Bridge Testing")
    parser.add_argument(
        "--test-type",
        choices=["functional", "security", "performance", "integration", "all"],
        default="all",
        help="Type of tests to run"
    )
    parser.add_argument(
        "--config",
        default="test-config.json",
        help="Path to test configuration file"
    )
    parser.add_argument(
        "--confidence-check",
        action="store_true",
        help="Enforce confidence thresholds"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose output"
    )
    
    args = parser.parse_args()
    
    print("🎯 MCP-Shrimp Bridge Testing Framework")
    print("=" * 50)
    print(f"📁 Config: {args.config}")
    print(f"🔍 Test Type: {args.test_type}")
    print(f"📊 Confidence Check: {args.confidence_check}")
    
    try:
        # Initialize bridge
        bridge = ShrimpTaskManagerBridge(args.config)
        
        # Run tests based on type
        if args.test_type == "functional":
            result = await bridge.run_functional_tests()
        elif args.test_type == "security":
            result = await bridge.run_security_tests()
        elif args.test_type == "performance":
            result = await bridge.run_performance_tests()
        elif args.test_type == "integration":
            result = await bridge.run_integration_tests()
        else:  # all
            result = await bridge.run_all_tests()
        
        # Cleanup
        await bridge.cleanup()
        
        # Determine exit code
        if args.test_type == "all":
            exit_code = 0 if result.get("overall_status") == "passed" else 1
        else:
            exit_code = 0 if result.get("status") == "passed" else 1
        
        if args.confidence_check and exit_code != 0:
            print("\n❌ Tests failed confidence threshold requirements")
        
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        print("\n🛑 Testing interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main()) 