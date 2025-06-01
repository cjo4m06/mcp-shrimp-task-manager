#!/bin/bash

# MCP Server Testing Script
# Automated testing script for Shrimp Task Manager MCP server

set -e

echo "🧪 MCP Shrimp Task Manager Testing Suite"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONFIG_FILE="test-config.json"
SERVER_START_TIMEOUT=10
TEST_TIMEOUT=300

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if server is running
check_server() {
    local max_attempts=10
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 > /dev/null 2>&1; then
            return 0
        fi
        sleep 1
        ((attempt++))
    done
    return 1
}

# Function to start server
start_server() {
    print_status $BLUE "📦 Building server..."
    npm run build || {
        print_status $RED "❌ Failed to build server"
        exit 1
    }
    
    print_status $BLUE "🚀 Starting MCP server..."
    timeout ${TEST_TIMEOUT}s node dist/index.js &
    SERVER_PID=$!
    
    print_status $YELLOW "⏳ Waiting for server to start..."
    sleep $SERVER_START_TIMEOUT
    
    if ! check_server; then
        print_status $YELLOW "⚠️  Server not responding on HTTP port, continuing with MCP testing..."
    fi
}

# Function to stop server
stop_server() {
    if [ ! -z "$SERVER_PID" ]; then
        print_status $BLUE "🛑 Stopping server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
}

# Function to run test suite
run_test_suite() {
    local suite_name=$1
    local output_file="${suite_name}-results.json"
    
    print_status $BLUE "🧪 Running ${suite_name} tests..."
    
    if mcp-test --run-test-suite $suite_name --config $CONFIG_FILE --output-format json > $output_file; then
        print_status $GREEN "✅ ${suite_name} tests completed successfully"
        
        # Extract confidence score if available
        if command -v jq >/dev/null 2>&1; then
            local confidence=$(jq -r '.confidence_score // "N/A"' $output_file 2>/dev/null || echo "N/A")
            if [ "$confidence" != "N/A" ]; then
                print_status $BLUE "📊 Confidence Score: ${confidence}%"
            fi
        fi
    else
        print_status $RED "❌ ${suite_name} tests failed"
        return 1
    fi
}

# Function to generate report
generate_report() {
    print_status $BLUE "📋 Generating comprehensive test report..."
    
    if mcp-test --generate-test-report --config $CONFIG_FILE --output-format html; then
        print_status $GREEN "✅ Test report generated successfully"
        if [ -f "test-report.html" ]; then
            print_status $BLUE "📄 Report available at: test-report.html"
        fi
    else
        print_status $YELLOW "⚠️  Report generation failed, but tests completed"
    fi
}

# Cleanup function
cleanup() {
    print_status $BLUE "🧹 Cleaning up..."
    stop_server
}

# Set trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    print_status $BLUE "🔧 Checking prerequisites..."
    
    # Check if mcp-testing-framework is installed
    if ! command -v mcp-test >/dev/null 2>&1; then
        print_status $YELLOW "📦 Installing MCP Testing Framework..."
        pip install mcp-testing-framework || {
            print_status $RED "❌ Failed to install MCP Testing Framework"
            exit 1
        }
    fi
    
    # Check if config file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        print_status $RED "❌ Configuration file $CONFIG_FILE not found"
        exit 1
    fi
    
    # Start server
    start_server
    
    # Run test suites
    local all_tests_passed=true
    
    # Functional tests
    if ! run_test_suite "functional"; then
        all_tests_passed=false
    fi
    
    # Security tests
    if ! run_test_suite "security"; then
        all_tests_passed=false
    fi
    
    # Performance tests
    if ! run_test_suite "performance"; then
        all_tests_passed=false
    fi
    
    # Integration tests
    if ! run_test_suite "integration"; then
        all_tests_passed=false
    fi
    
    # Generate final report
    generate_report
    
    # Final status
    if $all_tests_passed; then
        print_status $GREEN "🎉 All test suites completed successfully!"
        print_status $BLUE "📊 Review detailed results in the generated reports"
        exit 0
    else
        print_status $YELLOW "⚠️  Some tests failed - review results for details"
        exit 1
    fi
}

# Run main function
main "$@"
