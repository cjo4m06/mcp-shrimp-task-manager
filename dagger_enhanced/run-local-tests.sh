#!/bin/bash

# MCP Testing Framework - Local Dagger Test Runner
# This script demonstrates how to use the Dagger module and MCP Client CLI for local testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Dagger is installed
check_dagger() {
    if ! command -v dagger &> /dev/null; then
        print_error "Dagger CLI not found. Please install Dagger first."
        echo "Visit: https://docs.dagger.io/install"
        exit 1
    fi
    
    print_success "Dagger CLI found: $(dagger version | head -n1)"
}

# Check if MCP Testing Framework is installed
check_mcp_testing() {
    print_status "Checking MCP Testing Framework..."
    
    if ! command -v mcp-test &> /dev/null; then
        print_warning "MCP Testing Framework not found. Installing now..."
        if ! pip install mcp-testing-framework; then
            print_error "Failed to install MCP Testing Framework"
            echo "Try manually: pip install mcp-testing-framework"
            exit 1
        fi
        print_success "MCP Testing Framework installed successfully"
    else
        print_success "MCP Testing Framework found: $(mcp-test --version 2>/dev/null || echo 'version unknown')"
    fi
}

# Validate configuration
validate_config() {
    print_status "Validating test configuration..."
    if dagger call validate-config --source=. > /dev/null 2>&1; then
        print_success "Configuration validation passed"
    else
        print_error "Configuration validation failed"
        dagger call validate-config --source=.
        exit 1
    fi
}

# Run specific test type
run_test() {
    local test_type=$1
    local node_version=${2:-20}
    
    print_status "Running $test_type tests with Node.js $node_version..."
    
    case $test_type in
        "quick")
            dagger call test-quick-check --source=. --node-version="$node_version"
            ;;
        "functional")
            dagger call test-functional --source=. --node-version="$node_version"
            ;;
        "security")
            dagger call test-security --source=. --node-version="$node_version"
            ;;
        "performance")
            dagger call test-performance --source=. --node-version="$node_version"
            ;;
        "integration")
            dagger call test-integration --source=. --node-version="$node_version"
            ;;
        "all")
            dagger call test-all --source=. --node-version="$node_version"
            ;;
        "matrix")
            print_status "Running matrix tests across Node.js versions 18, 20, 22..."
            dagger call test-matrix --source=. --node-versions=18,20,22
            ;;
        "mcp-quick")
            run_mcp_test --test-mcp-servers --test-timeout 15
            ;;
        "mcp-functional")
            run_mcp_test --run-test-suite functional
            ;;
        "mcp-security")
            run_mcp_test --run-test-suite security
            ;;
        "mcp-performance")
            run_mcp_test --run-test-suite performance --test-timeout 120
            ;;
        "mcp-integration")
            run_mcp_test --run-test-suite integration
            ;;
        "mcp-all")
            run_mcp_test --run-test-suite all --test-parallel
            ;;
        *)
            print_error "Unknown test type: $test_type"
            echo "Available types: quick, functional, security, performance, integration, all, matrix"
            echo "MCP Client CLI tests: mcp-quick, mcp-functional, mcp-security, mcp-performance, mcp-integration, mcp-all"
            exit 1
            ;;
    esac
}

# Run MCP Client CLI tests
run_mcp_test() {
    print_status "Running MCP Client CLI tests..."
    
    # Check if MCP Testing Framework is installed
    check_mcp_testing
    
    # Create config directory if it doesn't exist
    local config_dir="${HOME}/.mcp-testing"
    mkdir -p "$config_dir"
    
    # Copy test configuration to the config directory
    if [ -f "test-config.json" ]; then
        cp "test-config.json" "${config_dir}/config.json"
        print_status "Using test configuration from test-config.json"
    else
        print_warning "test-config.json not found, using default configuration"
        # Create minimal configuration
        cat > "${config_dir}/config.json" <<EOF
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "NODE_ENV": "test",
        "LOG_LEVEL": "info"
      }
    }
  }
}
EOF
    fi
    
    # Run MCP test with provided arguments
    print_status "Executing: mcp-test $*"
    if mcp-test "$@"; then
        print_success "MCP testing completed successfully"
        return 0
    else
        print_error "MCP testing failed"
        return 1
    fi
}

