# Estimate Search & PO Attachment - Complete Workflow Guide

## Overview

The Aura MCP system now provides a **two-step workflow** for finding estimates and attaching purchase orders:

1. **Search Estimates** - Find estimates by project name, client name, or other criteria
2. **Attach PO** - Attach purchase order to a selected estimate

This allows AI agents (n8n, LangChain, etc.) to intelligently search for the right estimate before attaching a PO.

## Two MCP Tools

### 1. `search_estimates` - Find Estimates

Search for estimates using various criteria and get detailed results.

**Parameters:**
- `search_query` (string, optional) - Text to search for
- `search_by` (string, optional) - Field to search: `all`, `project_name`, `client_name`, `estimate_number`, `title`
- `status` (string, optional) - Filter by status: `draft`, `sent`, `accepted`, `rejected`, `all`
- `has_project` (boolean, optional) - Only estimates linked to projects (default: true)
- `has_amount` (boolean, optional) - Only estimates with amounts > 0 (default: true)
- `limit` (integer, optional) - Max results (1-50, default: 10)

**Example Request:**
```bash
curl -X POST https://your-domain.com/mcp/auraai \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_estimates",
      "arguments": {
        "search_query": "Acme Corporation",
        "search_by": "client_name",
        "has_project": true,
        "has_amount": true,
        "limit": 10
      }
    },
    "id": 1
  }'
```

**Example Response:**
```json
{
  "success": true,
  "count": 3,
  "limit": 10,
  "search_criteria": {
    "query": "Acme Corporation",
    "search_by": "client_name",
    "status": "all",
    "has_project": true,
    "has_amount": true
  },
  "results": [
    {
      "id": 123,
      "estimate_number": "EST-2026-001",
      "title": "Website Development",
      "description": "Full website redesign",
      "amount": 15000,
      "currency": "USD",
      "status": "accepted",
      "client": {
        "id": 45,
        "name": "Acme Corporation",
        "company_name": "Acme Corporation"
      },
      "project": {
        "id": 78,
        "name": "Acme Website Redesign",
        "has_po": false,
        "po_number": null
      },
      "created_at": "2026-04-01 10:30:00"
    }
  ]
}
```

### 2. `attach_estimate_po` - Attach PO

Attach a purchase order to a specific estimate (identified by ID).

**Parameters:**
- `estimate_id` (integer, required) - The estimate ID
- `po_number` (string, required) - The PO number
- `po_document` (string, optional) - Path/URL to PO document
- `provisional` (boolean, optional) - Is this a provisional PO?

**Example Request:**
```bash
curl -X POST https://your-domain.com/mcp/auraai \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "attach_estimate_po",
      "arguments": {
        "estimate_id": 123,
        "po_number": "PO-2026-001",
        "provisional": false
      }
    },
    "id": 2
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "PO successfully attached to project",
  "estimate": {
    "id": 123,
    "title": "Website Development",
    "amount": 15000,
    "status": "accepted",
    "client": "Acme Corporation"
  },
  "project": {
    "id": 78,
    "name": "Acme Website Redesign",
    "po_number": "PO-2026-001",
    "is_locked_by_po": true
  },
  "po_type": "permanent"
}
```

## Complete Workflow Examples

### Example 1: Search by Client Name

**Step 1 - Search:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_estimates",
    "arguments": {
      "search_query": "Acme",
      "search_by": "client_name"
    }
  },
  "id": 1
}
```

**Step 2 - Attach PO:**
Use the `id` from search results:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "attach_estimate_po",
    "arguments": {
      "estimate_id": 123,
      "po_number": "PO-2026-001"
    }
  },
  "id": 2
}
```

### Example 2: Search by Project Name

**Step 1 - Search:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_estimates",
    "arguments": {
      "search_query": "Website Redesign",
      "search_by": "project_name",
      "status": "accepted"
    }
  },
  "id": 1
}
```

**Step 2 - Attach:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "attach_estimate_po",
    "arguments": {
      "estimate_id": 125,
      "po_number": "PO-2026-WEB-001"
    }
  },
  "id": 2
}
```

### Example 3: Search All Estimates Without PO

Find all estimates that need POs:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_estimates",
    "arguments": {
      "status": "accepted",
      "has_project": true,
      "has_amount": true,
      "limit": 20
    }
  },
  "id": 1
}
```

Then filter results in your code for `"has_po": false` and attach POs as needed.

## n8n Integration

### Two-Node Workflow

**Node 1: Search Estimates**
```javascript
// OpenAI Agent Function Call
{
  "name": "search_estimates",
  "description": "Search for estimates by project or client name",
  "parameters": {
    "type": "object",
    "properties": {
      "search_query": {"type": "string"},
      "search_by": {
        "type": "string",
        "enum": ["all", "project_name", "client_name"]
      }
    }
  }
}
```

**Node 2: Attach PO**
```javascript
// Use the ID from previous node
{
  "name": "attach_estimate_po",
  "parameters": {
    "type": "object",
    "properties": {
      "estimate_id": {"type": "integer"},
      "po_number": {"type": "string"}
    },
    "required": ["estimate_id", "po_number"]
  }
}
```

### Complete n8n Agent Prompt

```
You are an assistant that helps manage purchase orders for estimates.

