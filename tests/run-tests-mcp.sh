#!/bin/bash

# MCP-Shrimp Testing Script
# Bridges npm scripts with mcp-client-cli testing framework via mcp-shrimp-bridge.py
# 
# Usage:
#   ./tests/run-tests-mcp.sh [--comprehensive|--functional|--security|--performance|--integration|--quick|--report]
#
# Following methodological pragmatism principles for systematic verification

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/test-config.json"
BRIDGE_SCRIPT="$PROJECT_ROOT/mcp-shrimp-bridge.py"
LOG_FILE="$PROJECT_ROOT/test-results/mcp-tests.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Ensure test results directory exists
mkdir -p "$PROJECT_ROOT/test-results"

# Logging function
log() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if bridge script exists
    if [[ ! -f "$BRIDGE_SCRIPT" ]]; then
        error "Bridge script not found: $BRIDGE_SCRIPT"
        exit 1
    fi
    
    # Check if config file exists
    if [[ ! -f "$CONFIG_FILE" ]]; then
        error "Configuration file not found: $CONFIG_FILE"
        exit 1
    fi
    
    # Check if python3 is available
    if ! command -v python3 &> /dev/null; then
        error "python3 is required but not installed"
        exit 1
    fi
    
    # Check if Node.js project is built
    if [[ ! -d "$PROJECT_ROOT/dist" ]]; then
        warning "dist directory not found, building project..."
        cd "$PROJECT_ROOT"
        npm run build || {
            error "Failed to build project"
            exit 1
        }
    fi
    
    success "Prerequisites check passed"
}

# Show usage information
show_usage() {
    cat << EOF
🎯 MCP-Shrimp Testing Script

Usage: $0 [OPTIONS]

OPTIONS:
    --comprehensive     Run all test suites with full reporting
    --functional        Run functional tests only
    --security          Run security tests only
    --performance       Run performance tests only
    --integration       Run integration tests only
    --quick             Run quick functional tests
    --report            Generate detailed test report
    --confidence-check  Enforce confidence thresholds
    --verbose           Enable verbose output
    --help              Show this help message

EXAMPLES:
    $0                           # Run comprehensive test suite
    $0 --functional              # Run functional tests only
    $0 --comprehensive --report  # Full tests with detailed report
    $0 --quick                   # Quick validation tests

EOF
}

# Parse command line arguments
parse_arguments() {
    TEST_TYPE="all"
    CONFIDENCE_CHECK=""
    VERBOSE=""
    GENERATE_REPORT=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --comprehensive)
                TEST_TYPE="all"
                CONFIDENCE_CHECK="--confidence-check"
                shift
                ;;
            --functional)
                TEST_TYPE="functional"
                shift
                ;;
            --security)
                TEST_TYPE="security"
                shift
                ;;
            --performance)
                TEST_TYPE="performance"
                shift
                ;;
            --integration)
                TEST_TYPE="integration"
                shift
                ;;
            --quick)
                TEST_TYPE="functional"
                shift
                ;;
            --report)
                GENERATE_REPORT="true"
                shift
                ;;
            --confidence-check)
                CONFIDENCE_CHECK="--confidence-check"
                shift
                ;;
            --verbose)
                VERBOSE="--verbose"
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Run MCP tests via bridge
run_mcp_tests() {
    log "🚀 Starting MCP testing via bridge..."
    log "📋 Test Type: $TEST_TYPE"
    log "📁 Config: $CONFIG_FILE"
    
    # Build python command
    local cmd="python3 \"$BRIDGE_SCRIPT\" --test-type \"$TEST_TYPE\" --config \"$CONFIG_FILE\""
    
    if [[ -n "$CONFIDENCE_CHECK" ]]; then
        cmd="$cmd $CONFIDENCE_CHECK"
    fi
    
    if [[ -n "$VERBOSE" ]]; then
        cmd="$cmd $VERBOSE"
    fi
    
    log "🔧 Command: $cmd"
    
    # Change to project root for execution
    cd "$PROJECT_ROOT"
    
    # Execute the bridge script
    local exit_code=0
    eval "$cmd" || exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        success "✅ MCP tests completed successfully"
    else
        error "❌ MCP tests failed with exit code: $exit_code"
    fi
    
    return $exit_code
}

# Generate test report if requested
generate_report() {
    if [[ "$GENERATE_REPORT" == "true" ]]; then
        log "📊 Generating test report..."
        
        local report_file="$PROJECT_ROOT/test-results/mcp-test-report-$(date +%Y%m%d-%H%M%S).html"
        
        # Check if HTML report was generated by bridge
        if [[ -f "$PROJECT_ROOT/test-results/test-report.html" ]]; then
            cp "$PROJECT_ROOT/test-results/test-report.html" "$report_file"
            success "📋 Test report generated: $report_file"
        else
            # Generate basic report from log
            cat << EOF > "$report_file"
<!DOCTYPE html>
<html>
<head>
    <title>MCP-Shrimp Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .log { background: #f9f9f9; padding: 15px; border-radius: 5px; font-family: monospace; }
        .timestamp { color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 MCP-Shrimp Test Report</h1>
        <p><strong>Generated:</strong> $(date)</p>
        <p><strong>Test Type:</strong> $TEST_TYPE</p>
        <p><strong>Configuration:</strong> $CONFIG_FILE</p>
    </div>
    <h2>Test Log</h2>
    <div class="log">
        <pre>$(cat "$LOG_FILE" 2>/dev/null || echo "No log file found")</pre>
    </div>
</body>
</html>
EOF
            success "📋 Basic test report generated: $report_file"
        fi
    fi
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up..."
    # Add any cleanup logic here if needed
}

# Main execution
main() {
    # Set up signal handling
    trap cleanup EXIT
    
    # Initialize log
    echo "🎯 MCP-Shrimp Testing Session Started: $(date)" > "$LOG_FILE"
    
    log "🎯 MCP-Shrimp Testing Framework"
    log "=" 50
    
    # Parse arguments
    parse_arguments "$@"
    
    # Check prerequisites
    check_prerequisites
    
    # Run tests
    local test_exit_code=0
    run_mcp_tests || test_exit_code=$?
    
    # Generate report if requested
    generate_report
    
    # Final status
    if [[ $test_exit_code -eq 0 ]]; then
        success "🎉 All tests completed successfully"
        log "📈 Methodological pragmatism verification: PASSED"
    else
        error "💥 Tests failed - see log for details"
        log "📉 Methodological pragmatism verification: FAILED"
    fi
    
    # Summary
    log "📋 Test Summary:"
    log "   - Type: $TEST_TYPE"
    log "   - Exit Code: $test_exit_code"
    log "   - Log: $LOG_FILE"
    if [[ "$GENERATE_REPORT" == "true" ]]; then
        log "   - Report: Generated in test-results/"
    fi
    
    exit $test_exit_code
}

# Execute main function with all arguments
main "$@"
