#!/bin/bash

# Test script for AttachEstimatePOTool via MCP API
# This script demonstrates how to call the tool using curl

# Configuration
BASE_URL="${AURA_MCP_URL:-http://localhost:8000}"
MCP_ENDPOINT="$BASE_URL/mcp/auraai"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Attach Estimate PO Tool - API Test"
echo "========================================"
echo ""

# Check if jq is installed for pretty JSON output
if command -v jq &> /dev/null; then
    JQ_CMD="jq"
else
    JQ_CMD="cat"
    echo -e "${YELLOW}Note: Install 'jq' for pretty JSON output${NC}"
    echo ""
fi

# Test 1: List available tools
echo -e "${GREEN}Test 1: Listing available MCP tools${NC}"
echo "Endpoint: $MCP_ENDPOINT"
echo ""

curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }' | $JQ_CMD

echo ""
echo "----------------------------------------"
echo ""

# Test 2: Call the tool (you need to update these values)
echo -e "${GREEN}Test 2: Calling attach_estimate_po tool${NC}"
echo -e "${YELLOW}Note: Update ESTIMATE_ID and PO_NUMBER with real values${NC}"
echo ""

ESTIMATE_ID="${1:-1}"  # Use first argument or default to 1
PO_NUMBER="${2:-TEST-PO-$(date +%Y%m%d-%H%M%S)}"  # Use second argument or generate test PO

echo "Parameters:"
echo "  - Estimate ID: $ESTIMATE_ID"
echo "  - PO Number: $PO_NUMBER"
echo ""

RESPONSE=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"attach_estimate_po\",
      \"arguments\": {
        \"estimate_id\": $ESTIMATE_ID,
        \"po_number\": \"$PO_NUMBER\",
        \"provisional\": false
      }
    },
    \"id\": 2
  }")

echo "$RESPONSE" | $JQ_CMD

# Check if successful
if echo "$RESPONSE" | grep -q '"success".*true'; then
    echo ""
    echo -e "${GREEN}✅ SUCCESS - PO attached successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ ERROR - PO attachment failed${NC}"
    echo -e "${YELLOW}Check the error message above for details${NC}"
fi

echo ""
echo "========================================"
echo ""

# Usage instructions
cat << 'EOF'
Usage:
  ./test-attach-po-api.sh [ESTIMATE_ID] [PO_NUMBER]

Examples:
  # Test with specific estimate and PO
  ./test-attach-po-api.sh 123 PO-2026-001

  # Test with provisional PO
  PROVISIONAL=true ./test-attach-po-api.sh 123 PROV-PO-2026-001

  # Test with custom URL
  AURA_MCP_URL=https://aura.example.com ./test-attach-po-api.sh 123 PO-2026-001

Environment Variables:
  AURA_MCP_URL  - Base URL for Aura MCP server (default: http://localhost:8000)

EOF
