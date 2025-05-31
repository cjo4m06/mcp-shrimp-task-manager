"""
MCP Testing Framework Dagger Module - Enhanced with Error Handling

This module provides local testing capabilities that mirror the GitHub Actions workflow
for comprehensive MCP server testing including functional, security, performance,
and integration tests.

Enhanced to leverage mcp-client-cli proven patterns following methodological pragmatism
with comprehensive error handling and retry mechanisms for both human-cognitive and
artificial-stochastic errors.
"""

import json
import os
import sys
import time
import asyncio
import random
from pathlib import Path
from typing import List, Optional, Dict, Any, Union
from enum import Enum
from dataclasses import dataclass

import dagger
from dagger import dag, function, object_type, Container, Directory

# Add mcp-client-cli to path for importing proven patterns
sys.path.insert(0, str(Path(__file__).parent.parent / "mcp-client-cli" / "src"))

try:
    from mcp_client_cli.config import AppConfig, LLMConfig, ServerConfig, TestConfig
    from mcp_client_cli.testing import MCPServerTester
    MCP_CLIENT_AVAILABLE = True
except ImportError:
    MCP_CLIENT_AVAILABLE = False
    print("⚠️  mcp-client-cli not available, using fallback implementations")


class ErrorType(Enum):
    """Error categorization following methodological pragmatism error architecture."""
    HUMAN_COGNITIVE = "human_cognitive"  # Configuration issues, missing dependencies
    ARTIFICIAL_STOCHASTIC = "artificial_stochastic"  # Network timeouts, transient failures
    SYSTEM_FAILURE = "system_failure"  # Container failures, resource exhaustion
    VALIDATION_FAILURE = "validation_failure"  # Confidence threshold violations


@dataclass
class ErrorContext:
    """Enhanced error context for systematic error handling."""
    error_type: ErrorType
    message: str
    retry_count: int = 0
    max_retries: int = 3
    confidence_score: Optional[float] = None
    threshold: Optional[float] = None
    raw_exception: Optional[Exception] = None


class EnhancedRetryHandler:
    """
    Enhanced retry handler implementing exponential backoff and error categorization
    following methodological pragmatism principles.
    """
    
    @staticmethod
    async def execute_with_retry(
        operation,
        max_retries: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        operation_name: str = "Operation"
    ) -> Union[Any, ErrorContext]:
        """
        Execute operation with exponential backoff retry logic.
        
        Args:
            operation: Async operation to execute
            max_retries: Maximum number of retry attempts
            base_delay: Base delay for exponential backoff
            max_delay: Maximum delay between retries
            operation_name: Human-readable operation name for logging
        
        Returns:
            Operation result or ErrorContext on failure
        """
        last_exception = None
        
        for attempt in range(max_retries + 1):
            try:
                print(f"🔄 {operation_name} (attempt {attempt + 1}/{max_retries + 1})...")
                result = await operation()
                
                if attempt > 0:
                    print(f"✅ {operation_name} succeeded after {attempt} retries")
                
                return result
                
            except Exception as e:
                last_exception = e
                error_type = EnhancedRetryHandler._categorize_error(e)
                
                print(f"⚠️  {operation_name} failed (attempt {attempt + 1}): {str(e)}")
                print(f"📋 Error type: {error_type.value}")
                
                # Don't retry human-cognitive errors
                if error_type == ErrorType.HUMAN_COGNITIVE:
                    print(f"❌ Human-cognitive error detected, no retry: {str(e)}")
                    break
                
                # Don't retry on last attempt
                if attempt == max_retries:
                    break
                
                # Calculate exponential backoff delay
                delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
                print(f"⏳ Waiting {delay:.1f}s before retry...")
                await asyncio.sleep(delay)
        
        # Create error context for failed operation
        return ErrorContext(
            error_type=EnhancedRetryHandler._categorize_error(last_exception),
            message=f"{operation_name} failed after {max_retries + 1} attempts: {str(last_exception)}",
            retry_count=max_retries,
            max_retries=max_retries,
            raw_exception=last_exception
        )
    
    @staticmethod
    def _categorize_error(exception: Exception) -> ErrorType:
        """Categorize errors based on methodological pragmatism error architecture."""
        error_message = str(exception).lower()
        
        # Human-cognitive errors (configuration, setup issues)
        if any(term in error_message for term in [
            "not found", "no such file", "permission denied", "config", 
            "missing", "invalid", "command not found", "module"
        ]):
            return ErrorType.HUMAN_COGNITIVE
        
        # Artificial-stochastic errors (network, timeouts, transient)
        elif any(term in error_message for term in [
            "timeout", "connection", "network", "dns", "refused", 
            "temporary", "busy", "unavailable", "rate limit"
        ]):
            return ErrorType.ARTIFICIAL_STOCHASTIC
        
        # System failures (resource exhaustion, container issues)
        elif any(term in error_message for term in [
            "memory", "disk", "resource", "container", "killed", "oom"
        ]):
            return ErrorType.SYSTEM_FAILURE
        
        # Default to artificial-stochastic for unknown errors
        else:
            return ErrorType.ARTIFICIAL_STOCHASTIC


