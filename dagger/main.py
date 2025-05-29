"""
MCP Testing Framework Dagger Module

This module provides local testing capabilities that mirror the GitHub Actions workflow
for comprehensive MCP server testing including functional, security, performance,
and integration tests.
"""

import json
import os
from pathlib import Path
from typing import List, Optional

import dagger
from dagger import dag, function, object_type


@object_type
class MCPTestingFramework:
    """MCP Testing Framework Dagger module for local testing pipeline."""

    @function
    async def test_all(
        self,
        source: dagger.Directory,
        node_version: str = "20",
        test_config_path: str = "test-config.json"
    ) -> str:
        """
        Run comprehensive MCP server tests including functional, security, 
        performance, and integration tests.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing (default: "20")
            test_config_path: Path to test configuration file
        
        Returns:
            Test results summary
        """
        # Load test configuration
        config_file = source.file(test_config_path)
        config_content = await config_file.contents()
        config = json.loads(config_content)
        
        # Set up Node.js environment
        container = (
            dag.container()
            .from_(f"node:{node_version}-slim")
            .with_exec(["apt-get", "update"])
            .with_exec(["apt-get", "install", "-y", "git", "curl", "jq", "python3", "python3-pip"])
            .with_directory("/app", source)
            .with_workdir("/app")
        )
        
        # Install dependencies
        container = container.with_exec(["npm", "install"])
        
        # Make test script executable
        container = container.with_exec(["chmod", "+x", "tests/run-tests.sh"])
        
        # Run comprehensive tests
        result = await container.with_exec([
            "bash", "tests/run-tests.sh", "--comprehensive"
        ]).stdout()
        
        return result

    @function
    async def test_functional(
        self,
        source: dagger.Directory,
        node_version: str = "20"
    ) -> str:
        """
        Run functional tests for MCP server capabilities.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Functional test results
        """
        container = (
            dag.container()
            .from_(f"node:{node_version}-slim")
            .with_exec(["apt-get", "update"])
            .with_exec(["apt-get", "install", "-y", "git", "curl", "jq"])
            .with_directory("/app", source)
            .with_workdir("/app")
            .with_exec(["npm", "install"])
            .with_exec(["chmod", "+x", "tests/run-tests.sh"])
        )
        
        result = await container.with_exec([
            "bash", "tests/run-tests.sh", "--functional"
        ]).stdout()
        
        return result

    @function
    async def test_security(
        self,
        source: dagger.Directory,
        node_version: str = "20"
    ) -> str:
        """
        Run security tests for MCP server.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Security test results
        """
        container = (
            dag.container()
            .from_(f"node:{node_version}-slim")
            .with_exec(["apt-get", "update"])
            .with_exec(["apt-get", "install", "-y", "git", "curl", "jq"])
            .with_directory("/app", source)
            .with_workdir("/app")
            .with_exec(["npm", "install"])
            .with_exec(["chmod", "+x", "tests/run-tests.sh"])
        )
        
        result = await container.with_exec([
            "bash", "tests/run-tests.sh", "--security"
        ]).stdout()
        
        return result

    @function
    async def test_performance(
        self,
        source: dagger.Directory,
        node_version: str = "20"
    ) -> str:
        """
        Run performance tests for MCP server.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Performance test results
        """
        container = (
            dag.container()
            .from_(f"node:{node_version}-slim")
            .with_exec(["apt-get", "update"])
            .with_exec(["apt-get", "install", "-y", "git", "curl", "jq", "python3", "python3-pip"])
            .with_directory("/app", source)
            .with_workdir("/app")
            .with_exec(["npm", "install"])
            .with_exec(["chmod", "+x", "tests/run-tests.sh"])
        )
        
        result = await container.with_exec([
            "bash", "tests/run-tests.sh", "--performance"
        ]).stdout()
        
        return result

    @function
    async def test_integration(
        self,
        source: dagger.Directory,
        node_version: str = "20"
    ) -> str:
        """
        Run integration tests for MCP server.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Integration test results
        """
        container = (
            dag.container()
            .from_(f"node:{node_version}-slim")
            .with_exec(["apt-get", "update"])
            .with_exec(["apt-get", "install", "-y", "git", "curl", "jq"])
            .with_directory("/app", source)
            .with_workdir("/app")
            .with_exec(["npm", "install"])
            .with_exec(["chmod", "+x", "tests/run-tests.sh"])
        )
        
        result = await container.with_exec([
            "bash", "tests/run-tests.sh", "--integration"
        ]).stdout()
        
        return result

    @function
    async def test_quick_check(
        self,
        source: dagger.Directory,
        node_version: str = "20"
    ) -> str:
        """
        Run quick connectivity test for MCP server.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Quick test results
        """
        container = (
            dag.container()
            .from_(f"node:{node_version}-slim")
            .with_exec(["apt-get", "update"])
            .with_exec(["apt-get", "install", "-y", "git", "curl", "jq"])
            .with_directory("/app", source)
            .with_workdir("/app")
            .with_exec(["npm", "install"])
            .with_exec(["chmod", "+x", "tests/run-tests.sh"])
        )
        
        result = await container.with_exec([
            "bash", "tests/run-tests.sh", "--quick"
        ]).stdout()
        
        return result

    @function
    async def test_matrix(
        self,
        source: dagger.Directory,
        node_versions: List[str] = ["18", "20", "22"]
    ) -> str:
        """
        Run tests across multiple Node.js versions (matrix testing).
        
        Args:
            source: Source directory containing the MCP server code
            node_versions: List of Node.js versions to test against
        
        Returns:
            Matrix test results summary
        """
        results = []
        
        for version in node_versions:
            try:
                result = await self.test_functional(source, version)
                results.append(f"Node.js {version}: PASSED\n{result}")
            except Exception as e:
                results.append(f"Node.js {version}: FAILED - {str(e)}")
        
        return "\n\n--- MATRIX TEST RESULTS ---\n" + "\n\n".join(results)

    @function
    async def generate_test_report(
        self,
        source: dagger.Directory,
        node_version: str = "20"
    ) -> dagger.File:
        """
        Generate comprehensive HTML test report.
        
        Args:
            source: Source directory containing the MCP server code
            node_version: Node.js version to use for testing
        
        Returns:
            Generated HTML test report file
        """
        container = (
            dag.container()
            .from_(f"node:{node_version}-slim")
            .with_exec(["apt-get", "update"])
            .with_exec(["apt-get", "install", "-y", "git", "curl", "jq", "python3", "python3-pip"])
            .with_directory("/app", source)
            .with_workdir("/app")
            .with_exec(["npm", "install"])
            .with_exec(["chmod", "+x", "tests/run-tests.sh"])
            .with_exec(["bash", "tests/run-tests.sh", "--report"])
        )
        
        return container.file("test-report.html")

    @function
    async def validate_config(
        self,
        source: dagger.Directory,
        config_path: str = "test-config.json"
    ) -> str:
        """
        Validate test configuration file.
        
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
            
            # Validate required sections
            required_sections = ["server", "tests", "confidence", "reporting"]
            missing_sections = [section for section in required_sections if section not in config]
            
            if missing_sections:
                return f"❌ Configuration validation failed. Missing sections: {', '.join(missing_sections)}"
            
            # Validate server configuration
            server_config = config.get("server", {})
            if not server_config.get("command"):
                return "❌ Configuration validation failed. Missing server.command"
            
            # Validate test types
            test_types = config.get("tests", {})
            expected_types = ["functional", "security", "performance", "integration"]
            missing_types = [t for t in expected_types if t not in test_types]
            
            if missing_types:
                return f"⚠️  Configuration warning. Missing test types: {', '.join(missing_types)}"
            
            return "✅ Configuration validation passed. All required sections and settings are present."
            
        except json.JSONDecodeError as e:
            return f"❌ Configuration validation failed. Invalid JSON: {str(e)}"
