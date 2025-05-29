#!/bin/bash

# MCP Testing Framework - Local Dagger Test Runner
# This script demonstrates how to use the Dagger module for local testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
        *)
            print_error "Unknown test type: $test_type"
            echo "Available types: quick, functional, security, performance, integration, all, matrix"
            exit 1
            ;;
    esac
}

# Generate test report
generate_report() {
    local node_version=${1:-20}
    print_status "Generating test report with Node.js $node_version..."
    
    if dagger call generate-test-report --source=. --node-version="$node_version" > test-report.html; then
        print_success "Test report generated: test-report.html"
    else
        print_error "Failed to generate test report"
        exit 1
    fi
}

# Show usage
show_usage() {
    echo "MCP Testing Framework - Local Dagger Test Runner"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  check          - Check prerequisites and validate configuration"
    echo "  quick          - Run quick connectivity test"
    echo "  functional     - Run functional tests"
    echo "  security       - Run security tests"
    echo "  performance    - Run performance tests"
    echo "  integration    - Run integration tests"
    echo "  all            - Run comprehensive tests"
    echo "  matrix         - Run matrix tests across Node.js versions"
    echo "  report         - Generate HTML test report"
    echo ""
    echo "Options:"
    echo "  --node-version VERSION    Node.js version to use (default: 20)"
    echo ""
    echo "Examples:"
    echo "  $0 check                  # Check prerequisites"
    echo "  $0 quick                  # Quick test"
    echo "  $0 all                    # Comprehensive testing"
    echo "  $0 matrix                 # Matrix testing"
    echo "  $0 functional --node-version 18"
    echo "  $0 report                 # Generate HTML report"
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