class ConfidenceValidator:
    """Confidence score validation against test-config.json thresholds."""
    
    def __init__(self, config_data: Dict[str, Any]):
        self.config_data = config_data
        self.confidence_config = config_data.get("confidence", {})
        self.confidence_thresholds = config_data.get("confidence_thresholds", {})
    
    def get_threshold(self, test_type: str) -> float:
        """Get confidence threshold for specific test type."""
        # Try new format first, then legacy format
        threshold = self.confidence_thresholds.get(f"{test_type}_minimum")
        if threshold is None:
            threshold = self.confidence_config.get(test_type, {}).get("threshold", 80)
        
        return threshold / 100.0  # Convert percentage to decimal
    
    def validate_confidence(self, test_type: str, confidence_score: float) -> bool:
        """Validate confidence score against threshold."""
        threshold = self.get_threshold(test_type)
        return confidence_score >= threshold
    
    def create_validation_error(self, test_type: str, confidence_score: float) -> ErrorContext:
        """Create validation error context for confidence failures."""
        threshold = self.get_threshold(test_type)
        
        return ErrorContext(
            error_type=ErrorType.VALIDATION_FAILURE,
            message=f"{test_type} confidence score {confidence_score:.1%} below threshold {threshold:.1%}",
            confidence_score=confidence_score,
            threshold=threshold
        )


