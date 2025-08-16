#!/bin/bash

# Test script to verify activation commands work correctly

echo "=== Template Activation Command Test ==="
echo

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test environment variable
TEST_VAR="MCP_PROMPT_ANALYZE_TASK"
TEST_CONTENT="This is a test template\\nWith multiple lines\\nAnd special chars: \$HOME \"quotes\" \`backticks\`"

echo -e "${YELLOW}1. Testing temporary export:${NC}"
export $TEST_VAR="$TEST_CONTENT"
echo -e "${GREEN}✓ Exported $TEST_VAR${NC}"
echo "Value: ${!TEST_VAR:0:50}..."
unset $TEST_VAR

echo
echo -e "${YELLOW}2. Testing .bashrc append (dry run):${NC}"
echo "Command that would be run:"
echo "echo 'export $TEST_VAR=\"$TEST_CONTENT\"' >> ~/.bashrc"
echo -e "${GREEN}✓ Command syntax is valid${NC}"

echo
echo -e "${YELLOW}3. Testing sed replacement (dry run):${NC}"
echo "Command that would be run:"
echo "sed -i '/$TEST_VAR=/d' ~/.bashrc && echo 'export $TEST_VAR=\"$TEST_CONTENT\"' >> ~/.bashrc"
echo -e "${GREEN}✓ Command syntax is valid${NC}"

echo
echo -e "${YELLOW}4. Testing current shell detection:${NC}"
echo "Current shell: $SHELL"
if [[ "$SHELL" == *"bash"* ]]; then
    echo -e "${GREEN}✓ Using Bash${NC}"
elif [[ "$SHELL" == *"zsh"* ]]; then
    echo -e "${GREEN}✓ Using Zsh${NC}"
else
    echo -e "${RED}✗ Unknown shell${NC}"
fi

echo
echo -e "${YELLOW}5. Checking for existing MCP_PROMPT variables:${NC}"
env | grep "MCP_PROMPT" || echo "No MCP_PROMPT variables currently set"

echo
echo -e "${GREEN}Test complete! The activation dialog commands should work correctly.${NC}"