When you receive a request to attach a PO:
1. First, use search_estimates to find the relevant estimate:
   - If given a project name, search by project_name
   - If given a client name, search by client_name
   - If given an estimate number, search by estimate_number

2. Review the search results and identify the correct estimate

3. Confirm the estimate:
   - Has a valid amount
   - Is linked to a project
   - Doesn't already have a PO (check has_po field)

4. If everything looks good, use attach_estimate_po with:
   - The estimate ID from the search results
   - The provided PO number

5. Report the results:
   - Success: Confirm PO was attached to which project
   - Error: Explain what went wrong

Always ask for confirmation before attaching a PO if multiple estimates match the search criteria.
```

## Testing the Workflow

### Automated Test Script

```bash
chmod +x test-estimate-workflow.sh
./test-estimate-workflow.sh "Acme"
```

This script:
1. Searches for estimates matching "Acme"
2. Displays all matching results
3. Automatically attaches a PO to the first result
4. Shows success/failure message

### Manual Testing

**1. Search:**
```bash
curl -X POST https://staging.aura.artslabcreatives.com/mcp/auraai \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_estimates",
      "arguments": {"search_query": "Test", "limit": 5}
    },
    "id": 1
  }'
```

**2. Attach (using ID from search):**
```bash
curl -X POST https://staging.aura.artslabcreatives.com/mcp/auraai \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "attach_estimate_po",
      "arguments": {
        "estimate_id": 102,
        "po_number": "PO-TEST-001"
      }
    },
    "id": 2
  }'
```

## Search Capabilities

### Search by Different Fields

**By Client Name:**
```json
{"search_query": "Acme", "search_by": "client_name"}
```

**By Project Name:**
```json
{"search_query": "Website", "search_by": "project_name"}
```

**By Estimate Number:**
```json
{"search_query": "EST-2026", "search_by": "estimate_number"}
```

**By Title:**
```json
{"search_query": "Development", "search_by": "title"}
```

**Search All Fields:**
```json
{"search_query": "Acme", "search_by": "all"}
```

### Filters

**Only Accepted Estimates:**
```json
{"status": "accepted"}
```

**Only Estimates with Projects:**
```json
{"has_project": true}
```

**Only Estimates with Valid Amounts:**
```json
{"has_amount": true}
```

**Combine Filters:**
```json
{
  "status": "accepted",
  "has_project": true,
  "has_amount": true,
  "limit": 10
}
```

## AI Agent Use Cases

### Use Case 1: Email-Triggered PO Attachment

**Scenario**: Agent receives email with PO and project name

**Agent Steps**:
1. Extract project name and PO number from email
2. Search estimates: `search_estimates` with `search_by: "project_name"`
3. Identify matching estimate
4. Attach PO: `attach_estimate_po` with estimate ID and PO number
5. Send confirmation email

### Use Case 2: Bulk PO Processing

**Scenario**: Process multiple POs from a spreadsheet

**Agent Steps**:
1. For each row in spreadsheet:
   - Search by client name or project name
   - Validate estimate has amount and project
   - Attach PO
   - Log result
2. Generate summary report

### Use Case 3: Interactive PO Attachment

**Scenario**: User asks "Attach PO-2026-001 to the Acme project"

**Agent Steps**:
1. Search: `search_estimates` with `"Acme"` and `search_by: "all"`
2. If multiple results, ask user which one
3. Confirm estimate details with user
4. Attach PO
5. Confirm success

## Error Handling

### Search Returns No Results

```json
{
  "success": true,
  "count": 0,
  "results": []
}
```

**Action**: Broaden search criteria or check spelling

### Multiple Matches

```json
{
  "success": true,
  "count": 5,
  "results": [...]
}
```

**Action**: Have user/agent select the correct one, or refine search

### Estimate Has No Project

```json
{
  "success": false,
  "error": "Estimate is not linked to a project"
}
```

**Action**: Link estimate to project first

### Estimate Has No Amount

```json
{
  "success": false,
  "error": "Estimate does not have a valid amount"
}
```

**Action**: Update estimate with valid amount

## Best Practices

1. **Always Search First**: Don't assume estimate IDs - always search to find the right one
2. **Validate Results**: Check that estimates have projects and amounts before attaching PO
3. **Check for Existing POs**: Look at `has_po` field to avoid duplicate POs
4. **Use Specific Searches**: Use `search_by` to narrow results when possible
5. **Set Reasonable Limits**: Use `limit` parameter to control result size
6. **Handle Multiple Results**: Have a strategy for when multiple estimates match
7. **Log Operations**: Keep track of which POs were attached to which estimates

## Summary

The two-tool workflow provides flexibility to:
- ✅ Search estimates by various criteria
- ✅ Return multiple results for review
- ✅ Select the correct estimate
- ✅ Attach PO with validation
- ✅ Handle errors gracefully
- ✅ Support AI agent automation

Perfect for n8n OpenAI agents, LangChain workflows, and custom integrations!