# Generate test report
generate_report() {
    local node_version=${1:-20}
    local report_type=${2:-dagger}
    
    case $report_type in
        "dagger")
            print_status "Generating Dagger test report with Node.js $node_version..."
            
            if dagger call generate-test-report --source=. --node-version="$node_version" > dagger-test-report.html; then
                print_success "Dagger test report generated: dagger-test-report.html"
            else
                print_error "Failed to generate Dagger test report"
                exit 1
            fi
            ;;
        "mcp")
            print_status "Generating MCP test report..."
            
            # Check if MCP Testing Framework is installed
            check_mcp_testing
            
            if mcp-test --generate-test-report --test-output-format html > mcp-test-report.html; then
                print_success "MCP test report generated: mcp-test-report.html"
            else
                print_error "Failed to generate MCP test report"
                exit 1
            fi
            ;;
        "all")
            generate_report "$node_version" "dagger"
            generate_report "$node_version" "mcp"
            ;;
        *)
            print_error "Unknown report type: $report_type"
            echo "Available types: dagger, mcp, all"
            exit 1
            ;;
    esac
}

# Show usage
show_usage() {
    echo "MCP Testing Framework - Local Test Runner"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  check          - Check prerequisites and validate configuration"
    echo ""
    echo "  Dagger-based tests:"
    echo "  quick          - Run quick connectivity test with Dagger"
    echo "  functional     - Run functional tests with Dagger"
    echo "  security       - Run security tests with Dagger"
    echo "  performance    - Run performance tests with Dagger"
    echo "  integration    - Run integration tests with Dagger"
    echo "  all            - Run comprehensive tests with Dagger"
    echo "  matrix         - Run matrix tests across Node.js versions with Dagger"
    echo ""
    echo "  MCP Client CLI tests:"
    echo "  mcp-quick      - Run quick MCP server connectivity test"
    echo "  mcp-functional - Run functional tests with MCP Client CLI"
    echo "  mcp-security   - Run security tests with MCP Client CLI"
    echo "  mcp-performance - Run performance tests with MCP Client CLI"
    echo "  mcp-integration - Run integration tests with MCP Client CLI"
    echo "  mcp-all        - Run comprehensive tests with MCP Client CLI"
    echo ""
    echo "  Reporting:"
    echo "  report         - Generate HTML test report with Dagger"
    echo "  mcp-report     - Generate HTML test report with MCP Client CLI"
    echo "  full-report    - Generate both Dagger and MCP Client CLI reports"
    echo ""
    echo "Options:"
    echo "  --node-version VERSION    Node.js version to use (default: 20)"
    echo ""
    echo "Examples:"
    echo "  $0 check                  # Check prerequisites"
    echo "  $0 quick                  # Quick Dagger test"
    echo "  $0 mcp-quick              # Quick MCP Client CLI test"
    echo "  $0 all                    # Comprehensive Dagger testing"
    echo "  $0 mcp-all                # Comprehensive MCP Client CLI testing"
    echo "  $0 matrix                 # Matrix testing with Dagger"
    echo "  $0 functional --node-version 18"
    echo "  $0 report                 # Generate Dagger HTML report"
    echo "  $0 mcp-report             # Generate MCP Client CLI HTML report"
    echo "  $0 full-report            # Generate both reports"
}

# Main execution
main() {
    local command=${1:-help}
    local node_version=20
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --node-version)
                node_version="$2"
                shift 2
                ;;
            *)
                if [[ -z "$command" || "$command" == "help" ]]; then
                    command="$1"
                fi
                shift
                ;;
        esac
    done
    
    case $command in
        "check")
            check_dagger
            validate_config
            print_success "All prerequisites check passed!"
            ;;
        "quick"|"functional"|"security"|"performance"|"integration"|"all"|"matrix")
            check_dagger
            validate_config
            run_test "$command" "$node_version"
            ;;
        "report")
            check_dagger
            validate_config
            generate_report "$node_version"
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

# Run main function with all arguments
main "$@"
