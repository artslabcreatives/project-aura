#!/bin/bash

# Complete workflow test: Search estimates and attach PO
# This demonstrates the two-step process for finding and attaching POs

BASE_URL="${AURA_MCP_URL:-https://staging.aura.artslabcreatives.com}"
MCP_ENDPOINT="$BASE_URL/mcp/auraai"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

JQ_CMD="python3 -m json.tool"

echo "========================================"
echo "  Estimate Search & PO Attachment Test"
echo "========================================"
echo ""

# Step 1: Search for estimates
echo -e "${GREEN}Step 1: Searching for estimates${NC}"
echo -e "${BLUE}Search query:${NC} ${1:-'Test'}"
echo ""

SEARCH_RESPONSE=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"search_estimates\",
      \"arguments\": {
        \"search_query\": \"${1:-Test}\",
        \"search_by\": \"all\",
        \"has_project\": true,
        \"has_amount\": true,
        \"limit\": 5
      }
    },
    \"id\": 1
  }")

echo "$SEARCH_RESPONSE" | $JQ_CMD
echo ""

# Extract estimate IDs from results
echo -e "${YELLOW}Available Estimates:${NC}"
ESTIMATE_IDS=$(echo "$SEARCH_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    result = json.loads(data['result']['content'][0]['text'])
    estimates = result.get('results', [])
    
    if not estimates:
        print('No estimates found')
        sys.exit(1)
    
    for i, est in enumerate(estimates, 1):
        project_name = est['project']['name'] if est['project'] else 'No project'
        client_name = est['client']['name'] if est['client'] else 'No client'
        has_po = '(Has PO)' if est['project'] and est['project']['has_po'] else '(No PO)'
        print(f\"{i}. ID: {est['id']} - {est['title']} - {project_name} - {client_name} - Amount: {est['amount']} {has_po}\")
    
    # Return first estimate ID
    print(f\"\nFirst estimate ID: {estimates[0]['id']}\")
    print(estimates[0]['id'])
except Exception as e:
    print(f'Error: {e}')
    sys.exit(1)
" 2>&1)

FIRST_ESTIMATE_ID=$(echo "$ESTIMATE_IDS" | tail -1)

if [ "$FIRST_ESTIMATE_ID" = "No estimates found" ] || [ -z "$FIRST_ESTIMATE_ID" ]; then
    echo -e "${YELLOW}No estimates found matching criteria${NC}"
    exit 0
fi

echo "$ESTIMATE_IDS" | head -n -1
echo ""
echo "----------------------------------------"
echo ""

# Step 2: Attach PO to selected estimate
ESTIMATE_ID="${2:-$FIRST_ESTIMATE_ID}"
PO_NUMBER="${3:-PO-TEST-$(date +%Y%m%d-%H%M%S)}"

echo -e "${GREEN}Step 2: Attaching PO to estimate${NC}"
echo -e "${BLUE}Estimate ID:${NC} $ESTIMATE_ID"
echo -e "${BLUE}PO Number:${NC} $PO_NUMBER"
echo ""

ATTACH_RESPONSE=$(curl -s -X POST "$MCP_ENDPOINT" \
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

echo "$ATTACH_RESPONSE" | $JQ_CMD
echo ""

# Check if successful
SUCCESS=$(echo "$ATTACH_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    result = json.loads(data['result']['content'][0]['text'])
    print('SUCCESS' if result.get('success') else 'FAILED')
    if result.get('success'):
        print(f\"PO {result['project']['po_number']} attached to project {result['project']['name']}\")
    else:
        print(f\"Error: {result.get('error', 'Unknown error')}\")
except Exception as e:
    print(f'FAILED: {e}')
" 2>&1)

echo "----------------------------------------"
echo ""

if echo "$SUCCESS" | head -1 | grep -q "SUCCESS"; then
    echo -e "${GREEN}✅ Workflow completed successfully!${NC}"
    echo "$SUCCESS" | tail -n +2
else
    echo -e "${YELLOW}⚠️  Workflow failed${NC}"
    echo "$SUCCESS" | tail -n +2
fi

echo ""
echo "========================================"
echo ""

cat << 'EOF'
Usage:
  ./test-estimate-workflow.sh [SEARCH_QUERY] [ESTIMATE_ID] [PO_NUMBER]

Examples:
  # Search for estimates and auto-select first
  ./test-estimate-workflow.sh "Acme Corp"

  # Search and attach to specific estimate
  ./test-estimate-workflow.sh "Project Alpha" 123 PO-2026-001

  # Use specific URL
  AURA_MCP_URL=https://your-domain.com ./test-estimate-workflow.sh "Test"

Workflow:
  1. Search for estimates by query (project name, client name, etc.)
  2. Display matching estimates with their details
  3. Attach PO to selected estimate (first one by default)
  4. Confirm successful attachment

EOF