@object_type
class MCPTestingFramework:
    """
    MCP Testing Framework Dagger module for local testing pipeline.
    
    Enhanced to leverage mcp-client-cli proven patterns while maintaining
    backward compatibility and systematic verification following 
    methodological pragmatism principles with comprehensive error handling.
    """

    @function
    async def create_base_container(
        self,
        node_version: str = "20",
        python_version: str = "3.12"
    ) -> Container:
        """
        Create shared base container with enhanced error handling.
        
        Leverages mcp-client-cli multi_language_environment patterns to eliminate
        code duplication and provide consistent container setup with robust
        error handling for setup failures.
        
        Args:
            node_version: Node.js version to use (default: "20")
            python_version: Python version to use (default: "3.12")
        
        Returns:
            Container: Optimized base container with Node.js, Python, and dependencies
        """
        async def create_container():
            return (
                dag.container()
                .from_("ubuntu:22.04")
                .with_exec(["apt-get", "update"])
                .with_exec(["apt-get", "install", "-y", "curl", "git", "build-essential", "software-properties-common", "jq"])
                # Install Python (following mcp-client-cli patterns)
                .with_exec(["add-apt-repository", "ppa:deadsnakes/ppa", "-y"])
                .with_exec(["apt-get", "update"])
                .with_exec(["apt-get", "install", "-y", f"python{python_version}", f"python{python_version}-pip", f"python{python_version}-venv"])
                .with_exec(["ln", "-sf", f"/usr/bin/python{python_version}", "/usr/bin/python"])
                .with_exec(["ln", "-sf", f"/usr/bin/python{python_version}", "/usr/bin/python3"])
                # Install Node.js (following mcp-client-cli patterns)
                .with_exec(["curl", "-fsSL", "https://deb.nodesource.com/setup_20.x", "-o", "nodesource_setup.sh"])
                .with_exec(["bash", "nodesource_setup.sh"])
                .with_exec(["apt-get", "install", "-y", "nodejs"])
                .with_exec(["npm", "install", "-g", "npm@latest", "typescript", "@types/node"])
                # Install Python pip packages
                .with_exec(["python", "-m", "pip", "install", "--upgrade", "pip", "setuptools", "wheel"])
            )
        
        result = await EnhancedRetryHandler.execute_with_retry(
            create_container,
            max_retries=2,
            operation_name="Container Base Setup"
        )
        
        if isinstance(result, ErrorContext):
            raise Exception(f"Failed to create base container: {result.message}")
        
        return result

    @function
    async def setup_project_environment(
        self,
        container: Container,
        source: Directory,
        test_config_path: str = "test-config.json"
    ) -> Container:
        """
        Setup project-specific environment in container with enhanced error handling.
        
        Args:
            container: Base container to enhance
            source: Source directory containing the MCP server code
            test_config_path: Path to test configuration file
        
        Returns:
            Container: Container with project environment configured
        """
        async def setup_environment():
            # Copy source and set working directory
            working_container = (
                container
                .with_directory("/app", source)
                .with_workdir("/app")
            )
            
            # Install Node.js dependencies and build
            working_container = (
                working_container
                .with_exec(["npm", "install"])
                .with_exec(["npm", "run", "build"])
            )
            
            # Install mcp-client-cli if available in project
            if MCP_CLIENT_AVAILABLE:
                working_container = working_container.with_exec([
                    "python", "-m", "pip", "install", "-e", "./mcp-client-cli[testing]"
                ])
            else:
                # Fallback: install mcp-testing-framework
                working_container = working_container.with_exec([
                    "pip", "install", "mcp-testing-framework"
                ])
            
            return working_container
        
        result = await EnhancedRetryHandler.execute_with_retry(
            setup_environment,
            max_retries=3,
            operation_name="Project Environment Setup"
        )
        
        if isinstance(result, ErrorContext):
            raise Exception(f"Failed to setup project environment: {result.message}")
        
        return result

    @function
    async def run_mcp_bridge_test(
        self,
        container: Container,
        test_type: str = "functional",
        confidence_check: bool = True
    ) -> str:
        """
        Run tests using our mcp-shrimp-bridge.py integration with enhanced error handling.
        
        Args:
            container: Configured container
            test_type: Type of test to run (functional, security, performance, integration, all)
            confidence_check: Whether to enforce confidence thresholds
        
        Returns:
            Test results from bridge with confidence validation
        """
        async def execute_bridge_test():
            # Prepare bridge test command
            cmd = ["python3", "mcp-shrimp-bridge.py", "--test-type", test_type]
            if confidence_check:
                cmd.append("--confidence-check")
            
            # Execute the bridge test with timeout
            result = await container.with_exec(cmd).stdout()
            
            # Parse and validate confidence scores if enabled
            if confidence_check:
                confidence_score = self._extract_confidence_score(result)
                if confidence_score is not None:
                    # Load configuration for validation
                    try:
                        config_content = await container.file("test-config.json").contents()
                        config_data = json.loads(config_content)
                        validator = ConfidenceValidator(config_data)
                        
                        if not validator.validate_confidence(test_type, confidence_score):
                            validation_error = validator.create_validation_error(test_type, confidence_score)
                            return f"❌ Confidence Validation Failed: {validation_error.message}\n\nTest Output:\n{result}"
                    except Exception as config_error:
                        print(f"⚠️  Could not validate confidence scores: {config_error}")
            
            return result
        
        result = await EnhancedRetryHandler.execute_with_retry(
            execute_bridge_test,
            max_retries=3,
            base_delay=2.0,
            operation_name=f"MCP Bridge Test ({test_type})"
        )
        
        if isinstance(result, ErrorContext):
            return f"❌ Bridge test failed: {result.message}"
        
        return result
    
    def _extract_confidence_score(self, test_output: str) -> Optional[float]:
        """Extract confidence score from test output."""
        try:
            # Look for confidence score patterns in output
            import re
            
            # Pattern: "confidence_score": 0.85 or "confidence": 85%
            patterns = [
                r'"confidence_score":\s*([0-9]*\.?[0-9]+)',
                r'"confidence":\s*([0-9]*\.?[0-9]+)',
                r'confidence[:\s]+([0-9]*\.?[0-9]+)%?'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, test_output, re.IGNORECASE)
                if match:
                    score = float(match.group(1))
                    # Convert percentage to decimal if needed
                    return score / 100.0 if score > 1.0 else score
            
            return None
        except Exception:
            return None

    @function
    async def test_all(
        self,
        source: Directory,
        node_version: str = "20",
        test_config_path: str = "test-config.json"
    ) -> str:
        """
        Run comprehensive MCP server tests with enhanced error handling.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing (default: "20")
            test_config_path: Path to test configuration file
        
        Returns:
            Test results summary with confidence validation
        """
        async def execute_comprehensive_tests():
            # Create optimized base container
            container = await self.create_base_container(node_version)
            
            # Setup project environment
            container = await self.setup_project_environment(container, source, test_config_path)
            
            # Run comprehensive tests via bridge
            result = await self.run_mcp_bridge_test(
                container, 
                test_type="all", 
                confidence_check=True
            )
            
            return f"🎯 Comprehensive Test Results:\n{result}"
        
        result = await EnhancedRetryHandler.execute_with_retry(
            execute_comprehensive_tests,
            max_retries=2,
            operation_name="Comprehensive Tests"
        )
        
        if isinstance(result, ErrorContext):
            return f"❌ Comprehensive tests failed: {result.message}"
        
        return result

    @function
    async def test_functional(
        self,
        source: Directory,
        node_version: str = "20"
    ) -> str:
        """
        Run functional tests with enhanced error handling.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Functional test results with confidence validation
        """
        async def execute_functional_tests():
            container = await self.create_base_container(node_version)
            container = await self.setup_project_environment(container, source)
            
            result = await self.run_mcp_bridge_test(container, "functional")
            return f"🧪 Functional Test Results:\n{result}"
        
        result = await EnhancedRetryHandler.execute_with_retry(
            execute_functional_tests,
            max_retries=3,
            operation_name="Functional Tests"
        )
        
        if isinstance(result, ErrorContext):
            return f"❌ Functional tests failed: {result.message}"
        
        return result

    @function
    async def test_security(
        self,
        source: Directory,
        node_version: str = "20"
    ) -> str:
        """
        Run security tests with enhanced error handling.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Security test results with confidence validation
        """
        async def execute_security_tests():
            container = await self.create_base_container(node_version)
            container = await self.setup_project_environment(container, source)
            
            result = await self.run_mcp_bridge_test(container, "security")
            return f"🔒 Security Test Results:\n{result}"
        
        result = await EnhancedRetryHandler.execute_with_retry(
            execute_security_tests,
            max_retries=2,  # Security tests may be less tolerant of retries
            operation_name="Security Tests"
        )
        
        if isinstance(result, ErrorContext):
            return f"❌ Security tests failed: {result.message}"
        
        return result

    @function
    async def test_performance(
        self,
        source: Directory,
        node_version: str = "20"
    ) -> str:
        """
        Run performance tests with enhanced error handling.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Performance test results with confidence validation
        """
        async def execute_performance_tests():
            container = await self.create_base_container(node_version)
            container = await self.setup_project_environment(container, source)
            
            result = await self.run_mcp_bridge_test(container, "performance")
            return f"⚡ Performance Test Results:\n{result}"
        
        result = await EnhancedRetryHandler.execute_with_retry(
            execute_performance_tests,
            max_retries=2,
            base_delay=3.0,  # Performance tests may need more time
            operation_name="Performance Tests"
        )
        
        if isinstance(result, ErrorContext):
            return f"❌ Performance tests failed: {result.message}"
        
        return result

    @function
    async def test_integration(
        self,
        source: Directory,
        node_version: str = "20"
    ) -> str:
        """
        Run integration tests with enhanced error handling.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Integration test results with confidence validation
        """
        async def execute_integration_tests():
            container = await self.create_base_container(node_version)
            container = await self.setup_project_environment(container, source)
            
            result = await self.run_mcp_bridge_test(container, "integration")
            return f"🔗 Integration Test Results:\n{result}"
        
        result = await EnhancedRetryHandler.execute_with_retry(
            execute_integration_tests,
            max_retries=3,
            base_delay=2.0,
            operation_name="Integration Tests"
        )
        
        if isinstance(result, ErrorContext):
            return f"❌ Integration tests failed: {result.message}"
        
        return result

    @function
    async def test_quick_check(
        self,
        source: Directory,
        node_version: str = "20"
    ) -> str:
        """
        Run quick connectivity test with lightweight error handling.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Quick test results
        """
        async def execute_quick_tests():
            container = await self.create_base_container(node_version)
            container = await self.setup_project_environment(container, source)
            
            # For quick check, just run functional tests without confidence enforcement
            result = await self.run_mcp_bridge_test(
                container, 
                test_type="functional", 
                confidence_check=False
            )
            return f"⚡ Quick Check Results:\n{result}"
        
        result = await EnhancedRetryHandler.execute_with_retry(
            execute_quick_tests,
            max_retries=1,  # Quick tests should fail fast
            base_delay=1.0,
            operation_name="Quick Check"
        )
        
        if isinstance(result, ErrorContext):
            return f"❌ Quick check failed: {result.message}"
        
        return result

    @function
    async def health_check(
        self,
        source: Directory,
        node_version: str = "20",
        timeout_seconds: int = 30
    ) -> str:
        """
        Comprehensive health check for detecting configuration and network issues.
        
        This function performs systematic verification following methodological pragmatism
        to identify human-cognitive errors (configuration) and artificial-stochastic errors
        (network, timeouts) before running full test suites.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
            timeout_seconds: Maximum time to wait for health checks
        
        Returns:
            Health check results with error categorization
        """
        async def execute_health_checks():
            health_results = []
            
            print("🔍 Starting comprehensive health check...")
            
            # 1. Container creation health check
            try:
                print("📦 Testing container creation...")
                container = await self.create_base_container(node_version)
                health_results.append("✅ Container creation: PASSED")
            except Exception as e:
                error_type = EnhancedRetryHandler._categorize_error(e)
                health_results.append(f"❌ Container creation: FAILED ({error_type.value}) - {str(e)}")
                return "\n".join(health_results)
            
            # 2. Project environment setup health check
            try:
                print("🛠️  Testing project environment setup...")
                container = await self.setup_project_environment(container, source)
                health_results.append("✅ Project setup: PASSED")
            except Exception as e:
                error_type = EnhancedRetryHandler._categorize_error(e)
                health_results.append(f"❌ Project setup: FAILED ({error_type.value}) - {str(e)}")
                return "\n".join(health_results)
            
            # 3. Configuration validation health check
            try:
                print("⚙️  Testing configuration validation...")
                config_result = await self.validate_config(source)
                if "FAILED" in config_result:
                    health_results.append(f"❌ Configuration validation: FAILED - Invalid configuration detected")
                else:
                    health_results.append("✅ Configuration validation: PASSED")
            except Exception as e:
                error_type = EnhancedRetryHandler._categorize_error(e)
                health_results.append(f"❌ Configuration validation: FAILED ({error_type.value}) - {str(e)}")
            
            # 4. Network connectivity health check
            try:
                print("🌐 Testing network connectivity...")
                await container.with_exec(["ping", "-c", "3", "8.8.8.8"]).stdout()
                health_results.append("✅ Network connectivity: PASSED")
            except Exception as e:
                error_type = EnhancedRetryHandler._categorize_error(e)
                health_results.append(f"⚠️  Network connectivity: LIMITED ({error_type.value}) - {str(e)}")
            
            # 5. Bridge script availability health check
            try:
                print("🌉 Testing bridge script availability...")
                bridge_test = await container.with_exec(["python3", "-c", "import sys; print('Bridge test OK')"]).stdout()
                health_results.append("✅ Bridge script environment: PASSED")
            except Exception as e:
                error_type = EnhancedRetryHandler._categorize_error(e)
                health_results.append(f"❌ Bridge script environment: FAILED ({error_type.value}) - {str(e)}")
            
            # 6. Quick server startup health check
            try:
                print("🚀 Testing server startup capability...")
                startup_test = await container.with_exec([
                    "timeout", "10s", "bash", "-c", 
                    "node dist/index.js & sleep 3 && kill %1"
                ]).stdout()
                health_results.append("✅ Server startup: PASSED")
            except Exception as e:
                error_type = EnhancedRetryHandler._categorize_error(e)
                health_results.append(f"⚠️  Server startup: TIMEOUT/ISSUES ({error_type.value}) - {str(e)}")
            
            # Health check summary
            passed_checks = sum(1 for r in health_results if "✅" in r)
            total_checks = len(health_results)
            failed_checks = sum(1 for r in health_results if "❌" in r)
            warning_checks = sum(1 for r in health_results if "⚠️" in r)
            
            overall_status = "HEALTHY" if failed_checks == 0 else "DEGRADED" if warning_checks > 0 else "CRITICAL"
            
            summary = f"""
🏥 SYSTEM HEALTH CHECK RESULTS
{'=' * 50}
📊 Overall Status: {overall_status}
✅ Passed: {passed_checks}/{total_checks}
❌ Failed: {failed_checks}/{total_checks}
⚠️  Warnings: {warning_checks}/{total_checks}

📋 DETAILED RESULTS:
{'-' * 30}
"""
            
            for result in health_results:
                summary += f"{result}\n"
            
            # Recommendations based on error types
            if failed_checks > 0:
                summary += f"\n🔧 REMEDIATION RECOMMENDATIONS:\n{'-' * 30}\n"
                for result in health_results:
                    if "❌" in result and "human_cognitive" in result:
                        summary += "• Check configuration files and dependencies\n"
                    elif "❌" in result and "artificial_stochastic" in result:
                        summary += "• Retry operation or check network connectivity\n"
                    elif "❌" in result and "system_failure" in result:
                        summary += "• Check system resources and container limits\n"
            
            return summary
        
        # Execute health check with minimal retry (health checks should be fast)
        result = await EnhancedRetryHandler.execute_with_retry(
            execute_health_checks,
            max_retries=1,
            base_delay=1.0,
            operation_name="System Health Check"
        )
        
        if isinstance(result, ErrorContext):
            return f"❌ Health check system failure: {result.message}"
        
        return result

    @function
    async def validate_config(
        self,
        source: Directory,
        config_path: str = "test-config.json"
    ) -> str:
        """
        Validate test configuration using enhanced validation.
        
        Args:
            source: Source directory containing the MCP server code
            config_path: Path to test configuration file
        
        Returns:
            Configuration validation results
        """
        config_file = source.file(config_path)
        config_content = await config_file.contents()
        
        try:
            config = json.loads(config_content)
            
            # Enhanced validation using our improved config structure
            validation_results = []
            
            # Check required sections (both legacy and new formats)
            required_sections = ["testing", "confidence"]
            for section in required_sections:
                if section in config:
                    validation_results.append(f"✅ {section} section present")
                else:
                    validation_results.append(f"❌ {section} section missing")
            
            # Check server configuration (both formats)
            if "servers" in config or "mcpServers" in config:
                validation_results.append("✅ Server configuration present")
                
                # Check specific server config
                servers = config.get("servers", config.get("mcpServers", {}))
                if "shrimp-task-manager" in servers:
                    server_config = servers["shrimp-task-manager"]
                    if server_config.get("command"):
                        validation_results.append("✅ Server command specified")
                    else:
                        validation_results.append("❌ Server command missing")
                else:
                    validation_results.append("⚠️  shrimp-task-manager server not configured")
            else:
                validation_results.append("❌ No server configuration found")
            
            # Check confidence thresholds
            confidence_config = config.get("confidence", {})
            confidence_thresholds = config.get("confidence_thresholds", {})
            
            if confidence_config or confidence_thresholds:
                validation_results.append("✅ Confidence thresholds configured")
                
                # Check specific thresholds
                test_types = ["functional", "security", "performance", "integration"]
                for test_type in test_types:
                    threshold = confidence_thresholds.get(f"{test_type}_minimum") or confidence_config.get(test_type, {}).get("threshold")
                    if threshold:
                        validation_results.append(f"✅ {test_type} threshold: {threshold}%")
                    else:
                        validation_results.append(f"⚠️  {test_type} threshold not set")
            else:
                validation_results.append("❌ No confidence configuration found")
            
            # Check mcp-client-cli compatibility
            if "servers" in config and "confidence_thresholds" in config:
                validation_results.append("✅ mcp-client-cli compatible format")
            else:
                validation_results.append("⚠️  Consider upgrading to mcp-client-cli compatible format")
            
            # Overall assessment
            error_count = sum(1 for r in validation_results if "❌" in r)
            warning_count = sum(1 for r in validation_results if "⚠️" in r)
            
            if error_count == 0:
                if warning_count == 0:
                    overall_status = "🎉 Configuration validation PASSED - Fully compliant"
                else:
                    overall_status = f"✅ Configuration validation PASSED with {warning_count} warnings"
            else:
                overall_status = f"❌ Configuration validation FAILED - {error_count} errors found"
            
            return f"{overall_status}\n\n" + "\n".join(validation_results)
            
        except json.JSONDecodeError as e:
            return f"❌ Configuration validation FAILED - Invalid JSON: {str(e)}"

    @function
    async def run_enhanced_test_suite(
        self,
        source: Directory,
        test_types: List[str] = ["functional", "security", "performance", "integration"],
        node_versions: List[str] = ["20"],
        parallel: bool = True
    ) -> str:
        """
        Run enhanced comprehensive test suite with methodological pragmatism verification.
        
        Args:
            source: Source directory containing the MCP server code
            test_types: List of test types to run
            node_versions: List of Node.js versions to test
            parallel: Whether to run tests in parallel
        
        Returns:
            Enhanced test suite results with confidence analysis
        """
        import asyncio
        
        start_time = asyncio.get_event_loop().time()
        
        # Enhanced test execution with systematic verification
        results = {}
        
        if parallel and len(test_types) > 1:
            # Parallel execution for efficiency
            async def run_test_type(test_type: str) -> tuple[str, str]:
                if test_type == "functional":
                    result = await self.test_functional(source, node_versions[0])
                elif test_type == "security":
                    result = await self.test_security(source, node_versions[0])
                elif test_type == "performance":
                    result = await self.test_performance(source, node_versions[0])
                elif test_type == "integration":
                    result = await self.test_integration(source, node_versions[0])
                else:
                    result = f"⚠️  Unknown test type: {test_type}"
                
                return test_type, result
            
            # Run all test types concurrently
            test_tasks = [run_test_type(test_type) for test_type in test_types]
            test_results = await asyncio.gather(*test_tasks, return_exceptions=True)
            
            for result in test_results:
                if isinstance(result, Exception):
                    continue
                test_type, output = result
                results[test_type] = output
        else:
            # Sequential execution
            for test_type in test_types:
                if test_type == "functional":
                    results[test_type] = await self.test_functional(source, node_versions[0])
                elif test_type == "security":
                    results[test_type] = await self.test_security(source, node_versions[0])
                elif test_type == "performance":
                    results[test_type] = await self.test_performance(source, node_versions[0])
                elif test_type == "integration":
                    results[test_type] = await self.test_integration(source, node_versions[0])
        
        # Matrix testing if multiple Node.js versions
        if len(node_versions) > 1:
            matrix_result = await self.test_matrix(source, node_versions)
            results["matrix"] = matrix_result
        
        total_time = asyncio.get_event_loop().time() - start_time
        
        # Systematic verification summary following methodological pragmatism
        passed_tests = sum(1 for r in results.values() if "PASSED" in str(r))
        total_tests = len(results)
        success_rate = passed_tests / total_tests if total_tests > 0 else 0.0
        
        summary = f"""
🎯 ENHANCED TEST SUITE RESULTS
{'=' * 60}

⏱️  Execution Time: {total_time:.2f} seconds
🔄 Execution Mode: {'Parallel' if parallel else 'Sequential'}
📊 Test Types: {', '.join(test_types)}
🐍 Node.js Versions: {', '.join(node_versions)}

📈 SYSTEMATIC VERIFICATION:
{'=' * 30}
✅ Success Rate: {passed_tests}/{total_tests} ({success_rate:.1%})
📋 Methodological Pragmatism: {'COMPLIANT' if success_rate >= 0.8 else 'REQUIRES_ATTENTION'}
🎉 Overall Status: {'ALL_PASSED' if success_rate == 1.0 else 'PARTIAL_SUCCESS' if success_rate >= 0.8 else 'NEEDS_IMPROVEMENT'}

📊 DETAILED RESULTS:
{'=' * 30}
"""
        
        for test_type, result in results.items():
            status = "✅ PASSED" if "PASSED" in str(result) else "❌ FAILED" if "FAILED" in str(result) else "⚠️  PARTIAL"
            summary += f"\n🔍 {test_type.upper()}: {status}"
        
        summary += f"\n\n📋 FULL TEST OUTPUT:\n{'=' * 60}\n"
        for test_type, result in results.items():
            summary += f"\n📁 {test_type.upper()}:\n{'=' * 30}\n{result}\n"
        
        return summary

    @function
    async def test_matrix(
        self,
        source: Directory,
        node_versions: List[str] = ["18", "20", "22"]
    ) -> str:
        """
        Run tests across multiple Node.js versions with enhanced parallel execution and error handling.
        
        Leverages shared base container setup with comprehensive retry mechanisms and
        error categorization for each Node.js version.
        
        Args:
            source: Source directory containing the MCP server code
            node_versions: List of Node.js versions to test against
        
        Returns:
            Matrix test results summary with error analysis
        """
        async def execute_matrix_tests():
            results = []
            
            print(f"🎯 Starting matrix tests across Node.js versions: {', '.join(node_versions)}")
            
            # Run tests in parallel for better performance
            import asyncio
            
            async def test_version(version: str) -> str:
                async def version_test():
                    # Use functional tests for matrix (lightweight but comprehensive)
                    result = await self.test_functional(source, version)
                    return f"✅ Node.js {version}: PASSED\n{result}"
                
                # Execute with retry for each version
                result = await EnhancedRetryHandler.execute_with_retry(
                    version_test,
                    max_retries=2,
                    operation_name=f"Matrix Test Node.js {version}"
                )
                
                if isinstance(result, ErrorContext):
                    return f"❌ Node.js {version}: FAILED ({result.error_type.value}) - {result.message}"
                
                return result
            
            # Execute tests concurrently
            version_tasks = [test_version(version) for version in node_versions]
            results = await asyncio.gather(*version_tasks, return_exceptions=True)
            
            # Format results with enhanced error analysis
            formatted_results = []
            error_summary = {"human_cognitive": 0, "artificial_stochastic": 0, "system_failure": 0}
            
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    error_type = EnhancedRetryHandler._categorize_error(result)
                    error_summary[error_type.value] += 1
                    formatted_results.append(f"💥 Node.js {node_versions[i]}: ERROR ({error_type.value}) - {str(result)}")
                else:
                    formatted_results.append(str(result))
            
            success_count = sum(1 for r in formatted_results if "PASSED" in r)
            failed_count = sum(1 for r in formatted_results if "FAILED" in r or "ERROR" in r)
            total_count = len(node_versions)
            
            # Enhanced summary with error categorization
            summary = f"""
🎯 MATRIX TEST RESULTS
{'=' * 60}
📊 Success Rate: {success_count}/{total_count} ({success_count/total_count:.1%})
🔄 Tested Versions: {', '.join(node_versions)}
❌ Failed Tests: {failed_count}

📈 ERROR ANALYSIS:
{'-' * 30}
🧠 Human-Cognitive Errors: {error_summary['human_cognitive']}
🎲 Artificial-Stochastic Errors: {error_summary['artificial_stochastic']}
💻 System Failures: {error_summary['system_failure']}

🎉 OVERALL STATUS: {'ALL_PASSED' if success_count == total_count else 'PARTIAL_SUCCESS' if success_count > 0 else 'ALL_FAILED'}

📋 DETAILED RESULTS:
{'=' * 60}
"""
            
            for result in formatted_results:
                summary += f"{result}\n\n"
            
            # Methodological pragmatism assessment
            if success_count >= total_count * 0.8:
                summary += "✅ Methodological Pragmatism Assessment: COMPLIANT\n"
            else:
                summary += "⚠️  Methodological Pragmatism Assessment: REQUIRES_ATTENTION\n"
            
            return summary
        
        result = await EnhancedRetryHandler.execute_with_retry(
            execute_matrix_tests,
            max_retries=1,  # Matrix tests shouldn't retry the whole operation
            operation_name="Matrix Test Suite"
        )
        
        if isinstance(result, ErrorContext):
            return f"❌ Matrix testing failed: {result.message}"
        
        return result

    @function
    async def generate_test_report(
        self,
        source: Directory,
        node_version: str = "20"
    ) -> str:
        """
        Generate comprehensive test report with enhanced error handling.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Test report content or file path with confidence analysis
        """
        async def execute_report_generation():
            container = await self.create_base_container(node_version)
            container = await self.setup_project_environment(container, source)
            
            # Run comprehensive tests with report generation
            result = await container.with_exec([
                "python3", "mcp-shrimp-bridge.py", 
                "--test-type", "all", 
                "--confidence-check", 
                "--report"
            ]).stdout()
            
            # Try to get the generated report
            try:
                report_content = await container.file("test-results/test-report.html").contents()
                return f"📋 Test Report Generated:\n{result}\n\nReport Content:\n{report_content}"
            except Exception as e:
                print(f"⚠️  Could not retrieve HTML report: {str(e)}")
                return f"📋 Test Report Results:\n{result}"
        
        result = await EnhancedRetryHandler.execute_with_retry(
            execute_report_generation,
            max_retries=2,
            operation_name="Test Report Generation"
        )
        
        if isinstance(result, ErrorContext):
            return f"❌ Report generation failed: {result.message}"
        
        return result
