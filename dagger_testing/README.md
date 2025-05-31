# MCP Testing Framework - Dagger Module

This directory contains the Dagger module for running MCP server tests locally.

## Prerequisites

- Dagger CLI installed (v0.18.8 or later)
- Python 3.8+ for the Dagger Python SDK
- Docker for containerized testing

## Available Functions

### Comprehensive Testing

```bash
# Run all tests (functional, security, performance, integration)
dagger call test-all --source=.

# Run tests with specific Node.js version
dagger call test-all --source=. --node-version=18
```

### Individual Test Suites

```bash
# Functional tests
dagger call test-functional --source=.

# Security tests
dagger call test-security --source=.

# Performance tests
dagger call test-performance --source=.

# Integration tests
dagger call test-integration --source=.

# Quick connectivity check
dagger call test-quick-check --source=.
```

### Matrix Testing

```bash
# Test across multiple Node.js versions
dagger call test-matrix --source=. --node-versions=18,20,22
```

### Reporting

```bash
# Generate HTML test report
dagger call generate-test-report --source=. > test-report.html

# Validate test configuration
dagger call validate-config --source=.
```

## Configuration

The module uses the `test-config.json` file for test configuration. Validate your configuration with:

```bash
dagger call validate-config --source=.
```

## Examples

### Basic Usage

```bash
# Quick test to verify MCP server functionality
dagger call test-quick-check --source=.

# Comprehensive testing
dagger call test-all --source=.
```

### CI/CD Integration

```bash
# Matrix testing for CI/CD
dagger call test-matrix --source=. --node-versions=18,20,22
```

### Development Workflow

```bash
# Validate configuration
dagger call validate-config --source=.

# Run functional tests during development
dagger call test-functional --source=.

# Generate report before deployment
dagger call generate-test-report --source=. > reports/test-report.html
```

## Benefits

- **Local Testing**: Mirror GitHub Actions workflow locally
- **Containerized**: Consistent testing environment across different machines
- **Flexible**: Run individual test suites or comprehensive testing
- **Matrix Testing**: Test across multiple Node.js versions
- **Reporting**: Generate detailed HTML reports

## Integration with npm Scripts

The Dagger module complements the npm scripts defined in `package.json`:

- Use npm scripts for quick local testing
- Use Dagger for containerized, reproducible testing
- Use GitHub Actions for automated CI/CD testing

## Troubleshooting

### Common Issues

1. **Dagger not found**: Ensure Dagger CLI is installed
2. **Permission errors**: Make sure `tests/run-tests.sh` is executable
3. **Configuration errors**: Run `validate-config` to check configuration

### Debug Mode

Add `--debug` flag to any dagger call for verbose output:

```bash
dagger call test-functional --source=. --debug
```
